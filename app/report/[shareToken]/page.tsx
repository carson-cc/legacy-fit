'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { PRODUCT_NAME, COMPANY_URL } from '@/lib/brand'

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Target {
  dominance: number; extraversion: number; patience: number; formality: number
}

interface ApiScores {
  execution: number; collaboration: number; adaptability: number; ownership: number
}

interface Profile {
  name: string; tagline: string; group: string; groupLabel: string; description: string
  strengths: string[]; traps: string[]; bestRoles: string[]
}

interface InterviewQuestion {
  dimension: string; direction: string; gap: number; questions: string[]
}

interface TeamFit {
  worksWellWith: string[]; mayClashWith: string[]; teamGap: string
  hmMatch: 'good' | 'caution' | null; hmNote: string | null
}

interface ServerDimension {
  label: string; score: number; benchmark: number | null; delta: number | null
}

interface ReportData {
  name: string; completedAt: string
  job: { title: string; roleType: string; client: string; target: Target | null }
  scores: ApiScores; list1Scores: ApiScores
  percentiles: Record<string, number>
  profileName: string; profileGroup: string
  profile: Profile; secondaryProfile: Profile | null
  adaptationStress: number; hasBenchmark: boolean
  dimensions: ServerDimension[]
  fitPct: number | null; rushed: boolean
  interviewGuide: InterviewQuestion[]
  list1Count: number; list2Count: number; resultId: string
  teamFit?: TeamFit; confidence?: string | null; percentile?: string | null
  benchmarkComparison?: string; rationale?: string; recommendation?: string | null
  trustMeta?: string[]
}

type FitModelScores = {
  execution: number; ownership: number; adaptability: number
  collaboration: number; decisionSpeed: number
}

interface DimensionWithDelta {
  label: string; score: number; target: number | null; delta: number | null
}

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BG        = '#080808'
const SURFACE   = '#0f0f0f'
const SURFACE2  = '#0c0c0c'
const DIV       = 'rgba(255,255,255,0.07)'
const TEXT      = '#eeece6'
const SUB       = 'rgba(238,236,230,0.42)'
const FAINT     = 'rgba(238,236,230,0.18)'
const BLUE      = '#2563EB'
const GREEN     = '#3aa868'
const AMBER     = '#c8a832'
const RED       = '#e05a3a'
const FONT      = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
const CONDENSED = '"Barlow Condensed", "Arial Narrow", sans-serif'

// ── Formatters ────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function decisionColor(pct: number | null): string {
  if (pct === null) return 'rgba(238,236,230,0.3)'
  if (pct >= 85) return GREEN
  if (pct >= 70) return AMBER
  if (pct >= 55) return AMBER
  return RED
}

function decisionLabel(pct: number | null): string {
  if (pct === null) return 'Profile Only'
  if (pct >= 85) return 'Strong Fit'
  if (pct >= 70) return 'Explore Further'
  if (pct >= 55) return 'Needs Discussion'
  return 'Low Fit'
}

// ── Generator functions ───────────────────────────────────────────────────────

function generatePrimaryTension(
  dimensions: DimensionWithDelta[],
): { title: string; insight: string } | null {
  const withDelta = dimensions.filter(d => d.delta !== null)
  if (!withDelta.length) return null
  const sorted = [...withDelta].sort((a, b) => (b.delta! - a.delta!))
  const strongest = sorted[0]
  const weakest   = sorted[sorted.length - 1]
  if (!strongest || !weakest) return null
  if (weakest.delta! >= 0) {
    return {
      title: `${strongest.label} is the dominant signal`,
      insight: `All five dimensions meet or exceed the role benchmark. ${strongest.label} is the primary advantage at +${strongest.delta} — no structural gaps to probe.`,
    }
  }
  return {
    title: `${strongest.label} vs. ${weakest.label}`,
    insight: `The core tension: +${strongest.delta} on ${strongest.label} against ${weakest.delta} on ${weakest.label}. Probe whether the pace advantage creates friction in cross-functional environments — that's where this profile breaks.`,
  }
}

function generateThreeStats(dimensions: DimensionWithDelta[]): Array<{ label: string; value: string; color: string }> {
  const withDelta = dimensions.filter(d => d.delta !== null)
  if (!withDelta.length) return []
  const above    = withDelta.filter(d => d.delta! > 0).length
  const sorted   = [...withDelta].sort((a, b) => (b.delta! - a.delta!))
  const strongest = sorted[0]
  const weakest   = sorted[sorted.length - 1]
  const stats: Array<{ label: string; value: string; color: string }> = [
    {
      label: 'Dimensions above',
      value: `${above} / ${withDelta.length}`,
      color: above >= 4 ? GREEN : above >= 3 ? AMBER : RED,
    },
    {
      label: 'Largest advantage',
      value: strongest ? `+${strongest.delta} ${strongest.label.split(' ')[0]}` : '—',
      color: BLUE,
    },
  ]
  if (weakest && weakest.delta! < 0) {
    stats.push({ label: 'Only shortfall', value: `${weakest.label} ${weakest.delta}`, color: AMBER })
  } else if (weakest) {
    stats.push({ label: 'Lowest delta', value: `${weakest.label} +${weakest.delta}`, color: SUB })
  }
  return stats
}

