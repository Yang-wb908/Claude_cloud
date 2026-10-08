import re, pathlib
B = pathlib.Path(__file__).parent
app = (B/"app.html").read_text()
rd = lambda n: (B/n).read_text().strip()
theaters = re.sub(r'^\s*<script>\s*', '', (B/"theaters.js").read_text()).rstrip()
out = (app.replace("/*__WORLD__*/", rd("world.json")).replace("/*__WORLD110__*/", rd("world110.json"))
          .replace("/*__DATA__*/", rd("data_snapshot.json")).replace("/*__THEATERS__*/", theaters)
          .replace("/*__IW__*/", rd("iw.js")).replace("/*__EN__*/", rd("labels_en.js")).replace("/*__INTEL__*/", rd("intel.js")))
(B/"index.html").write_text(out)
print("built", len(out), "bytes")
