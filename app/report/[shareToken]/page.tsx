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

interface DimensionWithDelta {
  label: string
  score: number
  target: number | null
  delta: number | null
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

// ─── Generator functions ──────────────────────────────────────────────────────

function generateVerdict(
  name: string,
  roleTitle: string,
  dimensions: DimensionWithDelta[]
): string {
  const first = name.split(' ')[0]
  const role = roleTitle.toLowerCase()
  const highSpeed = (dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0) > 5
  const highOwnership = (dimensions.find(d => d.label === 'Ownership')?.delta ?? 0) > 5
  const descriptor = highSpeed && highOwnership ? 'execution-forward' : highOwnership ? 'ownership-first' : highSpeed ? 'fast-moving' : 'results-oriented'
  const article = /^[aeiou]/i.test(descriptor) ? 'an' : 'a'
  const value = highSpeed
    ? 'will drive momentum without waiting for full alignment'
    : highOwnership
    ? 'takes ownership and drives outcomes with minimal direction'
    : 'operates effectively in high-accountability environments'
  return `${first} is ${article} ${descriptor} ${role} who ${value}.`
}

function generatePrimaryRisk(
  risks: string[],
  dimensions: DimensionWithDelta[]
): { signal: string; consequence: string } {
  const speedDelta = dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0
  const collabDelta = dimensions.find(d => d.label === 'Collaboration')?.delta ?? 0
  const topRisk = (risks[0] || '').toLowerCase()

  if (speedDelta > 5 || topRisk.includes('fast') || topRisk.includes('align')) {
    return {
      signal: 'Moves faster than stakeholder alignment',
      consequence: 'risk of missed input and execution friction',
    }
  }
  if (collabDelta < -2 || topRisk.includes('collab') || topRisk.includes('process')) {
    return {
      signal: 'Deprioritizes alignment in favor of progress',
      consequence: 'risk of friction in consensus-driven environments',
    }
  }
  return {
    signal: risks[0] || 'May underweight process and alignment',
    consequence: 'monitor in environments requiring structured collaboration',
  }
}

function generatePointOfView(
  name: string,
  roleTitle: string,
  risks: string[],
  dimensions: DimensionWithDelta[]
): string {
  const first = name.split(' ')[0]
  const role = roleTitle.toLowerCase()
  const highSpeed = (dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0) > 5
  const descriptor = highSpeed ? 'execution-first' : 'ownership-focused'
  const article = /^[aeiou]/i.test(descriptor) ? 'an' : 'a'
  const watchout = (risks[0] || '').toLowerCase() || 'process alignment'
  const consequence = highSpeed
    ? 'they will move decisions forward quickly, which can create friction when broader alignment is expected'
    : 'they may underweight process and alignment in favor of results'
  return `${first} is ${article} ${descriptor} ${role} who performs best in environments that prioritize speed and accountability. Their main watchout is ${watchout} — ${consequence}.`
}

function generateFailureMode(
  name: string,
  risks: string[],
  dimensions: DimensionWithDelta[]
): string {
  const first = name.split(' ')[0]
  const highSpeed = (dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0) > 5
  const lowCollab = (dimensions.find(d => d.label === 'Collaboration')?.delta ?? 0) < -2

  if (highSpeed) {
    return `${first} moves forward on a key decision without full stakeholder input, creating rework or friction with team members who expected alignment before execution.`
  }
  if (lowCollab) {
    return `${first} progresses independently on a direction requiring cross-functional alignment, creating confusion or resistance from team members who expected to be consulted.`
  }
  const risk = (risks[0] || '').toLowerCase()
  return `${first} ${risk || 'underweights alignment and process'}, creating friction or rework in environments that require structured coordination before acting.`
}

function generateChartInterpretation(dimensions: DimensionWithDelta[]): string {
  const positives = dimensions.filter(d => (d.delta ?? 0) > 2).map(d => d.label)
  const negatives = dimensions.filter(d => (d.delta ?? 0) < -2).map(d => d.label)
  const posStr = positives.length > 0
    ? `Strong in ${positives.slice(0, 3).join(', ').toLowerCase()}.`
    : 'Broadly aligned with benchmark.'
  const negStr = negatives.length > 0
    ? ` ${negatives[0]} is the ${negatives.length === 1 ? 'only' : 'primary'} relative gap vs. benchmark.`
    : ' No significant gaps vs. benchmark.'
  return posStr + negStr
}

function generateDimensionalBehavior(dim: DimensionWithDelta): string {
  const delta = dim.delta ?? 0
  const behaviors: Record<string, [string, string, string]> = {
    'Decision Speed': [
      'Moves quickly with limited information; bias toward action over alignment',
      'Deliberate decision-maker; prefers complete information before committing',
      'Balanced decision pace; adjusts to context',
    ],
    'Execution': [
      'Strong ownership and follow-through; drives outcomes in field operations',
      'Collaborative execution style; relies on team input before acting',
      'Consistent execution with standard oversight',
    ],
    'Ownership': [
      'Takes accountability without being asked; operates with high autonomy',
      'Prefers shared accountability; works best with defined scope',
      'Takes ownership when clearly assigned; reliable within defined lanes',
    ],
    'Adaptability': [
      'Adjusts effectively in changing environments; comfortable shifting direction',
      'Prefers structured environments; works best with consistent expectations',
      'Adequate flexibility; adapts when required',
    ],
    'Collaboration': [
      'High orientation toward team input; builds alignment before acting',
      'Lower relative emphasis; may deprioritize alignment in favor of progress',
      'Collaborates effectively when structure supports it',
    ],
  }
  const b = behaviors[dim.label]
  if (!b) return dim.label
  if (delta > 5) return b[0]
  if (delta < -5) return b[1]
  return b[2]
}

function generateManagementGuide(dimensions: DimensionWithDelta[]): string[] {
  const highSpeed = (dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0) > 5
  const lowCollab = (dimensions.find(d => d.label === 'Collaboration')?.delta ?? 0) < -2
  return [
    highSpeed
      ? 'Set clear expectations on when stakeholder alignment is required before acting'
      : 'Define ownership boundaries clearly at the start of each project',
    highSpeed
      ? 'Pair autonomy with defined communication checkpoints to surface decisions early'
      : 'Establish regular touchpoints to stay informed on direction changes',
    lowCollab
      ? 'Reinforce process expectations where cross-functional alignment is non-negotiable'
      : 'Acknowledge their pace — reward results, not just process adherence',
  ]
}

function generateDecisionFrame(
  strengths: string[],
  risks: string[],
  roleTitle: string
): { hireIf: string; doNotHireIf: string } {
  const topStrength = (strengths[0] || '').toLowerCase()
  const topRisk = (risks[0] || '').toLowerCase()
  const isExecution = topStrength.includes('ownership') || topStrength.includes('decision')
  const isProcess = topRisk.includes('process') || topRisk.includes('alignment')
  return {
    hireIf: isExecution
      ? `The ${roleTitle.toLowerCase()} role requires independent execution and fast decisions without waiting for team consensus.`
      : `The role demands clear ownership and forward momentum with minimal process overhead.`,
    doNotHireIf: isProcess
      ? `Success depends on consensus-driven decisions, process rigor, or cross-functional alignment before acting.`
      : `The environment requires heavy documentation, structured approval chains, or collaborative decision-making before execution.`,
  }
}

function generateProbes(
  risks: string[],
  dimensions: DimensionWithDelta[]
): Array<{ riskLabel: string; question: string; goodAnswer: string }> {
  const highSpeedDelta = dimensions.find(d => d.label === 'Decision Speed' && (d.delta ?? 0) > 15)
  const lowCollab = dimensions.find(d => d.label === 'Collaboration' && (d.delta ?? 0) < 0)
  const probes: Array<{ riskLabel: string; question: string; goodAnswer: string }> = []

  if (highSpeedDelta) {
    probes.push({
      riskLabel: `Decision Speed Risk — +${highSpeedDelta.delta} vs benchmark`,
      question: 'Tell me about a time you committed to a direction before your team was fully aligned. What happened next?',
      goodAnswer: 'Acknowledges the gap, shows ability to course-correct without defensiveness, demonstrates awareness of when speed creates friction.',
    })
  }
  if (lowCollab) {
    probes.push({
      riskLabel: 'Collaboration Risk',
      question: 'Describe a situation where you had to slow down and bring stakeholders along before you could move. How did you handle it?',
      goodAnswer: 'Shows genuine adaptability rather than frustration; can distinguish when alignment is necessary vs. when it slows things down.',
    })
  }
  let riskIdx = 0
  while (probes.length < 3 && riskIdx < risks.length) {
    const risk = risks[riskIdx]
    probes.push({
      riskLabel: probes.length === 0 ? 'Primary Risk' : `Risk ${probes.length + 1}`,
      question: `Walk me through a situation where ${risk.charAt(0).toLowerCase() + risk.slice(1)}. How did it play out?`,
      goodAnswer: 'Shows self-awareness of the pattern and can describe a specific mitigation or recovery.',
    })
    riskIdx++
  }
  return probes.slice(0, 3)
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Label({ text, color }: { text: string; color?: string }) {
  return (
    <p style={{
      fontSize: 11, lineHeight: '16px', letterSpacing: '0.08em',
      textTransform: 'uppercase', color: color ?? FAINT, fontWeight: 600, margin: 0,
    }}>
      {text}
    </p>
  )
}

function ScoreRing({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t0 = performance.now()
    const duration = 700
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

  const glowColor = color === GREEN ? 'rgba(34,197,94,0.18)' : color === YELLOW ? 'rgba(234,179,8,0.18)' : 'rgba(239,68,68,0.18)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={glowColor} strokeWidth={14} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 60ms ease-out' }}
      />
      <text
        x={size/2} y={size/2 + 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={42} fontWeight={700}
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

  const size = 380
  const center = size / 2
  const radius = 130
  const rings = [0.25, 0.5, 0.75, 1]

  const pointFor = (value: number, index: number, total: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
    const r = radius * (value / 100)
    return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r }
  }

  const labelPoint = (index: number, total: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total
    const r = radius * 1.20
    return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r }
  }

