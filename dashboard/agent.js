/* ---------- 6차: 페이퍼 북 · ACH 매트릭스 · 전역 검색 · 에이전트 분석관 (agent.js) ---------- */
let BOOK_ = typeof BOOK === "object" ? BOOK : null;
const ACH_ = typeof ACH === "object" ? ACH : {questions: [], weights: {}};

/* ----- 페이퍼 북 ----- */
function bookItems(){ return BOOK_ && BOOK_.items ? BOOK_.items : []; }
function renderBook(){
  const items = bookItems(), s = (BOOK_ && BOOK_.summary) || null;
  const open = items.filter(t => t.status === "open"), closed = items.filter(t => t.status === "closed");
  const pnlCls = v => v == null ? "" : v > 0 ? "up" : v < 0 ? "down" : "flat";
  const tile = (l, v, sub, cls) => `<div class="sct ${cls || ""}"><span class="l">${l}</span><span class="v">${v}</span><small>${sub}</small></div>`;
  const row = t => { const scn = (t.scn || []).map(id => { const x = SCN_.templates.find(z => z.id === id); return x ? `<span class="tag" title="${esc(x.n)}">${esc(x.n.slice(0, 10))}</span>` : `<span class="tag">${esc(id)}</span>`; }).join(" ");
    const prog = t.stop_dist != null && t.target_dist != null ? `<div class="hbar ${(t.pnl || 0) >= 0 ? "sev1" : "sev5"}" title="손절까지 ${fmtPct(t.stop_dist, t.bp)} · 목표까지 ${fmtPct(t.target_dist, t.bp)}"><i style="left:${Math.max(0, Math.min(100, 50 + 50 * (t.pnl_raw || 0) / Math.max(1, Math.abs(t.target_dist || 1) + Math.abs(t.pnl_raw || 0))))}%;width:2px;background:var(--ink)"></i><s style="left:50%"></s></div>` : "";
    return `<tr><td><b>${esc(t.id)}</b> ${esc((CM_BY[t.cm] || {n: t.cm}).n)} <span class="tag ${t.side === "short" ? "hot" : ""}">${t.side === "short" ? "숏" : "롱"}</span>${t.size && t.size !== 1 ? ` ×${t.size}` : ""}<small class="clamp" title="${esc(t.thesis || "")}">${esc(t.thesis || "")}</small><small>${scn} ${esc(t.d)}${t.auto_closed ? ` · <span class="tag hot">${t.auto_closed === "stop" ? "손절 자동종료" : "목표 자동종료"}</span>` : ""}</small></td>
      <td>${t.entry != null ? t.entry : "—"}</td><td>${t.status === "closed" ? (t.exit != null ? t.exit : "—") : (t.last != null ? t.last : "—")}</td><td class="trend ${pnlCls(t.pnl)}">${t.pnl != null ? fmtPct(t.pnl, false) : "<small>미평가</small>"}</td><td>${prog}</td></tr>`; };
  const attrib = BOOK_ && BOOK_.attribution ? Object.entries(BOOK_.attribution).sort((a, b) => Math.abs(b[1].pnl) - Math.abs(a[1].pnl)) : [];
  $("#p-book").innerHTML = `
    <div class="block"><h3>페이퍼 북 <span class="en">Paper book · ${esc((BOOK_ && BOOK_.generated) ? BOOK_.generated.slice(0, 10) : (BOOK_ && BOOK_.asof) || "")}</span></h3>
      <span class="meta">판단을 가격으로 번역한 가상 포지션. 실제 주문이 아니며, 일일 동기화가 종가로 시가평가하고 손절·목표 도달 시 자동 종료합니다.</span>
      <div class="sctiles">${tile("열린 포지션", open.length, s ? `미평가 ${s.unmarked}` : "시가평가 전", "")}${tile("열린 P&L", s && s.open_pnl != null ? fmtPct(s.open_pnl, false) : "—", "단위 가중 합", s ? (s.open_pnl > 0 ? "good" : s.open_pnl < 0 ? "bad" : "") : "")}${tile("닫힌 P&L", s && s.closed_pnl != null ? fmtPct(s.closed_pnl, false) : "—", `${closed.length}건`, s ? (s.closed_pnl > 0 ? "good" : s.closed_pnl < 0 ? "bad" : "") : "")}${tile("적중률", s && s.hit_rate != null ? pct0(s.hit_rate) : "—", s && s.avg_win != null ? `평균 +${s.avg_win} / ${s.avg_loss}` : "닫힌 포지션 없음", s && s.hit_rate != null ? (s.hit_rate >= 0.55 ? "good" : "mid") : "")}</div>
      <div class="btnrow"><a class="btn ghost" href="https://github.com/${REPO}/issues/new?template=trade.yml&labels=trade" target="_blank" rel="noopener">포지션 개시 Issue</a><button class="btn ghost" id="bookAsk">분석관 점검 요청</button></div></div>
    <div class="block"><h3>열린 포지션 (${open.length})</h3>${open.length ? `<table class="shk"><thead><tr><th>포지션</th><th>진입</th><th>현재</th><th>P&L</th><th class="bh">손절 ↔ 목표</th></tr></thead><tbody>${open.map(row).join("")}</tbody></table>` : '<p class="note">열린 포지션이 없습니다.</p>'}</div>
    ${closed.length ? `<div class="block"><h3>닫힌 포지션 (${closed.length})</h3><table class="shk"><thead><tr><th>포지션</th><th>진입</th><th>종료</th><th>P&L</th><th></th></tr></thead><tbody>${closed.map(row).join("")}</tbody></table></div>` : ""}
    ${attrib.length ? `<div class="block"><h3>시나리오별 귀속</h3><table class="shk"><thead><tr><th>시나리오</th><th>n</th><th>P&L 합</th></tr></thead><tbody>${attrib.map(([id, v]) => { const x = SCN_.templates.find(z => z.id === id); return `<tr><td>${esc(x ? x.n : id)}</td><td>${v.n}</td><td class="trend ${pnlCls(v.pnl)}">${fmtPct(v.pnl, false)}</td></tr>`; }).join("")}</tbody></table></div>` : ""}`;
  const b = $("#bookAsk"); if (b) b.addEventListener("click", () => { $("#q").value = "페이퍼 북의 열린 포지션을 점검해줘. 각 포지션의 논지가 최신 사건·시세·시나리오 확률과 아직 맞는지, 손절·목표 수준이 과거 사례 분포에 비춰 적절한지, 닫거나 줄여야 할 것과 새로 열 만한 비대칭 기회를 제안해줘."; setTab("p-ai"); });
}

