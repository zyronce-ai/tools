import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// A4 page size in points (pdf-lib uses 72 points per inch)
const A4_WIDTH = 595.28;  // 210mm
const A4_HEIGHT = 841.89; // 297mm

// 4x6 inch thermal sticker in points (portrait orientation)
const LABEL_W = 4 * 72;   // 288 pt
const LABEL_H = 6 * 72;   // 432 pt

// ---------------------------------------------------------------------------
// TEXT PARSING HELPERS
// pdf-lib does NOT extract text, so these helpers are the single place where a
// text-extraction library (pdf.js / pdftotext wrapper) should be plugged in.
// Replace parsePageText() with a real extractor to enable fully dynamic sorting.
// ---------------------------------------------------------------------------

// Placeholder: extract all text from a PDF page.
// TODO: integrate pdf.js (esm.sh/pdfjs-dist) or an external pdftotext service.
function parsePageText(_bytes: Uint8Array): string {
  return "";
}

function contains(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k.toLowerCase()));
}

// "Sort Plastic and NPP" — Flipkart uses NPP (non-plastic packaging) for some orders
function isPlasticOrNpp(text: string): boolean {
  return contains(text, ["npp", "plastic"]);
}

// "Large parcel at bottom" — Flipkart marks big/oversized shipments
function isLargeParcel(text: string): boolean {
  return contains(text, ["large parcel", "large", "bulk", "oversized", "heavy"]);
}

// "Multi order at bottom" — combined multi-product shipments
function isMultiOrder(text: string): boolean {
  return contains(text, ["multi", "multi-order", "combo", "clubbed"]);
}

// "Sort Courier wise" — Ekart (Flipkart's own courier) vs third-party couriers
function getCourier(text: string): string | null {
  const couriers = ["ekart", "delhivery", "bluedart", "shadowfax", "xpressbees", "delhivery" ];
  const t = text.toLowerCase();
  for (const c of couriers) {
    if (t.includes(c)) return c;
  }
  return null;
}

// "Separate Review Orders using list" — check if the order ID is in the review list
function isReviewOrder(text: string, reviewList: string[]): boolean {
  if (!reviewList.length) return false;
  return reviewList.some((id) => {
    const rid = id.trim().toLowerCase();
    if (!rid) return false;
    return text.toLowerCase().includes(rid);
  });
}

// ---------------------------------------------------------------------------
// PAGE SORTING
// ---------------------------------------------------------------------------

interface LabelPage {
  page: number;            // original page index
  text: string;            // extracted text (empty until parser wired up)
  courier: string | null;  // courier name if "Sort Courier wise"
  isPlasticNpp: boolean;
  isLarge: boolean;
  isMulti: boolean;
  isReview: boolean;
  soldBy: string | null;
}

