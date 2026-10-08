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
function renderOpsExtras(){ const pane = $("#p-src"); if (!pane) return; pane.querySelectorAll(".opsx").forEach(n => n.remove()); const wrap = document.createElement("div"); wrap.className = "opsx"; wrap.innerHTML = opsCoverageHtml() + opsSarHtml() + opsSourceScoresHtml(); pane.prepend(wrap); }
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-tab]"); if (b && b.dataset.tab && document.getElementById(b.dataset.tab) && !b.classList.contains("tab") && !b.classList.contains("lnk")) setTab(b.dataset.tab); });
