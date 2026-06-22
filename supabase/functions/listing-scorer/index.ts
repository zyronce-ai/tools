import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { listingUrl, platform, userGeminiKey } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    let scrapedContent = "";

    if (FIRECRAWL_API_KEY) {
      try {
        const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: listingUrl, formats: ["markdown"], onlyMainContent: true }),
        });
        if (scrapeResp.ok) {
          const scrapeData = await scrapeResp.json();
          scrapedContent = scrapeData.data?.markdown || scrapeData.markdown || "";
        }
      } catch (scrapeErr) {
        console.error("Scrape failed:", scrapeErr);
      }
    }

    const systemPrompt = `You are an expert e-commerce listing quality analyst for Indian marketplaces (Flipkart, Meesho, Amazon).

Analyze the following product listing and provide a detailed quality score and improvement suggestions.

Platform: ${platform || "auto-detect from URL"}
Listing URL: ${listingUrl}
${scrapedContent ? `\nScraped Listing Content:\n${scrapedContent.slice(0, 5000)}` : "\nNote: Could not scrape the listing. Analyze based on URL and common patterns."}

Provide analysis in this format:

## 📊 Overall Score: [X/100]

## 🏷️ Title Analysis (Score: X/20)
- Current title evaluation
- Keyword optimization tips
- Suggested improved title

## 📝 Description Quality (Score: X/20)
- Content completeness
- Bullet points usage
- SEO optimization level
- Suggested improvements

## 🖼️ Image Assessment (Score: X/20)
- Number of images (estimate)
- White background usage
- Lifestyle images
- Improvement suggestions

## 🔑 Keyword Optimization (Score: X/20)
- Missing high-value keywords
- Backend keyword suggestions
- Search visibility tips

## 💰 Pricing Strategy (Score: X/20)
- Price competitiveness
- Discount strategy
- MRP vs Selling price analysis

## ✅ Quick Wins (Top 5 Improvements)
1. ...
2. ...
3. ...
4. ...
5. ...

## ⚠️ Critical Issues
- List any major problems

## 🛠️ Step-by-Step Improvement Guide
For each issue found above, provide a DETAILED step-by-step guide on HOW to fix it:

### Title Kaise Sudhare:
- Exact improved title likhke do (copy-paste ready)
- Which keywords to add and where
- Character limit ke andar kaise rakhe

### Description Kaise Sudhare:
- Exact bullet points likhke do jo seller directly copy kar sake
- What information is missing and how to add it
- SEO friendly description ka example do

### Images Kaise Sudhare:
- Kitni images chahiye (minimum/ideal)
- Kaunse type ki images add kare (white bg, lifestyle, size chart, infographic)
- Free tools batao images banane ke liye (Canva, remove.bg etc.)

### Keywords Kaise Fix Kare:
- Exact backend/search keywords list do (comma separated, copy-paste ready)
- Platform pe kahan jaake keywords update kare (step by step navigation)

### Pricing Kaise Optimize Kare:
- Suggest ideal MRP vs Selling price
- Discount percentage kya rakhna chahiye
- Competitor price comparison tips

### Platform-Specific Tips:
- If Flipkart: How to edit on Flipkart Seller Hub
- If Meesho: How to edit on Meesho Supplier Panel  
- If Amazon: How to edit on Amazon Seller Central

Har fix ke saath exact steps do — jaise koi beginner seller bhi follow kar sake. Copy-paste ready content do jahan possible ho.

IMPORTANT LANGUAGE RULES:
- Write all explanation, tips, suggestions, steps and guide in clear English.
- Keywords, search terms, product titles, backend keywords, and SEO terms must be in PURE ENGLISH only.
- Use emojis for better readability.`;

    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this listing: ${listingUrl}` },
    ], userGeminiKey, "openai/gpt-5-mini", true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("listing-scorer error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
