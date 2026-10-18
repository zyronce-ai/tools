import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
page = doc[0]
pix = page.get_pixmap(dpi=72)
w, h = pix.width, pix.height
print(f"render size: {w}x{h} at 72dpi")
# find bounding box of non-white pixels
minx, miny, maxx, maxy = w, h, -1, -1
samples = pix.samples
n = pix.n
for y in range(h):
    row_has = False
    for x in range(w):
        o = (y * w + x) * n
        # check if pixel is not white
        if not (samples[o] > 240 and samples[o+1] > 240 and samples[o+2] > 240):
            if x < minx: minx = x
            if x > maxx: maxx = x
            row_has = True
    if row_has:
        if y < miny: miny = y
        if y > maxy: maxy = y
print(f"non-white bbox: x {minx}-{maxx}, y {miny}-{maxy}")
print(f"in inches: x {minx/72:.2f}-{maxx/72:.2f}, y {miny/72:.2f}-{maxy/72:.2f}")
