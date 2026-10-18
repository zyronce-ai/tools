import pymupdf, glob, os

files = [
    r"C:\Users\jojo\Downloads\invoice_labels_1778677632105.pdf",
    r"C:\Users\jojo\Downloads\Flipkart Label (14-05-2026).pdf",
    r"C:\Users\jojo\Downloads\invoice_labels_1778939300468.pdf",
    r"C:\Users\jojo\Downloads\invoice_labels_1778939317242.pdf",
]
for f in files:
    if not os.path.exists(f):
        continue
    print(f"===== {os.path.basename(f)} =====")
    try:
        doc = pymupdf.open(f)
        for pi in range(min(3, len(doc))):
            page = doc[pi]
            boxes = []
            for d in page.get_drawings():
                r = d["rect"]
                if r.width > 100 and r.height > 100:
                    boxes.append((round(r.x0), round(r.y0), round(r.x1), round(r.y1)))
            print(f"  page {pi}: bigBoxes={boxes}")
    except Exception as e:
        print(f"  ERROR {e}")
