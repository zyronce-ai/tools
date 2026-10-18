import pymupdf, glob, os

files = glob.glob(r"C:\Users\jojo\Downloads\*label*.pdf") + glob.glob(r"C:\Users\jojo\Downloads\Flipkart*.pdf")
for f in files:
    print(f"\n===== {os.path.basename(f)} =====")
    try:
        doc = pymupdf.open(f)
        for pi in range(len(doc)):
            page = doc[pi]
            boxes = []
            for d in page.get_drawings():
                r = d["rect"]
                if r.width > 100 and r.height > 100:
                    boxes.append((round(r.x0), round(r.y0), round(r.x1), round(r.y1), round(r.width), round(r.height)))
            print(f"  page {pi}: size={page.rect.width:.0f}x{page.rect.height:.0f} bigRects={boxes}")
    except Exception as e:
        print(f"  ERROR {e}")
