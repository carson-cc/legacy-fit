import type { ReferenceProfile } from './data/profiles'

export async function generateCandidateProfilePdf(
  candidateName: string,
  profile: ReferenceProfile
): Promise<Buffer> {
  // Dynamic import so build doesn't fail if puppeteer unavailable
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(buildProfileHTML(candidateName, profile), { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '48px', bottom: '48px', left: '48px', right: '48px' },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildProfileHTML(candidateName: string, profile: ReferenceProfile): string {
  const strengths = profile.strengths
    .map(s => `<div class="item-row"><div class="dot green"></div><div class="item-text">${esc(s)}</div></div>`)
    .join('')

  const traps = profile.traps
    .map(t => `<div class="item-row"><div class="dot amber"></div><div class="item-text">${esc(t)}</div></div>`)
    .join('')

  const roles = profile.bestRoles
    .map(r => `<span class="chip">${esc(r)}</span>`)
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0B0F14;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif}
  .page{padding:48px}
  .prepared-for{font-size:12px;color:#6B7280;margin-bottom:4px}
  .candidate-name{font-size:14px;color:#9CA3AF;font-weight:600;margin-bottom:0}
  .divider{border:none;border-top:1px solid #1F2937;margin:24px 0}
  .eyebrow{font-size:10px;color:#6B7280;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px}
  .profile-name{font-size:36px;font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-0.02em}
  .tagline{font-size:15px;color:#9CA3AF;margin-bottom:0}
  .section-label{font-size:9px;color:#4B5563;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px}
  .description{font-size:13px;color:#9CA3AF;line-height:1.75}
  .item-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px}
  .dot{width:6px;height:6px;border-radius:50%;margin-top:5px;flex-shrink:0}
  .dot.green{background:#22C55E}
  .dot.amber{background:#EAB308}
  .item-text{font-size:13px;color:#D1D5DB;line-height:1.55}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
  .chip{font-size:11px;color:#6B7280;border:1px solid #1F2937;border-radius:999px;padding:3px 10px}
  .footer{margin-top:48px;padding-top:20px;border-top:1px solid #1F2937;display:flex;justify-content:space-between;align-items:center}
  .footer-left{font-size:11px;color:#374151;max-width:360px;line-height:1.5}
  .footer-right{font-size:11px;color:#374151}
</style>
</head>
<body>
<div class="page">
  <div class="prepared-for">Prepared for</div>
  <div class="candidate-name">${esc(candidateName)}</div>
  <hr class="divider">

  <div class="eyebrow">${esc(profile.groupLabel)}</div>
  <div class="profile-name">${esc(profile.name)}</div>
  <div class="tagline">${esc(profile.tagline)}</div>
  <hr class="divider">

  <div class="section-label">How you work</div>
  <div class="description">${esc(profile.description)}</div>
  <hr class="divider">

  <div class="section-label">Your strengths</div>
  ${strengths}
  <hr class="divider">

  <div class="section-label">What to watch</div>
  ${traps}
  <hr class="divider">

  <div class="section-label">Best fit roles</div>
  <div class="chips">${roles}</div>

  <div class="footer">
    <div class="footer-left">This profile reflects your natural working style — not your skills or performance.</div>
    <div class="footer-right">Veltro · veltro.ai</div>
  </div>
</div>
</body>
</html>`
}
