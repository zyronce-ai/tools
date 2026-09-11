import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleAIError } from "../_shared/ai-call.ts";
import { kieGenerateImage, uploadBase64ToAiTemp } from "../_shared/kie-image.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, backgroundType, userGeminiKey } = await req.json();
    if (!imageBase64) throw new Error("No image provided");

    const bgPrompts: Record<string, string> = {
      white: "Remove the background completely and replace it with a pure clean white background. Keep the product exactly as it is with all details preserved. Make it look like a professional e-commerce product photo on white background.",
      gradient: "Remove the background and replace it with a soft professional gradient background (light gray to white). Keep the product exactly as it is. Professional e-commerce style.",
      lifestyle: "Remove the background and place the product in an attractive lifestyle setting that matches the product type. Keep the product exactly as it is. Professional marketing photo style.",
      transparent: "Remove the background completely, making it transparent/clean white. Keep only the product with crisp edges. Professional product cutout style.",
    };

    const prompt = (bgPrompts[backgroundType] || bgPrompts.white) + " Preserve product shape and texture exactly.";

    // Upload the user's image to Supabase storage to get a public URL for KIE input.
    const inputImageUrl = await uploadBase64ToAiTemp(imageBase64, "bg-input");

    const data = await kieGenerateImage({
      prompt,
      imageUrls: [inputImageUrl],
      imageSize: "auto",
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bg-remover error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});