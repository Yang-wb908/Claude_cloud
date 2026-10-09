/* ---------- 정보부 운영 계층 (ops.js): PIR 요구관리 · 수집 계획 · 경보단계 이력 · 당직 일지 · 생산물 ---------- */
let PIRS_ = typeof PIRS === "object" && PIRS ? PIRS : {items: []};
let WC_ = typeof WATCHCON === "object" && WATCHCON ? WATCHCON : {theaters: {}};
let WLOG_ = typeof WATCHLOG === "object" && WATCHLOG ? WATCHLOG : {entries: []};
let PROD_ = typeof PRODUCTS === "object" && PRODUCTS ? PRODUCTS : {products: []};
const RAW_BASE = `https://github.com/${REPO}/blob/claude/compassionate-rubin-jmaq9e/`;
const PIR_TAGMAP = {middle_east: ["mena", "middle_east", "iran", "gulf", "redsea"], europe: ["europe", "ukraine", "blacksea"], africa: ["africa", "ethiopia", "sahel", "sudan"], korea: ["korea", "asia"], east_asia: ["asia", "east_asia", "taiwan", "china"], maritime: ["maritime", "shipping"], energy: ["energy", "markets"], ags: ["ags", "markets"], markets: ["markets"], weather: ["weather", "climate"]};
function pirSources(p){
  const want = new Set([].concat(...(p.tags || []).map(t => PIR_TAGMAP[t] || [t])));
  const direct = new Set([].concat(...(p.eei || []).map(e => e.src || [])));
  return SRC_.filter(s => direct.has(s.id) || want.has(String(s.region || "").toLowerCase()) || (s.tags || []).some(t => want.has(String(t).toLowerCase())));
}
function kstNow(){ const d = new Date(Date.now() + 9 * 3600e3); return {h: d.getUTCHours(), m: d.getUTCMinutes(), d: d.toISOString().slice(0, 10)}; }
function shiftNow(){ const k = kstNow(); return k.h >= 8 && k.h < 20 ? "주간" : "야간"; }
function openTaskings(){
  const out = [];
  (RFI_ || []).forEach(i => out.push({k: "RFI", x: `#${i.number} ${i.title}`, url: i.url}));
  judgItems().filter(j => j.outcome == null && j.due && j.due < REF).forEach(j => out.push({k: "판정 기한", x: `${j.id} ${j.x.slice(0, 70)}`, tab: "p-bt"}));
  PIRS_.items.forEach(p => (p.eei || []).filter(e => e.status === "공백").forEach(e => out.push({k: "EEI 공백", x: `${p.id}.${e.id.split(".").pop()} ${e.q}`, tab: "p-pir"})));
  if (TRIP_ && TRIP_.fired) TRIP_.fired.forEach(f => out.push({k: "트립와이어", x: f.title, tab: "p-bluf"}));
  judgItems().forEach(j => (j.dissent || []).forEach(d => out.push({k: "이견", x: `${j.id} ${d.x.slice(0, 70)}`, tab: "p-bt"})));
  return out;
}
function renderPIR(){
  const items = [...PIRS_.items].sort((a, b) => (a.pri || 9) - (b.pri || 9));
  const cov = items.map(p => ({p, src: pirSources(p)}));
  $("#p-pir").innerHTML = `
    <div class="block"><h3>우선정보요구 <span class="en">PIR / EEI · ${esc(PIRS_.asof || "")}</span></h3><span class="meta">PIR ${items.length}건 · EEI ${items.reduce((a, p) => a + (p.eei || []).length, 0)}건 · 공백 ${items.reduce((a, p) => a + (p.eei || []).filter(e => e.status === "공백").length, 0)}건</span>
      <div class="btnrow"><a class="btn ghost" href="https://github.com/${REPO}/issues/new?template=pir.yml&labels=pir" target="_blank" rel="noopener">PIR 등록</a><a class="btn ghost" href="https://github.com/${REPO}/issues/new?template=rfi.yml&labels=rfi" target="_blank" rel="noopener">RFI 발행</a><button class="btn ghost" id="pirAsk">공백 점검 요청(에이전트)</button></div>
      <p class="note">정보순환: 요구(PIR/EEI) → 수집 계획(수집원 매칭) → 처리·분석(상황판) → 생산(DIB·WR) → 배포 → 피드백(RFI·이견). EEI 상태는 당직이 갱신하고, 공백은 RFI로 발행합니다.</p></div>
    ${cov.map(({p, src}) => { const gaps = (p.eei || []).filter(e => e.status === "공백"); return `<div class="block pir sev${TH[p.th] ? TH[p.th].sev : 3}"><h3><span class="pid">${esc(p.id)}</span> <span class="tag">P${p.pri}</span> ${esc(p.q)}</h3>
      <span class="meta">${TH[p.th] ? `<button class="thchip sev${TH[p.th].sev}" data-th="${p.th}">${esc(TH[p.th].name)}</button>` : esc(p.th)} 담당 ${esc(p.owner || "-")} · 기한 ${esc(p.due || "-")} · ${esc(p.status || "")} · 수집원 ${src.length}곳${gaps.length ? ` · <span class="tag hot">공백 ${gaps.length}</span>` : ""}</span>
      <table class="shk eei"><thead><tr><th>EEI</th><th>징후</th><th>수집원</th><th>상태</th><th>최근</th></tr></thead><tbody>${(p.eei || []).map(e => `<tr class="${e.status === "공백" ? "gap" : ""}"><td><b>${esc(e.id)}</b> ${esc(e.q)}</td><td>${esc(e.ind || "")}</td><td>${(e.src || []).map(id => { const s = SRC_.find(x => x.id === id); return `<span class="tag" title="${esc(s ? s.name : id)}">${esc(id)}</span>`; }).join(" ")}</td><td><span class="tag ${e.status === "공백" ? "hot" : e.status === "충족" ? "ok" : ""}">${esc(e.status || "")}</span></td><td>${esc(e.last || "—")}</td></tr>`).join("")}</tbody></table>
      <details><summary>수집 계획: 매칭 수집원 ${src.length}곳</summary><ul class="src">${src.slice(0, 20).map(s => `<li><span class="grade g${String(s.grade || "C")[0].toLowerCase()}">${esc(s.grade || "")}</span> ${esc(s.name)} <small>${esc(s.kind)} · ${esc(s.region || "")}${s.verify ? " · 검증 전" : ""}</small></li>`).join("")}</ul></details></div>`; }).join("")}`;
  $("#pirAsk").addEventListener("click", () => { $("#q").value = "우선정보요구(get_ops)의 EEI 공백과 답변 지연 항목을 점검해줘. 각 공백에 대해 어떤 수집원·지표로 메울 수 있는지, RFI로 발행할 문안(질문·기한·담당)을 제안하고, 최근 사건(search_events)으로 이미 답할 수 있는 EEI는 상태를 '충족'으로 바꾸자고 제안해줘."; setTab("p-ai"); });
  $("#p-pir").querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => { if (typeof select === "function") select(b.dataset.th); }));
}
function renderProducts(){
  const list = [...(PROD_.products || [])].sort((a, b) => (b.d + b.serial).localeCompare(a.d + a.serial));
  const kinds = {DIB: "일일 정보 브리프", WR: "경고 보고", IA: "정보 평가", SPOT: "속보"};
  const dis = judgItems().filter(j => (j.dissent || []).length);
  $("#p-prod").innerHTML = `
    <div class="block"><h3>생산물 <span class="en">finished intelligence · ${list.length}</span></h3><span class="meta">일련번호 DIB-YY-MMDD(일일 브리프, 09:40 KST) · WR-YY-MMDD-NN(경고 보고, 트립와이어·경보단계 변경 시) · 분류 UNCLASSIFIED // OSINT</span>
      <table class="shk"><thead><tr><th>일련번호</th><th>종류</th><th>제목</th><th>날짜</th></tr></thead><tbody>${list.slice(0, 60).map(p => `<tr><td><a href="${RAW_BASE}${esc(p.path)}" target="_blank" rel="noopener"><b>${esc(p.serial)}</b></a></td><td><span class="tag ${p.kind === "WR" ? "hot" : ""}">${esc(kinds[p.kind] || p.kind)}</span></td><td>${esc(p.title || "")}${p.th && TH[p.th] ? ` <small>${esc(TH[p.th].name)}</small>` : ""}</td><td>${esc(p.d)}</td></tr>`).join("") || '<tr><td colspan="4"><small>아직 생산물이 없습니다. 일일 동기화가 DIB를 만듭니다.</small></td></tr>'}</tbody></table>
      <p class="note">저장소 <code>products/</code>에 Markdown으로 보존되고 SITREP Release에 첨부됩니다. 아티팩트에서 열면 GitHub 파일로 이동합니다.</p></div>
    <div class="block"><h3>분석 기준 <span class="en">ICD 203 tradecraft</span></h3><ul class="wl">
      <li><b>출처 기술</b> 사건·지표마다 Admiralty 등급(A1~F6). 단일 출처 판단은 신뢰도 '낮음' 상한.</li><li><b>불확실성 표현</b> ICD 203 확률 용어 + 숫자 범위. 판단 장부에 등록해 기한 뒤 판정(Brier).</li><li><b>가정·대안 가설</b> ACH 매트릭스로 가설 탈락 기록, 이견 채널 보존.</li><li><b>분석 변경 추적</b> 판단 변경은 장부·경보단계 이력에 날짜·근거·작성자와 함께 남김.</li><li><b>독자 중심</b> BLUF 선행, 한국 영향과 권고를 분리.</li></ul>
      <div class="btnrow"><a class="btn ghost" href="https://github.com/${REPO}/issues/new?template=dissent.yml&labels=dissent" target="_blank" rel="noopener">이견 제기</a></div></div>
    ${dis.length ? `<div class="block"><h3>이견 기록 <span class="en">dissent channel · ${dis.length}</span></h3><ul class="wl">${dis.map(j => `<li><b>${esc(j.id)}</b> ${esc(j.x.slice(0, 90))}<ul>${j.dissent.map(d => `<li><small>${esc(d.d || "")} ${esc(d.by || "")}${d.p != null ? ` · 대안 ${Math.round(d.p * 100)}%` : ""}: ${esc(d.x)}</small></li>`).join("")}</ul></li>`).join("")}</ul></div>` : ""}`;
}
function renderWatch(){
  const k = kstNow(), shift = shiftNow();
  const last = (WLOG_.entries || []).slice(-1)[0];
  const tasks = openTaskings();
  const wcRows = DATA.theaters.map(t => { const w = (WC_.theaters || {})[t.id] || {}; const h = (w.history || []).slice(-1)[0]; return {t, level: w.level ?? t.sev, since: w.since, h}; }).sort((a, b) => b.level - a.level);
  const changes7 = [].concat(...Object.entries(WC_.theaters || {}).map(([id, w]) => (w.history || []).filter(h => h.from != null && daysAgo(h.d) >= 0 && daysAgo(h.d) < 7).map(h => ({id, ...h})))).sort((a, b) => b.d.localeCompare(a.d));
  const handoverUrl = `https://github.com/${REPO}/issues/new?template=handover.yml&labels=handover&title=${encodeURIComponent(`[당직] ${k.d} ${shift} 인수인계`)}&open=${encodeURIComponent(tasks.slice(0, 8).map(t => `${t.k}: ${t.x}`).join("\n"))}`;
  $("#p-watch").innerHTML = `
    <div class="block sev${IW.global.level}"><h3>상황실 당직 <span class="en">watch floor · ${shift} ${String(k.h).padStart(2, "0")}:${String(k.m).padStart(2, "0")} KST</span></h3>
      <div class="sctiles">${[["현재 교대", shift, shift === "주간" ? "08:00~20:00 KST" : "20:00~08:00 KST"], ["당직 분석관", last ? esc(last.officer || "미지정") : "미지정", last ? `최근 인수 ${esc(last.d)} ${esc(last.t || "")}` : "인수인계 없음"], ["미결 과업", tasks.length, `RFI ${tasks.filter(t => t.k === "RFI").length} · 판정 ${tasks.filter(t => t.k === "판정 기한").length} · EEI ${tasks.filter(t => t.k === "EEI 공백").length}`], ["경보 변경 7일", changes7.length, changes7[0] ? esc(changes7[0].id + " " + changes7[0].from + "→" + changes7[0].to) : "변경 없음"]].map(([l, v, s]) => `<div class="sct"><span class="l">${l}</span><span class="v">${v}</span><small>${s}</small></div>`).join("")}</div>
      <div class="btnrow"><a class="btn" href="${handoverUrl}" target="_blank" rel="noopener">인수인계 작성</a><a class="btn ghost" href="https://github.com/${REPO}/issues/new?template=watchcon.yml&labels=watchcon" target="_blank" rel="noopener">경보단계 변경</a><button class="btn ghost" id="watchAsk">교대 브리핑 초안(에이전트)</button></div></div>
    <div class="block"><h3>미결 과업 <span class="en">taskings · ${tasks.length}</span></h3>${tasks.length ? `<ul class="wl">${tasks.map(t => `<li><span class="tag ${t.k === "트립와이어" || t.k === "EEI 공백" ? "hot" : ""}">${esc(t.k)}</span> ${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.x)}</a>` : t.tab ? `<button class="lnk" data-tab="${t.tab}">${esc(t.x)}</button>` : esc(t.x)}</li>`).join("")}</ul>` : '<p class="note">미결 과업이 없습니다.</p>'}</div>
    <div class="block"><h3>경보단계 <span class="en">WATCHCON by theater</span></h3><table class="shk"><thead><tr><th>전역</th><th>단계</th><th>기준일</th><th>최근 변경 근거</th></tr></thead><tbody>${wcRows.map(r => `<tr><td><button class="thchip sev${r.level}" data-th="${r.t.id}">${esc(r.t.name)}</button></td><td><b class="sev${r.level}" style="color:var(--c)">${r.level}</b></td><td>${esc(r.since || "")}</td><td><small>${r.h ? esc((r.h.from != null ? r.h.from + "→" + r.h.to + " · " : "") + (r.h.why || "")) : ""}</small></td></tr>`).join("")}</tbody></table>
      ${changes7.length ? `<ul class="wl">${changes7.map(c => `<li><b>${esc(c.d)}</b> ${esc(TH[c.id] ? TH[c.id].name : c.id)} ${c.from}→${c.to} <small>${esc(c.why || "")} · ${esc(c.by || "")}</small></li>`).join("")}</ul>` : ""}</div>
    <div class="block"><h3>상황 되감기 <span class="en">rewind</span></h3><span class="meta">날짜를 고르면 그날의 경보단계·열린 판단·위험 지수·사건 수를 보여줍니다</span>
      <div class="btnrow"><input type="date" id="rewindDate" value="${esc(REF)}" max="${esc(REF)}" style="background:var(--panel2);color:var(--ink);border:1px solid var(--line);border-radius:6px;padding:4px 8px"><button class="btn ghost" id="rewindEv">그날 사건 보기</button></div><div id="rewindOut">${rewindHtml(REF)}</div></div>
    <div class="block"><h3>인수인계 일지 <span class="en">handover log · ${(WLOG_.entries || []).length}</span></h3>${(WLOG_.entries || []).slice(-10).reverse().map(e => `<details class="fc" ${e === last ? "open" : ""}><summary><b>${esc(e.d)} ${esc(e.t || "")}</b> ${esc(e.shift || "")} · ${esc(e.officer || "")}<small>${esc((e.summary || "").slice(0, 120))}</small></summary><p>${esc(e.summary || "")}</p>${(e.open || []).length ? `<b>미결</b><ul class="wl">${e.open.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}${(e.tasks || []).length ? `<b>과업</b><ul class="wl">${e.tasks.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</details>`).join("") || '<p class="note">기록 없음</p>'}</div>`;
  const rd = $("#rewindDate"); if (rd) rd.addEventListener("change", () => { $("#rewindOut").innerHTML = rewindHtml(rd.value); });
  const re = $("#rewindEv"); if (re) re.addEventListener("click", () => { const d = rd.value; REF = d; rangeDays = 1; try { renderEventList(); renderTimeline(); renderTheaters(); dirty = true; needDetail = true; } catch(e) {} setTab("p-ev"); });
  $("#watchAsk").addEventListener("click", () => { $("#q").value = `${k.d} ${shift} 교대 인수인계 브리핑 초안을 써줘. get_ops로 PIR 공백·경보단계·미결 과업을, search_events로 지난 12시간 사건을, get_risk로 경제 위험을 확인한 뒤 '상황 요약 / 변화 / 미결 / 다음 근무 과업 / 경고 후보' 순으로 10줄 이내로.`; setTab("p-ai"); });
  $("#p-watch").querySelectorAll("[data-th]").forEach(b => b.addEventListener("click", () => { if (typeof select === "function") select(b.dataset.th); }));
  $("#p-watch").querySelectorAll("button.lnk").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
}
let COV_ = typeof COVERAGE === "object" ? COVERAGE : null;
let FEEDS_ = typeof FEEDS === "object" ? FEEDS : null;
let FIRMS_ = typeof FIRMS === "object" ? FIRMS : null;
let OPEN_ = typeof OPEN === "object" ? OPEN : null;
const fmtSigned = (v, dp) => v == null ? "—" : (v > 0 ? "+" : "") + Number(v).toFixed(dp == null ? 1 : dp);
function feedNote(f, env){ return f && f.ok === false ? `<p class="note">${esc(f.err && f.err.indexOf("미설정") >= 0 ? env + " 이 저장소 Secrets 에 없어 수집하지 않았습니다." : "최근 수집 실패: " + (f.err || ""))}${f.at ? " 아래는 " + esc(f.at.slice(0, 16)) + "Z 값." : ""}</p>` : ""; }
/* 위성 열점 (NASA FIRMS) — 운영 탭 */
function opsFirmsHtml(){
  const F = FIRMS_;
  if (!F) return `<div class="block"><h3>위성 열점 <span class="en">NASA FIRMS · VIIRS</span></h3><p class="note">FIRMS_MAP_KEY 를 저장소 Secrets 에 넣으면 6시간마다 감시 시설 ${""}주변과 분쟁 지역의 위성 열점을 셉니다.</p></div>`;
  const al = (F.sites || []).filter(s => s.status === "alert").concat((F.aois || []).filter(a => a.status === "alert"));
  const rows = (F.sites || []).slice().sort((a, b) => (b.status === "alert") - (a.status === "alert") || (b.n || 0) - (a.n || 0)).slice(0, 18);
  const st = s => s.status === "alert" ? '<span class="chk" style="color:var(--s5);border-color:var(--s5)">경보</span>' : s.status === "learning" ? '<span class="chk">기준선 학습</span>' : '<span class="chk" style="color:var(--s1);border-color:var(--s1)">평소</span>';
  return `<div class="block ${al.length ? "sev4" : "sev2"}"><h3>위성 열점 <span class="en">NASA FIRMS · VIIRS · ${esc((F.generated || "").slice(5, 16).replace("T", " "))}Z</span></h3>
    <span class="meta">시설 ${(F.sites || []).length}곳·분쟁 지역 ${(F.aois || []).length}곳의 최근 2일 열점을 각자의 평소 수준(지난 14일 중앙값)과 비교. 정유·가스 시설은 평소 플레어가 있어 3배 이상일 때만 경보. 기준선 학습 중 ${F.learning || 0}곳.</span>
    ${al.length ? `<ul class="wl">${(F.alerts || []).map(e => `<li><b>${esc(e.p)}</b> ${esc(e.x)} <small><a href="${esc(e.s)}" target="_blank" rel="noopener">FIRMS 지도</a></small></li>`).join("")}</ul>` : `<p class="note">경보 없음.</p>`}
    <table class="shk"><thead><tr><th style="text-align:left">시설</th><th>최근 2일</th><th>평소</th><th>최대 FRP</th><th>상태</th></tr></thead><tbody>${rows.map(s => `<tr><td style="text-align:left">${esc(s.n_ko)}<small style="display:block;color:var(--faint)">${esc(TH[s.th] ? TH[s.th].name : s.th)}</small></td><td>${s.n}</td><td>${s.base_n == null ? "—" : Math.round(s.base_n)}</td><td>${s.frp_max ? Math.round(s.frp_max) + "MW" : "—"}</td><td>${st(s)}</td></tr>`).join("")}</tbody></table>
    ${(F.aois || []).length ? `<h4 style="margin:12px 0 4px">분쟁 지역 일일 열점</h4><table class="shk"><tbody>${F.aois.map(a => `<tr><td style="text-align:left">${esc(a.n_ko)}</td><td>${a.n}</td><td>${a.base_n == null ? "—" : "평소 " + Math.round(a.base_n)}</td><td>${st(a)}</td></tr>`).join("")}</tbody></table>` : ""}
    ${F.errors && F.errors.length ? `<p class="note">일부 요청 실패 ${F.errors.length}건</p>` : ""}</div>`;
}
/* 공개 피드 (IODA 인터넷 장애 · USGS/GDACS 재난 · OFAC 신규 제재) — 운영 탭 */
function openNote(p, name){ return p && p.ok === false ? `<p class="note">${name ? esc(name) + " " : ""}최근 수집 실패: ${esc(p.err || "")}${p.at ? " · 아래는 " + esc(p.at.slice(0, 16)) + "Z 값" : ""}</p>` : ""; }
function opsOpenHtml(){
  const O = OPEN_;
  if (!O) return `<div class="block"><h3>인터넷 장애 · 재난 · 신규 제재 <span class="en">IODA · USGS · GDACS · OFAC</span></h3><p class="note">자동 수집이 한 번 돌면 국가별 인터넷 장애, 감시 시설 인근 지진·재난 경보, OFAC 신규 제재 지정을 여기에 보여줍니다.</p></div>`;
  const S = O.summary || {}, io = O.ioda || {}, qk = O.quakes || {}, gd = O.gdacs || {}, of = O.ofac || {};
  const hot = (S.ioda_alerts || 0) + (S.quakes_near || 0) + (S.gdacs_red || 0) + (S.ofac_new_vessels || 0);
  const ioRows = ((io.data || {}).countries || []).slice(0, 10);
  const qs = (qk.data || []).slice(0, 6), gs = (gd.data || []).slice(0, 6);
  const od = of.data || {};
  const GK = {TC: "열대성 폭풍", EQ: "지진", FL: "홍수", VO: "화산", DR: "가뭄", WF: "산불"};
  const tag = (txt, c) => `<span class="chk" style="color:var(${c});border-color:var(${c})">${txt}</span>`;
  return `<div class="block ${hot ? "sev4" : "sev2"}"><h3>인터넷 장애 · 재난 · 신규 제재 <span class="en">IODA · USGS · GDACS · OFAC · ${esc((O.generated || "").slice(5, 16).replace("T", " "))}Z</span></h3>
    <span class="meta">6시간마다 키 없이 받는 공개 피드. 경보 기준을 넘은 항목은 사건 목록에도 올라갑니다.</span>
    <h4 style="margin:10px 0 4px">국가 인터넷 장애 <small class="en">IODA 24시간 · 점수 높을수록 심각</small></h4>${openNote(io, "IODA")}
    ${ioRows.length ? `<table class="shk"><thead><tr><th style="text-align:left">국가</th><th>점수</th><th>신호</th><th>상태</th></tr></thead><tbody>${ioRows.map(r => `<tr><td style="text-align:left"><a href="https://ioda.inetintel.cc.gatech.edu/country/${esc(r.code)}" target="_blank" rel="noopener">${esc(r.name)}</a>${r.th && TH[r.th] ? ` <small>${esc(TH[r.th].name.split("·")[0])}</small>` : ""}</td><td>${Math.round(r.score).toLocaleString()}</td><td><small>${Object.entries(r.sources || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => esc(k)).join(" · ")}</small></td><td>${r.alert ? tag("경보", "--s5") : r.th ? tag("감시", "--s2") : "<small>—</small>"}</td></tr>`).join("")}</tbody></table>` : `<p class="note">최근 24시간 감지된 국가 단위 장애 없음.</p>`}
    <h4 style="margin:12px 0 4px">지진 · 재난 경보 <small class="en">USGS M5+ · GDACS 주황/적색</small></h4>${openNote(qk, "USGS")}${openNote(gd, "GDACS")}
    ${qs.length || gs.length ? `<ul class="wl">${qs.map(q => `<li><b>M${q.mag.toFixed(1)}</b> ${esc(q.place)} <small>${esc(q.d)}${q.near ? " · 감시 대상 " + esc(q.near) : ""}${q.tsunami ? " · 쓰나미" : ""} · <a href="${esc(q.url)}" target="_blank" rel="noopener">USGS</a></small></li>`).join("")}${gs.map(g => `<li>${tag(g.level === "red" ? "적색" : "주황", g.level === "red" ? "--s5" : "--s4")} <b>${esc(GK[g.type] || g.type)}</b> ${esc(g.name)} <small>${esc(g.country)} · ${esc(g.from)}${g.to && g.to !== g.from ? "~" + esc(g.to) : ""}${g.sev ? " · " + esc(g.sev) : ""} · <a href="${esc(g.url)}" target="_blank" rel="noopener">GDACS</a></small></li>`).join("")}</ul>` : `<p class="note">기준을 넘은 지진·재난 경보 없음.</p>`}
    <h4 style="margin:12px 0 4px">OFAC 신규 제재 지정 <small class="en">SDN 목록 비교 · 전체 ${od.n_total ? od.n_total.toLocaleString() : "—"}건</small></h4>${openNote(of, "OFAC")}
    ${od.baseline ? `<p class="note">첫 수집이라 기준 목록만 저장했습니다. 다음 수집부터 새로 추가된 개인·기업·선박을 보여줍니다.</p>` : od.n_new ? `<p class="meta">${esc(od.d || "")} 신규 ${od.n_new}건${od.new_vessels ? ` · 선박 ${od.new_vessels}척` : ""}${od.removed ? ` · 해제 ${od.removed}건` : ""} · ${Object.entries(od.by_program || {}).slice(0, 5).map(([k, v]) => esc(k) + " " + v).join(", ")}</p><ul class="wl">${(od.new || []).slice(0, 12).map(n => `<li><b>${esc(n.name)}</b> <small>${esc(n.type === "entity" ? "단체·기업" : n.type === "individual" ? "개인" : n.type === "vessel" ? "선박" + (n.vess_flag ? " · " + n.vess_flag : "") : n.type)} · ${esc(n.program)}</small></li>`).join("")}</ul>` : `<p class="note">지난 수집 이후 새 지정 없음.</p>`}
  </div>`;
}
/* 예측시장 (Polymarket) — 시나리오 탭 */
function polyMatch(id){ const m = OPEN_ && OPEN_.poly && OPEN_.poly.data && OPEN_.poly.data.matched; return m ? m[id] : null; }
function polyHtml(){
  const P = OPEN_ && OPEN_.poly; if (!P) return "";
  const d = P.data || {}, matched = d.matched || {};
  const scn = typeof SCN_ === "object" && SCN_ ? SCN_.templates : [];
  const rows = scn.filter(t => matched[t.id]);
  const gap = (t, m) => { const ours = typeof scState === "object" ? scState.p[t.id] : t.p, g = ours - Math.round(m.p * 100); return `<span style="color:${Math.abs(g) >= 20 ? "var(--s5)" : Math.abs(g) >= 10 ? "var(--s4)" : "var(--ink)"}">${g > 0 ? "+" : ""}${g}%p</span>`; };
  return `<div class="block sev3"><h3>예측시장 비교 <span class="en">Polymarket · 시장 ${d.n_markets || 0}개</span></h3>${openNote(P, "Polymarket")}
    <span class="meta">돈이 걸린 시장 확률과 우리 시나리오 확률을 나란히 봅니다. '자동'은 징후·센서와 함께 시장 확률을 질문 일치도(w)만큼 섞은 값입니다(거래량 10만 달러 이상만). 질문 문장·마감일이 시나리오와 정확히 같지 않으니 차이가 크면 질문 원문을 먼저 확인하세요. 거래량이 작은 시장은 흔들림이 큽니다.</span>
    ${rows.length ? `<div style="overflow-x:auto"><table class="shk"><thead><tr><th style="text-align:left">시나리오</th><th>우리</th><th>시장</th><th>차이</th><th title="징후·센서·시장을 반영한 자동 뷰">자동</th><th style="text-align:left">시장 질문</th></tr></thead><tbody>${rows.map(t => { const m = matched[t.id]; return `<tr><td style="text-align:left;min-width:8em">${esc(t.n)}</td><td>${typeof scState === "object" ? scState.p[t.id] : t.p}%</td><td><b>${Math.round(m.p * 100)}%</b>${m.chg1d ? ` <small>${m.chg1d > 0 ? "+" : ""}${Math.round(m.chg1d * 100)}</small>` : ""}</td><td>${gap(t, m)}</td><td>${(() => { const a = typeof HAUTO_ === "object" && HAUTO_ ? (HAUTO_.scenarios || []).find(v => v.id === t.id) : null; return a ? `<b>${Math.round(a.p)}%</b>${a.market && a.market.w ? ` <small title="시장 가중 ${a.market.w}">w${a.market.w}</small>` : ""}` : "—"; })()}</td><td style="text-align:left;white-space:normal;min-width:12em"><small><a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.q)}</a>${m.inverted ? " (반대 방향)" : ""} · 마감 ${esc(m.end || "—")} · $${Math.round(m.vol).toLocaleString()}</small></td></tr>`; }).join("")}</tbody></table></div>` : `<p class="note">시나리오와 맞는 시장을 찾지 못했습니다.</p>`}
    ${(d.top || []).length ? `<details><summary>지정학·거시 관련 상위 시장 ${d.top.length}개</summary><ul class="wl">${d.top.map(m => `<li><b>${Math.round(m.p * 100)}%</b> <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.q)}</a> <small>마감 ${esc(m.end || "—")} · $${Math.round(m.vol).toLocaleString()}</small></li>`).join("")}</ul></details>` : ""}
  </div>`;
}
/* 선박 통항 (Global Fishing Watch) — 해협 탭 */
function gfwHtml(){
  const f = FEEDS_ && FEEDS_.gfw; if (!f) return "";
  const d = f.data || {}; const ids = Object.keys(d).filter(k => !k.startsWith("_"));
  if (!ids.length) return `<div class="block"><h3>선박 통항 <span class="en">Global Fishing Watch</span></h3>${feedNote(f, "GFW_TOKEN")}</div>`;
  const chg = c => c == null ? "—" : `<span style="color:${c <= -0.2 ? "var(--s5)" : c >= 0.2 ? "var(--s1)" : "var(--ink)"}">${(c > 0 ? "+" : "") + Math.round(c * 100)}%</span>`;
  return `<div class="block sev3"><h3>선박 통항 · 암흑 선박 <span class="en">Global Fishing Watch · AIS + Sentinel-1 SAR</span></h3>
    <span class="meta">AIS 기준 해역 내 평균 체류 선박(선박·시간 ÷ 24)의 최근 7일 평균과 전주 대비, Sentinel-1 레이더로 탐지된 선박 중 AIS 와 짝이 없는 '암흑 선박' 7일 합계. GFW 공개 데이터는 3~5일 늦게 들어옵니다.</span>${feedNote(f, "GFW_TOKEN")}
    <table class="shk"><thead><tr><th style="text-align:left">해역</th><th>기준일</th><th>평균 선박</th><th>전주 대비</th><th>SAR 7일</th><th>암흑 7일</th></tr></thead><tbody>${ids.map(k => { const v = d[k]; return `<tr><td style="text-align:left">${esc(v.n || k)}</td><td>${v.latest ? esc(md(v.latest)) : "—"}</td><td>${v.vessels_avg7 == null ? "—" : v.vessels_avg7}</td><td>${chg(v.chg)}</td>${v.sar_7d ? `<td>${v.sar_7d}</td><td>${v.dark_7d ? `<b style="color:var(--s4)">${v.dark_7d}</b> <small>(${Math.round(100 * v.dark_7d / v.sar_7d)}%)</small>` : 0}</td>` : `<td colspan="2" style="color:var(--faint)">촬영 없음</td>`}</tr>`; }).join("")}</tbody></table></div>`;
}
/* 원유 재고 (EIA) · 금융 스트레스 (FRED) — 경제 탭 */
function feedsEcoHtml(){
  const e = FEEDS_ && FEEDS_.eia, f = FEEDS_ && FEEDS_.fred; let h = "";
  if (e) { const d = e.data || {}; const ks = Object.keys(d);
    h += `<div class="block sev3"><h3>미국 석유 재고 <span class="en">EIA 주간 · 천 배럴</span></h3>${feedNote(e, "EIA_API_KEY")}${ks.length ? `<table class="shk"><thead><tr><th style="text-align:left">항목</th><th>기준 주</th><th>재고</th><th>전주 대비</th><th>4주</th></tr></thead><tbody>${ks.map(k => `<tr><td style="text-align:left">${esc(d[k].l)}</td><td>${esc(md(d[k].d))}</td><td>${Math.round(d[k].v).toLocaleString()}</td><td>${d[k].chg_w == null ? "—" : `<span style="color:${d[k].chg_w < 0 ? "var(--s4)" : "var(--ink)"}">${fmtSigned(d[k].chg_w / 1000, 1)}M</span>`}</td><td>${d[k].chg_4w == null ? "—" : fmtSigned(d[k].chg_4w / 1000, 1) + "M"}</td></tr>`).join("")}</tbody></table>` : ""}</div>`; }
  if (f) { const d = f.data || {}; const ks = Object.keys(d);
    h += `<div class="block sev3"><h3>금융 스트레스·금리 <span class="en">FRED · 세인트루이스 연준</span></h3><span class="meta">금융스트레스 지수는 0이 평균, 1 이상이면 경계. 하이일드 스프레드 5%p 이상은 신용 경색 신호.</span>${feedNote(f, "FRED_API_KEY")}${ks.length ? `<table class="shk"><thead><tr><th style="text-align:left">지표</th><th>기준일</th><th>값</th><th>1주</th><th>1개월</th></tr></thead><tbody>${ks.map(k => `<tr><td style="text-align:left">${esc(d[k].l)}</td><td>${esc(md(d[k].d))}</td><td><b>${Number(d[k].v).toFixed(2)}</b> <small>${esc(d[k].unit || "")}</small></td><td>${fmtSigned(d[k].chg_1w, 2)}</td><td>${fmtSigned(d[k].chg_1m, 2)}</td></tr>`).join("")}</tbody></table>` : ""}</div>`; }
  return h;
}
function rewindHtml(date){
  const d = date || REF;
  const rows = DATA.theaters.map(t => { const w = (WC_.theaters || {})[t.id] || {}; const hist = (w.history || []).filter(h => h.d <= d); const lv = hist.length ? hist[hist.length - 1].to : null; return {t, lv}; }).filter(r => r.lv != null).sort((a, b) => b.lv - a.lv);
  const judg = judgItems().filter(j => j.d <= d && (!j.resolved || j.resolved > d));
  const rh = (typeof RISK_HIST === "object" && Array.isArray(RISK_HIST) ? RISK_HIST : []).filter(h => h.d <= d).slice(-1)[0];
  const ev = EVENTS.filter(e => e.d === d).length;
  return `<div class="sctiles">${[["경보단계 (그날)", rows.length ? rows.slice(0, 4).map(r => r.t.name.split("·")[0] + " " + r.lv).join(" · ") : "—", ""], ["열린 판단", judg.length, "그날 기준 미판정"], ["경제 위험 지수", rh ? rh.index : "—", rh ? rh.d : "이력 없음"], ["사건", ev, d]].map(([l, v, sub]) => `<div class="sct"><span class="l">${l}</span><span class="v" style="font-size:16px">${esc(String(v))}</span><small>${esc(sub)}</small></div>`).join("")}</div>`;
}
function opsCoverageHtml(){
  if (!COV_ || !COV_.clusters) return `<div class="block"><h3>미분류 보도 군집 <span class="en">coverage</span></h3><p class="note">자동 수집(collect/bootstrap)이 한 번 돌면 어느 전역에도 속하지 않는 보도가 같은 장소·주제로 뭉치는지 여기에 표시됩니다. 5건 이상이면 트립와이어 coverage_surge가 울립니다.</p></div>`;
  return `<div class="block ${COV_.max_cluster >= 5 ? "sev4" : "sev2"}"><h3>미분류 보도 군집 <span class="en">coverage · ${esc(COV_.generated ? COV_.generated.slice(0, 10) : "")}</span></h3><span class="meta">어느 전역에도 속하지 않는 관련 보도 ${COV_.unmapped_total}건 (최근 ${COV_.days}일) · 최대 군집 ${COV_.max_cluster}건${COV_.max_cluster >= 5 ? ' · <span class="tag hot">새 전역 검토</span>' : ""}</span>
    ${COV_.clusters.length ? `<ul class="wl">${COV_.clusters.slice(0, 8).map(c => `<li><b>${esc(c.key.replace(/^(place|topic|word):/, ""))}</b> ${c.n}건 · 출처 ${c.domains}곳<small>${c.sample.slice(0, 2).map(x => `${esc(x.d)} <a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>`).join(" · ")}</small></li>`).join("")}</ul><div class="btnrow"><a class="btn ghost" href="https://github.com/${REPO}/issues/new?template=pir.yml&labels=pir&title=${encodeURIComponent("[PIR] 새 전역 검토: " + (COV_.max_key || "").replace(/^\w+:/, ""))}" target="_blank" rel="noopener">새 전역·PIR 제안</a></div>` : '<p class="note">미분류 군집 없음. 수집이 돌면 채워집니다.</p>'}</div>`;
}
function opsSourceScoresHtml(){
  const sc = AUTO && AUTO.source_scores; if (!sc || !Object.keys(sc).length) return `<div class="block"><h3>출처 신뢰성 이력 <span class="en">30d corroboration</span></h3><p class="note">수집원별 사건 수·교차확인 비율·평균 신빙성은 자동 수집이 쌓이면 표시됩니다.</p></div>`;
  const rows = Object.entries(sc).sort((a, b) => b[1].n - a[1].n).slice(0, 25);
  return `<div class="block"><h3>출처 신뢰성 이력 <span class="en">30d corroboration</span></h3><span class="meta">사건 수, 다른 매체와 교차확인된 비율, 평균 신빙성 숫자(1 확인 ~ 6 미평가)</span>
    <table class="shk"><thead><tr><th>수집원</th><th>사건</th><th>교차확인</th><th>신빙성</th><th>판정</th></tr></thead><tbody>${rows.map(([id, v]) => { const src = SRC_.find(x => x.id === id); return `<tr><td>${esc(src ? src.name : id)}</td><td>${v.n}</td><td>${pct0(v.corroborated)}</td><td>${v.cred ?? "—"}</td><td><span class="tag ${/높음/.test(v.hint) ? "ok" : /단독/.test(v.hint) ? "hot" : ""}">${esc(v.hint)}</span></td></tr>`; }).join("")}</tbody></table></div>`;
}
function opsSarHtml(){
  const sar = AUTO && AUTO.sar; if (!sar || !sar.length) return `<div class="block"><h3>자체 수집 · Sentinel-1 선박 탐지 <span class="en">IMINT</span></h3><p class="note">주간 imint 워크플로(SARSHIP_ENABLE=1)가 호르무즈·바브엘만데브·수에즈 남단의 공개 SAR 영상에서 직접 센 척수를 여기에 둡니다.</p></div>`;
  return `<div class="block sev3"><h3>자체 수집 · Sentinel-1 선박 탐지 <span class="en">IMINT · K-CFAR</span></h3><span class="meta">공개 위성 영상에서 직접 센 척수. PortWatch(AIS 보도)와 독립.</span><table class="shk"><thead><tr><th>AOI</th><th>장면 날짜</th><th>척수</th></tr></thead><tbody>${sar.map(x => `<tr><td>${esc(x.aoi)}</td><td>${esc(x.d)}</td><td><b>${x.ships}</b></td></tr>`).join("")}</tbody></table></div>`;
}
function opsBlufHtml(){
  const changes7 = [].concat(...Object.entries(WC_.theaters || {}).map(([id, w]) => (w.history || []).filter(h => h.from != null && daysAgo(h.d) >= 0 && daysAgo(h.d) < 7).map(h => ({id, ...h}))));
  const gaps = PIRS_.items.reduce((a, p) => a + (p.eei || []).filter(e => e.status === "공백").length, 0);
  const wr = (PROD_.products || []).filter(p => p.kind === "WR" && daysAgo(p.d) >= 0 && daysAgo(p.d) < 3);
  return `<div class="block"><h3>운영 현황 <span class="en">ops</span></h3><span class="meta">${shiftNow()} 당직 · 경보 변경 7일 ${changes7.length}건 · EEI 공백 ${gaps}건 · 경고 보고 72h ${wr.length}건 · 생산물 ${(PROD_.products || []).length}건</span>
    ${changes7.length ? `<ul class="wl">${changes7.slice(0, 4).map(c => `<li><b>${esc(c.d)}</b> ${esc(TH[c.id] ? TH[c.id].name : c.id)} ${c.from}→${c.to} <small>${esc(c.why || "")}</small></li>`).join("")}</ul>` : ""}
    <div class="btnrow"><button class="thchip" data-tab="p-watch">당직 →</button><button class="thchip" data-tab="p-pir">요구 →</button><button class="thchip" data-tab="p-prod">생산물 →</button></div></div>`;
}
function renderOpsExtras(){ const pane = $("#p-src"); if (!pane) return; pane.querySelectorAll(".opsx").forEach(n => n.remove()); const wrap = document.createElement("div"); wrap.className = "opsx"; wrap.innerHTML = opsFirmsHtml() + opsOpenHtml() + opsCoverageHtml() + opsSarHtml() + opsSourceScoresHtml(); pane.prepend(wrap); }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-tab]"); if (b && b.dataset.tab && document.getElementById(b.dataset.tab) && !b.classList.contains("tab") && !b.classList.contains("lnk")) setTab(b.dataset.tab); });