  const polygonPath = (model: FitModelScores) => {
    const values = labels.map(l => model[l.key])
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

        {rings.map(ring => {
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
                x={lp.x} y={lp.y} fill={SUBTLE} fontSize="12" fontWeight="500"
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
          return <circle key={item.key} cx={p.x} cy={p.y} r="4" fill={BLUE} />
        })}
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Report not found' : 'Unable to load report')
        return r.json()
      })
      .then(d => { setData(d.data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [shareToken])

  const derived = useMemo(() => {
    if (!data) return null
    const fitScore = Math.round(data.fitPct ?? 0)
    const strengths = topStrengths(data.profile)
    const risks = topRisks(data.profile)
    const mappedScores: Scores = {
      dominance: Number(data.scores.execution),
      extraversion: Number(data.scores.collaboration),
      patience: Number(data.scores.adaptability),
      formality: Number(data.scores.ownership),
    }
    const fitModel = toFitModel(mappedScores)
    const benchmark = toFitBenchmark(data.job.target)
    const roleType = data.job.roleType || data.job.title
    const dimensions: DimensionWithDelta[] = [
      { label: 'Execution',      score: fitModel.execution,     target: benchmark?.execution     ?? null, delta: benchmark ? fitModel.execution     - benchmark.execution     : null },
      { label: 'Ownership',      score: fitModel.ownership,     target: benchmark?.ownership     ?? null, delta: benchmark ? fitModel.ownership     - benchmark.ownership     : null },
      { label: 'Adaptability',   score: fitModel.adaptability,  target: benchmark?.adaptability  ?? null, delta: benchmark ? fitModel.adaptability  - benchmark.adaptability  : null },
      { label: 'Collaboration',  score: fitModel.collaboration, target: benchmark?.collaboration ?? null, delta: benchmark ? fitModel.collaboration - benchmark.collaboration : null },
      { label: 'Decision Speed', score: fitModel.decisionSpeed, target: benchmark?.decisionSpeed ?? null, delta: benchmark ? fitModel.decisionSpeed - benchmark.decisionSpeed : null },
    ]
    return {
      fitScore,
      color: decisionColor(fitScore),
      recommendation: decisionLabel(fitScore),
      strengths,
      risks,
      fitModel,
      benchmark,
      dimensions,
      totalSignals: 80,
      verdict: generateVerdict(data.name, roleType, dimensions),
      primaryRisk: generatePrimaryRisk(risks, dimensions),
      pointOfView: generatePointOfView(data.name, roleType, risks, dimensions),
      failureMode: generateFailureMode(data.name, risks, dimensions),
      chartInterpretation: generateChartInterpretation(dimensions),
      decisionFrame: generateDecisionFrame(strengths, risks, roleType),
      managementGuide: generateManagementGuide(dimensions),
      probes: generateProbes(risks, dimensions),
    }
  }, [data])

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG, gap: 16 }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 14, color: SUBTLE, margin: 0 }}>Loading report...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !data || !derived) {
    return (
      <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: BG, color: TEXT, padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: '0 0 8px', fontWeight: 700 }}>Report not found</h1>
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
          .rpt-surface { background: #f9fafb !important; border-color: #e5e7eb !important; }
          svg text { fill: #6b7280 !important; }
          @page { margin: 0.5in; size: letter; }
          .rpt-two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .rpt-call-grid { grid-template-columns: 1fr !important; }
          .rpt-two-col { grid-template-columns: 1fr !important; }
          .rpt-main-grid { grid-template-columns: 1fr !important; }
          .rpt-decision-col { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 20px !important; }
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
            color: SUBTLE, fontSize: 13, cursor: 'pointer',
          }}
        >
          Print
        </button>
      </nav>

      <main className="report-root" style={{
        minHeight: '100svh', background: BG, color: TEXT,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      }}>
        <div style={{ maxWidth: 'min(960px, calc(100vw - clamp(40px, 8vw, 160px)))', margin: '0 auto', padding: 'clamp(40px, 6vh, 64px) clamp(16px, 4vw, 24px) clamp(60px, 8vh, 96px)' }}>

          {/* ── Header ──────────────────────────────────────── */}
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: FAINT, fontWeight: 600 }}>
              Candidate Recommendation Report
            </p>
            <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.03em', fontWeight: 700 }}>
              {c.name}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: SUBTLE }}>
              {c.job.title} · {c.job.client} · {formatDate(c.completedAt)}
            </p>
          </header>

          {/* ── 1. THE CALL ──────────────────────────────────── */}
          <section className="rpt-call-grid" style={{
            ...surf,
            display: 'grid',
            gridTemplateColumns: '180px minmax(0, 1fr)',
            gap: 40,
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            marginBottom: 24,
          }}>
            {/* Score column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
              <Label text="Fit Score" />
              <ScoreRing score={derived.fitScore} color={derived.color} size={140} />
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: derived.color, letterSpacing: '-0.02em' }}>
                  {derived.recommendation}
                </p>
                {c.profileName && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${DIVIDER}` }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{c.profileName}</p>
                    {c.profile?.tagline && (
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: SUBTLE, fontStyle: 'italic', lineHeight: 1.5 }}>
                        {c.profile.tagline}
                      </p>
                    )}
                  </div>
                )}
                {c.rushed && (
                  <div style={{ marginTop: 10, padding: '7px 10px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 6 }}>
                    <p style={{ margin: 0, fontSize: 11, color: YELLOW, lineHeight: 1.5 }}>
                      Completed quickly — treat as directional.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Decision column */}
            <div className="rpt-decision-col" style={{ borderLeft: `1px solid ${DIVIDER}`, paddingLeft: 'clamp(20px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Verdict */}
              <div>
                <Label text="Verdict" />
                <p style={{ margin: '10px 0 0', fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em', fontStyle: 'italic', color: TEXT }}>
                  {derived.verdict}
                </p>
              </div>

              {/* Primary Risk */}
              <div style={{
                padding: '14px 18px',
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: RED }}>
                  ⚠ Primary Risk
                </p>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 600 }}>{derived.primaryRisk.signal}</span>
                  {' '}→ {derived.primaryRisk.consequence}
                </p>
              </div>

              {/* Hire frame */}
              <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 16, display: 'grid', gap: 8 }}>
                {[
                  { label: 'HIRE IF', color: GREEN, text: derived.decisionFrame.hireIf },
                  { label: 'DO NOT HIRE IF', color: RED, text: derived.decisionFrame.doNotHireIf },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: row.color, letterSpacing: '0.08em', whiteSpace: 'nowrap', marginTop: 2, minWidth: 96 }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 }}>
                      {row.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trust meta */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[`Based on ${derived.totalSignals} behavioral signals`, 'Role benchmark active'].map((item, i) => (
                  <span key={item} style={{ fontSize: 11, color: FAINT }}>
                    {i > 0 && <span style={{ margin: '0 6px', color: DIVIDER }}>·</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── 2. POINT OF VIEW ────────────────────────────── */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Point of View" />
            <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.75, color: 'rgba(255,255,255,0.85)', maxWidth: 720, fontStyle: 'italic' }}>
              {derived.pointOfView}
            </p>
          </section>

          {/* ── 3. WHY THIS WORKS / WHERE THIS BREAKS ────────── */}
          <section className="rpt-two-col" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24,
          }}>
            <div style={surf}>
              <Label text="Why This Works" color={GREEN} />
              <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                {derived.strengths.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 8 }} />
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={surf}>
              <Label text="Where This Breaks" color={RED} />
              <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                {derived.risks.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 8 }} />
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 4. LIKELY FAILURE MODE ───────────────────────── */}
          <section style={{
            ...surf,
            marginBottom: 24,
            borderColor: 'rgba(239,68,68,0.15)',
            background: 'rgba(239,68,68,0.04)',
          }}>
            <Label text="Likely Failure Mode" color={RED} />
            <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.8)', maxWidth: 720 }}>
              {derived.failureMode}
            </p>
          </section>

          {/* ── 5. FIT MODEL + BENCHMARK SUMMARY ────────────── */}
          <section className="rpt-main-grid" style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(240px, 0.7fr)',
            gap: 24, marginBottom: 24,
          }}>
            <div style={surf}>
              <Label text="Fit Model" />
              <FitModelViz scores={derived.fitModel} benchmark={derived.benchmark} />
              {/* Chart interpretation */}
              <p style={{
                margin: '12px 0 0', fontSize: 13, lineHeight: 1.6,
                color: SUBTLE, textAlign: 'center',
              }}>
                {derived.chartInterpretation}
              </p>
              {derived.benchmark && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: FAINT, textAlign: 'center' }}>
                  Solid — candidate · Dashed — benchmark
                </p>
              )}
            </div>

            <div style={surf}>
              <Label text="Benchmark Summary" />
              <div style={{ marginTop: 20, display: 'grid', gap: 0 }}>
                {derived.dimensions.map(dim => {
                  const dc = dim.delta == null ? SUBTLE : dim.delta > 0 ? GREEN : dim.delta < 0 ? RED : SUBTLE
                  return (
                    <div key={dim.label} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${DIVIDER}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{dim.label}</span>
                        <span style={{ fontSize: 17, fontWeight: 700 }}>{dim.score}</span>
                        <span style={{ fontSize: 12, color: dc, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {dim.delta == null ? '—' : `${dim.delta > 0 ? '+' : ''}${dim.delta}`}
                        </span>
                      </div>
                      {dim.target != null && (
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: FAINT }}>
                          Benchmark {dim.target}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── 6. DIMENSIONAL FIT ──────────────────────────── */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Dimensional Fit" />
            <div style={{
              marginTop: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 0,
            }}>
              {derived.dimensions.map((dim, i) => {
                const { delta } = dim
                if (delta == null) return null
                const dc = delta > 2 ? GREEN : delta < -2 ? RED : SUBTLE
                return (
                  <div key={dim.label} style={{
                    padding: '14px 0',
                    borderTop: i > 0 ? `1px solid ${DIVIDER}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{dim.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: dc }}>{delta > 0 ? `+${delta}` : delta}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: SUBTLE }}>
                      {generateDimensionalBehavior(dim)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── 7. TEAM DYNAMIC ──────────────────────────────── */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Team Dynamic" />
            <p style={{ margin: '12px 0 20px', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', maxWidth: 720 }}>
              {c.name.split(' ')[0]} will naturally push decisions forward and take ownership in group settings.
              In this team, that will:
            </p>
            <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
              <div>
                {(c.teamFit?.worksWellWith?.length ? c.teamFit.worksWellWith : derived.risks.map(() => 'Execution-focused environments where speed is valued')).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: GREEN, fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div>
                {(c.teamFit?.mayClashWith?.length ? c.teamFit.mayClashWith : derived.risks).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: YELLOW, fontSize: 12, marginTop: 2, flexShrink: 0 }}>△</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Works well with / Watch for */}
            {c.teamFit && (
              <div className="rpt-two-col" style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                paddingTop: 16, borderTop: `1px solid ${DIVIDER}`,
              }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: GREEN, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Works well with</p>
                  <p style={{ margin: 0, fontSize: 13, color: SUBTLE, lineHeight: 1.6 }}>
                    {c.teamFit.worksWellWith?.join(', ') || 'Teams that value speed and accountability'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: YELLOW, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Watch for</p>
                  <p style={{ margin: 0, fontSize: 13, color: SUBTLE, lineHeight: 1.6 }}>
                    {c.teamFit.hmNote || 'Managers or teams that expect consensus before action'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ── 8. HOW TO MANAGE THIS HIRE ───────────────────── */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="How to Manage This Hire" />
            <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
              {derived.managementGuide.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: BLUE,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.8)' }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 9. INTERVIEW PROBES ──────────────────────────── */}
          <section style={{ ...surf, marginBottom: 24 }}>
            <Label text="Interview Probes" />
            <div style={{ marginTop: 20 }}>
              {derived.probes.map((probe, i) => (
                <div key={i} style={{
                  paddingBottom: 20,
                  marginBottom: 20,
                  borderBottom: i < derived.probes.length - 1 ? `1px solid ${DIVIDER}` : 'none',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 600, color: RED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {probe.riskLabel}
                  </p>
                  <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 500, lineHeight: 1.65 }}>
                    {probe.question}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, fontStyle: 'italic' }}>
                    Good answer: {probe.goodAnswer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ───────────────────────────────────────── */}
          <footer style={{ paddingTop: 24, borderTop: `1px solid ${DIVIDER}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 10, alignItems: 'center' }}>
              {[
                `Report ID: ${c.resultId?.slice(0, 8) || '—'}`,
                `Archetype: ${c.profileName || '—'}`,
                `Assessment completed ${formatDate(c.completedAt)}`,
              ].map((item, i) => (
                <span key={item} style={{ fontSize: 11, color: SUBTLE }}>
                  {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: FAINT, maxWidth: 720 }}>
              Prepared by {PRODUCT_NAME} · {COMPANY_URL}. Intended for use alongside structured interviews and reference checks. Assessment results are one input, not a hiring decision.
            </p>
          </footer>

        </div>
      </main>
    </>
  )
}
