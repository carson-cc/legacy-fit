'use client'

import { useEffect, useState, useRef } from 'react'
import Nav from '@/app/components/Nav'

// ── Tokens ────────────────────────────────────────────────────────────────────
const GREEN     = '#3aa868'
const AMBER     = '#c8a832'
const RED       = '#e05a3a'
const BLUE      = '#4a8eff'
const TEXT      = '#eeece6'
const SUB       = 'rgba(238,236,230,0.42)'
const FAINT     = 'rgba(238,236,230,0.22)'
const DIV       = 'rgba(255,255,255,0.06)'
const CONDENSED = '"Barlow Condensed", sans-serif'

// ── Dimension data ────────────────────────────────────────────────────────────
// score = candidate, benchmark = role minimum, delta = difference
const AXES = [
  {
    key: 'execution',
    svgLabel: 'Execution',  fullLabel: 'Execution',
    score: 82, benchmark: 75, delta: +7, above: true,
    interp:   'Above benchmark by +7',
    impl:     'Drives execution without needing direction. An asset in environments with clear mandates.',
    lx: 100, ly: 16, anchor: 'middle', baseline: 'auto',
    teamLink: 'CEO',
  },
  {
    key: 'ownership',
    svgLabel: 'Ownership',  fullLabel: 'Ownership',
    score: 74, benchmark: 72, delta: +2, above: true,
    interp:   'At benchmark (+2)',
    impl:     'Takes accountability. Meets the bar — does not significantly exceed it. Monitor in high-stakes roles.',
    lx: 178, ly: 80, anchor: 'start', baseline: 'middle',
    teamLink: 'Board',
  },
  {
    key: 'adaptability',
    svgLabel: 'Adapt.',     fullLabel: 'Adaptability',
    score: 70, benchmark: 65, delta: +5, above: true,
    interp:   'Above benchmark by +5',
    impl:     'Handles shifting scope without losing execution edge. Resilient to ambiguity.',
    lx: 150, ly: 170, anchor: 'start', baseline: 'hanging',
    teamLink: null,
  },
  {
    key: 'collaboration',
    svgLabel: 'Collab.',    fullLabel: 'Collaboration',
    score: 62, benchmark: 68, delta: -6, above: false,
    interp:   'Below benchmark by −6',
    impl:     'Prefers independent execution over cross-functional coordination. The only gap — and the source of the pacing risk.',
    lx: 50,  ly: 170, anchor: 'end', baseline: 'hanging',
    teamLink: 'Board',
  },
  {
    key: 'decisionSpeed',
    svgLabel: 'Dec. Speed', fullLabel: 'Decision Speed',
    score: 88, benchmark: 78, delta: +10, above: true,
    interp:   'Significantly above benchmark (+10)',
    impl:     'Largest delta on the screen. Moves faster than most environments expect. Primary source of Operating Partner friction.',
    lx: 20,  ly: 80, anchor: 'end', baseline: 'middle',
    teamLink: 'Operating Partner',
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

const CAND_VALS      = AXES.map(a => a.score)
const BENCH_VALS     = AXES.map(a => a.benchmark)
const RING_50        = ringPts(50)
const RING_100       = ringPts(100)

// Shortlist comparison ghosts — proves "Top 1 of 3"
// Candidate B: strong collaboration but lagging speed/execution
// Candidate C: balanced but weaker across the board on pace dimensions
const SHORTLIST = [
  { label: 'Cand. B', vals: [70, 65, 60, 72, 66], color: 'rgba(255,255,255,0.12)', dash: '5 4' },
  { label: 'Cand. C', vals: [73, 68, 64, 67, 58], color: 'rgba(255,255,255,0.08)', dash: '3 4' },
]

// ── Team dynamics ─────────────────────────────────────────────────────────────
// "Pacing gap" (amber) instead of "Friction risk" (red) — contextual, not disqualifying
const TEAM = [
  {
    role: 'CEO', subtitle: 'Direct Report',
    status: 'Strong alignment', statusColor: GREEN,
    note: 'Will likely be experienced as decisive and highly effective. No material friction expected.',
    axisKey: 'execution',
  },
  {
    role: 'Operating Partner', subtitle: null,
    status: 'Pacing gap', statusColor: AMBER,
    note: 'Will likely move faster than expected. Friction is about timing, not competence — manageable with early alignment.',
    axisKey: 'decisionSpeed',
  },
  {
    role: 'Board', subtitle: null,
    status: 'Moderate fit', statusColor: FAINT,
    note: 'May expect more structured communication cadence. Low friction risk if reporting expectations are set.',
    axisKey: 'collaboration',
  },
]

// Stagger fade helper
const fade = (mounted: boolean, delay: number): React.CSSProperties => ({
  opacity:    mounted ? 1 : 0,
  transform:  mounted ? 'translateY(0)' : 'translateY(5px)',
  transition: `opacity 380ms ease ${delay}ms, transform 380ms ease ${delay}ms`,
})

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [navLight,      setNavLight]      = useState(false)
  const [lineDrawn,     setLineDrawn]     = useState(false)
  const [showWhy,       setShowWhy]       = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [cardMounted,   setCardMounted]   = useState(false)
  const [hoveredAxis,   setHoveredAxis]   = useState<string | null>(null)
  const [hoveredTeam,   setHoveredTeam]   = useState<string | null>(null)
  const [compMode,      setCompMode]      = useState<'benchmark' | 'shortlist'>('benchmark')

  const beat4Ref = useRef<HTMLDivElement>(null)
  const snapRef  = useRef<HTMLDivElement>(null)
  const reportRef= useRef<HTMLElement | null>(null)

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
    const onWheel      = (e: WheelEvent)  => { if (e.deltaY > 0) tryReveal(e) }
    const onTouchStart = (e: TouchEvent)  => { touchStartY = e.touches[0].clientY }
    const onTouchEnd   = (e: TouchEvent)  => { if (touchStartY - e.changedTouches[0].clientY > 30) tryReveal(e) }
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

  // Determine active axis highlight (team hover overrides axis hover)
  const effectiveHovAxis = hoveredTeam
    ? TEAM.find(t => t.role === hoveredTeam)?.axisKey ?? null
    : hoveredAxis

  const hovAxData = AXES.find(a => a.key === effectiveHovAxis) ?? null

  return (
    <div className="snap-page" ref={snapRef}>
      <style>{`
        .snap-page::-webkit-scrollbar { display: none }
        @media (max-width: 768px) {
          .report-card-body  { flex-direction: column !important; }
          .report-card-left  { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          .report-card-right { padding: 16px !important; }
        }
        .team-row { transition: background 150ms ease; border-radius: 6px; padding: 5px 6px; margin: 0 -6px; cursor: default; }
        .team-row:hover { background: rgba(255,255,255,0.04) !important; }
        .comp-btn { transition: background 150ms ease, border-color 150ms ease, color 150ms ease; cursor: pointer; }
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
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.8)',
          }}>

            {/* TOP BAR */}
            <div style={{
              height: 40, padding: '0 24px', flexShrink: 0,
              borderBottom: `1px solid ${DIV}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 10, color: FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Candidate Recommendation Report
              </span>
              <span style={{ fontSize: 10, color: FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
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
                    {/* Comparison toggle */}
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0, marginTop: 2 }}>
                      {(['benchmark', 'shortlist'] as const).map(mode => (
                        <button
                          key={mode}
                          className="comp-btn"
                          onClick={() => setCompMode(mode)}
                          style={{
                            fontSize: 8, padding: '3px 7px', borderRadius: 4,
                            background: compMode === mode ? 'rgba(255,255,255,0.09)' : 'transparent',
                            border: `1px solid ${compMode === mode ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                            color: compMode === mode ? TEXT : FAINT,
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                          }}
                        >
                          {mode === 'benchmark' ? 'vs. Role' : 'vs. Shortlist'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Radar */}
                <div style={{ width: '100%', aspectRatio: '1 / 1', flexShrink: 0, ...fade(cardMounted, 80) }}>
                  <svg
                    viewBox="-35 -5 260 215"
                    style={{ width: '100%', height: '100%' }}
                    onMouseLeave={() => { setHoveredAxis(null) }}
                  >
                    {/* Grid rings */}
                    <polygon points={RING_50}  fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    <polygon points={RING_100} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                    {/* Axis lines + labels + hit areas */}
                    {AXES.map((ax, i) => {
                      const tip = vertex(100, i)
                      const isHov = effectiveHovAxis === ax.key
                      return (
                        <g key={ax.key}
                          onMouseEnter={() => setHoveredAxis(ax.key)}
                          style={{ cursor: 'default' }}
                        >
                          <line x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y}
                            stroke={isHov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'}
                            strokeWidth="0.75"
                            style={{ transition: 'stroke 150ms ease' }}
                          />
                          {/* Wide invisible hit area */}
                          <line x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y}
                            stroke="transparent" strokeWidth="20" />
                          <text
                            x={ax.lx} y={ax.ly}
                            textAnchor={ax.anchor as 'middle' | 'start' | 'end'}
                            dominantBaseline={ax.baseline as 'auto' | 'middle' | 'hanging'}
                            fontSize="9"
                            fill={isHov ? 'rgba(238,236,230,0.85)' : 'rgba(238,236,230,0.32)'}
                            style={{ transition: 'fill 150ms ease' }}
                          >
                            {ax.svgLabel}
                          </text>
                        </g>
                      )
                    })}

                    {/* ─ Benchmark mode ─ */}
                    {compMode === 'benchmark' && (
                      <>
                        <polygon
                          points={polyPts(BENCH_VALS)}
                          fill="rgba(255,255,255,0.02)"
                          stroke="rgba(255,255,255,0.25)"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                        <text x="100" y="30" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.2)">Role</text>
                      </>
                    )}

                    {/* ─ Shortlist mode — ghost outlines ─ */}
                    {compMode === 'shortlist' && SHORTLIST.map((ghost, idx) => (
                      <polygon
                        key={ghost.label}
                        points={polyPts(ghost.vals)}
                        fill="none"
                        stroke={ghost.color}
                        strokeWidth="1"
                        strokeDasharray={ghost.dash}
                        style={{
                          opacity: cardMounted ? 1 : 0,
                          transition: `opacity 500ms ease ${300 + idx * 80}ms`,
                        }}
                      />
                    ))}

                    {/* Candidate polygon — animates in */}
                    <polygon
                      points={polyPts(CAND_VALS)}
                      fill="rgba(74,142,255,0.09)"
                      stroke={BLUE}
                      strokeWidth="2"
                      style={{
                        opacity: cardMounted ? 1 : 0,
                        transition: 'opacity 600ms ease 420ms',
                      }}
                    />

                    {/* Vertex dots */}
                    {AXES.map((ax, i) => {
                      const p = vertex(ax.score, i)
                      const isHov = effectiveHovAxis === ax.key
                      return (
                        <circle key={ax.key} cx={p.x} cy={p.y}
                          r={isHov ? 4.5 : 3}
                          fill={isHov ? '#fff' : BLUE}
                          style={{
                            opacity: cardMounted ? 1 : 0,
                            transition: `opacity 600ms ease 420ms, r 150ms ease, fill 150ms ease`,
                          }}
                        />
                      )
                    })}
                  </svg>
                </div>

                {/* Callout / axis detail / comparison note */}
                <div style={{ ...fade(cardMounted, 380), minHeight: 56 }}>
                  {hovAxData ? (
                    // Axis hover detail
                    <div style={{ borderLeft: `2px solid ${hovAxData.above ? BLUE : AMBER}`, paddingLeft: 10 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: TEXT }}>{hovAxData.fullLabel}</p>
                      <p style={{ margin: '0 0 3px', fontSize: 9, fontWeight: 600, color: hovAxData.above ? BLUE : AMBER }}>{hovAxData.interp}</p>
                      <p style={{ margin: 0, fontSize: 9, color: SUB, lineHeight: 1.45 }}>{hovAxData.impl}</p>
                    </div>
                  ) : compMode === 'shortlist' ? (
                    // Shortlist comparison note
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
                          <span style={{ fontSize: 9, color: pos ? 'rgba(74,142,255,0.7)' : AMBER, flexShrink: 0 }}>
                            {text.slice(0, 1)}
                          </span>
                          <span style={{ fontSize: 9, color: FAINT, lineHeight: 1.4 }}>{text.slice(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Default benchmark callouts
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { label: 'Decision Speed', delta: +10, above: true },
                        { label: 'Execution',      delta: +7,  above: true },
                        { label: 'Collaboration',  delta: -6,  above: false },
                      ].map(({ label, delta, above }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9, color: above ? 'rgba(74,142,255,0.7)' : AMBER, flexShrink: 0 }}>
                            {above ? '↑' : '↓'}
                          </span>
                          <span style={{ fontSize: 9, color: FAINT }}>
                            {label} — {above ? `+${delta}` : `${delta}`} vs. benchmark
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operating Style */}
                <div style={fade(cardMounted, 460)}>
                  <p style={{ fontSize: 8, color: 'rgba(238,236,230,0.16)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                    Operating Style
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(238,236,230,0.58)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                    Pioneer — Execution-first operator
                  </p>
                  <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.34)', lineHeight: 1.55, margin: 0 }}>
                    Moves first, drives without waiting for full alignment. High in pace, lower in cross-functional coordination.
                  </p>
                </div>

              </div>

              {/* ── RIGHT: Decision panel ── */}
              <div className="report-card-right" style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '18px 22px', overflow: 'hidden',
              }}>

                {/* 1 — VERDICT (green-dominant, score muted) */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 0) }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <p style={{
                          margin: 0,
                          fontSize: 13, fontWeight: 800, fontFamily: CONDENSED,
                          color: GREEN, letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>Strong Hire</p>
                        <span style={{
                          fontSize: 8, padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(58,168,104,0.1)', border: '1px solid rgba(58,168,104,0.2)',
                          color: 'rgba(58,168,104,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>Risk: Manageable</span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: TEXT, lineHeight: 1.3 }}>
                        Strong operator — thrives in low-friction, high-autonomy environments
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(238,236,230,0.30)' }}>
                        Top 1 of 3 shortlisted · 4 of 5 dimensions above benchmark
                      </p>
                    </div>
                    <span style={{
                      fontSize: 52, fontFamily: CONDENSED, fontWeight: 900,
                      color: 'rgba(238,236,230,0.18)', lineHeight: 1, flexShrink: 0,
                    }}>93</span>
                  </div>
                </div>

                {/* 2 — PRIMARY WATCHOUT (amber, not red — contextual, not disqualifying) */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 80) }}>
                  <p style={{ margin: '0 0 5px', fontSize: 8, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Primary Watchout
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
                    Moves faster than the organization can absorb
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: AMBER, lineHeight: 1.45, fontWeight: 300 }}>
                    Likely pacing friction with Operating Partner — manageable with early alignment on decision cadence
                  </p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(238,236,230,0.25)', letterSpacing: '0.04em' }}>
                    Contextual risk · Affects one relationship · Not a hiring veto
                  </p>
                </div>

                {/* 3 — THRIVES IN / WATCH FOR (renamed from Works/Breaks) */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 150) }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ borderLeft: '1.5px solid rgba(58,168,104,0.25)', paddingLeft: 9 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 8, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Thrives In
                      </p>
                      {[
                        'CEO grants autonomous execution without full consensus',
                        'Ownership is clear, stakeholder drag is low',
                      ].map(t => (
                        <p key={t} style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(238,236,230,0.55)', lineHeight: 1.45 }}>{t}</p>
                      ))}
                    </div>
                    <div style={{ borderLeft: '1.5px solid rgba(200,168,50,0.25)', paddingLeft: 9 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 8, color: AMBER, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Watch For
                      </p>
                      {[
                        'Operating Partner expects closer coordination on pacing',
                        'Decisions require partner-wide alignment before action',
                      ].map(t => (
                        <p key={t} style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(238,236,230,0.55)', lineHeight: 1.45 }}>{t}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4 — TEAM DYNAMICS (hover links to radar) */}
                <div style={{ flexShrink: 0, paddingBottom: 10, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 220) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 8, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Team Dynamics
                    </p>
                    <p style={{ margin: 0, fontSize: 9, color: 'rgba(238,236,230,0.28)', fontStyle: 'italic' }}>
                      Strong fit · One relationship needs early alignment
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {TEAM.map(({ role, status, statusColor, note }, i) => (
                      <div
                        key={role}
                        className="team-row"
                        onMouseEnter={() => setHoveredTeam(role)}
                        onMouseLeave={() => setHoveredTeam(null)}
                        style={{
                          paddingTop: i > 0 ? 7 : 0,
                          borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          marginTop: i > 0 ? 2 : 0,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(238,236,230,0.68)' }}>{role}</span>
                          <span style={{
                            fontSize: 8, fontWeight: 600, color: statusColor,
                            letterSpacing: '0.05em', textTransform: 'uppercase',
                            transition: 'color 150ms ease',
                          }}>{status}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 9, color: 'rgba(238,236,230,0.33)', lineHeight: 1.45 }}>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 — SIGNAL PROFILE (evidence, compressed) */}
                <div style={{ flex: 1, overflow: 'hidden', paddingTop: 8, ...fade(cardMounted, 300) }}>
                  <p style={{ margin: '0 0 6px', fontSize: 8, color: 'rgba(238,236,230,0.16)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Signal Profile
                  </p>
                  {AXES.map((ax) => (
                    <div key={ax.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 8, color: 'rgba(238,236,230,0.24)', width: 68, flexShrink: 0 }}>
                        {ax.svgLabel}
                      </span>
                      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{
                          width: `${ax.score}%`, height: '100%', borderRadius: 2,
                          background: ax.above ? 'rgba(74,142,255,0.36)' : 'rgba(200,168,50,0.45)',
                          transition: 'background 200ms ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: 8,
                        color: ax.above ? 'rgba(238,236,230,0.26)' : 'rgba(200,168,50,0.6)',
                        width: 18, textAlign: 'right', flexShrink: 0,
                      }}>
                        {ax.score}
                      </span>
                    </div>
                  ))}
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
