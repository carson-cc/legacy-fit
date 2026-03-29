const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  // ── Homepage beats (snap scroll) ────────────────────────────
  console.log('Homepage beats...\n');
  const hp = await browser.newPage();
  await hp.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await hp.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  const beatCount = await hp.evaluate(() => document.querySelectorAll('.snap-beat, .snap-beat-scroll').length);
  console.log(`Found ${beatCount} snap beats`);

  for (let i = 0; i < beatCount; i++) {
    await hp.evaluate((idx) => {
      const beats = document.querySelectorAll('.snap-beat, .snap-beat-scroll');
      beats[idx].scrollIntoView({ behavior: 'instant' });
    }, i);
    await new Promise(r => setTimeout(r, 500));
    const num = String(i + 1).padStart(2, '0');
    await hp.screenshot({
      path: path.join(OUT, `homepage-beat-${num}.png`),
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
    console.log(`  ✓ beat-${num}`);
  }
  await hp.close();

  // ── Sample report top ────────────────────────────────────────
  console.log('\nSample report...');
  const sr = await browser.newPage();
  await sr.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await sr.goto(BASE + '/sample-report', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));
  await sr.screenshot({ path: path.join(OUT, 'sample-report-top.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await sr.screenshot({ path: path.join(OUT, 'sample-report-full.png'), fullPage: true });
  console.log('  ✓ sample-report-top.png');
  console.log('  ✓ sample-report-full.png');
  await sr.close();

  // ── Method page ──────────────────────────────────────────────
  console.log('\nMethod page...');
  const mp = await browser.newPage();
  await mp.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await mp.goto(BASE + '/profiles', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await mp.screenshot({ path: path.join(OUT, 'method-full.png'), fullPage: true });
  console.log('  ✓ method-full.png');
  await mp.close();

  await browser.close();

  const files = fs.readdirSync(OUT).filter(f =>
    f.startsWith('homepage-beat-') || f.startsWith('sample-report') || f.startsWith('method-')
  );
  console.log(`\nDone. ${files.length} screenshots saved.`);
  files.sort().forEach(f => {
    const kb = Math.round(fs.statSync(path.join(OUT, f)).size / 1024);
    console.log(`  ${f} — ${kb}KB`);
  });
})();
