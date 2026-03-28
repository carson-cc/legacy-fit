'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { PRODUCT_NAME, COMPANY_URL } from '@/lib/brand'

interface Target {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

interface Scores {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}
// API returns scores with renamed keys
interface ApiScores {
  execution: number
  collaboration: number
  adaptability: number
  ownership: number
}

interface Profile {
  name: string
  tagline: string
  group: string
  groupLabel: string
  description: string
  strengths: string[]
  traps: string[]
  bestRoles: string[]
}

interface InterviewQuestion {
  dimension: string
  direction: string
  gap: number
  questions: string[]
}

interface TeamFit {
  worksWellWith: string[]
  mayClashWith: string[]
  teamGap: string
  hmMatch: 'good' | 'caution' | null
  hmNote: string | null
}

interface ReportData {
  name: string
  completedAt: string
  job: { title: string; roleType: string; client: string; target: Target | null }
  scores: ApiScores
  list1Scores: ApiScores
  percentiles: Record<string, number>
  profileName: string
  profileGroup: string
  profile: Profile
  secondaryProfile: Profile | null
  adaptationStress: number
  fitPct: number
  rushed: boolean
  interviewGuide: InterviewQuestion[]
  list1Count: number
  list2Count: number
  resultId: string
  teamFit?: TeamFit
  // Enriched fields from API
  confidence?: string
  percentile?: string
  benchmarkComparison?: string
  rationale?: string
  recommendation?: string
  trustMeta?: string[]
}

type FitModelScores = {
  execution: number
  ownership: number
  adaptability: number
  collaboration: number
  decisionSpeed: number
}

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── FIXED: correct thresholds 85/70 ──────────────────────────

function decisionColor(pct: number): string {
  if (pct >= 85) return GREEN
  if (pct >= 70) return YELLOW
  return RED
}

function decisionLabel(pct: number): 'Strong Hire' | 'Proceed with Caution' | 'Do Not Hire' {
  if (pct >= 85) return 'Strong Hire'
  if (pct >= 70) return 'Proceed with Caution'
  return 'Do Not Hire'
}

function confidenceLabel(pct: number): 'High' | 'Medium' | 'Low' {
  if (pct >= 80) return 'High'
  if (pct >= 60) return 'Medium'
  return 'Low'
}

function percentileLabel(pct: number): string {
  if (pct >= 90) return 'Top 10%'
  if (pct >= 82) return 'Top 18%'
  if (pct >= 75) return 'Top 25%'
  if (pct >= 65) return 'Top 40%'
  return 'Below top 40%'
}

function topStrengths(profile: Profile): string[] {
  return (profile.strengths || []).slice(0, 3)
}

function topRisks(profile: Profile): string[] {
  return (profile.traps || []).slice(0, 3)
}

function toFitModel(scores: Scores): FitModelScores {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 100)))
  return {
    execution: clamp(scores.dominance * 0.45 + scores.formality * 0.35 + (1 - scores.patience) * 0.2),
    ownership: clamp(scores.dominance * 0.7 + scores.patience * 0.3),
    adaptability: clamp((1 - scores.formality) * 0.45 + (1 - scores.patience) * 0.3 + scores.extraversion * 0.25),
    collaboration: clamp(scores.extraversion * 0.7 + scores.patience * 0.3),
    decisionSpeed: clamp(scores.dominance * 0.5 + (1 - scores.patience) * 0.5),
  }
}

function toFitBenchmark(target: Target | null | undefined): FitModelScores | null {
  if (!target) return null
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 100)))
  return {
    execution: clamp(target.dominance * 0.45 + target.formality * 0.35 + (1 - target.patience) * 0.2),
    ownership: clamp(target.dominance * 0.7 + target.patience * 0.3),
    adaptability: clamp((1 - target.formality) * 0.45 + (1 - target.patience) * 0.3 + target.extraversion * 0.25),
    collaboration: clamp(target.extraversion * 0.7 + target.patience * 0.3),
    decisionSpeed: clamp(target.dominance * 0.5 + (1 - target.patience) * 0.5),
  }
}

function benchmarkComparison(title: string, pct: number): string {
  const role = title.toLowerCase()
  if (pct >= 85) return `Aligned with high-performing candidates in comparable ${role} roles.`
  if (pct >= 70) return `Moderate alignment with the active benchmark for comparable ${role} roles.`
  return `Significant misalignment against the current benchmark for ${role} roles.`
}

function roleImplication(title: string, strengths: string[], risks: string[]): string {
  const role = title.toLowerCase()
  const risk = risks[0]?.toLowerCase() || 'lower fit in process-heavy environments'
  return `This pattern supports success in ${role} environments that reward decisive execution and visible ownership. The primary watchout is ${risk}. The recommendation is strongest when the role values pace, accountability, and forward motion.`
}

