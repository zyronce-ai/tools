import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAIImage, corsHeaders, handleAIError } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let fileName: string | null = null;
  let supabase: ReturnType<typeof createClient> | null = null;

  try {
    const { imageBase64, backgroundType, userGeminiKey } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract base64 data and upload to storage to get a public URL
    const matches = imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid image format");

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const base64Data = matches[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    fileName = `bg-input-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("ai-temp")
      .upload(fileName, binaryData, {
        contentType: `image/${matches[1]}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Image upload failed");
    }

    const { data: urlData } = supabase.storage.from("ai-temp").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const bgPrompts: Record<string, string> = {
      white: "Remove the background completely and replace it with a pure clean white background. Keep the product exactly as it is with all details preserved. Make it look like a professional e-commerce product photo on white background.",
      gradient: "Remove the background and replace it with a soft professional gradient background (light gray to white). Keep the product exactly as it is. Professional e-commerce style.",
      lifestyle: "Remove the background and place the product in an attractive lifestyle setting that matches the product type. Keep the product exactly as it is. Professional marketing photo style.",
      transparent: "Remove the background completely, making it transparent/clean white. Keep only the product with crisp edges. Professional product cutout style.",
    };

    const prompt = bgPrompts[backgroundType] || bgPrompts.white;

    // For user's Gemini key, use base64 directly; for gateway use public URL
    const imageContent = userGeminiKey ? imageBase64 : publicUrl;

    const data = await callAIImage(
      [{
        role: "user",
        content: [
          { type: "text", text: `${prompt} Preserve product shape and texture exactly.` },
          { type: "image_url", image_url: { url: imageContent } },
        ],
      }],
      userGeminiKey,
      "google/gemini-3-pro-image-preview",
    );

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
  } finally {
    if (supabase && fileName) {
      const { error } = await supabase.storage.from("ai-temp").remove([fileName]);
      if (error) console.warn("Cleanup failed:", error.message);
    }
  }
});
