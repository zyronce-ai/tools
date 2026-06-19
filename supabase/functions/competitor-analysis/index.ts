import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, category, platform, userGeminiKey } = await req.json();

    const platformMap: Record<string, string> = {
      flipkart: "Flipkart",
      meesho: "Meesho",
      amazon: "Amazon India",
      all: "Flipkart, Meesho, Amazon India",
    };

    const systemPrompt = `You are an expert e-commerce market analyst for Indian marketplaces. Analyze the competitor landscape for the given product.

Product: "${productName}"
Category: "${category || "General"}"
Platform: ${platformMap[platform] || "All platforms"}

Provide a detailed analysis in the following format:

## 🏷️ Price Range Analysis
- Lowest price, highest price, average price range on the platform
- Budget segment, mid-range, premium segment pricing

## 🔑 Top Performing Keywords
- List 15-20 high-ranking keywords that top sellers use
- Separate into: Primary Keywords, Long-tail Keywords, Trending Keywords

## 📝 Title Optimization Tips
- Analyze what top sellers include in their titles
- Suggest an optimized title structure

## 📊 Competition Level
- Rate competition as Low/Medium/High
- Estimated number of sellers
- What differentiates top sellers

## 💡 Winning Strategies
- What are top sellers doing differently?
- Pricing strategy suggestions
- Image and listing optimization tips
- Best time to list/promote

## ⚠️ Common Mistakes to Avoid
- What new sellers do wrong
- Pricing mistakes
- Listing quality issues

Respond in Hinglish (mix of Hindi and English) for better understanding. Use emojis for visual appeal.
Include approximate price ranges in INR (₹).`;

    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze competitors for: ${productName} in ${category || "general"} category on ${platformMap[platform] || "all platforms"}` },
    ], userGeminiKey, "openai/gpt-5-mini", true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("competitor-analysis error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
