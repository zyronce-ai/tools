import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
page = doc[0]
print("page size:", page.rect.width, "x", page.rect.height)
print("=== long lines/drawings ===")
for d in page.get_drawings():
    r = d["rect"]
    if r.width > 100 or r.height > 100:
        print(f"  ({r.x0:6.1f},{r.y0:6.1f})-({r.x1:6.1f},{r.y1:6.1f}) w={r.width:.1f} h={r.height:.1f}")
print("=== label text on cropped page ===")
for b in page.get_text("blocks"):
    x0, y0, x1, y1, txt = b[0], b[1], b[2], b[3], b[4]
    line = txt.strip().replace("\n", " | ")
    print(f"  ({x0:5.1f},{y0:5.1f})-({x1:5.1f},{y1:5.1f})  {line[:60]!r}")
