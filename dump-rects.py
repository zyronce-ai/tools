import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\Downloads\invoice_labels_1778677632105.pdf")
page = doc[0]
print("=== RECTANGLES / LINES on page 0 ===")
for d in page.get_drawings():
    r = d["rect"]
    if r.width > 150 or r.height > 150:
        print(f"RECT ({r.x0:5.0f},{r.y0:5.0f})-({r.x1:5.0f},{r.y1:5.0f})  w={r.width:.0f} h={r.height:.0f} type={d['type']}")
print("=== all rects larger than 100x100 sorted ===")
for d in page.get_drawings():
    r = d["rect"]
    if r.width > 100 and r.height > 100:
        print(f"RECT ({r.x0:5.0f},{r.y0:5.0f})-({r.x1:5.0f},{r.y1:5.0f})  w={r.width:.0f} h={r.height:.0f}")
