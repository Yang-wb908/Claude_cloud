/* ---------- 개편 A: 첫 화면 — 지난 접속 이후 변화 · 통합 경보 큐 · 지도 센서 레이어 ----------
   기준선(본 사건·발동·경보단계·확률)은 이 브라우저에만 저장한다(localStorage). 다른 사람·기기와 공유되지 않는다. */
const SEEN_KEY = "sit-seen-v1", ACK_KEY = "sit-ack-v1";
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };
const h32 = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
const evKey = e => h32((e.s || "") + "|" + e.d + "|" + (e.x || "").slice(0, 40));
const sevOfLevel = lv => Math.max(1, Math.min(5, lv || 1));
const ago = iso => { const m = (Date.now() - Date.parse(iso)) / 60000; return m < 90 ? Math.round(m) + "분 전" : m < 60 * 36 ? Math.round(m / 60) + "시간 전" : Math.round(m / 1440) + "일 전"; };
const kst = iso => { const d = new Date(Date.parse(iso) + 9 * 3600e3); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} KST`; };

/* 현재 상태 스냅숏 — 기준선 저장과 비교에 같이 쓴다 */
function firstState(){
  const wc = {}; Object.entries((typeof WC_ === "object" && WC_.theaters) || {}).forEach(([id, w]) => wc[id] = w.level);
  const scn = {}; ((typeof HAUTO_ === "object" && HAUTO_ && HAUTO_.scenarios) || []).forEach(v => scn[v.id] = v.p);
  let risk = null; try { risk = typeof RISK_ === "object" && RISK_ ? RISK_.index : null; } catch(e) {}
  return {at: new Date().toISOString(), ev: EVENTS.map(evKey), trip: ((TRIP_ && TRIP_.fired) || []).map(f => f.id), wc, scn, risk, alerts: alertQueue().map(a => a.key)};
}
function firstMark(){ lsSet(SEEN_KEY, firstState()); }

/* 통합 경보 큐: 트립와이어 · 경보단계 상향 · 위성 열점 · 인터넷 장애 · 재난 · 제재 · 해협 통항 급변 · 예측시장 괴리 */
function alertQueue(){
  const Q = [], add = a => Q.push(a);
  ((TRIP_ && TRIP_.fired) || []).forEach(f => add({key: "trip:" + f.id, sev: f.sev || 3, src: "트립와이어", h: f.title, x: `현재 ${f.current} (임계 ${f.op} ${f.threshold}) · ${f.why || ""}`, th: f.th}));
  const now = Date.now();
  Object.entries((typeof WC_ === "object" && WC_.theaters) || {}).forEach(([id, w]) => (w.history || []).forEach(hh => {
    if (hh.from != null && hh.to > hh.from && now - Date.parse(hh.d) < 3 * 86400e3) add({key: `wc:${id}:${hh.d}:${hh.to}`, sev: sevOfLevel(hh.to), src: "경보단계", h: `${TH[id] ? TH[id].name : id} ${hh.from}→${hh.to}`, x: hh.why || "", th: id});
  }));
  const F = typeof FIRMS_ === "object" ? FIRMS_ : null;
  ((F && F.alerts) || []).forEach(e => add({key: "firms:" + e.id, sev: 4, src: "위성 열점", h: e.p, x: e.x, th: e.th, at: e.at, url: e.s}));
  const O = typeof OPEN_ === "object" ? OPEN_ : null;
  if (O) {
    (((O.ioda || {}).data || {}).countries || []).filter(r => r.alert).forEach(r => add({key: `ioda:${r.code}:${(O.generated || "").slice(0, 10)}`, sev: 4, src: "인터넷 장애", h: `${r.name} 인터넷 대규모 장애`, x: `IODA 24시간 점수 ${Math.round(r.score).toLocaleString()} · ${Object.keys(r.sources || {}).join(", ")}`, th: r.th, at: r.at, url: `https://ioda.inetintel.cc.gatech.edu/country/${r.code}`}));
    ((O.gdacs || {}).data || []).filter(g => g.type !== "DR" && g.type !== "EQ").forEach(g => add({key: "gdacs:" + g.id, sev: g.level === "red" ? 4 : 2, src: "재난 경보", h: `${g.level === "red" ? "적색" : "주황"} · ${g.name}`, x: `${g.country || "해상"} · ${g.sev || ""}`, at: g.lon != null ? [g.lon, g.lat] : null, url: g.url}));
    ((O.quakes || {}).data || []).filter(q => q.near || q.mag >= 7).forEach(q => add({key: "usgs:" + q.url, sev: q.mag >= 7 ? 4 : 3, src: "지진", h: `M${q.mag.toFixed(1)} ${q.place}`, x: q.near ? "감시 대상 " + q.near : "", at: [q.lon, q.lat], url: q.url}));
    const of = (O.ofac || {}).data || {};
    if (of.n_new) add({key: `ofac:${of.d}:${of.n_new}`, sev: of.new_vessels ? 3 : 2, src: "OFAC 제재", h: `신규 지정 ${of.n_new}건${of.new_vessels ? " · 선박 " + of.new_vessels + "척" : ""}`, x: Object.entries(of.by_program || {}).slice(0, 4).map(([k, v]) => k + " " + v).join(", "), tab: "p-src"});
    const mt = ((O.poly || {}).data || {}).matched || {};
    ((typeof SCN_ === "object" && SCN_ && SCN_.templates) || []).forEach(t => { const m = mt[t.id]; if (!m) return; const ours = (typeof scState === "object" && scState.p[t.id] != null) ? scState.p[t.id] : t.p; const gap = ours - Math.round(m.p * 100);
      if (Math.abs(gap) >= 20) add({key: `poly:${t.id}:${Math.round(m.p * 20)}`, sev: 2, src: "예측시장 괴리", h: `${t.n}: 우리 ${ours}% · 시장 ${Math.round(m.p * 100)}%`, x: m.q, tab: "p-scn", url: m.url}); });
  }
  const D = typeof DOM_ === "object" ? DOM_ : null;
  if (D) {
    Object.entries((((D.adsb || {}).data || {}).areas) || {}).forEach(([k, a]) => { if (a.status === "surge") add({key: `adsb:${k}:${(D.generated || "").slice(0, 13)}`, sev: 4, src: "군용기", h: `${a.name} 정찰·급유기 ${a.key}대 (평소 ${a.base})`, x: Object.entries(a.by_role || {}).map(([r, n]) => r + " " + n).join(", ") + " · 공개 ADS-B 기준", th: a.th, at: [(a.bbox[0] + a.bbox[2]) / 2, (a.bbox[1] + a.bbox[3]) / 2]}); });
    const cut3 = new Date(Date.now() - 3 * 86400e3).toISOString().slice(0, 10);
    ((((D.kev || {}).data || {}).recent) || []).filter(r => r.added >= cut3 && (r.edge || r.ransom)).forEach(r => add({key: "kev:" + r.cve, sev: r.ransom ? 3 : 2, src: "사이버", h: `악용 확인 ${r.vendor} ${r.product} (${r.cve})`, x: r.name + (r.ransom ? " · 랜섬웨어 사용" : " · 경계 장비"), url: "https://nvd.nist.gov/vuln/detail/" + r.cve, tab: "p-src"}));
    const kr = (((D.ransom || {}).data || {}).kr) || [];
    if (kr.length) add({key: `rwkr:${kr.length}:${kr[0].d}`, sev: kr.length >= 3 ? 3 : 2, src: "사이버", h: `한국 랜섬웨어 피해 게시 ${kr.length}건 (7일)`, x: kr.slice(0, 4).map(r => r.victim + " (" + r.group + ")").join(", "), th: "korea", tab: "p-src"});
  }
  const G = typeof FEEDS_ === "object" && FEEDS_ && FEEDS_.gfw && FEEDS_.gfw.data;
  if (G) Object.entries(G).forEach(([k, v]) => { if (v && v.chg != null && Math.abs(v.chg) >= 0.25) add({key: `gfw:${k}:${v.latest}`, sev: v.chg <= -0.25 ? 3 : 2, src: "해협 통항", h: `${v.n} 체류 선박 ${v.chg > 0 ? "+" : ""}${Math.round(v.chg * 100)}% (전주 대비)`, x: `7일 평균 ${v.vessels_avg7}척 · 암흑 선박 7일 ${v.dark_7d}척`, at: v.bbox ? [(v.bbox[0] + v.bbox[2]) / 2, (v.bbox[1] + v.bbox[3]) / 2] : null, tab: "p-sea"}); });
  return Q.sort((a, b) => b.sev - a.sev);
}

