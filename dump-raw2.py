import pymupdf

doc = pymupdf.open(r"C:\Users\jojo\AppData\Local\Temp\opencode\cropped-test.pdf")
page = doc[0]
print("content xrefs:", page.get_contents())
for xref in page.get_contents():
    data = doc.xref_stream(xref)
    print(f"=== stream {xref} ({len(data)} bytes) ===")
    print(data.decode("latin1")[:800])
