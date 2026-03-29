'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { PRODUCT_NAME, COMPANY_EMAIL } from '@/lib/brand'

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CATS = [
  { key: 'field_command',     label: 'Drivers',     descriptor: 'Urgent · Output-focused',        axisNote: 'High Pace · Low People',  color: '#B84848' },
  { key: 'people_influence',  label: 'Catalysts',   descriptor: 'Variable Pace · People-focused', axisNote: 'Mixed Pace · High People', color: '#9A7420' },
  { key: 'process_structure', label: 'Operators',   descriptor: 'Deliberate · Output-focused',    axisNote: 'Low Pace · Low People',   color: '#2D7248' },
  { key: 'strategic_drive',   label: 'Stabilizers', descriptor: 'Deliberate · Mixed People',      axisNote: 'Low Pace · Mid People',   color: '#2458B8' },
] as const

function getCat(key: string) {
  return CATS.find(c => c.key === key) ?? CATS[0]
}

// ─── TAGS ─────────────────────────────────────────────────────────────────────
const TAGS: Record<string, string> = {
  Pioneer: 'Independent · Owner', Renegade: 'Bold · Disruptive',
  Purist: 'Standards · Exacting', Conductor: 'Authority · Range',
  Catalyst: 'Launch · Ignite',    Diplomat: 'Alignment · Trust',
  Rainmaker: 'Influence · Warmth', Unifier: 'Team · Cohesion',
  Anchor: 'Reliable · Warm',      Navigator: 'Systematic · Precise',
  Sentinel: 'Compliance · Detail', Standard: 'Consistent · Steady',
  Agent: 'Expert · Deep',          Executor: 'Drive · Discipline',
  Trailblazer: 'Pace · Excellence', Veteran: 'Integrity · Steady',
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
  Catalyst:    ['M10,10 L10,4', 'M10,10 L15.2,7', 'M10,10 L15.2,13', 'M10,10 L10,16', 'M10,10 L4.8,13', 'M10,10 L4.8,7'],
  Diplomat:    ['M3,4 L11,4 L11,9 L8,9 L6,12 L6,9 L3,9 Z', 'M9,7 L17,7 L17,12 L15,12 L15,14 L13,12 L9,12 Z'],
  Rainmaker:   ['M10,3 Q10,9 7.5,11 a2.5,2.5 0 0,0 5,0 Q10,9 10,3 Z', 'M4,17 Q6.5,14 9,17 Q11.5,20 14,17 Q16.5,14 19,17'],
  Unifier:     ['M6,10 a4,4 0 1,0 8,0', 'M6,10 a4,4 0 1,1 8,0'],
  Anchor:      ['M10,4 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0', 'M10,6 L10,16', 'M6,9 L14,9', 'M6,16 Q10,14 14,16'],
  Navigator:   ['M10,10 m-6.5,0 a6.5,6.5 0 1,0 13,0 a6.5,6.5 0 1,0 -13,0', 'M10,3.5 L10,5.5', 'M10,14.5 L10,16.5', 'M3.5,10 L5.5,10', 'M14.5,10 L16.5,10', 'M10,10 L12.5,6.5'],
  Sentinel:    ['M10,2 L17,5 L17,12 Q17,16 10,19 Q3,16 3,12 L3,5 Z'],
  Standard:    ['M3,17 L17,3', 'M7,13 L9,11', 'M10,10 L12,8', 'M13,7 L15,5'],
  Agent:       ['M9,9 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0', 'M13,13 L17,17'],
  Executor:    ['M10,10 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0', 'M10,3 L10,5', 'M10,15 L10,17', 'M3,10 L5,10', 'M15,10 L17,10', 'M5.5,5.5 L7,7', 'M13,13 L14.5,14.5', 'M14.5,5.5 L13,7', 'M7,13 L5.5,14.5'],
  Trailblazer: ['M2,17 L10,4 L18,17 Z', 'M7,11 L13,11'],
  Veteran:     ['M10,2 L12,7.5 L18,7.5 L13.5,11 L15.5,17 L10,13.5 L4.5,17 L6.5,11 L2,7.5 L8,7.5 Z'],
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

function dotXY(patience: number, extraversion: number, size: number, margin: number) {
  return {
    x: margin + (1 - patience) * (size - margin * 2),
    y: margin + (1 - extraversion) * (size - margin * 2),
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

function drawCanvasPentagon(
  ctx: CanvasRenderingContext2D,
  profile: typeof REFERENCE_PROFILES[0],
  dx: number, dy: number, color: string, progress: number,
) {
  const pts = pentagonVals(profile).map((v, i) => {
    const r = (0.22 + v * 0.78) * 36
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
  ctx.fillStyle = hexAlpha(color, 0.09 * progress)
  ctx.fill()
  ctx.setLineDash([perim * progress, perim + 2])
  ctx.strokeStyle = hexAlpha(color, 0.75 * progress)
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])
}

function MiniPentagon({ vals, color, size = 26 }: { vals: number[]; color: string; size?: number }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 2
  const pts = vals.map((v, i) => {
    const r = (0.22 + v * 0.78) * R
    return [cx + Math.cos(PENT_ANGLES[i]) * r, cy + Math.sin(PENT_ANGLES[i]) * r]
  })
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ flexShrink: 0 }}>
      <path d={d} fill={hexAlpha(color, 0.12)} stroke={hexAlpha(color, 0.55)} strokeWidth="1" />
    </svg>
  )
}

