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

        const visionMessages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze these product images and provide detailed observations about:
- Colors, materials, textures visible
- Design elements and quality indicators
- Use cases and occasions based on appearance
- Additional keywords from visual features

Be specific and detailed.`
              },
              ...images.map((img) => ({
                type: "image_url",
                image_url: { url: img }
              }))
            ]
          }
        ];

        const visionResponse = await callAIImage(visionMessages);
        if (visionResponse && visionResponse.choices && visionResponse.choices[0]) {
          imageAnalysis = visionResponse.choices[0].message?.content || "";
          console.log("Image analysis complete");
        }
      } catch (e) {
        console.warn("Image analysis failed, continuing without it:", e);
      }
    }

    const prompt = `You are an expert Amazon India product listing writer. Create a COMPLETE, DETAILED Amazon listing with MAXIMUM keyword integration.

PRODUCT INFORMATION:
Product Name: ${productName}
Category: ${category}
Description: ${productDescription}
Key Features: ${keyFeatures}
${imageAnalysis ? `\nImage Analysis: ${imageAnalysis}` : ''}

Generate the listing in this EXACT format:

A. FINAL AMAZON TITLE

[Write a title of EXACTLY 75 characters that includes:
- Brand name (if available)
- Product type
- Key material/feature
- Important specifications
- High-search keywords naturally integrated]

Character Count: [count] characters

Title Keywords Used:
[List 5-7 main keywords used in title with variations noted]

B. 5 AMAZON BULLET POINTS

Write 5 detailed bullet points (150-200 characters each) with these EXACT labels:

Fabric & Comfort: [Detailed text about material, comfort, breathability, skin-friendliness. Integrate keywords like "cotton shirt for men", "lightweight", "breathable fabric". Make it detailed and benefit-focused.]

Formal & Office Ready: [Text about formal use, office wear, professional appearance. Keywords like "formal shirt for men", "office wear", "meeting shirts for men".]

Design & Fit: [Text about design details, fit options, color, style. Keywords like "regular fit", "slim fit", "spread collar", design elements.]

Versatile For Every Occasion: [Text about multiple use cases - office, casual, events, wedding. Keywords naturally integrated.]

Care & Value / Easy Care: [Text about maintenance, care instructions, sizing, price point if relevant. Keywords about durability, easy care.]

C. AMAZON PRODUCT DESCRIPTION

Write a comprehensive description (500-800 words) with these sections:

