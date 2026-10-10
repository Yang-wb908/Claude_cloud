/* ---------- 15차: 단독 실행 (claude.ai 밖에서 연 HTML) ----------
   ① 자동 갱신: 수집·빌드 때마다 배포 브랜치(board-dist)에 index.html·build.json·live_bundle.json 이 올라간다.
      단독 실행본은 10분마다 build.json 을 확인해 새 판이면 묶음 데이터를 화면에 바로 반영하고,
      로더(HTML 받기 파일) 안에서 실행 중이면 새로고침 한 번으로 화면 코드까지 최신 판이 된다.
   ② 분석관·에이전트: claude.ai 의 sample 대신 사용자 Anthropic API 키로 Messages API 를 직접 부른다(선택, 요금 발생).
   ③ HTML 받기: claude.ai 안에서는 downloads 캐퍼빌리티로 로더 파일을 내려준다. */
const DIST = "https://raw.githubusercontent.com/Yang-wb908/Claude_cloud/board-dist/";
const STANDALONE = !(window.claude && typeof window.claude.use === "function");
const distState = {checked: null, newer: null, err: "", busy: false};
const hhmmKST = d => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(11, 16);
const DIST_EVERY_MS = 10 * 60 * 1000;

async function distCheck(){
  if (distState.busy) return; distState.busy = true; paintDist(true);
  try {
    const b = await fetchJSON(DIST + "build.json?t=" + Date.now(), 10000);
    distState.checked = new Date(); distState.err = "";
    const cur = distState.newer || BUILD;
    if (b && b.id && b.at && (!cur || (b.id !== cur.id && b.at > cur.at))) {
      const L = await fetchJSON(DIST + "live_bundle.json?b=" + b.id, 30000);
      if (L && L.files) applyLive(L.files);
      distState.newer = b;
      // 로더 안에서 뒤에 깔려 있을 때는 조용히 새로고침 → 다음에 볼 때 화면까지 최신 판
      if (window.SIT_LOADER && document.visibilityState === "hidden") { location.reload(); return; }
    }
  } catch(e) { distState.err = e && e.name === "AbortError" ? "응답 시간 초과" : (e && e.message) || "연결 실패"; }
  finally { distState.busy = false; paintDist(); if (MODE !== "live") setStatus("snapshot"); }
}
function paintDist(busy){
  const btn = $("#syncBtn"); if (!btn || !STANDALONE) return;
  btn.hidden = false; btn.disabled = false; btn.classList.remove("passive");
  const nw = distState.newer;
  if (busy) { btn.textContent = "갱신 확인 중…"; return; }
  if (nw && window.SIT_LOADER) {
    btn.textContent = "새 판 " + nw.kst.slice(5) + " · 새로고침";
    btn.title = "새 판의 데이터는 이미 화면에 반영했습니다. 누르면 화면 코드까지 최신 판으로 다시 엽니다.";
  } else {
    btn.textContent = distState.err ? "자동 갱신 실패 · 다시" : "자동 갱신 " + (distState.checked ? hhmmKST(distState.checked) : "…") + " KST";
    btn.title = distState.err ? "배포본 확인 실패: " + distState.err + " (누르면 다시 확인)" : "10분마다 배포본을 확인해 새 수집 데이터를 반영합니다. 누르면 지금 확인합니다." + (nw ? " 데이터 판 " + nw.kst + " KST" : "");
  }
}
function distInfoHtml(){
  const b = BUILD ? `${esc(BUILD.kst)} KST 빌드` : "빌드 시각 미상";
  if (!STANDALONE) return `<p>claude.ai 안에서는 보안 정책상 외부 데이터를 직접 불러오지 못해, 상황판이 수집 직후 6시간마다 최신 데이터로 다시 배포됩니다(이 판: ${b}). 상단 <b>HTML 받기</b>로 받은 파일은 브라우저에서 열 때마다 최신 판을 받아 띄우고, 열려 있는 동안 10분마다 자동 갱신됩니다. 분석관은 Anthropic API 키로 동작합니다.</p>`;
  const L = window.SIT_LOADER;
  const head = L ? (L.online ? "로더가 최신 판을 받아 띄웠습니다." : `<b>오프라인</b>: 마지막으로 받은 판(${esc(String(L.cachedAt || "").slice(0, 16).replace("T", " "))}Z 저장)을 띄웠습니다.`)
    : "이 파일 자체는 고정본이라 데이터만 갱신됩니다. claude.ai 상황판의 <b>HTML 받기</b> 파일(로더)을 쓰면 화면 코드까지 열 때마다 최신 판이 됩니다.";
  const nw = distState.newer ? ` 새 데이터 판 ${esc(distState.newer.kst)} KST 반영됨.` : "";
  return `<p><b>단독 실행.</b> 화면 판: ${b}. ${head} 10분마다 배포본을 확인해 새 수집 데이터(시세·사건·브리핑·채점·경보)를 바로 반영합니다.${nw} 마지막 확인 ${distState.checked ? hhmmKST(distState.checked) + " KST" : "대기 중"}${distState.err ? " · 실패: " + esc(distState.err) : ""}.</p>`;
}
function startDist(){
  if (!STANDALONE) return false;
  const btn = $("#syncBtn");
  if (btn) btn.addEventListener("click", () => { if (distState.newer && window.SIT_LOADER) location.reload(); else distCheck(); });
  distCheck();
  setInterval(distCheck, DIST_EVERY_MS);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && (!distState.checked || Date.now() - distState.checked > DIST_EVERY_MS)) distCheck(); });
  return true;
}

