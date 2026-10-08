// UI smoke test: loads the built dashboard, walks every tab, checks for page errors and key elements.
// usage: node tests/ui/smoke.mjs dashboard/index.html   (needs playwright with chromium; CI installs it)
import { chromium } from 'playwright';
import path from 'node:path';

const file = path.resolve(process.argv[2] || 'dashboard/index.html');
const b = await chromium.launch();
const errs = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
const p = await ctx.newPage();
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_TUNNEL|net::ERR|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('file://' + file, { waitUntil: 'load' });
await p.waitForTimeout(2500);
const checks = [];
checks.push(['theaters', await p.locator('#tlist li').count() >= 10]);
for (const g of ['sit', 'mkt', 'an', 'ops']) {
  await p.click(`.grp[data-g="${g}"]`);
  for (const t of await p.locator(`.tab[data-g="${g}"]`).all()) {
    await t.click(); await p.waitForTimeout(150);
    const id = await t.getAttribute('data-pane');
    const txt = (await p.locator('#' + id).innerText()).trim();
    checks.push([id, txt.length > (id === 'p-ai' ? 10 : 40)]); // 분석관 pane은 Claude 밖에서는 안내문만 보임
  }
}
checks.push(['cm tiles', await p.locator('.cmtile').count() >= 30]);
checks.push(['risk gauge', await p.locator('.rgauge').count() >= 1]);
checks.push(['scenario rows', await p.locator('#p-scn .shk tbody tr').count() >= 10]);
await p.keyboard.press('Control+K'); await p.waitForTimeout(200); await p.fill('#palQ', '호르무즈'); await p.waitForTimeout(200);
checks.push(['search', await p.locator('#palR li').count() >= 3]);
await b.close();
const failed = checks.filter(c => !c[1]);
console.log(checks.map(c => `${c[1] ? 'ok ' : 'FAIL'} ${c[0]}`).join('\n'));
if (errs.length) console.log('errors:\n' + errs.join('\n'));
if (failed.length || errs.length) { process.exit(1); }
console.log('smoke ok');
