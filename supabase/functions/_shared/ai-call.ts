// Shared helper: call AI via Groq or Gemini
// Import in edge functions: import { callAI, corsHeaders } from "../_shared/ai-call.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export async function callAI(
  messages: Array<{ role: string; content: string | any[] }>,
  userGeminiKey?: string,
  model?: string,
  _useOpenRouter?: boolean,
): Promise<Response> {
  const hasImages = messages.some(m => Array.isArray(m.content));
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  // 1. Groq — text only, skip if images present
  if (GROQ_API_KEY && !hasImages) {
    try {
      return await callGroq(messages, GROQ_API_KEY);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "RATE_LIMIT") throw e;
      console.error("Groq failed:", msg);
    }
  }
  // 2. OpenRouter — supports any model (Qwen, etc.)
  if (OPENROUTER_API_KEY) {
    try {
      const orModel = model || "qwen/qwen3-32b";
      return await callOpenRouter(messages, OPENROUTER_API_KEY, orModel);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "RATE_LIMIT") throw e;
      console.error("OpenRouter failed:", msg);
    }
  }
  // 3. Gemini (user's key from Settings)
  if (userGeminiKey) {
    try {
      return await callGeminiDirect(messages, userGeminiKey);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("INVALID_KEY")) throw e;
      console.error("Gemini failed:", msg);
    }
  }
  if (OPENROUTER_API_KEY) throw new Error("OpenRouter fail: Settings mein jaake API key check karo.");
  if (GROQ_API_KEY) throw new Error("Groq fail ho gaya.");
  throw new Error("No AI provider. Settings mein Gemini API key lagao ya admin se GROQ_API_KEY set karwaiye.");
}

// Groq — OpenAI-compatible, blazing fast text inference
async function callGroq(
  messages: Array<{ role: string; content: string | any[] }>,
  apiKey: string,
): Promise<Response> {
  const model = "llama-3.3-70b-versatile";
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("Groq error:", resp.status, t);
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    throw new Error(`Groq API error: ${resp.status} - ${t}`);
  }
  return resp;
}

// OpenRouter — access to 300+ models (Qwen, Claude, etc.)
async function callOpenRouter(
  messages: Array<{ role: string; content: string | any[] }>,
  apiKey: string,
  model: string,
): Promise<Response> {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://nayratools.vercel.app",
      "X-Title": "NayraTools",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("OpenRouter error:", resp.status, t);
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 402) throw new Error("CREDITS_EXHAUSTED");
    throw new Error(`OpenRouter error: ${resp.status} - ${t}`);
  }
  return resp;
}

async function callGeminiDirect(
  messages: Array<{ role: string; content: string | any[] }>,
  apiKey: string,
): Promise<Response> {
  const geminiModel = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const systemMsg = messages.find(m => m.role === "system");
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => {
      // Handle multimodal content (arrays with image_url + text)
      if (Array.isArray(m.content)) {
        const parts: any[] = [];
        for (const item of m.content) {
          if (item.type === "text") {
            parts.push({ text: item.text });
          } else if (item.type === "image_url") {
            const dataUrl = item.image_url?.url || "";
            const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
            if (match) {
              parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
        }
        return { role: m.role === "assistant" ? "model" : "user", parts };
      }
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content as string }],
      };
    });

  const body: any = {
    contents,
    generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
  };
  if (systemMsg) {
    const sysText = typeof systemMsg.content === "string" ? systemMsg.content : JSON.stringify(systemMsg.content);
    body.systemInstruction = { parts: [{ text: sysText }] };
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error("Gemini direct error:", resp.status, t);
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 401 || resp.status === 403) throw new Error("INVALID_KEY: API key galat hai ya expire ho gayi. Settings mein jaake check karo.");
    throw new Error(`Gemini API error: ${resp.status} - ${t.slice(0, 300)}`);
  }

  // Transform Gemini SSE → OpenAI-compatible SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const chunk = JSON.stringify({ choices: [{ delta: { content: text } }] });
              await writer.write(encoder.encode(`data: ${chunk}\n\n`));
            }
          } catch { /* skip partial JSON */ }
        }
      }
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (e) {
      console.error("Stream transform error:", e);
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

// Check if message array contains image input
function hasImageInput(messages: Array<{ role: string; content: string | any[] }>): boolean {
  return messages.some(m =>
    Array.isArray(m.content) && m.content.some(c => c.type === "image_url")
  );
}

// Image generation / processing: supports user's Gemini key
export async function callAIImage(
  messages: Array<{ role: string; content: string | any[] }>,
  userGeminiKey?: string,
  model?: string,
): Promise<any> {
  if (!userGeminiKey) {
    throw new Error("No image provider available. Set a Gemini API key in Settings.");
  }
  if (hasImageInput(messages)) {
    return callGeminiImageProcess(messages, userGeminiKey);
  }
  return callGeminiImageDirect(messages, userGeminiKey);
}

// Build Gemini contents array from messages
function buildGeminiContents(messages: Array<{ role: string; content: string | any[] }>) {
  return messages.map(m => {
    if (Array.isArray(m.content)) {
      const parts: any[] = [];
      for (const item of m.content) {
        if (item.type === "text") {
          parts.push({ text: item.text });
        } else if (item.type === "image_url") {
          const dataUrl = item.image_url?.url || "";
          const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
          if (match) {
            parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
          } else if (dataUrl.startsWith("http")) {
            parts.push({ text: `[Image URL: ${dataUrl}]` });
          }
        }
      }
      return { role: m.role === "assistant" ? "model" : "user", parts };
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content as string }],
    };
  });
}

