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
      body: JSON.stringify({ url: targetUrl, formats: ["markdown", "links"], onlyMainContent: true, waitFor: 1000 }),
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

    const prompt = `You are an expert Indian ecommerce analyst. I scraped the Flipkart page for these filters and got this data:

APPLIED FILTERS:
${filtersDescription}

--- SCRAPED FLIPKART DATA ---
${scrapedData.slice(0, 4500)}
--- END SCRAPED DATA ---

Product Links Found:
${scrapedLinks.slice(0, 20).map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}

Now analyze this REAL data and respond FAST with a concise markdown report. Keep it short and to the point.

## 🔥 Flipkart Trending — ${category === "all" ? "All Categories" : (subCategoryLabel !== "All" ? subCategoryLabel : category.charAt(0).toUpperCase() + category.slice(1))}

List the top 10 products from the scraped data. For each product, output a single line with this exact format:
- **Product Name** — ₹Price (X% off, ⭐4.2) — Latch: ✅/❌ — [Open on Flipkart](URL) — one-line why trending

CRITICAL: Every product MUST have its Flipkart URL as a clickable markdown link [Open on Flipkart](https://www.flipkart.com/...). Never output bare URLs.

IMPORTANT: Strictly respect the applied filters above. Only list products that fall within the requested price range, discount, and rating. ${latchOnly ? "Only include products that have an active Latch / Limited-Time Deal / Lightning Deal." : ""}

Then add TWO short sections (max 3 lines each):
## 💡 Seller Tips
- 2 quick tips: which product to sell & what price to set

## 📊 Insights
- 2 quick observations from the data
`;

    const response = await callAI([
      { role: "user", content: prompt },
    ], userGeminiKey);

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
