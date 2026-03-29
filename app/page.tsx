'use client'

import { useEffect, useState, useRef } from 'react'
import Nav from '@/app/components/Nav'

const GREEN     = '#3aa868'
const RED       = '#e05a3a'
const BLUE      = '#4a8eff'
const TEXT      = '#eeece6'
const SUB       = 'rgba(238,236,230,0.42)'
const FAINT     = 'rgba(238,236,230,0.22)'
const DIV       = 'rgba(255,255,255,0.06)'
const CONDENSED = '"Barlow Condensed", sans-serif'

// ── Axis data with benchmark deltas and hover interpretations ────────────────
const AXES = [
  {
    key: 'execution',    svgLabel: 'Execution',  score: 82, benchmark: 75, delta: +7,
    above: true,
    interp: 'Above benchmark',
    impl:   'Drives forward without hesitation — pushes execution pace in any environment',
    // SVG label position
    lx: 100, ly: 16, anchor: 'middle', baseline: 'auto',
  },
  {
    key: 'ownership',    svgLabel: 'Ownership',  score: 74, benchmark: 72, delta: +2,
    above: true,
    interp: 'Slightly above benchmark',
    impl:   'Takes accountability — meets the bar but does not significantly exceed it',
    lx: 178, ly: 80, anchor: 'start', baseline: 'middle',
  },
  {
    key: 'adaptability', svgLabel: 'Adapt.',     score: 70, benchmark: 65, delta: +5,
    above: true,
    interp: 'Above benchmark',
    impl:   'Handles shifting scope and ambiguity without losing execution edge',
    lx: 150, ly: 170, anchor: 'start', baseline: 'hanging',
  },
  {
    key: 'collaboration',svgLabel: 'Collab.',    score: 62, benchmark: 68, delta: -6,
    above: false,
    interp: 'Below benchmark',
    impl:   'Prefers independent execution — friction point in high-coordination environments',
    lx: 50,  ly: 170, anchor: 'end', baseline: 'hanging',
  },
  {
    key: 'decisionSpeed',svgLabel: 'Dec. Speed', score: 88, benchmark: 78, delta: +10,
    above: true,
    interp: 'Significantly above benchmark',
    impl:   'Largest delta — moves faster than most environments can absorb',
    lx: 20,  ly: 80, anchor: 'end', baseline: 'middle',
  },
]

// Pentagon geometry helpers
const CENTER = 100, MAX_R = 72
const angle  = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i) / 5
const vertex = (val: number, i: number) => ({
  x: CENTER + Math.cos(angle(i)) * MAX_R * (val / 100),
  y: CENTER + Math.sin(angle(i)) * MAX_R * (val / 100),
})
const polyPts = (vals: number[]) =>
  vals.map((v, i) => { const p = vertex(v, i); return `${p.x},${p.y}` }).join(' ')

const CANDIDATE_VALS  = AXES.map(a => a.score)
const BENCHMARK_VALS  = AXES.map(a => a.benchmark)
const RING_50         = AXES.map((_, i) => { const p = vertex(50, i); return `${p.x},${p.y}` }).join(' ')
const RING_100        = AXES.map((_, i) => { const p = vertex(100, i); return `${p.x},${p.y}` }).join(' ')

