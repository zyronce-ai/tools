import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\live-cropped.pdf")
print("pages:", len(doc))
for i, page in enumerate(doc):
    x0 = y0 = x1 = y1 = None
    for b in page.get_text("blocks"):
        bb = pymupdf.Rect(b[:4])
        if x0 is None:
            x0, y0, x1, y1 = bb.x0, bb.y0, bb.x1, bb.y1
        else:
            x0 = min(x0, bb.x0); y0 = min(y0, bb.y0); x1 = max(x1, bb.x1); y1 = max(y1, bb.y1)
    for d in page.get_drawings():
        r = d["rect"]
        if x0 is None:
            x0, y0, x1, y1 = r.x0, r.y0, r.x1, r.y1
        else:
            x0 = min(x0, r.x0); y0 = min(y0, r.y0); x1 = max(x1, r.x1); y1 = max(y1, r.y1)
    print(f"page {i}: size={page.rect.width:.0f}x{page.rect.height:.0f} content=({x0:.1f},{y0:.1f})-({x1:.1f},{y1:.1f})")
    first = page.get_text("blocks")
    label = " | ".join(b[4].strip().replace("\n", " ") for b in sorted(first, key=lambda b: b[1])[:3])
    print(f"  top text: {label[:90]!r}")