function sortPages(
  labels: LabelPage[],
  opts: {
    sortPlasticNpp: boolean;
    sortSoldBy: boolean;
    largeParcelBottom: boolean;
    sortCourier: boolean;
    multiOrderBottom: boolean;
    keepInvoice: boolean;
    reviewOrders: string[];
  },
): LabelPage[] {
  let pages = [...labels];

  // 1. Drop invoice pages if "Keep Invoice" is off
  if (!opts.keepInvoice) {
    pages = pages.filter((p) => !contains(p.text, ["invoice", "tax invoice", "bill of", "gst invoice"]));
  }

  // 2. Separate review orders
  const review = pages.filter((p) => p.isReview);
  pages = pages.filter((p) => !p.isReview);

  // 3. Sort courier wise (Ekart / Delhivery / ...)
  if (opts.sortCourier) {
    pages.sort((a, b) => {
      const ca = a.courier ?? "zzz";
      const cb = b.courier ?? "zzz";
      return ca.localeCompare(cb);
    });
  }

  // 4. Group plastic / NPP
  if (opts.sortPlasticNpp) {
    const plastic = pages.filter((p) => p.isPlasticNpp);
    const normal = pages.filter((p) => !p.isPlasticNpp);
    pages = [...normal, ...plastic];
  }

  // 5. Group by "Sold By"
  if (opts.sortSoldBy) {
    const groups = new Map<string, LabelPage[]>();
    for (const p of pages) {
      const key = p.soldBy ?? "unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    pages = Array.from(groups.values()).flat();
  }

  // 6. Large parcels + multi orders go to the bottom
  if (opts.largeParcelBottom) {
    const large = pages.filter((p) => p.isLarge);
    pages = pages.filter((p) => !p.isLarge).concat(large);
  }
  if (opts.multiOrderBottom) {
    const multi = pages.filter((p) => p.isMulti);
    pages = pages.filter((p) => !p.isMulti).concat(multi);
  }

  // 7. Review orders come last
  return pages.concat(review);
}

// ---------------------------------------------------------------------------
// PDF PROCESSING
// ---------------------------------------------------------------------------

async function cropPage(
  sourcePdf: PDFDocument,
  targetPdf: PDFDocument,
  pageIndex: number,
  labelNumber: number,
  picklistInterval: number,
): Promise<void> {
  const source = sourcePdf.getPage(pageIndex);
  const copied = await targetPdf.copyPages(sourcePdf, [pageIndex]);
  const page = copied[0];

  // Use original page size if it's already a label-size sheet, otherwise
  // crop the A4 sheet to the top-left 4x6 label region.
  const media = source.getSize();
  if (media.width <= LABEL_W + 40 && media.height <= LABEL_H + 40) {
    // Already label-sized — keep as is
  } else {
    // Crop top-left 4x6 area of the A4 sheet.
    // NOTE: adjust the X offset to pick a different label column/grid position.
    const x = 0;
    const yTopLeft = media.height; // pdf coords origin is bottom-left
    page.setMediaBox(x, yTopLeft - LABEL_H, LABEL_W, LABEL_H);
    page.setCropBox(x, yTopLeft - LABEL_H, LABEL_W, LABEL_H);
  }

  targetPdf.addPage(page);

  // Insert an empty picklist page after every N labels
  if (picklistInterval > 0 && (labelNumber % picklistInterval === 0)) {
    const blank = targetPdf.addPage([LABEL_W, LABEL_H]);
    blank.setMediaBox(0, 0, LABEL_W, LABEL_H);
    blank.setCropBox(0, 0, LABEL_W, LABEL_H);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ success: false, error: "No PDF file uploaded" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const getBool = (key: string) => form.get(key) === "true" || form.get(key) === "on";
    const opts = {
      sortPlasticNpp: getBool("sort_plastic_npp"),
      sortSoldBy: getBool("sort_sold_by"),
      largeParcelBottom: getBool("large_parcel_bottom"),
      sortCourier: getBool("sort_courier"),
      keepInvoice: getBool("keep_invoice"),
      mergeFiles: getBool("merge_files"),
      multiOrderBottom: getBool("multi_order_bottom"),
      picklistInterval: parseInt(String(form.get("picklist_interval") || "10"), 10) || 10,
      reviewOrders: String(form.get("review_orders") || "").split(/[\n,;]/).map(s => s.trim()).filter(Boolean),
    };

    const bytes = new Uint8Array(await file.arrayBuffer());
    const sourcePdf = await PDFDocument.load(bytes);
    const pageCount = sourcePdf.getPageCount();

    // Build label metadata (text parsing is a placeholder for now)
    // NOTE: pdf.js text extraction goes here — feed page content streams through
    // a real parser so `text` becomes the actual label text, enabling dynamic sorting.
    const labels: LabelPage[] = [];
    for (let i = 0; i < pageCount; i++) {
      const text = parsePageText(new Uint8Array(0)); // placeholder: returns ""
      labels.push({
        page: i,
        text,
        courier: getCourier(text),
        isPlasticNpp: isPlasticOrNpp(text),
        isLarge: isLargeParcel(text),
        isMulti: isMultiOrder(text),
        isReview: isReviewOrder(text, opts.reviewOrders),
        soldBy: null,
      });
    }

    const sorted = sortPages(labels, opts);
    const orderedIndexes = sorted.map((l) => l.page);

    // Build output PDF
    const targetPdf = await PDFDocument.create();
    let labelCount = 0;
    for (const idx of orderedIndexes) {
      labelCount++;
      await cropPage(sourcePdf, targetPdf, idx, labelCount, opts.picklistInterval);
    }

    const outputBytes = await targetPdf.save();
    const filename = opts.mergeFiles ? "merged-labels.pdf" : "cropped-labels.pdf";

    return new Response(outputBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("label-cropper error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