function firstHtml(){
  const seen = lsGet(SEEN_KEY, null), ack = new Set(lsGet(ACK_KEY, []));
  const Q = alertQueue(), open = Q.filter(a => !ack.has(a.key)), done = Q.filter(a => ack.has(a.key));
  let chg = "";
  if (seen) {
    const sev = new Set(seen.ev || []), newEv = EVENTS.filter(e => !sev.has(evKey(e)));
    const byTh = {}; newEv.forEach(e => { const k = e.th || "_"; byTh[k] = (byTh[k] || 0) + 1; });
    const top = newEv.slice().sort((a, b) => (b.r || 0) - (a.r || 0) || b.d.localeCompare(a.d)).slice(0, 6);
    const wcCh = Object.entries((typeof WC_ === "object" && WC_.theaters) || {}).filter(([id, w]) => seen.wc && seen.wc[id] != null && seen.wc[id] !== w.level).map(([id, w]) => ({id, from: seen.wc[id], to: w.level}));
    const tripNew = ((TRIP_ && TRIP_.fired) || []).filter(f => !(seen.trip || []).includes(f.id));
    const tripOff = (seen.trip || []).filter(id => !((TRIP_ && TRIP_.fired) || []).some(f => f.id === id));
    const scnCh = ((typeof HAUTO_ === "object" && HAUTO_ && HAUTO_.scenarios) || []).filter(v => seen.scn && seen.scn[v.id] != null && Math.abs(v.p - seen.scn[v.id]) >= 3).map(v => ({v, from: seen.scn[v.id]}));
    let rNow = null; try { rNow = RISK_ ? RISK_.index : null; } catch(e) {}
    const rCh = rNow != null && seen.risk != null && Math.abs(rNow - seen.risk) >= 2 ? rNow - seen.risk : null;
    const alNew = open.filter(a => !(seen.alerts || []).includes(a.key));
    const nothing = !newEv.length && !wcCh.length && !tripNew.length && !tripOff.length && !scnCh.length && rCh == null && !alNew.length;
    const scnName = id => { const t = ((typeof SCN_ === "object" && SCN_ && SCN_.templates) || []).find(x => x.id === id); return t ? t.n : id; };
    chg = `<div class="block ${wcCh.some(c => c.to > c.from) || tripNew.length ? "sev4" : "sev2"} first-chg"><h3>지난 접속 이후 <span class="en">${esc(kst(seen.at))} · ${esc(ago(seen.at))}</span></h3>
      ${nothing ? `<p class="note">그 사이 바뀐 것이 없습니다.</p>` : `<div class="sctiles">${[["새 사건", newEv.length], ["새 경보", alNew.length], ["경보단계 변경", wcCh.length], ["트립와이어 발동", tripNew.length]].map(([l, v]) => `<div class="sct"><span class="l">${l}</span><span class="v">${v}</span></div>`).join("")}</div>
      <ul class="wl">
        ${wcCh.map(c => `<li><button class="thchip sev${TH[c.id] ? TH[c.id].sev : 3}" data-th="${c.id}">${esc(TH[c.id] ? TH[c.id].name : c.id)}</button> 경보단계 ${c.from} → <b>${c.to}</b> ${c.to > c.from ? "▲" : "▼"}</li>`).join("")}
        ${tripNew.map(f => `<li><b>발동</b> ${esc(f.title)} <small>현재 ${esc(String(f.current))}</small></li>`).join("")}
        ${tripOff.length ? `<li><small>해제된 트립와이어 ${tripOff.length}건: ${tripOff.map(esc).join(", ")}</small></li>` : ""}
        ${rCh != null ? `<li>경제 위험 지수 ${seen.risk} → <b>${rNow}</b> (${rCh > 0 ? "+" : ""}${rCh})</li>` : ""}
        ${scnCh.map(c => `<li>시나리오 ${esc(scnName(c.v.id))} ${c.from}% → <b>${c.v.p}%</b></li>`).join("")}
        ${newEv.length ? `<li>새 사건 ${newEv.length}건 — ${Object.entries(byTh).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => (TH[k] ? `<button class="thchip sev${TH[k].sev}" data-th="${k}">${esc(TH[k].name.split("·")[0])} ${v}</button>` : `기타 ${v}`)).join(" ")}</li>` : ""}
      </ul>
      ${top.length ? `<ul class="wl first-ev">${top.map(e => `<li data-ev="${esc(e.id)}"><time>${esc(md(e.d))}</time> ${esc(e.x)}${e.th && TH[e.th] ? ` <small>${esc(TH[e.th].name)}</small>` : ""}</li>`).join("")}</ul>` : ""}`}
      <div class="btnrow"><button class="btn ghost" id="firstMark" title="지금 상태를 다음 비교의 기준으로 저장합니다">확인 완료 — 기준 갱신</button></div></div>`;
  } else {
    chg = `<div class="block sev2 first-chg"><h3>지난 접속 이후 <span class="en">first visit</span></h3><p class="note">이 브라우저에서 처음 열었습니다. 지금 상태를 기준으로 저장해 두고, 다음에 열면 그 사이 생긴 사건·경보·경보단계·확률 변화를 여기 먼저 보여줍니다.</p></div>`;
  }
  const row = a => `<li class="aq sev${a.sev}${ack.has(a.key) ? " acked" : ""}" data-key="${esc(a.key)}"><span class="aqs">${esc(a.src)}</span><div><b>${esc(a.h)}</b>${a.th && TH[a.th] ? ` <button class="thchip sev${TH[a.th].sev}" data-th="${a.th}">${esc(TH[a.th].name.split("·")[0])}</button>` : ""}<small>${esc(a.x || "")}</small></div>
    <span class="aqb">${a.at ? `<button class="thchip" data-fly="${a.at.join(",")}">지도</button>` : ""}${a.tab ? `<button class="thchip" data-tab="${a.tab}">보기</button>` : ""}${a.url ? `<a class="thchip" href="${esc(a.url)}" target="_blank" rel="noopener">원문</a>` : ""}${ack.has(a.key) ? "" : `<button class="thchip" data-ack="${esc(a.key)}">확인</button>`}</span></li>`;
  const queue = `<div class="block ${open.some(a => a.sev >= 4) ? "sev4" : open.length ? "sev3" : "sev1"}"><h3>경보 큐 <span class="en">${open.length} open · ${done.length} acknowledged</span></h3>
    <span class="meta">트립와이어·경보단계 상향·위성 열점·인터넷 장애·재난·제재·해협 통항·예측시장 괴리를 한 곳에. '확인'은 이 브라우저에만 기록됩니다.</span>
    ${open.length ? `<ul class="aql">${open.slice(0, 8).map(row).join("")}</ul>${open.length > 8 ? `<details><summary>나머지 ${open.length - 8}건</summary><ul class="aql">${open.slice(8).map(row).join("")}</ul></details>` : ""}` : `<p class="note">확인하지 않은 경보가 없습니다.</p>`}
    ${done.length ? `<details><summary>확인한 경보 ${done.length}건</summary><ul class="aql">${done.map(row).join("")}</ul></details>` : ""}
    ${open.length > 1 ? `<div class="btnrow"><button class="btn ghost" id="ackAll">모두 확인</button></div>` : ""}</div>`;
  return chg + queue;
}
function firstBind(root){
  if (!lsGet(SEEN_KEY, null)) firstMark();   // 첫 방문: 기준만 저장
  const rerender = () => { try { renderBluf(); } catch(e) {} };
  root.querySelectorAll("[data-ack]").forEach(b => b.onclick = e => { e.stopPropagation(); const s = new Set(lsGet(ACK_KEY, [])); s.add(b.dataset.ack); lsSet(ACK_KEY, [...s].slice(-400)); rerender(); });
  const all = root.querySelector("#ackAll"); if (all) all.onclick = () => { const s = new Set(lsGet(ACK_KEY, [])); alertQueue().forEach(a => s.add(a.key)); lsSet(ACK_KEY, [...s].slice(-400)); rerender(); };
  const mk = root.querySelector("#firstMark"); if (mk) mk.onclick = () => { firstMark(); rerender(); };
  root.querySelectorAll("[data-fly]").forEach(b => b.onclick = e => { e.stopPropagation(); const [lon, lat] = b.dataset.fly.split(",").map(Number); setLayer("sens", true); if (innerWidth < 960 && typeof scrollToMap === "function") scrollToMap(); flyToPoint([lon, lat], 12); });
  root.querySelectorAll(".aq [data-tab]").forEach(b => b.onclick = e => { e.stopPropagation(); setTab(b.dataset.tab); });
  root.querySelectorAll(".first-ev [data-ev]").forEach(li => li.onclick = () => { const e = EVENTS.find(x => x.id === li.dataset.ev); if (e && e.at) { flyToPoint(e.at, 10); } });
}
/* 탭을 닫거나 다른 데로 갈 때, 3분 이상 봤으면 지금을 다음 비교 기준으로 */
const FIRST_OPENED = Date.now();
addEventListener("pagehide", () => { if (Date.now() - FIRST_OPENED > 3 * 60e3) firstMark(); });

