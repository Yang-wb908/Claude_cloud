/* ---------- 6차: 저장소 실시간 동기화 (GitHub 커넥터, mcp 캐퍼빌리티) ----------
   claude.ai 아티팩트는 외부 fetch가 막혀 있지만, 보는 사람의 GitHub 커넥터로 저장소 파일을 읽을 수 있다.
   data/*.json 을 읽어 시세·사건·트립와이어·RFI·채점·장부·하우스 뷰를 갱신하고 관련 패널을 다시 그린다. */
const SYNC_REFS = ["refs/heads/claude/compassionate-rubin-jmaq9e", "refs/heads/main", "refs/heads/claude/vibrant-euler-j1ibn5"];
const SYNC_FILES = {
  auto: "dashboard/intel.auto.json", latest: "dashboard/data/latest.json", trip: "dashboard/data/tripwires.json", rfi: "dashboard/data/rfi.json",
  score: "dashboard/data/scorecard.json", judg: "dashboard/data/judgments.json", house: "dashboard/data/house_view.json", risk: "dashboard/data/risk.json", pirs: "dashboard/data/pirs.json", watchcon: "dashboard/data/watchcon.json", watchlog: "dashboard/data/watch_log.json", products: "dashboard/data/products_index.json"
};
let syncState = {at: null, ok: {}, err: {}, busy: false, mcp: undefined};
function extractJSON(result){
  const cands = [];
  if (result && result.structuredContent) cands.push(result.structuredContent);
  if (result && typeof result.payload === "object" && result.payload) cands.push(result.payload);
  const strs = [];
  if (typeof result?.payload === "string") strs.push(result.payload);
  (result?.content || []).forEach(b => { if (typeof b.text === "string") strs.push(b.text); if (b.resource && typeof b.resource.text === "string") strs.push(b.resource.text); if (typeof b.blob === "string") { try { strs.push(atob(b.blob)); } catch(e) {} } });
  for (const c of cands) { if (c && typeof c === "object" && (c.content || c.text) && typeof (c.content || c.text) === "string") strs.push(c.encoding === "base64" ? atob((c.content || "").replace(/\n/g, "")) : (c.content || c.text)); else if (c && typeof c === "object" && !Array.isArray(c)) return c; }
  for (const s of strs) { const i = s.indexOf("{"), j = s.lastIndexOf("}"); if (i >= 0 && j > i) { try { return JSON.parse(s.slice(i, j + 1)); } catch(e) {} } }
  return null;
}
async function readRepoFile(mcp, path){
  let lastErr = null;
  for (const ref of SYNC_REFS) {
    try {
      const r = await mcp.callTool("github", "get_file_contents", {owner: "Yang-wb908", repo: "Claude_cloud", path, ref}, {cache: {staleTime: 60000}});
      const j = extractJSON(r); if (j) return j;
      lastErr = {code: "parse", message: "JSON 아님"};
    } catch(e) { lastErr = e; if (e && (e.code === "not_in_manifest" || e.code === "server_not_connected" || e.code === "needs_reauth" || e.code === "not_granted" || e.code === "capability_disabled" || e.code === "blocked_by_policy")) throw e; }
  }
  throw lastErr || {code: "upstream_error", message: "읽기 실패"};
}
const SYNC_COPY = {server_not_connected: "GitHub 커넥터가 연결되어 있지 않습니다. claude.ai 설정 → 커넥터에서 GitHub를 추가하세요.", needs_reauth: "GitHub 커넥터 인증이 만료됐습니다. 설정 → 커넥터에서 다시 연결하세요.",
  not_in_manifest: "이 페이지의 GitHub 접근이 허용되지 않았습니다. 아티팩트 권한 메뉴에서 허용하세요.", not_granted: "커넥터 사용이 허용되지 않았습니다.", capability_disabled: "이 뷰에서는 커넥터를 쓸 수 없습니다.", blocked_by_policy: "조직 정책이 GitHub 도구를 막고 있습니다.", approval_required: "승인이 필요합니다. 다시 눌러 허용하세요."};
