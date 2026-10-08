/* ---------- 5차: 시나리오 충격 모델 · 백테스트 · 판단 장부 (analyst.js, build.py가 app.html에 주입) ---------- */
const REPO = "Yang-wb908/Claude_cloud";
const JUDG_ = typeof JUDG === "object" && JUDG ? JUDG : {items: []};
const BT_ = typeof BT === "object" ? BT : null;
const AN_ = typeof ANALOGS === "object" ? ANALOGS : {analogs: [], tripwires: [], method_notes: [], gaps: []};
const SCN_ = typeof SCEN === "object" ? SCEN : {assets: {}, templates: []};
const fmtPct = (v, bp) => v == null ? "—" : (v > 0 ? "+" : "") + (bp ? Math.round(v) + "bp" : (Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1)) + "%");
const signCls = v => v == null ? "" : v > 0.05 ? "up" : v < -0.05 ? "down" : "flat";
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const SC_GROUP_NAME = {macro: "거시·정책", weather: "기상·기후"};
const scGroupName = th => TH[th] ? TH[th].name : (SC_GROUP_NAME[th] || th);
const scGroupSev = th => TH[th] ? TH[th].sev : 3;

/* ----- 상태: 선택·확률·강도. localStorage에 보관 ----- */
const scState = {sel: {}, p: {}, k: {}};
(function initScn(){
  const def = ["hormuz_persist", "redsea_houthi", "blacksea_escalate", "elnino_super", "gulf_hurricane"];
  SCN_.templates.forEach(t => { scState.sel[t.id] = def.includes(t.id); scState.p[t.id] = t.p; scState.k[t.id] = 1; });
  try { const s = JSON.parse(localStorage.getItem("sit-scn") || "null"); if (s) { Object.assign(scState.sel, s.sel || {}); Object.assign(scState.p, s.p || {}); Object.assign(scState.k, s.k || {}); } } catch(e) {}
})();
function scSave(){ try { localStorage.setItem("sit-scn", JSON.stringify(scState)); } catch(e) {} }
function scSelected(){ return SCN_.templates.filter(t => scState.sel[t.id]); }

/* ----- 몬테카를로: 같은 전역의 시나리오는 상호배타, 전역 간 독립. 기저 잡음은 연율 변동성×√(h/252) ----- */
function scRun(N){
  N = N || 3000;
  const sel = scSelected(); if (!sel.length) return null;
  const groups = {};
  sel.forEach(t => (groups[t.th] = groups[t.th] || []).push(t));
  const glist = Object.values(groups).map(list => { let sum = list.reduce((a, t) => a + scState.p[t.id] / 100, 0); const norm = sum > 1 ? 1 / sum : 1; return list.map(t => ({t, p: scState.p[t.id] / 100 * norm, k: scState.k[t.id]})); });
  const H = Math.max(...sel.map(t => t.h));
  const assets = Object.keys(SCN_.assets).filter(a => sel.some(t => t.shocks[a]));
  const sims = Object.fromEntries(assets.map(a => [a, new Float64Array(N)]));
  const expected = Object.fromEntries(assets.map(a => [a, 0]));
  glist.forEach(g => g.forEach(({t, p, k}) => Object.entries(t.shocks).forEach(([a, s]) => { expected[a] += p * k * s.m; })));
  for (let i = 0; i < N; i++) {
    const shock = {};
    glist.forEach(g => { const u = Math.random(); let cum = 0; for (const {t, p, k} of g) { cum += p; if (u < cum) { Object.entries(t.shocks).forEach(([a, s]) => { shock[a] = (shock[a] || 0) + k * (s.m + s.s * gauss()); }); break; } } });
    assets.forEach(a => { const A = SCN_.assets[a]; const noise = A.bp ? 12 * Math.sqrt(H / 20) * gauss() : A.vol * Math.sqrt(H / 252) * gauss(); sims[a][i] = A.bp ? (shock[a] || 0) + noise : Math.max(-95, (shock[a] || 0) + noise); });
  }
  const q = (arr, f) => { const s = Float64Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor(f * s.length))]; };
  const rows = assets.map(a => { const s = sims[a]; return {a, e: expected[a], p5: q(s, .05), p25: q(s, .25), p50: q(s, .5), p75: q(s, .75), p95: q(s, .95), pUp: Array.from(s).filter(x => x > 0).length / N, bp: !!SCN_.assets[a].bp}; });
  rows.sort((x, y) => Math.abs(y.e) - Math.abs(x.e));
  return {rows, H, N, groups: glist};
}

