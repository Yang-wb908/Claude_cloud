/* ---------- 경제 위험도 (risk.js) ----------
   종합 경제 위험 지수(0~100)와 상품별 위험 등급, 페이퍼 북 시나리오 VaR, 한국 수입물가 충격을 상황판 데이터만으로 계산한다.
   구성요소: 시나리오 꼬리(하우스 뷰 몬테카를로의 P5/P95), 시장 스트레스(VIX·DXY·원/달러·10년물·유가), 공급망 스트레스(해협 상태·운임), 포지셔닝 과밀(매니지드머니 순포지션), 사건 밀도, 모델 불확실성(채점표). */
const RISK_W = {tail: 0.30, market: 0.25, supply: 0.20, crowd: 0.10, events: 0.10, model: 0.05};
const KR_BASKET = [["brent", 0.30, "원유"], ["jkm", 0.12, "LNG"], ["products", 0.08, "석유제품"], ["coal", 0.05, "유연탄"], ["wheat", 0.05, "밀"], ["corn", 0.05, "옥수수"], ["soy", 0.04, "대두"], ["copper", 0.05, "구리"], ["ironore", 0.05, "철광석"], ["fert", 0.03, "비료"], ["container", 0.08, "컨테이너 운임"], ["tanker", 0.05, "유조선 운임"], ["usd", 0.05, "원/달러"]];
const clamp01 = v => Math.max(0, Math.min(1, v));
const num = s => { if (s == null) return null; const m = String(s).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
function riskQuote(id){ const c = CM_BY[id]; if (!c) return null; const q = cmQuote(c); return q ? num(q.v) : null; }

/* 하우스 뷰(없으면 현재 선택) 기준 몬테카를로를 한 번 돌려 자산별 분포와 포지션 P&L 분포를 얻는다 */
function riskSim(N){
  N = N || 2500;
  const saved = JSON.parse(JSON.stringify(scState));
  if (HOUSE_ && HOUSE_.scenarios && HOUSE_.scenarios.length) { SCN_.templates.forEach(t => scState.sel[t.id] = false); HOUSE_.scenarios.forEach(v => { if (scState.p[v.id] !== undefined) { scState.sel[v.id] = true; if (v.p != null) scState.p[v.id] = v.p; scState.k[v.id] = v.k || 1; } }); }
  const sel = scSelected();
  const groups = {}; sel.forEach(t => (groups[t.th] = groups[t.th] || []).push(t));
  const glist = Object.values(groups).map(list => { let sum = list.reduce((a, t) => a + scState.p[t.id] / 100, 0); const norm = sum > 1 ? 1 / sum : 1; return list.map(t => ({t, p: scState.p[t.id] / 100 * norm, k: scState.k[t.id]})); });
  const H = 30; /* 위험 지수 지평: 30일 고정 (시나리오 지평과 무관하게 비교 가능하도록) */
  const assets = Object.keys(SCN_.assets);
  const sims = Object.fromEntries(assets.map(a => [a, new Float64Array(N)]));
  const occ = Object.fromEntries(sel.map(t => [t.id, new Uint8Array(N)]));
  for (let i = 0; i < N; i++) {
    const shock = {};
    glist.forEach(g => { const u = Math.random(); let cum = 0; for (const {t, p, k} of g) { cum += p; if (u < cum) { occ[t.id][i] = 1; Object.entries(t.shocks).forEach(([a, s]) => { shock[a] = (shock[a] || 0) + k * (s.m + s.s * gauss()); }); break; } } });
    assets.forEach(a => { const A = SCN_.assets[a]; const noise = A.bp ? 12 * Math.sqrt(H / 20) * gauss() : A.vol * Math.sqrt(H / 252) * gauss(); sims[a][i] = A.bp ? (shock[a] || 0) + noise : Math.max(-95, (shock[a] || 0) + noise); });
  }
  Object.assign(scState.sel, saved.sel); Object.assign(scState.p, saved.p); Object.assign(scState.k, saved.k);
  const q = (arr, f) => { const s = Float64Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor(f * s.length))]; };
  return {N, H, sims, occ, sel, q};
}

