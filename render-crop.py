import pymupdf

# Render cropped output
doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
for i in [0, 1]:
    page = doc[i]
    pix = page.get_pixmap(dpi=100)
    pix.save(rf"C:\Users\jojo\AppData\Local\Temp\opencode\crop-page-{i}.png")
    print(f"saved crop-page-{i}.png {pix.width}x{pix.height}")

# Render source page 0 for comparison
src = pymupdf.open(r"C:\Users\jojo\Downloads\invoice_labels_1778677632105.pdf")
page = src[0]
pix = page.get_pixmap(dpi=100)
pix.save(r"C:\Users\jojo\AppData\Local\Temp\opencode\source-page-0.png")
print(f"saved source-page-0.png {pix.width}x{pix.height}")