function generateSignalNote(dim: DimensionWithDelta): { tension: boolean; strong: boolean; note: string } {
  const delta = dim.delta
  if (delta === null) return { tension: false, strong: false, note: 'No benchmark set — directional profile only.' }
  const tension = delta < 0
  const strong  = delta >= 15
  const notes: Record<string, [string, string, string]> = {
    'Decision Speed': [
      'Well above benchmark. Moves faster than the role requires. Asset in field environments — friction anywhere that runs on consensus.',
      'Below benchmark. Deliberate decision pace. Confirm this won\'t slow execution in contexts where pace is a success factor.',
      'Meets benchmark. Decision pace is aligned to role expectations.',
    ],
    'Execution': [
      'Well above benchmark. Field leadership pattern — moves forward without waiting for alignment.',
      'Below benchmark. Execution style is collaborative; may rely on team input before acting. Probe accountability ownership.',
      'Meets benchmark. Consistent execution within expected range for this role.',
    ],
    'Ownership': [
      'Well above benchmark. Takes accountability without being asked; high-autonomy orientation.',
      'Below benchmark. Prefers shared accountability; works best with clearly defined scope. Monitor in high-stakes roles.',
      'Meets benchmark. Takes ownership when clearly assigned — reliable within defined lanes.',
    ],
    'Adaptability': [
      'Well above benchmark. Handles scope shifts and ambiguity without losing execution edge.',
      'Below benchmark. Prefers structured environments; may resist sudden direction changes.',
      'Meets benchmark. Adequate flexibility for the volatility this role typically encounters.',
    ],
    'Collaboration': [
      'Well above benchmark. High orientation toward team input; builds alignment before acting.',
      'Below benchmark. May deprioritize alignment in favor of progress. Probe cross-functional and consensus-dependent contexts.',
      'Meets benchmark. Collaborates effectively when structure is in place.',
    ],
  }
  const n = notes[dim.label]
  if (!n) return { tension, strong, note: `Delta: ${delta > 0 ? '+' : ''}${delta} vs benchmark.` }
  return { tension, strong, note: delta < -2 ? n[1] : delta >= 15 ? n[0] : n[2] }
}

function topStrengths(profile: Profile): string[] { return (profile.strengths || []).slice(0, 3) }
function topRisks(profile: Profile): string[]     { return (profile.traps    || []).slice(0, 3) }

function generateVerdict(name: string, roleTitle: string, dimensions: DimensionWithDelta[]): string {
  const first = name.split(' ')[0]
  const role  = roleTitle.toLowerCase()
  const highSpeed     = (dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0) > 5
  const highOwnership = (dimensions.find(d => d.label === 'Ownership')?.delta ?? 0) > 5
  const descriptor = highSpeed && highOwnership ? 'execution-forward'
    : highOwnership ? 'ownership-first'
    : highSpeed     ? 'fast-moving'
    : 'results-oriented'
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
  dimensions: DimensionWithDelta[],
): { signal: string; consequence: string } {
  const speedDelta  = dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0
  const collabDelta = dimensions.find(d => d.label === 'Collaboration')?.delta  ?? 0
  const topRisk     = (risks[0] || '').toLowerCase()
  if (speedDelta > 5 || topRisk.includes('fast') || topRisk.includes('align')) {
    return { signal: 'Moves faster than stakeholder alignment', consequence: 'risk of missed input and execution friction' }
  }
  if (collabDelta < -2 || topRisk.includes('collab') || topRisk.includes('process')) {
    return { signal: 'Deprioritizes alignment in favor of progress', consequence: 'risk of friction in consensus-driven environments' }
  }
  return {
    signal: risks[0] || 'May underweight process and alignment',
    consequence: 'monitor in environments requiring structured collaboration',
  }
}

function generateDecisionFrame(
  strengths: string[],
  risks: string[],
  roleTitle: string,
): { hireIf: string; doNotHireIf: string } {
  const topStrength = (strengths[0] || '').toLowerCase()
  const topRisk     = (risks[0]    || '').toLowerCase()
  const isExecution = topStrength.includes('ownership') || topStrength.includes('decision')
  const isProcess   = topRisk.includes('process') || topRisk.includes('alignment')
  return {
    hireIf: isExecution
      ? `The ${roleTitle.toLowerCase()} role requires independent execution and fast decisions without waiting for team consensus.`
      : `The role demands clear ownership and forward momentum with minimal process overhead.`,
    doNotHireIf: isProcess
      ? `Success depends on consensus-driven decisions, process rigor, or cross-functional alignment before acting.`
      : `The environment requires heavy documentation, structured approval chains, or collaborative decision-making before execution.`,
  }
}

function generateManagementGuide(dimensions: DimensionWithDelta[]): string[] {
  const highSpeed = (dimensions.find(d => d.label === 'Decision Speed')?.delta ?? 0) > 5
  const lowCollab = (dimensions.find(d => d.label === 'Collaboration')?.delta  ?? 0) < -2
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

function generateProbes(
  risks: string[],
  dimensions: DimensionWithDelta[],
): Array<{ riskLabel: string; question: string; goodAnswer: string; critical?: boolean; tests?: string }> {
  const highSpeedDelta = dimensions.find(d => d.label === 'Decision Speed' && (d.delta ?? 0) > 15)
  const lowCollab      = dimensions.find(d => d.label === 'Collaboration'  && (d.delta ?? 0) < 0)
  const probes: Array<{ riskLabel: string; question: string; goodAnswer: string; critical?: boolean; tests?: string }> = []

  if (highSpeedDelta) {
    probes.push({
      riskLabel: `Decision Speed +${highSpeedDelta.delta} vs benchmark`,
      tests: 'Decision Speed',
      critical: true,
      question: 'Walk me through a high-stakes decision you made with incomplete information. What was the pressure and how did you move?',
      goodAnswer: 'Confirms it\'s judgment-driven, not reckless. Shows awareness of pace creating friction and demonstrates course-correction ability.',
    })
  }
  if (lowCollab) {
    probes.push({
      riskLabel: 'Collaboration below benchmark',
      tests: 'Collaboration',
      critical: true,
      question: 'Describe a time you drove a stalled project forward where cross-team buy-in was required — specifically what you did when people weren\'t moving.',
      goodAnswer: 'Shows genuine adaptability rather than frustration; can distinguish when alignment is necessary vs. when it slows things down.',
    })
  }
  let riskIdx = 0
  while (probes.length < 3 && riskIdx < risks.length) {
    const risk = risks[riskIdx]
    probes.push({
      riskLabel: probes.length === 0 ? 'Primary Risk' : `Risk ${probes.length + 1}`,
      tests: 'Ownership',
      question: `Walk me through a situation where ${risk.charAt(0).toLowerCase() + risk.slice(1)}. How did it play out?`,
      goodAnswer: 'Shows self-awareness of the pattern and can describe a specific mitigation or recovery.',
    })
    riskIdx++
  }
  return probes.slice(0, 3)
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function Label({ text, color }: { text: string; color?: string }) {
  return (
    <p style={{
      fontSize: 10, lineHeight: '16px', letterSpacing: '0.1em',
      textTransform: 'uppercase', color: color ?? FAINT, fontWeight: 700, margin: 0,
    }}>{text}</p>
  )
}

function ActTag({ n, title }: { n: number; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: CONDENSED }}>
        Act {n}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {title}
      </span>
    </div>
  )
}

