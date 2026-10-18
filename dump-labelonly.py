import pymupdf

for f in [
    r"C:\Users\jojo\Downloads\Flipkart Label ( 14-05-2026 ).pdf",
    r"C:\Users\jojo\Downloads\Flipkart Label ( 14-05-2026 ) (1).pdf",
]:
    doc = pymupdf.open(f)
    page = doc[0]
    print(f"===== {f.split(chr(92))[-1]} pages={len(doc)} size={page.rect.width:.0f}x{page.rect.height:.0f} =====")
    for b in sorted(page.get_text("blocks"), key=lambda b: (round(b[1] / 50), b[0])):
        x0, y0, x1, y1, txt = b[0], b[1], b[2], b[3], b[4]
        line = txt.strip().replace("\n", " | ")
        print(f"({x0:5.0f},{y0:5.0f})-({x1:5.0f},{y1:5.0f})  {line[:60]!r}")
    print()
