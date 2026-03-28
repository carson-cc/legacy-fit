'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// ── Design tokens (mirrors report page) ─────────────────────────────────────
const BG = '#0B0F14'
const SURFACE = '#111827'
const DIVIDER = 'rgba(255,255,255,0.08)'
const TEXT = '#FFFFFF'
const SUBTLE = '#9CA3AF'
const FAINT = 'rgba(255,255,255,0.35)'
const BLUE = '#2563EB'
const GREEN = '#22C55E'
const YELLOW = '#EAB308'
const RED = '#EF4444'

const surf: React.CSSProperties = {
  background: SURFACE,
  border: `1px solid ${DIVIDER}`,
  borderRadius: 12,
  padding: 32,
}

function Label({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 11, lineHeight: '16px', letterSpacing: '0.08em',
      textTransform: 'uppercase', color: FAINT, fontWeight: 600, margin: 0,
    }}>{text}</p>
  )
}

// ── Animated score ring ───────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)
  const size = 120
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  useEffect(() => {
    const t0 = performance.now(), duration = 700
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setDisplayed(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color + '26'} strokeWidth={12} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 60ms ease-out' }}
      />
      <text x={size/2} y={size/2 + 2} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={38} fontWeight={700}
        fontFamily="-apple-system, system-ui, sans-serif">{displayed}</text>
    </svg>
  )
}

// ── Fit model pentagon ────────────────────────────────────────────────────
const DIMS = [
  { key: 'execution',     label: 'Execution' },
  { key: 'ownership',     label: 'Ownership' },
  { key: 'adaptability',  label: 'Adaptability' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'decisionSpeed', label: 'Decision Speed' },
] as const

type DimKey = typeof DIMS[number]['key']
type FitScores = Record<DimKey, number>

const CANDIDATE_FIT: FitScores  = { execution: 72, ownership: 67, adaptability: 65, collaboration: 49, decisionSpeed: 85 }
const BENCHMARK_FIT: FitScores  = { execution: 64, ownership: 66, adaptability: 50, collaboration: 52, decisionSpeed: 64 }
const HM_FIT: FitScores         = { execution: 44, ownership: 56, adaptability: 60, collaboration: 72, decisionSpeed: 54 }

function FitModelViz({ scores, benchmark }: { scores: FitScores; benchmark: FitScores | null }) {
  const size = 300, center = 150, radius = 100
  const rings = [0.25, 0.5, 0.75, 1]
  const pt = (val: number, i: number) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / DIMS.length
    const r = radius * (val / 100)
    return { x: center + Math.cos(a) * r, y: center + Math.sin(a) * r }
  }
  const lp = (i: number) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / DIMS.length
    const r = radius * 1.24
    return { x: center + Math.cos(a) * r, y: center + Math.sin(a) * r }
  }
  const poly = (s: FitScores) =>
    DIMS.map((d, i) => pt(s[d.key], i)).map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  const ringPts = (f: number) =>
    DIMS.map((_, i) => { const p = pt(100 * f, i); return `${p.x},${p.y}` }).join(' ')

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Fit model">
        <defs>
          <filter id="sr-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {rings.map(f => (
          <polygon key={f} points={ringPts(f)} fill="none" stroke={DIVIDER} strokeWidth="1"/>
        ))}
        {DIMS.map((d, i) => {
          const end = pt(100, i), l = lp(i)
          return (
            <g key={d.key}>
              <line x1={center} y1={center} x2={end.x} y2={end.y} stroke={DIVIDER} strokeWidth="1"/>
              <text x={l.x} y={l.y} fill={SUBTLE} fontSize="11" fontWeight="500"
                textAnchor={l.x < center - 15 ? 'end' : l.x > center + 15 ? 'start' : 'middle'}
                dominantBaseline={l.y < center - 15 ? 'alphabetic' : l.y > center + 15 ? 'hanging' : 'middle'}
                fontFamily="-apple-system, system-ui, sans-serif">{d.label}</text>
            </g>
          )
        })}
        {benchmark && (
          <path d={poly(benchmark)} fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="5 4"/>
        )}
        <path d={poly(scores)} fill="rgba(37,99,235,0.12)" stroke={BLUE} strokeWidth="2" filter="url(#sr-glow)"/>
        {DIMS.map((d, i) => {
          const p = pt(scores[d.key], i)
          return <circle key={d.key} cx={p.x} cy={p.y} r="3.5" fill={BLUE}/>
        })}
      </svg>
    </div>
  )
}

