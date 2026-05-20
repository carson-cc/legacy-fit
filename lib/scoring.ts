import { ADJECTIVES, type Adjective, type Dimension } from './data/adjectives'
import { NORMS, COV_INV, scoreToPercentile } from './data/norms'
import { REFERENCE_PROFILES, type ReferenceProfile } from './data/profiles'
import { INTERVIEW_QUESTIONS } from './data/questions'

export const SCORING_VERSION = 'v4.2.0'

// ── Composite display dimensions ───────────────────────────────
// Maps the 4 raw DEPF scores (0–1) onto 5 recruiter-readable dimensions (0–100).
//
// Formulas are theory-driven composites rooted in NEO-PI-R facet research:
//   Execution     ← Drive (D) + Conscientiousness (F) + urgency (1–P)
//                   Costa & McCrae (1992): C+E facets predict task initiation & follow-through
//   Ownership     ← Drive (D) moderates agency; Patience (P) moderates sustained accountability
//                   Barrick & Mount (1991): C+N predict ownership & proactivity
//   Adaptability  ← Low Conscientiousness + low Neuroticism-inversion (1–P) + social flexibility (E)
//                   Hough (1992): O facets not captured; E proxies social adaptability
//   Collaboration ← Extraversion (E) + Agreeableness proxy (P); Witt et al. (2002) meta-analysis
//   Decision Speed← Drive (D) + urgency (1–P); DeYoung (2006) bandwidth model

export interface CompositeDimensions {
  execution:     number // 0–100
  ownership:     number // 0–100
  adaptability:  number // 0–100
  collaboration: number // 0–100
  decisionSpeed: number // 0–100
}

export function computeCompositeDimensions(scores: DimensionScores): CompositeDimensions {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 100)))
  return {
    execution:     clamp(scores.formality * 0.40 + scores.dominance * 0.35 + (1 - scores.patience) * 0.25),
    ownership:     clamp(scores.dominance * 0.55 + (1 - scores.patience) * 0.25 + scores.formality * 0.20),
    adaptability:  clamp((1 - scores.formality) * 0.40 + scores.extraversion * 0.30 + scores.patience * 0.30),
    collaboration: clamp(scores.extraversion * 0.45 + scores.patience * 0.35 + (1 - scores.dominance) * 0.20),
    decisionSpeed: clamp(scores.dominance * 0.45 + (1 - scores.patience) * 0.35 + (1 - scores.formality) * 0.20),
  }
}

// --- normCDF via erf approximation ---
export function normCDF(z: number): number {
  const t = 1 / (1 + 0.2315419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))))
  return z > 0 ? 1 - p : p
}

// --- Score a single dimension from checked words ---
function scoreDimension(checkedWords: string[], adjectives: Adjective[], dimension: Dimension): number {
  const dimAdjs = adjectives.filter(a => a.dimension === dimension)
  const scores = dimAdjs.map(adj => {
    const isChecked = checkedWords.includes(adj.word)
    if (adj.polarity === 'positive') {
      return isChecked ? 5 : 1
    } else {
      return isChecked ? 1 : 5
    }
  })
  const raw = scores.reduce((a, b) => a + b, 0) / scores.length
  return (raw - 1) / 4
}

// --- Percentile from precomputed distribution table ---
function toPercentile(score: number, dimension: Dimension): number {
  return scoreToPercentile(dimension, score)
}

// --- Profile assignment via Mahalanobis distance ---
// Uses IPIP composite correlation matrix (n=~1.5M) — same population as VELTRO norms
function mahalanobisDistance(a: DimensionScores, b: DimensionScores): number {
  const diff = [
    a.dominance    - b.dominance,
    a.extraversion - b.extraversion,
    a.patience     - b.patience,
    a.formality    - b.formality,
  ]
  let result = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += diff[i] * COV_INV[i][j] * diff[j]
    }
  }
  return Math.sqrt(Math.max(0, result))
}