async function syncRepo(manual){
  if (syncState.busy) return;
  const btn = $("#syncBtn");
  if (syncState.mcp === undefined) { try { syncState.mcp = window.claude && window.claude.use ? await window.claude.use("mcp") : null; } catch(e) { syncState.mcp = null; } }
  if (!syncState.mcp) { if (btn) { btn.hidden = true; } return; }
  syncState.busy = true; if (btn) { btn.disabled = true; btn.textContent = "동기화 중…"; }
  const got = {}, errs = {};
  for (const [k, path] of Object.entries(SYNC_FILES)) {
    try { got[k] = await readRepoFile(syncState.mcp, path); } catch(e) { errs[k] = e; if (e && SYNC_COPY[e.code] && k === "auto") break; }
  }
  syncState.ok = got; syncState.err = errs; syncState.at = new Date();
  applyLive(got);
  syncState.busy = false;
  const fatal = Object.values(errs).find(e => e && SYNC_COPY[e.code]);
  if (btn) { btn.disabled = false; btn.textContent = fatal ? "동기화 실패" : "동기화 " + syncState.at.toISOString().slice(11, 16) + "Z"; btn.title = fatal ? SYNC_COPY[fatal.code] : Object.keys(got).length + "개 파일 갱신" + (Object.keys(errs).length ? " · 실패: " + Object.keys(errs).join(", ") : ""); }
  if (fatal && manual) { info.innerHTML = `<p><b>동기화 실패.</b> ${esc(SYNC_COPY[fatal.code])}</p>`; statusEl.setAttribute("aria-expanded", "true"); info.hidden = false; }
  if (!fatal && Object.keys(got).length) { try { localStorage.setItem("sit-autosync", "1"); } catch(e) {} }
}
function applyLive(got){
  let eventsChanged = false;
  if (got.auto && got.auto.generated) { AUTO = got.auto; }
  if (got.trip) TRIP_ = got.trip;
  if (got.rfi && Array.isArray(got.rfi)) RFI_ = got.rfi;
  if (got.score && got.score.generated) SCORE_ = got.score;
  if (got.judg && got.judg.items) JUDG_ = got.judg;
  if (got.house && got.house.scenarios) HOUSE_ = got.house;
  if (got.risk && got.risk.index != null) { /* 서버 지수는 참고용: 보드는 자체 계산을 유지하고 서버 값을 메타에 표시 */ window.RISK_SERVER = got.risk; }
  if (got.pirs && got.pirs.items) PIRS_ = got.pirs;
  if (got.watchcon && got.watchcon.theaters) WC_ = got.watchcon;
  if (got.watchlog && got.watchlog.entries) WLOG_ = got.watchlog;
  if (got.products && got.products.products) PROD_ = got.products;
  if (got.latest && Array.isArray(got.latest.events)) {
    const have = new Set(EVENTS.map(e => e.id)), haveS = new Set(EVENTS.map(e => e.s).filter(Boolean));
    got.latest.events.forEach((e, i) => { if (!e.d || !e.x) return; const id = e.id || "l" + i; if (have.has(id) || (e.s && haveS.has(e.s))) return; EVENTS.push({...e, id, lang: e.lang || "ko"}); have.add(id); eventsChanged = true; });
    if (eventsChanged) { EVENTS.forEach(e => { if (e.cm === undefined && typeof tagEvents === "function") e.cm = tagEvents(e); }); const mx = EVENTS.map(e => e.d).sort().pop(); if (mx > REF) REF = mx; }
  }
  try { renderBluf(); } catch(e) { console.warn("bluf", e); }
  if (eventsChanged) { try { renderEventList(); renderTimeline(); renderTheaters(); renderTicker(); dirty = true; needDetail = true; } catch(e) { console.warn("events", e); } }
  try { renderCommod(); renderSources(); } catch(e) { console.warn("cm", e); }
  try { renderBacktest(); renderScenario(); if (typeof renderRisk === "function") { renderRisk(); renderCommod(); } if (typeof renderPIR === "function") { renderPIR(); renderProducts(); renderWatch(); } renderBluf(); } catch(e) { console.warn("an", e); }
  if (MODE !== "live") setStatus("snapshot");
}
(function initSync(){
  const btn = $("#syncBtn"); if (!btn) return;
  btn.addEventListener("click", () => syncRepo(true));
  if (!(window.claude && window.claude.use)) { btn.hidden = true; return; }
  let auto = false; try { auto = localStorage.getItem("sit-autosync") === "1"; } catch(e) {}
  if (auto) setTimeout(() => syncRepo(false), 1500);
})();
