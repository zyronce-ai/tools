import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\live-cropped.pdf")
page = doc[0]
print("page size:", page.rect.width, "x", page.rect.height)
for d in page.get_drawings():
    r = d["rect"]
    if r.width > 200 or r.height > 200:
        print(f"  ({r.x0:6.1f},{r.y0:6.1f})-({r.x1:6.1f},{r.y1:6.1f}) w={r.width:.1f} h={r.height:.1f}")
