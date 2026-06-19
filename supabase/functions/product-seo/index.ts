import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, keywords, platform, userGeminiKey } = await req.json();

    const prompt = `You are an expert ecommerce SEO analyst for Indian marketplaces. Analyze this product listing for SEO optimization:

Product Title: ${title}
Product Description: ${description || "Not provided"}
Current Keywords: ${keywords || "Not provided"}
Platform: ${platform || "General"}

Provide a comprehensive SEO analysis:

## 📊 SEO Score: X/100

## ✅ What's Good
- List positive SEO elements found

## ❌ Issues Found
For each issue:
- **Issue**: What's wrong
- **Impact**: High/Medium/Low
- **Fix**: Exact recommendation

## 🏷️ Title Optimization
- Current title analysis
- **Optimized Title** (ready to copy-paste)
- Character count optimization
- Keyword placement tips

## 📝 Description Optimization
- Current description analysis
- Key improvements needed
- **Optimized Description** (ready to copy-paste)

## 🔑 Keyword Recommendations
- **Primary Keywords**: Top 5 high-volume keywords
- **Secondary Keywords**: 10 long-tail keywords
- **Backend/Hidden Keywords**: Platform-specific search terms
- **Trending Keywords**: Currently trending related terms

## 📈 Platform-Specific Tips for ${platform || "all platforms"}
- Amazon India specific tips
- Flipkart specific tips
- Meesho specific tips

## 🏆 Competitor Edge
- How to rank higher than competitors
- Unique selling points to highlight

Keep everything practical and actionable. Use Hinglish where helpful for Indian sellers.`;

    const response = await callAI([
      { role: "user", content: prompt },
    ], userGeminiKey, undefined, true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("product-seo error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
