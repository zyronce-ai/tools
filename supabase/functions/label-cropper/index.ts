import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  PDFDocument,
  PDFOperator,
  PDFOperatorNames,
  PDFName,
  PDFNumber,
  PDFString,
} from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// A4 page size in points (pdf-lib uses 72 points per inch)
const A4_WIDTH = 595.28;  // 210mm
const A4_HEIGHT = 841.89; // 297mm

// 3x5 inch thermal sticker in points (portrait orientation) — 75mm x 125mm
const LABEL_W = 3 * 72;   // 216 pt
const LABEL_H = 5 * 72;   // 360 pt

// ---------------------------------------------------------------------------
// TEXT PARSING HELPERS - using pdf-lib to extract text content streams
// ---------------------------------------------------------------------------

function extractTextFromPage(page: any): string {
  // pdf-lib doesn't have built-in text extraction, but we can access
  // the raw content stream and decode text operators (Tj, TJ, ')
  const node = page.node;
  if (!node.Contents) return "";

  let text = "";
  const contents = Array.isArray(node.Contents) ? node.Contents : [node.Contents];

  for (const contentRef of contents) {
    try {
      const stream = page.dict.context.lookup(contentRef);
      if (stream && stream.decode) {
        const decoded = stream.decode();
        // Simple text extraction from PDF content stream
        // Matches Tj, TJ, ', " operators with their string operands
        const tjMatches = decoded.match(/\(([^)]+)\)\s*Tj/g);
        const tJMatches = decoded.match(/\[([^\]]+)\]\s*TJ/g);

        if (tjMatches) {
          for (const m of tjMatches) {
            const str = m.match(/\(([^)]+)\)/)?.[1];
            if (str) text += str + " ";
          }
        }
        if (tJMatches) {
          for (const m of tJMatches) {
            const arrMatch = m.match(/\[([^\]]+)\]/);
            if (arrMatch) {
              const parts = arrMatch[1].split(/[\(\)]/).filter(Boolean);
              for (const p of parts) text += p + " ";
            }
          }
        }
      }
    } catch { /* ignore */ }
  }
  return text;
}

function contains(text: string, keywords: string[]): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k.toLowerCase()));
}

function isPlasticOrNpp(text: string): boolean {
  return contains(text, ["npp", "plastic"]);
}

function isLargeParcel(text: string): boolean {
  return contains(text, ["large parcel", "large", "bulk", "oversized", "heavy"]);
}

function isMultiOrder(text: string): boolean {
  return contains(text, ["multi", "multi-order", "combo", "clubbed"]);
}

function getCourier(text: string): string | null {
  const couriers = ["ekart", "delhivery", "bluedart", "shadowfax", "xpressbees", "ecom express", "dtc"];
  const t = text.toLowerCase();
  for (const c of couriers) {
    if (t.includes(c)) return c;
  }
  return null;
}

function extractSoldBy(text: string): string | null {
  // Look for "Sold by: XXX" or "Sold By: XXX" patterns
  const match = text.match(/sold\s+by\s*[:\-]?\s*([^\n\r]+)/i);
  return match ? match[1].trim() : null;
}

function isReviewOrder(text: string, reviewList: string[]): boolean {
  if (!reviewList.length) return false;
  return reviewList.some((id) => {
    const rid = id.trim().toLowerCase();
    if (!rid) return false;
    return text.toLowerCase().includes(rid);
  });
}

function isInvoicePage(text: string): boolean {
  const t = text.toLowerCase().trim();
  // SAFETY: if no text could be extracted, NEVER treat as invoice.
  // (Text extraction from PDFs is unreliable — better to keep a page than lose a label.)
  if (!t) return false;

  // Require a STRONG invoice marker.
  const hasInvoiceMarker = /tax invoice|gst invoice|bill of supply|credit note/.test(t);
  if (!hasInvoiceMarker) return false;

  // SAFETY: if the page ALSO looks like a shipping label, do NOT remove it.
  // Real Flipkart shipping labels contain these; a pure invoice won't.
  const looksLikeLabel = /awb|ship to|shipping address|ekart|delhivery|bluedart|shadowfax|xpressbees|ecom express|pickup|routing|dimensions/.test(t);
  return !looksLikeLabel;
}

// ---------------------------------------------------------------------------
// AUTO-DETECT LABEL REGION
// ---------------------------------------------------------------------------

