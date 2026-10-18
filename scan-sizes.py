import pymupdf, glob, os

sizes = {}
for f in glob.glob(r"C:\Users\jojo\Downloads\*.pdf"):
    try:
        doc = pymupdf.open(f)
        for pi in range(len(doc)):
            r = doc[pi].rect
            key = (round(r.width), round(r.height))
            sizes.setdefault(key, []).append(os.path.basename(f))
    except Exception:
        pass
for key, files in sorted(sizes.items(), key=lambda kv: -len(kv[1])):
    print(f"{key[0]}x{key[1]} pt ({key[0]/72:.2f}x{key[1]/72:.2f} in): {len(files)} pages, e.g. {files[0]}")
