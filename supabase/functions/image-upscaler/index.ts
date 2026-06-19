import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAIImage, corsHeaders, handleAIError } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, userGeminiKey } = await req.json();
    if (!imageBase64) throw new Error("No image provided");

    const data = await callAIImage(
      [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Upscale this image to the highest quality possible. Make it ultra sharp, enhance details, improve clarity, remove noise and artifacts, enhance colors and contrast. Make the image look like a professional 4K high-resolution photograph. Keep the exact same composition and content, just dramatically improve the quality and resolution."
          },
          {
            type: "image_url",
            image_url: { url: imageBase64 }
          }
        ]
      }],
      userGeminiKey,
      "google/gemini-2.5-flash-image",
    );

    const upscaledImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!upscaledImage) {
      return new Response(JSON.stringify({ error: "No upscaled image returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image: upscaledImage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("upscaler error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
