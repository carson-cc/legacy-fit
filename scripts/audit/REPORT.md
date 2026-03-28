# Mobile Audit Report — Pre-Fix
Generated: 2026-03-28
Breakpoints tested: 375px (iPhone SE), 390px (iPhone 14), 844px (landscape), 768px (iPad), 1440px (desktop)

---

## Confirmed horizontal scroll (overflow check)
- `report` at 375px: scrollWidth=689, winWidth=375
- `report` at 390px: scrollWidth=689, winWidth=390

All other pages pass the overflow check.

---

## PAGE: homepage (app/page.tsx)

### BREAKPOINT: 375px / 390px

#### ISSUE-HP-01 — Nav: full links visible on mobile
- All four nav links (Product, Method, Archetypes, Sample Report) + "Sign in" + "Request a walkthrough" CTA rendered in the nav bar
- Nav wraps to two lines at 375px; "Sample Report" clips at right edge
- **FIX**: Hide link group + sign-in on mobile. Show wordmark + CTA only.

#### ISSUE-HP-02 — Hero grid: inline style overrides media query
- `gridTemplateColumns: '1fr 480px'` is set both in CSS class `.hero-grid` AND as an inline style prop
- CSS media query at 1100px sets `.hero-grid { grid-template-columns: 1fr }` but inline style wins over CSS class rules (only `!important` beats inline)
- Result: two-column layout persists at all mobile widths; LiveReportPanel overflows right edge
- **FIX**: Remove `gridTemplateColumns: '1fr 480px'` from the inline style prop so the CSS class + media query take over.

#### ISSUE-HP-03 — SignalTrace: hardcoded width overflows on mobile
- `SignalTrace width={448}` inside `SignalTraceDemo`
- At 375px, the stacked signal-grid container is ~327px wide; card padding (20px each side) leaves ~287px
- 448px > 287px → SVG draws beyond the container
- **FIX**: Make width responsive — compute width from container via ResizeObserver, or cap at `Math.min(448, containerWidth)` with useEffect.

#### ISSUE-HP-04 — SearchProcessTimeline: minWidth 640 causes internal scroll
- `minWidth: 640` on the inner div inside `overflowX: 'auto'` wrapper
- Page won't overflow but the timeline requires horizontal finger-scroll to view — bad UX on touch screens
- No fix required for overflow, but noted as UX degradation. Accept as-is (changing the timeline layout is out of scope).

#### ISSUE-HP-05 — Hero h1 font size
- `fontSize: 60` at desktop
- CSS at 768px: `h1 { font-size: 40px !important }` — fires for 375px, so this is handled.
- MINOR: 40px is borderline for 375px (3 short lines OK). Acceptable.

#### ISSUE-HP-06 — CTA buttons: side-by-side on mobile
- Hero CTAs use `display: 'flex', gap: 12`. On mobile they wrap via flex if the row is too narrow.
- Both buttons have `height: 46px` → 46px ≥ 44px touch target. OK.
- "Request a walkthrough" at ~200px width + "See what your client sees →" at ~230px → 442px total + gap vs 327px container → they wrap to stacked. Visual confirm needed after hero grid fix.

---

## PAGE: profiles (app/profiles/page.tsx)

### BREAKPOINT: 375px / 390px

#### ISSUE-PR-01 — Nav: full links visible on mobile
- Same as HP-01. All nav links visible, wrapping on mobile.
- **FIX**: Same pattern — hide links + sign-in, show wordmark + CTA.

#### ISSUE-PR-02 — Hero section: two-column grid, inline style, no media query
- `display: 'grid', gridTemplateColumns: '1fr 500px'` on the hero container — 100% inline, no class, no responsive override
- At 375px: FitModel card (right column) would be 500px wide — overflows viewport
- **FIX**: Add class `profiles-hero-grid`, add CSS media query to collapse to 1fr.

#### ISSUE-PR-03 — Dimensions table: 200px fixed first column on mobile
- `gridTemplateColumns: '200px 1fr'` for each dimension row — inline, no responsive override
- At 375px: 200px label + gap 32px + rest = already uses 232px of 327px, cramped but technically fits. However text overflows visually.
- **FIX**: Add class `profiles-dim-row`, collapse to 1fr (stacked) on mobile.

#### ISSUE-PR-04 — Science section: two-column grid, inline style
- `display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80` — inline, no class
- At 375px: two columns in 327px → each column ~124px. Text illegible, SignalTrace component overflows.
- **FIX**: Add class `profiles-science-grid`, collapse to 1fr on mobile.

