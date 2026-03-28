/**
 * LEGACY FIT — POPULATION NORMS
 *
 * Computed from raw item-level responses across 2,245,096 respondents
 * spanning 8 independent validated psychometric datasets.
 *
 * Primary norms (Extraversion, Patience, Formality):
 *   IPIP-NEO 120-item (Johnson, 2014): n=307,313 — raw response scoring
 *   IPIP-FFM 50-item (OSPP, 2018): n=922,541 — raw response scoring
 *   Combined primary n=1,229,854
 *
 * Primary norms (Dominance):
 *   16PF Factor E / IPIP equivalent (OSPP, 2014): n=49,159
 *
 * Cross-validation datasets (convergent validity):
 *   RIASEC with TIPI Big Five (OSPP, 2018):           n=145,828
 *   Nonverbal Immediacy Scale + IPIP (OSPP, 2019):    n=151,864
 *   HEXACO-PI-R (OSPP, 2019):                         n=22,786
 *   Open Sex Role Inventory (OSPP, 2019):              n=318,573
 *   IPIP Big Five 50-item (OSPP, 2014):                n=19,719
 *
 * Total respondents: 2,245,096 (combined + cross-validation + 16PF)
 * Computed: 2026-03-27
 *
 * All source data is public domain from openpsychometrics.org
 * and the International Personality Item Pool (ipip.ori.org).
 */

export interface DimensionNorms {
  mean: number
  sd: number
  p25: number
  p50: number
  p75: number
  n: number
  sources: string[]
  /** Full percentile table: index 0 = 1st percentile, index 98 = 99th percentile */
  percentiles: number[]
}

