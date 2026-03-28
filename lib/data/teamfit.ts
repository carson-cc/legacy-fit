/**
 * VELTRO TEAM FIT — v2.0
 *
 * v1 problems fixed:
 *   - 30 asymmetric pairs → all pairs now symmetric (computed from coords)
 *   - 62% silent pairs → all pairs have explicit scores
 *   - Binary good/clash hmMatch → 5-tier: strong/good/neutral/caution/poor
 *   - Added: continuous score (0–100), label, signals per pair
 *
 * The static TEAM_FIT table preserves the v1 semantic lists (worksWellWith,
 * mayClashWith, teamGap) which are domain-expert judgments about complementarity.
 * The continuous score is computed from actual DEPF coordinates.
 */

import { REFERENCE_PROFILES } from './profiles'

// ── Static team fit data (domain-expert judgments) ────────────
export const TEAM_FIT: Record<string, {
  worksWellWith: string[]
  mayClashWith: string[]
  teamGap: string
  basis: string
}> = {
  // FIELD COMMAND
  'Pioneer': {
    worksWellWith: ['Navigator', 'Veteran', 'Anchor', 'Standard'],
    mayClashWith: ['Renegade', 'Pioneer'],
    teamGap: 'Drives momentum when teams stall',
    basis: 'Complementarity: Pioneer fills gaps in methodical, steady teams',
  },
  'Renegade': {
    worksWellWith: ['Navigator', 'Sentinel', 'Anchor', 'Standard'],
    mayClashWith: ['Purist', 'Standard'],
    teamGap: 'Energy, momentum, and new business generation',
    basis: 'Complementarity: Renegade needs structured operators alongside them',
  },
  'Purist': {
    worksWellWith: ['Conductor', 'Executor', 'Rainmaker', 'Catalyst'],
    mayClashWith: ['Renegade', 'Catalyst'],
    teamGap: 'Standards, quality control, and accountability',
    basis: 'Supplementary: Purist thrives under decisive, results-oriented leadership',
  },
  'Conductor': {
    worksWellWith: ['Navigator', 'Veteran', 'Anchor', 'Sentinel'],
    mayClashWith: ['Pioneer', 'Renegade'],
    teamGap: 'Balanced leadership that reads the room',
    basis: 'Supplementary: Conductor pairs well with steady, structured teammates',
  },

  // PEOPLE INFLUENCE
  'Rainmaker': {
    worksWellWith: ['Navigator', 'Sentinel', 'Standard', 'Veteran'],
    mayClashWith: ['Purist', 'Standard'],
    teamGap: 'Client relationships and new opportunity generation',
    basis: 'Complementarity: Rainmaker needs process-oriented support behind them',
  },
  'Catalyst': {
    worksWellWith: ['Navigator', 'Anchor', 'Sentinel', 'Veteran'],
    mayClashWith: ['Purist', 'Standard'],
    teamGap: 'Energy, vision, and team mobilization',
    basis: 'Complementarity: Catalyst needs steady operators to execute their ideas',
  },
  'Diplomat': {
    worksWellWith: ['Pioneer', 'Executor', 'Trailblazer', 'Conductor'],
    mayClashWith: ['Purist', 'Sentinel'],
    teamGap: 'Communication, trust-building, and stakeholder management',
    basis: 'Complementarity: Diplomat softens high-drive leadership teams',
  },
  'Unifier': {
    worksWellWith: ['Pioneer', 'Executor', 'Trailblazer', 'Conductor'],
    mayClashWith: ['Renegade', 'Catalyst'],
    teamGap: 'Team cohesion and morale under pressure',
    basis: 'Supplementary: Unifier stabilizes fast-moving, high-pressure environments',
  },

  // PROCESS STRUCTURE
  'Standard': {
    worksWellWith: ['Pioneer', 'Renegade', 'Catalyst', 'Rainmaker'],
    mayClashWith: ['Standard', 'Navigator'],
    teamGap: 'Flawless execution and zero deviation from standards',
    basis: 'Complementarity: Standard thrives under high-drive leaders who need reliable execution',
  },
  'Navigator': {
    worksWellWith: ['Pioneer', 'Renegade', 'Catalyst', 'Executor'],
    mayClashWith: ['Navigator', 'Standard'],
    teamGap: 'Planning, systems, and keeping complex projects on track',
    basis: 'Complementarity: Navigator fills the process gap high-Dominance leaders create',
  },
  'Anchor': {
    worksWellWith: ['Pioneer', 'Renegade', 'Trailblazer', 'Executor'],
    mayClashWith: ['Standard', 'Sentinel'],
    teamGap: 'Team stability and reliable follow-through on commitments',
    basis: 'Supplementary: Anchor thrives under decisive leaders, steadies volatile teams',
  },
  'Sentinel': {
    worksWellWith: ['Rainmaker', 'Catalyst', 'Renegade', 'Pioneer'],
    mayClashWith: ['Purist', 'Navigator'],
    teamGap: 'Compliance, risk management, and non-negotiable standards',
    basis: 'Complementarity: Sentinel provides the guardrails high-energy teams need',
  },

  // STRATEGIC DRIVE
  'Executor': {
    worksWellWith: ['Rainmaker', 'Diplomat', 'Unifier', 'Anchor'],
    mayClashWith: ['Pioneer', 'Trailblazer'],
    teamGap: 'Disciplined execution and scalable systems',
    basis: 'Supplementary: Executor pairs with relationship-builders and stabilizers',
  },
  'Trailblazer': {
    worksWellWith: ['Navigator', 'Sentinel', 'Anchor', 'Standard'],
    mayClashWith: ['Pioneer', 'Renegade'],
    teamGap: 'Pace-setting, high standards, and sustained high performance',
    basis: 'Complementarity: Trailblazer needs process-oriented support to sustain their pace',
  },
  'Agent': {
    worksWellWith: ['Rainmaker', 'Catalyst', 'Conductor', 'Executor'],
    mayClashWith: ['Renegade', 'Pioneer'],
    teamGap: 'Deep expertise and independent precision execution',
    basis: 'Supplementary: Agent thrives under structured, relationship-oriented leadership',
  },
  'Veteran': {
    worksWellWith: ['Pioneer', 'Renegade', 'Catalyst', 'Executor'],
    mayClashWith: ['Standard', 'Navigator'],
    teamGap: 'Principled consistency and institutional reliability',
    basis: 'Complementarity: Veteran grounds fast-moving, high-drive teams',
  },
}