/* ----- ACH 경쟁가설분석 ----- */
const achLocal = (() => { try { return JSON.parse(localStorage.getItem("sit-ach") || "{}"); } catch(e) { return {}; } })();
const ACH_V = {CC: 2, C: 1, N: 0, I: -1, II: -2};
const ACH_CYCLE = ["CC", "C", "N", "I", "II"];
function achVec(q, e){ const o = achLocal[q.id + "/" + e.id] || {}; return Object.fromEntries(Object.keys(q.hyp).map(h => [h, o[h] || e.v[h] || "N"])); }
function achScores(q, omit){
  const W = ACH_.weights || {};
  const out = Object.fromEntries(Object.keys(q.hyp).map(h => [h, {incons: 0, cons: 0, n: 0}]));
  q.ev.forEach(e => { if (omit && omit === e.id) return; const w = W[(e.g || "C")[0]] || 0.7; const v = achVec(q, e); Object.keys(q.hyp).forEach(h => { const s = ACH_V[v[h]] || 0; if (s < 0) out[h].incons += -s * w; else if (s > 0) out[h].cons += s * w; out[h].n++; }); });
  const rank = Object.keys(q.hyp).sort((a, b) => out[a].incons - out[b].incons || out[b].cons - out[a].cons);
  return {scores: out, rank};
}
function achDiagnostic(q, e){ const v = achVec(q, e); const vals = Object.values(v); return new Set(vals).size > 1; }
function renderACH(){
  const html = ACH_.questions.map(q => {
    const {scores, rank} = achScores(q);
    const base = rank[0];
    const sens = q.ev.filter(e => achScores(q, e.id).rank[0] !== base).map(e => e.id);
    return `<div class="block ach" data-q="${esc(q.id)}"><h3>${esc(q.q)} ${TH[q.th] ? `<button class="thchip sev${TH[q.th].sev}" data-th="${q.th}">${esc(TH[q.th].name)}</button>` : ""}</h3>
      <span class="meta">증거 ${q.ev.length}건 · 가중 불일치 점수가 낮은 가설이 생존 · 셀을 누르면 일치도를 바꿀 수 있습니다(브라우저에 저장)</span>
      <div class="achrank">${rank.map((h, i) => `<div class="hyp ${i === 0 ? "lead" : ""}"><b>${h}</b> ${esc(q.hyp[h])}<small>불일치 ${scores[h].incons.toFixed(1)} · 일치 ${scores[h].cons.toFixed(1)}${q.scn && q.scn[h] && SCN_.templates.find(t => t.id === q.scn[h]) ? ` · 시나리오 ${esc(SCN_.templates.find(t => t.id === q.scn[h]).n)} ${scState.p[q.scn[h]]}%` : ""}</small></div>`).join("")}</div>
      <table class="shk achm"><thead><tr><th>증거</th>${Object.keys(q.hyp).map(h => `<th title="${esc(q.hyp[h])}">${h}</th>`).join("")}</tr></thead><tbody>
        ${q.ev.map(e => { const v = achVec(q, e); const diag = achDiagnostic(q, e); return `<tr class="${diag ? "" : "nondiag"}"><td><span class="grade g${(e.g || "C")[0].toLowerCase()}">${esc(e.g)}</span> <b>${esc(e.id)}</b> ${esc(e.x)}<small>${esc(e.d)}${e.src && /^https?:/.test(e.src) ? ` · <a href="${esc(e.src)}" target="_blank" rel="noopener">출처</a>` : e.src ? ` · ${esc(e.src)}` : ""}${!diag ? " · <i>비진단적(모든 가설에 동일)</i>" : ""}${sens.includes(e.id) ? ' · <span class="tag hot">민감: 빼면 1위 바뀜</span>' : ""}</small></td>
          ${Object.keys(q.hyp).map(h => `<td><button class="achc v${v[h]}" data-e="${esc(e.id)}" data-h="${h}" title="누르면 순환: CC→C→N→I→II">${v[h]}</button></td>`).join("")}</tr>`; }).join("")}</tbody></table>
      <div class="btnrow"><button class="btn ghost achreset">초기화</button><button class="btn ghost achcopy">Markdown 복사</button><button class="btn ghost achask">분석관에게 검토 요청</button></div></div>`;
  }).join("");
  $("#p-ach").innerHTML = `<p class="note">경쟁가설분석(ACH): 가설을 '입증'하는 대신 증거와 '불일치'하는 가설을 탈락시킵니다. 모든 가설과 같은 방향인 증거는 비진단적이며, 한 증거를 빼면 1위가 바뀌는 경우 그 증거의 신뢰성이 결정적입니다. 등급 가중 A·B 1.0, C 0.7, D·E 0.4.</p>` + html;
  const pane = $("#p-ach");
  pane.querySelectorAll(".achc").forEach(b => b.addEventListener("click", () => { const q = b.closest(".ach").dataset.q; const key = q + "/" + b.dataset.e; const cur = b.textContent; const nxt = ACH_CYCLE[(ACH_CYCLE.indexOf(cur) + 1) % ACH_CYCLE.length]; achLocal[key] = Object.assign(achLocal[key] || {}, {[b.dataset.h]: nxt}); try { localStorage.setItem("sit-ach", JSON.stringify(achLocal)); } catch(e) {} renderACH(); }));
  pane.querySelectorAll(".achreset").forEach(b => b.addEventListener("click", () => { const q = b.closest(".ach").dataset.q; Object.keys(achLocal).forEach(k => { if (k.startsWith(q + "/")) delete achLocal[k]; }); try { localStorage.setItem("sit-ach", JSON.stringify(achLocal)); } catch(e) {} renderACH(); }));
  pane.querySelectorAll(".achcopy").forEach(b => b.addEventListener("click", () => { const q = ACH_.questions.find(x => x.id === b.closest(".ach").dataset.q); const md = achMarkdown(q); (navigator.clipboard ? navigator.clipboard.writeText(md) : Promise.reject()).then(() => { b.textContent = "복사됨"; setTimeout(() => b.textContent = "Markdown 복사", 1500); }).catch(() => prompt("복사하세요", md)); }));
  pane.querySelectorAll(".achask").forEach(b => b.addEventListener("click", () => { const q = ACH_.questions.find(x => x.id === b.closest(".ach").dataset.q); $("#q").value = "아래 ACH 매트릭스를 검토해줘. 일치도 판정이 잘못된 셀, 빠진 결정적 증거, 비진단적 증거를 대체할 지표, 그리고 생존 가설에 따른 하우스 뷰 확률 조정을 제안해줘.\n\n" + achMarkdown(q); setTab("p-ai"); }));
  pane.querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => { if (typeof select === "function") select(b.dataset.th); }));
}
function achMarkdown(q){
  const {scores, rank} = achScores(q);
  const L = [`## ACH: ${q.q}`, "", "| 가설 | 불일치 | 일치 |", "|---|---|---|"];
  rank.forEach(h => L.push(`| ${h} ${q.hyp[h]} | ${scores[h].incons.toFixed(1)} | ${scores[h].cons.toFixed(1)} |`));
  L.push("", "| 증거 | 등급 | " + Object.keys(q.hyp).join(" | ") + " |", "|---|---|" + Object.keys(q.hyp).map(() => "---").join("|") + "|");
  q.ev.forEach(e => { const v = achVec(q, e); L.push(`| ${e.id} ${e.x} (${e.d}) | ${e.g} | ${Object.keys(q.hyp).map(h => v[h]).join(" | ")} |`); });
  return L.join("\n");
}

