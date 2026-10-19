import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, callAI, callAIImage, handleAIError } from "../_shared/ai-call.ts";

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

    // If images provided, analyze them with vision API
    let imageAnalysis = "";
    if (images && images.length > 0) {
      try {
        console.log(`Analyzing ${images.length} images with vision API...`);

        // Prepare vision messages for image analysis
        const visionMessages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert product image analyzer. Analyze these ${images.length} product image(s) and provide:
1. Key visual features and product details visible in the images
2. Color, material, texture, design elements
3. Quality assessment (premium/good/average)
4. Suitable occasions/use cases based on visual appearance
5. Additional keywords based on what you see

Format your response as bullet points with specific observations from the images that can be used in Amazon listing.`
              },
              ...images.map((img) => ({
                type: "image_url",
                image_url: { url: img }
              }))
            ]
          }
        ];

        // Call vision API to analyze images
        const visionResponse = await callAIImage(visionMessages);

        if (visionResponse && visionResponse.choices && visionResponse.choices[0]) {
          imageAnalysis = visionResponse.choices[0].message?.content || "";
          console.log("Image analysis complete:", imageAnalysis.substring(0, 200) + "...");
        }
      } catch (e) {
        console.warn("Image analysis failed, continuing without it:", e);
        // Continue without image analysis if it fails
      }
    }

    const prompt = `You are an expert Amazon product listing generator. Analyze all provided information and generate a complete optimized Amazon product listing.

PRODUCT INFORMATION:
- Product Name: ${productName}
- Category: ${category}
- Description: ${productDescription}
- Key Features/Keywords: ${keyFeatures}
${imageAnalysis ? `\nIMAGE ANALYSIS:\n${imageAnalysis}` : '(No images provided)'}

Generate a JSON response with this exact structure:
{
  "title": "Product title - MAX 75 characters with high search keywords. Include brand if applicable",
  "highlights": "Item highlights - MAX 125 characters with main benefits and key selling points",
  "bulletPoints": [
    "Point 1: Feature or benefit with natural keyword integration (max 150 chars)",
    "Point 2: Another feature or benefit with keywords (max 150 chars)",
    "Point 3: Design, fit, or quality aspect with keywords (max 150 chars)",
    "Point 4: Occasions, versatility, or use cases with keywords (max 150 chars)",
    "Point 5: HIGH-SEARCH KEYWORDS ONLY - List only the most important keywords separated by semicolons (no sentences)"
  ],
  "description": "Start with a compelling opening line. Then describe: Materials and comfort, Design and style, Features and specifications, Occasions and versatility, Care and maintenance. Use **bold** for emphasis on key features. Use __underline__ for highlighting main benefits. NO HTML tags. Write in clear paragraphs. Total 500-800 words.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "backendKeywords": "keyword1; keyword2; keyword3; keyword4; keyword5; keyword6; keyword7; keyword8; keyword9; keyword10; keyword11; keyword12; keyword13; keyword14; keyword15 (MAX 500 characters total, semicolon separated, NO COMMAS)",
  "imageRecommendations": ["Main product photo", "Front view detail", "Back view", "Side/angle view", "Close-up of key feature", "Product in use", "Size chart or specifications"]
}

IMPORTANT GUIDELINES:
✓ Title: 75 chars MAX - Brand + Key Features + Primary Keywords
✓ Highlights: 125 chars MAX - Most compelling benefits
✓ Bullet 1-4: Natural, benefit-driven content with keywords woven naturally
✓ Bullet 5: ONLY HIGH-SEARCH KEYWORDS - No sentences, just keywords separated by semicolons
✓ Description: Comprehensive with benefits, uses, care. Use **bold** and __underline__ NO HTML
✓ Keywords: 10 most important high-search keywords
✓ Backend: MAX 500 chars, semicolon separated (;), NO commas, NO spaces after semicolons
✓ Use image analysis insights when available
✓ All keywords must be relevant and search-optimized for Amazon

Return ONLY valid JSON, no markdown formatting, no additional text.`;

    const messages = [
      {
        role: "system",
        content: "You are an expert Amazon product listing optimizer with deep knowledge of SEO, keyword research, and conversion optimization. Generate listings that rank well and convert. Always return valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    // Call AI to generate listing
    const response = await callAI(messages);

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    // Read the streaming response
    const responseText = await response.text();

    // Parse JSON from SSE response
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

    // Extract and parse JSON
    let listingData;
    try {
      // Find JSON object in response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        listingData = JSON.parse(jsonMatch[0]);
      } else {
        listingData = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error("JSON parse error:", e);
      console.log("Response text:", jsonStr);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate and clean response
    listingData.category = category;
    listingData.imageUrls = images || [];

    // Ensure all fields exist
    listingData.title = listingData.title?.substring(0, 75) || "";
    listingData.highlights = listingData.highlights?.substring(0, 125) || "";
    listingData.bulletPoints = listingData.bulletPoints || [];
    listingData.description = listingData.description || "";
    listingData.keywords = listingData.keywords || [];
    listingData.backendKeywords = listingData.backendKeywords?.substring(0, 500) || "";
    listingData.imageRecommendations = listingData.imageRecommendations || [];

    console.log("Listing generated successfully");

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