function scCardHtml(t){
  const on = scState.sel[t.id], sev = scGroupSev(t.th);
  return `<div class="scard sev${sev}${on ? " on" : ""}" data-id="${t.id}">
    <input type="checkbox" ${on ? "checked" : ""} aria-label="${esc(t.n)} 선택">
    <div><b>${esc(t.n)}</b> <span class="en">${esc(t.en)}</span><small>${esc(t.d)}</small></div>
    <span class="pv">${scState.p[t.id]}%</span>
    ${on ? `<div class="ctl"><label>확률 <input type="range" min="1" max="99" value="${scState.p[t.id]}" data-k="p"></label>
      <label>강도 <select data-k="k">${[0.5, 1, 1.5, 2].map(k => `<option value="${k}"${scState.k[t.id] == k ? " selected" : ""}>×${k}</option>`).join("")}</select></label>
      <span>지평 ${t.h}일 · 기본 ${t.p}%</span></div>` : ""}
  </div>`;
}
function scTableHtml(res){
  const max = Math.max(5, ...res.rows.map(r => Math.max(Math.abs(r.p5), Math.abs(r.p95)) / (r.bp ? 10 : 1)));
  const pos = v => 50 + 50 * v / max;
  return `<table class="shk"><thead><tr><th>상품</th><th>기대</th><th>중앙값</th><th>P5 ~ P95</th><th>상승</th><th class="bh">분포 ▌중앙값</th></tr></thead><tbody>
    ${res.rows.map(r => { const c = CM_BY[r.a] || {n: r.a}; const sc = r.bp ? 10 : 1; return `<tr data-cm="${r.a}" title="P25 ${fmtPct(r.p25, r.bp)} · P75 ${fmtPct(r.p75, r.bp)}"><td>${esc(c.n)}</td><td class="trend ${signCls(r.e)}">${fmtPct(r.e, r.bp)}</td><td class="trend ${signCls(r.p50)}">${fmtPct(r.p50, r.bp)}</td><td class="rng">${fmtPct(r.p5, r.bp)} ~ ${fmtPct(r.p95, r.bp)}</td><td>${Math.round(r.pUp * 100)}%</td>
      <td><div class="hbar ${r.p50 >= 0 ? "sev5" : "sev1"}" title="P25 ${fmtPct(r.p25, r.bp)} · P75 ${fmtPct(r.p75, r.bp)}"><i style="left:${pos(Math.min(r.p5, r.p95) / sc)}%;width:${Math.max(1, (Math.abs(r.p95 - r.p5)) / sc / max * 50)}%"></i><b style="left:${pos(r.p50 / sc)}%"></b><s style="left:50%"></s></div></td></tr>`; }).join("")}
  </tbody></table>`;
}
function scMarkdown(res){
  const sel = scSelected();
  const L = [`## 시나리오 충격 평가 (${REF} 기준, ${res.N}회 시뮬레이션, 지평 ${res.H}일)`, "", "| 시나리오 | 전역 | 확률 | 강도 |", "|---|---|---|---|"];
  sel.forEach(t => L.push(`| ${t.n} | ${scGroupName(t.th)} | ${scState.p[t.id]}% | ×${scState.k[t.id]} |`));
  L.push("", "| 상품 | 기대 변동 | P5 | 중앙값 | P95 | 상승 확률 |", "|---|---|---|---|---|---|");
  res.rows.forEach(r => L.push(`| ${(CM_BY[r.a] || {n: r.a}).n} | ${fmtPct(r.e, r.bp)} | ${fmtPct(r.p5, r.bp)} | ${fmtPct(r.p50, r.bp)} | ${fmtPct(r.p95, r.bp)} | ${Math.round(r.pUp * 100)}% |`));
  L.push("", "### 한국 영향"); sel.forEach(t => L.push(`- **${t.n}**: ${t.korea}`));
  L.push("", "### 감시 지표"); sel.forEach(t => (t.watch || []).forEach(w => L.push(`- [${t.n}] ${w}`)));
  L.push("", `_세계 상황판 시나리오 모듈 · ${SCN_.asof} 템플릿_`);
  return L.join("\n");
}
let scLast = null;
function renderScenario(){
  const res = scRun(); scLast = res;
  const sel = scSelected();
  const byTh = {}; SCN_.templates.forEach(t => (byTh[t.th] = byTh[t.th] || []).push(t));
  const order = Object.keys(byTh).sort((a, b) => scGroupSev(b) - scGroupSev(a));
  const issueUrl = `https://github.com/${REPO}/issues/new?template=scenario.yml&labels=scenario&title=${encodeURIComponent("[시나리오] " + sel.map(t => t.n).join(" + "))}&scenarios=${encodeURIComponent(sel.map(t => `${t.id}:${scState.p[t.id]}:${scState.k[t.id]}`).join(","))}`;
  $("#p-scn").innerHTML = `
    <div class="block"><h3>시나리오 충격 모델 <span class="en">Scenario shock model</span></h3><span class="meta">템플릿 ${SCN_.templates.length}개 · 같은 전역 안에서는 상호배타, 전역 간 독립 · 몬테카를로 3,000회 · 기저 잡음 = 연율 변동성×√(지평/252)</span>
      <p class="note">확률·강도를 조정하면 상품별 기대 변동과 분포가 다시 계산됩니다. 조건부 충격(발생 시 평균·표준편차)은 분석관 판단값이며, 과거 사례 탭의 실측 분포와 대조하세요.</p>
      <div class="btnrow"><button class="btn" id="scRerun">다시 추출</button><button class="btn ghost" id="scReset">기본값</button><button class="btn ghost" id="scCopy">Markdown 복사</button><a class="btn ghost" href="${issueUrl}" target="_blank" rel="noopener">GitHub Issue로 제출</a><button class="btn ghost" id="scAsk">분석관에게 넘기기</button></div></div>
    <div class="block"><h3>결과: 확률 가중 충격 <span class="en">${sel.length} scenarios · horizon ${res ? res.H : 0}d</span></h3>
      ${res ? scTableHtml(res) : '<p class="note">시나리오를 하나 이상 선택하세요.</p>'}
      <p class="note">기대 변동 = Σ 확률×강도×조건부 평균. 분포는 시나리오 발생 여부와 조건부 충격, 기저 잡음을 함께 추출한 결과입니다. 금리는 bp, VIX는 지수 변화율입니다.</p></div>
    <div class="block"><h3>시나리오 선택</h3>
      ${order.map(th => `<div class="scgroup"><div class="sch sev${scGroupSev(th)}"><span class="dot"></span>${esc(scGroupName(th))}</div>${byTh[th].map(scCardHtml).join("")}</div>`).join("")}</div>
    ${sel.length ? `<div class="block"><h3>선택 시나리오 상세</h3>${sel.map(t => `<div class="scdet"><b>${esc(t.n)}</b> <span class="meta">${esc(scGroupName(t.th))} · ${scState.p[t.id]}% · ×${scState.k[t.id]}</span>
      <div class="kv"><span>한국 영향</span><span>${esc(t.korea)}</span></div>
      ${t.watch && t.watch.length ? `<div class="kv"><span>감시 지표</span><span>${t.watch.map(esc).join(" · ")}</span></div>` : ""}
      ${t.tripwires && t.tripwires.length ? `<div class="kv"><span>트립와이어</span><span>${t.tripwires.map(id => `<code>${esc(id)}</code>`).join(" ")}</span></div>` : ""}
      ${t.analogs && t.analogs.length ? `<div class="kv"><span>과거 사례</span><span>${t.analogs.map(id => { const a = AN_.analogs.find(x => x.id === id); return `<button class="thchip" data-analog="${esc(id)}">${esc(a ? a.n : id)}</button>`; }).join(" ")}</span></div>` : ""}
      <div class="kv"><span>조건부 충격</span><span>${Object.entries(t.shocks).sort((x, y) => Math.abs(y[1].m) - Math.abs(x[1].m)).map(([a, s]) => `${esc((CM_BY[a] || {n: a}).n)} <b class="trend ${signCls(s.m)}">${fmtPct(s.m, SCN_.assets[a] && SCN_.assets[a].bp)}</b>±${s.s}`).join(" · ")}</span></div>
    </div>`).join("")}</div>` : ""}`;
  const pane = $("#p-scn");
  pane.querySelectorAll(".scard input[type=checkbox]").forEach(cb => cb.addEventListener("change", e => { const id = e.target.closest(".scard").dataset.id; scState.sel[id] = e.target.checked; scSave(); renderScenario(); }));
  pane.querySelectorAll(".scard input[type=range]").forEach(r => { r.addEventListener("input", e => { const id = e.target.closest(".scard").dataset.id; scState.p[id] = +e.target.value; e.target.closest(".scard").querySelector(".pv").textContent = e.target.value + "%"; }); r.addEventListener("change", () => { scSave(); renderScenario(); }); });
  pane.querySelectorAll(".scard select").forEach(s => s.addEventListener("change", e => { const id = e.target.closest(".scard").dataset.id; scState.k[id] = +e.target.value; scSave(); renderScenario(); }));
  $("#scRerun").addEventListener("click", renderScenario);
  $("#scReset").addEventListener("click", () => { try { localStorage.removeItem("sit-scn"); } catch(e) {} SCN_.templates.forEach(t => { scState.p[t.id] = t.p; scState.k[t.id] = 1; scState.sel[t.id] = ["hormuz_persist", "redsea_houthi", "blacksea_escalate", "elnino_super", "gulf_hurricane"].includes(t.id); }); renderScenario(); });
  $("#scCopy").addEventListener("click", () => { if (!scLast) return; const md = scMarkdown(scLast); (navigator.clipboard ? navigator.clipboard.writeText(md) : Promise.reject()).then(() => { $("#scCopy").textContent = "복사됨"; setTimeout(() => $("#scCopy").textContent = "Markdown 복사", 1500); }).catch(() => { prompt("복사하세요", md); }); });
  $("#scAsk").addEventListener("click", () => { if (!scLast) return; $("#q").value = "아래 시나리오 평가를 검토해줘. 조건부 충격 가정 중 과거 사례와 어긋나는 것, 빠진 전파 경로, 한국 포지션 관점의 비대칭 기회를 짚어줘.\n\n" + scMarkdown(scLast).slice(0, 1800); setTab("p-ai"); $("#q").focus(); });
  pane.querySelectorAll("[data-analog]").forEach(b => b.addEventListener("click", () => { btState.focus = b.dataset.analog; setTab("p-bt"); renderBacktest(); }));
  pane.querySelectorAll("tr[data-cm]").forEach(tr => tr.addEventListener("click", () => { if (typeof cmSel !== "undefined") { cmSel = tr.dataset.cm; setTab("p-cm"); renderCommod(); } }));
}