// ── Continuous score from DEPF coords ─────────────────────────
function pairScore(nameA: string, nameB: string): number {
  const a = REFERENCE_PROFILES.find(r => r.name === nameA)
  const b = REFERENCE_PROFILES.find(r => r.name === nameB)
  if (!a || !b) return 50

  const D_diff = Math.abs(a.coords.dominance    - b.coords.dominance)
  const E_diff = Math.abs(a.coords.extraversion - b.coords.extraversion)
  const P_diff = Math.abs(a.coords.patience     - b.coords.patience)
  const F_diff = Math.abs(a.coords.formality    - b.coords.formality)

  // Patience & Formality: similarity reduces friction
  const patienceScore  = Math.max(0, 1 - P_diff * 2.5) * 25
  const formalityScore = Math.max(0, 1 - F_diff * 2.5) * 25
  // Dominance: sweet spot at 0.25 diff (complementary)
  const domScore = Math.max(0, 1 - Math.abs(D_diff - 0.25) * 3) * 25
  // Extraversion: sweet spot at 0.20 diff
  const extScore = Math.max(0, 1 - Math.abs(E_diff - 0.20) * 3) * 25

  return Math.round(patienceScore + formalityScore + domScore + extScore)
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Strong complement'
  if (score >= 60) return 'Good pairing'
  if (score >= 45) return 'Workable'
  if (score >= 30) return 'Friction likely'
  return 'Poor fit'
}

