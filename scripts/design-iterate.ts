import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BRAND = `
Legacy Fit — behavioral assessment platform for trades staffing.
Brand: Navy #1D3461, Green #4CAF50, White #FFFFFF.
Fit status colors: Green #4CAF50 (85+%), Yellow #FFC107 (70-84%),
Orange #FF9800 (50-69%), Red #F44336 (<50%).
`

const DESIGN_PHILOSOPHY = `
The design must feel like Ramp x Apple x Stripe meets PI Hire.

From Ramp: ultra-clean white backgrounds, data-forward density,
every element earns its place, zero decoration, typography-led hierarchy.

From Apple: generous whitespace, every detail intentional, transitions
feel physical, nothing feels accidental, the product has a point of view.

From Stripe: trusted and professional, developer-grade precision,
confident type scale, clean data tables, subtle but present grid.

Applied to PI Hire: a recruiter tool that makes behavioral data
scannable and actionable for people who make 10 hiring decisions a day.

HARD RULES — never break these:
- Pure white backgrounds only (#ffffff), no off-white, no gray backgrounds on cards
- Zero gradients, zero drop shadows (except 1px border on cards)
- One accent color in use at a time — navy for primary, green for positive states
- Card borders: 1px solid rgba(0,0,0,0.08) — lighter than current
- Border radius: 8px on cards, 6px on buttons, 4px on inputs
- Font: -apple-system stack (keep current)
- Spacing base unit: 4px — all spacing is multiples of 4
- Touch targets: minimum 44px on any mobile-facing element
- Typography: size contrast does the hierarchy work, not color
`

const CURRENT_SYSTEM = `
Current globals.css uses:
- --color-navy: #1D3461
- --color-green: #4CAF50
- Tailwind utility classes throughout
- Cards: bg-white rounded-lg border border-navy/10 p-6
- Buttons: bg-navy text-white px-4 py-2 rounded
- Text hierarchy: text-2xl font-bold for h1, text-sm for labels
- .word-chip class for assessment adjective buttons
- .toast class for notifications
- .skeleton class for loading states
- .animate-fade-slide-up for completion animations
- Full @media print stylesheet

Problems to fix:
- navy/10 border (10% opacity) is too faint, cards float rather than sit
- Buttons are too tall (py-2 = 8px padding, should be 6px)
- Label uppercase tracking feels corporate, not modern
- Dimension bars use bg-navy/5 background which disappears on screens
- Fit score circle at w-24 h-24 is oversized for the information it carries
- Sidebar is gray-50 background when it should be pure navy
`

async function generate(prompt: string, context: string = ''): Promise<string> {
  const messages: Anthropic.MessageParam[] = []
  if (context) {
    messages.push({ role: 'user', content: context })
    messages.push({ role: 'assistant', content: 'Understood. I have the context.' })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: BRAND + '\n' + DESIGN_PHILOSOPHY,
    messages,
  })
  return response.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
}