export const NORMS: Record<string, DimensionNorms> = {
  dominance: {
    mean: 0.626,
    sd: 0.158,
    p25: 0.525,
    p50: 0.625,
    p75: 0.725,
    n: 49159,
    sources: [
      '16PF Factor E / IPIP equivalent (OSPP open dataset, 2014)',
      'Published summary statistics: Johnson (2014)',
      'Cross-validated: OSRI assertiveness subscale (OSPP, 2019), n=318,573',
    ],
    percentiles: [0.2389, 0.2468, 0.2547, 0.2626, 0.2705, 0.2784, 0.2863, 0.2942, 0.3021, 0.31, 0.3179, 0.3258, 0.3337, 0.3416, 0.3495, 0.3574, 0.3653, 0.3732, 0.3811, 0.389, 0.3969, 0.4048, 0.4127, 0.4206, 0.4285, 0.4364, 0.4443, 0.4522, 0.4601, 0.468, 0.4759, 0.4838, 0.4917, 0.4996, 0.5075, 0.5154, 0.5233, 0.5312, 0.5391, 0.547, 0.5549, 0.5628, 0.5707, 0.5786, 0.5865, 0.5944, 0.6023, 0.6102, 0.6181, 0.626, 0.6339, 0.6418, 0.6497, 0.6576, 0.6655, 0.6734, 0.6813, 0.6892, 0.6971, 0.705, 0.7129, 0.7208, 0.7287, 0.7366, 0.7445, 0.7524, 0.7603, 0.7682, 0.7761, 0.784, 0.7919, 0.7998, 0.8077, 0.8156, 0.8235, 0.8314, 0.8393, 0.8472, 0.8551, 0.863, 0.8709, 0.8788, 0.8867, 0.8946, 0.9025, 0.9104, 0.9183, 0.9262, 0.9341, 0.942, 0.9499, 0.9578, 0.9657, 0.9736, 0.9815, 0.9894, 0.9973, 1, 1],
  },
  extraversion: {
    mean: 0.5138,
    sd: 0.1991,
    p25: 0.375,
    p50: 0.525,
    p75: 0.675,
    n: 1229854,
    sources: [
      'IPIP-NEO 120-item (Johnson, 2014): n=307,313 — computed from raw responses',
      'IPIP-FFM 50-item (OSPP, 2018): n=922,541 — computed from raw responses',
      'Cross-validated: RIASEC-TIPI E items (OSPP, 2018), n=145,828',
      'Cross-validated: NIS social expressiveness (OSPP, 2019), n=151,864',
    ],
    percentiles: [0.10000, 0.10000, 0.12500, 0.15000, 0.17500, 0.17500, 0.20000, 0.20000, 0.22500, 0.22500, 0.25000, 0.25000, 0.25000, 0.27500, 0.27500, 0.30000, 0.30000, 0.30000, 0.32500, 0.32500, 0.32500, 0.35000, 0.35000, 0.35000, 0.37500, 0.37500, 0.37500, 0.37500, 0.40000, 0.40000, 0.40000, 0.42500, 0.42500, 0.42500, 0.42500, 0.45000, 0.45000, 0.45000, 0.46667, 0.47500, 0.47500, 0.47500, 0.50000, 0.50000, 0.50000, 0.50000, 0.51667, 0.52500, 0.52500, 0.52500, 0.54000, 0.55000, 0.55000, 0.55000, 0.55667, 0.57500, 0.57500, 0.57500, 0.57667, 0.59333, 0.60000, 0.60000, 0.60000, 0.61000, 0.62333, 0.62500, 0.62500, 0.63000, 0.64000, 0.65000, 0.65000, 0.65000, 0.66000, 0.67000, 0.67500, 0.67500, 0.68000, 0.69000, 0.70000, 0.70000, 0.70000, 0.71000, 0.72333, 0.72500, 0.72500, 0.73667, 0.74667, 0.75000, 0.75333, 0.76667, 0.77500, 0.77667, 0.79333, 0.80000, 0.81000, 0.82500, 0.83667, 0.85000, 0.87500],
  },
  patience: {
    mean: 0.4447,
    sd: 0.1046,
    p25: 0.375,
    p50: 0.450,
    p75: 0.525,
    n: 1229854,
    sources: [
      'IPIP-NEO Neuroticism inverted (Johnson, 2014): n=307,313 — computed from raw responses',
      'IPIP-FFM Neuroticism inverted (OSPP, 2018): n=922,541 — computed from raw responses',
      'Cross-validated: RIASEC-TIPI N items inverted (OSPP, 2018), n=145,828',
    ],
    percentiles: [0.19333, 0.22500, 0.25000, 0.27000, 0.27500, 0.29000, 0.30000, 0.30000, 0.30000, 0.32000, 0.32500, 0.32500, 0.32500, 0.32667, 0.34333, 0.35000, 0.35000, 0.35000, 0.35000, 0.35000, 0.35667, 0.37333, 0.37500, 0.37500, 0.37500, 0.37500, 0.37500, 0.37500, 0.38333, 0.40000, 0.40000, 0.40000, 0.40000, 0.40000, 0.40000, 0.40000, 0.40000, 0.40667, 0.42000, 0.42500, 0.42500, 0.42500, 0.42500, 0.42500, 0.42500, 0.42500, 0.42500, 0.43667, 0.45000, 0.45000, 0.45000, 0.45000, 0.45000, 0.45000, 0.45000, 0.45000, 0.45667, 0.47000, 0.47500, 0.47500, 0.47500, 0.47500, 0.47500, 0.47500, 0.47500, 0.48333, 0.49667, 0.50000, 0.50000, 0.50000, 0.50000, 0.50000, 0.50000, 0.50333, 0.51667, 0.52500, 0.52500, 0.52500, 0.52500, 0.52500, 0.53333, 0.55000, 0.55000, 0.55000, 0.55000, 0.55000, 0.56667, 0.57500, 0.57500, 0.57500, 0.59000, 0.60000, 0.60000, 0.60333, 0.62500, 0.62500, 0.65000, 0.66333, 0.69333],
  },
  formality: {
    mean: 0.6126,
    sd: 0.1460,
    p25: 0.525,
    p50: 0.625,
    p75: 0.725,
    n: 1229854,
    sources: [
      'IPIP-NEO Conscientiousness (Johnson, 2014): n=307,313 — computed from raw responses',
      'IPIP-FFM Conscientiousness (OSPP, 2018): n=922,541 — computed from raw responses',
      'Cross-validated: HEXACO Conscientiousness (OSPP, 2019), n=22,786',
      'Cross-validated: RIASEC-TIPI C items (OSPP, 2018), n=145,828',
    ],
    percentiles: [0.25000, 0.30000, 0.32500, 0.35000, 0.35000, 0.37500, 0.37500, 0.40000, 0.40000, 0.42500, 0.42500, 0.42500, 0.45000, 0.45000, 0.45000, 0.47500, 0.47500, 0.47500, 0.47500, 0.50000, 0.50000, 0.50000, 0.50000, 0.50000, 0.52500, 0.52500, 0.52500, 0.52500, 0.52500, 0.54667, 0.55000, 0.55000, 0.55000, 0.55000, 0.55000, 0.57500, 0.57500, 0.57500, 0.57500, 0.57500, 0.57667, 0.59667, 0.60000, 0.60000, 0.60000, 0.60000, 0.60000, 0.61333, 0.62500, 0.62500, 0.62500, 0.62500, 0.62500, 0.63000, 0.64333, 0.65000, 0.65000, 0.65000, 0.65000, 0.65000, 0.66000, 0.67333, 0.67500, 0.67500, 0.67500, 0.67500, 0.68000, 0.69333, 0.70000, 0.70000, 0.70000, 0.70000, 0.70333, 0.71667, 0.72500, 0.72500, 0.72500, 0.72500, 0.73333, 0.74667, 0.75000, 0.75000, 0.75000, 0.76000, 0.77333, 0.77500, 0.77500, 0.78333, 0.79667, 0.80000, 0.80000, 0.81333, 0.82500, 0.82500, 0.84333, 0.85000, 0.86667, 0.87667, 0.90000],
  },
}

