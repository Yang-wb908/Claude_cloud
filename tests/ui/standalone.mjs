// 단독 실행 검증: ① 로더가 배포본을 받아 띄우고 오프라인이면 저장본을 띄우는지 ② 10분 주기 배포본 확인이 새 데이터를 반영하는지
// ③ API 키 분석관·에이전트가 Messages API(스트리밍·도구 왕복)로 동작하는지 ④ claude.ai 안에서는 HTML 받기만 켜지는지.
// 네트워크는 전부 가로채서 로컬 파일·가짜 응답으로 대신한다.  usage: node tests/ui/standalone.mjs dashboard
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || 'dashboard');
// CDN 에 못 나가는 환경이면 CDN_DIR(d3.min.js·topojson-client.min.js 가 있는 폴더)에서 대신 준다
const CDN_DIR = process.env.CDN_DIR;
function cdn(r) {
  const u = r.request().url();
  if (!CDN_DIR) return r.continue();
  const f = /d3\.min\.js/.test(u) ? 'd3.min.js' : /topojson-client/.test(u) ? 'topojson-client.min.js' : null;
  return f ? r.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(path.join(CDN_DIR, f)) }) : r.abort();
}
const page = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const build = JSON.parse(fs.readFileSync(path.join(dir, 'build.json'), 'utf8'));
const bundle = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'live_bundle.json'), 'utf8'));
const NEWX = '단독실행 시험 사건: 배포본 갱신으로 들어온 새 사건';
bundle.files.latest = { events: [{ id: 'zz-test', d: '2099-01-01', t: 'D', th: 'korea', p: '서울', at: [127, 37.5], x: NEWX, s: 'https://example.com/t', g: 'B2' }] };
const newer = { id: 'feedbeef0000', at: '2099-01-01T00:00:00Z', kst: '2099-01-01 09:00' };

const b = await chromium.launch();
const errs = [], checks = [];
const ok = (n, v) => checks.push([n, !!v]);
function watch(p) {
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
}
async function routes(ctx, { offline = false, dist = build } = {}) {
  await ctx.unroute('**/*').catch(() => {});
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('file:')) return r.continue();
    if (/cdnjs|jsdelivr/.test(u)) return cdn(r);
    if (u.includes('raw.githubusercontent.com/Yang-wb908/Claude_cloud/board-dist/')) {
      if (offline) return r.abort('internetdisconnected');
      if (u.includes('/index.html')) return r.fulfill({ status: 200, contentType: 'text/plain; charset=utf-8', headers: { 'access-control-allow-origin': '*' }, body: page });
      if (u.includes('/build.json')) return r.fulfill({ status: 200, contentType: 'text/plain', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(dist) });
      if (u.includes('/live_bundle.json')) return r.fulfill({ status: 200, contentType: 'text/plain', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(bundle) });
    }
    if (u.startsWith('https://api.anthropic.com/v1/messages')) return anthropic(r);
    return r.abort('blockedbyclient');
  });
}
// 가짜 Messages API: 도구가 있으면 1회차는 search_events 호출, 2회차는 결론 문장
let apiCalls = [];
function sse(events) { return events.map(e => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''); }
async function anthropic(r) {
  const body = JSON.parse(r.request().postData());
  const h = r.request().headers();
  apiCalls.push({ body, key: h['x-api-key'], direct: h['anthropic-dangerous-direct-browser-access'] });
  const cors = { 'access-control-allow-origin': '*' };
  if (h['x-api-key'] === 'sk-ant-bad') return r.fulfill({ status: 401, contentType: 'application/json', headers: cors, body: JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }) });
  const last = body.messages[body.messages.length - 1];
  const toolTurn = body.tools && !(Array.isArray(last.content) && last.content.some(c => c.type === 'tool_result'));
  const ev = [{ type: 'message_start', message: { id: 'm', type: 'message', role: 'assistant', content: [], model: body.model, usage: {} } }];
  if (toolTurn) {
    ev.push({ type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '', signature: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'sig' } }, { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', id: 'tu1', name: 'search_events', input: {} } },
      { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '{"query":"' } },
      { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '호르무즈", "days": 30}' } },
      { type: 'content_block_stop', index: 1 },
      { type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: {} }, { type: 'message_stop' });
  } else {
    const t = body.tools ? '결론: 도구 결과 확인 완료.' : '핵심 판단: 시험 응답입니다.';
    ev.push({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: t.slice(0, 5) } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: t.slice(5) } },
      { type: 'content_block_stop', index: 0 }, { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: {} }, { type: 'message_stop' });
  }
  return r.fulfill({ status: 200, contentType: 'text/event-stream', headers: cors, body: sse(ev) });
}

