import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://tool.nayratrendz.in";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/login", changefreq: "monthly", priority: "0.3" },
  { path: "/pricing", changefreq: "weekly", priority: "0.7" },
  { path: "/chat", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/content-writer", changefreq: "weekly", priority: "0.7" },
  { path: "/keywords", changefreq: "weekly", priority: "0.7" },
  { path: "/banner", changefreq: "weekly", priority: "0.6" },
  { path: "/invoice", changefreq: "monthly", priority: "0.5" },
  { path: "/bg-remover", changefreq: "weekly", priority: "0.7" },
  { path: "/listing-scorer", changefreq: "weekly", priority: "0.6" },
  { path: "/image-upscaler", changefreq: "weekly", priority: "0.6" },
  { path: "/text-to-speech", changefreq: "weekly", priority: "0.5" },
  { path: "/image-extractor", changefreq: "monthly", priority: "0.5" },
  { path: "/image-to-url", changefreq: "monthly", priority: "0.4" },
  { path: "/logo-maker", changefreq: "weekly", priority: "0.6" },
  { path: "/trending-products", changefreq: "daily", priority: "0.8" },
  { path: "/fake-review-detector", changefreq: "weekly", priority: "0.6" },
  { path: "/product-seo", changefreq: "weekly", priority: "0.7" },
  { path: "/startup-guide", changefreq: "weekly", priority: "0.6" },
  { path: "/api-settings", changefreq: "monthly", priority: "0.3" },
  { path: "/barcode-generator", changefreq: "monthly", priority: "0.5" },
  { path: "/image-compressor", changefreq: "monthly", priority: "0.5" },
  { path: "/pricing-calculator", changefreq: "weekly", priority: "0.6" },
  { path: "/profile", changefreq: "monthly", priority: "0.3" },
  { path: "/content-history", changefreq: "monthly", priority: "0.4" },
];

function generateSitemap(entries: SitemapEntry[]) {
  const now = new Date().toISOString();
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);