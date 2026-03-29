import { ADJECTIVES, type Adjective, type Dimension } from './data/adjectives'
import { NORMS, COV_INV, scoreToPercentile } from './data/norms'
import { REFERENCE_PROFILES, type ReferenceProfile } from './data/profiles'
import { INTERVIEW_QUESTIONS } from './data/questions'

export const SCORING_VERSION = 'v3.0.0'

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

interface FitResult {
  fitPct: number
  fitLow: number
  fitHigh: number
  nearThreshold: boolean
  thresholdNote: string | null
}

function computeFit(
  scores: DimensionScores,
  target: FitTarget,
  weights: FitWeights,
  variant: 'v1_stepped' | 'v2_quadratic' = 'v2_quadratic',
): FitResult {
  const dimensions: Dimension[] = ['dominance', 'extraversion', 'patience', 'formality']
  let totalPenalty = 0

  for (const dim of dimensions) {
    const gap = Math.abs(scores[dim] - target[dim])
    let penalty: number
    if (variant === 'v1_stepped') {
      if (gap <= 0.10) penalty = 0
      else if (gap <= 0.20) penalty = 0.05
      else if (gap <= 0.30) penalty = 0.15
      else penalty = 0.30
    } else {
      penalty = Math.min(Math.pow(gap, 1.5) * 2.5, 0.60)
    }
    totalPenalty += penalty * weights[dim]
  }

  const fitPct = Math.max(0, Math.round((1 - totalPenalty) * 100))
  const maxWeight = Math.max(...Object.values(weights))
  const band = Math.round(Math.min(Math.pow(0.05, 1.5) * 2.5, 0.60) * maxWeight * 100)
  const nearThreshold = Math.abs(fitPct - 85) <= band || Math.abs(fitPct - 70) <= band

  return {
    fitPct,
    fitLow: Math.max(0, fitPct - band),
    fitHigh: Math.min(100, fitPct + band),
    nearThreshold,
    thresholdNote: Math.abs(fitPct - 85) <= band ? 'Borderline Strong Hire — within confidence margin'
                 : Math.abs(fitPct - 70) <= band ? 'Borderline Proceed with Caution/Do Not Hire — within confidence margin'
                 : null,
  }
}

// ── Recommendation system ──────────────────────────────────────

export function fitLabel(fitPct: number): string {
  if (fitPct >= 85) return 'Strong Hire'
  if (fitPct >= 70) return 'Proceed with Caution'
  return 'Do Not Hire'
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
  return 'Insufficient benchmark alignment for confident recommendation. Significant gaps detected.'
}

export function fitColor(fitPct: number): string {
  if (fitPct >= 85) return '#22C55E'
  if (fitPct >= 70) return '#EAB308'
  return '#EF4444'
}

export function fitColorName(fitPct: number): 'strong' | 'caution' | 'risk' {
  if (fitPct >= 85) return 'strong'
  if (fitPct >= 70) return 'caution'
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
  jobTarget?: { target: FitTarget; weights: FitWeights } | null,
  scoringVariant: 'v1_stepped' | 'v2_quadratic' = 'v2_quadratic',
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
    const fitResult = computeFit(scores, jobTarget.target, jobTarget.weights, scoringVariant)
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
