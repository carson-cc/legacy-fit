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

  const VIEWPORT_W = 1440;
  const VIEWPORT_H = 900;

  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_W, height: VIEWPORT_H, deviceScaleFactor: 2 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  // Get total page height and number of beats
  const beatCount = await page.evaluate(() =>
    document.querySelectorAll('.beat').length
  );
  console.log(`Found ${beatCount} beats\n`);

  // Screenshot each beat by scrolling to it
  for (let i = 0; i < beatCount; i++) {
    await page.evaluate((idx) => {
      const beats = document.querySelectorAll('.beat');
      beats[idx].scrollIntoView({ behavior: 'instant' });
    }, i);
    await new Promise(r => setTimeout(r, 400));

    const beatNum = String(i + 1).padStart(2, '0');
    const filename = `homepage-beat-${beatNum}.png`;
    await page.screenshot({
      path: path.join(OUT, filename),
      clip: { x: 0, y: 0, width: VIEWPORT_W, height: VIEWPORT_H }
    });
    console.log(`  ✓ Beat ${i + 1} → ${filename}`);
  }

  // Full-page at 1440
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(OUT, '01-homepage.png'),
    fullPage: true
  });
  console.log('\n  ✓ 01-homepage.png (full page, 1440px)');

  // Full-page at 390 mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(OUT, '02-homepage-mobile.png'),
    fullPage: true
  });
  console.log('  ✓ 02-homepage-mobile.png (full page, 390px)\n');

  await browser.close();

  const files = fs.readdirSync(OUT).filter(f => f.startsWith('homepage-beat-') || f === '01-homepage.png' || f === '02-homepage-mobile.png');
  console.log(`Done. ${files.length} homepage screenshots saved to ./screenshots/`);
})();
