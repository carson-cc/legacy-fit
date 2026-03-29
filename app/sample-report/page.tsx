'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

// ── Brand tokens (homepage system) ───────────────────────────────────────
const BG      = '#080808'
const SURFACE = '#0f0f0f'
const DIV     = 'rgba(255,255,255,0.07)'
const TEXT    = '#eeece6'
const SUB     = 'rgba(238,236,230,0.42)'
const FAINT   = 'rgba(238,236,230,0.18)'
const BLUE    = '#2563EB'
const GREEN   = '#3aa868'
const AMBER   = '#c8a832'
const RED     = '#e05a3a'
const FONT    = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif'
const CONDENSED = '"Barlow Condensed", system-ui'

const surf: React.CSSProperties = {
  background: SURFACE, border: `1px solid ${DIV}`, borderRadius: 12, padding: 32,
}

// ── Candidate + benchmark data ────────────────────────────────────────────
const DIMENSIONS = [
  { key: 'execution',     label: 'Execution',      score: 72, target: 64, delta: +8  },
  { key: 'ownership',     label: 'Ownership',      score: 67, target: 66, delta: +1  },
  { key: 'adaptability',  label: 'Adaptability',   score: 65, target: 50, delta: +15 },
  { key: 'collaboration', label: 'Collaboration',  score: 49, target: 52, delta: -3  },
  { key: 'decisionSpeed', label: 'Decision Speed', score: 85, target: 64, delta: +21 },
]

type DimKey = 'execution' | 'ownership' | 'adaptability' | 'collaboration' | 'decisionSpeed'
type FitScores = Record<DimKey, number>

const CANDIDATE: FitScores = { execution: 72, ownership: 67, adaptability: 65, collaboration: 49, decisionSpeed: 85 }
const BENCHMARK: FitScores = { execution: 64, ownership: 66, adaptability: 50, collaboration: 52, decisionSpeed: 64 }

// Derive Primary Tension from data — lowest delta vs. highest delta
const tensionDim  = [...DIMENSIONS].sort((a, b) => a.delta - b.delta)[0]   // Collaboration −3
const strengthDim = [...DIMENSIONS].sort((a, b) => b.delta - a.delta)[0]   // Decision Speed +21

const TEAM = [
  {
    name: 'David Mercer', role: 'Hiring Manager',
    scores: { execution: 44, ownership: 56, adaptability: 60, collaboration: 72, decisionSpeed: 54 } as FitScores,
    compat: 74, statusColor: AMBER,
    note: 'Aligned on pace. Escalation expectations differ — address before Marcus starts.',
  },
  {
    name: 'Sarah Chen', role: 'Project Manager',
    scores: { execution: 55, ownership: 60, adaptability: 65, collaboration: 78, decisionSpeed: 48 } as FitScores,
    compat: 61, statusColor: RED,
    note: 'Collaboration gap is the friction point. Agree on decision authority before their work overlaps.',
  },
  {
    name: 'James Okafor', role: 'Site Supervisor',
    scores: { execution: 70, ownership: 73, adaptability: 55, collaboration: 58, decisionSpeed: 71 } as FitScores,
    compat: 88, statusColor: GREEN,
    note: 'Strongest alignment on this team. Shared execution and ownership profile.',
  },
]

const INTERVIEW_PROBES = [
  'Tell me about a time you had to take charge of a situation before anyone asked you to. What made you step forward?',
  'Walk me through a high-stakes decision you made with incomplete information. What was the pressure, and how did you move?',
  'Describe a time you drove a stalled project forward when the team had lost momentum. What did you do first?',
]

// ── Label ─────────────────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 11, lineHeight: '16px', letterSpacing: '0.08em',
      textTransform: 'uppercase', color: FAINT, fontWeight: 600, margin: 0,
    }}>{text}</p>
  )
}

// ── Section divider ───────────────────────────────────────────────────────
function LayerDivider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '48px 0' }} />
}

