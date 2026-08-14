import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  PDFDocument,
  PDFOperator,
  PDFOperatorNames,
  PDFNumber,
} from "https://esm.sh/pdf-lib@1.17.1";

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
  const { width: pageW, height: pageH } = source.getSize();

  // Label box on the A4 sheet, measured from real Flipkart label PDFs.
  // Coordinates are top-left origin (same as pymupdf): the 4x6 shipping label
  // occupies X 190..404, Y 28..381 on the 595x842 A4 sheet.
  const SX = 190, SY_TOP = 28, SX2 = 404, SY_BOTTOM = 381;

  if (pageW <= LABEL_W + 40 && pageH <= LABEL_H + 40) {
    // Already label-sized sheet — copy the page as-is
    const copied = await targetPdf.copyPages(sourcePdf, [pageIndex]);
    targetPdf.addPage(copied[0]);
  } else {
    // Crop the label box onto a fresh 4x6 canvas using embedPage + drawPage
    // (avoids print-rotation issues that setCropBox causes).
    // boundingBox clips the embed to the label region; an explicit clip path
    // keeps nothing outside the canvas so print drivers don't auto-fit the
    // content down to a smaller size.
    const embedded = await targetPdf.embedPage(
      source,
      {
        left: SX,
        right: SX2,
        bottom: pageH - SY_BOTTOM,
        top: pageH - SY_TOP,
      },
    );
    const page = targetPdf.addPage([LABEL_W, LABEL_H]);

    const num = (v: number) => PDFNumber.of(v);
    page.pushOperators(
      PDFOperator.of(PDFOperatorNames.PushGraphicsState),
      PDFOperator.of(PDFOperatorNames.MoveTo, [num(0), num(0)]),
      PDFOperator.of(PDFOperatorNames.LineTo, [num(LABEL_W), num(0)]),
      PDFOperator.of(PDFOperatorNames.LineTo, [num(LABEL_W), num(LABEL_H)]),
      PDFOperator.of(PDFOperatorNames.LineTo, [num(0), num(LABEL_H)]),
      PDFOperator.of(PDFOperatorNames.ClosePath),
      PDFOperator.of(PDFOperatorNames.ClipNonZero),
      PDFOperator.of(PDFOperatorNames.EndPath),
    );
    page.drawPage(embedded, { x: 0, y: 0, width: LABEL_W, height: LABEL_H });
    page.pushOperators(PDFOperator.of(PDFOperatorNames.PopGraphicsState));
  }

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