// ─── RADAR CANVAS ─────────────────────────────────────────────────────────────
const RADAR_SIZE   = 560
const RADAR_MARGIN = 56

type TooltipState = { name: string; tagline: string; color: string; cssX: number; cssY: number }

function RadarCanvas({
  activeCat, hoveredProfileName, onHoverCat, onHoverProfile,
}: {
  activeCat: string | null
  hoveredProfileName: string | null
  onHoverCat: (k: string | null) => void
  onHoverProfile: (name: string | null) => void
}) {
  const canvasRef         = useRef<HTMLCanvasElement>(null)
  const rafRef            = useRef(0)
  const activeCatRef      = useRef<string | null>(null)
  const hoveredProfRef    = useRef<string | null>(null)
  const hoverStartRef     = useRef<number>(0)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => { activeCatRef.current = activeCat }, [activeCat])
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

  const drawFrame = useCallback((t: number, ctx: CanvasRenderingContext2D) => {
    const S = RADAR_SIZE, M = RADAR_MARGIN
    const cx = S / 2, cy = S / 2, R = cx - M

    ctx.clearRect(0, 0, S, S)
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(0, 0, S, S)

    for (let i = 1; i <= 3; i++) {
      ctx.beginPath()
      ctx.arc(cx, cy, R * i / 3, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1; ctx.stroke()
    }

    ctx.setLineDash([3, 5])
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(M, cy); ctx.lineTo(S - M, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, M); ctx.lineTo(cx, S - M); ctx.stroke()
    ctx.setLineDash([])

    ctx.font = '500 10px system-ui, -apple-system'
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.textAlign = 'center';  ctx.fillText('PEOPLE',     cx,     M - 12)
    ctx.textAlign = 'center';  ctx.fillText('OUTPUT',     cx,     S - M + 20)
    ctx.textAlign = 'left';    ctx.fillText('DELIBERATE', M,      cy - 10)
    ctx.textAlign = 'right';   ctx.fillText('URGENT',     S - M,  cy - 10)
    ctx.textAlign = 'left'

    const activeCat  = activeCatRef.current
    const hovProf    = hoveredProfRef.current
    const hoverProg  = hovProf ? Math.min(1, (t - hoverStartRef.current) / 400) : 0

    REFERENCE_PROFILES.forEach((p, i) => {
      const { x, y } = dotXY(p.coords.patience, p.coords.extraversion, S, M)
      const c = getCat(p.group)
      const isHovProf = p.name === hovProf
      const alpha = hovProf
        ? (isHovProf ? 0.95 : 0.10)
        : activeCat === null ? 0.68 : activeCat === p.group ? 0.95 : 0.12
      const isFocused = (activeCat !== null && activeCat === p.group) || isHovProf
      const pp    = pulseParams.current[i]
      const pulse = (Math.sin(t * 0.001 * pp.speed + pp.phase) + 1) / 2

      if (isHovProf && hoverProg > 0) drawCanvasPentagon(ctx, p, x, y, c.color, hoverProg)

      if (alpha > 0.11) {
        const pr = 5 + pulse * 16
        const pa = (1 - pulse) * 0.30 * (isFocused ? 1.4 : 0.85)
        ctx.beginPath()
        ctx.arc(x, y, pr, 0, Math.PI * 2)
        ctx.strokeStyle = hexAlpha(c.color, Math.min(pa * alpha, 1))
        ctx.lineWidth = 1; ctx.stroke()
      }

      ctx.beginPath()
      ctx.arc(x, y, isHovProf ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = hexAlpha(c.color, alpha)
      ctx.fill()
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
    const scaleX = RADAR_SIZE / rect.width
    const scaleY = RADAR_SIZE / rect.height
    const mx     = (e.clientX - rect.left) * scaleX
    const my     = (e.clientY - rect.top)  * scaleY

    let foundProf: string | null = null
    let foundCat:  string | null = null
    let minD = 22

    REFERENCE_PROFILES.forEach(p => {
      const { x, y } = dotXY(p.coords.patience, p.coords.extraversion, RADAR_SIZE, RADAR_MARGIN)
      const d = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      if (d < minD) { minD = d; foundProf = p.name; foundCat = p.group }
    })

    if (foundProf) {
      onHoverProfile(foundProf)
      const prof = REFERENCE_PROFILES.find(p => p.name === foundProf)!
      const { x: dotX, y: dotY } = dotXY(prof.coords.patience, prof.coords.extraversion, RADAR_SIZE, RADAR_MARGIN)
      const cssX = dotX * (rect.width  / RADAR_SIZE)
      const cssY = dotY * (rect.height / RADAR_SIZE)
      const c = getCat(prof.group)
      setTooltip({ name: prof.name, tagline: prof.essence, color: c.color, cssX, cssY })
    } else {
      onHoverProfile(null)
      onHoverCat(foundCat)
      setTooltip(null)
    }
  }, [onHoverProfile, onHoverCat])

  const handleMouseLeave = useCallback(() => {
    onHoverProfile(null); onHoverCat(null); setTooltip(null)
  }, [onHoverProfile, onHoverCat])

  return (
    <div style={{ position: 'relative', width: 'min(52vw, 560px)', height: 'min(52vw, 560px)', flexShrink: 0 }}>
      <canvas
        ref={canvasRef}
        width={RADAR_SIZE} height={RADAR_SIZE}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%', cursor: 'crosshair', borderRadius: 2 }}
      />
      {tooltip && (
        <div style={{
          position: 'absolute',
          left:  tooltip.cssX <= 280 ? tooltip.cssX + 14 : undefined,
          right: tooltip.cssX >  280 ? `calc(100% - ${tooltip.cssX}px + 14px)` : undefined,
          top: Math.max(0, tooltip.cssY - 22),
          background: 'rgba(12,12,12,0.97)',
          border: `1px solid ${hexAlpha(tooltip.color, 0.32)}`,
          borderRadius: 7, padding: '8px 12px',
          pointerEvents: 'none', zIndex: 10, minWidth: 130,
        }}>
          <div style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', color: tooltip.color, letterSpacing: '0.04em' }}>{tooltip.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.44)', marginTop: 2, lineHeight: 1.4 }}>{tooltip.tagline.slice(0, 58)}</div>
        </div>
      )}
    </div>
  )
}

// ─── useFadeInUp ──────────────────────────────────────────────────────────────
function useFadeInUp(ref: { current: HTMLElement | null }, delay = 0) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(16px)'
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          el.style.transition = 'opacity 500ms ease, transform 500ms ease'
          el.style.opacity = '1'; el.style.transform = 'translateY(0)'
        }, delay)
        obs.disconnect()
      }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, delay])
}