// Parse Gemini response into standard format
function parseGeminiResponse(data: any) {
  const candidate = data.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  let textContent = "";
  const images: any[] = [];
  for (const part of parts) {
    if (part.text) textContent += part.text;
    if (part.inlineData) {
      images.push({
        type: "image_url",
        image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` },
      });
    }
  }
  return {
    choices: [{
      message: {
        role: "assistant",
        content: textContent || "Image generated successfully",
        images,
      },
    }],
  };
}

// For image PROCESSING tasks (bg-remover, image-upscaler) — input has images
async function callGeminiImageProcess(
  messages: Array<{ role: string; content: string | any[] }>,
  apiKey: string,
): Promise<any> {
  const geminiModel = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
  const contents = buildGeminiContents(messages);
  const body = {
    contents,
    generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("Gemini vision API error:", resp.status, t);
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 401 || resp.status === 403) throw new Error("INVALID_KEY: API key galat hai ya expire ho gayi.");
    throw new Error(`Gemini image error: ${resp.status}`);
  }
  const data = await resp.json();
  return parseGeminiResponse(data);
}

// For image GENERATION tasks (logo-maker, banner-maker) — text input only
async function callGeminiImageDirect(
  messages: Array<{ role: string; content: string | any[] }>,
  apiKey: string,
): Promise<any> {
  const geminiModel = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
  const contents = buildGeminiContents(messages);
  const body = {
    contents,
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      temperature: 0.8,
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("Gemini image API error:", resp.status, t);
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 401 || resp.status === 403) throw new Error("INVALID_KEY: API key galat hai ya expire ho gayi.");
    throw new Error(`Gemini image error: ${resp.status}`);
  }
  const data = await resp.json();
  return parseGeminiResponse(data);
}



export function handleAIError(e: unknown, corsH: Record<string, string>) {
  const msg = e instanceof Error ? e.message : "Unknown error";
  if (msg === "RATE_LIMIT") {
    return new Response(JSON.stringify({ error: "Rate limit! Thodi der baad try karo." }), {
      status: 429, headers: { ...corsH, "Content-Type": "application/json" },
    });
  }
  if (msg.startsWith("INVALID_KEY")) {
    return new Response(JSON.stringify({ error: msg }), {
      status: 401, headers: { ...corsH, "Content-Type": "application/json" },
    });
  }
  if (msg === "CREDITS_EXHAUSTED") {
    return new Response(JSON.stringify({ error: "AI provider failed. Settings mein apni Gemini API key lagao." }), {
      status: 402, headers: { ...corsH, "Content-Type": "application/json" },
    });
  }
  return null;
}

export function handleResponseErrors(response: Response, corsH: Record<string, string>) {
  if (response.ok) return null;
  if (response.status === 429) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Thodi der baad try karo." }), {
      status: 429, headers: { ...corsH, "Content-Type": "application/json" },
    });
  }
  if (response.status === 402) {
    return new Response(JSON.stringify({ error: "AI provider failed. Settings mein apni Gemini API key lagao." }), {
      status: 402, headers: { ...corsH, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: "AI error" }), {
    status: 500, headers: { ...corsH, "Content-Type": "application/json" },
  });
}