#### ISSUE-PR-05 — SignalTrace: hardcoded width 420 overflows
- `SignalTrace width={420}` inside the science section card (padding 28px → available ~271px)
- 420 > 271 → overflow within card
- **FIX**: Same as HP-03 — make width responsive.

#### ISSUE-PR-06 — Section paddings: 96px top/bottom on mobile
- `padding: '96px 40px'` on multiple sections — excessive on mobile
- **FIX**: Override to `padding: 48px 20px` on mobile via CSS.

---

## PAGE: archetypes (app/archetypes/page.tsx)

### BREAKPOINT: 375px / 390px

#### ISSUE-AR-01 — Nav: full links visible on mobile
- Same as HP-01.
- **FIX**: Same pattern.

#### ISSUE-AR-02 — SVG radar: shown on mobile, unusable on touch
- The SVG scatter plot (860px wide, dots require hover) is wrapped in `overflowX: 'auto'` — so it doesn't cause page overflow, but requires horizontal scrolling and is impossible to use on touch (hover = undefined on mobile)
- **FIX**: On screens < 768px, hide SVG radar and replace with `ArchetypeMobileList` — a card-based grouped list.

#### ISSUE-AR-03 — Hero h1 font: 52px
- CSS at 768px: `h1 { font-size: 36px !important }` — fires for 375px. Handled.

#### ISSUE-AR-04 — Profile overlay grid: two columns on mobile
- `gridTemplateColumns: '1fr 240px'` inside the overlay — FitModel in right column
- At 375px overlay width (~335px), each column is ~48px and ~240px — too cramped for main content
- **FIX**: Collapse to 1fr on mobile via isMobile check or media query (already has `<style>` block in page).

#### ISSUE-AR-05 — Bottom CTA and footer: padding 40px horizontal
- `padding: '64px 40px'` on the footer CTA and `padding: '20px 40px'` on footer
- **FIX**: Override to 20px horizontal via CSS.

---

## PAGE: sample-report (app/sample-report/page.tsx)

### BREAKPOINT: 375px / 390px — CONFIRMED OVERFLOW (scrollWidth=689)

#### ISSUE-SR-01 — FitModelViz SVG: fixed 300px width overflows containers
- `FitModelViz` renders `<svg width={size} height={size}>` where `size=300`
- Container at 375px: 375 - 24×2 (main padding) - 32×2 (card padding) = 263px available
- 300px SVG > 263px → SVG overflows its container
- **FIX**: Change `FitModelViz` to use `width="100%"` on the SVG with `style={{ maxWidth: size, maxHeight: size }}` and `viewBox` already present. The SVG will scale down to fit.

#### ISSUE-SR-02 — Section G (Team Compatibility): 1fr 1fr grid, inline, no class
- `display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32` — inline style, no class name
- Each column renders a `FitModelViz` at 300px → two 300px SVGs side by side
- At 375px: ~(327-32)/2 = 147.5px per column, but SVG is 300px → BOTH SVGs overflow
- **Root cause of scrollWidth=689**: 2×300 + 32gap = 632px, minus CSS column constraints but SVGs still render at 300px
- **FIX**: Add class, collapse to 1fr on mobile. Also fix FitModelViz to be responsive (ISSUE-SR-01).

#### ISSUE-SR-03 — Benchmark footer grid: repeat(2, 1fr) inline
- `gridTemplateColumns: 'repeat(2, 1fr)'` — inline, no class
- At 375px: two columns each ~148px — text wraps poorly
- **FIX**: Add class, collapse to 1fr on mobile.

#### ISSUE-SR-04 — Demo banner: flex row at narrow widths
- The banner has a text paragraph + "Request a walkthrough" button with `whiteSpace: 'nowrap'`
- At 375px: text is ~200px wide, button is ~180px → 380px total + 24px padding×2 + 16px gap = overflow possible
- Actually `flexWrap` is not set → risk of wrapping. The existing screenshot shows it OK but let's verify.
- **FIX**: Add `flexWrap: 'wrap'` to the banner flex container (already has implicit wrap via flex behavior).

#### ISSUE-SR-05 — Section A (Score grid): `220px minmax(0,1fr)` inline + media query
- The `!important` media query at 900px should override this. Appears to work.
- But needs to be verified post-fix (FitModelViz overflow fix needed first).

#### ISSUE-SR-06 — Nav/report header: "Candidate Recommendation Report" text + print button
- At 375px: "Veltro" + long subtitle + "Print" button may overflow or wrap
- **FIX**: Hide the subtitle text on mobile, keep Veltro + Print.

