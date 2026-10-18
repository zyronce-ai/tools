import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
page = doc[0]
print("=== raw content (decoded, first 1500 chars) ===")
xref = page.get_contents()[0]
data = doc.xref_stream(xref)
print(data[:1500].decode("latin1"))
print()
print("=== XObject resources ===")
print(doc.xref_object(page.xref_object))