/* 지도 센서 레이어 데이터: 위성 열점 · 인터넷 장애 · 지진/재난 · 해협 통항 급변 */
function sensorPoints(){
  const P = [];
  const F = typeof FIRMS_ === "object" ? FIRMS_ : null;
  ((F && F.sites) || []).forEach(s => { if (s.status === "alert" || (s.n || 0) >= 3) P.push({k: "fire", sev: s.status === "alert" ? 5 : 3, at: s.at || [s.lon, s.lat], lab: `열점 ${s.n}`, h: s.n_ko, x: `최근 2일 VIIRS 열점 ${s.n}건, 최대 FRP ${Math.round(s.frp_max || 0)}MW · 평소 ${s.base_n == null ? "학습 중" : s.base_n + "건"} · ${s.status === "alert" ? "경보" : s.status === "learning" ? "기준선 학습 중" : "평소 범위"}`}); });
  ((F && F.aois) || []).forEach(a => { if (a.status === "alert") P.push({k: "fire", sev: 5, at: [(a.bbox[0] + a.bbox[2]) / 2, (a.bbox[1] + a.bbox[3]) / 2], lab: `열점 ${a.n}`, h: a.n_ko, x: `하루 열점 ${a.n}건 (평소 ${a.base_n}건)`}); });
  const O = typeof OPEN_ === "object" ? OPEN_ : null;
  if (O) {
    (((O.ioda || {}).data || {}).countries || []).forEach(r => { if (r.at && (r.alert || r.th)) P.push({k: "net", sev: r.alert ? 5 : 2, at: r.at, lab: r.alert ? "인터넷 장애" : "", h: `${r.name} 인터넷`, x: `IODA 24시간 점수 ${Math.round(r.score).toLocaleString()} · ${Object.keys(r.sources || {}).join(", ")}${r.alert ? " · 경보" : " · 경보 기준 미만"}`}); });
    ((O.quakes || {}).data || []).forEach(q => P.push({k: "quake", sev: q.mag >= 7 ? 5 : q.near ? 4 : 3, at: [q.lon, q.lat], lab: "M" + q.mag.toFixed(1), h: `규모 ${q.mag.toFixed(1)} 지진`, x: `${q.place} · ${q.d}${q.near ? " · 감시 대상 " + q.near : ""}`}));
    ((O.gdacs || {}).data || []).filter(g => g.type !== "DR" && g.lon != null && g.type !== "EQ").forEach(g => P.push({k: "haz", sev: g.level === "red" ? 5 : 3, at: [g.lon, g.lat], lab: g.name.replace(/^(Tropical Cyclone|Eruption|Flood in|Forest fires? in)\s*/i, "").slice(0, 14), h: `GDACS ${g.level === "red" ? "적색" : "주황"} · ${g.name}`, x: `${g.country || "해상"} · ${g.from}~${g.to} · ${g.sev || ""}`}));
  }
  const G = typeof FEEDS_ === "object" && FEEDS_ && FEEDS_.gfw && FEEDS_.gfw.data;
  if (G) Object.values(G).forEach(v => { if (v && v.bbox && v.chg != null && Math.abs(v.chg) >= 0.15) P.push({k: "ship", sev: v.chg <= -0.25 ? 4 : 2, at: [(v.bbox[0] + v.bbox[2]) / 2, (v.bbox[1] + v.bbox[3]) / 2], lab: `${v.chg > 0 ? "+" : ""}${Math.round(v.chg * 100)}%`, h: `${v.n} 선박 통항`, x: `7일 평균 ${v.vessels_avg7}척, 전주 ${v.vessels_prev7}척 · 레이더 탐지 7일 ${v.sar_7d} · 암흑 선박 ${v.dark_7d} (Global Fishing Watch)`}); });
  const D = typeof DOM_ === "object" ? DOM_ : null;
  const RK = {isr: "정찰·감시", tanker: "공중급유", bomber: "폭격기", airlift: "수송"};
  if (D) Object.values((((D.adsb || {}).data || {}).areas) || {}).forEach(a => (a.ac || []).forEach(x => { if (x.role !== "other") P.push({k: "air", sev: a.status === "surge" ? 5 : x.role === "bomber" ? 4 : 3, at: [x.lon, x.lat], lab: x.t, h: `${RK[x.role] || x.role} ${x.t} ${x.flight || x.reg || ""}`.trim(), x: `${a.name} · 고도 ${x.alt ?? "?"}ft · 공개 ADS-B 위치(수집 시점 ${((D.generated || "").slice(5, 16).replace("T", " "))}Z)`}); }));
  return P;
}