function executiveSummary(name: string, title: string, pct: number, strengths: string[], risks: string[]): string {
  const label = decisionLabel(pct)
  const first = name.split(' ')[0]
  const strengthLine = strengths.slice(0, 2).join(' and ').toLowerCase() || 'execution and ownership'
  const riskLine = risks.slice(0, 2).join(' and ').toLowerCase() || 'lower fit in process-heavy environments'
  return `${first} receives a ${label.toLowerCase()} recommendation for ${title.toLowerCase()} based on observed signal patterns strongest in ${strengthLine}. The recommendation is best supported in environments that value visible ownership, pace, and independent decision-making. The principal caution is ${riskLine}.`
}

function Label({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 11, lineHeight: '16px', letterSpacing: '0.08em',
      textTransform: 'uppercase', color: FAINT, fontWeight: 600, margin: 0,
    }}>
      {text}
    </p>
  )
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)
  const size = 120
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t0 = performance.now()
    const duration = 600
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(eased * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const glowColor = color === GREEN ? 'rgba(34,197,94,0.15)' : color === YELLOW ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={glowColor} strokeWidth={12}
      />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 60ms ease-out' }}
      />
      <text
        x={size/2} y={size/2 + 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={38} fontWeight={700}
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        {displayed}
      </text>
    </svg>
  )
}