// ① 로더: 온라인 → 최신 판, 오프라인 → 저장본
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await routes(ctx, { dist: build });
  const p = await ctx.newPage(); watch(p);
  await p.goto('file://' + path.join(dir, 'loader.html'));
  await p.waitForFunction(() => document.querySelectorAll('#tlist li').length >= 10, null, { timeout: 30000 });
  ok('loader: 배포본 표시', await p.evaluate(() => window.SIT_LOADER && window.SIT_LOADER.online));
  await p.waitForTimeout(1500);
  ok('loader: 같은 판이면 새 판 표시 없음', /자동 갱신/.test(await p.locator('#syncBtn').innerText()));
  await routes(ctx, { offline: true });
  await p.reload();
  await p.waitForFunction(() => document.querySelectorAll('#tlist li').length >= 10, null, { timeout: 30000 });
  ok('loader: 오프라인 저장본', await p.evaluate(() => window.SIT_LOADER && window.SIT_LOADER.online === false));
  await ctx.close();
}
// ② 고정본(전체 HTML 직접 열기) + 새 배포본 → 데이터 반영
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await routes(ctx, { dist: newer });
  const p = await ctx.newPage(); watch(p);
  await p.goto('file://' + path.join(dir, 'index.html'));
  await p.waitForTimeout(3000);
  ok('dist: 새 데이터 반영 버튼', /자동 갱신 \d\d:\d\d KST/.test(await p.locator('#syncBtn').innerText()));
  await p.click('.grp[data-g="sit"]'); await p.click('.tab[data-pane="p-ev"]').catch(() => {});
  await p.waitForTimeout(400);
  ok('dist: 새 사건 들어옴', (await p.content()).includes(NEWX));
  await p.click('#status'); await p.waitForTimeout(200);
  ok('dist: 상태창 안내', /단독 실행/.test(await p.locator('#info').innerText()));
  // ③ API 키 분석관
  await p.click('.grp[data-g="an"]'); await p.click('.tab[data-pane="p-ai"]'); await p.waitForTimeout(300);
  ok('key: 키 입력란', await p.locator('#keyIn').isVisible());
  ok('key: 키 전 질문란 숨김', await p.locator('#askBox').isHidden());
  await p.fill('#keyIn', 'sk-ant-test-123456'); await p.click('#keySave'); await p.waitForTimeout(200);
  ok('key: 질문란 표시', await p.locator('#askBox').isVisible());
  await p.fill('#q', '시험 질문'); await p.click('#askBtn');
  await p.waitForFunction(() => /시험 응답/.test(document.querySelector('#answer').textContent), null, { timeout: 10000 });
  ok('key: 분석 응답 스트리밍', true);
  const c0 = apiCalls[apiCalls.length - 1];
  ok('key: 헤더·모델·캐시', c0.key === 'sk-ant-test-123456' && c0.direct === 'true' && c0.body.model === 'claude-opus-5-5' && c0.body.stream);
  // 캐시: 공유 앞부분(규칙·데이터)에만 표시, 매번 다른 질문 블록에는 없음 → 두 번째 질문이 같은 앞부분을 읽는다
  const m0 = c0.body.messages[0].content;
  ok('key: 캐시는 공유 부분에만', c0.body.messages.length === 1 && m0.length === 2 && m0[0].cache_control && !m0[1].cache_control && /^질문: /.test(m0[1].text));
  await p.fill('#q', '두 번째 질문'); await p.click('#askBtn');
  await p.waitForFunction(n => window.__n !== n, apiCalls.length).catch(() => {});
  await p.waitForTimeout(500);
  const c1 = apiCalls[apiCalls.length - 1];
  ok('key: 두 질문의 앞부분 동일', c1 !== c0 && c1.body.messages[0].content[0].text === m0[0].text && c1.body.messages[0].content[1].text === '질문: 두 번째 질문');
  await p.fill('#q', '호르무즈 점검'); await p.click('#agentBtn');
  await p.waitForFunction(() => /도구 결과 확인/.test(document.querySelector('#answer').textContent), null, { timeout: 10000 });
  const c2 = apiCalls[apiCalls.length - 1];
  const tr = c2.body.messages[c2.body.messages.length - 1].content[0];
  ok('agent: 도구 왕복', tr.type === 'tool_result' && tr.tool_use_id === 'tu1' && !tr.is_error && c2.body.messages[c2.body.messages.length - 2].content[0].type === 'thinking');
  const marks = JSON.stringify(c2.body).split('"cache_control"').length - 1;
  ok('agent: 캐시 표시(첫 블록 + 마지막 도구 결과)', tr.cache_control && c2.body.messages[0].content[0].cache_control && !c2.body.messages[0].content[1].cache_control && marks === 2);
  ok('agent: 도구 기록', /사건 검색/.test(await p.locator('#agentLog').innerText()));
  await p.click('#keyDel'); await p.fill('#keyIn', 'sk-ant-bad'); await p.click('#keySave');
  await p.fill('#q', '오류 시험'); await p.click('#askBtn');
  await p.waitForFunction(() => /API 키가 올바르지/.test(document.querySelector('#answer').textContent), null, { timeout: 10000 });
  ok('key: 401 안내', true);
  await ctx.close();
}
// ④ claude.ai 안(모의): HTML 받기 = 로더, 배포본 요청 없음
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  let distHits = 0;
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.includes('board-dist')) distHits++; return u.startsWith('file:') ? r.continue() : /cdnjs|jsdelivr/.test(u) ? cdn(r) : r.abort(); });
  await ctx.addInitScript(() => { window.claude = { use: async n => n === 'downloads' ? { save: async x => { window.__saved = x; return { status: 'saved' }; } } : null }; });
  const p = await ctx.newPage(); watch(p);
  await p.goto('file://' + path.join(dir, 'index.html'));
  await p.waitForTimeout(2500);
  ok('artifact: HTML 받기 버튼', await p.locator('#dlBtn').isVisible());
  await p.click('#dlBtn'); await p.waitForTimeout(200);
  ok('artifact: 로더 저장', await p.evaluate(() => window.__saved && /\.html$/.test(window.__saved.filename) && window.__saved.data.includes('board-dist') && window.__saved.data.length < 20000));
  ok('artifact: 배포본 요청 없음', distHits === 0);
  ok('artifact: 가로 넘침 없음', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await ctx.close();
}
await b.close();
const bad = checks.filter(c => !c[1]);
checks.forEach(([n, v]) => console.log((v ? 'ok   ' : 'FAIL ') + n));
errs.forEach(e => console.log('ERR  ' + e));
if (bad.length || errs.length) process.exit(1);
console.log('standalone ok');
