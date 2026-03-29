'use client'

import { useEffect, useState, useRef } from 'react'
import Nav from '@/app/components/Nav'

// ── Tokens ────────────────────────────────────────────────────────────────────
const GREEN     = '#3aa868'
const AMBER     = '#c8a832'
const BLUE      = '#4a8eff'
const TEXT      = '#eeece6'
const SUB       = 'rgba(238,236,230,0.42)'
const FAINT     = 'rgba(238,236,230,0.22)'
const DIV       = 'rgba(255,255,255,0.06)'
const CONDENSED = '"Barlow Condensed", sans-serif'

// ── Dimension data ────────────────────────────────────────────────────────────
const AXES = [
  {
    key: 'execution', svgLabel: 'Execution', fullLabel: 'Execution',
    score: 82, benchmark: 75, delta: +7, above: true,
    interp: 'Above benchmark by +7',
    impl: 'Drives execution without needing direction. An asset in environments with clear mandates.',
    lx: 100, ly: 16, anchor: 'middle', baseline: 'auto',
  },
  {
    key: 'ownership', svgLabel: 'Ownership', fullLabel: 'Ownership',
    score: 74, benchmark: 72, delta: +2, above: true,
    interp: 'At benchmark (+2)',
    impl: 'Takes accountability. Meets the bar — does not significantly exceed it. Monitor in high-stakes roles.',
    lx: 178, ly: 80, anchor: 'start', baseline: 'middle',
  },
  {
    key: 'adaptability', svgLabel: 'Adapt.', fullLabel: 'Adaptability',
    score: 70, benchmark: 65, delta: +5, above: true,
    interp: 'Above benchmark by +5',
    impl: 'Handles shifting scope without losing execution edge. Resilient to ambiguity.',
    lx: 150, ly: 170, anchor: 'start', baseline: 'hanging',
  },
  {
    key: 'collaboration', svgLabel: 'Collab.', fullLabel: 'Collaboration',
    score: 62, benchmark: 68, delta: -6, above: false,
    interp: 'Below benchmark by −6',
    impl: 'Prefers independent execution over cross-functional coordination. The only gap — and the source of the pacing risk.',
    lx: 50, ly: 170, anchor: 'end', baseline: 'hanging',
  },
  {
    key: 'decisionSpeed', svgLabel: 'Dec. Speed', fullLabel: 'Decision Speed',
    score: 88, benchmark: 78, delta: +10, above: true,
    interp: 'Significantly above benchmark (+10)',
    impl: 'Largest delta on the screen. Moves faster than most environments expect. Primary source of Operating Partner friction.',
    lx: 20, ly: 80, anchor: 'end', baseline: 'middle',
  },
]

// ── Pentagon geometry ─────────────────────────────────────────────────────────
const CENTER = 100, MAX_R = 72
const angle  = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i) / 5
const vertex = (val: number, i: number) => ({
  x: CENTER + Math.cos(angle(i)) * MAX_R * (val / 100),
  y: CENTER + Math.sin(angle(i)) * MAX_R * (val / 100),
})
const polyPts = (vals: number[]) =>
  vals.map((v, i) => { const p = vertex(v, i); return `${p.x},${p.y}` }).join(' ')
const ringPts = (pct: number) =>
  AXES.map((_, i) => { const p = vertex(pct, i); return `${p.x},${p.y}` }).join(' ')

const CAND_VALS  = AXES.map(a => a.score)
const BENCH_VALS = AXES.map(a => a.benchmark)
const RING_50    = ringPts(50)
const RING_100   = ringPts(100)

