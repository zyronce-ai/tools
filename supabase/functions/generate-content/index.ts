import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, platform, tone, userGeminiKey } = await req.json();

    const platformInstructions: Record<string, string> = {
      youtube: "Write a complete YouTube video script with [INTRO], [MAIN CONTENT] with numbered points, and [OUTRO] with a call to action. Make it engaging and conversational.",
      instagram: "Write an Instagram caption with emojis, bullet points, a call-to-action question, and relevant hashtags. Keep it punchy and visual.",
      blog: "Write a blog post with a title (# heading), introduction, multiple sections (## headings), and a conclusion. Make it informative and well-structured.",
      twitter: "Write a Twitter/X thread with numbered tweets (1/, 2/, etc.). Keep each tweet concise. Include emojis and a strong hook in the first tweet.",
    };

    const toneInstructions: Record<string, string> = {
      funny: "Use humor, jokes, puns, and a light-hearted tone. Make people laugh while learning.",
      professional: "Use a polished, authoritative tone. Be data-driven and credible.",
      casual: "Be conversational and friendly, like talking to a friend. Use simple language.",
      motivational: "Be inspiring and energetic. Use powerful words, quotes, and calls to action.",
      educational: "Be informative and structured. Explain concepts clearly with examples.",
    };

    const systemPrompt = `You are an expert content creator. Generate content based on:
- Topic: "${topic}"
- Platform: ${platform}
- Tone: ${tone}

${platformInstructions[platform] || "Write engaging content."}
${toneInstructions[tone] || "Use a professional tone."}

Write the content directly without any preamble. The content should be ready to use.
Respond in English only.`;

    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Create ${platform} content about: ${topic}` },
    ], userGeminiKey, "openai/gpt-5-mini", true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
