import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
page = doc[0]
xrefs = page.get_contents()
print("content xrefs:", xrefs)
for xref in xrefs:
    data = doc.xref_stream(xref)
    print("=== stream ===")
    print(data.decode("latin1"))