// ── Static demo data ──────────────────────────────────────────────────────

const DIMENSIONS = [
  { label: 'Execution',     score: 72, target: 64, delta: +8  },
  { label: 'Ownership',     score: 67, target: 66, delta: +1  },
  { label: 'Adaptability',  score: 65, target: 50, delta: +15 },
  { label: 'Collaboration', score: 49, target: 52, delta: -3  },
  { label: 'Decision Speed',score: 85, target: 64, delta: +21 },
]

const STRENGTHS = [
  'Takes immediate ownership without being asked',
  'Makes clear decisions under pressure with incomplete information',
  'Drives teams forward when momentum stalls',
]

const RISKS = [
  'May move too fast and steamroll important input',
  'Undervalues process, documentation, and follow-through systems',
  'Can create tension by deciding before everyone is aligned',
]

const INTERVIEW_PROBES = [
  'Tell me about a time you had to take charge of a situation before anyone asked you to. What made you step forward?',
  'Walk me through a high-stakes decision you made with incomplete information. What was the pressure, and how did you move?',
  'Describe a time you drove a stalled project forward when the team had lost momentum. What did you do first?',
]

const DECISION_SUMMARY = [
  ...STRENGTHS,
  `Watchout: ${RISKS[0]}`,
]

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
          .rpt-score-grid { grid-template-columns: 1fr !important; }
          .rpt-two-col    { grid-template-columns: 1fr !important; }
          .rpt-main-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Demo banner */}
      <div className="sr-demo-banner" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(37,99,235,0.12)',
        borderBottom: '1px solid rgba(37,99,235,0.25)',
        padding: '9px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16,
        backdropFilter: 'blur(12px)',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: BLUE }}>Sample report</span>
          {' — '}this is what your client sees. Every candidate you assess gets one.
        </p>
        <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request"
          style={{
            flexShrink: 0, height: 30, padding: '0 16px', borderRadius: 8,
            background: BLUE, color: '#FFF', fontSize: 12, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >Request a walkthrough</a>
      </div>

      {/* Report nav */}
      <nav className="report-nav" style={{
        position: 'sticky', top: 42, zIndex: 40, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(11,15,20,0.95)',
        borderBottom: `1px solid ${DIVIDER}`,
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ fontSize: 14, color: TEXT, fontWeight: 700, textDecoration: 'none' }}>Veltro</Link>
        <div style={{ fontSize: 12, color: SUBTLE }}>Candidate Recommendation Report</div>
        <button
          onClick={() => window.print()}
          style={{
            height: 32, padding: '0 14px', borderRadius: 8,
            border: `1px solid ${DIVIDER}`, background: 'transparent',
            color: SUBTLE, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >Print</button>
      </nav>

      <main className="report-root" style={{
        minHeight: '100vh', background: BG, color: TEXT,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 96px' }}>

          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: FAINT, fontWeight: 600 }}>
              Candidate Recommendation Report
            </p>
            <h1 style={{ margin: '0 0 8px', fontSize: 40, lineHeight: 1.15, letterSpacing: '-0.03em', fontWeight: 700, color: TEXT }}>
              Marcus Thompson
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: SUBTLE }}>
              Superintendent · Gilbane Construction · Mar 14, 2026
            </p>
          </header>

          {/* A. RECOMMENDATION HERO */}
          <section className="rpt-score-grid" style={{
            ...surf,
            display: 'grid',
            gridTemplateColumns: '220px minmax(0, 1fr)',
            gap: 40,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
              <Label text="Fit Score" />
              <ScoreRing score={93} color={GREEN} />
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <Label text="Recommendation" />
                  <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: TEXT }}>Strong Hire</p>
                </div>
                <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label text="Fit Strength" />
                    <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: GREEN }}>High</p>
                  </div>
                  <div>
                    <Label text="Fit Tier" />
                    <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: TEXT }}>Strong Fit</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderLeft: `1px solid ${DIVIDER}`, paddingLeft: 40, display: 'grid', gap: 24 }}>
              <div>
                <Label text="Benchmark Comparison" />
                <p style={{ margin: '12px 0 0', fontSize: 24, fontWeight: 700, color: TEXT, lineHeight: 1.3, maxWidth: 500 }}>
                  Aligned with high-performing candidates in comparable field leadership roles.
                </p>
              </div>
              <div>
                <Label text="Recommendation Rationale" />
                <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.7, color: SUBTLE }}>
                  Strong signal alignment with role benchmark requirements. Pattern matches Pioneer archetype — decisive under pressure, high execution drive, built for field environments where someone has to step forward and own the outcome.
                </p>
              </div>
              <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Based on 80 behavioral signals', 'Role benchmark active', 'IPIP-NEO validated'].map((item, i) => (
                  <span key={item} style={{ fontSize: 11, color: SUBTLE }}>
                    {i > 0 && <span style={{ margin: '0 8px', color: DIVIDER }}>·</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* B. WHY ALIGNED + KEY RISKS */}
          <section className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={surf}>
              <Label text="Why Aligned" />
              <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                {STRENGTHS.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 8 }}/>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={surf}>
              <Label text="Key Risks" />
              <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                {RISKS.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 8 }}/>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* C. FIT MODEL + BENCHMARK SUMMARY */}
          <section className="rpt-main-grid" style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)',
            gap: 24, marginBottom: 24,
          }}>
            <div style={surf}>
              <Label text="Fit Model" />
              <p style={{ margin: '12px 0 24px', fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>
                Observed candidate signal pattern against the active role benchmark.
              </p>
              <FitModelViz scores={CANDIDATE_FIT} benchmark={BENCHMARK_FIT} />
            </div>
            <div style={surf}>
              <Label text="Benchmark Summary" />
              <div style={{ marginTop: 20, display: 'grid', gap: 0 }}>
                {DIMENSIONS.map(dim => {
                  const dc = dim.delta > 0 ? GREEN : dim.delta < 0 ? RED : SUBTLE
                  return (
                    <div key={dim.label} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${DIVIDER}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{dim.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{dim.score}</span>
                        <span style={{ fontSize: 12, color: dc, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {dim.delta > 0 ? '+' : ''}{dim.delta}
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: SUBTLE }}>Benchmark {dim.target}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* D. RATIONALE + AI SUMMARY */}
          <section className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={surf}>
              <Label text="Dimensional Read" />
              <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                {[
                  { label: 'Decision Speed +21', note: 'Largest positive delta. Candidate moves significantly faster than the benchmark requires — an asset in field environments, a potential friction point in consensus-driven cultures.' },
                  { label: 'Adaptability +15', note: 'Scores well above benchmark. Handles ambiguity and shifting priorities without losing execution edge.' },
                  { label: 'Collaboration −3', note: 'Only dimension below benchmark, and within tolerance. Worth probing in roles with high cross-functional dependency or matrix reporting.' },
                  { label: 'Execution +8 · Ownership +1', note: 'Both above benchmark. The ownership delta is narrow — candidate meets the bar but does not meaningfully exceed it on this dimension.' },
                ].map((item, i) => (
                  <div key={item.label} style={{ paddingTop: i > 0 ? 16 : 0, borderTop: i > 0 ? `1px solid ${DIVIDER}` : 'none' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: TEXT }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: SUBTLE }}>{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={surf}>
              <Label text="Executive Summary" />
              <p style={{ margin: '20px 0 0', fontSize: 14, lineHeight: 1.8, color: SUBTLE }}>
                Marcus receives a <strong style={{ color: TEXT }}>Strong Hire</strong> recommendation for Superintendent. Signal patterns are strongest on ownership and decisiveness under pressure — the behavioral demands most predictive of success in field leadership. The one dimension below benchmark (Collaboration, −3) is within tolerance and should be probed in the client debrief, not treated as a gate. Overall pattern is well-matched to roles that require forward motion over consensus.
              </p>
            </div>
          </section>

          {/* E. ROLE IMPLICATION */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Role Implication" />
            <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: SUBTLE, maxWidth: 720 }}>
              Best fit: hiring manager who runs a tight operation, gives clear mandates, and is comfortable with a direct report who will push back on process overhead. Lowest-risk environment: autonomous scope, visible accountability, and decisions that belong to one person. Highest-risk environment: consensus-driven leadership team or a manager who expects to be consulted before direction changes. The interview probes below are designed to surface this boundary directly.
            </p>
          </section>

          {/* F. DECISION SUMMARY + INTERVIEW PROBES */}
          <section className="rpt-two-col" style={{
            ...surf, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24,
          }}>
            <div>
              <Label text="Decision Summary" />
              <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                {DECISION_SUMMARY.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: SUBTLE, flexShrink: 0, marginTop: 2 }}>—</span>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label text="Recommended Interview Probes" />
              <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
                {INTERVIEW_PROBES.map((q, i) => (
                  <p key={i} style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>{q}</p>
                ))}
              </div>
            </div>
          </section>

          {/* G. TEAM FIT — Mode B differentiator */}
          <section style={{ ...surf, marginBottom: 24, background: '#0D1421', border: '1px solid rgba(37,99,235,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Label text="Team Compatibility Analysis" />
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
                background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: 4, fontSize: 10, color: BLUE, fontWeight: 600, letterSpacing: '0.06em',
              }}>MODE B</span>
            </div>
            <p style={{ margin: '0 0 28px', fontSize: 14, lineHeight: 1.6, color: SUBTLE, maxWidth: 560 }}>
              The hiring manager completed the same 6-minute assessment. This section shows candidate–manager behavioral compatibility.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }}>
              {[
                { name: 'Marcus Thompson', role: 'Candidate · Pioneer', scores: CANDIDATE_FIT },
                { name: 'David Mercer',    role: 'Hiring Manager · Diplomat', scores: HM_FIT },
              ].map(person => (
                <div key={person.name} style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: TEXT }}>{person.name}</p>
                  <p style={{ margin: '0 0 16px', fontSize: 12, color: SUBTLE }}>{person.role}</p>
                  <FitModelViz scores={person.scores} benchmark={null} />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 6 }}/>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Works well with: </span>
                  <span style={{ fontSize: 13, color: SUBTLE }}>Collaboration and Decision Speed dimensions align — both operate with directness and expect accountability, reducing friction in daily execution.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 16px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: YELLOW, flexShrink: 0, marginTop: 6 }}/>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Watch for: </span>
                  <span style={{ fontSize: 13, color: SUBTLE }}>Adaptability gap and pace mismatch — Marcus moves faster than David's comfort zone under ambiguity. Address in onboarding: agree on escalation thresholds before Marcus hits the ground.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Benchmark footer */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                'Based on 94 behavioral signals',
                'Recommendation generated from calibrated signal analysis',
                'Benchmark confidence: High',
                'Use alongside structured interviews and reference checks',
              ].map(item => (
                <p key={item} style={{ margin: 0, fontSize: 12, color: SUBTLE }}>{item}</p>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer style={{ paddingTop: 24, borderTop: `1px solid ${DIVIDER}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 12, alignItems: 'center' }}>
              {['Report ID: a4f2c8d1', 'IPIP-NEO validated', 'Assessment completed Mar 14, 2026'].map((item, i) => (
                <span key={item} style={{ fontSize: 11, color: SUBTLE }}>
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

        {/* CTA bar */}
        <div className="sr-cta" style={{
          borderTop: `1px solid ${DIVIDER}`,
          padding: '40px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          background: '#080E1A',
        }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', textAlign: 'center' }}>
            Every candidate you place can have a report like this.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: SUBTLE, textAlign: 'center', maxWidth: 480 }}>
            One additional step at shortlist. A deliverable your client can hold. Takes six minutes per candidate.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request"
              style={{
                height: 44, padding: '0 24px', borderRadius: 10, background: '#FFF', color: BG,
                fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none',
              }}
            >Request a walkthrough</a>
            <Link href="/"
              style={{
                height: 44, padding: '0 24px', borderRadius: 10,
                border: `1px solid ${DIVIDER}`, color: SUBTLE,
                fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none',
              }}
            >Back to Veltro</Link>
          </div>
        </div>
      </main>
    </>
  )
}
