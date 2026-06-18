import rawLookup from './data/onet-lookup.json'

interface OnetOccupation {
  socCode: string
  title: string
  alternateTitles: string[]
  workStyles: Record<string, number>
}

const LOOKUP = rawLookup as { version: string; occupations: OnetOccupation[] }

const STOP_WORDS = new Set(['of', 'the', 'and', 'or', 'a', 'an', 'in', 'for', 'to', 'at', 'by', 'with'])

// Common executive title abbreviations → expanded tokens
const ABBR: Record<string, string[]> = {
  vp:   ['vice', 'president'],
  evp:  ['executive', 'vice', 'president'],
  svp:  ['senior', 'vice', 'president'],
  ceo:  ['chief', 'executive', 'officer'],
  cfo:  ['chief', 'financial', 'officer'],
  coo:  ['chief', 'operating', 'officer'],
  cto:  ['chief', 'technology', 'officer'],
  cmo:  ['chief', 'marketing', 'officer'],
  chro: ['chief', 'human', 'resources', 'officer'],
  ciso: ['chief', 'information', 'security', 'officer'],
  cso:  ['chief', 'strategy', 'officer'],
  cro:  ['chief', 'revenue', 'officer'],
  cpo:  ['chief', 'product', 'officer'],
  md:   ['managing', 'director'],
  gm:   ['general', 'manager'],
  hr:   ['human', 'resources'],
  bd:   ['business', 'development'],
  it:   ['information', 'technology'],
}

function tokenize(text: string): string[] {
  const raw = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const expanded: string[] = []
  for (const tok of raw) {
    if (ABBR[tok]) {
      expanded.push(...ABBR[tok])
    } else if (!STOP_WORDS.has(tok)) {
      expanded.push(tok)
    }
  }
  return expanded
}

function diceScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0
  const setB = new Set(b)
  const matches = a.filter(t => setB.has(t)).length
  return (2 * matches) / (a.length + b.length)
}

function scoreOccupation(queryTokens: string[], occ: OnetOccupation): number {
  const canonical = diceScore(queryTokens, tokenize(occ.title))
  const alternates = occ.alternateTitles.map(t => diceScore(queryTokens, tokenize(t)))
  return Math.max(canonical, ...alternates)
}

export interface OnetMatch {
  socCode: string
  title: string
  workStyles: Record<string, number>
  matchScore: number
}

const MGMT_PATTERN = /managers?|executives?|directors?|supervisors?|administrators?|officers?/i

export function findOccupation(roleTitle: string): OnetMatch | null {
  const tokens = tokenize(roleTitle)
  if (!tokens.length) return null

  // "Chief X" roles are always management — restrict search to avoid false
  // alternate-title matches like "Revenue Officer" → Tax Examiners
  const isChiefRole = tokens.includes('chief') || tokens.includes('vice') || tokens.includes('president')
  const candidates = isChiefRole
    ? LOOKUP.occupations.filter(o => MGMT_PATTERN.test(o.title))
    : LOOKUP.occupations

  let best: OnetMatch | null = null
  let bestScore = 0

  for (const occ of candidates) {
    const score = scoreOccupation(tokens, occ)
    if (score > bestScore) {
      bestScore = score
      best = { socCode: occ.socCode, title: occ.title, workStyles: occ.workStyles, matchScore: score }
    }
  }

  return bestScore >= 0.25 ? best : null
}

// Sorts work styles by WI value and formats for Claude prompt injection
export function formatWorkStyleContext(match: OnetMatch): string {
  const sorted = Object.entries(match.workStyles).sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, 7)
  const bottom = sorted.slice(-4)

  const fmt = (entries: [string, number][]) =>
    entries.map(([k, v]) => `  ${k}: ${v.toFixed(2)}`).join('\n')

  return [
    `O*NET 30.3 Work Importance scores — ${match.title} (${match.socCode}):`,
    `High priority traits:`,
    fmt(top),
    `Lower priority traits:`,
    fmt(bottom),
  ].join('\n')
}
