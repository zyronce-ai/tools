import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, fabric, platform, listingType, imageBase64, userGeminiKey } = await req.json();
    const separator = (platform === "flipkart" && listingType === "bulk") ? "::" : ",";

    const platformGuides: Record<string, string> = {
      flipkart: "Flipkart SEO rules: prioritize exact product type, gender, fabric, pattern, color, occasion, fit, pack/combo, price-intent, and filter-friendly phrases. Title max 80 characters. Keywords must be suitable for listing search terms and bulk upload fields.",
      meesho: "Meesho SEO rules: prioritize reseller-friendly, WhatsApp-shareable, value-for-money, daily-use, festive, and low-price buyer phrases. Keywords should match what small-town and metro buyers actually type in English.",
      amazon: "Amazon A9 SEO rules: prioritize exact match + phrase match keywords, backend search terms under 250 bytes, subject matter style phrases, buyer-intent long tails, and non-repetitive attribute coverage.",
      myntra: "Myntra SEO rules: prioritize fashion taxonomy, style, fit, pattern, occasion, sleeve/neck/length details, trend phrases, outfit pairing terms, and premium fashion search behavior.",
      website: "Website SEO rules: prioritize Google-friendly long-tail phrases, commercial intent keywords, meta title terms, category landing page keywords, semantic variants, and schema-friendly product attributes.",
    };

    const separatorName = separator === "::" ? "double colon (::)" : "comma (,)";
    const systemPrompt = `You are a SENIOR e-commerce listing strategist and marketplace SEO expert who has helped 10,000+ Indian sellers rank on Page 1 across Flipkart, Amazon, Meesho, Myntra, and D2C websites. Output must be pro-agency quality.

LANGUAGE RULE (MOST IMPORTANT):
- ENTIRE RESPONSE MUST BE IN PURE ENGLISH ONLY. No Hindi, no Hinglish anywhere.
- If product name is in Hindi, translate it to English first.

SEPARATOR RULE (STRICT):
- Use "${separator}" (${separatorName}) to separate ALL keywords and features. No other separator allowed.
- Example: ${separator === "::" ? '"cotton saree :: banarasi silk :: wedding saree"' : '"cotton saree, banarasi silk, wedding saree"'}

KEYWORD QUALITY RULES:
- Infer exact product category, buyer segment, and use-case from product name, fabric, and image.
- Every keyword must be a REAL search query that Indian buyers actually type on ${platform}.
- NO weak filler like "best product", "latest item", "premium quality" alone.
- Mix short head terms (2-3 words) + powerful long-tail phrases (4-6 words).
- Cover: exact product type, fabric, color, pattern, fit, occasion, gender, style, buyer-intent.
- Sort from STRONGEST (highest search volume + purchase intent) to weakest.
- No duplicates, no near-duplicates.

FORMATTING RULES (STRICT):
- DO NOT use ✅ checkmarks, ❌ crosses, or any tick/cross emojis anywhere.
- DO NOT split keywords into multiple categories. Give ONE single combined list only.
- Keep section headers minimal and clean.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (no extra sections, no checkmarks):

## 🎯 Strategy Snapshot
- Category: [exact category]
- Target Buyer: [buyer segment]
- Positioning: [budget / value / premium / festive / daily-use]
- Ranking Angle: [one clear winning strategy]

## 🔥 Top 20 Powerful Searchable Keywords
[Exactly 20 high-impact, marketplace-searchable keywords in ONE single line, separated by ${separatorName}. Sort strongest first. Mix head terms + long-tail buyer queries. No categories, no bullets, no numbering — just one clean copy-paste line.]

## 📝 SEO Product Title
[One platform-optimized title with top keywords naturally placed. Follow ${platform} character limits.]

## 📋 Product Description (Conversion Optimized, 250-350 words)
[Persuasive, emotionally engaging description. Hook + benefits + sensory language + occasions + care + soft CTA. Short mobile-friendly paragraphs.]

## 🧩 Key Features (8-10 points)
feature1 ${separator} feature2 ${separator} feature3 ${separator} ...

## 🔍 Backend Search Terms
[Clean backend terms (no repeated words), separated by ${separatorName}. Different from the Top 20 list — extra hidden coverage.]

## 💡 Pro Tips for ${platform.charAt(0).toUpperCase() + platform.slice(1)}
[4-5 actionable listing tips specific to ${platform}: image count, pricing, offers, A+ content, etc. Use plain "-" bullets only. NO checkmarks.]

FINAL CHECK BEFORE ANSWERING:
- Top 20 Keywords section must contain EXACTLY 20 keywords in ONE single line.
- ZERO ✅ or ❌ symbols anywhere.
- All separators must be "${separator}".
- Pure English only.`;

    const userContent: any[] = [];
    
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64 }
      });
    }

    userContent.push({
      type: "text",
      text: `Product: ${productName || "Not specified"}
Fabric/Material: ${fabric || "Not specified"}
Platform: ${platform}
${listingType ? `Listing Type: ${listingType}` : ""}

${platformGuides[platform] || platformGuides.website}

Generate PRO-LEVEL, marketplace-ready keywords and a HIGH-CONVERTING description for this product. Do not give average/generic keywords. Make it good enough for a serious seller to paste directly into ${platform}.`
    });

    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ], userGeminiKey, "openai/gpt-5", true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("product-keywords error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
