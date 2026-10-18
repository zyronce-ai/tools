import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\Downloads\invoice_labels_1778677632105.pdf")
for pi in range(min(2, len(doc))):
    page = doc[pi]
    print(f"=== PAGE {pi} ===")
    blocks = sorted(page.get_text("blocks"), key=lambda b: (round(b[1] / 50), b[0]))
    for b in blocks:
        x0, y0, x1, y1, txt = b[0], b[1], b[2], b[3], b[4]
        line = txt.strip().replace("\n", " | ")
        print(f"({x0:5.0f},{y0:5.0f})-({x1:5.0f},{y1:5.0f})  {line[:70]!r}")
