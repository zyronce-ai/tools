import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, callAI, handleAIError } from "../_shared/ai-call.ts";

interface ListingRequest {
  category: string;
  productName: string;
  productDescription: string;
  keyFeatures: string;
  images: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, productName, productDescription, keyFeatures, images } = await req.json() as ListingRequest;

    const prompt = `You are an Amazon product listing expert. Generate a complete Amazon product listing for:

Product Name: ${productName}
Category: ${category}
Description: ${productDescription}
Key Features/Keywords: ${keyFeatures}
${images.length > 0 ? `Images provided: ${images.length} image(s)` : ''}

Generate a JSON response with the following structure:
{
  "title": "Product title - MAX 75 characters with high search keywords",
  "highlights": "Item highlights - MAX 125 characters with key selling points",
  "bulletPoints": ["Bullet point 1 with keywords", "Bullet point 2 with keywords", "Bullet point 3 with keywords", "Bullet point 4 with keywords", "Bullet point 5 with keywords - one bullet point with ONLY high search keywords"],
  "description": "Detailed product description with benefits, uses, directions. Highlight important points using **bold** and underline using __underline__. Write in a clean format without HTML tags.",
  "keywords": ["high search keyword 1", "high search keyword 2", "high search keyword 3", "high search keyword 4", "high search keyword 5", "high search keyword 6", "high search keyword 7", "high search keyword 8", "high search keyword 9", "high search keyword 10"],
  "backendKeywords": "keyword1; keyword2; keyword3; keyword4; keyword5; keyword6; keyword7; keyword8; keyword9; keyword10 (MAX 500 characters, semicolon separated, no commas)",
  "imageUrls": ${images.length > 0 ? "Provide 7 SEO-optimized image filenames based on the product" : "[]"}
}

Important guidelines:
- Title: Maximum 75 characters, include brand + key features + important keywords
- Highlights: Maximum 125 characters, main selling points
- Bullet Points: 5 points, each with high-search keywords naturally integrated. One bullet point should contain ONLY high search keywords (no sentences).
- Description: Comprehensive with benefits, uses, directions. Use **text** for bold and __text__ for underline to highlight important product features. NO HTML tags.
- Keywords: List high-search keywords separately
- Backend Keywords: Single line, MAX 500 characters, semicolon separated (;), no commas
- Image Filenames: If images provided, generate 7 SEO-friendly filenames in lowercase with hyphens

Return ONLY valid JSON, no additional text.`;

    const messages = [
      { role: "system", content: "You are an expert Amazon product listing generator. Generate optimized listings with proper character limits and keyword integration." },
      { role: "user", content: prompt }
    ];

    const response = await callAI(messages);

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    // Read the response as text
    const responseText = await response.text();

    // Parse the JSON from the SSE response
    let jsonStr = "";
    const lines = responseText.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) jsonStr += content;
          } catch {
            // Continue parsing
          }
        }
      }
    }

    // Try to extract JSON from the response
    let listingData;
    try {
      // Find JSON in the response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        listingData = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole response
        listingData = JSON.parse(jsonStr);
      }
    } catch (e) {
      // If JSON parsing fails, create a structured response from the text
      console.error("JSON parse error:", e);
      console.log("Response text:", jsonStr);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Add category to response
    listingData.category = category;
    listingData.imageUrls = images.length > 0 ? listingData.imageUrls || [] : [];

    return new Response(JSON.stringify(listingData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error generating listing:", e);
    const aiErr = handleAIError(e, corsHeaders);
    if (aiErr) return aiErr;
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Failed to generate listing" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});