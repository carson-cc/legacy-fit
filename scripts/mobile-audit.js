const puppeteer = require('puppeteer')
const path = require('path')

const PAGES = [
  { name: 'homepage', url: 'http://localhost:3000' },
  { name: 'profiles', url: 'http://localhost:3000/profiles' },
  { name: 'archetypes', url: 'http://localhost:3000/archetypes' },
  { name: 'report', url: 'http://localhost:3000/sample-report' },
]

const VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'iphone-14-landscape', width: 844, height: 390 },
  { name: 'ipad', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

async function audit() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const overflows = []

  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      const p = await browser.newPage()
      await p.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 })
      try {
        await p.goto(page.url, { waitUntil: 'networkidle0', timeout: 15000 })
        await new Promise(r => setTimeout(r, 1500))

        // full page screenshot
        await p.screenshot({
          path: path.join(__dirname, 'audit', `${page.name}-${vp.name}.png`),
          fullPage: true
        })

        // above the fold
        await p.screenshot({
          path: path.join(__dirname, 'audit', `${page.name}-${vp.name}-fold.png`),
          fullPage: false
        })

        // horizontal overflow check
        const hasHorizontalScroll = await p.evaluate(() =>
          document.documentElement.scrollWidth > window.innerWidth
        )
        if (hasHorizontalScroll) {
          const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth)
          const winWidth = await p.evaluate(() => window.innerWidth)
          overflows.push(`OVERFLOW: ${page.name} at ${vp.width}px (scrollWidth=${scrollWidth}, winWidth=${winWidth})`)
          console.log(`  ⚠️  OVERFLOW: ${page.name} at ${vp.width}px (scrollWidth=${scrollWidth})`)
        }

        console.log(`  ✓ ${page.name} @ ${vp.name} (${vp.width}x${vp.height})`)
      } catch (err) {
        console.log(`  ✗ ${page.name} @ ${vp.name}: ${err.message}`)
      }
      await p.close()
    }
  }

  await browser.close()

  console.log('\n=== OVERFLOW SUMMARY ===')
  if (overflows.length === 0) {
    console.log('No horizontal overflows detected.')
  } else {
    overflows.forEach(o => console.log(o))
  }

  console.log('\nAudit complete. Screenshots in scripts/audit/')
}

audit()