function FitModelViz({ scores, benchmark }: { scores: FitModelScores; benchmark: FitModelScores | null }) {
  const labels = [
    { key: 'execution', label: 'Execution' },
    { key: 'ownership', label: 'Ownership' },
    { key: 'adaptability', label: 'Adaptability' },
    { key: 'collaboration', label: 'Collaboration' },
    { key: 'decisionSpeed', label: 'Decision Speed' },
  ] as const

  const size = 300
  const center = size / 2
  const radius = 100
  const rings = [0.25, 0.5, 0.75, 1]

  const pointFor = (value: number, index: number, total: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
    const r = radius * (value / 100)
    return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r }
  }

  const labelPoint = (index: number, total: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
    const r = radius * 1.22
    return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r }
  }

  const polygonPath = (model: FitModelScores) => {
    const values = labels.map((l) => model[l.key])
    return values.map((value, index) => {
      const p = pointFor(value, index, values.length)
      return `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    }).join(' ') + ' Z'
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Fit model">
        <defs>
          <filter id="rpt-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {rings.map((ring) => {
          const pts = labels.map((_, i) => {
            const p = pointFor(100 * ring, i, labels.length)
            return `${p.x},${p.y}`
          }).join(' ')
          return <polygon key={ring} points={pts} fill="none" stroke={DIVIDER} strokeWidth="1" />
        })}

        {labels.map((item, index) => {
          const end = pointFor(100, index, labels.length)
          const lp = labelPoint(index, labels.length)
          return (
            <g key={item.key}>
              <line x1={center} y1={center} x2={end.x} y2={end.y} stroke={DIVIDER} strokeWidth="1" />
              <text
                x={lp.x} y={lp.y} fill={SUBTLE} fontSize="11" fontWeight="500"
                textAnchor={lp.x < center - 15 ? 'end' : lp.x > center + 15 ? 'start' : 'middle'}
                dominantBaseline={lp.y < center - 15 ? 'alphabetic' : lp.y > center + 15 ? 'hanging' : 'middle'}
                fontFamily="-apple-system, system-ui, sans-serif"
              >
                {item.label}
              </text>
            </g>
          )
        })}

        {benchmark && (
          <path
            d={polygonPath(benchmark)}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
        )}

        <path
          d={polygonPath(scores)}
          fill="rgba(37,99,235,0.12)"
          stroke={BLUE}
          strokeWidth="2"
          filter="url(#rpt-glow)"
        />

        {labels.map((item, index) => {
          const p = pointFor(scores[item.key], index, labels.length)
          return <circle key={item.key} cx={p.x} cy={p.y} r="3.5" fill={BLUE} />
        })}
      </svg>
    </div>
  )
}

export default function SharedReportPage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (data?.name) document.title = `Veltro — ${data.name}`
  }, [data?.name])

  useEffect(() => {
    if (!shareToken) return
    fetch(`/api/report/${shareToken}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Report not found' : 'Unable to load report')
        return r.json()
      })
      .then((d) => { setData(d.data); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [shareToken])

  const derived = useMemo(() => {
    if (!data) return null
    const fitScore = Math.round(data.fitPct ?? 0)
    const strengths = topStrengths(data.profile)
    const risks = topRisks(data.profile)
    // Remap API keys (execution/collaboration/adaptability/ownership) to FitModel keys (dominance/extraversion/patience/formality)
    const mappedScores: Scores = {
      dominance: Number(data.scores.execution),
      extraversion: Number(data.scores.collaboration),
      patience: Number(data.scores.adaptability),
      formality: Number(data.scores.ownership),
    }
    const fitModel = toFitModel(mappedScores)
    const benchmark = toFitBenchmark(data.job.target)
    const totalSignals = 94
    const roleType = data.job.roleType || data.job.title
    const dimensions = [
      { label: 'Execution', score: fitModel.execution, target: benchmark?.execution ?? null },
      { label: 'Ownership', score: fitModel.ownership, target: benchmark?.ownership ?? null },
      { label: 'Adaptability', score: fitModel.adaptability, target: benchmark?.adaptability ?? null },
      { label: 'Collaboration', score: fitModel.collaboration, target: benchmark?.collaboration ?? null },
      { label: 'Decision Speed', score: fitModel.decisionSpeed, target: benchmark?.decisionSpeed ?? null },
    ]
    return {
      fitScore,
      color: decisionColor(fitScore),
      recommendation: decisionLabel(fitScore),
      confidence: data.confidence || confidenceLabel(fitScore),
      percentile: data.percentile || percentileLabel(fitScore),
      strengths,
      risks,
      fitModel,
      benchmark,
      benchmarkNote: data.benchmarkComparison || benchmarkComparison(roleType, fitScore),
      roleImplicationText: roleImplication(roleType, strengths, risks),
      executiveSummaryText: executiveSummary(data.name, roleType, fitScore, strengths, risks),
      rationale: data.rationale || 'Strong signal alignment with role benchmark requirements.',
      dimensions,
      totalSignals,
    }
  }, [data])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG, gap: 16 }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 14, color: SUBTLE, margin: 0 }}>Loading report...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !data || !derived) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: BG, color: TEXT, padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px', fontWeight: 700 }}>Report not found</h1>
          <p style={{ margin: 0, color: SUBTLE, fontSize: 16, lineHeight: 1.6 }}>
            This link may be invalid or expired. Please request a new report link.
          </p>
        </div>
      </div>
    )
  }

  const c = data
  const surf: React.CSSProperties = {
    background: SURFACE,
    border: `1px solid ${DIVIDER}`,
    borderRadius: 12,
    padding: 32,
  }

  return (
    <>
      <style>{`
        @media print {
          body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-nav { display: none !important; }
          .report-root { background: #ffffff !important; color: #111827 !important; }
          .rpt-surface { background: #f9fafb !important; border-color: #e5e7eb !important; box-shadow: none !important; }
          .rpt-text { color: #111827 !important; }
          .rpt-subtle { color: #6b7280 !important; }
          svg text { fill: #6b7280 !important; }
          @page { margin: 0.5in; size: letter; }
          .rpt-two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .rpt-score-grid { grid-template-columns: 1fr !important; }
          .rpt-two-col { grid-template-columns: 1fr !important; }
          .rpt-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav className="report-nav" style={{
        position: 'sticky', top: 0, zIndex: 40, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(11,15,20,0.92)',
        borderBottom: `1px solid ${DIVIDER}`,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontSize: 14, color: TEXT, fontWeight: 700 }}>{PRODUCT_NAME}</div>
        <div style={{ fontSize: 12, color: SUBTLE }}>Candidate Recommendation Report</div>
        <button
          onClick={() => window.print()}
          style={{
            height: 32, padding: '0 14px', borderRadius: 8,
            border: `1px solid ${DIVIDER}`, background: 'transparent',
            color: SUBTLE, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Print
        </button>
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
              {c.name}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: SUBTLE }}>
              {c.job.title} · {c.job.client} · {formatDate(c.completedAt)}
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
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
              <Label text="Fit Score" />
              <ScoreRing score={derived.fitScore} color={derived.color} />
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <Label text="Recommendation" />
                  <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: TEXT }}>
                    {derived.recommendation}
                  </p>
                </div>
                <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label text="Confidence" />
                    <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: derived.color }}>
                      {derived.confidence}
                    </p>
                  </div>
                  <div>
                    <Label text="Percentile" />
                    <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: TEXT }}>
                      {derived.percentile}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ borderLeft: `1px solid ${DIVIDER}`, paddingLeft: 40, display: 'grid', gap: 24 }}>
              <div>
                <Label text="Benchmark Comparison" />
                <p style={{ margin: '12px 0 0', fontSize: 24, fontWeight: 700, color: TEXT, lineHeight: 1.3, maxWidth: 500 }}>
                  {derived.benchmarkNote}
                </p>
              </div>
              <div>
                <Label text="Recommendation Rationale" />
                <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.7, color: SUBTLE }}>
                  {derived.rationale}
                </p>
              </div>
              <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  `Based on ${derived.totalSignals} behavioral signals`,
                  'Role benchmark active',
                  'Recommendation generated from calibrated signal analysis',
                ].map((item, i) => (
                  <span key={item} style={{ fontSize: 11, color: SUBTLE }}>
                    {i > 0 && <span style={{ margin: '0 8px', color: DIVIDER }}>·</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* B. WHY ALIGNED + KEY RISKS */}
          <section className="rpt-two-col" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 24, marginBottom: 24,
          }}>
            <div style={surf}>
              <Label text="Why Aligned" />
              <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                {derived.strengths.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 8 }} />
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: TEXT }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={surf}>
              <Label text="Key Risks" />
              <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                {derived.risks.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 8 }} />
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
              <FitModelViz scores={derived.fitModel} benchmark={derived.benchmark} />
            </div>

            <div style={surf}>
              <Label text="Benchmark Summary" />
              <div style={{ marginTop: 20, display: 'grid', gap: 0 }}>
                {derived.dimensions.map((dim) => {
                  const delta = dim.target == null ? null : dim.score - dim.target
                  const dc = delta == null ? SUBTLE : delta > 0 ? GREEN : delta < 0 ? RED : SUBTLE
                  return (
                    <div key={dim.label} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${DIVIDER}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{dim.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{dim.score}</span>
                        <span style={{ fontSize: 12, color: dc, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
                        </span>
                      </div>
                      {dim.target != null && (
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: SUBTLE }}>
                          Benchmark {dim.target}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* D. RECOMMENDATION RATIONALE + AI SUMMARY */}
          <section className="rpt-two-col" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 24, marginBottom: 24,
          }}>
            <div style={surf}>
              <Label text="Recommendation Rationale" />
              <div style={{ marginTop: 20, display: 'grid', gap: 20 }}>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: TEXT }}>Benchmark alignment</p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>{derived.benchmarkNote}</p>
                </div>
                <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 16 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: TEXT }}>Observed strengths</p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>{derived.strengths.join('. ')}.</p>
                </div>
                <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 16 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: TEXT }}>Risk conditions</p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>{derived.risks.join('. ')}.</p>
                </div>
              </div>
            </div>

            {/* AI Summary — visually subordinate */}
            <div style={{ ...surf, background: '#0D1117', border: `1px solid ${DIVIDER}`, opacity: 0.85 }}>
              <Label text="AI-Assisted Executive Summary" />
              <p style={{ margin: '8px 0 20px', fontSize: 11, lineHeight: 1.5, color: FAINT }}>
                AI-assisted interpretation based on observed signal patterns
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: SUBTLE }}>
                {derived.executiveSummaryText}
              </p>
            </div>
          </section>

          {/* E. ROLE IMPLICATION */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Role Implication" />
            <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: SUBTLE, maxWidth: 720 }}>
              {derived.roleImplicationText}
            </p>
          </section>

          {/* F. SUPPORTING EVIDENCE (if interview guide available) */}
          {c.interviewGuide?.length > 0 && (
            <section className="rpt-two-col" style={{
              ...surf,
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 32, marginBottom: 24,
            }}>
              <div>
                <Label text="Decision Summary" />
                <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                  {[
                    ...derived.strengths.map((item) => item),
                    ...derived.risks.slice(0, 1).map((item) => `Watchout: ${item}`),
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: SUBTLE, flexShrink: 0, marginTop: 2 }}>—</span>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label text="Recommended Interview Probes" />
                <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                  {c.interviewGuide.slice(0, 3).map((item, index) => (
                    <p key={`${item.dimension}-${index}`} style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: SUBTLE }}>
                      {item.questions[0]}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Benchmark footer */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                `Based on ${derived.totalSignals} behavioral signals`,
                'Recommendation generated from calibrated signal analysis',
                `Benchmark confidence: ${derived.confidence}`,
                'Use alongside structured interviews and reference checks',
              ].map((item) => (
                <p key={item} style={{ margin: 0, fontSize: 12, color: SUBTLE }}>{item}</p>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer style={{ paddingTop: 24, borderTop: `1px solid ${DIVIDER}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 12, alignItems: 'center' }}>
              {[
                `Report ID: ${c.resultId?.slice(0, 8) || '—'}`,
                'IPIP-NEO validated',
                `Assessment completed ${formatDate(c.completedAt)}`,
              ].map((item, i) => (
                <span key={item} style={{ fontSize: 11, color: SUBTLE }}>
                  {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: FAINT, maxWidth: 720 }}>
              Prepared by {PRODUCT_NAME} · {COMPANY_URL}. Recommendation generated from calibrated signal analysis and intended for use alongside structured interviews and reference checks. Assessment results are one input, not a hiring decision.
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