// Stagger helper
const fade = (mounted: boolean, delay: number): React.CSSProperties => ({
  opacity:    mounted ? 1 : 0,
  transform:  mounted ? 'translateY(0)' : 'translateY(5px)',
  transition: `opacity 380ms ease ${delay}ms, transform 380ms ease ${delay}ms`,
})

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [navLight,     setNavLight]     = useState(false)
  const [lineDrawn,    setLineDrawn]    = useState(false)
  const [showWhy,      setShowWhy]      = useState(false)
  const [activeSection,setActiveSection]= useState(0)
  const [cardMounted,  setCardMounted]  = useState(false)
  const [hoveredAxis,  setHoveredAxis]  = useState<string | null>(null)

  const beat4Ref = useRef<HTMLDivElement>(null)
  const snapRef  = useRef<HTMLDivElement>(null)
  const reportRef= useRef<HTMLElement | null>(null)

  // Nav light mode
  useEffect(() => {
    const els = document.querySelectorAll('.beat-light')
    const obs = new IntersectionObserver(
      (entries) => { setNavLight(entries.some(e => e.isIntersecting)) },
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Beat 4 line draw
  useEffect(() => {
    const el = beat4Ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLineDrawn(true); obs.disconnect() } },
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Scroll-to-reveal on beat 1
  useEffect(() => {
    const container = snapRef.current
    if (!container) return
    const handled = { current: false }
    const scrollingAway = { current: false }
    let touchStartY = 0
    const tryReveal = (e: Event) => {
      if (container.scrollTop > 10 || handled.current) return
      handled.current = true
      scrollingAway.current = true
      e.preventDefault()
      setShowWhy(true)
      setTimeout(() => { reportRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 900)
    }
    const onWheel      = (e: WheelEvent)  => { if (e.deltaY > 0) tryReveal(e) }
    const onTouchStart = (e: TouchEvent)  => { touchStartY = e.touches[0].clientY }
    const onTouchEnd   = (e: TouchEvent)  => { if (touchStartY - e.changedTouches[0].clientY > 30) tryReveal(e) }
    const onScroll     = () => {
      if (scrollingAway.current) { if (container.scrollTop > 50) scrollingAway.current = false; return }
      if (container.scrollTop < 10) { handled.current = false; setShowWhy(false) }
    }
    container.addEventListener('wheel',      onWheel,      { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend',   onTouchEnd,   { passive: false })
    container.addEventListener('scroll',     onScroll,     { passive: true })
    return () => {
      container.removeEventListener('wheel',      onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend',   onTouchEnd)
      container.removeEventListener('scroll',     onScroll)
    }
  }, [])

  // Active section tracker
  useEffect(() => {
    const container = snapRef.current
    if (!container) return
    const sections = Array.from(container.querySelectorAll('section'))
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(sections.indexOf(entry.target as HTMLElement))
        })
      },
      { threshold: 0.5, root: container }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  // Card mount animation trigger
  useEffect(() => {
    const t = setTimeout(() => setCardMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const hovAxis = AXES.find(a => a.key === hoveredAxis) ?? null

  return (
    <div className="snap-page" ref={snapRef}>
      <style>{`
        .snap-page::-webkit-scrollbar { display: none }
        @media (max-width: 768px) {
          .report-card-body  { flex-direction: column !important; }
          .report-card-left  { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          .report-card-right { padding: 16px !important; }
        }
        .team-row { transition: background 150ms ease; border-radius: 6px; padding: 5px 6px; margin: -5px -6px; }
        .team-row:hover { background: rgba(255,255,255,0.03); }
        .works-card { transition: border-color 150ms ease; }
        .works-card:hover { border-color: rgba(255,255,255,0.1) !important; }
      `}</style>

      <Nav light={navLight} />

      {/* ── BEAT 1 — Recognition ─────────────────────────────────────── */}
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

      {/* ── BEAT 2 — The Object ──────────────────────────────────────── */}
      <section
        ref={reportRef}
        className="snap-beat"
        style={{ background: '#080808', position: 'relative', overflow: 'hidden', padding: 0 }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '130%', paddingBottom: '130%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

          {/* CARD */}
          <div style={{
            width: '100%',
            maxWidth: 'min(1060px, calc(100vw - clamp(40px, 8vw, 160px)))',
            height: 'calc(100svh - 58px)',
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
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

              {/* ── LEFT COLUMN ── */}
              <div className="report-card-left" style={{
                width: '40%', flexShrink: 0,
                borderRight: `1px solid ${DIV}`,
                padding: '18px 20px',
                display: 'flex', flexDirection: 'column', gap: 0,
                justifyContent: 'space-between',
              }}>

                {/* Identity */}
                <div style={fade(cardMounted, 0)}>
                  <p style={{ fontSize: 9, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                    PE-Backed CFO · Velocity Growth Partners
                  </p>
                  <p style={{ fontSize: 20, fontFamily: CONDENSED, fontWeight: 800, color: TEXT }}>
                    Kent Morrison
                  </p>
                </div>

                {/* Radar */}
                <div style={{ width: '100%', aspectRatio: '1 / 1', flexShrink: 0, ...fade(cardMounted, 80) }}>
                  <svg
                    viewBox="-35 -5 260 215"
                    style={{ width: '100%', height: '100%' }}
                    onMouseLeave={() => setHoveredAxis(null)}
                  >
                    {/* Rings */}
                    <polygon points={RING_50}  fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    <polygon points={RING_100} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                    {/* Axis lines (with wide invisible hit area) */}
                    {AXES.map((ax, i) => {
                      const tip = vertex(100, i)
                      const isHov = hoveredAxis === ax.key
                      return (
                        <g key={ax.key}
                          onMouseEnter={() => setHoveredAxis(ax.key)}
                          style={{ cursor: 'default' }}>
                          {/* Visible line */}
                          <line
                            x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y}
                            stroke={isHov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                            strokeWidth="0.75"
                            style={{ transition: 'stroke 150ms ease' }}
                          />
                          {/* Invisible wide hit area */}
                          <line x1={CENTER} y1={CENTER} x2={tip.x} y2={tip.y}
                            stroke="transparent" strokeWidth="18" />
                          {/* Label */}
                          <text
                            x={ax.lx} y={ax.ly}
                            textAnchor={ax.anchor as 'middle' | 'start' | 'end'}
                            dominantBaseline={ax.baseline as 'auto' | 'middle' | 'hanging'}
                            fontSize="9"
                            fill={isHov ? 'rgba(238,236,230,0.8)' : 'rgba(238,236,230,0.35)'}
                            style={{ transition: 'fill 150ms ease' }}
                          >
                            {ax.svgLabel}
                          </text>
                        </g>
                      )
                    })}

                    {/* Benchmark polygon */}
                    <polygon
                      points={polyPts(BENCHMARK_VALS)}
                      fill="rgba(255,255,255,0.02)"
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <text x="100" y="30" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)">Role</text>

                    {/* Candidate polygon — animates in */}
                    <polygon
                      points={polyPts(CANDIDATE_VALS)}
                      fill={`rgba(74,142,255,0.09)`}
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
                      const isHov = hoveredAxis === ax.key
                      return (
                        <circle
                          key={ax.key} cx={p.x} cy={p.y} r={isHov ? 4.5 : 3}
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

                {/* Gap callouts or axis detail */}
                <div style={{ ...fade(cardMounted, 380), minHeight: 52 }}>
                  {hovAxis ? (
                    <div style={{ borderLeft: `2px solid ${hovAxis.above ? BLUE : RED}`, paddingLeft: 10 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: TEXT }}>{hovAxis.svgLabel === 'Adapt.' ? 'Adaptability' : hovAxis.svgLabel === 'Collab.' ? 'Collaboration' : hovAxis.svgLabel === 'Dec. Speed' ? 'Decision Speed' : hovAxis.svgLabel}</p>
                      <p style={{ margin: '0 0 3px', fontSize: 9, fontWeight: 600, color: hovAxis.above ? BLUE : RED }}>{hovAxis.interp}</p>
                      <p style={{ margin: 0, fontSize: 9, color: SUB, lineHeight: 1.45 }}>{hovAxis.impl}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { label: 'Decision Speed', delta: +10, above: true },
                        { label: 'Execution', delta: +7, above: true },
                        { label: 'Collaboration', delta: -6, above: false },
                      ].map(({ label, delta, above }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9, color: above ? 'rgba(74,142,255,0.7)' : RED, flexShrink: 0 }}>
                            {above ? '↑' : '↓'}
                          </span>
                          <span style={{ fontSize: 9, color: FAINT }}>
                            {label} — {above ? `+${delta} vs benchmark` : `${delta} vs benchmark`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operating Style */}
                <div style={fade(cardMounted, 460)}>
                  <p style={{ fontSize: 8, color: 'rgba(238,236,230,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                    Operating Style
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(238,236,230,0.6)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                    Pioneer — Execution-first operator
                  </p>
                  <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.36)', lineHeight: 1.55, margin: 0 }}>
                    Moves first, decides fast, drives without waiting for full alignment. Trades collaboration for speed under pressure.
                  </p>
                </div>

              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="report-card-right" style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '18px 22px', overflow: 'hidden',
              }}>

                {/* 1. VERDICT */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 0) }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{
                        margin: '0 0 5px',
                        fontSize: 13, fontWeight: 800, fontFamily: CONDENSED,
                        color: GREEN, letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}>
                        Strong Hire
                      </p>
                      <p style={{ margin: '0 0 5px', fontSize: 14, fontWeight: 500, color: TEXT, lineHeight: 1.3 }}>
                        Outpaces organization — requires low-friction environment
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(238,236,230,0.32)' }}>
                        Top 1 of 3 candidates · 4 of 5 dimensions above benchmark
                      </p>
                    </div>
                    <span style={{
                      fontSize: 52, fontFamily: CONDENSED, fontWeight: 900,
                      color: 'rgba(238,236,230,0.20)', lineHeight: 1, flexShrink: 0,
                    }}>93</span>
                  </div>
                </div>

                {/* 2. CORE RISK */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 80) }}>
                  <p style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
                    Moves faster than the organization can absorb
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: RED, lineHeight: 1.45, fontWeight: 300 }}>
                    Will create friction with the Operating Partner on pacing and alignment
                  </p>
                </div>

                {/* 3. EXECUTION TENSION */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 150) }}>
                  <p style={{ margin: '0 0 5px', fontSize: 8, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Execution Tension
                  </p>
                  <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 600, color: TEXT }}>
                    Outpacing organization
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: SUB, lineHeight: 1.5 }}>
                    Prefers speed and autonomy over alignment and coordination
                  </p>
                </div>

                {/* 4. WORKS / BREAKS */}
                <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 220) }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="works-card" style={{ borderLeft: '1.5px solid rgba(58,168,104,0.25)', paddingLeft: 9 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 8, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Works when
                      </p>
                      {[
                        'CEO allows independent execution without full consensus',
                        'Ownership is clear, stakeholder drag is low',
                      ].map(t => (
                        <p key={t} style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(238,236,230,0.55)', lineHeight: 1.45 }}>{t}</p>
                      ))}
                    </div>
                    <div className="works-card" style={{ borderLeft: '1.5px solid rgba(224,90,58,0.25)', paddingLeft: 9 }}>
                      <p style={{ margin: '0 0 6px', fontSize: 8, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Breaks when
                      </p>
                      {[
                        'Operating Partner expects close coordination on pacing',
                        'Decisions require partner-wide alignment before action',
                      ].map(t => (
                        <p key={t} style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(238,236,230,0.55)', lineHeight: 1.45 }}>{t}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. TEAM DYNAMICS */}
                <div style={{ flexShrink: 0, paddingBottom: 10, borderBottom: `1px solid ${DIV}`, ...fade(cardMounted, 290) }}>
                  <p style={{ margin: '0 0 8px', fontSize: 8, color: FAINT, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Team Dynamics
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {([
                      {
                        role: 'CEO', subtitle: 'Direct Report',
                        status: 'Strong alignment', statusColor: GREEN,
                        note: 'Will likely be experienced as decisive and highly effective',
                      },
                      {
                        role: 'Operating Partner', subtitle: null,
                        status: 'Friction risk', statusColor: RED,
                        note: 'Will likely move faster than expected and create pacing tension',
                      },
                      {
                        role: 'Board', subtitle: null,
                        status: 'Moderate alignment', statusColor: FAINT,
                        note: 'May be seen as less structured than the environment prefers',
                      },
                    ] as Array<{ role: string; subtitle: string | null; status: string; statusColor: string; note: string }>).map(({ role, status, statusColor, note }, i) => (
                      <div key={role} className="team-row" style={{
                        paddingTop: i > 0 ? 7 : 0,
                        borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        marginTop: i > 0 ? 0 : 0,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(238,236,230,0.68)' }}>{role}</span>
                          <span style={{ fontSize: 8, fontWeight: 600, color: statusColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{status}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 9, color: 'rgba(238,236,230,0.33)', lineHeight: 1.45 }}>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. SIGNAL PROFILE */}
                <div style={{ flex: 1, overflow: 'hidden', paddingTop: 8, ...fade(cardMounted, 360) }}>
                  <p style={{ margin: '0 0 6px', fontSize: 8, color: 'rgba(238,236,230,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Signal Profile
                  </p>
                  {AXES.map((ax) => (
                    <div key={ax.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 8, color: 'rgba(238,236,230,0.25)', width: 68, flexShrink: 0, letterSpacing: '0.03em' }}>
                        {ax.svgLabel}
                      </span>
                      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{
                          width: `${ax.score}%`, height: '100%', borderRadius: 2,
                          background: ax.above ? 'rgba(74,142,255,0.38)' : 'rgba(224,90,58,0.5)',
                        }} />
                      </div>
                      <span style={{ fontSize: 8, color: ax.above ? 'rgba(238,236,230,0.28)' : 'rgba(224,90,58,0.65)', width: 18, textAlign: 'right', flexShrink: 0 }}>
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

      {/* ── BEAT 3 — Consequence ─────────────────────────────────────── */}
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

      {/* ── BEAT 4 — Break ──────────────────────────────────────────── */}
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

      {/* ── BEAT 5 — Close ──────────────────────────────────────────── */}
      <section className="snap-beat" style={{ background: '#080808', position: 'relative', overflow: 'hidden' }}>
        {/* Ghost report */}
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
            borderRadius: 9, textDecoration: 'none', letterSpacing: '-0.01em', maxWidth: 320,
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
