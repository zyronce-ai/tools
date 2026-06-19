import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reviews, userGeminiKey } = await req.json();

    const prompt = `You are an expert review analyst specializing in detecting fake/manipulated reviews on Indian ecommerce platforms (Amazon, Flipkart, Meesho).

Analyze these reviews and detect which ones are likely fake:

${reviews}

Provide detailed analysis:

## 🔍 Overall Assessment
- **Fake Review Score**: X/100 (higher = more fake reviews detected)
- **Total Reviews Analyzed**: X
- **Suspected Fake**: X reviews
- **Genuine Reviews**: X reviews

## 🚨 Red Flags Found
List each suspicious pattern found:
- Generic/vague language patterns
- Repeated phrases across reviews
- Unusual timing patterns
- Over-the-top positive without specifics
- Reviewer profile suspicious indicators
- Grammar/language inconsistencies

## 📋 Review-by-Review Analysis
For each review, provide:
- **Review**: (first 50 chars)
- **Verdict**: ✅ Genuine / ⚠️ Suspicious / ❌ Likely Fake
- **Confidence**: X%
- **Reason**: Why this verdict

## 💡 Tips for Sellers
- How to identify fake reviews from competitors
- How to get genuine reviews for your products
- How to report fake reviews on each platform

Use Hinglish where helpful for Indian sellers.`;

    const response = await callAI([
      { role: "user", content: prompt },
    ], userGeminiKey, undefined, true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("fake-review error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