/* ----- 백테스트: 과거 사례 · 트립와이어 · 실현 사건 연구 · 판단 장부 ----- */
const btState = {asset: "brent", cat: "all", focus: null, lf: "open"};
const AN_ASSETS = [["brent", "브렌트"], ["wti", "WTI"], ["ttf", "TTF/가스"], ["gold", "금"], ["wheat", "밀"], ["corn", "옥수수"], ["dxy", "달러"], ["vix", "VIX"], ["bdi", "BDI"], ["sp500", "S&P"], ["us10y", "미 10년(bp)"], ["kospi", "코스피"], ["krw", "원/달러"]];
const AN_CATS = {all: "전체", hormuz: "호르무즈·걸프", redsea: "홍해·수에즈", blacksea: "흑해·곡물", taiwan: "대만·동아시아", korea: "한반도", financial: "금융", pandemic: "팬데믹", opec: "OPEC", weather: "기상", tariff: "관세", other: "기타"};
const judgLocal = (() => { try { return JSON.parse(localStorage.getItem("sit-judg") || "{}"); } catch(e) { return {}; } })();
function judgItems(){ return JUDG_.items.map(j => Object.assign({}, j, judgLocal[j.id] || {})); }
function judgStats(items){
  const res = items.filter(j => j.outcome === 1 || j.outcome === 0 || j.outcome === true || j.outcome === false).map(j => ({p: j.p, o: j.outcome === 1 || j.outcome === true ? 1 : 0}));
  const bins = [0, 20, 40, 60, 80].map(lo => { const b = res.filter(r => r.p * 100 >= lo && (r.p * 100 < lo + 20 || (lo === 80 && r.p === 1))); return {lo, n: b.length, pred: b.length ? b.reduce((a, r) => a + r.p, 0) / b.length : null, obs: b.length ? b.reduce((a, r) => a + r.o, 0) / b.length : null}; });
  return {n: items.length, resolved: res.length, brier: res.length ? res.reduce((a, r) => a + (r.p - r.o) ** 2, 0) / res.length : null, base: res.length ? res.reduce((a, r) => a + r.o, 0) / res.length : null, bins,
    overdue: items.filter(j => j.outcome == null && j.due && j.due < REF).length};
}
function anCell(v, bp){ return `<td class="trend ${signCls(v)}">${fmtPct(v, bp)}</td>`; }
function renderBacktest(){
  const asset = btState.asset, bp = asset === "us10y";
  const rows = AN_.analogs.filter(a => btState.cat === "all" || a.cat === btState.cat).sort((x, y) => y.date.localeCompare(x.date));
  const get = (a, h) => a.moves && a.moves[asset] ? a.moves[asset]["d" + h] : null;
  const med = h => { const v = rows.map(a => get(a, h)).filter(x => x != null).sort((x, y) => x - y); return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : null; };
  const up = h => { const v = rows.map(a => get(a, h)).filter(x => x != null); return v.length ? Math.round(100 * v.filter(x => x > 0).length / v.length) + "%" : "—"; };
  const selAnalogs = new Set([].concat(...scSelected().map(t => t.analogs || [])));
  const maxAbs = Math.max(1, ...rows.map(a => Math.abs(get(a, 20) || 0)));
  const items = judgItems();
  const st = judgStats(items);
  const lf = btState.lf;
  const list = items.filter(j => lf === "all" || (lf === "open" && j.outcome == null) || (lf === "done" && j.outcome != null) || (lf === "over" && j.outcome == null && j.due && j.due < REF)).sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  const changed = Object.entries(judgLocal).filter(([id, v]) => v.outcome !== undefined);
  const judgIssue = `https://github.com/${REPO}/issues/new?template=judgment.yml&labels=judgment&title=${encodeURIComponent("[판정] " + changed.length + "건")}&items=${encodeURIComponent(JSON.stringify(changed.map(([id, v]) => ({id, outcome: v.outcome, note: v.note || ""}))))}`;
  const tb = BT_ && BT_.tripwires && BT_.tripwires.length ? BT_.tripwires : null;
  $("#p-bt").innerHTML = `
    <div class="block"><h3>과거 사례 라이브러리 <span class="en">Event-study analogs</span></h3><span class="meta">${AN_.analogs.length}개 사건 · 사건 전일 종가 대비 변동률 · 금리는 bp</span>
      <div class="btnrow"><div class="seg" id="anAsset">${AN_ASSETS.map(([k, n]) => `<button data-k="${k}" aria-pressed="${k === asset}">${n}</button>`).join("")}</div></div>
      <div class="tchips" id="anCat">${Object.entries(AN_CATS).map(([k, n]) => `<button class="chip" aria-pressed="${k === btState.cat}" data-k="${k}">${n}</button>`).join("")}</div>
      ${rows.length ? `<table class="shk"><thead><tr><th>사건</th><th>+1일</th><th>+5일</th><th>+20일</th><th>+60일</th><th class="bh">+20일</th></tr></thead><tbody>
        ${rows.map(a => { const v20 = get(a, 20); return `<tr class="${selAnalogs.has(a.id) ? "match" : ""}${btState.focus === a.id ? " focus" : ""}" data-id="${esc(a.id)}"><td><b>${esc(a.n)}</b> <span class="meta">${esc(a.date)}</span>${selAnalogs.has(a.id) ? ' <span class="tag">시나리오 매칭</span>' : ""}<small>${esc(a.x || "")}${a.src ? ` <a href="${esc(a.src)}" target="_blank" rel="noopener">출처</a>` : ""}</small></td>${anCell(get(a, 1), bp)}${anCell(get(a, 5), bp)}${anCell(get(a, 20), bp)}${anCell(get(a, 60), bp)}
          <td><div class="hbar ${(v20 || 0) >= 0 ? "sev5" : "sev1"}"><i style="left:${v20 == null ? 50 : 50 + Math.min(0, v20) / maxAbs * 50}%;width:${v20 == null ? 0 : Math.abs(v20) / maxAbs * 50}%"></i><s style="left:50%"></s></div></td></tr>`; }).join("")}
        <tr class="sum"><td>중앙값 (${rows.length}건)</td>${anCell(med(1), bp)}${anCell(med(5), bp)}${anCell(med(20), bp)}${anCell(med(60), bp)}<td></td></tr>
        <tr class="sum"><td>상승 비율</td><td>${up(1)}</td><td>${up(5)}</td><td>${up(20)}</td><td>${up(60)}</td><td></td></tr></tbody></table>` : '<p class="note">과거 사례 데이터가 아직 없습니다. 조사 에이전트 산출이 analogs.js에 병합되면 표시됩니다.</p>'}
      ${AN_.method_notes && AN_.method_notes.length ? `<ul class="wl">${AN_.method_notes.map(n => `<li><small>${esc(n)}</small></li>`).join("")}</ul>` : ""}</div>
    <div class="block"><h3>트립와이어 백테스트 <span class="en">Tripwire hit history</span></h3>
      ${tb ? `<span class="meta">시계열 ${Object.keys(BT_.series || {}).length}개 · ${esc(BT_.generated || "")}</span><table class="shk"><thead><tr><th>트립와이어</th><th>과거 발동</th><th>자기 +60일</th><th>브렌트 +60일</th><th>S&P +60일</th><th>현재</th></tr></thead><tbody>
        ${tb.map(t => `<tr><td>${esc(t.title)}<small>${t.rows.slice(-4).map(r => r.d).join(", ")}</small></td><td>${t.episodes}</td>${anCell(t.median_self_60)}${anCell(t.median_brent_60)}${anCell(t.median_spx_60)}<td>${t.active_now ? '<span class="tag hot">발동 중</span>' : "—"}</td></tr>`).join("")}</tbody></table>`
        : `<p class="note">저장소의 주간 백테스트(GitHub Actions)가 2년 일봉 시계열을 받아 임계치 돌파 이력을 계산하면 여기에 채워집니다.</p>`}
      ${AN_.tripwires && AN_.tripwires.length ? `<table class="shk"><thead><tr><th>신호 (장기 사례)</th><th>기간</th><th>브렌트 +60일</th><th>밀 +60일</th><th>S&P +60일</th></tr></thead><tbody>
        ${AN_.tripwires.map(t => `<tr><td>${esc(t.signal)}<small>${esc(t.note || "")}${t.src ? ` <a href="${esc(t.src)}" target="_blank" rel="noopener">출처</a>` : ""}</small></td><td>${esc(t.episode_start || "")}${t.episode_end ? " ~ " + esc(t.episode_end) : ""}</td>${anCell(t.brent_60d)}${anCell(t.wheat_60d)}${anCell(t.spx_60d)}</tr>`).join("")}</tbody></table>` : ""}</div>
    <div class="block"><h3>실현 사건 연구 <span class="en">Realized event study</span></h3>
      ${BT_ && BT_.events && BT_.events.n ? `<span class="meta">상황판 고경보 전역의 타격·해상 사건 ${BT_.events.n}건 이후 실측 변동</span><table class="shk"><thead><tr><th>자산</th><th>+1일 중앙값</th><th>+5일</th><th>+20일</th><th>+60일</th><th>20일 상승 비율</th></tr></thead><tbody>
        ${Object.entries(BT_.events.summary).map(([k, v]) => `<tr><td>${esc(k)}</td>${anCell(v.d1.median)}${anCell(v.d5.median)}${anCell(v.d20.median)}${anCell(v.d60.median)}<td>${v.d20.hit_up == null ? "—" : Math.round(v.d20.hit_up * 100) + "%"}</td></tr>`).join("")}</tbody></table>`
        : `<p class="note">상황판이 기록한 사건(경보 4 이상 전역의 타격·해상 사건)에 대해 실제 시세가 어떻게 움직였는지 계산합니다. 주간 백테스트 실행 후 채워집니다.</p>`}</div>
    <div class="block"><h3>판단 장부 <span class="en">Judgment ledger · calibration</span></h3>
      <span class="meta">${st.n}건 · 판정 ${st.resolved}건 · Brier ${st.brier == null ? "—" : st.brier.toFixed(3)} · 기저율 ${st.base == null ? "—" : Math.round(st.base * 100) + "%"} · 기한 경과 미판정 ${st.overdue}건${changed.length ? ` · <b>로컬 판정 ${changed.length}건 미제출</b>` : ""}</span>
      <div class="calib">${st.bins.map(b => `<div><div class="col" title="예측 ${b.pred == null ? "—" : Math.round(b.pred * 100) + "%"} · 실제 ${b.obs == null ? "—" : Math.round(b.obs * 100) + "%"} (${b.n}건)"><i style="height:${b.pred == null ? 0 : b.pred * 100}%"></i><b style="height:${b.obs == null ? 0 : b.obs * 100}%"></b></div>${b.lo}–${b.lo + 20}%<br><small>${b.n}건</small></div>`).join("")}</div>
      <p class="note">왼쪽 막대는 예측 확률 평균, 오른쪽은 실제 적중률입니다. 완벽히 보정된 분석관은 두 막대 높이가 같습니다. Brier 0.25는 동전 던지기, 0.10 이하가 숙련 수준입니다.</p>
      <div class="btnrow"><div class="seg" id="lfSeg">${[["open", "미판정"], ["over", "기한 경과"], ["done", "판정"], ["all", "전체"]].map(([k, n]) => `<button data-k="${k}" aria-pressed="${k === lf}">${n}</button>`).join("")}</div>
        <button class="btn ghost" id="jExport">JSON 내보내기</button>${changed.length ? `<a class="btn ghost" href="${judgIssue}" target="_blank" rel="noopener">판정 ${changed.length}건 Issue로 제출</a>` : ""}</div>
      <ul class="wl ledger">${list.map(j => `<li data-id="${esc(j.id)}"><div class="jh">${(j.th || []).map(th => TH[th] ? `<button class="thchip sev${TH[th].sev}" data-th="${th}">${esc(TH[th].name)}</button>` : "").join("")}${j.cm ? `<span class="tag">${esc(j.cm)}</span>` : ""}<span class="p">${Math.round(j.p * 100)}%</span><span class="meta">${esc(j.d)} → ${esc(j.due || "")}${j.due && j.due < REF && j.outcome == null ? ' <span class="tag hot">기한 경과</span>' : ""}</span></div>
        <div>${esc(j.x)}</div>
        <div class="jbtns"><button class="jbtn" data-o="1" aria-pressed="${j.outcome === 1 || j.outcome === true}">적중</button><button class="jbtn" data-o="0" aria-pressed="${j.outcome === 0 || j.outcome === false}">빗나감</button><button class="jbtn" data-o="x" aria-pressed="${j.outcome == null}">미정</button>${j.note ? `<small>${esc(j.note)}</small>` : ""}</div></li>`).join("")}</ul>
      ${!list.length ? '<p class="note">해당 항목이 없습니다.</p>' : ""}</div>`;
  const pane = $("#p-bt");
  pane.querySelectorAll("#anAsset button").forEach(b => b.addEventListener("click", () => { btState.asset = b.dataset.k; renderBacktest(); }));
  pane.querySelectorAll("#anCat button").forEach(b => b.addEventListener("click", () => { btState.cat = b.dataset.k; renderBacktest(); }));
  pane.querySelectorAll("#lfSeg button").forEach(b => b.addEventListener("click", () => { btState.lf = b.dataset.k; renderBacktest(); }));
  pane.querySelectorAll(".jbtn").forEach(b => b.addEventListener("click", () => { const id = b.closest("li").dataset.id; const o = b.dataset.o; const note = o === "x" ? "" : (prompt("판정 근거(선택)", (judgLocal[id] || {}).note || "") || "");
    judgLocal[id] = {outcome: o === "x" ? null : +o, note, resolved: REF}; try { localStorage.setItem("sit-judg", JSON.stringify(judgLocal)); } catch(e) {} renderBacktest(); }));
  const ex = $("#jExport"); if (ex) ex.addEventListener("click", () => { const blob = new Blob([JSON.stringify({asof: REF, items: judgItems()}, null, 1)], {type: "application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "judgments-" + REF + ".json"; a.click(); });
  pane.querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => { if (typeof select === "function") select(b.dataset.th); }));
  const f = pane.querySelector("tr.focus"); if (f) f.scrollIntoView({block: "center"});
}

/* ----- 저장소 활동 (GitHub Pages에서 열었을 때만 api.github.com 조회) ----- */
async function repoActivity(){
  if (!/github\.io$/.test(location.hostname)) return;
  const box = document.createElement("div"); box.className = "block"; box.innerHTML = "<h3>저장소 활동 <span class='en'>live</span></h3><p class='note'>불러오는 중…</p>"; $("#p-src").appendChild(box);
  try {
    const [iss, com] = await Promise.all([fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=20`).then(r => r.json()), fetch(`https://api.github.com/repos/${REPO}/commits?per_page=8`).then(r => r.json())]);
    box.innerHTML = `<h3>저장소 활동 <span class="en">live</span></h3><ul class="wl">${(iss || []).filter(i => !i.pull_request).map(i => `<li><a href="${esc(i.html_url)}" target="_blank" rel="noopener">#${i.number} ${esc(i.title)}</a> <small>${(i.labels || []).map(l => esc(l.name)).join(", ")} · ${esc(i.created_at.slice(0, 10))}</small></li>`).join("") || "<li>열린 이슈 없음</li>"}</ul>
      <ul class="wl">${(com || []).map(c => `<li><a href="${esc(c.html_url)}" target="_blank" rel="noopener">${esc(c.sha.slice(0, 7))}</a> ${esc((c.commit.message || "").split("\n")[0].slice(0, 90))} <small>${esc(c.commit.author.date.slice(0, 16).replace("T", " "))}Z</small></li>`).join("")}</ul>`;
  } catch(e) { box.querySelector(".note").textContent = "GitHub API를 불러오지 못했습니다."; }
}
