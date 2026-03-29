'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { PRODUCT_NAME, COMPANY_EMAIL } from '@/lib/brand'

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CATS = [
  { key: 'field_command',     label: 'Drivers',     descriptor: 'Urgent · Output-focused',       axisNote: 'High Pace · Low People',  color: '#B84848' },
  { key: 'people_influence',  label: 'Catalysts',   descriptor: 'Variable Pace · People-focused', axisNote: 'Mixed Pace · High People', color: '#9A7420' },
  { key: 'process_structure', label: 'Operators',   descriptor: 'Deliberate · Output-focused',    axisNote: 'Low Pace · Low People',   color: '#2D7248' },
  { key: 'strategic_drive',   label: 'Stabilizers', descriptor: 'Deliberate · Mixed People',      axisNote: 'Low Pace · Mid People',   color: '#2458B8' },
] as const

type CatKey = typeof CATS[number]['key']

function getCat(key: string) {
  return CATS.find(c => c.key === key) ?? CATS[0]
}

// ─── SHORT TAGS ───────────────────────────────────────────────────────────────
const TAGS: Record<string, string> = {
  Pioneer:     'Independent · Owner',
  Renegade:    'Bold · Disruptive',
  Purist:      'Standards · Exacting',
  Conductor:   'Authority · Range',
  Catalyst:    'Launch · Ignite',
  Diplomat:    'Alignment · Trust',
  Rainmaker:   'Influence · Warmth',
  Unifier:     'Team · Cohesion',
  Anchor:      'Reliable · Warm',
  Navigator:   'Systematic · Precise',
  Sentinel:    'Compliance · Detail',
  Standard:    'Consistent · Steady',
  Agent:       'Expert · Deep',
  Executor:    'Drive · Discipline',
  Trailblazer: 'Pace · Excellence',
  Veteran:     'Integrity · Steady',
}

// ─── ICON PATHS ───────────────────────────────────────────────────────────────
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
  const w = size - margin * 2
  const h = size - margin * 2
  return {
    x: margin + (1 - patience) * w,
    y: margin + (1 - extraversion) * h,
  }
}

// ─── RADAR CANVAS ─────────────────────────────────────────────────────────────
const RADAR_SIZE   = 420
const RADAR_MARGIN = 48

