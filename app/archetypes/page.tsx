'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { PRODUCT_NAME, COMPANY_EMAIL } from '@/lib/brand'
import Nav from '@/app/components/Nav'

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CATS = [
  { key: 'field_command',     label: 'Drivers',     descriptor: 'Push things forward',             axisNote: 'Pace-first · Output-driven',  color: '#c45030' },
  { key: 'people_influence',  label: 'Catalysts',   descriptor: 'Move people and energy',          axisNote: 'Energy-first · People-driven', color: '#c8873a' },
  { key: 'process_structure', label: 'Operators',   descriptor: 'Execute and manage complexity',   axisNote: 'Process over pace',            color: '#3a6ecc' },
  { key: 'strategic_drive',   label: 'Stabilizers', descriptor: 'Deepen, scale, and sustain',      axisNote: 'Trust over speed',             color: '#3aa868' },
] as const

function getCat(key: string) {
  return CATS.find(c => c.key === key) ?? CATS[0]
}

const DOMINANT_ARCHETYPES = new Set([
  'Pioneer', 'Renegade',     // Drivers
  'Igniter', 'Unifier',      // Catalysts
  'Sentinel', 'Anchor',      // Operators
  'Trailblazer', 'Veteran',  // Stabilizers
])

const TAGS: Record<string, string> = {
  Pioneer: 'Independent · Owner', Renegade: 'Bold · Disruptive',
  Purist: 'Standards · Exacting', Conductor: 'Authority · Range',
  Igniter: 'Launch · Ignite',     Diplomat: 'Alignment · Trust',
  Rainmaker: 'Influence · Warmth', Unifier: 'Team · Cohesion',
  Anchor: 'Reliable · Warm',      Navigator: 'Systematic · Precise',
  Sentinel: 'Compliance · Detail', Steward: 'Consistent · Steady',
  Expert: 'Expert · Deep',         Executor: 'Drive · Discipline',
  Trailblazer: 'Pace · Excellence', Veteran: 'Integrity · Steady',
}

// ─── CARD PENTAGON DATA ───────────────────────────────────────────────────────
const PENT_VALUES: Record<string, number[]> = {
  Conductor:   [82, 75, 70, 78, 72],
  Pioneer:     [78, 72, 80, 52, 88],
  Purist:      [90, 88, 42, 45, 62],
  Renegade:    [72, 65, 88, 55, 92],
  Igniter:     [62, 58, 85, 94, 78],
  Diplomat:    [52, 55, 88, 92, 50],
  Rainmaker:   [70, 62, 80, 88, 82],
  Unifier:     [55, 60, 72, 98, 48],
  Anchor:      [88, 90, 40, 52, 58],
  Navigator:   [82, 84, 55, 60, 70],
  Sentinel:    [92, 88, 36, 45, 55],
  Steward:     [85, 80, 48, 62, 65],
  Expert:      [68, 78, 70, 65, 52],
  Executor:    [84, 82, 55, 60, 70],
  Trailblazer: [75, 68, 88, 72, 82],
  Veteran:     [70, 85, 60, 72, 52],
}

