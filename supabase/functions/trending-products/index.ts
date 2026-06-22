import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

const flipkartCategoryUrls: Record<string, string> = {
  all: "https://www.flipkart.com/offers-store",
  fashion: "https://www.flipkart.com/clothing-and-accessories/pr?sid=clo&otracker=categorytree&fm=neo%2Fmerchandising&iid=M_e8d49b36-c5e7-4e8c-8a70-5631a3901fb2_1_372UD5BXDFYZ_MC.N73GTC5TCZAT&otracker=hp_rich_navigation_1_1.navigationCard.RICH_NAVIGATION_Fashion~702702&cid=702702&p%5B%5D=facets.serviceability%5B%5D%3Dtrue&p%5B%5D=facets.discount_range_v1%5B%5D%3D40%25+or+more&sort=popularity",
  electronics: "https://www.flipkart.com/electronics/pr?sid=reh&otracker=categorytree&fm=neo%2Fmerchandising&sort=popularity",
  beauty: "https://www.flipkart.com/beauty-and-grooming/pr?sid=g9b&sort=popularity",
  home: "https://www.flipkart.com/home-kitchen/pr?sid=arb&sort=popularity",
  health: "https://www.flipkart.com/health-care/pr?sid=hlc&sort=popularity",
  toys: "https://www.flipkart.com/toys/pr?sid=mgl&sort=popularity",
  food: "https://www.flipkart.com/grocery/pr?sid=eat&sort=popularity",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, platform, userGeminiKey } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const targetUrl = flipkartCategoryUrls[category] || flipkartCategoryUrls.all;
    console.log("Scraping Flipkart:", targetUrl);

    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: targetUrl, formats: ["markdown", "links"], onlyMainContent: true, waitFor: 3000 }),
    });

    let scrapedData = "";
    let scrapedLinks: string[] = [];

    if (scrapeResponse.ok) {
      const scrapeResult = await scrapeResponse.json();
      scrapedData = scrapeResult.data?.markdown || scrapeResult.markdown || "";
      scrapedLinks = scrapeResult.data?.links || scrapeResult.links || [];
      scrapedLinks = scrapedLinks.filter((l: string) => l.includes("flipkart.com/") && l.includes("/p/"));
      console.log(`Scraped ${scrapedData.length} chars, ${scrapedLinks.length} product links`);
    } else {
      const errText = await scrapeResponse.text();
      console.error("Firecrawl scrape failed:", scrapeResponse.status, errText);
      scrapedData = "Could not scrape Flipkart directly. Using AI knowledge instead.";
    }

    const prompt = `You are an expert Indian ecommerce analyst. I scraped the Flipkart ${category === "all" ? "trending" : category} page and got this data:

--- SCRAPED FLIPKART DATA ---
${scrapedData.slice(0, 8000)}
--- END SCRAPED DATA ---

Product Links Found:
${scrapedLinks.slice(0, 30).map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}

Now analyze this REAL data and provide:

## 🔥 Flipkart Trending Products — ${category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}

For each product found in the scraped data, provide:
1. **Product Name** - exact name from Flipkart
2. **Price** - in ₹ (as shown on Flipkart)
3. **Discount** - if available
4. **Rating** - if available
5. **🔗 Flipkart Link** - actual product URL from the scraped links above
6. **Why It's Trending** - brief reason

List at least 10-15 products with their ACTUAL Flipkart links.

## 📊 Category Insights
- Which products have the best discounts
- Price ranges that are selling most
- Seasonal patterns visible

## 💡 Seller Tips
- Which products to start selling based on this data
- Pricing strategy based on current Flipkart prices
- How to compete with these top sellers

IMPORTANT: Use REAL data from the scrape. Include actual Flipkart product URLs wherever possible. Format links as clickable markdown links like [Product Name](URL).
Provide clear English responses.`;

    const response = await callAI([
      { role: "user", content: prompt },
    ], userGeminiKey, undefined, true);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("trending-products error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