function riskModel(){
  const R = riskSim();
  const comp = {};
  /* 1. 시나리오 꼬리: 한국 수입 바스켓의 P5 손실(가격 상승이 위험) */
  const basket = new Float64Array(R.N);
  KR_BASKET.forEach(([a, w]) => { const s = R.sims[a]; if (s) for (let i = 0; i < R.N; i++) basket[i] += w * s[i]; });
  const bP95 = R.q(basket, .95), bP50 = R.q(basket, .5), bMean = basket.reduce((x, y) => x + y, 0) / R.N;
  comp.tail = {v: clamp01(bP95 / 50), l: "시나리오 꼬리", d: `한국 수입 바스켓 ${R.H}일 P95 ${fmtPct(bP95)} · 중앙값 ${fmtPct(bP50)} · 기대 ${fmtPct(bMean)}`};
  /* 2. 시장 스트레스 */
  const vix = riskQuote("vix"), dxy = riskQuote("usd"), tnx = riskQuote("rates"), brent = riskQuote("brent");
  const krw = (AUTO && AUTO.markets && (AUTO.markets.find(m => m.sym === "KRW=X") || {}).v) || null;
  const ms = [vix != null ? clamp01((vix - 12) / 28) : null, dxy != null ? clamp01((dxy - 95) / 15) : null, tnx != null ? clamp01((tnx - 3.5) / 2.5) : null, brent != null ? clamp01((brent - 70) / 60) : null, krw != null ? clamp01((krw - 1250) / 250) : null].filter(x => x != null);
  comp.market = {v: ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 0.5, l: "시장 스트레스", d: `VIX ${vix ?? "—"} · DXY ${dxy ?? "—"} · 10년물 ${tnx ?? "—"}% · 브렌트 $${brent ?? "—"}${krw ? " · 원/달러 " + krw : ""}`};
  /* 3. 공급망 스트레스: 해협 상태 + 운임 */
  const chokeSev = {closed: 1, blocked: 1, restricted: .7, threat: .5, elevated: .4, watch: .3, normal: .1, open: .1};
  const chokes = INTEL && INTEL.sea ? INTEL.sea.chokepoints : [];
  const cs = chokes.map(c => { const st = String(c.status || "").toLowerCase(); const k = Object.keys(chokeSev).find(x => st.includes(x)); return k ? chokeSev[k] : (/봉쇄|차단|중단/.test(c.status || "") ? 1 : /제한|선별|위협|우회/.test(c.status || "") ? .6 : /정상|재개/.test(c.status || "") ? .1 : .4); });
  const bdi = riskQuote("bdi"), wci = riskQuote("container"), vlcc = riskQuote("tanker");
  const fr = [bdi != null ? clamp01((bdi - 1500) / 3000) : null, wci != null ? clamp01((wci - 2000) / 6000) : null, vlcc != null ? clamp01(vlcc / 300000) : null].filter(x => x != null);
  comp.supply = {v: clamp01(0.6 * (cs.length ? Math.max(...cs) * 0.5 + cs.reduce((a, b) => a + b, 0) / cs.length * 0.5 : 0.5) + 0.4 * (fr.length ? fr.reduce((a, b) => a + b, 0) / fr.length : 0.4)), l: "공급망 스트레스", d: `해협 ${chokes.map(c => c.id + " " + String(c.status || "").replace(/[.,;].*$/, "").slice(0, 22)).join(" · ") || "—"} · BDI ${bdi ?? "—"} · WCI $${wci ?? "—"}`};
  /* 4. 포지셔닝 과밀: 순포지션 절대값이 큰 시장 수 */
  const pos = []; if (AUTO && AUTO.cot) AUTO.cot.forEach(p => pos.push({l: p.market, net: p.net, oi: p.oi})); if (CMI) ["energy", "ags"].forEach(k => ((CMI[k] && CMI[k].positioning) || []).forEach(p => { const n = num(p.v); if (n != null) pos.push({l: p.l, net: n}); }));
  const crowd = pos.map(p => clamp01(Math.abs(p.net) / 300000));
  comp.crowd = {v: crowd.length ? Math.max(...crowd) * 0.5 + crowd.reduce((a, b) => a + b, 0) / crowd.length * 0.5 : 0.3, l: "포지셔닝 과밀", d: pos.slice(0, 5).map(p => p.l.replace(/ 매니지드머니 순포지션/, "") + " " + (p.net > 0 ? "+" : "") + Math.round(p.net / 1000) + "k").join(" · ") || "COT 없음"};
  /* 5. 사건 밀도: 최근 7일 고경보 전역 사건 */
  const ev7 = EVENTS.filter(e => daysAgo(e.d) >= 0 && daysAgo(e.d) < 7), hot = ev7.filter(e => TH[e.th] && TH[e.th].sev >= 4 && /S|M|A/.test(e.t));
  comp.events = {v: clamp01(hot.length / 40), l: "사건 밀도", d: `7일 사건 ${ev7.length}건, 고경보 타격·해상 ${hot.length}건`};
  /* 6. 모델 불확실성: 채점표 구간 포함률이 낮거나 채점 없음 */
  const sc = SCORE_ && SCORE_.overall;
  comp.model = {v: sc && sc.n ? clamp01(1 - sc.cov90) + (sc.skill != null && sc.skill < 0 ? 0.2 : 0) : 0.5, l: "모델 불확실성", d: sc && sc.n ? `90% 구간 포함 ${pct0(sc.cov90)} · 스킬 ${sc.skill}` : "채점 전(기본 0.5)"};
  const index = Math.round(100 * Object.entries(RISK_W).reduce((a, [k, w]) => a + w * clamp01(comp[k].v), 0));
  /* 상품별 위험 등급 */
  const perAsset = CMR.map(c => { const s = R.sims[c.id]; if (!s) return null; const p5 = R.q(s, .05), p95 = R.q(s, .95), bp = !!(SCN_.assets[c.id] && SCN_.assets[c.id].bp); const vol = SCN_.assets[c.id].vol || 20;
    const span = bp ? (p95 - p5) / 100 : (p95 - p5) / 60; const n7 = EVENTS.filter(e => e.cm && e.cm.includes(c.id) && daysAgo(e.d) >= 0 && daysAgo(e.d) < 7).length; const trw = cmTrans(c).reduce((a, t) => a + t.w * (TH[t.th].sev / 5), 0);
    const score = clamp01(0.45 * clamp01(span) + 0.2 * clamp01(vol / 80) + 0.2 * clamp01(trw / 6) + 0.15 * clamp01(n7 / 8));
    return {id: c.id, n: c.n, p5, p95, bp, vol, n7, trw, score, grade: score >= .75 ? 5 : score >= .55 ? 4 : score >= .38 ? 3 : score >= .22 ? 2 : 1, skew: bp ? null : (p95 + p5) / 2}; }).filter(Boolean).sort((a, b) => b.score - a.score);
  const book = null;
  /* 한국 수입물가 충격 */
  const kr = KR_BASKET.map(([a, w, n]) => { const s = R.sims[a]; if (!s) return null; const e = s.reduce((x, y) => x + y, 0) / R.N; return {a, n, w, e, p95: R.q(s, .95), contrib: w * e}; }).filter(Boolean).sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
  return {index, level: index >= 75 ? "심각" : index >= 55 ? "높음" : index >= 35 ? "보통" : "낮음", comp, perAsset, book, kr, basket: {p95: bP95, p50: bP50, mean: bMean}, H: R.H, sel: R.sel.map(t => t.id)};
}
let RISK_ = null;
function riskBadge(id){ if (!RISK_) return ""; const r = RISK_.perAsset.find(x => x.id === id); return r ? `<span class="rk r${r.grade}" title="위험 등급 R${r.grade} · ${RISK_.H}일 P5 ${fmtPct(r.p5, r.bp)} ~ P95 ${fmtPct(r.p95, r.bp)}">R${r.grade}</span>` : ""; }
function riskGaugeHtml(r){
  const ang = -90 + 180 * r.index / 100;
  return `<div class="rgauge sev${r.index >= 75 ? 5 : r.index >= 55 ? 4 : r.index >= 35 ? 3 : 2}"><svg viewBox="0 0 120 86" aria-label="경제 위험 지수 ${r.index}"><path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/><path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="var(--c)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(157 * r.index / 100).toFixed(1)} 200"/><line x1="60" y1="60" x2="60" y2="22" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" transform="rotate(${ang.toFixed(1)} 60 60)"/><circle cx="60" cy="60" r="4" fill="var(--ink)"/><text x="60" y="80" text-anchor="middle" font-size="20" font-weight="700" fill="var(--c)" font-family="Barlow Condensed, Arial Narrow, sans-serif">${r.index}</text><text x="104" y="80" text-anchor="end" font-size="8" fill="var(--muted)">${esc(r.level)}</text><text x="16" y="80" font-size="8" fill="var(--faint)">0</text><text x="60" y="12" text-anchor="middle" font-size="7" fill="var(--faint)">50</text><text x="110" y="52" text-anchor="end" font-size="7" fill="var(--faint)">100</text></svg></div>`;
}
function riskBlufHtml(){
  if (!RISK_) {  // 몬테카를로 계산은 첫 화면을 그린 뒤로 미룬다(시작 속도)
    if (!riskBlufHtml._sched) { riskBlufHtml._sched = true; setTimeout(() => { try { RISK_ = riskModel(); renderBluf(); } catch(e) { console.warn("risk", e); } }, 30); }
    return `<div class="block riskblk"><h3>경제 위험 지수 <span class="en">계산 중</span></h3><p class="note">시나리오 시뮬레이션으로 계산하고 있습니다…</p></div>`;
  }
  const r = RISK_;
  return `<div class="block sev${r.index >= 75 ? 5 : r.index >= 55 ? 4 : r.index >= 35 ? 3 : 2} riskblk"><h3>경제 위험 지수 <span class="en">economic risk · ${r.H}d</span></h3>
    <div class="riskrow">${riskGaugeHtml(r)}<div class="rbars">${Object.entries(RISK_W).map(([k, w]) => `<div class="rb" title="${esc(r.comp[k].d)}"><span>${esc(r.comp[k].l)}</span><i><b style="width:${Math.round(100 * clamp01(r.comp[k].v))}%"></b></i><small>${Math.round(100 * clamp01(r.comp[k].v))}</small></div>`).join("")}</div></div>
    <p class="cap">한국 수입 바스켓 ${r.H}일 충격: 기대 ${fmtPct(r.basket.mean)} · P95 ${fmtPct(r.basket.p95)} · 상품 위험 R5: ${r.perAsset.filter(x => x.grade === 5).map(x => x.n).join(", ") || "없음"} <button class="thchip" id="riskMore">위험도 탭 →</button></p></div>`;
}
function renderRisk(){
  try { RISK_ = riskModel(); } catch(e) { $("#p-risk").innerHTML = `<p class="note">위험도 계산 실패: ${esc(e.message)}</p>`; return; }
  const r = RISK_;
  const grade = g => `<span class="rk r${g}">R${g}</span>`;
  $("#p-risk").innerHTML = `
    <div class="block sev${r.index >= 75 ? 5 : r.index >= 55 ? 4 : r.index >= 35 ? 3 : 2}"><h3>종합 경제 위험 지수 <span class="en">0–100 · horizon ${r.H}d</span></h3><span class="meta">하우스 뷰 ${r.sel.length}개 시나리오 몬테카를로 + 시장·공급망·포지셔닝·사건·모델 불확실성 가중 합</span>
      <div class="riskrow">${riskGaugeHtml(r)}<div class="rbars">${Object.entries(RISK_W).map(([k, w]) => `<div class="rb"><span>${esc(r.comp[k].l)} <small>×${w}</small></span><i><b style="width:${Math.round(100 * clamp01(r.comp[k].v))}%"></b></i><small>${Math.round(100 * clamp01(r.comp[k].v))}</small></div>`).join("")}</div></div>
      <ul class="wl">${Object.entries(RISK_W).map(([k]) => `<li><b>${esc(r.comp[k].l)}</b> <small>${esc(r.comp[k].d)}</small></li>`).join("")}</ul>
      <p class="note">0~35 낮음, 35~55 보통, 55~75 높음, 75 이상 심각. 꼬리 위험은 한국 수입 바스켓(원유 30%, LNG 12%, 운임 13%, 곡물 14%, 금속 10%, 비료·환율 등)의 30일 상승 충격 P95를 50%로 나눈 값입니다.</p></div>
    ${(() => { const H = (typeof RISK_HIST === "object" && Array.isArray(RISK_HIST) ? RISK_HIST : []).slice(-60); if (H.length < 2) return `<div class="block"><h3>지수 추이</h3><p class="note">일일 동기화가 쌓는 이력(${H.length}일)이 2일 이상이면 추이가 그려집니다.</p></div>`;
      const W = 600, Hh = 120, pad = 6, xs = i => pad + i * (W - 2 * pad) / (H.length - 1), ys = v => Hh - pad - (v / 100) * (Hh - 2 * pad);
      const path = H.map((h, i) => (i ? "L" : "M") + xs(i).toFixed(1) + "," + ys(h.index).toFixed(1)).join(" ");
      return `<div class="block"><h3>지수 추이 <span class="en">${H.length}d</span></h3><svg class="riskhist" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" role="img" aria-label="경제 위험 지수 추이">${[35, 55, 75].map(v => `<line x1="${pad}" x2="${W - pad}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)" stroke-dasharray="3 4"/>`).join("")}<path d="${path}" fill="none" stroke="var(--s4)" stroke-width="2" stroke-linejoin="round"/>${H.map((h, i) => `<circle cx="${xs(i)}" cy="${ys(h.index)}" r="3" fill="var(--panel)" stroke="var(--s4)" stroke-width="1.5"><title>${esc(h.d)} · ${h.index}${h.basket_p95 != null ? " · 바스켓 P95 " + h.basket_p95 : ""}</title></circle>`).join("")}</svg><span class="meta">${esc(H[0].d)} ~ ${esc(H[H.length - 1].d)} · 점선 35/55/75</span></div>`; })()}
    <div class="block"><h3>상품별 위험 등급 <span class="en">R1 낮음 – R5 극단</span></h3><span class="meta">분포 폭(P5~P95) 45% · 변동성 20% · 분쟁 전파 가중 20% · 7일 사건 밀도 15%</span>
      <table class="shk"><thead><tr><th>상품</th><th>등급</th><th>P5 ~ P95</th><th>치우침</th><th>연율 변동성</th><th>전파</th><th>7일 사건</th></tr></thead><tbody>
      ${r.perAsset.map(a => `<tr data-cm="${a.id}"><td>${esc(a.n)}</td><td>${grade(a.grade)}</td><td class="rng">${fmtPct(a.p5, a.bp)} ~ ${fmtPct(a.p95, a.bp)}</td><td class="trend ${a.skew == null ? "" : signCls(a.skew)}">${a.skew == null ? "—" : fmtPct(a.skew)}</td><td>${a.vol}%</td><td>${a.trw.toFixed(1)}</td><td>${a.n7}</td></tr>`).join("")}</tbody></table></div>
        <div class="block"><h3>한국 수입물가 충격 <span class="en">import basket</span></h3><span class="meta">가중치 × 기대 변동 · 기여 큰 순</span>
      <table class="shk"><thead><tr><th>품목</th><th>가중</th><th>기대</th><th>P95</th><th>기여</th></tr></thead><tbody>${r.kr.map(k => `<tr><td>${esc(k.n)}</td><td>${Math.round(k.w * 100)}%</td><td class="trend ${signCls(k.e)}">${fmtPct(k.e)}</td><td>${fmtPct(k.p95)}</td><td class="trend ${signCls(k.contrib)}">${fmtPct(k.contrib)}</td></tr>`).join("")}<tr class="sum"><td>바스켓</td><td>100%</td><td class="trend ${signCls(r.basket.mean)}">${fmtPct(r.basket.mean)}</td><td>${fmtPct(r.basket.p95)}</td><td></td></tr></tbody></table>
      <p class="note">바스켓 가중치는 한국 수입 구조의 근사치(상황판 설정값)이며 실제 통관 비중과 다를 수 있습니다.</p></div>
    <div class="btnrow"><button class="btn ghost" id="riskRerun">다시 추출</button><button class="btn ghost" id="riskAsk">분석관에게 경고 보고 초안 요청</button></div>`;
  $("#riskRerun").addEventListener("click", renderRisk);
  $("#riskAsk").addEventListener("click", () => { $("#q").value = `경제 위험 지수 ${r.index}(${r.level}). 구성요소: ${Object.entries(RISK_W).map(([k]) => r.comp[k].l + " " + Math.round(100 * r.comp[k].v)).join(", ")}. 상품 R5: ${r.perAsset.filter(x => x.grade >= 4).map(x => x.n).join(", ")}. 어떤 위험을 먼저 경고해야 하고, 어떤 징후가 지수를 더 올릴지, 한국 경제 관점의 권고를 경고 보고 형식으로 제안해줘.`; setTab("p-ai"); });
  $("#p-risk").querySelectorAll("tr[data-cm]").forEach(tr => tr.addEventListener("click", () => { if (typeof cmSel !== "undefined") { cmSel = tr.dataset.cm; setTab("p-cm"); renderCommod(); } }));
}
document.addEventListener("click", e => { if (e.target && e.target.id === "riskMore") setTab("p-risk"); });
