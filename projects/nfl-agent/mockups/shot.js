const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const base = path.join(process.env.HOME, 'Library/Caches/ms-playwright');
const candidates = [];
for (const d of fs.readdirSync(base)) {
  if (!d.startsWith('chromium')) continue;
  const dir = path.join(base, d);
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let ents;
    try { ents = fs.readdirSync(cur, { withFileTypes: true }); } catch (e) { continue; }
    for (const e of ents) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) { stack.push(p); continue; }
      if (/^(Google Chrome for Testing|Chromium|headless_shell|chrome)$/.test(e.name)) {
        try { fs.accessSync(p, fs.constants.X_OK); candidates.push(p); } catch (e) {}
      }
    }
  }
}
if (!candidates.length) { console.error('no chromium binary found'); process.exit(1); }
const exe = candidates[0];
console.log('using:', exe);

(async () => {
  const b = await chromium.launch({ executablePath: exe });
  const pg = await b.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 });
  await pg.goto('file://' + path.resolve('game-center-mock.html'), { waitUntil: 'load' });
  await pg.waitForTimeout(600);

  await pg.screenshot({ path: 'shot-1-kickoff.png' });

  const td = await pg.evaluate(() => {
    for (let di = 0; di < G.drives.length; di++)
      for (let pi = 0; pi < G.drives[di].plays.length; pi++)
        if (G.drives[di].plays[pi].score) return { di, pi };
    return null;
  });
  if (td) {
    await pg.evaluate(t => select(t.di, t.pi), td);
    await pg.waitForTimeout(700);
    await pg.screenshot({ path: 'shot-2-touchdown.png' });
  }

  const mid = await pg.evaluate(() => {
    for (let di = 4; di < G.drives.length; di++)
      if (G.drives[di].plays.length >= 5) return { di, pi: 2 };
    return { di: 1, pi: 0 };
  });
  await pg.evaluate(t => select(t.di, t.pi), mid);
  await pg.waitForTimeout(700);
  await pg.screenshot({ path: 'shot-3-drive.png' });

  await b.close();
  console.log('done');
})();