async function run() {
  console.log('\n=== LEGACY FIT DESIGN ITERATION ===\n')

  // ROUND 1: Generate two competing design systems
  console.log('Round 1: Generating Variant A and Variant B...')
  const round1 = await generate(`
Generate two complete, competing globals.css files for Legacy Fit.

VARIANT A — "Precision" (Ramp-inspired):
- Extremely tight spacing, maximum data density
- Card borders at exactly 1px solid #e5e7eb
- All labels in 11px/500 weight/0.04em tracking, NO uppercase
- Buttons: 32px height, 14px text
- Dimension bars: 6px height with 2px track
- Fit score: displayed as plain "91%" in 32px/700 weight, no circle
- Section headers: 13px/600 weight, #374151 color

VARIANT B — "Confident" (Stripe-inspired):
- More generous whitespace, stronger visual hierarchy
- Card borders at 1px solid rgba(29,52,97,0.12)
- Labels in 12px/500 weight, sentence case, #6b7280
- Buttons: 36px height, 14px text, stronger hover states
- Dimension bars: 8px height, pill-shaped ends
- Fit score: 48px circle with the percentage inside
- Section headers: 15px/600 weight, #111827

For each variant output ONLY the complete globals.css content between
<VARIANT_A> and </VARIANT_A> tags, and <VARIANT_B> and </VARIANT_B> tags.
Include @import "tailwindcss", @theme inline block, body styles, .word-chip,
.toast/.toast-success/.toast-error/.toast-info, .skeleton, .empty-state,
.animate-fade-slide-up, .animate-spin, .print-header, .print-footer,
and full @media print styles. Must work with Tailwind CSS v4.
`, CURRENT_SYSTEM)

  const variantAMatch = round1.match(/<VARIANT_A>([\s\S]*?)<\/VARIANT_A>/)
  const variantBMatch = round1.match(/<VARIANT_B>([\s\S]*?)<\/VARIANT_B>/)
  const variantA = variantAMatch?.[1]?.trim() || ''
  const variantB = variantBMatch?.[1]?.trim() || ''

  fs.writeFileSync('scripts/variant-a.css', variantA)
  fs.writeFileSync('scripts/variant-b.css', variantB)
  console.log('  -> Saved variant-a.css and variant-b.css')

  // ROUND 2: Ruthless critique, produce Variant C
  console.log('\nRound 2: Critiquing and synthesizing Variant C...')
  const round2 = await generate(`
You are a senior product designer at Ramp reviewing two design systems
for Legacy Fit. Be ruthlessly specific in your critique.

VARIANT A CSS:
${variantA.substring(0, 2000)}

VARIANT B CSS:
${variantB.substring(0, 2000)}

Your task:
1. List exactly 5 specific problems with Variant A (not general, specific)
2. List exactly 5 specific problems with Variant B (not general, specific)
3. Produce Variant C — takes the best of both, fixes all problems

Variant C requirements:
- Preserves A's data density where it serves the recruiter
- Preserves B's stronger visual hierarchy for scanability
- Fixes every specific problem you identified
- Adds these that neither variant has:
  * CSS custom property --shadow-card: 0 1px 3px rgba(0,0,0,0.06)
    (used on cards only, replaces border on elevated surfaces)
  * Better focus ring: 2px solid #1D3461 with 2px offset
  * Smooth transitions: all interactive elements get transition: all 0.12s ease
  * Better empty state utility class
  * Skeleton loading animation for data-heavy sections

Output critique between <CRITIQUE> tags.
Output Variant C globals.css between <VARIANT_C> and </VARIANT_C> tags.
`, `Round 1 produced two variants. Now critique and synthesize.`)

  const critiqueMatch = round2.match(/<CRITIQUE>([\s\S]*?)<\/CRITIQUE>/)
  const variantCMatch = round2.match(/<VARIANT_C>([\s\S]*?)<\/VARIANT_C>/)
  const critique = critiqueMatch?.[1]?.trim() || ''
  const variantC = variantCMatch?.[1]?.trim() || ''

  console.log('\nCRITIQUE:')
  console.log(critique)
  fs.writeFileSync('scripts/variant-c.css', variantC)
  console.log('\n  -> Saved variant-c.css')

  // ROUND 3: Mobile and edge case stress test
  console.log('\nRound 3: Mobile stress test and final polish...')
  const round3 = await generate(`
You are a mobile engineer testing Variant C on a real construction
worker's Android phone (375px viewport, Chrome Mobile).

VARIANT C CSS:
${variantC.substring(0, 2000)}

Test against these specific scenarios:
1. Assessment page — 80 adjective chips in a 2-column grid on 375px
   Are chips 44px tall? Do they have enough padding to tap accurately?
2. Bottom bar (word count + Continue button) — is it above the keyboard?
3. Candidate name "Bartholomew Christiansen-Kowalski" (32 chars) in header
4. Fit score of 42% (red) — does it feel accusatory or informative?
5. Dashboard sidebar on mobile — does it collapse gracefully?
6. Print output — do colors survive -webkit-print-color-adjust?

For each issue found, write the specific CSS fix.
Then produce Variant D — Variant C with all mobile fixes applied.

Also add to Variant D:
- .word-chip class for the adjective checkboxes (unselected + selected states)
- .toast class for the notification system
- .skeleton class for loading states
- Better @media print that works on both Chrome and Safari

Output issues between <MOBILE_ISSUES> tags.
Output Variant D between <VARIANT_D> and </VARIANT_D> tags.
`, critique)

  const mobileIssuesMatch = round3.match(/<MOBILE_ISSUES>([\s\S]*?)<\/MOBILE_ISSUES>/)
  const variantDMatch = round3.match(/<VARIANT_D>([\s\S]*?)<\/VARIANT_D>/)
  const mobileIssues = mobileIssuesMatch?.[1]?.trim() || ''
  const variantD = variantDMatch?.[1]?.trim() || ''

  console.log('\nMOBILE ISSUES FOUND AND FIXED:')
  console.log(mobileIssues)
  fs.writeFileSync('scripts/variant-d.css', variantD)
  console.log('\n  -> Saved variant-d.css')

  // ROUND 4: Final winner — write directly to globals.css
  console.log('\nRound 4: Producing final production CSS...')
  const round4 = await generate(`
You are shipping the final production design system for Legacy Fit.

Based on all previous rounds, produce the DEFINITIVE globals.css.
This is the final version that goes into production.

Requirements:
- Must start with @import "tailwindcss";
- Complete @theme inline block with all CSS custom properties
- All component utility classes (.word-chip, .toast, .skeleton, etc.)
- Full print stylesheet
- All the fixes from previous rounds
- Clean, no comments except section headers
- Must work with Tailwind CSS v4 @theme inline syntax

Also output a separate IMPLEMENTATION_NOTES section explaining
the top 5 things the developer needs to change in the React
components to take full advantage of the new design system.

Variant D to finalize:
${variantD.substring(0, 3000)}

Output the final globals.css between <FINAL_CSS> and </FINAL_CSS> tags.
Output implementation notes between <IMPL_NOTES> and </IMPL_NOTES> tags.
`, `All previous rounds complete. Now produce the final production version.`)

  const finalCSSMatch = round4.match(/<FINAL_CSS>([\s\S]*?)<\/FINAL_CSS>/)
  const implNotesMatch = round4.match(/<IMPL_NOTES>([\s\S]*?)<\/IMPL_NOTES>/)
  const finalCSS = finalCSSMatch?.[1]?.trim() || variantD
  const implNotes = implNotesMatch?.[1]?.trim() || ''

  // Write directly to globals.css
  const globalsPath = path.join(process.cwd(), 'app', 'globals.css')
  fs.writeFileSync(globalsPath, finalCSS)
  console.log('\n  -> Wrote final CSS to app/globals.css')

  // Save implementation notes
  fs.writeFileSync('scripts/design-implementation-notes.md', implNotes)
  console.log('  -> Saved implementation notes to scripts/design-implementation-notes.md')

  console.log('\n=== DESIGN ITERATION COMPLETE ===')
  console.log('Final CSS written to app/globals.css')
  console.log('Read scripts/design-implementation-notes.md for component changes needed')
  console.log('\nAll variants saved in scripts/ for reference:')
  console.log('  variant-a.css -- Round 1 Precision')
  console.log('  variant-b.css -- Round 1 Confident')
  console.log('  variant-c.css -- Round 2 Synthesized')
  console.log('  variant-d.css -- Round 3 Mobile-tested')
}

run().catch(console.error)