/* ----- 전역 검색 (Ctrl/⌘+K) ----- */
let searchIndex = null;
function buildSearchIndex(){
  const ix = [];
  EVENTS.forEach(e => ix.push({k: "사건", t: `${e.d} ${e.p || ""} ${e.x}`, tab: "p-ev", th: e.th, id: e.id}));
  cmGroups().forEach(g => (g.metrics || []).forEach(m => ix.push({k: "지표", t: `${m.l}: ${m.v} (${m.d || ""})`, tab: "p-cm"})));
  if (INTEL && INTEL.sea) (INTEL.sea.chokepoints || []).forEach(c => (c.metrics || []).forEach(m => ix.push({k: "해협", t: `${c.id} ${m.l}: ${m.v}`, tab: "p-sea"})));
  if (INTEL && INTEL.economy) (INTEL.economy.groups || []).forEach(g => (g.metrics || []).forEach(m => ix.push({k: "경제", t: `${g.title} · ${m.l}: ${m.v}`, tab: "p-eco"})));
  judgItems().forEach(j => ix.push({k: "판단", t: `${Math.round(j.p * 100)}% ${j.x}`, tab: "p-bt"}));
  SCN_.templates.forEach(t => ix.push({k: "시나리오", t: `${t.n} (${t.en}) ${t.d}`, tab: "p-scn", scn: t.id}));
  AN_.analogs.forEach(a => ix.push({k: "과거사례", t: `${a.date} ${a.n} ${a.x || ""}`, tab: "p-bt", analog: a.id}));
  CMR.forEach(c => ix.push({k: "상품", t: `${c.n} ${c.en} ${c.ex || ""} ${(c.drivers || []).join(" ")}`, tab: "p-cm", cm: c.id}));
  try { allCalendar().forEach(c => ix.push({k: "일정", t: `${c.d} ${c.x} ${c.why || ""}`, tab: "p-cal"})); } catch(e) {}
  SRC_.forEach(s => ix.push({k: "수집원", t: `${s.name} ${s.kind} ${(s.tags || []).join(" ")}`, tab: "p-src"}));
  ACH_.questions.forEach(q => { ix.push({k: "가설", t: q.q, tab: "p-ach"}); q.ev.forEach(e => ix.push({k: "증거", t: `${e.id} ${e.x}`, tab: "p-ach"})); });
  bookItems().forEach(t => ix.push({k: "포지션", t: `${t.id} ${(CM_BY[t.cm] || {n: t.cm}).n} ${t.side} ${t.thesis || ""}`, tab: "p-book"}));
  DATA.theaters.forEach(t => ix.push({k: "전역", t: `${t.name} ${t.headline || ""}`, tab: "p-th", th: t.id}));
  return ix;
}
function searchGo(hit){
  closePalette();
  if (hit.cm && typeof cmSel !== "undefined") { cmSel = hit.cm; setTab("p-cm"); renderCommod(); return; }
  if (hit.scn) { scState.sel[hit.scn] = true; scSave(); setTab("p-scn"); renderScenario(); return; }
  if (hit.analog) { btState.focus = hit.analog; setTab("p-bt"); renderBacktest(); return; }
  setTab(hit.tab);
  if (hit.th && typeof select === "function") select(hit.th);
  if (hit.id) { const li = document.querySelector(`.evlist li[data-id="${hit.id}"]`); if (li) li.scrollIntoView({block: "center"}); }
}
function openPalette(){ let p = $("#palette"); if (!p) { p = document.createElement("div"); p.id = "palette"; p.innerHTML = `<div class="pal"><input id="palQ" placeholder="사건·지표·판단·시나리오·과거사례·일정·수집원 검색  (Esc 닫기)" autocomplete="off"><ul id="palR"></ul></div>`; document.body.appendChild(p); p.addEventListener("click", e => { if (e.target === p) closePalette(); });
    const inp = $("#palQ"); inp.addEventListener("input", () => palRender(inp.value)); inp.addEventListener("keydown", e => { if (e.key === "Escape") closePalette(); if (e.key === "Enter") { const f = $("#palR li"); if (f) f.click(); } }); }
  if (!searchIndex) searchIndex = buildSearchIndex();
  p.hidden = false; const inp = $("#palQ"); inp.value = ""; palRender(""); inp.focus(); }
