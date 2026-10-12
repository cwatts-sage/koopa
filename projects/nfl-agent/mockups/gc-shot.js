const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const base = path.join(process.env.HOME, 'Library/Caches/ms-playwright');
const candidates = [];
for (const d of fs.readdirSync(base)) {
  if (!d.startsWith('chromium')) continue;
  const stack = [path.join(base, d)];
  while (stack.length) {
    const cur = stack.pop();
    let ents; try { ents = fs.readdirSync(cur, { withFileTypes: true }); } catch (e) { continue; }
    for (const e of ents) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) { stack.push(p); continue; }
      if (/^(Google Chrome for Testing|Chromium|headless_shell|chrome)$/.test(e.name)) {
        try { fs.accessSync(p, fs.constants.X_OK); candidates.push(p); } catch (e) {}
      }
    }
  }
}
if (!candidates.length) { console.error('no chromium'); process.exit(1); }
(async () => {
  const b = await chromium.launch({ executablePath: candidates[0] });
  const pg = await b.newPage({ viewport: { width: 480, height: 1400 }, deviceScaleFactor: 2 });
  await pg.goto('file://' + path.resolve('game-center-all-features.html'), { waitUntil: 'load' });
  await pg.waitForTimeout(900);
  await pg.screenshot({ path: 'gc-full.png', fullPage: true });
  const h = await pg.evaluate(() => document.body.scrollHeight);
  console.log('page height', h);
  // top half
  await pg.screenshot({ path: 'gc-top.png', clip: { x:0, y:0, width:480, height: Math.min(1250, h) } });
  await pg.screenshot({ path: 'gc-bot.png', clip: { x:0, y: Math.max(0,h-1350), width:480, height: Math.min(1350,h) } });
  await b.close();
  console.log('done');
})();
