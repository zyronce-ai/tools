const { PDFDocument, PDFOperator, PDFOperatorNames, PDFNumber } = require("pdf-lib");
const fs = require("fs");

(async () => {
  const bytes = fs.readFileSync("C:\\Users\\jojo\\Downloads\\invoice_labels_1785649104817.pdf");
  const sourcePdf = await PDFDocument.load(bytes);
  const targetPdf = await PDFDocument.create();

  const W = 288, H = 432; // 4x6 portrait canvas
  // Actual label border box on the A4 (verified from real Flipkart PDFs)
  // pymupdf reports top-left origin; pdf-lib uses bottom-left origin.
  const SX = 190, SY_TOP = 28, SX2 = 404, SY_BOTTOM = 381;
  const PAGE_H = 842;

  // Clip operator helpers (W = non-zero winding clip)
  const n = (v) => PDFNumber.of(v);
  const clipRect = [
    PDFOperator.of(PDFOperatorNames.PushGraphicsState),
    PDFOperator.of(PDFOperatorNames.MoveTo, [n(0), n(0)]),
    PDFOperator.of(PDFOperatorNames.LineTo, [n(W), n(0)]),
    PDFOperator.of(PDFOperatorNames.LineTo, [n(W), n(H)]),
    PDFOperator.of(PDFOperatorNames.LineTo, [n(0), n(H)]),
    PDFOperator.of(PDFOperatorNames.ClosePath),
    PDFOperator.of(PDFOperatorNames.ClipNonZero),
    PDFOperator.of(PDFOperatorNames.EndPath),
  ];
  const unclip = [PDFOperator.of(PDFOperatorNames.PopGraphicsState)];

  for (let i = 0; i < sourcePdf.getPageCount(); i++) {
    const srcPage = sourcePdf.getPage(i);
    // Clip embed to the label region (bottom-left origin coords)
    const embedded = await targetPdf.embedPage(srcPage, {
      left: SX,
      right: SX2,
      bottom: PAGE_H - SY_BOTTOM,
      top: PAGE_H - SY_TOP,
    });
    const page = targetPdf.addPage([W, H]);
    page.pushOperators(...clipRect);
    page.drawPage(embedded, { x: 0, y: 0, width: W, height: H });
    page.pushOperators(...unclip);
  }

  const out = await targetPdf.save();
  const outPath = "C:\\Users\\jojo\\AppData\\Local\\Temp\\opencode\\cropped-test.pdf";
  fs.writeFileSync(outPath, out);
  console.log("SAVED:", outPath, out.length, "bytes");
})();