---

## FIX STATUS (to be updated after fixes)

| ID | Page | Issue | Status |
|----|------|-------|--------|
| HP-01 | Homepage | Nav links visible on mobile | FIXED — `.nav-links-group`, `.nav-signin` hidden via `@media (max-width: 767px)`; CTA swaps to "Talk to us" text |
| HP-02 | Homepage | Hero grid inline style overrides media query | FIXED — removed `gridTemplateColumns` from inline `style={}` prop; CSS class `.hero-grid` owns it exclusively so media query takes effect |
| HP-03 | Homepage | SignalTrace width 448 overflows | FIXED — ResizeObserver in `SignalTraceDemo` measures container and passes `Math.min(448, containerWidth - 48)` as `width` prop |
| HP-04 | Homepage | SearchProcessTimeline min-width 640 (accept) | ACCEPT — horizontal scroll within wrapper is acceptable UX trade-off |
| HP-05 | Homepage | h1 font size (CSS handles) | HANDLED — existing `h1 { font-size: 40px !important }` at 768px covers mobile |
| HP-06 | Homepage | CTA buttons stacking | VERIFIED — buttons wrap via flex after hero grid fix; 46px height meets 44px touch target minimum |
| PR-01 | Profiles | Nav links visible on mobile | FIXED — same `.nav-links-group` / `.nav-signin` hide pattern as homepage |
| PR-02 | Profiles | Hero two-column inline grid | FIXED — replaced inline `gridTemplateColumns: '1fr 500px'` with `className="profiles-hero-grid"`; CSS class collapses to `1fr` at 767px |
| PR-03 | Profiles | Dimensions 200px col | FIXED — added `className="profiles-dim-row"`; collapses to `1fr` (stacked) at 767px |
| PR-04 | Profiles | Science two-column inline grid | FIXED — added `className="profiles-science-grid"`; collapses to `1fr` at 767px |
| PR-05 | Profiles | SignalTrace width 420 overflows | FIXED — ResizeObserver on `sigCardRef` measures card and passes `Math.min(420, cardWidth - 56)` as `width` prop |
| PR-06 | Profiles | Section padding 96px | FIXED — `section { padding-left: 20px !important; padding-right: 20px !important; }` at 767px |
| AR-01 | Archetypes | Nav links visible on mobile | FIXED — same nav hide pattern |
| AR-02 | Archetypes | SVG radar on mobile | FIXED — `isMobile` state (ResizeObserver on `window.innerWidth < 768`) conditionally renders `<ArchetypeMobileList>` card list instead of SVG radar; filter pills remain functional |
| AR-03 | Archetypes | h1 font size (CSS handles) | HANDLED — existing `h1 { font-size: 36px !important }` at 768px covers mobile |
| AR-04 | Archetypes | Profile overlay two-column | FIXED — added `className="overlay-grid"`; collapses to `1fr` at 767px |
| AR-05 | Archetypes | Bottom CTA padding | FIXED — section padding override at 767px reduces horizontal padding to 20px |
| SR-01 | Sample Report | FitModelViz 300px overflow | FIXED — changed `<svg width={size}>` to `<svg width="100%" style={{ maxWidth: size }}>` using existing `viewBox`; SVG scales to fit any container |
| SR-02 | Sample Report | Section G inline 1fr 1fr grid | FIXED — added `className="rpt-team-grid"`; collapses to `1fr` at 767px. Combined with SR-01 fix eliminates the 689px overflow |
| SR-03 | Sample Report | Benchmark footer inline grid | FIXED — added `className="rpt-bmark-footer"`; collapses to `1fr` at 767px |
| SR-04 | Sample Report | Demo banner flex wrapping | FIXED — added `flexWrap: 'wrap'` to sticky banner flex container |
| SR-05 | Sample Report | Section A score grid (media query handles) | VERIFIED — existing `!important` media query at 900px handles this correctly post SR-01 fix |
| SR-06 | Sample Report | Report nav subtitle overflow | FIXED — added `className="rpt-nav-subtitle"`; hidden via `display: none !important` at 767px |

---

## POST-FIX VERIFICATION

Re-audit run after all fixes applied:

```
=== OVERFLOW SUMMARY ===
No horizontal overflows detected.
Audit complete. Screenshots in scripts/audit/
```

- **report** at 375px: scrollWidth=375, winWidth=375 ✓ (was 689px before fixes)
- All other pages: no overflow at any breakpoint ✓
- Desktop (1440px): pixel-identical layouts confirmed for all 4 pages ✓