// ─── DECISION SIGNALS ─────────────────────────────────────────────────────────
const DECISION_SIGNALS: Record<string, { bestIn: string; watchFor: string }> = {
  Conductor:   { bestIn: 'Roles with no clear owner yet.',                                    watchFor: 'Filling space others needed to grow into.' },
  Pioneer:     { bestIn: 'Roles that need someone to start without a roadmap.',               watchFor: 'Leaving before the work is solid.' },
  Purist:      { bestIn: 'Roles where the standard is the job.',                              watchFor: 'Protecting quality past the point of diminishing return.' },
  Renegade:    { bestIn: 'Roles that need a new direction, not a better process.',            watchFor: 'Breaking alignment to prove a point.' },
  Igniter:     { bestIn: 'Roles that need energy and momentum quickly.',                      watchFor: 'Moving on before the momentum becomes output.' },
  Diplomat:    { bestIn: 'Roles that live between competing interests.',                      watchFor: 'Keeping peace when a hard call is needed.' },
  Rainmaker:   { bestIn: 'Roles where relationships are the product.',                        watchFor: 'Losing focus after the win.' },
  Unifier:     { bestIn: 'Fractured teams that need trust rebuilt.',                          watchFor: 'Holding the group together past when it should change.' },
  Anchor:      { bestIn: 'Roles that need someone steady, not someone fast.',                 watchFor: 'Holding firm when the situation actually needs to shift.' },
  Navigator:   { bestIn: 'Complex situations where the plan is half the job.',                watchFor: 'Over-preparing when speed matters more.' },
  Sentinel:    { bestIn: 'Roles where missing something is worse than moving slowly.',        watchFor: 'Slowing the whole system to prevent one miss.' },
  Steward:     { bestIn: 'Roles where consistency compounds over time.',                      watchFor: 'Running the same play after the game has changed.' },
  Expert:      { bestIn: 'Roles where depth of knowledge is the differentiator.',             watchFor: 'Being hard to access for people without the same background.' },
  Executor:    { bestIn: 'Roles that need strategy turned into action fast.',                 watchFor: 'Executing the wrong direction very well.' },
  Trailblazer: { bestIn: "Roles that need someone to raise what's possible.",                watchFor: 'Getting restless once things stabilize.' },
  Veteran:     { bestIn: 'Roles where judgment built over time is the asset.',               watchFor: 'Reading a new situation through an old lens.' },
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, string[]> = {
  field_command:     ['M4,18 L18,4', 'M10,4 L18,4 L18,12'],
  people_influence:  ['M11,16 a6,6 0 0,0 0,-12', 'M11,13 a3,3 0 0,0 0,-6', 'M11,19 a9,9 0 0,0 0,-18'],
  process_structure: ['M4,7 L18,7', 'M4,11 L18,11', 'M4,15 L18,15'],
  strategic_drive:   ['M4,17 L4,13 L8,13 L8,9 L12,9 L12,5 L17,5'],
}

const ARCH_ICONS: Record<string, string[]> = {
  Pioneer:     ['M4,10 L16,10', 'M11,5 L16,10 L11,15'],
  Renegade:    ['M11,3 L7,11 L10,11 L9,17 L13,9 L10,9 Z'],
  Purist:      ['M10,3 L17,10 L10,17 L3,10 Z', 'M7,10 L9,12 L13,8'],
  Conductor:   ['M5,6 L5,16', 'M9,9 L9,16', 'M13,5 L13,16', 'M17,11 L17,16'],
  Igniter:     ['M10,10 L10,4', 'M10,10 L15.2,7', 'M10,10 L15.2,13', 'M10,10 L10,16', 'M10,10 L4.8,13', 'M10,10 L4.8,7'],
  Diplomat:    ['M3,4 L11,4 L11,9 L8,9 L6,12 L6,9 L3,9 Z', 'M9,7 L17,7 L17,12 L15,12 L15,14 L13,12 L9,12 Z'],
  Rainmaker:   ['M10,3 Q10,9 7.5,11 a2.5,2.5 0 0,0 5,0 Q10,9 10,3 Z', 'M4,17 Q6.5,14 9,17 Q11.5,20 14,17 Q16.5,14 19,17'],
  Unifier:     ['M6,10 a4,4 0 1,0 8,0', 'M6,10 a4,4 0 1,1 8,0'],
  Anchor:      ['M10,4 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0', 'M10,6 L10,16', 'M6,9 L14,9', 'M6,16 Q10,14 14,16'],
  Navigator:   ['M10,10 m-6.5,0 a6.5,6.5 0 1,0 13,0 a6.5,6.5 0 1,0 -13,0', 'M10,3.5 L10,5.5', 'M10,14.5 L10,16.5', 'M3.5,10 L5.5,10', 'M14.5,10 L16.5,10', 'M10,10 L12.5,6.5'],
  Sentinel:    ['M10,2 L17,5 L17,12 Q17,16 10,19 Q3,16 3,12 L3,5 Z'],
  Steward:     ['M3,17 L17,3', 'M7,13 L9,11', 'M10,10 L12,8', 'M13,7 L15,5'],
  Expert:      ['M9,9 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0', 'M13,13 L17,17'],
  Executor:    ['M10,10 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0', 'M10,3 L10,5', 'M10,15 L10,17', 'M3,10 L5,10', 'M15,10 L17,10', 'M5.5,5.5 L7,7', 'M13,13 L14.5,14.5', 'M14.5,5.5 L13,7', 'M7,13 L5.5,14.5'],
  Trailblazer: ['M2,17 L10,4 L18,17 Z', 'M7,11 L13,11'],
  Veteran:     ['M10,2 L12,7.5 L18,7.5 L13.5,11 L15.5,17 L10,13.5 L4.5,17 L6.5,11 L2,7.5 L8,7.5 Z'],
}

// ─── NAME REMAP (data file → display name) ────────────────────────────────────
const NAME_REMAP: Record<string, string> = {
  Catalyst: 'Igniter',
  Agent:    'Expert',
  Standard: 'Steward',
}
function displayName(name: string): string {
  return NAME_REMAP[name] ?? name
}

// ─── DOT COORDS OVERRIDE (px=0 left/1 right, py=0 top/1 bottom) ──────────────
const DOT_COORDS: Record<string, { px: number; py: number }> = {
  // Drivers — right side, upper half
  Conductor:   { px: 0.78, py: 0.28 },
  Pioneer:     { px: 0.88, py: 0.20 },
  Purist:      { px: 0.72, py: 0.32 },
  Renegade:    { px: 0.90, py: 0.38 },
  // Catalysts — right side, lower half
  Igniter:     { px: 0.82, py: 0.72 },
  Diplomat:    { px: 0.65, py: 0.85 },
  Rainmaker:   { px: 0.75, py: 0.72 },
  Unifier:     { px: 0.68, py: 0.90 },
  // Operators — left side, upper half
  Anchor:      { px: 0.25, py: 0.28 },
  Navigator:   { px: 0.32, py: 0.20 },
  Sentinel:    { px: 0.18, py: 0.24 },
  Steward:     { px: 0.38, py: 0.34 },
  // Stabilizers — left side, lower half
  Expert:      { px: 0.28, py: 0.72 },
  Executor:    { px: 0.38, py: 0.65 },
  Trailblazer: { px: 0.32, py: 0.82 },
  Veteran:     { px: 0.22, py: 0.68 },
}

function getDotXY(p: typeof REFERENCE_PROFILES[0], w: number, h: number, M: number): { x: number; y: number } {
  const side  = Math.min(w, h)
  const ox    = (w - side) / 2
  const oy    = (h - side) / 2
  const inner = side - M * 2
  const dn    = displayName(p.name)
  const coords = DOT_COORDS[dn] ?? DOT_COORDS[p.name]
  if (coords) {
    return {
      x: ox + M + coords.px * inner,
      y: oy + M + coords.py * inner,
    }
  }
  return dotXY(p.coords.patience, p.coords.extraversion, w, h, M)
}

// ─── ARCH ESSENCE ─────────────────────────────────────────────────────────────
const ARCH_ESSENCE: Record<string, string> = {
  Conductor:   'COMMANDS WITHOUT FILLING SPACE',
  Pioneer:     'STARTS BEFORE IT\'S READY',
  Purist:      'HOLDS THE LINE ON QUALITY',
  Renegade:    'FORCES THE DIFFERENT DIRECTION',
  Igniter:     'CREATES MOMENTUM FAST',
  Diplomat:    'KEEPS EVERYONE ALIGNED',
  Rainmaker:   'WINS THROUGH RELATIONSHIPS',
  Unifier:     'HOLDS THE TEAM TOGETHER',
  Anchor:      'STABLE UNDER ANY PRESSURE',
  Navigator:   'THINKS BEFORE MOVING',
  Sentinel:    'CATCHES WHAT OTHERS MISS',
  Steward:     'RUNS WHAT WORKS CONSISTENTLY',
  Expert:      'OPERATES FROM DEEP KNOWLEDGE',
  Executor:    'TURNS DECISIONS INTO ACTION',
  Trailblazer: 'RAISES WHAT\'S POSSIBLE',
  Veteran:     'GUIDES FROM EXPERIENCE',
}

// ─── ARCH COPY ────────────────────────────────────────────────────────────────
const ARCH_COPY: Record<string, { blurb: string; risk: string }> = {
  Conductor:   { blurb: 'Takes control quickly.',                           risk: 'Overrides others before they step in.' },
  Pioneer:     { blurb: 'Starts fast without waiting for clarity.',         risk: 'Moves on before the work holds.' },
  Purist:      { blurb: 'Holds the line on quality.',                       risk: 'Slows progress to protect the standard.' },
  Renegade:    { blurb: 'Pushes for a different direction.',                risk: 'Breaks alignment to force change.' },
  Igniter:     { blurb: 'Creates momentum quickly.',                        risk: 'Leaves before it turns into output.' },
  Diplomat:    { blurb: 'Keeps people aligned.',                            risk: 'Avoids hard calls to preserve relationships.' },
  Rainmaker:   { blurb: 'Wins through relationships.',                      risk: 'Focus drops after the initial win.' },
  Unifier:     { blurb: 'Holds the team together.',                         risk: 'Maintains alignment when change is needed.' },
  Anchor:      { blurb: 'Keeps things stable under pressure.',              risk: 'Holds steady when change is needed.' },
  Navigator:   { blurb: 'Thinks it through before moving.',                 risk: 'Takes longer than the situation allows.' },
  Sentinel:    { blurb: 'Catches what could go wrong.',                     risk: 'Slows things down to avoid misses.' },
  Steward:     { blurb: 'Runs what works consistently.',                    risk: 'Keeps the same approach after it stops working.' },
  Expert:      { blurb: 'Operates from deep knowledge.',                    risk: 'Hard to follow without the same depth.' },
  Executor:    { blurb: 'Turns decisions into action quickly.',              risk: 'Executes before the direction is fully right.' },
  Trailblazer: { blurb: "Raises the level of what's possible.",             risk: 'Gets restless once things become routine.' },
  Veteran:     { blurb: 'Leans on experience to guide decisions.',           risk: 'Relies on past patterns when the situation has changed.' },
}

function Icon({ paths, size = 20, stroke = 'currentColor' }: { paths: string[]; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none"
      stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function seeded(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return ((h >>> 0) % 1000) / 1000
}

// Maps behavioral coords onto a centered square plot within a (potentially rectangular) canvas
function dotXY(patience: number, extraversion: number, w: number, h: number, margin: number) {
  const side  = Math.min(w, h)
  const ox    = (w - side) / 2
  const oy    = (h - side) / 2
  const inner = side - margin * 2
  return {
    x: ox + margin + (1 - patience)    * inner,
    y: oy + margin + (1 - extraversion) * inner,
  }
}

// ─── PENTAGON ─────────────────────────────────────────────────────────────────
const PENT_ANGLES = Array.from({ length: 5 }, (_, i) => -Math.PI / 2 + i * 2 * Math.PI / 5)

function pentagonVals(p: typeof REFERENCE_PROFILES[0]): number[] {
  return [
    p.coords.dominance,
    p.coords.extraversion,
    1 - p.coords.patience,
    p.coords.formality,
    p.coords.dominance * 0.6 + p.coords.formality * 0.4,
  ]
}

// Generalized pentagon drawing from raw vals + position
function drawPentagonRaw(
  ctx: CanvasRenderingContext2D,
  vals: number[], dx: number, dy: number,
  color: string, progress: number,
  strokeWidth = 1.5, fillAlpha = 0.09, strokeAlpha = 0.75, radiusScale = 1.0, side = RADAR_SIZE,
) {
  const pts = vals.map((v, i) => {
    const r = (0.22 + v * 0.78) * (side / 16) * radiusScale
    return [dx + Math.cos(PENT_ANGLES[i]) * r, dy + Math.sin(PENT_ANGLES[i]) * r]
  })
  let perim = 0
  for (let i = 0; i < 5; i++) {
    const j = (i + 1) % 5
    perim += Math.sqrt((pts[j][0] - pts[i][0]) ** 2 + (pts[j][1] - pts[i][1]) ** 2)
  }
  ctx.beginPath()
  pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.closePath()
  ctx.fillStyle = hexAlpha(color, fillAlpha * progress)
  ctx.fill()
  ctx.setLineDash([perim * progress, perim + 2])
  ctx.strokeStyle = hexAlpha(color, strokeAlpha * progress)
  ctx.lineWidth = strokeWidth
  ctx.stroke()
  ctx.setLineDash([])
}

function drawCanvasPentagon(
  ctx: CanvasRenderingContext2D,
  profile: typeof REFERENCE_PROFILES[0],
  dx: number, dy: number, color: string, progress: number, side = RADAR_SIZE,
) {
  // Outer reference ring — scales with canvas size
  const targetR   = side * 0.08
  const scaleFor  = targetR / (side / 16)   // ensures max r = targetR
  ctx.beginPath()
  ctx.arc(dx, dy, targetR, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = 0.5
  ctx.stroke()
  drawPentagonRaw(ctx, pentagonVals(profile), dx, dy, color, progress, 1.5, 0.14, 0.90, scaleFor, side)
}

// Compute average pentagon vals + dot centroid for a group (uses DOT_COORDS overrides)
function groupAverage(groupKey: string, w: number, h: number, M: number) {
  const ps = REFERENCE_PROFILES.filter(p => p.group === groupKey)
  if (!ps.length) return null
  const avgVals = [0, 0, 0, 0, 0]
  let ax = 0, ay = 0
  ps.forEach(p => {
    pentagonVals(p).forEach((v, i) => { avgVals[i] += v / ps.length })
    const { x, y } = getDotXY(p, w, h, M)
    ax += x / ps.length
    ay += y / ps.length
  })
  return { vals: avgVals, x: ax, y: ay }
}

function MiniPentagon({ vals, color, size = 20 }: { vals: number[]; color: string; size?: number }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 1.5
  const pts = vals.map((v, i) => {
    const r = (0.22 + v * 0.78) * R
    return [cx + Math.cos(PENT_ANGLES[i]) * r, cy + Math.sin(PENT_ANGLES[i]) * r]
  })
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ flexShrink: 0 }}>
      <path d={d} fill={hexAlpha(color, 0.14)} stroke={hexAlpha(color, 0.60)} strokeWidth="1" />
    </svg>
  )
}

// ─── CARD PENTAGON ────────────────────────────────────────────────────────────
function CardPentagon({ name, color, hovered, sectionVisible, cardIndex }: { name: string; color: string; hovered: boolean; sectionVisible: boolean; cardIndex: number }) {
  const [drawn, setDrawn] = useState(false)
  const animatedRef = useRef(false)

  useEffect(() => {
    if ((sectionVisible || hovered) && !drawn) setDrawn(true)
  }, [sectionVisible, hovered, drawn])

  const vals    = PENT_VALUES[name] ?? [60, 60, 60, 60, 60]
  const size    = 72, cx = 36, cy = 36, maxR = 28
  const angles  = [0, 1, 2, 3, 4].map(i => (i * 2 * Math.PI / 5) - Math.PI / 2)

  function ring(r: number) {
    return angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ')
  }

  const dataPoints = vals.map((v, i) => {
    const r = (v / 100) * maxR
    return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`
  }).join(' ')

  const shouldAnimate = drawn && !animatedRef.current
  if (drawn) animatedRef.current = true

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', top: 14, right: 14, pointerEvents: 'none', transition: 'opacity 200ms ease', flexShrink: 0 }}
    >
      <polygon points={ring(maxR)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <polygon points={ring(maxR * 0.5)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <polygon
        points={dataPoints}
        fill={`${color}${hovered ? '30' : '1a'}`}
        stroke={color}
        strokeWidth="1.2"
        opacity={hovered ? 1 : 0.65}
        className={shouldAnimate ? 'pent-first-draw' : undefined}
        style={{ transition: 'opacity 200ms ease, fill 200ms ease', animationDelay: shouldAnimate ? `${cardIndex * 100}ms` : '0ms' }}
      />
    </svg>
  )
}

// ─── RADAR CANVAS ─────────────────────────────────────────────────────────────
const RADAR_SIZE   = 720
const RADAR_MARGIN = 72

type TooltipState = { name: string; tagline: string; color: string; cssX: number; cssY: number }

function RadarCanvas({
  activeCat, hoveredProfileName, onHoverCat, onHoverProfile, onDotClick, selectedProfile,
}: {
  activeCat: string | null
  hoveredProfileName: string | null
  onHoverCat: (k: string | null) => void
  onHoverProfile: (name: string | null) => void
  onDotClick?: (name: string) => void
  selectedProfile?: string | null
}) {
  const canvasRef          = useRef<HTMLCanvasElement>(null)
  const rafRef             = useRef(0)
  const dimsRef            = useRef({ w: 720, h: 720 })
  const activeCatRef       = useRef<string | null>(null)
  const hoveredProfRef     = useRef<string | null>(null)
  const hoverStartRef      = useRef<number>(0)
  const groupFocusStartRef = useRef<number>(0)
  const ambientRef         = useRef<{
    cat: string | null; startT: number; endT: number; nextT: number; idx: number
  }>({ cat: null, startT: 0, endT: 0, nextT: 2200, idx: -1 })
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Keep canvas pixel dimensions in sync with CSS size
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const sync = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width  = Math.round(r.width)
      canvas.height = Math.round(r.height)
      dimsRef.current = { w: canvas.width, h: canvas.height }
    }
    sync()
    const obs = new ResizeObserver(sync)
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    activeCatRef.current = activeCat
    if (activeCat !== null) groupFocusStartRef.current = performance.now()
  }, [activeCat])
  useEffect(() => {
    hoveredProfRef.current = hoveredProfileName
    if (hoveredProfileName) hoverStartRef.current = performance.now()
  }, [hoveredProfileName])

  const pulseParams = useRef(
    REFERENCE_PROFILES.map(p => ({
      phase: seeded(p.name) * Math.PI * 2,
      speed: 0.35 + seeded(p.name + 's') * 0.45,
    }))
  )

  const driftParams = useRef(
    REFERENCE_PROFILES.map(p => ({
      radius: 2 + seeded(p.name + 'd') * 1.5,
      period: (8 + seeded(p.name + 'p') * 6) * 1000,
      phase:  seeded(p.name + 'ph') * Math.PI * 2,
    }))
  )

  const drawFrame = useCallback((t: number, ctx: CanvasRenderingContext2D) => {
    const { w, h } = dimsRef.current
    // Square plot region centered in the (potentially wide) canvas
    const side = Math.min(w, h)
    const M    = Math.round(side * 0.095)   // ~9.5% margin of the plot square
    const ox   = (w - side) / 2             // horizontal offset for centering
    const oy   = (h - side) / 2             // vertical offset
    const cx   = w / 2                      // canvas center x
    const cy   = h / 2                      // canvas center y
    const R    = side / 2 - M               // plot radius

    ctx.clearRect(0, 0, w, h)

    // ── Background: fills full canvas, radial depth from center ──
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7)
    bgGrad.addColorStop(0, '#181818')
    bgGrad.addColorStop(0.5, '#0f0f0f')
    bgGrad.addColorStop(1, '#080808')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    const activeCat    = activeCatRef.current
    const hovProf      = hoveredProfRef.current
    const isInteracting = activeCat !== null || hovProf !== null

    // ── Ambient animation: slow group cycling ──
    const amb = ambientRef.current
    if (!isInteracting) {
      if (t > amb.nextT) {
        amb.idx = (amb.idx + 1) % CATS.length
        amb.cat = CATS[amb.idx].key
        amb.startT = t
        amb.endT   = t + 2600
        amb.nextT  = t + 2600 + 1400 + seeded(CATS[amb.idx].key) * 1200
      }
    } else {
      amb.nextT = t + 3000
    }
    let ambCat: string | null = null
    let ambAlpha = 0
    if (amb.cat && !isInteracting) {
      const fadeIn  = Math.min(1, (t - amb.startT) / 700)
      const fadeOut = t > amb.endT ? 1 - Math.min(1, (t - amb.endT) / 900) : 1
      ambAlpha = fadeIn * fadeOut
      if (ambAlpha > 0.005) ambCat = amb.cat
    }

    // ── Quadrant color washes — extend to full canvas corners ──
    const washes = [
      { qx: cx - R * 0.55, qy: cy - R * 0.55, cat: 'strategic_drive'   },
      { qx: cx + R * 0.55, qy: cy - R * 0.55, cat: 'people_influence'  },
      { qx: cx - R * 0.55, qy: cy + R * 0.55, cat: 'process_structure' },
      { qx: cx + R * 0.55, qy: cy + R * 0.55, cat: 'field_command'     },
    ]
    washes.forEach(ww => {
      const c        = getCat(ww.cat)
      const isActive  = activeCat === ww.cat
      const isAmbient = ambCat === ww.cat
      const opacity   = isActive ? 0.10
        : activeCat !== null ? 0.014
        : isAmbient ? 0.05 + ambAlpha * 0.05
        : 0.032
      const grad = ctx.createRadialGradient(ww.qx, ww.qy, 0, ww.qx, ww.qy, R * 1.1)
      grad.addColorStop(0, hexAlpha(c.color, opacity))
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    })

    // ── Rings: uniform low opacity ──
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(cx, cy, R * i / 4, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1; ctx.stroke()
    }

    // ── Axes: hairlines from plot edge to plot edge ──
    const px0 = ox + M, px1 = ox + side - M
    const py0 = oy + M, py1 = oy + side - M
    ctx.setLineDash([2, 8])
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(px0, cy); ctx.lineTo(px1, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, py0); ctx.lineTo(cx, py1); ctx.stroke()
    ctx.setLineDash([])

    // ── Group pentagon layer (drawn before dots) ──
    const groupProgress = activeCat ? Math.min(1, (t - groupFocusStartRef.current) / 300) : 0

    if (activeCat !== null && groupProgress > 0.01) {
      const gc = getCat(activeCat)
      REFERENCE_PROFILES
        .filter(p => p.group === activeCat)
        .forEach(p => {
          const { x, y } = getDotXY(p, w, h, M)
          drawPentagonRaw(ctx, pentagonVals(p), x, y, gc.color,
            groupProgress, 1.2, 0.06, 0.28, 1.0, side)
        })
      const avg = groupAverage(activeCat, w, h, M)
      if (avg) {
        drawPentagonRaw(ctx, avg.vals, avg.x, avg.y, gc.color,
          groupProgress, 2.2, 0.04, 0.50, 1.15, side)
      }
    }

    // Ambient: faint member pentagons
    if (ambCat !== null && ambAlpha > 0.01) {
      const ac = getCat(ambCat)
      REFERENCE_PROFILES
        .filter(p => p.group === ambCat)
        .forEach(p => {
          const { x, y } = getDotXY(p, w, h, M)
          drawPentagonRaw(ctx, pentagonVals(p), x, y, ac.color,
            ambAlpha * 0.5, 1.0, 0.03, 0.14, 1.0, side)
        })
    }

    // ── Dots ──
    const hoverProg = hovProf ? Math.min(1, (t - hoverStartRef.current) / 200) : 0

    REFERENCE_PROFILES.forEach((p, i) => {
      const base = getDotXY(p, w, h, M)
      const dp   = driftParams.current[i]
      const x    = base.x + dp.radius * Math.cos(t / dp.period + dp.phase)
      const y    = base.y + dp.radius * Math.sin(t / dp.period + dp.phase)
      const c          = getCat(p.group)
      const isHovProf  = displayName(p.name) === hovProf || p.name === hovProf
      const isAmbGroup = p.group === ambCat

      const alpha = hovProf
        ? (isHovProf ? 1.0 : 0.06)
        : activeCat !== null
          ? (activeCat === p.group ? 1.0 : 0.06)
          : isAmbGroup
            ? 0.65 + ambAlpha * 0.25
            : 0.62 - ambAlpha * 0.14

      const isFocused = (activeCat !== null && activeCat === p.group) || isHovProf

      if (isHovProf && hoverProg > 0) {
        drawCanvasPentagon(ctx, p, x, y, c.color, hoverProg, side)
      }

      const pp    = pulseParams.current[i]
      const pulse = (Math.sin(t * 0.001 * pp.speed + pp.phase) + 1) / 2
      // Glow circle — radius 22 (scaled), category color with depth
      if (alpha > 0.08) {
        const glowR = 22 * (side / RADAR_SIZE)
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glowR)
        glowGrad.addColorStop(0, hexAlpha(c.color, 0.18 * alpha))
        glowGrad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(x, y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()

        const pr = 4.5 + pulse * 14
        const pa = (1 - pulse) * 0.26 * (isFocused ? 2.0 : isAmbGroup ? 1.4 : 0.8)
        ctx.beginPath()
        ctx.arc(x, y, pr, 0, Math.PI * 2)
        ctx.strokeStyle = hexAlpha(c.color, Math.min(pa * Math.max(alpha, 0.55), 0.48))
        ctx.lineWidth = 1; ctx.stroke()
      }

      // Main dot — radius 11 (scaled) with inner glow gradient
      const dotR = 11 * (side / RADAR_SIZE)
      const dotGrad = ctx.createRadialGradient(x, y, 0, x, y, dotR)
      dotGrad.addColorStop(0,   hexAlpha(c.color, Math.min(alpha * 1.15, 1.0)))
      dotGrad.addColorStop(0.5, hexAlpha(c.color, alpha * 0.92))
      dotGrad.addColorStop(1,   hexAlpha(c.color, alpha * 0.55))

      ctx.beginPath()
      ctx.arc(x, y, dotR, 0, Math.PI * 2)
      ctx.fillStyle = dotGrad
      ctx.fill()

      if (!isHovProf && activeCat !== null && activeCat === p.group && groupProgress > 0.5) {
        ctx.font = '500 9px system-ui, -apple-system'
        ctx.fillStyle = hexAlpha(c.color, groupProgress * 0.65)
        ctx.textAlign = 'center'
        ctx.fillText(displayName(p.name).toUpperCase(), x, y + 16)
        ctx.textAlign = 'left'
      }
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const loop = (t: number) => { drawFrame(t, ctx); rafRef.current = requestAnimationFrame(loop) }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [drawFrame])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect   = canvas.getBoundingClientRect()
    const { w, h } = dimsRef.current
    // Map CSS mouse coords → canvas pixel coords
    const mx = (e.clientX - rect.left) * (w / rect.width)
    const my = (e.clientY - rect.top)  * (h / rect.height)
    const M  = Math.round(Math.min(w, h) * 0.095)

    let foundProf: string | null = null
    let foundCat:  string | null = null
    let minD = 26  // hit radius in canvas px

    REFERENCE_PROFILES.forEach(p => {
      const { x, y } = getDotXY(p, w, h, M)
      const d = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      if (d < minD) { minD = d; foundProf = displayName(p.name); foundCat = p.group }
    })

    if (foundProf) {
      onHoverProfile(foundProf)
      const prof = REFERENCE_PROFILES.find(p => displayName(p.name) === foundProf || p.name === foundProf)!
      const { x: dotX, y: dotY } = getDotXY(prof, w, h, M)
      // Convert back to CSS px for tooltip positioning
      const cssX = dotX * (rect.width  / w)
      const cssY = dotY * (rect.height / h)
      const c = getCat(prof.group)
      setTooltip({ name: displayName(prof.name), tagline: prof.essence, color: c.color, cssX, cssY })
    } else {
      onHoverProfile(null)
      onHoverCat(foundCat)
      setTooltip(null)
    }
  }, [onHoverProfile, onHoverCat])

  const handleMouseLeave = useCallback(() => {
    onHoverProfile(null); onHoverCat(null); setTooltip(null)
  }, [onHoverProfile, onHoverCat])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onDotClick) return
    const canvas = canvasRef.current; if (!canvas) return
    const rect   = canvas.getBoundingClientRect()
    const { w, h } = dimsRef.current
    const mx = (e.clientX - rect.left) * (w / rect.width)
    const my = (e.clientY - rect.top)  * (h / rect.height)
    const M  = Math.round(Math.min(w, h) * 0.095)
    let foundProf: string | null = null
    let minD = 26
    REFERENCE_PROFILES.forEach(p => {
      const { x, y } = getDotXY(p, w, h, M)
      const d = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      if (d < minD) { minD = d; foundProf = displayName(p.name) }
    })
    if (foundProf) onDotClick(foundProf)
  }, [onDotClick])

  return (
    // Full-bleed: canvas fills its parent section absolutely
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
      />
      {tooltip && (
        <div style={{
          position: 'absolute',
          left:  tooltip.cssX < window.innerWidth * 0.6 ? tooltip.cssX + 14 : undefined,
          right: tooltip.cssX >= window.innerWidth * 0.6 ? `calc(100% - ${tooltip.cssX}px + 14px)` : undefined,
          top: Math.max(8, tooltip.cssY - 22),
          background: '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, padding: '10px 14px',
          pointerEvents: 'none', zIndex: 20, whiteSpace: 'nowrap',
        }}>
          <div style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#eeece6', letterSpacing: '0.04em' }}>{tooltip.name}</div>
          <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.52)', marginTop: 2, lineHeight: 1.4, fontFamily: '"DM Sans", sans-serif' }}>{tooltip.tagline.slice(0, 72)}</div>
          <div style={{ fontSize: 9, color: tooltip.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, fontFamily: '"DM Sans", sans-serif' }}>
            {getCat(REFERENCE_PROFILES.find(p => displayName(p.name) === tooltip.name || p.name === tooltip.name)?.group ?? '')?.label}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── useFadeInUp ──────────────────────────────────────────────────────────────
function useFadeInUp(ref: { current: HTMLElement | null }, delay = 0) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(14px)'
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          el.style.transition = 'opacity 500ms ease, transform 500ms ease'
          el.style.opacity = '1'; el.style.transform = 'translateY(0)'
        }, delay)
        obs.disconnect()
      }
    }, { threshold: 0.06 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, delay])
}

// ─── HSCROLL ROW ──────────────────────────────────────────────────────────────
function HScrollRow({ children }: { children: React.ReactNode }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const [showFade, setShowFade] = useState(true)
  const onScroll = useCallback(() => {
    const el = rowRef.current; if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setPct(max > 0 ? el.scrollLeft / max : 0)
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
    setShowFade(!atEnd)
  }, [])
  return (
    <div style={{ position: 'relative' }}>
      <div ref={rowRef} onScroll={onScroll} style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        paddingBottom: 4,
      }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: 80, height: 'calc(100% - 14px)',
        background: 'linear-gradient(to right, transparent, #080808)',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: showFade ? 1 : 0,
        transition: 'opacity 200ms ease',
      }} />
      <div style={{ marginTop: 10, height: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: `${pct * 60}%`, width: '40%', height: '100%',
          background: 'rgba(255,255,255,0.22)', borderRadius: 1, transition: 'left 80ms linear',
        }} />
      </div>
    </div>
  )
}

// ─── ARCH CARD ────────────────────────────────────────────────────────────────
function ArchCard({ profile, catColor, catKey, onHover, sectionVisible, cardIndex }: {
  profile: typeof REFERENCE_PROFILES[0]
  catColor: string; catKey: string
  onHover: (k: string | null) => void
  sectionVisible: boolean
  cardIndex: number
}) {
  const [hov, setHov] = useState(false)
  const dn = displayName(profile.name)
  return (
    <div
      className="arch-card"
      onMouseEnter={() => { setHov(true); onHover(catKey) }}
      onMouseLeave={() => { setHov(false); onHover(null) }}
      style={{
        background: '#131313',
        border: `1px solid ${hov ? hexAlpha(catColor, 0.20) : 'rgba(255,255,255,0.06)'}`,
        borderTop: `2px solid ${hov ? catColor : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 11,
        cursor: 'default',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 150ms ease, border-color 150ms ease',
        width: 240, flexShrink: 0,
        scrollSnapAlign: 'start', touchAction: 'pan-x',
        position: 'relative',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        height: 240,
        overflow: 'hidden',
      }}
    >
      {/* Scrollable inner content */}
      <div style={{ padding: '18px 18px 0 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Pentagon — absolute top-right */}
        <CardPentagon name={dn} color={catColor} hovered={hov} sectionVisible={sectionVisible} cardIndex={cardIndex} />

        {/* Icon + name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
          <div style={{
            opacity: hov ? 1 : 0.62,
            transition: 'opacity 150ms ease, filter 150ms ease',
            filter: hov ? `drop-shadow(0 0 5px ${hexAlpha(catColor, 0.65)})` : 'none',
            paddingTop: 1, flexShrink: 0,
          }}>
            <Icon paths={ARCH_ICONS[dn] ?? []} size={20} stroke={catColor} />
          </div>
          <div style={{
            fontFamily: '"Barlow Condensed", system-ui, sans-serif',
            fontSize: 18, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.02em',
            color: hov ? catColor : '#eeece6',
            lineHeight: 1.1, transition: 'color 150ms ease',
            paddingRight: 88,
          }}>{dn}</div>
        </div>

        {/* Essence line */}
        {ARCH_ESSENCE[dn] && (
          <div style={{
            fontSize: 10, fontWeight: 400, color: catColor,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            marginBottom: 8,
            fontFamily: '"DM Sans", -apple-system, sans-serif',
            paddingRight: 88,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {ARCH_ESSENCE[dn]}
          </div>
        )}

        {/* Blurb */}
        <p style={{
          fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.62)',
          lineHeight: 1.65, margin: '0 0 0 0',
          fontFamily: '"DM Sans", -apple-system, sans-serif',
        }}>
          {ARCH_COPY[dn]?.blurb ?? profile.essence}
        </p>

        {/* Risk line */}
        {ARCH_COPY[dn]?.risk && (
          <p style={{
            fontSize: 12, fontWeight: 300, fontStyle: 'italic',
            color: 'rgba(238,236,230,0.38)',
            lineHeight: 1.5, margin: '6px 0 0 0',
            fontFamily: '"DM Sans", -apple-system, sans-serif',
          }}>
            — {ARCH_COPY[dn].risk}
          </p>
        )}
      </div>

      {/* Decision signal — absolutely positioned at bottom, opacity-only reveal */}
      {DECISION_SIGNALS[dn] && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: '20px 18px 14px',
          background: 'linear-gradient(to bottom, transparent, #131313 30%)',
          opacity: hov ? 1 : 0,
          transition: 'opacity 200ms ease',
          pointerEvents: hov ? 'auto' : 'none',
        }}>
          <div style={{ borderLeft: '1.5px solid rgba(58,168,104,0.4)', paddingLeft: 8, marginBottom: 5 }}>
            <span style={{
              fontSize: 8, color: '#3aa868', textTransform: 'uppercase',
              letterSpacing: '0.12em', display: 'block', marginBottom: 2,
              fontFamily: '"DM Sans", -apple-system, sans-serif', fontWeight: 400,
            }}>BEST IN</span>
            <span style={{
              fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.7)',
              fontFamily: '"DM Sans", -apple-system, sans-serif',
            }}>{DECISION_SIGNALS[dn].bestIn}</span>
          </div>
          <div style={{ borderLeft: '1.5px solid rgba(200,168,50,0.4)', paddingLeft: 8 }}>
            <span style={{
              fontSize: 8, color: '#c8a832', textTransform: 'uppercase',
              letterSpacing: '0.12em', display: 'block', marginBottom: 2,
              fontFamily: '"DM Sans", -apple-system, sans-serif', fontWeight: 400,
            }}>WATCH FOR</span>
            <span style={{
              fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.7)',
              fontFamily: '"DM Sans", -apple-system, sans-serif',
            }}>{DECISION_SIGNALS[dn].watchFor}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── RADAR COLUMN ─────────────────────────────────────────────────────────────
function RadarColumn({ groups, activeCat, hoveredProfile, setActive, setHovProf }: {
  groups: typeof CATS[number][]
  activeCat: string | null
  hoveredProfile: string | null
  setActive: (k: string | null) => void
  setHovProf: (n: string | null) => void
}) {
  const grouped = groups.map(g => ({
    ...g,
    profiles: REFERENCE_PROFILES.filter(p => p.group === g.key).sort((a, b) => a.name.localeCompare(b.name)),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {grouped.map(g => (
        <div key={g.key}>
          {/* Category header */}
          <div
            onMouseEnter={() => setActive(g.key)}
            onMouseLeave={() => setActive(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, cursor: 'default', paddingLeft: 8 }}
          >
            <Icon paths={CAT_ICONS[g.key] ?? []} size={12} stroke={g.color} />
            <span style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: g.color }}>{g.label}</span>
            <span style={{ fontSize: 11, fontWeight: 300, color: 'rgba(255,255,255,0.28)' }}>{g.descriptor}</span>
          </div>
          {/* Archetype rows */}
          {g.profiles.map(p => {
            const isHovProf = hoveredProfile === p.name
            const isOn = hoveredProfile === null
              ? (activeCat === null || activeCat === p.group)
              : isHovProf
            const isHot = activeCat === p.group && hoveredProfile === null
            return (
              <div key={p.name}
                onMouseEnter={() => { setHovProf(p.name); setActive(p.group) }}
                onMouseLeave={() => { setHovProf(null); setActive(null) }}
                style={{
                  padding: '6px 8px', borderRadius: 5,
                  background: isHovProf ? 'rgba(255,255,255,0.05)' : 'transparent',
                  opacity: isOn ? 1 : 0.22,
                  transition: 'background 150ms ease, opacity 150ms ease',
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <MiniPentagon vals={pentagonVals(p)} color={g.color} size={20} />
                  <span style={{
                    fontFamily: '"Barlow Condensed", system-ui', fontSize: 13, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: (isHovProf || isHot) ? '#FFF' : 'rgba(255,255,255,0.60)',
                    transition: 'color 150ms ease',
                  }}>{displayName(p.name)}</span>
                </div>
                {/* Description slide-in */}
                <div style={{
                  overflow: 'hidden',
                  maxHeight: isHovProf ? 52 : 0,
                  transition: 'max-height 150ms ease',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(255,255,255,0.40)', lineHeight: 1.5, paddingLeft: 27, paddingTop: 3, margin: 0 }}>
                    {p.essence.slice(0, 72)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── WHAT CHANGES ─────────────────────────────────────────────────────────────
const WHAT_CHANGES = [
  "Know who will outperform in this role before the first interview. Not after a bad hire.",
  "Know where friction lives before onboarding. Not after the first 90 days.",
  "Know whether this candidate fits this specific manager — not just the role in the abstract.",
  "Know in six minutes what a reference check takes three weeks to surface. If it surfaces at all.",
]

function WhatChanges() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      padding: 'clamp(48px, 6vh, 72px) clamp(20px, 5vw, 44px) clamp(32px, 4vh, 52px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      maxWidth: 900,
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <h2 style={{
        fontFamily: '"Barlow Condensed", system-ui',
        fontWeight: 900,
        fontSize: 'clamp(22px, 2.8vw, 34px)',
        color: '#eeece6',
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        margin: '0 0 28px 0',
      }}>
        What this actually changes.
      </h2>
      {WHAT_CHANGES.map((text, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          padding: '16px 0',
          borderBottom: i < WHAT_CHANGES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 400ms ease ${i * 80}ms, transform 400ms ease ${i * 80}ms`,
        }}>
          <span style={{
            fontFamily: '"Barlow Condensed", system-ui',
            fontWeight: 700,
            fontSize: 20,
            color: 'rgba(255,255,255,0.13)',
            width: 36,
            flexShrink: 0,
            paddingTop: 2,
          }}>0{i + 1}</span>
          <p style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(238,236,230,0.8)',
            lineHeight: 1.65,
            margin: 0,
          }}>{text}</p>
        </div>
      ))}
    </div>
  )
}

// ─── AXIS LIGHTING ────────────────────────────────────────────────────────────
// dimension index → axis key
// 0=Execution→right, 1=Ownership→bottom, 2=Adaptability→top, 3=Collaboration→top, 4=DecisionSpeed→right
const DIM_TO_AXIS: Record<number, 'left' | 'right' | 'top' | 'bottom'> = {
  0: 'right',   // Execution → URGENT
  1: 'bottom',  // Ownership → RESULTS
  2: 'top',     // Adaptability → PEOPLE
  3: 'top',     // Collaboration → PEOPLE
  4: 'right',   // Decision Speed → URGENT
}

type AxisKey = 'top' | 'bottom' | 'left' | 'right'
type AxisColors = Record<AxisKey, string>
type AxisShadows = Record<AxisKey, string>

const DEFAULT_AXIS_COLORS: AxisColors = {
  top: 'rgba(255,255,255,0.28)', bottom: 'rgba(255,255,255,0.28)',
  left: 'rgba(255,255,255,0.28)', right: 'rgba(255,255,255,0.28)',
}
const DEFAULT_AXIS_SHADOWS: AxisShadows = {
  top: 'none', bottom: 'none', left: 'none', right: 'none',
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const BG  = '#080808'
const MAX = 1240
export default function ArchetypesPage() {
  const [activeCat,      setActiveCat]      = useState<string | null>(null)
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null)
  const [activeSection,  setActiveSection]  = useState(0)
  const [hoveredCat,     setHoveredCat]     = useState<string | null>(null)
  const [axisColors,     setAxisColors]     = useState<AxisColors>(DEFAULT_AXIS_COLORS)
  const [axisShadows,    setAxisShadows]    = useState<AxisShadows>(DEFAULT_AXIS_SHADOWS)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [cardsDrawn,     setCardsDrawn]     = useState(false)

  const ctaBandRef         = useRef<HTMLDivElement>(null)
  const cat0Ref            = useRef<HTMLDivElement>(null)
  const cat1Ref            = useRef<HTMLDivElement>(null)
  const cat2Ref            = useRef<HTMLDivElement>(null)
  const cat3Ref            = useRef<HTMLDivElement>(null)
  const mainRef            = useRef<HTMLElement>(null)
  const archetypeBlocksRef = useRef<HTMLDivElement>(null)

  const setActive  = useCallback((k: string | null) => setActiveCat(k), [])
  const setHovProf = useCallback((n: string | null) => setHoveredProfile(n), [])

  const handleDotClick = useCallback((profileName: string) => {
    if (selectedProfile === profileName) {
      setSelectedProfile(null)
      setAxisColors(DEFAULT_AXIS_COLORS)
      setAxisShadows(DEFAULT_AXIS_SHADOWS)
      return
    }
    setSelectedProfile(profileName)
    const vals = PENT_VALUES[profileName] ?? [60, 60, 60, 60, 60]
    const sorted = vals.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
    const dom1 = DIM_TO_AXIS[sorted[0].i]
    const dom2 = DIM_TO_AXIS[sorted[1].i]
    const newColors: AxisColors = {
      top:    'rgba(255,255,255,0.14)',
      bottom: 'rgba(255,255,255,0.14)',
      left:   'rgba(255,255,255,0.14)',
      right:  'rgba(255,255,255,0.14)',
    }
    const newShadows: AxisShadows = { top: 'none', bottom: 'none', left: 'none', right: 'none' }
    newColors[dom1] = 'rgba(255,255,255,0.90)'
    newShadows[dom1] = '0 0 12px rgba(255,255,255,0.3)'
    if (dom2 !== dom1) {
      newColors[dom2] = 'rgba(255,255,255,0.60)'
    }
    setAxisColors(newColors)
    setAxisShadows(newShadows)
  }, [selectedProfile])

  useFadeInUp(ctaBandRef, 0)
  useFadeInUp(cat0Ref, 0)
  useFadeInUp(cat1Ref, 60)
  useFadeInUp(cat2Ref, 120)
  useFadeInUp(cat3Ref, 180)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap'
    document.head.appendChild(link)
    return () => { try { document.head.removeChild(link) } catch {} }
  }, [])

  useEffect(() => {
    const el = archetypeBlocksRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setCardsDrawn(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])



  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const sections = Array.from(main.querySelectorAll(':scope > section'))
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(sections.indexOf(entry.target as HTMLElement))
          }
        })
      },
      { threshold: 0.1 }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const grouped = CATS.map(c => ({
    ...c,
    profiles: REFERENCE_PROFILES.filter(p => p.group === c.key).sort((a, b) => a.name.localeCompare(b.name)),
  }))

  const catRefs = [cat0Ref, cat1Ref, cat2Ref, cat3Ref]

  return (
    <main ref={mainRef} style={{ background: BG, color: '#FFF', fontFamily: '"DM Sans", -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <Nav activePage="archetypes" />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100svh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        padding: 'clamp(40px, 6vh, 80px) clamp(20px, 5vw, 48px)', overflow: 'hidden',
      }}>
        {/* Ambient pulse */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)', animation: 'heroPulse 4s ease-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)', animation: 'heroPulse 4s ease-out 2s infinite', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 'min(900px, calc(100vw - clamp(40px, 8vw, 160px)))', width: '100%', margin: '0 auto', marginTop: '-10vh' }}>
          <p style={{ fontSize: 10, fontWeight: 300, color: 'rgba(238,236,230,0.32)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            BEHAVIORAL ARCHETYPES
          </p>
          <h1 style={{
            fontFamily: '"Barlow Condensed", system-ui',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.01em', lineHeight: 0.9, margin: 0,
            fontSize: 'clamp(52px, 7vw, 88px)',
            color: '#eeece6',
          }}>
            You already know these people.
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(238,236,230,0.52)', maxWidth: 400, marginTop: 22, lineHeight: 1.65, margin: '22px 0 0 0', fontFamily: '"DM Sans", sans-serif' }}>
            We made the patterns behind them visible.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <a href="/invite-self" style={{
              padding: '12px 28px', borderRadius: 100,
              background: '#eeece6', color: '#080808', fontSize: 14, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none', transition: 'opacity 150ms ease',
              fontFamily: '"DM Sans", sans-serif',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >Start the assessment</a>
            <a href="#archetypes" style={{
              padding: '12px 28px', borderRadius: 100,
              background: 'transparent', color: 'rgba(238,236,230,0.55)',
              border: '1px solid rgba(255,255,255,0.14)',
              fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'border-color 150ms ease, color 150ms ease',
              fontFamily: '"DM Sans", sans-serif',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'rgba(238,236,230,1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(238,236,230,0.55)' }}
            >Browse all {REFERENCE_PROFILES.length}</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.2)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.55)', animation: 'scrollLine 2s ease-in-out infinite' }} />
          </div>
          <p style={{ fontSize: 9, fontWeight: 400, color: 'rgba(238,236,230,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>Scroll</p>
        </div>

      </section>

      {/* ── BEHAVIORAL MAP — full-bleed surface ── */}
      <section style={{ position: 'relative', width: '100%', height: '100svh', overflow: 'hidden' }}>

        {/* Canvas wrapper — full bleed */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <RadarCanvas
            activeCat={activeCat}
            hoveredProfileName={hoveredProfile}
            onHoverCat={setActive}
            onHoverProfile={setHovProf}
            onDotClick={handleDotClick}
            selectedProfile={selectedProfile}
          />
        </div>

        {/* Framing text — centered, below nav */}
        <div style={{
          position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center', pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 300, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(238,236,230,0.28)',
            fontFamily: '"DM Sans", -apple-system, sans-serif',
          }}>
            BEHAVIORAL MAP
          </p>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 300,
            color: 'rgba(238,236,230,0.60)', fontFamily: '"DM Sans", -apple-system, sans-serif',
          }}>
            Every person you&#39;ve ever hired sits somewhere on this map.
          </p>
        </div>

        {/* Axis labels — DOM so they can animate */}
        <span style={{
          position: 'absolute', left: '50%', top: 112, transform: 'translateX(-50%)',
          fontSize: 11, fontWeight: 300, color: axisColors.top,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          pointerEvents: 'none', zIndex: 2,
          transition: 'color 250ms ease, text-shadow 250ms ease',
          textShadow: axisShadows.top,
        }}>PEOPLE</span>

        <span style={{
          position: 'absolute', left: '50%', bottom: 20, transform: 'translateX(-50%)',
          fontSize: 11, fontWeight: 300, color: axisColors.bottom,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          pointerEvents: 'none', zIndex: 2,
          transition: 'color 250ms ease, text-shadow 250ms ease',
          textShadow: axisShadows.bottom,
        }}>RESULTS</span>

        <span style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          fontSize: 11, fontWeight: 300, color: axisColors.left,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          pointerEvents: 'none', zIndex: 2,
          transition: 'color 250ms ease',
        }}>← DELIBERATE</span>

        <span style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          fontSize: 11, fontWeight: 300, color: axisColors.right,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          pointerEvents: 'none', zIndex: 2,
          transition: 'color 250ms ease',
        }}>URGENT →</span>

        {/* Corner category labels — STABILIZERS top-left */}
        {([
          { key: 'strategic_drive',   pos: { top: 72, left: 24 },    align: 'left'  },
          { key: 'people_influence',  pos: { top: 72, right: 24 },   align: 'right' },
          { key: 'process_structure', pos: { bottom: 20, left: 24 },  align: 'left'  },
          { key: 'field_command',     pos: { bottom: 20, right: 24 }, align: 'right' },
        ] as const).map(({ key, pos, align }) => {
          const cat = getCat(key)
          const isDimmed  = hoveredCat !== null && hoveredCat !== key
          const isOn = activeCat === null || activeCat === key
          const profiles = REFERENCE_PROFILES
            .filter(p => p.group === key)
            .sort((a, b) => a.name.localeCompare(b.name))
          return (
            <div key={key}
              onMouseEnter={() => { setActive(key); setHoveredCat(key) }}
              onMouseLeave={() => { setActive(null); setHoveredCat(null) }}
              style={{
                position: 'absolute', ...pos,
                textAlign: align as 'left' | 'right',
                opacity: isOn ? 1 : 0.09,
                transition: 'opacity 400ms ease',
                zIndex: 4, cursor: 'default',
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <div style={{
                  fontFamily: '"Barlow Condensed", system-ui',
                  fontSize: 13, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: isDimmed ? 'rgba(238,236,230,0.18)' : cat.color,
                  lineHeight: 1,
                  transition: 'color 200ms ease',
                }}>{cat.label}</div>
                <div style={{
                  fontSize: 9, fontWeight: 300,
                  color: isDimmed ? 'rgba(238,236,230,0.10)' : 'rgba(238,236,230,0.32)',
                  letterSpacing: '0.06em', marginTop: 3, lineHeight: 1,
                  fontFamily: '"DM Sans", sans-serif',
                  transition: 'color 200ms ease',
                }}>{cat.axisNote}</div>
              </div>
              {profiles.map(p => {
                const dn = displayName(p.name)
                const isDom = DOMINANT_ARCHETYPES.has(dn)
                return (
                  <div key={p.name}
                    onMouseEnter={e => { e.stopPropagation(); setHovProf(dn) }}
                    onMouseLeave={e => { e.stopPropagation(); setHovProf(null) }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: 6, lineHeight: 1.7,
                      flexDirection: align === 'right' ? 'row-reverse' : 'row',
                      cursor: 'default',
                    }}
                  >
                    <span style={{
                      display: 'inline-block', width: 5, height: 5,
                      borderRadius: '50%',
                      background: cat.color,
                      opacity: isDom ? 0.85 : 0.45,
                      flexShrink: 0,
                      transition: 'opacity 150ms ease',
                    }} />
                    <span style={{
                      fontSize: 11, fontWeight: isDom ? 500 : 400,
                      color: isDom ? 'rgba(238,236,230,0.92)' : 'rgba(238,236,230,0.5)',
                      fontFamily: '"DM Sans", -apple-system, sans-serif',
                      letterSpacing: '0.01em',
                      transition: 'color 150ms ease',
                    }}>{dn}</span>
                  </div>
                )
              })}
            </div>
          )
        })}

      </section>

      {/* ── CTA + ARCHETYPE BLOCKS ── */}
      <section id="archetypes" style={{ padding: 0 }}>
        {/* ── WHAT THIS ACTUALLY CHANGES ── */}
        <WhatChanges />

        {/* CTA band */}
        <div ref={ctaBandRef} style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: '#0f0f0f',
          padding: 'clamp(48px, 6vh, 72px) clamp(20px, 5vw, 40px)',
        }}>
          <div style={{ maxWidth: 'min(1240px, calc(100vw - clamp(40px, 8vw, 160px)))', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{
                fontFamily: '"Barlow Condensed", system-ui, sans-serif',
                fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '-0.01em', lineHeight: 1.0, color: '#eeece6', marginBottom: 10, margin: '0 0 10px 0',
              }}>
                FIND YOURS IN SIX MINUTES.
              </h2>
              <p style={{
                fontSize: 14, fontWeight: 300, color: 'rgba(238,236,230,0.45)', margin: 0,
                fontFamily: '"DM Sans", -apple-system, sans-serif',
              }}>
                {REFERENCE_PROFILES.length} archetypes. 94 signals. One honest answer.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              <a href="/invite-self" style={{
                padding: '13px 32px', borderRadius: 100,
                background: '#eeece6', color: '#080808', fontSize: 14, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', transition: 'opacity 150ms ease',
                fontFamily: '"DM Sans", -apple-system, sans-serif',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >Start the assessment</a>
              <a href="/sample-report" style={{
                padding: '13px 32px', borderRadius: 100,
                background: 'transparent', color: 'rgba(238,236,230,0.55)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', transition: 'border-color 150ms ease, color 150ms ease',
                fontFamily: '"DM Sans", -apple-system, sans-serif',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'rgba(238,236,230,1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(238,236,230,0.55)' }}
              >View sample report →</a>
            </div>
          </div>
        </div>

        {/* Archetype blocks */}
        <div ref={archetypeBlocksRef} style={{ padding: 'clamp(40px, 6vh, 72px) clamp(20px, 5vw, 40px) clamp(60px, 8vh, 100px)', maxWidth: 'min(1320px, calc(100vw - clamp(40px, 8vw, 160px)))', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 48 }}>
          {grouped.map((g, idx) => (
            <div key={g.key}>
              <div ref={catRefs[idx]} style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                paddingBottom: 18, borderBottom: `1px solid ${hexAlpha(g.color, 0.14)}`,
                marginBottom: 16, flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <span style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontWeight: 800, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.04em', color: g.color }}>
                    {g.label}
                  </span>
                  <span style={{ fontFamily: '"DM Sans", -apple-system, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(238,236,230,0.42)', marginLeft: 12 }}>
                    {g.descriptor}
                  </span>
                </div>
                <span style={{ fontFamily: '"DM Sans", -apple-system, sans-serif', fontWeight: 300, fontSize: 11, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {g.axisNote}
                </span>
              </div>
              <HScrollRow>
                {g.profiles.map((p, i) => (
                  <ArchCard key={p.name} profile={p} catColor={g.color} catKey={g.key} onHover={setActive} sectionVisible={cardsDrawn} cardIndex={idx * 4 + i} />
                ))}
              </HScrollRow>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px clamp(20px, 5vw, 40px)' }}>
          <div style={{ maxWidth: 'min(1240px, calc(100vw - clamp(40px, 8vw, 160px)))', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)' }}>{PRODUCT_NAME} by Legacy Workforce · © 2026</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)' }}>{COMPANY_EMAIL}</span>
          </div>
        </footer>
      </section>

      <style>{`
        @keyframes heroPulse {
          0%   { opacity: 0.035; transform: translate(-50%,-50%) scale(0.3); }
          100% { opacity: 0;     transform: translate(-50%,-50%) scale(1.9); }
        }
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(100%);  opacity: 0; }
        }
        @keyframes pentDraw {
          from { stroke-dashoffset: 200; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        .pent-first-draw {
          stroke-dasharray: 200;
          animation: pentDraw 450ms ease-out forwards;
        }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .nav-links  { display: none !important; }
          .nav-signin { display: none !important; }
          .nav-inner  { padding: 0 20px !important; }
          .nav-cta    { height: 36px !important; padding: 0 14px !important; }
        }
      `}</style>

      {/* DOT NAV — 3 sections: Hero, Behavioral Map, Archetypes */}
      <div style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'auto',
      }}>
        {(['Hero', 'Behavioral Map', 'Archetypes'] as const).map((label, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onClick={() => {
              const main = mainRef.current
              if (!main) return
              const sections = main.querySelectorAll(':scope > section')
              sections[i]?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {/* Label tooltip */}
            <span style={{
              position: 'absolute', right: 16,
              fontSize: 9, fontWeight: 300, color: 'rgba(238,236,230,0.45)',
              fontFamily: '"DM Sans", -apple-system, sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              whiteSpace: 'nowrap',
              opacity: activeSection === i ? 1 : 0,
              transition: 'opacity 250ms ease',
              pointerEvents: 'none',
            }}>{label}</span>
            <div style={{
              width: activeSection === i ? 6 : 5,
              height: activeSection === i ? 6 : 5,
              borderRadius: '50%',
              background: activeSection === i
                ? 'rgba(255,255,255,0.75)'
                : 'rgba(255,255,255,0.2)',
              transition: 'all 300ms ease',
              cursor: 'pointer',
            }} />
          </div>
        ))}
      </div>

    </main>
  )
}