function RadarCanvas({
  activeCategory,
  onHoverCategory,
}: {
  activeCategory: string | null
  onHoverCategory: (k: string | null) => void
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef(0)
  const activeCatRef = useRef<string | null>(null)

  useEffect(() => { activeCatRef.current = activeCategory }, [activeCategory])

  const pulseParams = useRef(
    REFERENCE_PROFILES.map(p => ({
      phase: seeded(p.name) * Math.PI * 2,
      speed: 0.35 + seeded(p.name + 's') * 0.45,
    }))
  )

  const drawFrame = useCallback((t: number, ctx: CanvasRenderingContext2D) => {
    const S  = RADAR_SIZE
    const M  = RADAR_MARGIN
    const cx = S / 2
    const cy = S / 2
    const R  = cx - M

    ctx.clearRect(0, 0, S, S)
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(0, 0, S, S)

    // rings
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath()
      ctx.arc(cx, cy, R * i / 3, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // axis lines
    ctx.setLineDash([3, 5])
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(M, cy); ctx.lineTo(S - M, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, M); ctx.lineTo(cx, S - M); ctx.stroke()
    ctx.setLineDash([])

    // axis labels
    ctx.font = '500 9px system-ui, -apple-system'
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.textAlign = 'center';  ctx.fillText('PEOPLE',     cx,     M - 10)
    ctx.textAlign = 'center';  ctx.fillText('OUTPUT',     cx,     S - M + 18)
    ctx.textAlign = 'left';    ctx.fillText('DELIBERATE', M,      cy - 8)
    ctx.textAlign = 'right';   ctx.fillText('URGENT',     S - M,  cy - 8)
    ctx.textAlign = 'left'

    const activeCat = activeCatRef.current

    REFERENCE_PROFILES.forEach((p, i) => {
      const { x, y } = dotXY(p.coords.patience, p.coords.extraversion, S, M)
      const c          = getCat(p.group)
      const isOn       = activeCat === null || activeCat === p.group
      const isFocused  = activeCat !== null && activeCat === p.group
      const alpha      = isOn ? (isFocused ? 0.95 : 0.68) : 0.12
      const pp         = pulseParams.current[i]
      const pulse      = (Math.sin(t * 0.001 * pp.speed + pp.phase) + 1) / 2

      // bloom
      if (isOn) {
        const pr = 5 + pulse * 16
        const pa = (1 - pulse) * 0.30 * (isFocused ? 1.4 : 0.85)
        ctx.beginPath()
        ctx.arc(x, y, pr, 0, Math.PI * 2)
        ctx.strokeStyle = hexAlpha(c.color, Math.min(pa, 1))
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // dot
      ctx.beginPath()
      ctx.arc(x, y, isFocused ? 5 : 4, 0, Math.PI * 2)
      ctx.fillStyle = hexAlpha(c.color, alpha)
      ctx.fill()
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    function loop(t: number) {
      drawFrame(t, ctx!)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [drawFrame])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect   = canvas.getBoundingClientRect()
    const scaleX = RADAR_SIZE / rect.width
    const scaleY = RADAR_SIZE / rect.height
    const mx     = (e.clientX - rect.left) * scaleX
    const my     = (e.clientY - rect.top)  * scaleY

    let found: string | null = null
    let minD = 20
    REFERENCE_PROFILES.forEach(p => {
      const { x, y } = dotXY(p.coords.patience, p.coords.extraversion, RADAR_SIZE, RADAR_MARGIN)
      const d = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
      if (d < minD) { minD = d; found = p.group }
    })
    onHoverCategory(found)
  }, [onHoverCategory])

  return (
    <canvas
      ref={canvasRef}
      width={RADAR_SIZE}
      height={RADAR_SIZE}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHoverCategory(null)}
      style={{ width: RADAR_SIZE, height: RADAR_SIZE, cursor: 'crosshair', borderRadius: 2, flexShrink: 0 }}
    />
  )
}

// ─── ARCH CARD ────────────────────────────────────────────────────────────────
function ArchCard({
  profile,
  catColor,
  catKey,
  onHover,
}: {
  profile: typeof REFERENCE_PROFILES[0]
  catColor: string
  catKey: string
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
        borderTop: `1px solid ${hov ? catColor : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 11,
        padding: '20px 18px 18px',
        cursor: 'default',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 150ms ease, border-color 150ms ease, border-top-color 150ms ease',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ opacity: hov ? 1 : 0.65, transition: 'opacity 150ms ease' }}>
        <Icon paths={ARCH_ICONS[profile.name] ?? []} size={20} stroke={catColor} />
      </div>
      <div>
        <div style={{
          fontFamily: '"Barlow Condensed", system-ui',
          fontSize: 20, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: hov ? catColor : 'rgba(255,255,255,0.88)',
          lineHeight: 1.1, marginBottom: 8,
          transition: 'color 150ms ease',
        }}>
          {profile.name}
        </div>
        <p style={{
          fontSize: 12, fontWeight: 300,
          color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.65, margin: 0,
          fontFamily: '"DM Sans", sans-serif',
        }}>
          {profile.essence}
        </p>
      </div>
      <div style={{
        display: 'inline-block', alignSelf: 'flex-start',
        fontSize: 10, fontWeight: 500,
        color: hexAlpha(catColor, 0.75),
        background: hexAlpha(catColor, 0.08),
        border: `1px solid ${hexAlpha(catColor, 0.14)}`,
        borderRadius: 5, padding: '3px 8px',
        fontFamily: '"DM Sans", sans-serif',
        letterSpacing: '0.04em',
        marginTop: 'auto',
      }}>
        {TAGS[profile.name] ?? profile.tagline.split(',')[0]}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const BG  = '#0A0A0A'
const MAX = 1240

export default function ArchetypesPage() {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [scrolled,  setScrolled]  = useState(false)

  const setActive = useCallback((k: string | null) => setActiveCat(k), [])

  useEffect(() => {
    const link = document.createElement('link')
    link.rel   = 'stylesheet'
    link.href  = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap'
    document.head.appendChild(link)
    return () => { try { document.head.removeChild(link) } catch {} }
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const grouped = CATS.map(c => ({
    ...c,
    profiles: REFERENCE_PROFILES
      .filter(p => p.group === c.key)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))

  return (
    <main style={{
      background: BG, color: '#FFF', minHeight: '100vh',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      overflowX: 'hidden',
    }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 200ms ease',
      }}>
        <div className="nav-inner" style={{ maxWidth: MAX, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            {PRODUCT_NAME}
          </Link>
          <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {[
              { label: 'Product',       href: '/#how-it-works' },
              { label: 'Method',        href: '/profiles' },
              { label: 'Archetypes',    href: '/archetypes' },
              { label: 'Sample Report', href: '/sample-report' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{
                fontSize: 13,
                fontWeight: l.href === '/archetypes' ? 500 : 400,
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

      {/* HERO */}
      <section style={{ padding: '100px 40px 88px', position: 'relative', textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 28 }}>
          Behavioral Archetypes
        </p>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: '"Barlow Condensed", system-ui',
            fontSize: 'clamp(52px, 8.5vw, 108px)',
            fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.01em', lineHeight: 0.92, margin: 0,
          }}>
            <span style={{ color: '#FFFFFF', display: 'block' }}>You&apos;ve met these people.</span>
            <span style={{ color: 'rgba(255,255,255,0.10)', display: 'block' }}>Now you have words for them.</span>
          </h1>
        </div>
        <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.38)', maxWidth: 420, margin: '32px auto 0', lineHeight: 1.7 }}>
          Browse the patterns recruiters recognize instantly — or find your own in six minutes.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          <a href="/invite-self" style={{
            height: 44, padding: '0 24px', borderRadius: 8,
            background: '#FFFFFF', color: BG,
            fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
            textDecoration: 'none', transition: 'opacity 150ms ease',
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
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18))' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.18)' }}>SCROLL</span>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ticker 34s linear infinite', whiteSpace: 'nowrap' }}>
          {[0, 1].map(rep => (
            <span key={rep} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {['DRIVERS', 'CATALYSTS', 'OPERATORS', 'STABILIZERS', 'PACE', 'PEOPLE', `${REFERENCE_PROFILES.length} ARCHETYPES`, '94 SIGNALS', 'BEHAVIORAL FIT', 'ROLE ALIGNMENT'].map(item => (
                <span key={item + rep} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.14em', padding: '0 18px' }}>{item}</span>
                  <span style={{ color: 'rgba(255,255,255,0.10)', fontSize: 10 }}>·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* RADAR + LIST */}
      <section style={{ padding: '88px 40px 80px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto' }}>
          <div style={{ marginBottom: 56, maxWidth: 560 }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16 }}>The System</p>
            <h2 style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.0, color: '#FFF', marginBottom: 16 }}>
              Four types. One map.
            </h2>
            <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>
              Every archetype sits on two axes: Pace (deliberate to urgent) and People-orientation (output-focused to people-focused). Drivers push right. Operators anchor left. Catalysts rise to the top. Stabilizers hold the middle.
            </p>
          </div>

          <div className="radar-layout" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
            <RadarCanvas activeCategory={activeCat} onHoverCategory={setActive} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {grouped.map(g => (
                <div key={g.key} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'default' }}
                    onMouseEnter={() => setActive(g.key)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <Icon paths={CAT_ICONS[g.key] ?? []} size={14} stroke={g.color} />
                    <span style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', color: g.color }}>{g.label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{g.descriptor}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {g.profiles.map(p => {
                      const isOn  = activeCat === null || activeCat === p.group
                      const isHot = activeCat === p.group
                      return (
                        <div key={p.name}
                          onMouseEnter={() => setActive(p.group)}
                          onMouseLeave={() => setActive(null)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', borderRadius: 6,
                            background: isHot ? 'rgba(255,255,255,0.04)' : 'transparent',
                            border: `1px solid ${isHot ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                            opacity: isOn ? 1 : 0.30,
                            transition: 'all 150ms ease',
                            cursor: 'default',
                          }}
                        >
                          <span style={{ fontFamily: '"Barlow Condensed", system-ui', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: isHot ? g.color : 'rgba(255,255,255,0.62)' }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.20)' }}>
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

      {/* CTA BAND */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D', padding: '52px 40px' }}>
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
              background: '#FFF', color: BG,
              fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
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
      </section>

      {/* ARCHETYPE BLOCKS */}
      <section id="archetypes" style={{ padding: '80px 40px 100px' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 72 }}>
          {grouped.map(g => (
            <div key={g.key}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: 20, borderBottom: `1px solid ${hexAlpha(g.color, 0.14)}`,
                marginBottom: 24, flexWrap: 'wrap', gap: 12,
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 12 }}>
                {g.profiles.map(p => (
                  <ArchCard key={p.name} profile={p} catColor={g.color} catKey={g.key} onHover={setActive} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)' }}>{PRODUCT_NAME} by Legacy Workforce · © 2026</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)' }}>{COMPANY_EMAIL}</span>
        </div>
      </footer>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          .nav-links  { display: none !important; }
          .nav-signin { display: none !important; }
          .nav-inner  { padding: 0 20px !important; }
          .nav-cta    { height: 36px !important; padding: 0 14px !important; }
          .radar-layout { flex-direction: column !important; }
        }
        @media (max-width: 600px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </main>
  )
}