// ── Animated score ring ───────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)
  const size = 120, r = size / 2 - 6, circ = 2 * Math.PI * r
  useEffect(() => {
    const t0 = performance.now(), dur = 700
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setDisplayed(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color + '26'} strokeWidth={12}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 60ms ease-out' }}
      />
      <text x={size/2} y={size/2 + 2} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={38} fontWeight={900} fontFamily={CONDENSED}>{displayed}</text>
    </svg>
  )
}

// ── Pentagon radar (with scroll animation) ────────────────────────────────
const RADAR_DIMS: { key: DimKey; label: string }[] = [
  { key: 'execution',     label: 'Execution' },
  { key: 'ownership',     label: 'Ownership' },
  { key: 'adaptability',  label: 'Adaptability' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'decisionSpeed', label: 'Decision Speed' },
]

function PentagonRadar({
  candidate, benchmark, overlays = [], animated = false, size: svgSize = 300,
}: {
  candidate: FitScores
  benchmark: FitScores | null
  overlays?: { scores: FitScores; color: string; dash?: string }[]
  animated?: boolean
  size?: number
}) {
  const [progress, setProgress] = useState(animated ? 0 : 1)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!animated) return
    const el = svgRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const t0 = performance.now(), dur = 800
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1)
        setProgress(1 - Math.pow(1 - p, 3))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      obs.disconnect()
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [animated])

  const center = svgSize / 2, radius = svgSize * 0.33
  const rings = [0.25, 0.5, 0.75, 1]

  const pt = (val: number, i: number, prog = progress) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / RADAR_DIMS.length
    const rv = radius * (val / 100) * prog
    return { x: center + Math.cos(a) * rv, y: center + Math.sin(a) * rv }
  }
  const labelPt = (i: number) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / RADAR_DIMS.length
    const rv = radius * 1.28
    return { x: center + Math.cos(a) * rv, y: center + Math.sin(a) * rv }
  }
  const poly = (s: FitScores, prog = progress) =>
    RADAR_DIMS.map((d, i) => pt(s[d.key], i, prog)).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  const ringPts = (f: number) =>
    RADAR_DIMS.map((_, i) => {
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / RADAR_DIMS.length
      return `${center + Math.cos(a) * radius * f},${center + Math.sin(a) * radius * f}`
    }).join(' ')

  return (
    <svg ref={svgRef} width="100%" style={{ maxWidth: svgSize }} viewBox={`0 0 ${svgSize} ${svgSize}`} aria-label="Fit model radar">
      <defs>
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {rings.map(f => <polygon key={f} points={ringPts(f)} fill="none" stroke={DIV} strokeWidth="1"/>)}
      {RADAR_DIMS.map((d, i) => {
        const end = { x: center + Math.cos(-Math.PI / 2 + (Math.PI * 2 * i) / RADAR_DIMS.length) * radius, y: center + Math.sin(-Math.PI / 2 + (Math.PI * 2 * i) / RADAR_DIMS.length) * radius }
        const lp = labelPt(i)
        return (
          <g key={d.key}>
            <line x1={center} y1={center} x2={end.x} y2={end.y} stroke={DIV} strokeWidth="1"/>
            <text x={lp.x} y={lp.y} fill={SUB} fontSize="11" fontWeight="500" fontFamily={FONT}
              textAnchor={lp.x < center - 15 ? 'end' : lp.x > center + 15 ? 'start' : 'middle'}
              dominantBaseline={lp.y < center - 15 ? 'alphabetic' : lp.y > center + 15 ? 'hanging' : 'middle'}>
              {d.label}
            </text>
          </g>
        )
      })}
      {benchmark && (
        <path d={poly(benchmark, 1)} fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="5 4"/>
      )}
      {overlays.map((ov, idx) => (
        <path key={idx} d={poly(ov.scores, 1)} fill="none"
          stroke={ov.color} strokeWidth="1.5" strokeDasharray={ov.dash ?? '4 3'} opacity={0.5}/>
      ))}
      <path d={poly(candidate)} fill="rgba(37,99,235,0.12)" stroke={BLUE} strokeWidth="2" filter="url(#radar-glow)"/>
      {RADAR_DIMS.map((d, i) => {
        const p = pt(candidate[d.key], i)
        return <circle key={d.key} cx={p.x} cy={p.y} r="3.5" fill={BLUE}/>
      })}
    </svg>
  )
}

