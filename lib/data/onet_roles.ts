/**
 * VELTRO O*NET ROLE TARGETS — lib/data/onet_roles.ts
 *
 * 15 occupations with empirically-derived targets and weights.
 * Generated from O*NET 29.0 Work Styles database.
 *
 * Targets are percentile-scaled DEPF scores derived from O*NET
 * Work Styles importance ratings mapped to Big Five facets.
 * Weights are normalized validity coefficients from Barrick & Mount (1991),
 * Judge et al. (2002), and Schmidt & Hunter (1998).
 */

export interface OnetRoleTarget {
  soc: string
  target: { dominance: number; extraversion: number; patience: number; formality: number }
  weights: { dominance: number; extraversion: number; patience: number; formality: number }
}

export const ONET_ROLE_TARGETS: Record<string, OnetRoleTarget> = {
  'Construction Manager': {
    soc: '11-9021.00',
    target:  { dominance: 0.8151, extraversion: 0.6560, patience: 0.7844, formality: 0.8144 },
    weights: { dominance: 0.2611, extraversion: 0.2236, patience: 0.2543, formality: 0.2611 },
  },
  'First-Line Supervisor Construction': {
    soc: '47-1011.00',
    target:  { dominance: 0.8050, extraversion: 0.6596, patience: 0.7994, formality: 0.8203 },
    weights: { dominance: 0.2572, extraversion: 0.2238, patience: 0.2571, formality: 0.2620 },
  },
  'General and Operations Manager': {
    soc: '11-1021.00',
    target:  { dominance: 0.8524, extraversion: 0.7056, patience: 0.8304, formality: 0.8304 },
    weights: { dominance: 0.2602, extraversion: 0.2268, patience: 0.2566, formality: 0.2565 },
  },
  'Sales Manager': {
    soc: '11-2022.00',
    target:  { dominance: 0.8622, extraversion: 0.7736, patience: 0.8207, formality: 0.7859 },
    weights: { dominance: 0.2624, extraversion: 0.2400, patience: 0.2530, formality: 0.2447 },
  },
  'Sales Representative': {
    soc: '41-4012.00',
    target:  { dominance: 0.7966, extraversion: 0.8084, patience: 0.8193, formality: 0.7499 },
    weights: { dominance: 0.2528, extraversion: 0.2510, patience: 0.2564, formality: 0.2397 },
  },
  'Chief Executive': {
    soc: '11-1011.00',
    target:  { dominance: 0.8991, extraversion: 0.7171, patience: 0.8615, formality: 0.8334 },
    weights: { dominance: 0.2652, extraversion: 0.2242, patience: 0.2581, formality: 0.2524 },
  },
  'Chief Financial Officer': {
    soc: '11-3031.00',
    target:  { dominance: 0.8157, extraversion: 0.6620, patience: 0.7859, formality: 0.9026 },
    weights: { dominance: 0.2558, extraversion: 0.2195, patience: 0.2483, formality: 0.2764 },
  },
  'Project Manager': {
    soc: '11-9199.01',
    target:  { dominance: 0.7894, extraversion: 0.7329, patience: 0.8058, formality: 0.8397 },
    weights: { dominance: 0.2500, extraversion: 0.2356, patience: 0.2539, formality: 0.2605 },
  },
  'Estimator': {
    soc: '13-1051.00',
    target:  { dominance: 0.7065, extraversion: 0.6545, patience: 0.7432, formality: 0.8713 },
    weights: { dominance: 0.2430, extraversion: 0.2272, patience: 0.2501, formality: 0.2796 },
  },
  'HVAC Technician': {
    soc: '49-9021.00',
    target:  { dominance: 0.6734, extraversion: 0.6446, patience: 0.7335, formality: 0.8264 },
    weights: { dominance: 0.2415, extraversion: 0.2308, patience: 0.2538, formality: 0.2739 },
  },
  'Plumber': {
    soc: '47-2152.00',
    target:  { dominance: 0.6584, extraversion: 0.6296, patience: 0.7089, formality: 0.8155 },
    weights: { dominance: 0.2418, extraversion: 0.2308, patience: 0.2519, formality: 0.2755 },
  },
  'Electrician': {
    soc: '47-2111.00',
    target:  { dominance: 0.6681, extraversion: 0.6484, patience: 0.7171, formality: 0.8421 },
    weights: { dominance: 0.2398, extraversion: 0.2323, patience: 0.2498, formality: 0.2780 },
  },
  'Staffing Coordinator': {
    soc: '13-1071.00',
    target:  { dominance: 0.7092, extraversion: 0.7984, patience: 0.7946, formality: 0.8112 },
    weights: { dominance: 0.2346, extraversion: 0.2545, patience: 0.2544, formality: 0.2565 },
  },
  'Executive Recruiter': {
    soc: '13-1071.01',
    target:  { dominance: 0.7876, extraversion: 0.7910, patience: 0.8110, formality: 0.7873 },
    weights: { dominance: 0.2506, extraversion: 0.2470, patience: 0.2544, formality: 0.2480 },
  },
  'Roofing Contractor': {
    soc: '47-2181.00',
    target:  { dominance: 0.6720, extraversion: 0.6197, patience: 0.7200, formality: 0.7968 },
    weights: { dominance: 0.2453, extraversion: 0.2284, patience: 0.2546, formality: 0.2717 },
  },
}