// ─── HSCROLL ROW ──────────────────────────────────────────────────────────────
function HScrollRow({ children }: { children: React.ReactNode }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(0)
  const onScroll = useCallback(() => {
    const el = rowRef.current; if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setPct(max > 0 ? el.scrollLeft / max : 0)
  }, [])
  return (
    <div>
      <div ref={rowRef} onScroll={onScroll} style={{
        display: 'flex', gap: 12,
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        paddingBottom: 4,
      }}>
        {children}
      </div>
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
function ArchCard({ profile, catColor, catKey, onHover }: {
  profile: typeof REFERENCE_PROFILES[0]
  catColor: string; catKey: string
  onHover: (k: string | null) => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => { setHov(true); onHover(catKey) }}
      onMouseLeave={() => { setHov(false); onHover(null) }}
      style={{
        background: '#131313',
        border: `1px solid ${hov ? hexAlpha(catColor, 0.20) : 'rgba(255,255,255,0.06)'}`,
        borderTop: `2px solid ${hov ? catColor : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 11, padding: '20px 18px 18px',
        cursor: 'default',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 150ms ease, border-color 150ms ease',
        display: 'flex', flexDirection: 'column', gap: 10,
        width: 240, flexShrink: 0,
        scrollSnapAlign: 'start',
        touchAction: 'pan-x',
      }}
    >
      <div style={{
        opacity: hov ? 1 : 0.62,
        transition: 'opacity 150ms ease, filter 150ms ease',
        filter: hov ? `drop-shadow(0 0 5px ${hexAlpha(catColor, 0.65)})` : 'none',
      }}>
        <Icon paths={ARCH_ICONS[profile.name] ?? []} size={20} stroke={catColor} />
      </div>
      <div>
        <div style={{
          fontFamily: '"Barlow Condensed", system-ui',
          fontSize: 20, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: hov ? catColor : 'rgba(255,255,255,0.88)',
          lineHeight: 1.1, marginBottom: 8, transition: 'color 150ms ease',
        }}>{profile.name}</div>
        <p style={{ fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0, fontFamily: '"DM Sans", sans-serif' }}>
          {profile.essence}
        </p>
      </div>
      <div style={{
        display: 'inline-block', alignSelf: 'flex-start', marginTop: 'auto',
        fontSize: 10, fontWeight: 500,
        color: hexAlpha(catColor, 0.75),
        background: hexAlpha(catColor, 0.08),
        border: `1px solid ${hexAlpha(catColor, 0.14)}`,
        borderRadius: 5, padding: '3px 8px',
        fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.04em',
      }}>
        {TAGS[profile.name] ?? profile.tagline.split(',')[0]}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const BG  = '#0A0A0A'
const MAX = 1240
const HERO_WORDS = ["YOU'VE", 'MET', 'THESE', 'PEOPLE.']

export default function ArchetypesPage() {
  const [activeCat,      setActiveCat]      = useState<string | null>(null)
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null)
  const [scrolled,       setScrolled]       = useState(false)
  const [heroWords,      setHeroWords]      = useState(0)
  const [heroGhost,      setHeroGhost]      = useState(false)

  const snapRef      = useRef<HTMLDivElement>(null)
  const radarHeadRef = useRef<HTMLDivElement>(null)
  const radarWrapRef = useRef<HTMLDivElement>(null)
  const ctaBandRef   = useRef<HTMLDivElement>(null)
  const cat0Ref      = useRef<HTMLDivElement>(null)
  const cat1Ref      = useRef<HTMLDivElement>(null)
  const cat2Ref      = useRef<HTMLDivElement>(null)
  const cat3Ref      = useRef<HTMLDivElement>(null)

  const setActive  = useCallback((k: string | null) => setActiveCat(k), [])
  const setHovProf = useCallback((n: string | null) => setHoveredProfile(n), [])

  useFadeInUp(radarHeadRef, 0)
  useFadeInUp(radarWrapRef, 80)
  useFadeInUp(ctaBandRef,   0)
  useFadeInUp(cat0Ref,      0)
  useFadeInUp(cat1Ref,      60)
  useFadeInUp(cat2Ref,      120)
  useFadeInUp(cat3Ref,      180)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap'
    document.head.appendChild(link)
    return () => { try { document.head.removeChild(link) } catch {} }
  }, [])

  useEffect(() => {
    const el = snapRef.current; if (!el) return
    const h = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', h, { passive: true })
    return () => el.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    HERO_WORDS.forEach((_, i) => setTimeout(() => setHeroWords(i + 1), 80 + i * 60))
    setTimeout(() => setHeroGhost(true), 80 + HERO_WORDS.length * 60 + 220)
  }, [])

  const grouped = CATS.map(c => ({
    ...c,
    profiles: REFERENCE_PROFILES.filter(p => p.group === c.key).sort((a, b) => a.name.localeCompare(b.name)),
  }))

  const catRefs = [cat0Ref, cat1Ref, cat2Ref, cat3Ref]

  const tickerNames = [...REFERENCE_PROFILES]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => p.name.toUpperCase())

  return (
    <div ref={snapRef} className="snap-page" style={{ background: BG, color: '#FFF', fontFamily: '"DM Sans", -apple-system, sans-serif' }}>
      {/* FIXED NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 200ms ease',
      }}>
        <div className="nav-inner" style={{ maxWidth: MAX, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textDecoration: 'none', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</Link>
          <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {([
              { label: 'Product',    href: '/#how-it-works' },
              { label: 'Method',     href: '/profiles' },
              { label: 'Archetypes', href: '/archetypes' },
              { label: 'Sample Report', href: '/sample-report' },
            ] as const).map(l => (
              <Link key={l.label} href={l.href} style={{
                fontSize: 13, fontWeight: l.href === '/archetypes' ? 500 : 400,
                color: l.href === '/archetypes' ? '#FFF' : 'rgba(255,255,255,0.42)',
                textDecoration: 'none', transition: 'color 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={e => (e.currentTarget.style.color = l.href === '/archetypes' ? '#FFF' : 'rgba(255,255,255,0.42)')}
              >{l.label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" className="nav-signin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', transition: 'color 150ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
            >Sign in</Link>
            <a href={`mailto:${COMPANY_EMAIL}`} className="nav-cta" style={{
              height: 34, padding: '0 16px', borderRadius: 7,
              background: '#FFF', color: BG, fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}>Talk to us</a>
          </div>
        </div>
      </nav>

        {/* ── HERO ── */}
        <section className="snap-beat" style={{ position: 'relative', textAlign: 'center', overflowX: 'hidden' }}>
          {/* Ambient pulse */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)', animation: 'heroPulse 4s ease-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)', animation: 'heroPulse 4s ease-out 2s infinite', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              Behavioral Archetypes
            </p>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <h1 style={{
                fontFamily: '"Barlow Condensed", system-ui',
                fontSize: 'clamp(44px, 6.5vw, 88px)',
                fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '-0.01em', lineHeight: 0.92, margin: 0,
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.22em', justifyContent: 'center', marginBottom: '0.06em' }}>
                  {HERO_WORDS.map((word, i) => (
                    <span key={i} style={{
                      display: 'inline-block', color: '#FFFFFF',
                      opacity: heroWords > i ? 1 : 0,
                      transform: heroWords > i ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 320ms ease, transform 320ms ease',
                    }}>{word}</span>
                  ))}
                </div>
                <span style={{
                  display: 'block', color: 'rgba(255,255,255,0.13)',
                  opacity: heroGhost ? 1 : 0,
                  transform: heroGhost ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 320ms ease, transform 320ms ease',
                }}>Now you have words for them.</span>
              </h1>
            </div>
            <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.38)', maxWidth: 420, margin: '32px auto 0', lineHeight: 1.7 }}>
              Browse the patterns recruiters recognize instantly — or find your own in six minutes.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
              <a href="/invite-self" style={{
                height: 44, padding: '0 24px', borderRadius: 8,
                background: '#FFFFFF', color: BG, fontSize: 14, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', textDecoration: 'none', transition: 'opacity 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >Find your archetype</a>
              <a href="#archetypes" style={{
                height: 44, padding: '0 24px', borderRadius: 8,
                background: 'transparent', color: 'rgba(255,255,255,0.50)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontSize: 14, fontWeight: 400, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', transition: 'border-color 150ms ease, color 150ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = '#FFF' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.50)' }}
              >Browse all {REFERENCE_PROFILES.length}</a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 1, height: 28, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: '100%', background: 'rgba(255,255,255,0.30)', animation: 'scrollDrop 1.8s ease-in-out infinite' }} />
            </div>
            <span style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.18)' }}>SCROLL</span>
          </div>
        </section>

        {/* ── TICKER + RADAR ── */}
        <section className="snap-beat-scroll" style={{ padding: 0 }}>
          {/* Ticker */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', animation: 'ticker 42s linear infinite', whiteSpace: 'nowrap' }}>
              {[0, 1].map(rep => (
                <span key={rep} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {tickerNames.map(name => (
                    <span key={name + rep} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', padding: '0 16px', fontFamily: '"Barlow Condensed", system-ui' }}>{name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.10)', fontSize: 10 }}>·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* Radar + sidebar */}
          <div style={{ flex: 1, padding: '64px 40px 72px', maxWidth: MAX + 80, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div ref={radarHeadRef} style={{ marginBottom: 48, maxWidth: 520 }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}>The System</p>
              <h2 style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.0, color: '#FFF', marginBottom: 16 }}>
                Four types. One map.
              </h2>
              <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>
                Every archetype sits on two axes: Pace (deliberate to urgent) and People-orientation (output-focused to people-focused). Drivers push right. Operators anchor left. Catalysts rise. Stabilizers hold the middle.
              </p>
            </div>

            <div ref={radarWrapRef} className="radar-layout" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
              <RadarCanvas
                activeCat={activeCat}
                hoveredProfileName={hoveredProfile}
                onHoverCat={setActive}
                onHoverProfile={setHovProf}
              />

              {/* Sidebar list */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {grouped.map(g => (
                  <div key={g.key} style={{ marginBottom: 28 }}>
                    <div style={{
                      position: 'sticky', top: 0, background: BG, paddingBottom: 8, zIndex: 2,
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'default',
                    }}
                      onMouseEnter={() => setActive(g.key)}
                      onMouseLeave={() => setActive(null)}
                    >
                      <Icon paths={CAT_ICONS[g.key] ?? []} size={14} stroke={g.color} />
                      <span style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: g.color }}>{g.label}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{g.descriptor}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '7px 10px', borderRadius: 6,
                              background: isHovProf ? 'rgba(255,255,255,0.04)' : 'transparent',
                              border: `1px solid ${isHovProf ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                              opacity: isOn ? 1 : 0.20,
                              transition: 'all 150ms ease', cursor: 'default',
                            }}
                          >
                            <MiniPentagon vals={pentagonVals(p)} color={g.color} size={24} />
                            <span style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: (isHovProf || isHot) ? g.color : 'rgba(255,255,255,0.62)', flex: 1 }}>
                              {p.name}
                            </span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>
                              {p.tagline.split(',').slice(0, 2).join(',').trim()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA + BLOCKS ── */}
        <section className="snap-beat-scroll" id="archetypes" style={{ padding: 0 }}>
          {/* CTA band */}
          <div ref={ctaBandRef} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D', padding: '52px 40px', flexShrink: 0 }}>
            <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.0, color: '#FFF', marginBottom: 10 }}>
                  Find yours in six minutes.
                </h2>
                <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.32)' }}>
                  {REFERENCE_PROFILES.length} archetypes. 94 signals. One honest answer.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                <a href="/invite-self" style={{
                  height: 44, padding: '0 24px', borderRadius: 8,
                  background: '#FFF', color: BG, fontSize: 14, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none', transition: 'opacity 150ms ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Start the assessment</a>
                <a href="/sample-report" style={{
                  height: 44, padding: '0 24px', borderRadius: 8,
                  background: 'transparent', color: 'rgba(255,255,255,0.48)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 14, fontWeight: 400, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none', transition: 'border-color 150ms ease, color 150ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.26)'; e.currentTarget.style.color = '#FFF' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.48)' }}
                >View sample report →</a>
              </div>
            </div>
          </div>

          {/* Archetype blocks */}
          <div style={{ padding: '72px 40px 100px', maxWidth: MAX + 80, margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 64 }}>
            {grouped.map((g, idx) => (
              <div key={g.key}>
                <div ref={catRefs[idx]} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: 18, borderBottom: `1px solid ${hexAlpha(g.color, 0.14)}`,
                  marginBottom: 20, flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon paths={CAT_ICONS[g.key] ?? []} size={22} stroke={g.color} />
                    <span style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em', color: g.color }}>
                      {g.label}
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', fontWeight: 300 }}>{g.descriptor}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>{g.axisNote}</span>
                </div>
                <HScrollRow>
                  {g.profiles.map(p => (
                    <ArchCard key={p.name} profile={p} catColor={g.color} catKey={g.key} onHover={setActive} />
                  ))}
                </HScrollRow>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px' }}>
            <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)' }}>{PRODUCT_NAME} by Legacy Workforce · © 2026</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)' }}>{COMPANY_EMAIL}</span>
            </div>
          </footer>
        </section>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes heroPulse {
          0%   { opacity: 0.035; transform: translate(-50%,-50%) scale(0.3); }
          100% { opacity: 0;     transform: translate(-50%,-50%) scale(1.9); }
        }
        @keyframes scrollDrop {
          0%   { top: -50%; height: 50%; opacity: 0; }
          20%  { opacity: 0.7; }
          80%  { opacity: 0.7; }
          100% { top: 100%; height: 50%; opacity: 0; }
        }
        @media (max-width: 768px) {
          .nav-links  { display: none !important; }
          .nav-signin { display: none !important; }
          .nav-inner  { padding: 0 20px !important; }
          .nav-cta    { height: 36px !important; padding: 0 14px !important; }
          .radar-layout { flex-direction: column !important; }
        }
        @media (max-width: 600px) {
          .snap-beat { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  )
}
