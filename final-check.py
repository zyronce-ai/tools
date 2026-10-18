import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\live-cropped.pdf")
page = doc[0]
print("MediaBox:", page.mediabox, " CropBox:", page.cropbox)
pix = page.get_pixmap(dpi=72)
w, h = pix.width, pix.height
samples = pix.samples
n = pix.n
minx, miny, maxx, maxy = w, h, -1, -1
for y in range(h):
    for x in range(w):
        o = (y * w + x) * n
        if not (samples[o] > 240 and samples[o+1] > 240 and samples[o+2] > 240):
            if x < minx: minx = x
            if x > maxx: maxx = x
            if y < miny: miny = y
            if y > maxy: maxy = y
print(f"page size: {w}x{h}px @72dpi = {w/72:.2f}in x {h/72:.2f}in")
print(f"content: x {minx}-{maxx} y {miny}-{maxy}")
print(f"in inches: x {minx/72:.2f}-{maxx/72:.2f} y {miny/72:.2f}-{maxy/72:.2f}")
