import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAIImage, corsHeaders, handleAIError } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { brandName, industry, style, colors, userGeminiKey } = await req.json();

    const prompt = `Generate a professional brand logo on a clean solid white background for:
Brand Name: ${brandName}
Industry: ${industry || "general business"}
Style: ${style || "modern and minimal"}
Color Preference: ${colors || "auto-select best colors"}

Requirements:
- Clean, professional logo design suitable for a brand
- The brand name "${brandName}" should be clearly readable in the logo
- Modern, scalable vector-style design
- On a solid white background for easy extraction
- No extra decorations outside the logo
- High contrast and sharp edges
- Suitable for use on products, packaging, website, and social media
- Professional typography for the brand name`;

    const data = await callAIImage(
      [{ role: "user", content: prompt }],
      userGeminiKey,
      "google/gemini-2.5-flash-image",
    );

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("logo-maker error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