interface CropRegion {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Known Flipkart label regions (A4 page coordinates, top-left origin)
const KNOWN_LABEL_REGIONS: { name: string; region: CropRegion }[] = [
  { name: "Standard Flipkart (top-left)", region: { left: 190, right: 404, top: 28, bottom: 381 } },
  { name: "Centered label", region: { left: 155, right: 439, top: 50, bottom: 403 } },
  { name: "Full-width label", region: { left: 50, right: 545, top: 100, bottom: 500 } },
  { name: "Bottom label", region: { left: 100, right: 495, top: 400, bottom: 750 } },
];

function detectLabelRegion(page: any): CropRegion {
  const { width: pageW, height: pageH } = page.getSize();

  // If page is already label-sized, return full page
  if (pageW <= LABEL_W + 40 && pageH <= LABEL_H + 40) {
    return { left: 0, right: pageW, top: 0, bottom: pageH };
  }

  // Try to extract text and find "Flipkart" or label keywords to locate region
  // For now, use the first known region as default
  // Future: scan page for visual density / text clusters
  return KNOWN_LABEL_REGIONS[0].region;
}

// ---------------------------------------------------------------------------
// PAGE SORTING
// ---------------------------------------------------------------------------

interface LabelPage {
  page: number;
  text: string;
  courier: string | null;
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
    const kept = pages.filter((p) => !isInvoicePage(p.text));
    // SAFETY CAP: never let invoice detection remove more than half the pages.
    // If it wants to remove more, detection is almost certainly wrong — keep everything.
    if (kept.length >= Math.ceil(pages.length / 2)) {
      pages = kept;
    } else {
      console.warn(`Invoice removal skipped: would drop ${pages.length - kept.length}/${pages.length} pages (unsafe)`);
    }
  }

  // 2. Separate review orders
  const review = pages.filter((p) => p.isReview);
  pages = pages.filter((p) => !p.isReview);