/* claude.ai 안: 로더 HTML 내려받기 */
(async function initDownload(){
  if (STANDALONE || !LOADER_HTML) return;
  let dl = null; try { dl = await window.claude.use("downloads"); } catch(e) { dl = null; }
  const btn = $("#dlBtn"); if (!dl || !btn) return;
  btn.hidden = false;
  btn.addEventListener("click", async () => {
    try { await dl.save({filename: "세계상황판.html", data: LOADER_HTML}); btn.textContent = "받기 완료"; setTimeout(() => btn.textContent = "HTML 받기", 4000); }
    catch(e) { const c = e && e.code; if (c === "declined" || c === "rate_limited") return; if (c === "bad_request" || c === "too_large") { btn.title = "받기 실패: " + (e.message || c); return; } btn.hidden = true; }
  });
})();

/* ---------- API 키 분석관 (claude.ai 밖) ---------- */
const KEY_LS = "sit-api-key", MODEL_LS = "sit-api-model";
const KEY_MODELS = [["claude-opus-5-5", "Opus 5.5 · 최고 성능"], ["claude-sonnet-5-5", "Sonnet 5.5 · 균형, 더 저렴"], ["claude-haiku-5-5", "Haiku 5.5 · 가장 저렴"]];
let keyMem = "";
const lsTry = (fn, d) => { try { return fn(); } catch(e) { return d; } };
const keyGet = () => keyMem || lsTry(() => localStorage.getItem(KEY_LS) || "", "");
const keyModel = () => lsTry(() => localStorage.getItem(MODEL_LS), null) || KEY_MODELS[0][0];
function apiErr(status, body){
  const m = (body && body.error && body.error.message) || ("HTTP " + status), t = (body && body.error && body.error.type) || "";
  const code = status === 401 || status === 403 ? "auth" : status === 429 ? "rate_limited" : status === 529 || t === "overloaded_error" ? "overloaded" : /credit|billing/i.test(m) ? "credit" : "upstream_error";
  return {code, message: m.replace(/sk-ant-[\w-]+/g, "sk-ant-***")};
}
async function apiStream(body, signal, onDelta){
  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {method: "POST", signal, body: JSON.stringify({...body, stream: true}),
      headers: {"content-type": "application/json", "x-api-key": keyGet(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"}});
  } catch(e) { throw e && e.name === "AbortError" ? {code: "cancelled", message: "중지"} : {code: "network", message: String((e && e.message) || e)}; }
  if (!r.ok) { let j = null; try { j = await r.json(); } catch(e) {} throw apiErr(r.status, j); }
  const rd = r.body.getReader(), dec = new TextDecoder(), blocks = [];
  let buf = "", stop = null;
  for (;;) {
    let ch; try { ch = await rd.read(); } catch(e) { throw e && e.name === "AbortError" ? {code: "cancelled", message: "중지"} : {code: "network", message: String((e && e.message) || e)}; }
    if (ch.done) break;
    buf += dec.decode(ch.value, {stream: true});
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const raw = buf.slice(0, i); buf = buf.slice(i + 2);
      const line = raw.split("\n").find(l => l.startsWith("data:")); if (!line) continue;
      let d; try { d = JSON.parse(line.slice(5)); } catch(e) { continue; }
      if (d.type === "content_block_start") { blocks[d.index] = {...d.content_block}; if (d.content_block.type === "tool_use") blocks[d.index]._j = ""; }
      else if (d.type === "content_block_delta") {
        const b = blocks[d.index], x = d.delta; if (!b) continue;
        if (x.type === "text_delta") { b.text = (b.text || "") + x.text; onDelta(x.text); }
        else if (x.type === "input_json_delta") b._j += x.partial_json;
        else if (x.type === "thinking_delta") b.thinking = (b.thinking || "") + x.thinking;
        else if (x.type === "signature_delta") b.signature = (b.signature || "") + x.signature;
      }
      else if (d.type === "content_block_stop") { const b = blocks[d.index]; if (b && b.type === "tool_use") { try { b.input = b._j ? JSON.parse(b._j) : {}; } catch(e) { b.input = {}; b._bad = true; } delete b._j; } }
      else if (d.type === "message_delta" && d.delta) stop = d.delta.stop_reason || stop;
      else if (d.type === "error") throw apiErr(d.error && d.error.type === "overloaded_error" ? 529 : 500, d);
    }
  }
  return {content: blocks.filter(Boolean), stop};
}
/* claude.ai sample 과 같은 모양: sample(input, {onText, signal, tools}) → {text, truncated} */
async function keySample(input, opts){
  opts = opts || {};
  if (!keyGet()) throw {code: "auth", message: "API 키 없음"};
  const turns = typeof input === "string" ? [{role: "user", content: input}] : (input || []).map(m => ({role: m.role === "assistant" ? "assistant" : "user", content: String(m.content)}));
  const msgs = [];
  turns.forEach(m => { const l = msgs[msgs.length - 1]; if (l && l.role === m.role) l.content += "\n\n" + m.content; else msgs.push({...m}); });
  if (!msgs.length) throw {code: "invalid_request", message: "빈 입력"};
  // 첫 턴(상황판 데이터)은 캐시 — 도구 왕복마다 다시 읽는 비용을 줄인다
  msgs[0] = {role: msgs[0].role, content: [{type: "text", text: msgs[0].content, cache_control: {type: "ephemeral"}}]};
  const defs = opts.tools || [], byName = Object.fromEntries(defs.map(t => [t.name, t]));
  const tools = defs.map(t => ({name: t.name, description: t.description || "", input_schema: t.inputSchema || {type: "object", properties: {}}}));
  let all = "", truncated = false;
  for (let round = 0; round < 12; round++) {
    let txt = "";
    const res = await apiStream({model: keyModel(), max_tokens: 16000, thinking: {type: "adaptive"}, messages: msgs, ...(tools.length ? {tools} : {})}, opts.signal,
      dl => { txt += dl; if (opts.onText) opts.onText({text: (all ? all + "\n\n" : "") + txt, delta: dl}); });
    if (txt) all = all ? all + "\n\n" + txt : txt;
    if (res.stop === "max_tokens") { truncated = true; break; }
    if (res.stop !== "tool_use") break;
    msgs.push({role: "assistant", content: res.content.map(b => { const c = {...b}; delete c._bad; return c; })});
    const out = [];
    for (const b of res.content.filter(b => b.type === "tool_use")) {
      let content, bad = false;
      try {
        if (b._bad) throw new Error("도구 입력 JSON이 잘렸습니다. 더 짧게 다시 호출하세요.");
        const t = byName[b.name]; if (!t) throw new Error("알 수 없는 도구 " + b.name);
        const v = await t.execute(b.input || {}, {signal: opts.signal});
        content = typeof v === "string" ? v : JSON.stringify(v);
      } catch(e) { content = String((e && e.message) || e); bad = true; }
      out.push({type: "tool_result", tool_use_id: b.id, content: String(content == null ? "" : content).slice(0, 30000), ...(bad ? {is_error: true} : {})});
    }
    msgs.push({role: "user", content: out});
    if (round === 11) truncated = true;
  }
  return {text: all, truncated};
}
keySample.limits = async () => ({tools: {maxCount: 20}, images: null});
keySample.json = async (input, opts) => { const r = await keySample(input, opts); const s = r.text, i = s.indexOf("{"), j = s.lastIndexOf("}"); return JSON.parse(i >= 0 && j > i ? s.slice(i, j + 1) : s); };

function keyPaint(){
  const box = $("#keyBox"); if (!box) return;
  const k = keyGet(), m = keyModel();
  box.hidden = false;
  if (k) {
    box.innerHTML = `<p class="note"><b>API 키로 동작 중</b> · ${esc((KEY_MODELS.find(x => x[0] === m) || [m, m])[1])} · 키 ${esc(k.slice(0, 10))}…${esc(k.slice(-4))}${keyMem ? " (이 탭에만)" : " (이 브라우저에 기억)"}
      <select id="keyModel" aria-label="모델">${KEY_MODELS.map(([id, n]) => `<option value="${id}"${id === m ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>
      <button class="btn ghost" id="keyDel">키 지우기</button></p>`;
    $("#keyDel").onclick = () => { keyMem = ""; lsTry(() => localStorage.removeItem(KEY_LS)); sample = null; $("#askBox").hidden = true; keyPaint(); };
  } else {
    box.innerHTML = `<p class="note"><b>claude.ai 밖에서 분석관·에이전트 쓰기.</b> Anthropic API 키(console.anthropic.com)를 넣으면 이 브라우저가 Claude에 바로 질문합니다. 키는 Anthropic API로만 보내고 저장소·다른 곳으로 보내지 않습니다. 질문마다 상황판 데이터(수만 토큰)를 함께 보내므로 <b>API 사용 요금이 청구</b>됩니다. 요금을 줄이려면 Sonnet·Haiku를 고르세요.</p>
      <div class="keyrow"><input type="password" id="keyIn" placeholder="sk-ant-…" autocomplete="off" spellcheck="false" aria-label="Anthropic API 키">
      <select id="keyModel" aria-label="모델">${KEY_MODELS.map(([id, n]) => `<option value="${id}"${id === m ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>
      <label class="meta"><input type="checkbox" id="keyKeep"> 이 브라우저에 기억</label>
      <button class="btn" id="keySave">사용</button></div>
      <p class="note">기억하지 않으면 이 탭을 닫을 때 지워집니다. 같은 컴퓨터의 다른 로컬 HTML 파일이 브라우저 저장소를 읽을 수 있으니, 공용 PC에서는 기억하지 마세요.</p>`;
    $("#keySave").onclick = () => {
      const v = ($("#keyIn").value || "").trim(); if (!/^sk-ant-/.test(v)) { $("#keyIn").focus(); $("#keyIn").setCustomValidity("sk-ant- 로 시작하는 키"); $("#keyIn").reportValidity(); return; }
      if ($("#keyKeep").checked) { lsTry(() => localStorage.setItem(KEY_LS, v)); keyMem = ""; } else keyMem = v;
      sample = keySample; denied = false; askBtn.disabled = false; $("#askBox").hidden = false; keyPaint();
    };
  }
  const sel = $("#keyModel"); if (sel) sel.onchange = () => { lsTry(() => localStorage.setItem(MODEL_LS, sel.value)); keyPaint(); };
}
function keySampleInit(){
  if (!STANDALONE) return false;
  $("#aiNote").textContent = "상황판에 담긴 데이터만 근거로 답합니다. 직접 검색은 하지 않아요.";
  if (keyGet()) { sample = keySample; $("#askBox").hidden = false; } else $("#askBox").hidden = true;
  keyPaint();
  return true;
}