function ActBreak() {
  return (
    <div style={{ position: 'relative', margin: '56px 0' }}>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />
    </div>
  )
}

function DotRow({ filled, total = 5, color }: { filled: number; total?: number; color: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
          background: i < filled ? color : 'transparent',
          border: `1.5px solid ${i < filled ? color : 'rgba(255,255,255,0.16)'}`,
          opacity: i < filled ? 0.85 : 1,
        }} />
      ))}
    </span>
  )
}

function ScoreRing({ score, color, size = 148 }: { score: number; color: string; size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r    = size / 2 - 8
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t0 = performance.now(), dur = 1100
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setDisplayed(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const numSize = Math.round(size * 0.32)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Fit score ${score}`}>
      <circle cx={size/2} cy={size/2} r={r + 4} fill="none" stroke={color + '08'} strokeWidth={14}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color + '18'} strokeWidth={10}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 55ms linear' }}
      />
      <text x={size/2} y={size/2 + 2} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={numSize} fontWeight={900} fontFamily={CONDENSED}
        style={{ fontVariantNumeric: 'tabular-nums' }}>{displayed}</text>
    </svg>
  )
}

// Interactive pentagon
function FitModelViz({
  scores, benchmark, hoveredDim, onHoverDim,
}: {
  scores: FitModelScores
  benchmark: FitModelScores | null
  hoveredDim: string | null
  onHoverDim: (dim: string | null) => void
}) {
  const LABELS = [
    { key: 'execution'    as const, label: 'Execution' },
    { key: 'ownership'    as const, label: 'Ownership' },
    { key: 'adaptability' as const, label: 'Adaptability' },
    { key: 'collaboration'as const, label: 'Collaboration' },
    { key: 'decisionSpeed'as const, label: 'Decision Speed' },
  ]
  const cx = 190, cy = 155, rad = 108
  const ang = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i) / 5
  const pt  = (val: number, i: number) => {
    const a = ang(i), r = rad * (val / 100)
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  }
  const lp = (i: number) => {
    const a = ang(i), r = rad * 1.24
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
  }
  const polyPath = (m: FitModelScores) =>
    LABELS.map(({ key }, i) => {
      const p = pt(m[key], i)
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    }).join(' ') + ' Z'

  return (
    <svg width="100%" overflow="visible"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      viewBox="0 0 380 310" aria-label="Fit radar chart">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <path key={f} d={
          LABELS.map((_, i) => { const p = pt(100 * f, i); return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}` }).join(' ') + ' Z'
        } fill="none" stroke={f === 1 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.035)'} strokeWidth={f === 1 ? 1 : 0.75} />
      ))}
      {/* Axis lines */}
      {LABELS.map(({ key }, i) => {
        const e = pt(100, i)
        const isHov = hoveredDim === LABELS[i].label
        return (
          <line key={key} x1={cx} y1={cy} x2={e.x} y2={e.y}
            stroke={isHov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'}
            strokeWidth={isHov ? 1.5 : 0.75}
            style={{ transition: 'stroke 150ms ease, stroke-width 150ms ease' }} />
        )
      })}
      {/* Benchmark polygon */}
      {benchmark && (
        <path d={polyPath(benchmark)}
          fill="rgba(255,255,255,0.015)"
          stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="5 4" />
      )}
      {/* Candidate polygon */}
      <path d={polyPath(scores)}
        fill={`rgba(37,99,235,${hoveredDim ? 0.07 : 0.11})`}
        stroke={BLUE} strokeWidth="2"
        style={{ transition: 'fill 200ms ease' }} />
      {/* Vertices + labels */}
      {LABELS.map(({ key, label }, i) => {
        const v   = pt(scores[key], i)
        const l   = lp(i)
        const isHov  = hoveredDim === label
        const anyHov = hoveredDim !== null
        const bVal   = benchmark ? benchmark[key] : null
        const delta  = bVal !== null ? scores[key] - bVal : null
        const dSign  = delta !== null ? (delta >= 0 ? '+' : '') : ''
        const dColor = delta !== null ? (delta < 0 ? AMBER : delta >= 15 ? GREEN : 'rgba(58,168,104,0.85)') : FAINT
        return (
          <g key={key} style={{ cursor: 'default' }}
            onMouseEnter={() => onHoverDim(label)}
            onMouseLeave={() => onHoverDim(null)}>
            <circle cx={v.x} cy={v.y} r={20} fill="transparent" />
            {isHov && <circle cx={v.x} cy={v.y} r={10} fill={BLUE + '20'} />}
            <circle cx={v.x} cy={v.y}
              r={isHov ? 6 : 4}
              fill={isHov ? TEXT : BLUE}
              opacity={anyHov && !isHov ? 0.25 : 1}
              style={{ transition: 'r 180ms ease, opacity 180ms ease, fill 180ms ease' }} />
            {isHov && delta !== null && (
              <>
                <text x={v.x} y={v.y - 16} textAnchor="middle" dominantBaseline="middle"
                  fill={TEXT} fontSize="12" fontWeight="800" fontFamily={CONDENSED} opacity={0.95}>
                  {scores[key]}
                </text>
                <text x={v.x} y={v.y - 29} textAnchor="middle" dominantBaseline="middle"
                  fill={dColor} fontSize="10" fontWeight="700" fontFamily={CONDENSED} opacity={0.9}>
                  {dSign}{Math.round(delta)}
                </text>
              </>
            )}
            <text x={l.x} y={l.y}
              fill={isHov ? TEXT : anyHov ? 'rgba(238,236,230,0.18)' : 'rgba(238,236,230,0.5)'}
              fontSize={isHov ? '12.5' : '11.5'} fontWeight={isHov ? '700' : '400'} fontFamily={FONT}
              textAnchor={l.x < cx - 8 ? 'end' : l.x > cx + 8 ? 'start' : 'middle'}
              dominantBaseline={l.y < cy - 8 ? 'auto' : l.y > cy + 8 ? 'hanging' : 'middle'}
              style={{ transition: 'fill 150ms ease' }}>
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Interactive dimension bar
function DimBar({ dim, isHovered, anyHovered, onHover }: {
  dim: DimensionWithDelta
  isHovered: boolean
  anyHovered: boolean
  onHover: (label: string | null) => void
}) {
  const { delta } = dim
  const isTension = delta !== null && delta < 0
  const isStrong  = delta !== null && delta >= 15
  const dc = isTension ? AMBER : isStrong ? GREEN : 'rgba(58,168,104,0.65)'
  const dimmed = anyHovered && !isHovered
  const signal = generateSignalNote(dim)

  return (
    <div
      onMouseEnter={() => onHover(dim.label)}
      onMouseLeave={() => onHover(null)}
      style={{
        padding: '8px 10px', margin: '0 -10px', borderRadius: 7,
        background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderLeft: isHovered ? `2px solid ${isTension ? AMBER : BLUE}40` : '2px solid transparent',
        opacity: dimmed ? 0.3 : 1,
        transition: 'background 150ms ease, opacity 150ms ease, border-color 150ms ease',
        cursor: 'default',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{
          fontSize: isTension ? 13.5 : 13,
          fontWeight: isTension ? 700 : isHovered ? 600 : 500,
          color: isTension ? AMBER : isHovered ? TEXT : 'rgba(238,236,230,0.6)',
          letterSpacing: '-0.01em', transition: 'color 150ms ease',
        }}>{dim.label}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', fontFamily: CONDENSED }}>
            {dim.score}
          </span>
          {delta !== null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: dc, minWidth: 30, fontFamily: CONDENSED, transition: 'color 200ms ease' }}>
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${dim.score}%`, borderRadius: 2,
          background: isTension
            ? `linear-gradient(90deg, ${AMBER}90, ${AMBER})`
            : `linear-gradient(90deg, ${BLUE}90, ${BLUE})`,
        }}/>
        {dim.target !== null && (
          <div style={{
            position: 'absolute', top: -4, width: 1.5, height: 11,
            left: `${dim.target}%`, background: 'rgba(255,255,255,0.4)', borderRadius: 1,
          }}/>
        )}
      </div>
      {isHovered && (
        <p style={{ margin: '9px 0 2px', fontSize: 12, color: SUB, lineHeight: 1.6, animation: 'fadeSlideUp 160ms ease forwards' }}>
          {signal.note}
        </p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SharedReportPage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [data,       setData]       = useState<ReportData | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [hoveredDim, setHoveredDim] = useState<string | null>(null)
  const [hoveredTeam,setHoveredTeam]= useState<string | null>(null)
  const [hoveredQ,   setHoveredQ]   = useState<number | null>(null)

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

    const fitScore  = data.fitPct
    const strengths = topStrengths(data.profile)
    const risks     = topRisks(data.profile)

    const dimensions: DimensionWithDelta[] = (data.dimensions ?? []).map(d => ({
      label: d.label, score: d.score, target: d.benchmark, delta: d.delta,
    }))

    const fitModel: FitModelScores = {
      execution:     dimensions.find(d => d.label === 'Execution')?.score     ?? 0,
      ownership:     dimensions.find(d => d.label === 'Ownership')?.score     ?? 0,
      adaptability:  dimensions.find(d => d.label === 'Adaptability')?.score  ?? 0,
      collaboration: dimensions.find(d => d.label === 'Collaboration')?.score ?? 0,
      decisionSpeed: dimensions.find(d => d.label === 'Decision Speed')?.score ?? 0,
    }

    const benchmarkDims = data.hasBenchmark && dimensions.every(d => d.target !== null) ? {
      execution:     dimensions.find(d => d.label === 'Execution')?.target     ?? 0,
      ownership:     dimensions.find(d => d.label === 'Ownership')?.target     ?? 0,
      adaptability:  dimensions.find(d => d.label === 'Adaptability')?.target  ?? 0,
      collaboration: dimensions.find(d => d.label === 'Collaboration')?.target ?? 0,
      decisionSpeed: dimensions.find(d => d.label === 'Decision Speed')?.target ?? 0,
    } as FitModelScores : null

    const roleType = data.job.roleType || data.job.title

    return {
      fitScore,
      color:          decisionColor(fitScore),
      recommendation: decisionLabel(fitScore),
      strengths, risks, fitModel,
      benchmark:      benchmarkDims,
      dimensions,
      totalSignals: 80,
      primaryTension:  generatePrimaryTension(dimensions),
      threeStats:      generateThreeStats(dimensions),
      verdict:         generateVerdict(data.name, roleType, dimensions),
      primaryRisk:     generatePrimaryRisk(risks, dimensions),
      decisionFrame:   generateDecisionFrame(strengths, risks, roleType),
      managementGuide: generateManagementGuide(dimensions),
      probes:          generateProbes(risks, dimensions),
    }
  }, [data])

  // Effective hover: dims > team row > question row
  const effectiveDim: string | null = (() => {
    if (hoveredDim) return hoveredDim
    if (hoveredTeam && data?.teamFit?.worksWellWith) return null // no dim to highlight for generic teamFit
    if (hoveredQ !== null && derived?.probes[hoveredQ]) return null
    return null
  })()

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG, gap: 16 }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ fontSize: 14, color: SUB, margin: 0, fontFamily: FONT }}>Loading report...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !data || !derived) {
    return (
      <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: BG, color: TEXT, padding: 24, fontFamily: FONT }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: '0 0 8px', fontWeight: 700 }}>Report not found</h1>
          <p style={{ margin: 0, color: SUB, fontSize: 16, lineHeight: 1.6 }}>
            This link may be invalid or expired. Please request a new report link.
          </p>
        </div>
      </div>
    )
  }

  const c = data

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media print {
          body { background:#fff !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          .rpt-nav { display:none !important; }
        }
        @media (max-width:900px) {
          .rpt-hero-grid  { grid-template-columns:1fr !important; }
          .rpt-two-col    { grid-template-columns:1fr !important; }
          .rpt-proof-grid { grid-template-columns:1fr !important; }
          .rpt-hero-grid > div:last-child  { border-left:none !important; padding-left:0 !important; border-top:1px solid rgba(255,255,255,0.07); padding-top:28px !important; }
        }
        @media (max-width:500px) {
          .rpt-nav-right { display:none !important; }
          .rpt-nav { padding:0 16px !important; }
        }
        .team-row { border-radius:8px; transition:background 150ms ease; }
        .team-row:hover { background:rgba(255,255,255,0.025) !important; }
        .q-row { transition:background 150ms ease, border-color 150ms ease; }
      `}</style>

      {/* Document rail */}
      <div className="rpt-nav" style={{
        height: 38, padding: '0 28px', background: BG,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, fontFamily: FONT }}>
            {PRODUCT_NAME}
          </span>
          <span style={{ width: 1, height: 13, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, fontFamily: FONT }}>
            Candidate Recommendation Report
          </span>
        </div>
        <div className="rpt-nav-right" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', fontFamily: FONT }}>
            {c.job.client} · {formatDate(c.completedAt)}
          </span>
          <button onClick={() => window.print()} style={{
            height: 26, padding: '0 12px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', fontFamily: FONT,
          }}>Print</button>
        </div>
      </div>

      <main style={{ minHeight: '100svh', background: BG, color: TEXT, fontFamily: FONT }}>
        <div style={{
          maxWidth: 'min(980px, calc(100vw - clamp(40px, 8vw, 160px)))',
          margin: '0 auto',
          padding: 'clamp(48px, 7vh, 72px) clamp(16px, 3vw, 24px) clamp(72px, 10vh, 112px)',
        }}>

          {/* ── Report identity header ─────────────────────────────────────── */}
          <header style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{
              margin: '0 0 20px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(238,236,230,0.18)', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
              Candidate Recommendation Report
              <span style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
            </p>
            <h1 style={{
              margin: '0 0 10px', fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.0,
              letterSpacing: '-0.035em', fontWeight: 800, color: TEXT, fontFamily: CONDENSED,
            }}>
              {c.name}
            </h1>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: 'rgba(238,236,230,0.32)', letterSpacing: '0.01em' }}>
              {c.job.title} · {c.job.client}
            </p>
            {c.hasBenchmark && derived.fitScore !== null && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                background: `${derived.color}0d`, border: `1px solid ${derived.color}2e`,
                borderRadius: 100, padding: '8px 20px', marginBottom: 16,
              }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: derived.color, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: CONDENSED }}>
                  {derived.recommendation}
                </span>
                <span style={{ width: 1, height: 14, background: `${derived.color}40` }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: derived.color, fontFamily: CONDENSED }}>{derived.fitScore}</span>
              </div>
            )}
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.04em' }}>
              Assessment completed {formatDate(c.completedAt)} · Report ID {c.resultId?.slice(0, 8) || '—'}
            </p>
          </header>

          {/* ══════════════════════════════════════════════════════════════════
              ACT 1 — VERDICT
          ══════════════════════════════════════════════════════════════════ */}
          <section aria-label="Verdict">
            <ActTag n={1} title="Verdict" />

            <div style={{
              background: SURFACE, border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 'clamp(28px, 4vw, 44px)',
            }}>
              <div className="rpt-hero-grid" style={{
                display: 'grid', gridTemplateColumns: '160px minmax(0,1fr)',
                gap: 'clamp(28px, 5vw, 52px)', alignItems: 'start',
              }}>
                {/* Score + verdict column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                  <div>
                    <Label text={c.hasBenchmark ? 'Fit Score' : 'Profile'} />
                    <div style={{ marginTop: 12 }}>
                      {c.hasBenchmark && derived.fitScore !== null ? (
                        <ScoreRing score={derived.fitScore} color={derived.color} size={148} />
                      ) : (
                        <div style={{
                          width: 148, height: 148, borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.10)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={FAINT} strokeWidth="1.5" strokeLinecap="round">
                            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                            <path d="M12 12h.01"/>
                          </svg>
                          <span style={{ fontSize: 11, color: FAINT, textAlign: 'center', lineHeight: 1.4, maxWidth: 90 }}>No benchmark set</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 26, fontWeight: 900, color: derived.color, lineHeight: 1.0, fontFamily: CONDENSED, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {derived.recommendation}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                      {c.confidence ? `Decision confidence: ${c.confidence}` : 'Profile assessment'}
                    </p>
                  </div>
                  {c.profileName && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 7, padding: '5px 11px',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>{c.profileName}</span>
                      <span style={{ fontSize: 10, color: FAINT, fontStyle: 'italic' }}>archetype</span>
                    </div>
                  )}
                  {c.rushed && (
                    <div style={{ padding: '7px 10px', background: `${AMBER}0d`, border: `1px solid ${AMBER}40`, borderRadius: 6 }}>
                      <p style={{ margin: 0, fontSize: 11, color: AMBER, lineHeight: 1.5 }}>
                        Completed quickly — treat as directional.
                      </p>
                    </div>
                  )}
                </div>

                {/* Decision detail column */}
                <div style={{ borderLeft: `1px solid ${DIV}`, paddingLeft: 'clamp(24px, 4vw, 44px)', display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* Primary tension block */}
                  {derived.primaryTension ? (
                    <div style={{
                      borderLeft: `3px solid ${AMBER}`,
                      background: `${AMBER}06`, borderRadius: '0 10px 10px 0', padding: '20px 24px',
                    }}>
                      <p style={{ margin: '0 0 7px', fontSize: 10, fontWeight: 700, color: `${AMBER}88`, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                        Primary Tension
                      </p>
                      <p style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
                        {derived.primaryTension.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 14, color: SUB, lineHeight: 1.7 }}>
                        {derived.primaryTension.insight}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label text="Recommendation" />
                      <p style={{ margin: '11px 0 0', fontSize: 15, lineHeight: 1.75, color: SUB, maxWidth: 560 }}>
                        {derived.verdict}
                      </p>
                    </div>
                  )}

                  {/* Recommendation text */}
                  {derived.primaryTension && (
                    <div>
                      <Label text="Recommendation" />
                      <p style={{ margin: '11px 0 0', fontSize: 15, lineHeight: 1.75, color: SUB, maxWidth: 560 }}>
                        {derived.verdict}
                      </p>
                    </div>
                  )}

                  {/* Three stats */}
                  {derived.threeStats.length > 0 && (
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                      {derived.threeStats.map(stat => (
                        <div key={stat.label}>
                          <p style={{ margin: '0 0 3px', fontSize: 9, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</p>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: stat.color, fontFamily: CONDENSED, letterSpacing: '-0.01em' }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No benchmark message */}
                  {!c.hasBenchmark && (
                    <p style={{ margin: 0, fontSize: 13, color: FAINT, lineHeight: 1.65, fontStyle: 'italic' }}>
                      No role benchmark configured. Profile shows behavioral orientation without a fit score. Set a benchmark on this job to generate a scored recommendation.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 2 — THE ANALYSIS
          ══════════════════════════════════════════════════════════════════ */}
          <section aria-label="The Analysis">
            <ActTag n={2} title="The Analysis" />

            <div style={{
              background: SURFACE, border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 'clamp(28px, 4vw, 44px)',
            }}>
              {/* Section header */}
              <div style={{ marginBottom: 32 }}>
                <Label text="Signal Profile" />
                <p style={{ margin: '7px 0 0', fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
                  {c.hasBenchmark ? `Five dimensions. ${derived.dimensions.filter(d => (d.delta ?? 0) < 0).length > 0 ? 'One tension.' : 'No gaps.'}` : 'Five-dimension behavioral profile.'}
                </p>
              </div>

              <div className="rpt-proof-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1.15fr) minmax(240px,0.85fr)', gap: 'clamp(24px, 4vw, 48px)' }}>

                {/* Pentagon + Operating Style */}
                <div>
                  <FitModelViz
                    scores={derived.fitModel}
                    benchmark={derived.benchmark}
                    hoveredDim={effectiveDim}
                    onHoverDim={setHoveredDim}
                  />

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 16, height: 2, background: BLUE, borderRadius: 1 }}/>
                      <span style={{ fontSize: 11, color: 'rgba(238,236,230,0.38)' }}>{c.name.split(' ')[0]}</span>
                    </div>
                    {derived.benchmark && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 16, height: 2, borderRadius: 1, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 5px, transparent 5px 9px)' }}/>
                        <span style={{ fontSize: 11, color: 'rgba(238,236,230,0.38)' }}>Role benchmark</span>
                      </div>
                    )}
                  </div>
                  {derived.benchmark && (
                    <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, textAlign: 'center' }}>
                      Hover a dimension to see score and delta.
                    </p>
                  )}

                  {/* Operating Style */}
                  {c.profileName && (
                    <div style={{ marginTop: 26, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                          Operating Style
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', fontFamily: CONDENSED }}>{c.profileName}</span>
                        {c.profile?.tagline && (
                          <span style={{ fontSize: 12, color: FAINT, fontStyle: 'italic' }}>{c.profile.tagline}</span>
                        )}
                      </div>
                      {c.profile?.description && (
                        <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.72, color: SUB }}>
                          {c.profile.description}
                        </p>
                      )}
                      {c.profile?.strengths && c.profile.strengths.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {c.profile.strengths.slice(0, 4).map(trait => (
                            <div key={trait} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 6 }}/>
                              <span style={{ fontSize: 12, color: 'rgba(238,236,230,0.38)', lineHeight: 1.55 }}>{trait}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dimension bars */}
                <div style={{ borderLeft: `1px solid ${DIV}`, paddingLeft: 'clamp(18px, 3vw, 32px)' }}>
                  <div style={{ marginBottom: 18 }}>
                    <Label text="Dimension Breakdown" />
                    {c.hasBenchmark ? (
                      <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
                        Bar = candidate · Tick = role target · Δ = delta
                      </p>
                    ) : (
                      <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
                        Scores are 0–100 within the normative population.
                      </p>
                    )}
                  </div>
                  {derived.dimensions.map(dim => (
                    <DimBar
                      key={dim.label}
                      dim={dim}
                      isHovered={hoveredDim === dim.label}
                      anyHovered={hoveredDim !== null}
                      onHover={setHoveredDim}
                    />
                  ))}
                  <p style={{ margin: '18px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.16)', lineHeight: 1.55, fontStyle: 'italic' }}>
                    Hover any dimension to connect it to the radar and see detail.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 3 — FIT CONDITIONS
          ══════════════════════════════════════════════════════════════════ */}
          <section aria-label="Fit Conditions">
            <ActTag n={3} title="Fit Conditions" />

            <p style={{ margin: '0 0 28px', fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
              Where {c.name.split(' ')[0]} wins — and where the risk lives
            </p>

            {/* Hire If / Pass If */}
            <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ background: SURFACE, border: `1px solid ${GREEN}1f`, borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }}/>
                  <Label text="Hire If" />
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    derived.decisionFrame.hireIf,
                    ...derived.strengths.slice(0, 2).map(s => s),
                  ].slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 9 }}/>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${RED}1a`, borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0 }}/>
                  <Label text="Pass If" />
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    derived.decisionFrame.doNotHireIf,
                    ...derived.risks.slice(0, 2).map(r => r),
                  ].slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 9 }}/>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Dynamics */}
            <div style={{ background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)' }}>
              <div style={{ marginBottom: 22 }}>
                <Label text="Team Dynamics" />
                <p style={{ margin: '7px 0 0', fontSize: 13, color: FAINT, lineHeight: 1.5 }}>
                  How {c.name.split(' ')[0]}&apos;s behavioral profile maps to team and manager compatibility.
                </p>
              </div>

              {c.teamFit ? (
                <>
                  {[
                    {
                      role: 'Works best with',
                      subtitle: 'Complementary profiles',
                      dots: 5, dotColor: GREEN,
                      alignment: 'Strong alignment',
                      implication: c.teamFit.worksWellWith?.slice(0, 3).join(', ') || 'Teams that value speed and accountability',
                    },
                    {
                      role: 'Watch for friction with',
                      subtitle: 'Tension-prone pairings',
                      dots: 2, dotColor: AMBER,
                      alignment: 'Structural tension',
                      implication: c.teamFit.mayClashWith?.slice(0, 3).join(', ') || 'Profiles that prioritize consensus before action',
                    },
                    ...(c.teamFit.hmMatch === 'good' || c.teamFit.hmMatch === 'caution' ? [{
                      role: 'Hiring Manager read',
                      subtitle: null,
                      dots: c.teamFit.hmMatch === 'good' ? 4 : 2,
                      dotColor: c.teamFit.hmMatch === 'good' ? GREEN : AMBER,
                      alignment: c.teamFit.hmMatch === 'good' ? 'Good compatibility' : 'Requires calibration',
                      implication: c.teamFit.hmNote || (c.teamFit.hmMatch === 'good' ? 'Behavioral alignment with hiring manager profile.' : 'Pace or style differences — explicit alignment recommended before they overlap.'),
                    }] : []),
                  ].map((row, i) => (
                    <div
                      key={row.role}
                      className="team-row"
                      onMouseEnter={() => setHoveredTeam(row.role)}
                      onMouseLeave={() => setHoveredTeam(null)}
                      style={{
                        display: 'grid', gridTemplateColumns: '148px 1fr',
                        gap: 20, alignItems: 'start', padding: '15px 10px',
                        borderTop: i > 0 ? '1px solid rgba(255,255,255,0.045)' : 'none',
                      }}>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{row.role}</p>
                        {row.subtitle
                          ? <p style={{ margin: '0 0 9px', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{row.subtitle}</p>
                          : <div style={{ marginBottom: 9 }} />
                        }
                        <DotRow filled={row.dots} color={row.dotColor} />
                      </div>
                      <div>
                        <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: row.dotColor, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                          {row.alignment}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: SUB, lineHeight: 1.6 }}>{row.implication}</p>
                      </div>
                    </div>
                  ))}

                  {c.teamFit.teamGap && (
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.055)' }}>
                      <p style={{ margin: 0, fontSize: 13, color: 'rgba(238,236,230,0.36)', lineHeight: 1.7, fontStyle: 'italic' }}>
                        Team gap this profile fills: {c.teamFit.teamGap}.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: FAINT, lineHeight: 1.65, fontStyle: 'italic' }}>
                  No archetype-level team compatibility data available for this profile.
                </p>
              )}
            </div>
          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 4 — PRESSURE-TEST
          ══════════════════════════════════════════════════════════════════ */}
          <section aria-label="Pressure-Test">
            <ActTag n={4} title="Pressure-Test" />

            <p style={{ margin: '0 0 28px', fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
              What to confirm before the final round
            </p>

            {/* Signal Summary */}
            {c.hasBenchmark && (
              <div style={{ background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 14 }}>
                <Label text="Signal Summary" />
                <div style={{ marginTop: 18, display: 'grid', gap: 0 }}>
                  {derived.dimensions.map((dim, i) => {
                    const note = generateSignalNote(dim)
                    return (
                      <div key={dim.label} style={{
                        paddingTop: i > 0 ? 16 : 0, paddingBottom: 16,
                        borderBottom: i < derived.dimensions.length - 1 ? '1px solid rgba(255,255,255,0.045)' : 'none',
                        display: 'flex', gap: 16, alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: 2, flexShrink: 0, alignSelf: 'stretch', minHeight: 24, borderRadius: 2,
                          background: note.tension ? AMBER : note.strong ? GREEN : 'rgba(255,255,255,0.1)',
                          marginTop: 2,
                        }}/>
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: note.tension ? AMBER : TEXT, letterSpacing: '-0.01em', fontFamily: CONDENSED }}>
                            {dim.label} {dim.delta !== null ? (dim.delta > 0 ? `+${dim.delta}` : dim.delta) : ''}
                          </p>
                          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: SUB }}>{note.note}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Interview Probes */}
            <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)' }}>
              <div style={{ marginBottom: 24 }}>
                <Label text="Interview Probes" />
                <p style={{ margin: '8px 0 0', fontSize: 13, color: SUB, lineHeight: 1.65, maxWidth: 540 }}>
                  Questions derived from the signal profile. Each targets a specific dimension and risk pattern.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 0 }}>
                {derived.probes.map((probe, i) => {
                  const isHov = hoveredQ === i
                  return (
                    <div
                      key={i}
                      className="q-row"
                      onMouseEnter={() => setHoveredQ(i)}
                      onMouseLeave={() => setHoveredQ(null)}
                      style={{
                        display: 'flex', gap: 20, alignItems: 'flex-start',
                        padding: `${i > 0 ? 22 : 10}px 10px 22px`,
                        borderBottom: i < derived.probes.length - 1 ? '1px solid rgba(255,255,255,0.045)' : 'none',
                        borderLeft: isHov ? `2px solid ${probe.critical ? AMBER : BLUE}50` : '2px solid transparent',
                        borderRadius: 8,
                        background: isHov ? 'rgba(255,255,255,0.018)' : 'transparent',
                        cursor: 'default',
                      }}>
                      <span style={{
                        fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900,
                        color: isHov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        lineHeight: 1, flexShrink: 0, letterSpacing: '-0.04em',
                        minWidth: 36, fontFamily: CONDENSED, transition: 'color 150ms ease',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.72, color: isHov ? TEXT : 'rgba(238,236,230,0.85)', fontStyle: 'italic', transition: 'color 150ms ease' }}>
                          &ldquo;{probe.question}&rdquo;
                        </p>
                        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 8 }}>
                          {probe.tests && (
                            <span style={{ fontSize: 11, color: FAINT }}>
                              Tests: <span style={{ color: isHov ? 'rgba(238,236,230,0.7)' : 'rgba(238,236,230,0.42)', fontWeight: 600, transition: 'color 150ms ease' }}>{probe.tests}</span>
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: FAINT }}>
                            Risk: <span style={{ color: isHov ? AMBER : `${AMBER}72`, fontWeight: 600, transition: 'color 150ms ease' }}>{probe.riskLabel}</span>
                          </span>
                          {probe.critical && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: isHov ? `${RED}e6` : `${RED}60`, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 150ms ease' }}>
                              Would change rec if weak
                            </span>
                          )}
                        </div>
                        {isHov && (
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(238,236,230,0.38)', lineHeight: 1.6, animation: 'fadeSlideUp 150ms ease forwards' }}>
                            Good answer: {probe.goodAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 5 — DECISION SUPPORT
          ══════════════════════════════════════════════════════════════════ */}
          <section aria-label="Decision Support">
            <ActTag n={5} title="Decision Support" />

            {/* How to manage */}
            <div style={{ background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 14 }}>
              <Label text="How to Manage This Hire" />
              <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                {derived.managementGuide.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: BLUE, fontFamily: CONDENSED,
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'rgba(238,236,230,0.8)' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata rail */}
            <div style={{ background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 14, padding: '14px 22px' }}>
              <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px 24px' }}>
                {(c.trustMeta ?? [
                  `Based on ${derived.totalSignals} behavioral signals`,
                  c.hasBenchmark ? 'Role benchmark active' : 'No benchmark — profile only',
                  'Recommendation from structured signal analysis',
                  'Use alongside structured interviews and references',
                ]).map(item => (
                  <p key={item} style={{ margin: 0, fontSize: 11, color: 'rgba(238,236,230,0.22)', lineHeight: 1.6 }}>{item}</p>
                ))}
              </div>
            </div>
          </section>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <footer style={{ paddingTop: 40, marginTop: 10 }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.045)', marginBottom: 20 }}/>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 8, alignItems: 'center' }}>
              {[
                `Report ID: ${c.resultId?.slice(0, 8) || '—'}`,
                `Archetype: ${c.profileName || '—'}`,
                `Assessment completed ${formatDate(c.completedAt)}`,
              ].map((item, i) => (
                <span key={item} style={{ fontSize: 11, color: SUB }}>
                  {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.65, color: FAINT, maxWidth: 640 }}>
              Prepared by {PRODUCT_NAME} · {COMPANY_URL}. Recommendation generated from calibrated signal analysis. Intended for use alongside structured interviews and reference checks. Not a substitute for professional judgment.
            </p>
          </footer>

        </div>
      </main>
    </>
  )
}