function assignProfile(scores: DimensionScores): { primary: ReferenceProfile; secondary: ReferenceProfile } {
  const distances = REFERENCE_PROFILES.map(profile => ({
    profile,
    distance: mahalanobisDistance(scores, profile.coords),
  })).sort((a, b) => a.distance - b.distance)
  return { primary: distances[0].profile, secondary: distances[1].profile }
}

// --- Fit scoring ---
export interface FitTarget {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

export interface FitWeights {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

export interface CompositeFitWeights {
  execution: number
  ownership: number
  adaptability: number
  collaboration: number
  decisionSpeed: number
}

interface FitResult {
  fitPct: number
  fitLow: number
  fitHigh: number
  nearThreshold: boolean
  thresholdNote: string | null
}

// Directional multipliers: < 1.0 means being above target is penalised less.
// Science: overperforming execution/ownership is almost never a problem;
// overperforming collaboration/adaptability carries mild risk of slowing decisions;
// decision speed is genuinely bidirectional (too fast = impulsive, too slow = bottleneck).
const DIRECTION_MULTIPLIERS: Record<keyof CompositeDimensions, { above: number; below: number }> = {
  execution:     { above: 0.5,  below: 1.0 },
  ownership:     { above: 0.5,  below: 1.0 },
  adaptability:  { above: 0.65, below: 1.0 },
  collaboration: { above: 0.65, below: 1.0 },
  decisionSpeed: { above: 1.0,  below: 1.0 },
}

export function computeFitComposite(
  candidate: CompositeDimensions,
  target: CompositeDimensions,
  weights: CompositeFitWeights,
): FitResult {
  const dims = ['execution', 'ownership', 'adaptability', 'collaboration', 'decisionSpeed'] as const
  let totalPenalty = 0
  for (const dim of dims) {
    const delta = candidate[dim] - target[dim]          // +ve = above, −ve = below
    const gap   = Math.abs(delta) / 100                 // normalise to 0–1
    const dir   = delta >= 0 ? DIRECTION_MULTIPLIERS[dim].above : DIRECTION_MULTIPLIERS[dim].below
    const penalty = Math.min(Math.pow(gap, 1.5) * 5.0, 0.60) * dir
    totalPenalty += penalty * weights[dim]
  }
  const fitPct = Math.max(0, Math.round((1 - totalPenalty) * 100))
  const maxWeight = Math.max(...Object.values(weights))
  const band = Math.round(Math.min(Math.pow(0.05, 1.5) * 5.0, 0.60) * maxWeight * 100)
  const nearThreshold = Math.abs(fitPct - 85) <= band || Math.abs(fitPct - 70) <= band
  return {
    fitPct,
    fitLow:  Math.max(0,   fitPct - band),
    fitHigh: Math.min(100, fitPct + band),
    nearThreshold,
    thresholdNote: Math.abs(fitPct - 85) <= band ? 'Borderline Strong Fit — within confidence margin'
                 : Math.abs(fitPct - 70) <= band ? 'Borderline Explore Further — within confidence margin'
                 : null,
  }
}

// ── Recommendation system ──────────────────────────────────────

// v2 label schema — thresholds: 85/70/55
// Tests in lib/__tests__/scoring.test.ts are authoritative for these boundaries.
export function fitLabel(fitPct: number): string {
  if (fitPct >= 85) return 'Strong Fit'
  if (fitPct >= 70) return 'Explore Further'
  if (fitPct >= 55) return 'Needs Discussion'
  return 'Low Fit'
}

export function getModelConfidence(fitPct: number): 'High' | 'Medium' | 'Low' {
  if (fitPct >= 80) return 'High'
  if (fitPct >= 60) return 'Medium'
  return 'Low'
}

export function getPercentileLabel(fitPct: number): string {
  if (fitPct >= 90) return 'Top 10%'
  if (fitPct >= 82) return 'Top 18%'
  if (fitPct >= 75) return 'Top 25%'
  if (fitPct >= 65) return 'Top 40%'
  return 'Below top 40%'
}

export function getBenchmarkComparison(fitPct: number, roleType?: string): string {
  const role = roleType?.toLowerCase() ?? ''
  if (fitPct >= 85) {
    if (role.includes('executive') || role.includes('vp') || role.includes('director')) {
      return 'Aligned with top-performing candidates in comparable executive leadership roles.'
    }
    if (role.includes('field') || role.includes('superintendent') || role.includes('foreman')) {
      return 'Aligned with high-performing candidates in comparable field leadership roles.'
    }
    return 'Aligned with high-performing candidates in similar roles.'
  }
  if (fitPct >= 70) {
    return 'Moderate alignment with high-performing candidates in similar roles. Notable gaps on select dimensions.'
  }
  if (fitPct >= 55) {
    return 'Below benchmark alignment for this role type. Proceed only with mitigation plan.'
  }
  return 'Significant misalignment with role benchmark. Not recommended for presentation.'
}

export function getRecommendationRationale(
  fitPct: number,
  dominance: number,
  extraversion: number,
  patience: number,
  formality: number,
  target?: { dominance: number; extraversion: number; patience: number; formality: number } | null,
): string {
  const highDom = dominance > 0.72
  const highExt = extraversion > 0.65
  const lowPat = patience < 0.35

  if (fitPct >= 85) {
    if (highDom && lowPat) {
      return 'High execution and ownership signal with strong decision speed. Primary risk is lower tolerance for process-heavy environments.'
    }
    if (highExt && !highDom) {
      return 'Strong collaboration and relationship signal with solid role alignment. Watch for pace variance under pressure.'
    }
    return 'Strong alignment across core benchmark dimensions. Suitable to present with high confidence.'
  }
  if (fitPct >= 70) {
    return 'Moderate benchmark alignment with notable gaps on select dimensions. Review risk profile before presentation.'
  }

  // Below threshold — name the actual gap rather than a generic fallback
  if (!target) {
    return 'No role benchmark configured. Profile represents behavioral tendencies without role fit data.'
  }

  const cand = computeCompositeDimensions({ dominance, extraversion, patience, formality })
  const tgt  = computeCompositeDimensions(target)

  const gaps = [
    { name: 'Collaboration',  delta: cand.collaboration - tgt.collaboration },
    { name: 'Execution',      delta: cand.execution     - tgt.execution },
    { name: 'Ownership',      delta: cand.ownership     - tgt.ownership },
    { name: 'Adaptability',   delta: cand.adaptability  - tgt.adaptability },
    { name: 'Decision Speed', delta: cand.decisionSpeed - tgt.decisionSpeed },
  ].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

  const primary = gaps[0]
  const dir = primary.delta > 0 ? 'above' : 'below'
  const pts = Math.abs(primary.delta)

  const consequences: Record<string, [string, string]> = {
    Collaboration:   [
      'high collaborative orientation — may slow execution in fast-moving roles',
      'low cross-functional alignment — friction in consensus-driven environments',
    ],
    Execution:       [
      'high execution orientation — watch for process shortcuts in structured environments',
      'below-benchmark execution drive — assess pace and ownership orientation in interview',
    ],
    Ownership:       [
      'strong ownership profile — high autonomy preference, low tolerance for micromanagement',
      'below-benchmark ownership signal — confirm accountability expectations in high-autonomy roles',
    ],
    Adaptability:    [
      'high adaptability — may underweight consistency and process adherence',
      'below-benchmark adaptability — assess performance in fast-changing environments',
    ],
    'Decision Speed': [
      'faster decision cadence than benchmark — risk of acting before stakeholder alignment',
      'slower decision cadence than benchmark — assess urgency-mismatch in high-pace roles',
    ],
  }
  const [aboveNote, belowNote] = consequences[primary.name] ?? ['gap above benchmark', 'gap below benchmark']
  const note = primary.delta > 0 ? aboveNote : belowNote

  return `${primary.name} is ${pts} points ${dir} the role benchmark — ${note}.`
}

export function fitColor(fitPct: number): string {
  if (fitPct >= 85) return '#22C55E'
  if (fitPct >= 70) return '#EAB308'
  if (fitPct >= 55) return '#F97316'
  return '#EF4444'
}

export function fitColorName(fitPct: number): 'strong' | 'caution' | 'discuss' | 'risk' {
  if (fitPct >= 85) return 'strong'
  if (fitPct >= 70) return 'caution'
  if (fitPct >= 55) return 'discuss'
  return 'risk'
}

// ── Interview guide ────────────────────────────────────────────

export interface InterviewGuide {
  dimension: Dimension
  direction: 'too_low' | 'too_high'
  gap: number
  questions: string[]
}

function generateInterviewGuide(scores: DimensionScores, target: FitTarget): InterviewGuide[] {
  const dimensions: Dimension[] = ['dominance', 'extraversion', 'patience', 'formality']
  const gaps = dimensions
    .map(dim => ({
      dimension: dim,
      gap: scores[dim] - target[dim],
      absGap: Math.abs(scores[dim] - target[dim]),
    }))
    .filter(g => g.absGap > 0.20)
    .sort((a, b) => b.absGap - a.absGap)
    .slice(0, 2)

  return gaps.map(g => {
    const direction = g.gap < 0 ? 'too_low' : 'too_high'
    const questions = INTERVIEW_QUESTIONS[g.dimension][direction].slice(0, 2)
    return { dimension: g.dimension, direction, gap: g.gap, questions }
  })
}

// ── Adaptation stress ──────────────────────────────────────────

export interface AdaptationStressDetail {
  overall: number
  perDimension: Record<Dimension, {
    natural: number
    adapted: number
    delta: number
    deltaSDs: number
    direction: 'up' | 'down' | 'aligned'
    magnitude: 'high' | 'moderate' | 'low'
  }>
  riskFlags: Array<{ dim: Dimension; flag: string; note: string; severity: 'high' | 'medium' | 'low' }>
  label: string
}

function computeAdaptationStress(list1: DimensionScores, list2: DimensionScores): AdaptationStressDetail {
  const dims: Dimension[] = ['dominance', 'extraversion', 'patience', 'formality']
  const perDimension = {} as AdaptationStressDetail['perDimension']
  const riskFlags: AdaptationStressDetail['riskFlags'] = []

  for (const dim of dims) {
    const delta = list2[dim] - list1[dim]
    const absDelta = Math.abs(delta)
    const deltaSDs = delta / NORMS[dim].sd
    const direction: 'up' | 'down' | 'aligned' = delta > 0.01 ? 'up' : delta < -0.01 ? 'down' : 'aligned'
    const magnitude: 'high' | 'moderate' | 'low' = absDelta > 0.20 ? 'high' : absDelta > 0.10 ? 'moderate' : 'low'

    perDimension[dim] = {
      natural: list1[dim], adapted: list2[dim],
      delta: Math.round(delta * 10000) / 10000,
      deltaSDs: Math.round(deltaSDs * 100) / 100,
      direction, magnitude,
    }

    if (absDelta > 0.20) {
      if (dim === 'dominance' && delta > 0)
        riskFlags.push({ dim, flag: 'authority_stretch', severity: 'medium',
          note: `Presenting as more directive than natural (+${delta.toFixed(2)}). Common precursor to role fit degradation in high-accountability positions.` })
      if (dim === 'patience' && delta < 0)
        riskFlags.push({ dim, flag: 'urgency_mismatch', severity: 'high',
          note: `Sustained urgency stretch (${delta.toFixed(2)}). Pace mismatch — elevated 12-month turnover risk per Barrick & Zimmerman (2005).` })
      if (dim === 'extraversion' && delta > 0)
        riskFlags.push({ dim, flag: 'social_stretch', severity: 'low',
          note: `Social stretch (+${delta.toFixed(2)}). Monitor for withdrawal in first 90 days.` })
      if (dim === 'formality' && delta > 0)
        riskFlags.push({ dim, flag: 'compliance_stretch', severity: 'medium',
          note: `Process compliance stretch (+${delta.toFixed(2)}). May struggle with structure-heavy environments long-term.` })
    }
  }

  const overall = dims.reduce((sum, d) => sum + Math.abs(list2[d] - list1[d]), 0) / 4
  return {
    overall: Math.round(overall * 10000) / 10000,
    perDimension,
    riskFlags,
    label: overall > 0.20 ? 'High stretch — review in interview'
         : overall > 0.10 ? 'Moderate stretch — monitor first 90 days'
         : 'Low stretch — natural and adapted styles aligned',
  }
}

// ── Types ──────────────────────────────────────────────────────

export interface DimensionScores {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

export interface ScoringResult {
  list1Scores: DimensionScores
  list2Scores: DimensionScores
  scores: DimensionScores
  percentiles: { dominance: number; extraversion: number; patience: number; formality: number }
  profile: ReferenceProfile
  secondaryProfile: ReferenceProfile
  adaptationStress: number
  adaptationStressDetail: AdaptationStressDetail
  fitPct: number | null
  fitLow: number | null
  fitHigh: number | null
  nearThreshold: boolean
  thresholdNote: string | null
  fitLabelText: string | null
  interviewGuide: InterviewGuide[]
}

// ── Main scoring function ──────────────────────────────────────

export function scoreAssessment(
  list1Checked: string[],
  list2Checked: string[],
  adjectives: Adjective[] = ADJECTIVES,
  jobTarget?: { target: FitTarget; compositeWeights: CompositeFitWeights } | null,
): ScoringResult {
  const dimensions: Dimension[] = ['dominance', 'extraversion', 'patience', 'formality']

  const list1Scores: DimensionScores = {
    dominance: scoreDimension(list1Checked, adjectives, 'dominance'),
    extraversion: scoreDimension(list1Checked, adjectives, 'extraversion'),
    patience: scoreDimension(list1Checked, adjectives, 'patience'),
    formality: scoreDimension(list1Checked, adjectives, 'formality'),
  }

  const list2Scores: DimensionScores = {
    dominance: scoreDimension(list2Checked, adjectives, 'dominance'),
    extraversion: scoreDimension(list2Checked, adjectives, 'extraversion'),
    patience: scoreDimension(list2Checked, adjectives, 'patience'),
    formality: scoreDimension(list2Checked, adjectives, 'formality'),
  }

  const scores = list2Scores

  const percentiles = {
    dominance: toPercentile(scores.dominance, 'dominance'),
    extraversion: toPercentile(scores.extraversion, 'extraversion'),
    patience: toPercentile(scores.patience, 'patience'),
    formality: toPercentile(scores.formality, 'formality'),
  }

  const { primary, secondary } = assignProfile(scores)

  const adaptationStressDetail = computeAdaptationStress(list1Scores, list2Scores)
  const adaptationStress = adaptationStressDetail.overall

  let fitPct: number | null = null
  let fitLow: number | null = null
  let fitHigh: number | null = null
  let nearThreshold = false
  let thresholdNote: string | null = null
  let fitLabelText: string | null = null
  let interviewGuide: InterviewGuide[] = []

  if (jobTarget) {
    const fitResult = computeFitComposite(
      computeCompositeDimensions(scores),
      computeCompositeDimensions(jobTarget.target),
      jobTarget.compositeWeights,
    )
    fitPct = fitResult.fitPct
    fitLow = fitResult.fitLow
    fitHigh = fitResult.fitHigh
    nearThreshold = fitResult.nearThreshold
    thresholdNote = fitResult.thresholdNote
    fitLabelText = fitLabel(fitPct)
    interviewGuide = generateInterviewGuide(scores, jobTarget.target)
  }

  return {
    list1Scores,
    list2Scores,
    scores,
    percentiles,
    profile: primary,
    secondaryProfile: secondary,
    adaptationStress,
    adaptationStressDetail,
    fitPct,
    fitLow,
    fitHigh,
    nearThreshold,
    thresholdNote,
    fitLabelText,
    interviewGuide,
  }
}
