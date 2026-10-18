import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
page = doc[0]
print("page xref:", page.xref)
print("page dict:")
print(doc.xref_object(page.xref))