// ── Dimension bar ─────────────────────────────────────────────────────────
function DimBar({ label, score, target, delta, isTension }: {
  label: string; score: number; target: number; delta: number; isTension: boolean
}) {
  const dc = isTension ? AMBER : delta > 0 ? GREEN : delta < 0 ? RED : SUB
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontSize: isTension ? 15 : 14, fontWeight: isTension ? 700 : 600, color: TEXT, letterSpacing: isTension ? '-0.01em' : 'normal' }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{score}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: dc, minWidth: 34 }}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${score}%`, borderRadius: 2,
          background: isTension ? AMBER : BLUE, opacity: 0.75,
        }}/>
        <div style={{
          position: 'absolute', top: -4, width: 2, height: 12,
          left: `${target}%`, background: 'rgba(255,255,255,0.35)', borderRadius: 1,
        }}/>
      </div>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Benchmark {target}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function SampleReportPage() {
  return (
    <>
      <style>{`
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-nav, .sr-demo-banner, .sr-cta { display: none !important; }
          .report-root { background: #fff !important; color: #111 !important; }
        }
        @media (max-width: 900px) {
          .rpt-hero-grid  { grid-template-columns: 1fr !important; }
          .rpt-two-col    { grid-template-columns: 1fr !important; }
          .rpt-three-col  { grid-template-columns: 1fr !important; }
          .rpt-proof-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .rpt-nav-subtitle { display: none !important; }
          .rpt-hero-grid > div:last-child { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 24px !important; }
          .rpt-proof-grid > div:last-child { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 24px !important; }
        }
      `}</style>

      {/* ── Demo banner ── */}
      <div className="sr-demo-banner" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(37,99,235,0.12)', borderBottom: '1px solid rgba(37,99,235,0.25)',
        padding: '9px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, backdropFilter: 'blur(12px)',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: BLUE }}>Sample report</span>
          {' — '}this is what your client sees. Every candidate you assess gets one.
        </p>
        <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
          flexShrink: 0, height: 30, padding: '0 16px', borderRadius: 8,
          background: BLUE, color: '#FFF', fontSize: 12, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>Request a walkthrough</a>
      </div>

      {/* ── Sticky report nav ── */}
      <nav className="report-nav" style={{
        position: 'sticky', top: 42, zIndex: 40, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'rgba(8,8,8,0.95)', borderBottom: `1px solid ${DIV}`,
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ fontSize: 14, color: TEXT, fontWeight: 700, textDecoration: 'none' }}>Veltro</Link>
        <div className="rpt-nav-subtitle" style={{ fontSize: 12, color: SUB }}>Candidate Recommendation Report</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              if (navigator.clipboard) navigator.clipboard.writeText(window.location.href)
            }}
            style={{
              height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${DIV}`,
              background: 'transparent', color: SUB, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >Copy link</button>
          <button
            onClick={() => window.print()}
            style={{
              height: 32, padding: '0 14px', borderRadius: 8, border: `1px solid ${DIV}`,
              background: 'transparent', color: SUB, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >Print</button>
        </div>
      </nav>

      <main className="report-root" style={{
        minHeight: '100svh', background: BG, color: TEXT, fontFamily: FONT,
      }}>
        <div style={{ maxWidth: 'min(960px, calc(100vw - clamp(40px, 8vw, 160px)))', margin: '0 auto', padding: 'clamp(40px, 6vh, 64px) clamp(16px, 4vw, 24px) clamp(60px, 8vh, 96px)' }}>

          {/* ── Report header ── */}
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: FAINT, fontWeight: 600 }}>
              Candidate Recommendation Report
            </p>
            <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.03em', fontWeight: 700, color: TEXT }}>
              Marcus Thompson
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: SUB }}>
              Superintendent · Gilbane Construction · Mar 14, 2026
            </p>
          </header>

          {/* ══════════════════════════════════════════════
              LAYER 1 — THE CALL
          ══════════════════════════════════════════════ */}
          <section style={{ ...surf, marginBottom: 0 }}>

            {/* 1A — Score + Verdict */}
            <div className="rpt-hero-grid" style={{
              display: 'grid', gridTemplateColumns: '140px minmax(0,1fr)', gap: 40, alignItems: 'start',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                <Label text="Fit Score" />
                <ScoreRing score={93} color={GREEN} />
                <div>
                  <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: GREEN, lineHeight: 1.1, fontFamily: CONDENSED, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Strong Hire</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Decision confidence: High</p>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${DIV}`,
                  borderRadius: 6, padding: '4px 10px',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>Pioneer</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>archetype</span>
                </div>
              </div>

              <div style={{ borderLeft: `1px solid ${DIV}`, paddingLeft: 'clamp(20px, 4vw, 40px)', display: 'grid', gap: 28 }}>

                {/* 1B — Primary Tension */}
                <div style={{
                  borderLeft: `3px solid ${AMBER}`, paddingLeft: 16,
                  background: 'rgba(234,179,8,0.04)', borderRadius: '0 8px 8px 0', padding: '14px 16px',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: 'rgba(234,179,8,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Primary Tension
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                    {strengthDim.label} vs. {tensionDim.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                    Marcus decides before the room is ready.
                  </p>
                </div>

                {/* 1C — Recommendation Rationale */}
                <div>
                  <Label text="Recommendation Rationale" />
                  <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: SUB, fontWeight: 300 }}>
                    Marcus fits this role. The Pioneer pattern — decisive under pressure, high execution drive, ownership without prompting — matches what field leadership demands. The one flag is collaboration. It&apos;s below benchmark and it&apos;s worth probing, not ignoring.
                  </p>
                </div>

              </div>
            </div>
          </section>

          <LayerDivider />

          {/* ══════════════════════════════════════════════
              LAYER 2 — THE RISK
          ══════════════════════════════════════════════ */}
          <section>
            <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>

              {/* 2A — When This Works */}
              <div style={surf}>
                <Label text="When This Works" />
                <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                  {[
                    'The operating environment rewards pace over consensus.',
                    'Scope is clear and accountability belongs to one person.',
                    'The client wants forward motion, not deliberation.',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 8 }}/>
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2B — When It Breaks */}
              <div style={surf}>
                <Label text="When It Breaks" />
                <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                  {[
                    'Success requires broad stakeholder buy-in before decisions.',
                    'The hiring manager expects to be consulted before direction changes.',
                    'The team runs on shared authority — no one person holds the call.',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 8 }}/>
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 2C — The One Thing to Verify */}
            <div style={{
              borderLeft: `3px solid ${AMBER}`,
              background: 'rgba(234,179,8,0.04)',
              borderRadius: '0 10px 10px 0',
              padding: '20px 24px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: 'rgba(234,179,8,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                The One Thing to Verify
              </p>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT, lineHeight: 1.5 }}>
                Does Marcus know when to slow down — or does he only know how to go fast?
              </p>
            </div>
          </section>

          <LayerDivider />

          {/* ══════════════════════════════════════════════
              LAYER 3 — THE PROOF
          ══════════════════════════════════════════════ */}
          <section>

            {/* 3A — Pentagon Radar with Benchmark */}
            <div className="rpt-proof-grid" style={{ ...surf, display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(260px,0.8fr)', gap: 40, marginBottom: 24 }}>
              <div>
                <Label text="Signal Profile vs. Benchmark" />
                <p style={{ margin: '8px 0 24px', fontSize: 14, lineHeight: 1.6, color: SUB }}>
                  Candidate signal pattern against the active role benchmark.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PentagonRadar candidate={CANDIDATE} benchmark={BENCHMARK} animated size={300} />
                </div>
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 2, background: BLUE, borderRadius: 1 }}/>
                    <span style={{ fontSize: 11, color: SUB }}>Marcus Thompson</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 1, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0 5px, transparent 5px 9px)' }}/>
                    <span style={{ fontSize: 11, color: SUB }}>Role Benchmark</span>
                  </div>
                </div>
              </div>

              {/* 3B — Dimension Breakdown */}
              <div style={{ borderLeft: `1px solid ${DIV}`, paddingLeft: 'clamp(16px, 3vw, 32px)' }}>
                <Label text="Dimension Breakdown" />
                <p style={{ margin: '8px 0 20px', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                  Bar = candidate · Tick = benchmark · Delta vs. role
                </p>
                {DIMENSIONS.map(dim => (
                  <DimBar
                    key={dim.key}
                    label={dim.label}
                    score={dim.score}
                    target={dim.target}
                    delta={dim.delta}
                    isTension={dim.key === tensionDim.key}
                  />
                ))}
              </div>
            </div>

            {/* 3C — Archetype Context */}
            <div style={{ ...surf, borderTop: `2px solid rgba(255,255,255,0.06)` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                  Pioneer
                </span>
                <Label text="Archetype" />
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: SUB, maxWidth: 640 }}>
                Pioneers move first and decide fast — they drive outcomes without waiting for alignment. The trade-off is process: documentation, follow-through systems, and consensus-building get deprioritized when momentum is available.
              </p>
            </div>

          </section>

          <LayerDivider />

          {/* ══════════════════════════════════════════════
              LAYER 4 — THE DETAIL
          ══════════════════════════════════════════════ */}

          {/* 4.1 — ROI Identification */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="ROI Identification" />
            <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: SUB, maxWidth: 720 }}>
              Best fit: a hiring manager who runs a tight operation, gives clear mandates, and is comfortable with a direct report who pushes back on process overhead. Autonomous scope, visible accountability, decisions that belong to one person. Highest-risk environment: a consensus-driven leadership team or a manager who expects to be consulted before direction changes.
            </p>
          </section>

          {/* 4.2 — Team Compatibility */}
          <section style={{ ...surf, background: '#0f1520', border: '1px solid rgba(37,99,235,0.18)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Label text="Team Compatibility" />
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
                background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: 4, fontSize: 10, color: BLUE, fontWeight: 600, letterSpacing: '0.06em',
              }}>MODE B</span>
            </div>
            <p style={{ margin: '0 0 32px', fontSize: 14, lineHeight: 1.6, color: SUB, maxWidth: 560 }}>
              Three key people on the hiring side completed the same assessment. This shows where Marcus fits and where friction lives.
            </p>

            {/* Full-width overlay radar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <PentagonRadar
                candidate={CANDIDATE}
                benchmark={null}
                overlays={[
                  { scores: TEAM[0].scores, color: AMBER },
                  { scores: TEAM[1].scores, color: RED },
                  { scores: TEAM[2].scores, color: GREEN },
                ]}
                size={380}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 2, background: BLUE, borderRadius: 1 }}/>
                  <span style={{ fontSize: 11, color: SUB }}>Marcus Thompson</span>
                </div>
                {TEAM.map(person => (
                  <div key={person.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 2, background: person.statusColor, opacity: 0.6, borderRadius: 1 }}/>
                    <span style={{ fontSize: 11, color: SUB }}>{person.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Three person rows */}
            <div style={{ display: 'grid', gap: 12 }}>
              {TEAM.map(person => (
                <div key={person.name} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 10,
                }}>
                  <div style={{ flexShrink: 0, width: 40, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: person.statusColor, lineHeight: 1 }}>{person.compat}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>compat</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{person.name}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{person.role}</span>
                    </div>
                    {/* Dimension contrast bars */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {RADAR_DIMS.map(d => {
                        const cand = CANDIDATE[d.key]
                        const them = person.scores[d.key]
                        const diff = Math.abs(cand - them)
                        const isLarge = diff > 20
                        return (
                          <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ height: 4, background: BLUE, borderRadius: 2, opacity: 0.65, width: `${cand}%`, maxWidth: '100%' }}/>
                            <div style={{
                              height: 4, borderRadius: 2, opacity: 0.55,
                              background: isLarge ? RED : GREEN,
                              width: `${them}%`, maxWidth: '100%',
                            }}/>
                          </div>
                        )
                      })}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: SUB, lineHeight: 1.5 }}>{person.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4.3 — Dimensional Impact */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Dimensional Impact" />
            <div style={{ marginTop: 20, display: 'grid', gap: 0 }}>
              {[
                { label: 'Decision Speed +21', note: 'Largest positive delta. Marcus moves significantly faster than this role requires. An asset in field environments. A friction point anywhere that runs on consensus.' },
                { label: 'Adaptability +15', note: 'Well above benchmark. Handles shifting priorities and ambiguity without losing execution edge.' },
                { label: 'Execution +8', note: 'Above benchmark. The pattern matches what field leadership demands — moves forward, doesn\'t wait.' },
                { label: 'Ownership +1', note: 'Narrow delta. Marcus meets the bar but doesn\'t meaningfully exceed it on this dimension. Worth watching.' },
                { label: 'Collaboration −3', note: 'Only dimension below benchmark. Within tolerance. Probe it in roles with high cross-functional dependency. This is the tension.' },
              ].map((item, i) => {
                const isTension = item.label.startsWith('Collaboration')
                return (
                  <div key={item.label} style={{
                    paddingTop: i > 0 ? 18 : 0, paddingBottom: 18,
                    borderBottom: `1px solid ${DIV}`,
                    borderLeft: isTension ? `3px solid ${AMBER}` : 'none',
                    paddingLeft: isTension ? 16 : 0,
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: isTension ? AMBER : TEXT }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: SUB }}>{item.note}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 4.4 — Interview Probes */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Interview Probes" />
            <p style={{ margin: '8px 0 28px', fontSize: 14, color: SUB, lineHeight: 1.6 }}>
              These surface the Primary Tension directly. Ask them in order.
            </p>
            <div style={{ display: 'grid', gap: 0 }}>
              {INTERVIEW_PROBES.map((q, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 24, alignItems: 'flex-start',
                  paddingTop: i > 0 ? 28 : 0, paddingBottom: 28,
                  borderBottom: i < INTERVIEW_PROBES.length - 1 ? `1px solid ${DIV}` : 'none',
                }}>
                  <span style={{
                    fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'rgba(255,255,255,0.06)',
                    lineHeight: 1, flexShrink: 0, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
                    minWidth: 48,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: TEXT, fontStyle: 'italic' }}>
                    &ldquo;{q}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Report footer metadata ── */}
          <section style={{ ...surf, marginBottom: 24, padding: '20px 24px' }}>
            <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {[
                'Based on 94 behavioral signals',
                'Recommendation generated from calibrated signal analysis',
                'Benchmark confidence: High',
                'Use alongside structured interviews and reference checks',
              ].map(item => (
                <p key={item} style={{ margin: 0, fontSize: 12, color: SUB }}>{item}</p>
              ))}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer style={{ paddingTop: 24, borderTop: `1px solid ${DIV}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 12, alignItems: 'center' }}>
              {['Report ID: a4f2c8d1', 'Assessment completed Mar 14, 2026'].map((item, i) => (
                <span key={item} style={{ fontSize: 11, color: SUB }}>
                  {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: FAINT, maxWidth: 720 }}>
              Prepared by Veltro · veltro.ai. Recommendation generated from calibrated signal analysis and intended for use alongside structured interviews and reference checks. Assessment results are one input, not a hiring decision.
            </p>
          </footer>

        </div>

        {/* ── CTA bar ── */}
        <div className="sr-cta" style={{
          borderTop: `1px solid ${DIV}`, padding: '40px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          background: '#080E1A',
        }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', textAlign: 'center' }}>
            Every candidate you place can have a report like this.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: SUB, textAlign: 'center', maxWidth: 480 }}>
            One additional step at shortlist. A deliverable your client can hold. Takes six minutes per candidate.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
              height: 44, padding: '0 24px', borderRadius: 10, background: '#FFF', color: BG,
              fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}>Request a walkthrough</a>
            <Link href="/" style={{
              height: 44, padding: '0 24px', borderRadius: 10,
              border: `1px solid ${DIV}`, color: SUB,
              fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            }}>Back to Veltro</Link>
          </div>
        </div>
      </main>
    </>
  )
}
