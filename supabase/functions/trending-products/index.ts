import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, corsHeaders, handleAIError, handleResponseErrors } from "../_shared/ai-call.ts";

const flipkartCategoryUrls: Record<string, string> = {
  all: "https://www.flipkart.com/offers-store",
  fashion: "https://www.flipkart.com/clothing-and-accessories/pr?sid=clo",
  electronics: "https://www.flipkart.com/electronics/pr?sid=reh",
  beauty: "https://www.flipkart.com/beauty-and-grooming/pr?sid=g9b",
  home: "https://www.flipkart.com/home-kitchen/pr?sid=arb",
  health: "https://www.flipkart.com/health-care/pr?sid=hlc",
  toys: "https://www.flipkart.com/toys/pr?sid=mgl",
  food: "https://www.flipkart.com/grocery/pr?sid=eat",
};

function buildFlipkartUrl(params: {
  category: string;
  subCategoryUrl?: string;
  priceMin?: string;
  priceMax?: string;
  sortBy?: string;
  minDiscount?: string;
  minRating?: string;
  latchOnly?: boolean;
}): string {
  const base = params.subCategoryUrl || flipkartCategoryUrls[params.category] || flipkartCategoryUrls.all;
  const url = new URL(base);

  const p: string[] = [];

  if (params.priceMin) p.push(`facets.price_range.from=${params.priceMin}`);
  if (params.priceMax) p.push(`facets.price_range.to=${params.priceMax}`);

  if (params.minDiscount && params.minDiscount !== "any") {
    p.push(`facets.discount_range_v1[]=${params.minDiscount}%+or+more`);
  }

  if (params.minRating && params.minRating !== "any") {
    p.push(`facets.rating[]=${params.minRating}%2B`);
  }

  if (params.latchOnly) {
    p.push("facets.latch[]=true");
  }

  p.forEach((facet) => url.searchParams.append("p[]", facet));

  const sort = params.sortBy || "popularity";
  if (sort !== "popularity") url.searchParams.set("sort", sort);
  else url.searchParams.set("sort", "popularity");

  url.searchParams.set("marketplace", "FLIPKART");
  return url.toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      category,
      platform,
      subCategoryUrl,
      subCategoryLabel,
      priceMin,
      priceMax,
      sortBy,
      minDiscount,
      minRating,
      latchOnly,
      userGeminiKey,
    } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const targetUrl = buildFlipkartUrl({ category, subCategoryUrl, priceMin, priceMax, sortBy, minDiscount, minRating, latchOnly });
    console.log("Scraping Flipkart:", targetUrl);

    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: targetUrl, formats: ["markdown", "links"], onlyMainContent: true, waitFor: 1500 }),
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
      scrapedData = "Could not scrape Flipkart directly. Using market knowledge instead.";
    }

    const filtersDescription = [
      category !== "all" ? `Category: ${category}` : null,
      subCategoryLabel && subCategoryLabel !== "All" ? `Sub-category: ${subCategoryLabel}` : null,
      platform !== "all" ? `Platform: ${platform}` : null,
      priceMin ? `Min price: ₹${priceMin}` : null,
      priceMax ? `Max price: ₹${priceMax}` : null,
      minDiscount && minDiscount !== "any" ? `Min discount: ${minDiscount}% or more` : null,
      minRating && minRating !== "any" ? `Min rating: ${minRating}★ & above` : null,
      latchOnly ? "Latch/Limited-time deals only" : null,
      sortBy && sortBy !== "popularity" ? `Sort by: ${sortBy}` : "Sort by: Best Selling (popularity)",
    ].filter(Boolean).join(", ") || "No specific filters (all categories)";

    const prompt = `You are a top-tier Indian ecommerce product-viability analyst working for serious Flipkart/Meesho/Amazon sellers. Sellers pay premium prices for ACCURATE, decisive analysis — not vague lists.

APPLIED FILTERS:
${filtersDescription}

--- SCRAPED FLIPKART DATA ---
${scrapedData.slice(0, 5000)}
--- END SCRAPED DATA ---

Real Product Links Found:
${scrapedLinks.slice(0, 25).map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}

Your job: identify the 10 hottest, most sellable products that match the filters. Use the REAL scraped products when present. If the scrape is sparse, use your real knowledge of actual best-selling Indian (Flipkart) products in this category and price range. NEVER make up a brand that doesn't exist; prefer real, popular Indian-market brands like boAt, Noise, ZEBRONICS, Wildcraft, Campus, Puma, Denim, Wow Skin Science, Mamaearth, Borosil, etc.

RESPONSE FORMAT — output these EXACT sections in order:

FIRST, a 2-3 line summary in markdown starting with "## 🔥 Flipkart Trending — ${category === "all" ? "All Categories" : (subCategoryLabel !== "All" ? subCategoryLabel : category.charAt(0).toUpperCase() + category.slice(1))}" — state the single strongest opportunity of the week.

THEN, exactly 10 product records, EACH as its own line starting with the exact token ❯❯PRODUCT❮❮ followed by one minified JSON object with this exact schema (no markdown, no code fences, no text on the same line after the JSON):
{"name":"Product Name","brand":"Brand","url":"https://www.flipkart.com/...","price":1299,"mrp":3999,"off":67,"rating":4.2,"reviews":45000,"demand":78,"competition":34,"profit":71,"verdict":"SELL","trend":"one-line why it is trending now","reason":"one-line why it is profitable/viable for a reseller to sell this"}

Rules for the JSON fields:
- name/brand/url = real product identity. price = current selling price in ₹ (number). mrp = maximum retail price (number). off = integer discount %.
- rating = 0-5 with one decimal. reviews = approximate real review count (number).
- demand = 0-100 (how strong current buyer demand is).
- competition = 0-100 (how crowded the listing is for similar sellers).
- profit = 0-100 (estimated NET profitability for a reseller after Flipkart commission, shipping, packaging & ads). Give varied, decisive scores — not all middling.
- verdict = exactly "SELL" if profit >= 60, "MAYBE" if profit 40-59, "SKIP" if profit < 40. Match verdict to the profit score.
- Do NOT include a "sourcing" key — the system adds sourcing links automatically.

THEN, a "## 💡 Seller Action Plan" markdown section (max 4 lines): the single best product to sell, the exact price to set, and when to restock (season/date).

THEN, a "## 📊 Market Insights" markdown section (max 3 lines): 2 sharp observations.

Output ONLY the summary, the 10 ❯❯PRODUCT❮❮ lines, and the two markdown sections. Nothing else. All 10 product lines MUST be present.`;

    const response = await callAI([
      { role: "user", content: prompt },
    ], userGeminiKey);

    const errResp = handleResponseErrors(response, corsHeaders);
    if (errResp) return errResp;

    // Forward the AI stream directly. The frontend parses ❯❯PRODUCT❮❮ lines
    // from the accumulated text and injects sourcing links client-side.
    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("trending-products error:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});