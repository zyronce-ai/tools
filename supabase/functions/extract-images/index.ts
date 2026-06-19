import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "Firecrawl not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping images from:", formattedUrl);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["html", "links"],
        onlyMainContent: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl error:", data);
      return new Response(JSON.stringify({ success: false, error: data.error || "Scrape failed" }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract image URLs from HTML
    const html = data.data?.html || data.html || "";
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const srcsetRegex = /srcset=["']([^"']+)["']/gi;
    const bgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
    const ogRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;

    const imageUrls = new Set<string>();
    const videoUrls = new Set<string>();

    // Video extraction regexes
    const videoTagRegex = /<video[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const sourceRegex = /<source[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const ogVideoRegex = /<meta[^>]+property=["']og:video(?::url|:secure_url)?["'][^>]+content=["']([^"']+)["']/gi;
    const videoExtRegex = /["'](https?:\/\/[^"']+\.(?:mp4|webm|ogg|mov|m3u8|m4v))(?:\?[^"']*)?["']/gi;

    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith("data:")) imageUrls.add(match[1]);
    }
    while ((match = srcsetRegex.exec(html)) !== null) {
      const urls = match[1].split(",").map(s => s.trim().split(/\s+/)[0]);
      urls.forEach(u => { if (u && !u.startsWith("data:")) imageUrls.add(u); });
    }
    while ((match = bgRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith("data:")) imageUrls.add(match[1]);
    }
    while ((match = ogRegex.exec(html)) !== null) {
      if (match[1]) imageUrls.add(match[1]);
    }

    // Extract videos
    while ((match = videoTagRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith("data:")) videoUrls.add(match[1]);
    }
    while ((match = sourceRegex.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith("data:")) videoUrls.add(match[1]);
    }
    while ((match = ogVideoRegex.exec(html)) !== null) {
      if (match[1]) videoUrls.add(match[1]);
    }
    while ((match = videoExtRegex.exec(html)) !== null) {
      if (match[1]) videoUrls.add(match[1]);
    }

    // Resolve relative URLs
    const baseUrl = new URL(formattedUrl);
    const resolvedImages = Array.from(imageUrls).map(src => {
      try {
        return new URL(src, baseUrl.origin).href;
      } catch {
        return src;
      }
    }).filter(src =>
      src.startsWith("http") &&
      !src.includes("data:") &&
      !src.includes(".svg") &&
      !src.endsWith(".ico")
    );

    // Remove duplicates and limit
    const uniqueImages = [...new Set(resolvedImages)].slice(0, 100);

    // Resolve and filter video URLs
    const resolvedVideos = Array.from(videoUrls).map(src => {
      try {
        return new URL(src, baseUrl.origin).href;
      } catch {
        return src;
      }
    }).filter(src => src.startsWith("http") && !src.includes("data:"));
    const uniqueVideos = [...new Set(resolvedVideos)].slice(0, 50);

    return new Response(JSON.stringify({
      success: true,
      images: uniqueImages,
      videos: uniqueVideos,
      pageTitle: data.data?.metadata?.title || data.metadata?.title || formattedUrl,
      totalFound: uniqueImages.length,
      totalVideos: uniqueVideos.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-images error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