<strong>[Product Name]</strong> [Opening paragraph - 2-3 sentences about what makes this product special and who it's for. Integrate keywords naturally.]

<u>Fabric & Comfort</u>
[Detailed paragraph about material, texture, breathability, comfort. Use <strong>keywords</strong> for emphasis. 4-5 sentences.]

<u>Design & Style</u>
[Paragraph about design, color, style elements, aesthetic appeal. Use <strong>bold</strong> for key features. 4-5 sentences.]

<u>Fit Options</u>
[Paragraph explaining fit types if applicable (Regular, Slim, etc.). 3-4 sentences.]

<u>Built for Every Occasion</u>
[Detailed paragraph about versatility - office, casual, events, daily wear, wedding. 5-6 sentences with many use cases.]

<u>Practical Details</u>
[Paragraph about functional features - pockets, closures, maintenance, durability. 3-4 sentences.]

<u>Sizes & Pack</u>
[Paragraph about available sizes, pack contents, price if mentioned. 2-3 sentences.]

[Closing line - call to action or benefit summary.]

D. BACKEND GENERIC SEARCH TERMS

[Write a single line of SPACE-SEPARATED keywords (NO semicolons, NO commas). Max 500 characters.
Include: audience terms (man, mens), style descriptors, occasions (office, meeting, wedding, daily, casual, formal), construction terms, materials. Do NOT repeat brand name. Example format: "man mens stylish office meeting wedding daily wear casual formal work everyday pocket regular slim collar"]

E. 7 SEO IMAGE FILE NAMES

[Generate 7 SEO-optimized image filenames in lowercase with hyphens:
1. [brand]-[product]-[material]-[main-feature].jpg
2. [product]-front-view-detail.jpg
3. [product]-[key-feature]-closeup.jpg
4. [product]-fabric-texture-comfort.jpg
5. [product]-fit-style-comparison.jpg
6. [product]-occasion-use-lifestyle.jpg
7. [product]-size-chart-specifications.jpg]

F. COMPLETE KEYWORD COVERAGE AUDIT

Create a detailed table showing how keywords are used:

Keyword | Used? | Location | Type
[For each main keyword provided in keyFeatures, show:
- The keyword phrase
- YES/NO
- Where it appears (Title/Bullet 2/Description section)
- "Exact" or "Natural variation"]

CRITICAL REQUIREMENTS:
✓ Title: EXACTLY 75 characters
✓ Bullet points: 150-200 chars each, with specific section labels
✓ Description: Use <strong> and <u> HTML tags for formatting
✓ Description: Detailed with multiple subsections
✓ Backend keywords: SPACE separated, NO semicolons
✓ Maximum keyword density without keyword stuffing
✓ Natural, benefit-focused writing
✓ Professional tone for Amazon India market

Return the complete listing in the exact format shown above.`;

    const messages = [
      {
        role: "system",
        content: "You are an expert Amazon India listing writer. Generate detailed, keyword-rich listings in the exact format requested. Follow all formatting requirements precisely."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await callAI(messages);

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    // Read the streaming response
    const responseText = await response.text();

    // Parse text from SSE response
    let fullText = "";
    const lines = responseText.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch {
            // Continue parsing
          }
        }
      }
    }

    // Parse sections from the text
    const sections = {
      title: "",
      titleCharCount: 0,
      titleKeywords: [] as string[],
      bulletPoints: [] as string[],
      description: "",
      backendKeywords: "",
      imageFilenames: [] as string[],
      keywordAudit: ""
    };

    // Extract Title
    const titleMatch = fullText.match(/A\.\s*FINAL AMAZON TITLE\s*\n\n([^\n]+)\s*\n\n?Character Count:\s*(\d+)/s);
    if (titleMatch) {
      sections.title = titleMatch[1].trim();
      sections.titleCharCount = parseInt(titleMatch[2]);
    }

    // Extract Title Keywords
    const titleKeywordsMatch = fullText.match(/Title Keywords Used:\s*\n((?:[^\n]+\n)*?)(?=\n?B\.)/s);
    if (titleKeywordsMatch) {
      sections.titleKeywords = titleKeywordsMatch[1].trim().split('\n').filter(k => k.trim());
    }

    // Extract Bullet Points
    const bulletSection = fullText.match(/B\.\s*5 AMAZON BULLET POINTS\s*\n((?:.|\n)*?)(?=C\.|$)/s);
    if (bulletSection) {
      const bullets = bulletSection[1].trim().split(/\n(?=[A-Z][a-z]+ &)/);
      sections.bulletPoints = bullets.filter(b => b.trim()).map(b => b.trim());
    }

    // Extract Description
    const descMatch = fullText.match(/C\.\s*AMAZON PRODUCT DESCRIPTION\s*\n((?:.|\n)*?)(?=D\.|$)/s);
    if (descMatch) {
      sections.description = descMatch[1].trim();
    }

    // Extract Backend Keywords
    const backendMatch = fullText.match(/D\.\s*BACKEND GENERIC SEARCH TERMS\s*\n([^\n]+)/);
    if (backendMatch) {
      sections.backendKeywords = backendMatch[1].trim();
    }

    // Extract Image Filenames
    const imageSection = fullText.match(/E\.\s*7 SEO IMAGE FILE NAMES\s*\n((?:[^\n]+\n){7})/s);
    if (imageSection) {
      sections.imageFilenames = imageSection[1].trim().split('\n').map(f => f.replace(/^\d+\.\s*/, '').trim());
    }

    // Extract Keyword Audit
    const auditMatch = fullText.match(/F\.\s*COMPLETE KEYWORD COVERAGE AUDIT\s*\n((?:.|\n)*?)$/s);
    if (auditMatch) {
      sections.keywordAudit = auditMatch[1].trim();
    }

    // Return structured data
    const listingData = {
      category,
      productName,
      title: sections.title,
      titleCharCount: sections.titleCharCount,
      titleKeywords: sections.titleKeywords,
      highlights: sections.title, // For compatibility
      bulletPoints: sections.bulletPoints,
      description: sections.description,
      keywords: sections.titleKeywords, // For compatibility
      backendKeywords: sections.backendKeywords,
      imageUrls: sections.imageFilenames,
      imageRecommendations: sections.imageFilenames,
      keywordAudit: sections.keywordAudit,
      fullText: fullText // Include full formatted text
    };

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