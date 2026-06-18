// Quick sanity test for O*NET title matching
// Run: node scripts/test-onet-match.mjs

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const lookup = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/data/onet-lookup.json'), 'utf-8'))

const STOP_WORDS = new Set(['of', 'the', 'and', 'or', 'a', 'an', 'in', 'for', 'to', 'at', 'by', 'with'])
const ABBR = new Map([
  ['vp', ['vice', 'president']], ['evp', ['executive', 'vice', 'president']],
  ['svp', ['senior', 'vice', 'president']], ['ceo', ['chief', 'executive', 'officer']],
  ['cfo', ['chief', 'financial', 'officer']], ['coo', ['chief', 'operating', 'officer']],
  ['cto', ['chief', 'technology', 'officer']], ['cmo', ['chief', 'marketing', 'officer']],
  ['chro', ['chief', 'human', 'resources', 'officer']], ['cro', ['chief', 'revenue', 'officer']],
  ['md', ['managing', 'director']], ['gm', ['general', 'manager']],
])

function tokenize(text) {
  const raw = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const out = []
  for (const tok of raw) {
    if (ABBR.has(tok)) out.push(...ABBR.get(tok))
    else if (!STOP_WORDS.has(tok)) out.push(tok)
  }
  return out
}

function dice(a, b) {
  if (!a.length || !b.length) return 0
  const sb = new Set(b)
  return (2 * a.filter(t => sb.has(t)).length) / (a.length + b.length)
}

const MGMT = /managers?|executives?|directors?|supervisors?|administrators?|officers?/i

function find(title) {
  const tokens = tokenize(title)
  const isChief = tokens.includes('chief') || tokens.includes('vice') || tokens.includes('president')
  const candidates = isChief ? lookup.occupations.filter(o => MGMT.test(o.title)) : lookup.occupations
  let best = null, bestScore = 0
  for (const occ of candidates) {
    const score = Math.max(
      dice(tokens, tokenize(occ.title)),
      ...occ.alternateTitles.map(t => dice(tokens, tokenize(t)))
    )
    if (score > bestScore) { bestScore = score; best = occ }
  }
  return bestScore >= 0.25 ? { ...best, score: bestScore } : null
}

const tests = ['CFO', 'Chief Financial Officer', 'VP of Sales', 'Chief Revenue Officer',
  'Head of Marketing', 'Director of Operations', 'CHRO', 'General Manager', 'CTO', 'COO']

for (const t of tests) {
  const m = find(t)
  if (m) console.log(`${t.padEnd(30)} → ${m.title.padEnd(35)} [${m.score.toFixed(2)}]`)
  else console.log(`${t.padEnd(30)} → NO MATCH`)
}