function closePalette(){ const p = $("#palette"); if (p) p.hidden = true; }
function palRender(qs){
  const terms = qs.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hits = terms.length ? searchIndex.filter(h => terms.every(t => h.t.toLowerCase().includes(t))).slice(0, 40) : searchIndex.filter(h => h.k === "사건").slice(0, 12);
  $("#palR").innerHTML = hits.map((h, i) => `<li data-i="${i}"><span class="tag">${esc(h.k)}</span> ${esc(h.t.slice(0, 140))}</li>`).join("") || "<li class='none'>결과 없음</li>";
  $("#palR").querySelectorAll("li[data-i]").forEach(li => li.addEventListener("click", () => searchGo(hits[+li.dataset.i])));
}
document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); const p = $("#palette"); if (p && !p.hidden) closePalette(); else openPalette(); } });
(function(){ const b = $("#searchBtn"); if (b) b.addEventListener("click", openPalette); })();

/* ----- 에이전트 분석관: Claude가 페이지 도구를 호출해 조사·계산·행동 ----- */
const agentDrafts = (() => { try { return JSON.parse(localStorage.getItem("sit-drafts") || "[]"); } catch(e) { return []; } })();
function draftsSave(){ try { localStorage.setItem("sit-drafts", JSON.stringify(agentDrafts)); } catch(e) {} renderDrafts(); }
function renderDrafts(){
  const el = $("#drafts"); if (!el) return;
  if (!agentDrafts.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<h4>에이전트 초안 (${agentDrafts.length}) <button class="jbtn" id="draftClear">모두 지우기</button></h4><ul class="wl">${agentDrafts.map((d, i) => { let url = "";
    if (d.kind === "trade") url = `https://github.com/${REPO}/issues/new?template=trade.yml&labels=trade&title=${encodeURIComponent("[포지션] " + d.cm + " " + d.side)}&cm=${encodeURIComponent(d.cm)}&side=${encodeURIComponent(d.side)}&stop=${encodeURIComponent(d.stop ?? "")}&target=${encodeURIComponent(d.target ?? "")}&scn=${encodeURIComponent((d.scn || []).join(","))}&thesis=${encodeURIComponent(d.thesis || "")}`;
    if (d.kind === "judgment") url = `https://github.com/${REPO}/issues/new?template=judgment.yml&labels=judgment&title=${encodeURIComponent("[판정] 신규 판단 등록 제안")}&lines=${encodeURIComponent("NEW " + Math.round(d.p * 100) + "% " + d.due + " " + d.x)}`;
    if (d.kind === "scenario") url = `https://github.com/${REPO}/issues/new?template=scenario.yml&labels=scenario&title=${encodeURIComponent("[시나리오] 에이전트 제안")}&scenarios=${encodeURIComponent((d.view || []).map(v => `${v.id}:${v.p}:${v.k || 1}`).join(","))}&memo=${encodeURIComponent(d.reason || "")}`;
    return `<li><span class="tag">${esc(d.kind)}</span> ${esc(d.kind === "trade" ? `${(CM_BY[d.cm] || {n: d.cm}).n} ${d.side} 손절 ${d.stop ?? "—"} 목표 ${d.target ?? "—"} — ${d.thesis || ""}` : d.kind === "judgment" ? `${Math.round(d.p * 100)}% · ${d.due} · ${d.x}` : `${(d.view || []).map(v => v.id + " " + v.p + "%").join(", ")} — ${d.reason || ""}`)} ${url ? `<a href="${url}" target="_blank" rel="noopener">Issue로</a>` : ""} <button class="jbtn" data-del="${i}">삭제</button></li>`; }).join("")}</ul>`;
  el.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { agentDrafts.splice(+b.dataset.del, 1); draftsSave(); }));
  const c = $("#draftClear"); if (c) c.addEventListener("click", () => { agentDrafts.length = 0; draftsSave(); });
}
function agentLog(msg){ const el = $("#agentLog"); if (!el) return; el.hidden = false; const li = document.createElement("li"); li.textContent = msg; el.appendChild(li); el.scrollTop = el.scrollHeight; }
function agentTools(){
  const small = (arr, n) => arr.slice(0, n);
  return [
    {name: "search_events", description: "상황판 사건 검색. 키워드(공백 구분, 모두 포함)·전역 id·최근 일수로 거른 사건 목록(날짜, 유형, 장소, 내용, 출처 등급)을 최대 25건 반환.", inputSchema: {type: "object", properties: {query: {type: "string"}, theater: {type: "string"}, days: {type: "number"}}},
      execute: ({query, theater, days}) => { agentLog(`사건 검색: ${query || ""} ${theater || ""} ${days || ""}일`); const terms = String(query || "").toLowerCase().split(/\s+/).filter(Boolean); return small(EVENTS.filter(e => (!theater || e.th === theater) && (!days || (daysAgo(e.d) >= 0 && daysAgo(e.d) < Number(days))) && terms.every(t => (e.x + " " + (e.p || "")).toLowerCase().includes(t))).sort((a, b) => b.d.localeCompare(a.d)), 25).map(e => ({d: e.d, t: TYPES[e.t] ? TYPES[e.t].n : e.t, th: e.th, p: e.p, x: e.x, g: e.g || grade(e.s).g})); }},
    {name: "get_quote", description: "상품 id(예: brent, wheat, gold, ttf, kospi)의 현재 호가·등락·날짜와 관련 지표 최대 12개, 구조적 동인, 분쟁 전파 경로를 반환.", inputSchema: {type: "object", properties: {commodity: {type: "string"}}, required: ["commodity"]},
      execute: ({commodity}) => { const c = CM_BY[String(commodity)]; if (!c) throw new Error("알 수 없는 상품 id. 사용 가능: " + CMR.map(x => x.id).join(", ")); agentLog(`호가 조회: ${c.n}`); const q = cmQuote(c); return {commodity: c.n, quote: q, unit: c.unit, drivers: c.drivers, korea: c.kr, metrics: small(cmMetrics(c), 12).map(m => ({l: m.l, v: m.v, d: m.d, chg: m.chg, n: m.n})), transmission: cmTrans(c).map(t => ({theater: TH[t.th].name, sev: TH[t.th].sev, w: t.w, dir: t.dir, m: t.m}))}; }},
    {name: "run_scenario", description: "시나리오 조합을 몬테카를로로 평가. scenarios=[{id, p(%), k}] (id는 scenario 템플릿 id). 상품별 기대 변동·P5·P50·P95·상승확률 상위 15개를 반환. 상황판 선택은 바꾸지 않음.", inputSchema: {type: "object", properties: {scenarios: {type: "array", items: {type: "object", properties: {id: {type: "string"}, p: {type: "number"}, k: {type: "number"}}}}}, required: ["scenarios"]},
      execute: ({scenarios}) => { const view = Array.isArray(scenarios) ? scenarios : []; agentLog(`시나리오 평가: ${view.map(v => v.id + " " + v.p + "%").join(", ")}`); const saved = JSON.parse(JSON.stringify(scState)); SCN_.templates.forEach(t => scState.sel[t.id] = false); view.forEach(v => { if (scState.p[v.id] === undefined) throw new Error("알 수 없는 시나리오 id " + v.id + ". 사용 가능: " + SCN_.templates.map(t => t.id).join(", ")); scState.sel[v.id] = true; if (v.p != null) scState.p[v.id] = Number(v.p); scState.k[v.id] = Number(v.k) || 1; }); const res = scRun(1500); Object.assign(scState.sel, saved.sel); Object.assign(scState.p, saved.p); Object.assign(scState.k, saved.k); if (!res) throw new Error("선택된 시나리오 없음"); return {horizon_days: res.H, rows: small(res.rows, 15).map(r => ({asset: (CM_BY[r.a] || {n: r.a}).n, id: r.a, expected: +r.e.toFixed(1), p5: +r.p5.toFixed(1), p50: +r.p50.toFixed(1), p95: +r.p95.toFixed(1), p_up: +r.pUp.toFixed(2), unit: r.bp ? "bp" : "%"}))}; }},
    {name: "list_scenarios", description: "시나리오 템플릿 목록(id, 이름, 전역, 기본 확률, 현재 상황판 선택·확률, 조건부 충격 요약)과 하우스 뷰.", execute: () => { agentLog("시나리오 목록 조회"); return {templates: SCN_.templates.map(t => ({id: t.id, n: t.n, th: t.th, p_default: t.p, p_board: scState.p[t.id], selected: !!scState.sel[t.id], h: t.h, top_shocks: Object.entries(t.shocks).sort((a, b) => Math.abs(b[1].m) - Math.abs(a[1].m)).slice(0, 5).map(([a, s]) => a + " " + (s.m > 0 ? "+" : "") + s.m)})), house_view: HOUSE_ ? HOUSE_.scenarios : null}; }},
    {name: "get_analogs", description: "과거 사례 라이브러리. category(hormuz, redsea, blacksea, taiwan, korea, financial, pandemic, opec, weather, tariff, other) 또는 ids로 거르고, 자산별 +1/+5/+20/+60일 변동률을 반환.", inputSchema: {type: "object", properties: {category: {type: "string"}, ids: {type: "array", items: {type: "string"}}}},
      execute: ({category, ids}) => { agentLog(`과거 사례: ${category || (ids || []).join(",") || "전체"}`); return small(AN_.analogs.filter(a => (!category || a.cat === category) && (!ids || !ids.length || ids.includes(a.id))), 12).map(a => ({id: a.id, date: a.date, n: a.n, cat: a.cat, moves: a.moves})); }},
    {name: "get_scorecard", description: "예측 적중 채점표 요약(방향 적중, 90% 구간 포함, 스킬, 자산별)과 판단 장부 통계(Brier, 기한 경과), 진행 중 예측.", execute: () => { agentLog("채점표 조회"); const st = judgStats(judgItems()); return {scorecard: SCORE_ ? {n_forecasts: SCORE_.n_forecasts, n_scored: SCORE_.n_scored, overall: SCORE_.overall, by_asset: SCORE_.by_asset, pending: (SCORE_.forecasts || []).filter(f => f.status !== "scored").map(f => ({d: f.d, elapsed: f.elapsed, top: f.rows.slice(0, 6).map(r => ({a: r.a, e: r.e, real: r.real}))}))} : null, ledger: {n: st.n, resolved: st.resolved, brier: st.brier, overdue: st.overdue}, overdue_items: judgItems().filter(j => j.outcome == null && j.due && j.due < REF).slice(0, 15).map(j => ({id: j.id, p: j.p, due: j.due, x: j.x}))}; }},
    {name: "get_book", description: "페이퍼 북(가상 포지션) 전체: 포지션, 진입·현재가, P&L, 손절·목표 거리, 근거 시나리오.", execute: () => { agentLog("페이퍼 북 조회"); return {summary: BOOK_ && BOOK_.summary, items: bookItems().map(t => ({id: t.id, cm: t.cm, side: t.side, entry: t.entry, last: t.last, pnl: t.pnl, stop: t.stop, target: t.target, stop_dist: t.stop_dist, target_dist: t.target_dist, scn: t.scn, status: t.status, thesis: t.thesis}))}; }},
    {name: "get_ach", description: "경쟁가설분석(ACH) 매트릭스: question id(hormuz, blacksea, fed, enso, taiwan)의 가설 순위·점수·증거·일치도. id 생략 시 전체 순위 요약.", inputSchema: {type: "object", properties: {question: {type: "string"}}},
      execute: ({question}) => { agentLog(`ACH 조회: ${question || "전체"}`); const qs = ACH_.questions.filter(q => !question || q.id === question); if (!qs.length) throw new Error("알 수 없는 질문 id"); return qs.map(q => { const {scores, rank} = achScores(q); return {id: q.id, q: q.q, rank: rank.map(h => ({h, hyp: q.hyp[h], incons: +scores[h].incons.toFixed(1), cons: +scores[h].cons.toFixed(1), scenario: q.scn && q.scn[h]})), evidence: question ? q.ev.map(e => ({id: e.id, d: e.d, g: e.g, x: e.x, v: achVec(q, e)})) : undefined}; }); }},
    {name: "get_risk", description: "경제 위험 지수(0~100)와 구성요소, 상품별 위험 등급(R1~R5, P5~P95), 페이퍼 북 VaR95·ES95·시나리오별 조건부 P&L, 한국 수입 바스켓 충격.", execute: () => { agentLog("위험도 조회"); const r = RISK_ || riskModel(); return {index: r.index, level: r.level, components: Object.fromEntries(Object.entries(r.comp).map(([k, v]) => [k, {v: +v.v.toFixed(2), d: v.d}])), assets: r.perAsset.slice(0, 14).map(a => ({id: a.id, n: a.n, grade: a.grade, p5: +a.p5.toFixed(1), p95: +a.p95.toFixed(1)})), book: r.book ? {var95: +r.book.var95.toFixed(1), es95: +r.book.es.toFixed(1), p_up: +r.book.pUp.toFixed(2), worst: r.book.cond.slice(0, 4).map(c => ({scenario: c.id, p: c.p, pnl: +c.pnl.toFixed(1)})), tail_contrib: r.book.contrib.slice(0, 4).map(c => ({id: c.id, tail: +c.tail.toFixed(1)}))} : null, korea_basket: {mean: +r.basket.mean.toFixed(1), p95: +r.basket.p95.toFixed(1)}}; }},
    {name: "get_calendar", description: "다가오는 일정(발표·회의·만기) 최대 30건.", execute: () => { agentLog("일정 조회"); return allCalendar().filter(c => c.d >= REF).slice(0, 30).map(c => ({d: c.d, cat: c.cat, x: c.x, why: c.why})); }},
    {name: "set_scenario_view", description: "행동: 상황판 시나리오 탭의 선택·확률·강도를 바꾼다. scenarios=[{id,p,k}]. 분석 결론을 보드에 반영할 때만 사용. 사용자는 되돌릴 수 있다.", inputSchema: {type: "object", properties: {scenarios: {type: "array", items: {type: "object", properties: {id: {type: "string"}, p: {type: "number"}, k: {type: "number"}}}}, reason: {type: "string"}}, required: ["scenarios"]},
      execute: ({scenarios, reason}) => { const view = Array.isArray(scenarios) ? scenarios : []; agentLog(`행동: 시나리오 뷰 변경 (${view.length}개) ${reason || ""}`); SCN_.templates.forEach(t => scState.sel[t.id] = false); view.forEach(v => { if (scState.p[v.id] === undefined) throw new Error("알 수 없는 시나리오 id " + v.id); scState.sel[v.id] = true; if (v.p != null) scState.p[v.id] = Math.max(1, Math.min(99, Number(v.p))); scState.k[v.id] = Number(v.k) || 1; }); scSave(); renderScenario(); agentDrafts.push({kind: "scenario", view: view.map(v => ({id: v.id, p: v.p, k: v.k || 1})), reason: String(reason || "")}); draftsSave(); return "적용됨. 시나리오 탭에서 확인 가능, Issue 제출 초안이 추가됨."; }},
    {name: "draft_trade", description: "행동: 페이퍼 포지션 초안을 만든다(실제 주문 아님, 사용자가 Issue로 제출해야 장부에 들어감). cm 상품 id, side long|short, stop·target 가격, thesis 한두 문장, scn 근거 시나리오 id 배열.", inputSchema: {type: "object", properties: {cm: {type: "string"}, side: {type: "string"}, stop: {type: "number"}, target: {type: "number"}, thesis: {type: "string"}, scn: {type: "array", items: {type: "string"}}}, required: ["cm", "side", "thesis"]},
      execute: ({cm, side, stop, target, thesis, scn}) => { if (!CM_BY[String(cm)]) throw new Error("알 수 없는 상품 id"); agentLog(`행동: 포지션 초안 ${cm} ${side}`); agentDrafts.push({kind: "trade", cm: String(cm), side: side === "short" ? "short" : "long", stop: stop ?? null, target: target ?? null, thesis: String(thesis || "").slice(0, 300), scn: Array.isArray(scn) ? scn.map(String) : []}); draftsSave(); return "초안 추가됨 (분석관 탭 하단, Issue 링크)."; }},
    {name: "draft_judgment", description: "행동: 판단 장부에 올릴 새 판단 초안. x 판단문(ICD 203 확률 용어 포함), p 확률(0~1), due 판정 기한 YYYY-MM-DD.", inputSchema: {type: "object", properties: {x: {type: "string"}, p: {type: "number"}, due: {type: "string"}}, required: ["x", "p", "due"]},
      execute: ({x, p, due}) => { agentLog(`행동: 판단 초안 ${Math.round(Number(p) * 100)}%`); agentDrafts.push({kind: "judgment", x: String(x).slice(0, 300), p: Math.max(0.01, Math.min(0.99, Number(p))), due: String(due).slice(0, 10)}); draftsSave(); return "초안 추가됨."; }},
    {name: "show_tab", description: "행동: 상황판 탭을 연다. tab은 bluf, th, ev, sea, cm, eco, gp, cal, pos, net, kr, mkt, src, scn, bt, book, ach, ai 중 하나.", inputSchema: {type: "object", properties: {tab: {type: "string"}}, required: ["tab"]},
      execute: ({tab}) => { const id = "p-" + String(tab).replace(/^p-/, ""); if (!document.getElementById(id)) throw new Error("알 수 없는 탭"); agentLog(`행동: 탭 열기 ${tab}`); setTab(id); return "열림"; }}
  ];
}
function agentContext(){
  const st = judgStats(judgItems());
  return JSON.stringify({기준일: REF, 종합경보: IW.global.level + " " + IW.global.label, 요약: IW.global.summary, 핵심판단: IW.bluf.judgments.map(j => j.t),
    고경보전역: DATA.theaters.filter(t => t.sev >= 4).map(t => t.name + " " + t.sev + " " + (t.headline || "").slice(0, 80)),
    하우스뷰: HOUSE_ ? HOUSE_.scenarios.map(v => v.id + " " + v.p + "%") : null, 보드선택: scSelected().map(t => t.id + " " + scState.p[t.id] + "%"),
    채점: SCORE_ ? {예측: SCORE_.n_forecasts, 채점: SCORE_.n_scored, 방향: SCORE_.overall.dir, 구간90: SCORE_.overall.cov90, 스킬: SCORE_.overall.skill} : null, 장부: {건수: st.n, 판정: st.resolved, Brier: st.brier, 기한경과: st.overdue},
    포지션: bookItems().filter(t => t.status === "open").map(t => t.id + " " + t.cm + " " + t.side + " P&L " + (t.pnl ?? "—")),
    주요시세: CMR.slice(0, 34).map(c => { const q = cmQuote(c); return q ? c.id + " " + q.v + " " + (q.chg || "") : null; }).filter(Boolean)});
}
const AGENT_RULES = "너는 국가 정보기관 선임 지정학·시장 분석관이자 자율 에이전트다. 아래 상황판 요약을 읽고, 필요한 데이터는 제공된 도구로 직접 조회·계산한 뒤 결론을 내라. 조사 도구(search_events, get_quote, run_scenario, list_scenarios, get_analogs, get_scorecard, get_book, get_ach, get_risk, get_calendar)는 자유롭게 써라. 행동 도구(set_scenario_view, draft_trade, draft_judgment, show_tab)는 결론이 선 뒤에만, 근거를 reason/thesis에 적어서 써라. 모든 수치 주장에는 출처(도구 결과)를 달고, 확률은 ICD 203 용어와 숫자를 함께 써라. 답은 한국어로, 1) 결론(BLUF) 2) 근거와 도구로 확인한 수치 3) 반대 가설·리스크 4) 취한 행동과 제안 순으로 간결하게.";
const AGENT_PRESETS = [
  ["오늘의 비대칭 기회", "오늘 가장 비대칭적인 원자재·거시 포지션 2~3개를 찾아줘. 시나리오 확률 가중 분포(run_scenario)와 과거 사례 분포(get_analogs), 현재 호가(get_quote)를 대조하고, 채택할 만한 것은 draft_trade로 초안을 만들어줘."],
  ["하우스 뷰 재검토", "하우스 뷰(list_scenarios)의 확률이 최근 7일 사건(search_events), ACH 가설 순위(get_ach), 채점표(get_scorecard)에 비춰 타당한지 검토하고, 바꿔야 할 확률을 set_scenario_view로 보드에 반영한 뒤 근거를 설명해줘."],
  ["포지션 점검", "페이퍼 북(get_book)의 열린 포지션을 하나씩 점검해줘. 논지가 최신 사건·시세와 맞는지, 손절·목표가 과거 사례 분포에 비춰 적절한지, 줄이거나 닫을 것과 새로 열 것을 제안해줘."],
  ["판단 장부 정리", "판단 장부의 기한 경과 항목(get_scorecard)을 사건 검색으로 판정해 보고, 앞으로 2~4주 안에 판정 가능한 새 판단 3개를 draft_judgment로 올려줘."],
  ["위험 헤지 설계", "경제 위험 지수(get_risk)의 구성요소와 페이퍼 북의 꼬리 기여·최악 시나리오를 보고, 한국 수입물가 관점에서 가장 비용 효율적인 헤지 2~3개를 제안해줘. 채택할 만한 헤지는 draft_trade로 초안을 만들고, 헤지 후 VaR가 어떻게 바뀔지 run_scenario로 설명해줘."],
  ["다음 주 촉매 지도", "다가오는 일정(get_calendar)마다 어느 시나리오와 상품이 움직이는지 연결하고, 일정별로 사전 포지션과 확인 지표를 정리해줘."]
];
let agentCtl = null;
async function agentRun(task){
  if (!sample || denied) return;
  const out = $("#answer"), log = $("#agentLog"); if (log) log.innerHTML = "";
  askBtn.disabled = true; stopBtn.hidden = false; out.className = "answer wait"; out.textContent = "에이전트가 조사 중… (도구 호출 기록은 아래)";
  agentCtl = new AbortController();
  try {
    const lim = await sample.limits().catch(() => null);
    if (!lim || !lim.tools) { out.className = "answer"; out.textContent = "이 뷰에서는 에이전트 도구를 쓸 수 없어요. 일반 분석 요청을 쓰세요."; return; }
    const r = await sample([{role: "user", content: AGENT_RULES + "\n\n[상황판 요약]\n" + agentContext()}, {role: "user", content: task}], {tools: agentTools().slice(0, lim.tools.maxCount), cache: false, signal: agentCtl.signal, modelTier: "default", onText: ({text}) => { out.className = "answer"; out.textContent = text; }});
    out.className = "answer"; out.textContent = r.text + (r.truncated ? "\n\n(답변이 길어 잘렸어요.)" : "");
  } catch(e) {
    out.className = "answer"; out.textContent = (e && e.text ? e.text + "\n\n" : "") + (errCopy[e && e.code] || (e && e.code === "tools_unavailable" ? "이 뷰에서는 도구 호출을 쓸 수 없어요." : "에이전트 실행에 실패했어요. 잠시 뒤 다시 시도해 주세요."));
    if (e && e.code === "not_granted") denied = true;
  } finally { askBtn.disabled = denied; stopBtn.hidden = true; agentCtl = null; renderDrafts(); }
}
(function initAgent(){
  const box = $("#askBox"); if (!box) return;
  const bar = document.createElement("div"); bar.className = "agentbar";
  bar.innerHTML = `<div class="sugs">${AGENT_PRESETS.map((p, i) => `<button class="sug agent" data-i="${i}" title="${esc(p[1])}">⚙ ${esc(p[0])}</button>`).join("")}</div>
    <div class="btnrow"><button class="btn" id="agentBtn">에이전트 실행 (도구 사용)</button><span class="meta">에이전트는 상황판 데이터를 도구로 조회·계산하고, 시나리오 뷰 변경·포지션·판단 초안을 만듭니다. 초안은 Issue로 제출해야 저장소에 반영됩니다.</span></div>
    <ul class="agentlog" id="agentLog" hidden></ul><div id="drafts"></div>`;
  box.appendChild(bar);
  bar.querySelectorAll(".sug.agent").forEach(b => b.addEventListener("click", () => { q.value = AGENT_PRESETS[+b.dataset.i][1]; agentRun(q.value); }));
  $("#agentBtn").addEventListener("click", () => { const t = q.value.trim(); if (!t) { q.focus(); return; } agentRun(t); });
  stopBtn.addEventListener("click", () => agentCtl && agentCtl.abort());
  renderDrafts();
})();
