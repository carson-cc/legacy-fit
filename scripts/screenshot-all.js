const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const PAGES = [
  { name: '01-homepage',              url: '/',                         width: 1440 },
  { name: '02-homepage-mobile',       url: '/',                         width: 390  },
  { name: '03-profiles-grid',         url: '/profiles',                 width: 1440 },
  { name: '04-profiles-grid-mobile',  url: '/profiles',                 width: 390  },
  { name: '05-profile-pioneer',       url: '/profiles/pioneer',         width: 1440 },
  { name: '06-profile-renegade',      url: '/profiles/renegade',        width: 1440 },
  { name: '07-profile-standard',      url: '/profiles/standard',        width: 1440 },
  { name: '08-profile-veteran',       url: '/profiles/veteran',         width: 1440 },
  { name: '09-how-it-works',          url: '/how-it-works',             width: 1440 },
  { name: '10-science',               url: '/science',                  width: 1440 },
  { name: '11-faq',                   url: '/faq',                      width: 1440 },
  { name: '12-for-staffing',          url: '/for-staffing-firms',       width: 1440 },
  { name: '13-for-exec-search',       url: '/for-executive-search',     width: 1440 },
  { name: '14-assess-welcome',        url: '/assess/demo-derek-token',  width: 390  },
  { name: '15-login',                 url: '/login',                    width: 1440 },
];

const DASHBOARD_PAGES = [
  { name: '16-dashboard',             url: '/dashboard',                                       width: 1440 },
  { name: '17-job-detail',            url: '/dashboard/jobs/job-supe-chi',                     width: 1440 },
  { name: '18-candidate-marcus',      url: '/dashboard/candidates/invite-marcus',              width: 1440 },
  { name: '19-job-target',            url: '/dashboard/jobs/job-supe-chi/target',              width: 1440 },
  { name: '20-clients',               url: '/dashboard/clients',                               width: 1440 },
  { name: '21-admin',                 url: '/dashboard/admin',                                 width: 1440 },
  { name: '22-hiring-manager',        url: '/dashboard/clients/client-gilbane/hiring-manager', width: 1440 },
];

async function login(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/login', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.type('input[type="email"]', 'admin@legacyworkforce.com');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  const cookies = await page.cookies();
  await page.close();
  return cookies;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  console.log('Taking public page screenshots...\n');

  for (const pg of PAGES) {
    const p = await browser.newPage();
    await p.setViewport({ width: pg.width, height: 900 });
    try {
      await p.goto(BASE + pg.url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1200));
      await p.screenshot({ path: path.join(OUT, `${pg.name}.png`), fullPage: true });
      console.log(`  ✓ ${pg.name}`);
    } catch (e) {
      console.log(`  ✗ ${pg.name}: ${e.message.slice(0, 80)}`);
    }
    await p.close();
  }

  console.log('\nLogging in for dashboard pages...');
  let cookies;
  try {
    cookies = await login(browser);
    console.log('  ✓ Logged in\n');
  } catch (e) {
    console.log(`  ✗ Login failed: ${e.message.slice(0, 80)}\n`);
    cookies = [];
  }

  console.log('Taking dashboard screenshots...\n');

  for (const pg of DASHBOARD_PAGES) {
    const p = await browser.newPage();
    if (cookies.length) await p.setCookie(...cookies);
    await p.setViewport({ width: pg.width, height: 900 });
    try {
      await p.goto(BASE + pg.url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await p.screenshot({ path: path.join(OUT, `${pg.name}.png`), fullPage: true });
      console.log(`  ✓ ${pg.name}`);
    } catch (e) {
      console.log(`  ✗ ${pg.name}: ${e.message.slice(0, 80)}`);
    }
    await p.close();
  }

  // Homepage animation timing shots
  console.log('\nCapturing homepage animation states...\n');
  for (const [label, waitMs] of [['t1500', 1500], ['t3500', 3500], ['t8000', 8000]]) {
    const p2 = await browser.newPage();
    await p2.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    try {
      await p2.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, waitMs));
      await p2.screenshot({ path: path.join(OUT, `01-homepage-${label}.png`), fullPage: false });
      console.log(`  ✓ homepage-${label}`);
    } catch (e) {
      console.log(`  ✗ homepage-${label}: ${e.message.slice(0, 80)}`);
    }
    await p2.close();
  }

  // Try shared report
  const p = await browser.newPage();
  if (cookies.length) await p.setCookie(...cookies);
  await p.setViewport({ width: 1440, height: 900 });
  try {
    // First get a share token from the candidate API
    const apiPage = await browser.newPage();
    if (cookies.length) await apiPage.setCookie(...cookies);
    const resp = await apiPage.goto(BASE + '/api/candidates/invite-marcus', { waitUntil: 'networkidle0', timeout: 10000 });
    const json = await resp.json();
    await apiPage.close();

    if (json.data?.shareToken) {
      await p.goto(BASE + '/report/' + json.data.shareToken, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await p.screenshot({ path: path.join(OUT, '23-shared-report.png'), fullPage: true });
      console.log('  ✓ 23-shared-report');
    } else {
      console.log('  ✗ Could not get share token');
    }
  } catch (e) {
    console.log(`  ✗ shared-report: ${e.message.slice(0, 80)}`);
  }
  await p.close();

  await browser.close();

  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log(`\nDone. ${files.length} screenshots saved to ./screenshots/`);
  files.forEach(f => {
    const size = fs.statSync(path.join(OUT, f)).size;
    console.log(`  ${f} (${Math.round(size/1024)}KB)`);
  });
})();
