import re, pathlib, sys
B = pathlib.Path(__file__).parent
app = (B/"app.html").read_text()
world = (B/"world.json").read_text().strip()
data = (B/"data_snapshot.json").read_text().strip()
theaters = (B/"theaters.js").read_text()
theaters = re.sub(r'^\s*<script>\s*', '', theaters).rstrip()
iw = (B/"iw.js").read_text().rstrip()
out = app.replace("/*__WORLD__*/", world).replace("/*__DATA__*/", data).replace("/*__THEATERS__*/", theaters).replace("/*__IW__*/", iw)
(B/"index.html").write_text(out)
print("built", len(out), "bytes")