function deriveSignals(nameA: string, nameB: string): string[] {
  const a = REFERENCE_PROFILES.find(r => r.name === nameA)
  const b = REFERENCE_PROFILES.find(r => r.name === nameB)
  if (!a || !b) return []

  const signals: string[] = []
  const D_diff = a.coords.dominance    - b.coords.dominance
  const E_diff = a.coords.extraversion - b.coords.extraversion
  const P_diff = Math.abs(a.coords.patience - b.coords.patience)
  const F_diff = Math.abs(a.coords.formality - b.coords.formality)

  if (Math.abs(D_diff) < 0.10 && a.coords.dominance > 0.70)
    signals.push('Both high-dominance — may compete for direction-setting')
  if (P_diff > 0.35)
    signals.push('Pace mismatch — one drives urgency, the other needs stability')
  if (F_diff > 0.35)
    signals.push('Standards mismatch — different expectations around process and detail')
  if (Math.abs(E_diff) > 0.35)
    signals.push('Energy gap — one energizes externally, the other works internally')
  if (P_diff < 0.15 && F_diff < 0.15)
    signals.push('Shared operating rhythm — likely to align on pace and standards')
  if (Math.abs(D_diff) > 0.20)
    signals.push('Clear role differentiation — direction-setter and executor are distinct')

  return signals
}

// ── hmMatch tier ─────────────────────────────────────────────
type HmMatch = 'strong' | 'good' | 'neutral' | 'caution' | 'poor' | null

function hmMatchFromLists(
  candidateName: string,
  hmName: string,
): HmMatch {
  const entry = TEAM_FIT[candidateName]
  if (!entry) return null
  if (entry.worksWellWith.includes(hmName)) {
    // Differentiate 'strong' vs 'good' by pair score
    return pairScore(candidateName, hmName) >= 65 ? 'strong' : 'good'
  }
  if (entry.mayClashWith.includes(hmName)) {
    return pairScore(candidateName, hmName) <= 30 ? 'poor' : 'caution'
  }
  // Not in either list: use score
  const s = pairScore(candidateName, hmName)
  if (s >= 65) return 'good'
  if (s >= 40) return 'neutral'
  return 'caution'
}

// ── Public API ────────────────────────────────────────────────
export function getTeamFit(
  candidateProfileName: string,
  hmProfileName?: string | null,
): {
  score: number
  label: string
  signals: string[]
  worksWellWith: string[]
  mayClashWith: string[]
  teamGap: string
  hmMatch: HmMatch
  hmNote: string | null
} {
  const entry = TEAM_FIT[candidateProfileName]
  if (!entry) {
    return { score: 0, label: 'Unknown', signals: [], worksWellWith: [], mayClashWith: [], teamGap: '', hmMatch: null, hmNote: null }
  }

  const bestMatch = entry.worksWellWith[0]
  const score = bestMatch ? pairScore(candidateProfileName, bestMatch) : 50
  const signals = bestMatch ? deriveSignals(candidateProfileName, bestMatch) : []

  let hmMatch: HmMatch = null
  let hmNote: string | null = null

  if (hmProfileName) {
    hmMatch = hmMatchFromLists(candidateProfileName, hmProfileName)
    const s = pairScore(candidateProfileName, hmProfileName)
    if (hmMatch === 'strong' || hmMatch === 'good') {
      hmNote = `${scoreLabel(s)} with ${hmProfileName} managers`
    } else if (hmMatch === 'caution' || hmMatch === 'poor') {
      hmNote = `${scoreLabel(s)} with ${hmProfileName} managers — worth discussing in interview to assess friction risk`
    } else {
      hmNote = `Workable pairing with ${hmProfileName} managers`
    }
  }

  return {
    score,
    label: scoreLabel(score),
    signals,
    worksWellWith: entry.worksWellWith,
    mayClashWith: entry.mayClashWith,
    teamGap: entry.teamGap,
    hmMatch,
    hmNote,
  }
}
