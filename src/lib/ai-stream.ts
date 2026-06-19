import { getGeminiApiKey } from "./api-key-store";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type Msg = { role: "user" | "assistant"; content: string };

interface StreamOptions {
  functionName: string;
  body: Record<string, unknown>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}

export async function streamFromEdge({ functionName, body, onDelta, onDone, onError }: StreamOptions) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  let doneCalled = false;

  const finish = () => {
    if (doneCalled) return;
    doneCalled = true;
    onDone();
  };

  try {
    const makeRequest = async () => {
      const geminiKey = getGeminiApiKey();
      const payload = geminiKey ? { ...body, userGeminiKey: geminiKey } : body;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(payload),
      });
    };

    let resp: Response;
    try {
      resp = await makeRequest();
    } catch (err) {
      // One safe retry only when request itself failed to start
      await new Promise((r) => setTimeout(r, 700));
      resp = await makeRequest();
    }

    if (!resp.ok) {
      let errorMsg = `Request failed (${resp.status})`;
      try {
        const err = await resp.json();
        errorMsg = err.error || errorMsg;
      } catch {
        // ignore parse errors
      }
      onError?.(errorMsg);
      finish();
      return;
    }

    if (!resp.body) {
      onError?.("No response body");
      finish();
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // ignore partial leftovers
        }
      }
    }

    finish();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Network error";
    onError?.(msg.includes("Failed to fetch") ? "Network issue: request server tak nahi pahunchi" : msg);
    finish();
  }
}