// Candidate polygon perimeter for stroke-dashoffset draw-in animation
const CAND_PERIMETER = (() => {
  let p = 0
  for (let i = 0; i < 5; i++) {
    const a = vertex(CAND_VALS[i], i)
    const b = vertex(CAND_VALS[(i + 1) % 5], (i + 1) % 5)
    p += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return Math.ceil(p) + 4
})()

// Shortlist comparison ghosts
const SHORTLIST = [
  { label: 'Cand. B', vals: [70, 65, 60, 72, 66], color: 'rgba(255,255,255,0.12)', dash: '5 4' },
  { label: 'Cand. C', vals: [73, 68, 64, 67, 58], color: 'rgba(255,255,255,0.08)', dash: '3 4' },
]

// Team dynamics — used for axisKey lookup (effectiveHovAxis)
const TEAM = [
  { role: 'CEO',               axisKey: 'execution'    },
  { role: 'Operating Partner', axisKey: 'decisionSpeed'},
  { role: 'Board',             axisKey: 'collaboration'},
]

// Right-panel team rows (pill display data)
const TEAM_ROWS = [
  {
    role: 'CEO', pill: 'STRONG ALIGNMENT', axisKey: 'execution',
    pillBg: 'rgba(58,168,104,0.12)', pillBorder: 'rgba(58,168,104,0.25)', pillColor: GREEN,
    note: 'Will experience Kent as decisive and effective.',
  },
  {
    role: 'Operating Partner', pill: 'PACING GAP', axisKey: 'decisionSpeed',
    pillBg: 'rgba(200,168,50,0.12)', pillBorder: 'rgba(200,168,50,0.25)', pillColor: AMBER,
    note: 'Friction on pacing — manageable with early alignment on decision cadence.',
  },
  {
    role: 'Board', pill: 'MODERATE FIT', axisKey: 'collaboration',
    pillBg: 'rgba(255,255,255,0.05)', pillBorder: 'rgba(255,255,255,0.12)', pillColor: 'rgba(238,236,230,0.5)',
    note: 'May want structured communication cadence. Low risk if expectations are set.',
  },
]

// Team hover → radar axis highlight mapping
const TEAM_AXES: Record<string, { key: string; color: 'blue' | 'amber' }[]> = {
  'CEO':               [{ key: 'execution', color: 'blue' }, { key: 'ownership', color: 'blue' }],
  'Operating Partner': [{ key: 'decisionSpeed', color: 'amber' }],
  'Board':             [{ key: 'collaboration', color: 'amber' }],
}

const fade = (mounted: boolean, delay: number): React.CSSProperties => ({
  opacity:    mounted ? 1 : 0,
  transform:  mounted ? 'translateY(0)' : 'translateY(5px)',
  transition: `opacity 380ms ease ${delay}ms, transform 380ms ease ${delay}ms`,
})

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [navLight,        setNavLight]        = useState(false)
  const [lineDrawn,       setLineDrawn]       = useState(false)
  const [showWhy,         setShowWhy]         = useState(false)
  const [activeSection,   setActiveSection]   = useState(0)
  const [cardMounted,     setCardMounted]     = useState(false)
  const [hoveredAxis,     setHoveredAxis]     = useState<string | null>(null)
  const [hoveredTeam,     setHoveredTeam]     = useState<string | null>(null)
  const [hoveredWatchout, setHoveredWatchout] = useState(false)
  const [compMode,        setCompMode]        = useState<'benchmark' | 'shortlist'>('benchmark')
  const [scrollThumb,     setScrollThumb]     = useState({ top: 0, height: 32, visible: false })
  const [scoreDisplay,    setScoreDisplay]    = useState(85)
  const [radarPhase,      setRadarPhase]      = useState(0)   // 0=idle, 1=drawing, 2=bench visible
  const [pulseActive,     setPulseActive]     = useState(false)
  const [tabIndicator,    setTabIndicator]    = useState({ left: 0, width: 0 })

  const beat4Ref        = useRef<HTMLDivElement>(null)
  const snapRef         = useRef<HTMLDivElement>(null)
  const reportRef       = useRef<HTMLElement | null>(null)
  const rightColRef     = useRef<HTMLDivElement>(null)
  const hasAnimated     = useRef(false)
  const tabRef0         = useRef<HTMLButtonElement>(null)
  const tabRef1         = useRef<HTMLButtonElement>(null)
  const tabContainerRef = useRef<HTMLDivElement>(null)

  // Nav light
  useEffect(() => {
    const els = document.querySelectorAll('.beat-light')
    const obs = new IntersectionObserver(
      (entries) => { setNavLight(entries.some(e => e.isIntersecting)) },
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Line draw trigger
  useEffect(() => {
    const el = beat4Ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLineDrawn(true); obs.disconnect() } },
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Beat 1 scroll reveal
  useEffect(() => {
    const container = snapRef.current; if (!container) return
    const handled = { current: false }, scrollingAway = { current: false }
    let touchStartY = 0
    const tryReveal = (e: Event) => {
      if (container.scrollTop > 10 || handled.current) return
      handled.current = true; scrollingAway.current = true
      e.preventDefault(); setShowWhy(true)
      setTimeout(() => { reportRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 900)
    }
    const onWheel      = (e: WheelEvent) => { if (e.deltaY > 0) tryReveal(e) }
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
    const onTouchEnd   = (e: TouchEvent) => { if (touchStartY - e.changedTouches[0].clientY > 30) tryReveal(e) }
    const onScroll     = () => {
      if (scrollingAway.current) { if (container.scrollTop > 50) scrollingAway.current = false; return }
      if (container.scrollTop < 10) { handled.current = false; setShowWhy(false) }
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: false })
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Active section dot nav
  useEffect(() => {
    const container = snapRef.current; if (!container) return
    const sections = Array.from(container.querySelectorAll('section'))
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(sections.indexOf(entry.target as HTMLElement)) }) },
      { threshold: 0.5, root: container }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  // Card mount animation
  useEffect(() => {
    const t = setTimeout(() => setCardMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Score count-up + radar entrance — fires once when card section enters viewport
  useEffect(() => {
    const el = reportRef.current as Element | null; if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        // Score: 85 → 93 over 500ms ease-out cubic
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 500)
          const ease = 1 - Math.pow(1 - t, 3)
          setScoreDisplay(Math.round(85 + 8 * ease))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        // Radar 3-moment entrance
        setRadarPhase(1)                                 // moment 1: candidate polygon draws in
        setTimeout(() => setRadarPhase(2), 800)          // moment 2: benchmark fades in
        setTimeout(() => setPulseActive(true),  1200)    // moment 3: decision speed pulses
        setTimeout(() => setPulseActive(false), 1600)
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Custom scroll indicator — init after card mount
  useEffect(() => {
    const el = rightColRef.current; if (!el) return
    if (el.scrollHeight > el.clientHeight) {
      const h = Math.max(24, (el.clientHeight / el.scrollHeight) * el.clientHeight)
      setScrollThumb({ top: 0, height: h, visible: true })
    }
  }, [cardMounted])

  // Tab sliding indicator position
  useEffect(() => {
    const container = tabContainerRef.current
    const activeEl = (compMode === 'benchmark' ? tabRef0 : tabRef1).current
    if (!container || !activeEl) return
    const cRect = container.getBoundingClientRect()
    const eRect = activeEl.getBoundingClientRect()
    setTabIndicator({ left: eRect.left - cRect.left, width: eRect.width })
  }, [compMode, cardMounted])

  const onRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight <= el.clientHeight) { setScrollThumb(s => ({ ...s, visible: false })); return }
    const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight)
    const h = Math.max(24, (el.clientHeight / el.scrollHeight) * el.clientHeight)
    setScrollThumb({ top: ratio * (el.clientHeight - h), height: h, visible: true })
  }

  // ── Active radar highlights ──────────────────────────────────────────────────
  // Priority: team hover > watchout hover > direct axis hover
  const activeHighlights = new Map<string, 'blue' | 'amber'>()
  if (hoveredTeam) {
    ;(TEAM_AXES[hoveredTeam] ?? []).forEach(({ key, color }) => activeHighlights.set(key, color))
  } else if (hoveredWatchout) {
    activeHighlights.set('decisionSpeed', 'amber')
    activeHighlights.set('collaboration', 'amber')
  } else if (hoveredAxis) {
    const ax = AXES.find(a => a.key === hoveredAxis)
    activeHighlights.set(hoveredAxis, ax?.above !== false ? 'blue' : 'amber')
  }
  const anyHighlight = activeHighlights.size > 0
  // Callout panel: only direct axis hover (not team/watchout — those respond in the radar)
  const hovAxData = hoveredAxis ? (AXES.find(a => a.key === hoveredAxis) ?? null) : null

  return (
    <div className="snap-page" ref={snapRef}>
      <style>{`
        .snap-page::-webkit-scrollbar { display: none }
        .report-card-right::-webkit-scrollbar { display: none }
        @media (max-width: 768px) {
          .report-card-body  { flex-direction: column !important; }
          .report-card-left  { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          .report-card-right { padding: 16px !important; }
        }
        .team-row { transition: background 150ms ease; border-radius: 6px; padding: 5px 6px; margin: 0 -6px; cursor: default; }
        .team-row:hover { background: rgba(255,255,255,0.04) !important; }
        .comp-btn { cursor: pointer; background: none; border: none; padding: 0; }
        .watchout-block { cursor: default; border-radius: 4px; transition: background 150ms ease; }
        .watchout-block:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      <Nav light={navLight} />

      {/* ── BEAT 1 ── */}
      <section className="snap-beat" style={{ background: '#080808' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 700,
            color: showWhy ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.88)',
            letterSpacing: '-0.03em', lineHeight: 1.05,
            marginBottom: showWhy ? 18 : 0,
            transition: 'color 500ms ease, margin-bottom 500ms ease',
          }}>
            You already know<br />who&apos;s right for the role.
          </p>
          <p style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 700,
            color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.05,
            opacity: showWhy ? 1 : 0,
            transform: showWhy ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 450ms ease 80ms, transform 450ms ease 80ms',
            pointerEvents: 'none',
          }}>
            Now show your client why.
          </p>
        </div>
      </section>

      {/* ── BEAT 2 — The card ── */}
      <section
        ref={reportRef}
        className="snap-beat"
        style={{ background: '#080808', position: 'relative', overflow: 'hidden', padding: 0 }}
      >
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '130%', paddingBottom: '130%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(58,168,104,0.03) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{
            width: '100%',
            maxWidth: 'min(1060px, calc(100vw - clamp(40px, 8vw, 160px)))',
            height: 'calc(100svh - 58px)',
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.6)',
          }}>

            {/* HEADER RAIL — permanently visible, never scrolls */}
            <div style={{
              height: 38, padding: '0 20px', flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Candidate Recommendation Report
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Presented to client · Mar 14, 2026
              </span>
            </div>

            {/* BODY */}
            <div className="report-card-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

              {/* ── LEFT: Evidence panel ── */}
              <div className="report-card-left" style={{
                width: '40%', flexShrink: 0,
                borderRight: `1px solid ${DIV}`,
                padding: '18px 20px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>

                {/* Identity + comparison toggle */}
                <div style={fade(cardMounted, 0)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 9, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
                        PE-Backed CFO · Velocity Growth Partners
                      </p>
                      <p style={{ fontSize: 20, fontFamily: CONDENSED, fontWeight: 800, color: TEXT }}>
                        Kent Morrison
                      </p>
                    </div>
                    {/* Comparison toggle — sliding underline indicator */}
                    <div ref={tabContainerRef} style={{ position: 'relative', display: 'inline-flex', gap: 16, flexShrink: 0, marginTop: 4 }}>
                      {(['benchmark', 'shortlist'] as const).map((mode, idx) => (
                        <button
                          key={mode}
                          ref={idx === 0 ? tabRef0 : tabRef1}
                          className="comp-btn"
                          onClick={() => setCompMode(mode)}
                          style={{
                            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: compMode === mode ? 'rgba(238,236,230,0.88)' : 'rgba(238,236,230,0.32)',
                            transition: 'color 200ms ease',
                          }}
                        >
                          {mode === 'benchmark' ? 'vs. Role' : 'vs. Shortlist'}
                        </button>
                      ))}
                      {/* Sliding indicator bar */}
                      {tabIndicator.width > 0 && (
                        <div style={{
                          position: 'absolute', bottom: -2, height: '1.5px',
                          background: 'rgba(238,236,230,0.8)', borderRadius: 1,
                          left: tabIndicator.left, width: tabIndicator.width,
                          transition: 'left 200ms ease, width 200ms ease',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Radar */}
                <div style={{ width: '100%', aspectRatio: '1 / 1', flexShrink: 0, ...fade(cardMounted, 80) }}>
                  <svg
                    viewBox="-35 -5 260 215"
                    style={{ width: '100%', height: '100%' }}
                    onMouseLeave={() => setHoveredAxis(null)}
                  >
                    {/* Grid rings */}
                    <polygon points={RING_50}  fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    <polygon points={RING_100} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                    {/* Axis lines + labels + hit areas */}
                    {AXES.map((ax, i) => {
                      const tip = vertex(100, i)
                      const highlightColor = activeHighlights.get(ax.key)
                      const isHighlighted  = !!highlightColor
                      const isDimmed       = anyHighlight && !isHighlighted
                      const isPulse        = ax.key === 'decisionSpeed' && pulseActive

                      const axisStroke = isDimmed
                        ? 'rgba(255,255,255,0.06)'
                        : isHighlighted
                          ? (highlightColor === 'amber' ? 'rgba(200,168,50,0.6)' : 'rgba(37,99,235,0.7)')
                          : isPulse ? 'rgba(37,99,235,0.7)'
                          : 'rgba(255,255,255,0.05)'
                      const labelFill = isDimmed
                        ? 'rgba(238,236,230,0.14)'
                        : (isHighlighted || isPulse) ? 'rgba(238,236,230,0.85)'
                        : 'rgba(238,236,230,0.32)'

                      return (
                        <g key={ax.key} onMouseEnter={() => setHoveredAxis(ax.key)} style={{ cursor: 'default' }}>
                          <line x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y}
                            stroke={axisStroke}
                            strokeWidth={isHighlighted || isPulse ? '1' : '0.75'}
                            style={{ transition: 'stroke 200ms ease, stroke-width 200ms ease' }}
                          />
                          <line x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y}
                            stroke="transparent" strokeWidth="20" />
                          <text
                            x={ax.lx} y={ax.ly}
                            textAnchor={ax.anchor as 'middle' | 'start' | 'end'}
                            dominantBaseline={ax.baseline as 'auto' | 'middle' | 'hanging'}
                            fontSize="9"
                            fill={labelFill}
                            style={{ transition: 'fill 200ms ease' }}
                          >
                            {ax.svgLabel}
                          </text>
                        </g>
                      )
                    })}

                    {/* ─ Benchmark polygon — fades in at radar phase 2 ─ */}
                    {compMode === 'benchmark' && (
                      <polygon
                        points={polyPts(BENCH_VALS)}
                        fill="rgba(255,255,255,0.015)"
                        stroke="rgba(255,255,255,0.32)"
                        strokeWidth="1.2"
                        strokeDasharray="6 4"
                        style={{
                          opacity: radarPhase >= 2 ? 1 : 0,
                          transition: 'opacity 400ms ease',
                        }}
                      />
                    )}

                    {/* ─ Shortlist ghosts ─ */}
                    {compMode === 'shortlist' && SHORTLIST.map((ghost, idx) => (
                      <polygon
                        key={ghost.label}
                        points={polyPts(ghost.vals)}
                        fill="none"
                        stroke={ghost.color}
                        strokeWidth="1"
                        strokeDasharray={ghost.dash}
                        style={{
                          opacity: radarPhase >= 1 ? 1 : 0,
                          transition: `opacity 500ms ease ${300 + idx * 80}ms`,
                        }}
                      />
                    ))}

                    {/* ─ Candidate polygon — draws in clockwise via stroke-dashoffset ─ */}
                    <polygon
                      points={polyPts(CAND_VALS)}
                      fill={`rgba(74,142,255,${radarPhase >= 1 ? 0.09 : 0})`}
                      stroke={BLUE}
                      strokeWidth="2"
                      strokeDasharray={CAND_PERIMETER}
                      strokeDashoffset={radarPhase >= 1 ? 0 : CAND_PERIMETER}
                      style={{ transition: 'stroke-dashoffset 800ms ease-out, fill 800ms ease-out' }}
                    />

                    {/* ─ Vertex dots + delta labels (on top of polygons) ─ */}
                    {AXES.map((ax, i) => {
                      const pt             = vertex(ax.score, i)
                      const highlightColor = activeHighlights.get(ax.key)
                      const isHighlighted  = !!highlightColor
                      const isPulse        = ax.key === 'decisionSpeed' && pulseActive
                      const dotR           = isHighlighted ? 7 : isPulse ? 5.5 : 3
                      const dotFill        = isHighlighted
                        ? (highlightColor === 'amber' ? AMBER : BLUE)
                        : BLUE
                      const showLabel      = (isHighlighted && !!hoveredTeam) || isPulse
                      const labelColor     = isPulse && !isHighlighted ? BLUE : (highlightColor === 'amber' ? AMBER : BLUE)
                      const deltaStr       = ax.delta > 0 ? `+${ax.delta}` : `${ax.delta}`
                      const lx             = pt.x > CENTER + 4 ? pt.x + 10 : pt.x < CENTER - 4 ? pt.x - 10 : pt.x
                      const ly             = pt.y > CENTER + 4 ? pt.y + 12 : pt.y - 12
                      const anchor         = pt.x > CENTER + 4 ? 'start' : pt.x < CENTER - 4 ? 'end' : 'middle'
                      return (
                        <g key={ax.key}>
                          <circle cx={pt.x} cy={pt.y} r={dotR} fill={dotFill}
                            style={{
                              opacity: radarPhase >= 1 ? 1 : 0,
                              transition: 'opacity 600ms ease 420ms, r 200ms ease, fill 200ms ease',
                            }}
                          />
                          {showLabel && (
                            <text x={lx} y={ly} textAnchor={anchor as 'start' | 'end' | 'middle'}
                              fontSize="8" fontWeight="600" fill={labelColor}>
                              {deltaStr} vs benchmark
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Legend + callout area */}
                <div style={fade(cardMounted, 380)}>
                  {/* Integrated legend */}
                  <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)' }}>— Candidate</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)' }}>- - Role benchmark</span>
                  </div>
                  {/* Axis callout */}
                  <div style={{ minHeight: 48 }}>
                    {hovAxData ? (
                      <div style={{ borderLeft: `2px solid ${hovAxData.above ? BLUE : AMBER}`, paddingLeft: 10 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: TEXT }}>{hovAxData.fullLabel}</p>
                        <p style={{ margin: '0 0 3px', fontSize: 9, fontWeight: 600, color: hovAxData.above ? BLUE : AMBER }}>{hovAxData.interp}</p>
                        <p style={{ margin: 0, fontSize: 9, color: SUB, lineHeight: 1.45 }}>{hovAxData.impl}</p>
                      </div>
                    ) : compMode === 'shortlist' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 8, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          Kent vs. shortlist
                        </p>
                        {[
                          { text: '↑ Leads on Decision Speed by +18–22pts', pos: true },
                          { text: '↑ Stronger execution profile than both', pos: true },
                          { text: '↓ Lower collaboration vs. Cand. B', pos: false },
                        ].map(({ text, pos }) => (
                          <div key={text} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 9, color: pos ? 'rgba(74,142,255,0.7)' : AMBER, flexShrink: 0 }}>{text.slice(0, 1)}</span>
                            <span style={{ fontSize: 9, color: FAINT, lineHeight: 1.4 }}>{text.slice(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[
                          { label: 'Decision Speed', delta: +10, above: true },
                          { label: 'Execution',      delta: +7,  above: true },
                          { label: 'Collaboration',  delta: -6,  above: false },
                        ].map(({ label, delta, above }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 9, color: above ? 'rgba(74,142,255,0.7)' : AMBER, flexShrink: 0 }}>{above ? '↑' : '↓'}</span>
                            <span style={{ fontSize: 9, color: FAINT }}>{label} — {above ? `+${delta}` : `${delta}`} vs. benchmark</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ── RIGHT: Decision panel ── */}
              <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div
                  className="report-card-right"
                  ref={rightColRef}
                  onScroll={onRightScroll}
                  style={{
                    flex: 1, minHeight: 0,
                    display: 'flex', flexDirection: 'column',
                    padding: '0 22px 20px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none' as any,
                  }}
                >

                  {/* S1 — Headline */}
                  <div style={{ padding: '14px 0 12px', ...fade(cardMounted, 0) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: 0,
                          fontSize: 'clamp(14px, 1.5vw, 17px)', fontWeight: 600, color: TEXT, lineHeight: 1.3,
                        }}>
                          Strong hire — high-velocity operator with manageable pacing risk
                        </p>
                        <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(238,236,230,0.35)' }}>
                          Top 1 of 3 shortlisted · 4 of 5 dimensions above benchmark
                        </p>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
                        <span style={{ display: 'block', fontSize: 56, fontFamily: CONDENSED, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                          {scoreDisplay}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 6, display: 'block' }}>Top 5% vs. benchmark</span>
                      </div>
                    </div>
                  </div>

                  {/* S2 — Primary Watchout */}
                  <div
                    className="watchout-block"
                    onMouseEnter={() => setHoveredWatchout(true)}
                    onMouseLeave={() => setHoveredWatchout(false)}
                    style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.09)', ...fade(cardMounted, 80) }}
                  >
                    <p style={{ margin: '0 0 5px', fontSize: 9, color: FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      Primary Watchout
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500, color: TEXT }}>
                      Moves faster than the organization can absorb.
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(238,236,230,0.45)', lineHeight: 1.45 }}>
                      Pioneer profile + high-autonomy role = pace mismatch with stakeholders who expect consultation.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 8, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Thrives In</p>
                        {['CEO grants autonomous execution', 'Ownership is clear, stakeholder drag is low'].map(t => (
                          <p key={t} style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(238,236,230,0.62)', lineHeight: 1.4, borderLeft: '1.5px solid rgba(58,168,104,0.3)', paddingLeft: 7 }}>{t}</p>
                        ))}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 8, color: AMBER, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Watch For</p>
                        {['Operating Partner expects coordination on pacing', 'Decisions require partner-wide alignment'].map(t => (
                          <p key={t} style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(238,236,230,0.62)', lineHeight: 1.4, borderLeft: '1.5px solid rgba(200,168,50,0.3)', paddingLeft: 7 }}>{t}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* S3 — Team Dynamics */}
                  <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.09)', ...fade(cardMounted, 160) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <p style={{ margin: 0, fontSize: 9, color: FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Team Dynamics</p>
                      <p style={{ margin: 0, fontSize: 9, color: 'rgba(238,236,230,0.28)' }}>Strong fit · One relationship to address</p>
                    </div>
                    {TEAM_ROWS.map(({ role, pill, axisKey, pillBg, pillBorder, pillColor, note }) => {
                      // Reverse: radar axis hover highlights the relevant team row
                      const reverseHighlight = hoveredAxis === axisKey
                      return (
                        <div
                          key={role}
                          className="team-row"
                          onMouseEnter={() => setHoveredTeam(role)}
                          onMouseLeave={() => setHoveredTeam(null)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0',
                            background: reverseHighlight ? 'rgba(255,255,255,0.025)' : undefined,
                          }}
                        >
                          <span style={{
                            borderRadius: 4, padding: '2px 8px', fontSize: 9, fontWeight: 600,
                            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                            background: pillBg, border: `1px solid ${pillBorder}`, color: pillColor,
                            flexShrink: 0, minWidth: 110, textAlign: 'center' as const, display: 'inline-block',
                          }}>{pill}</span>
                          <div>
                            <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 500, color: TEXT }}>{role}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(238,236,230,0.42)', lineHeight: 1.4 }}>{note}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* S4 — Signal Profile */}
                  <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.09)', ...fade(cardMounted, 240) }}>
                    <p style={{ margin: '0 0 8px', fontSize: 9, color: FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      Signal Profile
                    </p>
                    {AXES.map((ax) => (
                      <div key={ax.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: 'rgba(238,236,230,0.24)', width: 90, flexShrink: 0 }}>
                          {ax.fullLabel}
                        </span>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                          <div style={{
                            width: `${ax.score}%`, height: '100%', borderRadius: 2,
                            background: ax.above ? 'rgba(74,142,255,0.36)' : 'rgba(200,168,50,0.45)',
                          }} />
                        </div>
                        <span style={{
                          fontSize: 9,
                          color: ax.above ? 'rgba(238,236,230,0.26)' : 'rgba(200,168,50,0.6)',
                          width: 18, textAlign: 'right' as const, flexShrink: 0,
                        }}>
                          {ax.score}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* S5 — How to De-Risk */}
                  <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.09)', ...fade(cardMounted, 300) }}>
                    <p style={{ margin: '0 0 8px', fontSize: 9, color: AMBER, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      How to De-Risk
                    </p>
                    {[
                      "Align on decision cadence with Operating Partner before day one.",
                      "Define which decisions require escalation and which don't.",
                      "Set board communication expectations in onboarding.",
                    ].map((item) => (
                      <p key={item} style={{
                        margin: '0 0 6px', fontSize: 11, color: 'rgba(238,236,230,0.62)', lineHeight: 1.5,
                        borderLeft: '1.5px solid rgba(200,168,50,0.25)', paddingLeft: 8,
                      }}>{item}</p>
                    ))}
                  </div>

                  {/* S6 — Operating Style */}
                  <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.09)', ...fade(cardMounted, 360) }}>
                    <p style={{ margin: '0 0 8px', fontSize: 9, color: FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      Operating Style
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        background: 'rgba(196,80,48,0.1)',
                        border: '1px solid rgba(196,80,48,0.22)',
                        color: '#c45030',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase' as const,
                      }}>Pioneer</span>
                      <span style={{ fontSize: 12, color: 'rgba(238,236,230,0.7)' }}>Execution-first operator</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(238,236,230,0.42)', lineHeight: 1.6 }}>
                      Moves first, drives without waiting for full alignment. High pace, lower in cross-functional coordination.
                    </p>
                  </div>

                </div>

                {/* Custom scroll indicator */}
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0, width: 2,
                  background: 'rgba(255,255,255,0.04)', borderRadius: 1,
                  opacity: scrollThumb.visible ? 1 : 0,
                  transition: 'opacity 200ms ease',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', left: 0, width: 2, borderRadius: 1,
                    background: 'rgba(255,255,255,0.18)',
                    height: scrollThumb.height,
                    top: scrollThumb.top,
                  }} />
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEAT 3 — Consequence ── */}
      <section className="snap-beat" style={{ background: '#080808' }} ref={beat4Ref}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            So you don&apos;t hear
          </p>
          <p style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.02em', fontStyle: 'italic' }}>
            &ldquo;let&apos;s see more candidates.&rdquo;
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 48, left: '10%', right: '10%', height: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'rgba(255,255,255,0.12)',
            transformOrigin: 'left',
            transform: lineDrawn ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 600ms ease-out',
          }} />
        </div>
      </section>

      {/* ── BEAT 4 — Break ── */}
      <section className="snap-beat beat-light" style={{ background: '#F5F5F0' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, color: 'rgba(0,0,0,0.22)', letterSpacing: '-0.03em', marginBottom: 14 }}>
            This isn&apos;t an assessment.
          </p>
          <p style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#000000', letterSpacing: '-0.03em' }}>
            It&apos;s how you make the call.
          </p>
        </div>
      </section>

      {/* ── BEAT 5 — Close ── */}
      <section className="snap-beat" style={{ background: '#080808', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%', maxWidth: 680,
          opacity: 0.05, filter: 'blur(4px)',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: 32 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Marcus Thompson</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Superintendent · Chicago · Gilbane Construction</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff' }}>93</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>Strong Hire</span>
            </div>
            {['EXECUTION +8','OWNERSHIP +1','ADAPTABILITY +15','COLLABORATION −3','DECISION SPEED +21'].map((d, i) => (
              <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{d}</div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div>
            <p style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 12 }}>
              You already know.
            </p>
            <p style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Now show them.
            </p>
          </div>
          <a href="/sample-report" style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#FFFFFF', color: '#000000',
            fontSize: 16, fontWeight: 700, padding: '15px 36px',
            borderRadius: 9, textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            Open sample report →
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Used in real client meetings to make the final call.</p>
        </div>
      </section>

      {/* DOT NAV */}
      <div style={{
        position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
        zIndex: 50, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
      }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: activeSection === i ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
            transition: 'all 300ms ease',
          }} />
        ))}
      </div>
    </div>
  )
}
