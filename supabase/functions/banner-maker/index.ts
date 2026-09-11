import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleAIError } from "../_shared/ai-call.ts";
import { kieTextToImage } from "../_shared/kie-image.ts";

const sizeMap: Record<string, string> = {
  instagram: "1:1",
  facebook: "16:9",
  whatsapp: "1:1",
  website: "16:9",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, offerText, platform, style, userGeminiKey } = await req.json();

    const prompt = `Generate a professional e-commerce promotional banner image for:
Product: ${productName}
Offer/Text to display: ${offerText}
Size: ${sizeMap[platform] || "1:1"}
Style: ${style || "modern and vibrant"}

Requirements:
- Bold, eye-catching product promotion design
- Display the offer text prominently
- Use vibrant colors suitable for ${platform} marketing
- Professional e-commerce style
- Indian market aesthetic
- Clean typography with clear call-to-action
- No blurry or unreadable text`;

    // Use KIE instead of Gemini
    const data = await kieTextToImage(prompt, sizeMap[platform] || "1:1");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("banner-maker error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});