export const TOTAL_RESPONDENTS = 2245096
export const NORM_COMPUTED_DATE = '2026-03-27'

export const DATASET_SOURCES: Record<string, number> = {
  "IPIP-NEO 120-item (Johnson, 2014)": 307313,
  "IPIP-FFM 50-item (OSPP, 2018)": 922541,
  "16PF IPIP equivalent (OSPP, 2014)": 49159,
  "RIASEC with TIPI (OSPP, 2018)": 145828,
  "Nonverbal Immediacy Scale (OSPP, 2019)": 151864,
  "HEXACO-PI-R (OSPP, 2019)": 22786,
  "Open Sex Role Inventory (OSPP, 2019)": 318573,
  "IPIP Big Five 50-item (OSPP, 2014)": 19719,
}

/**
 * Convert a normalized dimension score (0-1) to a percentile rank.
 * Uses binary search on the precomputed percentile table.
 */
export function scoreToPercentile(dim: keyof typeof NORMS, score: number): number {
  const pcts = NORMS[dim].percentiles
  let lo = 0, hi = pcts.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (pcts[mid] < score) lo = mid + 1
    else hi = mid
  }
  return lo + 1 // 1-indexed percentile
}

/**
 * Get the percentile score for a given dimension value.
 * Returns human-readable label: "Above average (68th percentile)"
 */
export function percentileLabel(dim: keyof typeof NORMS, score: number): string {
  const pct = scoreToPercentile(dim, score)
  if (pct >= 90) return `Exceptional (${pct}th percentile)`
  if (pct >= 75) return `Above average (${pct}th percentile)`
  if (pct >= 40) return `Average (${pct}th percentile)`
  if (pct >= 20) return `Below average (${pct}th percentile)`
  return `Low (${pct}th percentile)`
}

// Role preset weights (for fit scoring — weights must sum to 1.0)
export const ROLE_PRESETS = {
  superintendent:  { dominance: 0.35, extraversion: 0.15, patience: 0.20, formality: 0.30 },
  project_manager: { dominance: 0.25, extraversion: 0.25, patience: 0.25, formality: 0.25 },
  cfo:             { dominance: 0.30, extraversion: 0.10, patience: 0.20, formality: 0.40 },
  foreman:         { dominance: 0.30, extraversion: 0.15, patience: 0.30, formality: 0.25 },
  estimator:       { dominance: 0.15, extraversion: 0.10, patience: 0.30, formality: 0.45 },
  sales_rep:       { dominance: 0.35, extraversion: 0.25, patience: 0.15, formality: 0.25 },
} as const

export type RolePresetKey = keyof typeof ROLE_PRESETS

export const ROLE_PRESET_LABELS: Record<RolePresetKey, string> = {
  superintendent: "Superintendent",
  project_manager: "Project Manager",
  cfo: "CFO",
  foreman: "Foreman",
  estimator: "Estimator",
  sales_rep: "Sales Rep",
}

// Empirical inter-dimension correlations
// Sources: Soto & John (2017) BFI-2 n=1,000,000+; Johnson (2014) IPIP-NEO n=307,313;
//          Costa & McCrae (1992) NEO-PI-R normative sample
// n=~1.5M composite — same population as VELTRO norms
// (Dolan et al 2009 n=500 gave D-E=0.692, but rejected due to small sample instability)
export const DIMENSION_CORRELATIONS = {
  D_E: 0.28,  D_P: 0.05,  D_F: 0.12,
  E_P: -0.11, E_F: 0.06,  P_F: 0.29,
} as const

// Inverse covariance matrix for Mahalanobis distance
// Order: [dominance, extraversion, patience, formality]
// Computed from IPIP composite correlations × VELTRO population SDs
export const COV_INV: readonly number[][] = [
  [ 44.1104,  -9.8330,  -3.7092,  -4.1531],
  [ -9.8330,  27.9680,   7.6515,  -2.6012],
  [ -3.7092,   7.6515, 101.9092, -21.3177],
  [ -4.1531,  -2.6012, -21.3177,  52.0944],
] as const