  // 3. Sort courier wise
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
  cropRegion: CropRegion,
  isReviewOrder: boolean = false,
): Promise<void> {
  const source = sourcePdf.getPage(pageIndex);
  const { width: pageW, height: pageH } = source.getSize();

  try {
    if (pageW <= LABEL_W + 40 && pageH <= LABEL_H + 40) {
      // Already label-sized sheet — copy as-is
      const copied = await targetPdf.copyPages(sourcePdf, [pageIndex]);
      targetPdf.addPage(copied[0]);
    } else {
      // Clamp crop region to the actual page bounds so a bad coordinate never
      // produces a blank/invalid embed.
      const left = Math.max(0, Math.min(cropRegion.left, pageW));
      const right = Math.max(left + 1, Math.min(cropRegion.right, pageW));
      const top = Math.max(0, Math.min(cropRegion.top, pageH));
      const bottom = Math.max(top + 1, Math.min(cropRegion.bottom, pageH));

      const embedded = await targetPdf.embedPage(
        source,
        {
          left,
          right,
          bottom: pageH - bottom,
          top: pageH - top,
        },
      );

      const page = targetPdf.addPage([LABEL_W, LABEL_H]);
      const num = (v: number) => PDFNumber.of(v);

      // Padding around the content so nothing touches the sticker edges.
      const PAD = 5; // points of margin on each side (~1.7mm)
      const innerW = LABEL_W - PAD * 2;
      const innerH = LABEL_H - PAD * 2;

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
      page.drawPage(embedded, { x: PAD, y: PAD, width: innerW, height: innerH });

      // If this is a review order, add a small footer line at the bottom
      if (isReviewOrder) {
        const reviewText = "Review Order";
        const fontSize = 8;
        const textWidth = reviewText.length * fontSize * 0.5; // approximate
        const x = (LABEL_W - textWidth) / 2;
        const y = 12; // 12pt from bottom
        page.pushOperators(
          PDFOperator.of(PDFOperatorNames.BeginText),
          PDFOperator.of(PDFOperatorNames.SetFont, [PDFName.of("Helvetica"), PDFNumber.of(fontSize)]),
          PDFOperator.of(PDFOperatorNames.SetTextMatrix, [
            num(1), num(0), num(0), num(1), num(x), num(y)
          ]),
          PDFOperator.of(PDFOperatorNames.ShowText, [PDFString.of(reviewText)]),
          PDFOperator.of(PDFOperatorNames.EndText),
        );
      }

      page.pushOperators(PDFOperator.of(PDFOperatorNames.PopGraphicsState));
    }
  } catch (e) {
    // SAFETY: if cropping fails for any reason, include the ORIGINAL page instead
    // of dropping it — a seller must never lose a shipping label.
    console.error(`Crop failed for page ${pageIndex}, copying original as fallback:`, e);
    try {
      const copied = await targetPdf.copyPages(sourcePdf, [pageIndex]);
      targetPdf.addPage(copied[0]);
    } catch (e2) {
      console.error(`Fallback copy also failed for page ${pageIndex}:`, e2);
      throw new Error(`Page ${pageIndex + 1} could not be processed`);
    }
  }

  // If this page is a review order, add a small footer text at the bottom of the label
  // We get this info from the label data passed via context
  // (For now, we'll add a helper function that the caller can use)
  // The review text is handled by the caller passing a flag

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

    // Guard against oversized uploads (protects the function from OOM).
    const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_FILE_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: "PDF too large (max 25MB). Split it into smaller batches." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (file.type && file.type !== "application/pdf") {
      return new Response(
        JSON.stringify({ success: false, error: "Only PDF files are supported." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const getBool = (key: string) => form.get(key) === "true" || form.get(key) === "on";
    const getNum = (key: string, def: number) => parseInt(String(form.get(key) || String(def)), 10) || def;

    // Read crop region from form (if provided by frontend)
    const cropLeft = getNum("crop_left", 190);
    const cropRight = getNum("crop_right", 404);
    const cropTop = getNum("crop_top", 28);
    const cropBottom = getNum("crop_bottom", 381);
    const autoDetect = getBool("auto_detect_crop");

    const opts = {
      sortPlasticNpp: getBool("sort_plastic_npp"),
      sortSoldBy: getBool("sort_sold_by"),
      largeParcelBottom: getBool("large_parcel_bottom"),
      sortCourier: getBool("sort_courier"),
      keepInvoice: getBool("keep_invoice"),
      mergeFiles: getBool("merge_files"),
      multiOrderBottom: getBool("multi_order_bottom"),
      picklistInterval: getNum("picklist_interval", 0),
      reviewOrders: String(form.get("review_orders") || "").split(/[\n,;]/).map(s => s.trim()).filter(Boolean),
    };

    const bytes = new Uint8Array(await file.arrayBuffer());

    // Load PDF — tolerate encrypted files (many marketplace PDFs are lightly encrypted).
    let sourcePdf: PDFDocument;
    try {
      sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch (loadErr) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not read this PDF. It may be corrupt or password-protected. Try re-downloading the label PDF from Flipkart." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pageCount = sourcePdf.getPageCount();
    if (pageCount === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "This PDF has no pages." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build label metadata with actual text extraction
    const labels: LabelPage[] = [];
    for (let i = 0; i < pageCount; i++) {
      let text = "";
      try {
        text = extractTextFromPage(sourcePdf.getPage(i));
      } catch { /* text extraction is best-effort; empty text is safe */ }
      labels.push({
        page: i,
        text,
        courier: getCourier(text),
        isPlasticNpp: isPlasticOrNpp(text),
        isLarge: isLargeParcel(text),
        isMulti: isMultiOrder(text),
        isReview: isReviewOrder(text, opts.reviewOrders),
        soldBy: extractSoldBy(text),
      });
    }

    const sorted = sortPages(labels, opts);
    const orderedIndexes = sorted.map((l) => l.page);

    // SAFETY VERIFICATION: the output ordering must be a valid subset of input
    // pages with NO duplicates. This catches any accidental page duplication/scramble.
    const seen = new Set<number>();
    for (const idx of orderedIndexes) {
      if (idx < 0 || idx >= pageCount) {
        throw new Error("Internal error: invalid page index in ordering");
      }
      if (seen.has(idx)) {
        throw new Error("Internal error: duplicate page detected in ordering");
      }
      seen.add(idx);
    }
    const removedInvoiceCount = pageCount - orderedIndexes.length;

    // Determine crop region
    let cropRegion: CropRegion = { left: cropLeft, right: cropRight, top: cropTop, bottom: cropBottom };
    if (autoDetect && pageCount > 0) {
      const firstPage = sourcePdf.getPage(0);
      cropRegion = detectLabelRegion(firstPage);
    }

    // Build output PDF
    const targetPdf = await PDFDocument.create();
    let labelCount = 0;
    // Create a set of original page indices that are review orders
    const reviewPageSet = new Set(sorted.filter(l => l.isReview).map(l => l.page));
    for (const idx of orderedIndexes) {
      labelCount++;
      const isReview = reviewPageSet.has(idx);
      await cropPage(sourcePdf, targetPdf, idx, labelCount, opts.picklistInterval, cropRegion, isReview);
    }

    // SAFETY VERIFICATION: every label we intended to keep must be in the output.
    // (Output = labels kept + picklist pages, so it must be >= labels kept.)
    const outputPageCount = targetPdf.getPageCount();
    if (outputPageCount < orderedIndexes.length) {
      throw new Error(`Safety check failed: expected at least ${orderedIndexes.length} labels but got ${outputPageCount}. Aborting to avoid losing a label.`);
    }

    const outputBytes = await targetPdf.save();
    const filename = opts.mergeFiles ? "merged-labels.pdf" : "cropped-labels.pdf";

    return new Response(outputBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Input-Pages": String(pageCount),
        "X-Output-Labels": String(labelCount),
        "X-Removed-Invoices": String(removedInvoiceCount),
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