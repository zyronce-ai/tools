import pymupdf, os

files = [
    r"C:\Users\jojo\Downloads\invoice_labels_1778677632105.pdf",
    r"C:\Users\jojo\Downloads\invoice_labels_1785649104817.pdf",
    r"C:\Users\jojo\Downloads\Flipkart Label ( 14-05-2026 ).pdf",
    r"C:\Users\jojo\Downloads\Flipkart Label ( 14-05-2026 ) (1).pdf",
    r"C:\Users\jojo\Downloads\invoice_labels_1778939300468.pdf",
    r"C:\Users\jojo\Downloads\invoice_labels_1778939317242.pdf",
]
for f in files:
    if not os.path.exists(f):
        continue
    doc = pymupdf.open(f)
    page = doc[0]
    xs, ys = set(), set()
    for d in page.get_drawings():
        r = d["rect"]
        if abs(r.width - 214) < 5 and abs(r.height) < 5:
            xs.add(round(r.x0)); xs.add(round(r.x1))
        if abs(r.height - 352) < 5 and abs(r.width) < 5:
            ys.add(round(r.y0)); ys.add(round(r.y1))
    print(f"{os.path.basename(f)}: label box X={sorted(xs)} Y={sorted(ys)}")
