import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { scoreAssessment, normCDF, fitLabel } from '../scoring'
import { ADJECTIVES } from '../data/adjectives'
import { REFERENCE_PROFILES } from '../data/profiles'

// Helper: get all words for a dimension+polarity
function wordsFor(dim: string, pol: string): string[] {
  return ADJECTIVES.filter(a => a.dimension === dim && a.polarity === pol).map(a => a.word)
}

describe('adjective bank integrity', () => {
  it('has exactly 80 adjectives', () => {
    assert.equal(ADJECTIVES.length, 80, `Expected 80 adjectives, got ${ADJECTIVES.length}`)
  })

  it('has 10 positive + 10 negative per dimension', () => {
    for (const dim of ['dominance', 'extraversion', 'patience', 'formality']) {
      const pos = ADJECTIVES.filter(a => a.dimension === dim && a.polarity === 'positive').length
      const neg = ADJECTIVES.filter(a => a.dimension === dim && a.polarity === 'negative').length
      assert.equal(pos, 10, `${dim} should have 10 positive, got ${pos}`)
      assert.equal(neg, 10, `${dim} should have 10 negative, got ${neg}`)
    }
  })

  it('has no duplicate words', () => {
    const words = ADJECTIVES.map(a => a.word)
    const unique = new Set(words)
    assert.equal(unique.size, words.length, `Found duplicate words`)
  })
})

describe('normCDF', () => {
  it('returns ~0.5 for z=0', () => {
    const p = normCDF(0)
    assert.ok(Math.abs(p - 0.5) < 0.01, `Expected ~0.5, got ${p}`)
  })

  it('returns ~0.8413 for z=1', () => {
    const p = normCDF(1)
    assert.ok(Math.abs(p - 0.8413) < 0.01, `Expected ~0.8413, got ${p}`)
  })

  it('returns ~0.1587 for z=-1', () => {
    const p = normCDF(-1)
    assert.ok(Math.abs(p - 0.1587) < 0.01, `Expected ~0.1587, got ${p}`)
  })
})

describe('fitLabel', () => {
  it('returns correct labels at thresholds (v2 — 55 is new Needs Discussion floor)', () => {
    assert.equal(fitLabel(100), 'Strong Fit')
    assert.equal(fitLabel(85), 'Strong Fit')
    assert.equal(fitLabel(84), 'Explore Further')
    assert.equal(fitLabel(70), 'Explore Further')
    assert.equal(fitLabel(69), 'Needs Discussion')
    assert.equal(fitLabel(55), 'Needs Discussion')
    assert.equal(fitLabel(54), 'Low Fit')
    assert.equal(fitLabel(40), 'Low Fit')
    assert.equal(fitLabel(0), 'Low Fit')
  })
})

describe('scoreAssessment', () => {
  it('Test 1: all positive words checked → high scores (1.0) across all dimensions', () => {
    // With 10+10 per dim: 10 pos checked (5) + 10 neg unchecked (5) = avg 5, norm = 1.0
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(allPositives, allPositives)

    assert.ok(result.scores.dominance === 1.0, `Dominance should be 1.0, got ${result.scores.dominance}`)
    assert.ok(result.scores.extraversion === 1.0, `Extraversion should be 1.0, got ${result.scores.extraversion}`)
    assert.ok(result.scores.patience === 1.0, `Patience should be 1.0, got ${result.scores.patience}`)
    assert.ok(result.scores.formality === 1.0, `Formality should be 1.0, got ${result.scores.formality}`)
  })

  it('Test 2: no words checked → midrange scores (0.5)', () => {
    // 10 pos unchecked (1) + 10 neg unchecked (5) = avg (10+50)/20 = 3, norm = 0.5
    const result = scoreAssessment([], [])

    assert.ok(result.scores.dominance === 0.5, `Dominance should be 0.5, got ${result.scores.dominance}`)
    assert.ok(result.scores.extraversion === 0.5, `Extraversion should be 0.5, got ${result.scores.extraversion}`)
    assert.ok(result.scores.patience === 0.5, `Patience should be 0.5, got ${result.scores.patience}`)
    assert.ok(result.scores.formality === 0.5, `Formality should be 0.5, got ${result.scores.formality}`)
  })

  it('Test 3: all negatives checked → low scores (0.0)', () => {
    // 10 pos unchecked (1) + 10 neg checked (1) = avg 1, norm = 0.0
    const allNegatives = ADJECTIVES.filter(a => a.polarity === 'negative').map(a => a.word)
    const result = scoreAssessment(allNegatives, allNegatives)

    assert.ok(result.scores.dominance === 0.0, `Dominance should be 0.0, got ${result.scores.dominance}`)
    assert.ok(result.scores.extraversion === 0.0, `Extraversion should be 0.0, got ${result.scores.extraversion}`)
    assert.ok(result.scores.patience === 0.0, `Patience should be 0.0, got ${result.scores.patience}`)
    assert.ok(result.scores.formality === 0.0, `Formality should be 0.0, got ${result.scores.formality}`)
  })

  it('Test 4: only dominance positives checked → high dominance, mid others', () => {
    const domPositives = wordsFor('dominance', 'positive')
    const result = scoreAssessment(domPositives, domPositives)

    // Dominance: 10 pos checked (5) + 10 neg unchecked (5) = avg 5, norm = 1.0
    assert.ok(result.scores.dominance === 1.0, `Dominance should be 1.0, got ${result.scores.dominance}`)
    // Others: 10 pos unchecked (1) + 10 neg unchecked (5) = avg 3, norm = 0.5
    assert.ok(result.scores.extraversion === 0.5, `Extraversion should be 0.5, got ${result.scores.extraversion}`)
    assert.ok(result.scores.patience === 0.5, `Patience should be 0.5, got ${result.scores.patience}`)
    assert.ok(result.scores.formality === 0.5, `Formality should be 0.5, got ${result.scores.formality}`)
  })

  it('Test 5: Pioneer-like input produces field_command profile', () => {
    // Target: D≈0.85, E≈0.70, P≈0.25, F≈0.60
    // With 10+10 per dim, check N of 10 positives to get score:
    // score = ((N*5 + (10-N)*1) + (M_neg_checked*1 + (10-M_neg_checked)*5)) / 20
    // For D high: check 9/10 pos, 0/10 neg → (45+5+50)/20 = 100/20 = 5.0... wait
    // Actually: score for each item: pos checked=5, pos unchecked=1, neg checked=1, neg unchecked=5
    // D: 9 pos checked (9*5=45) + 1 pos unchecked (1*1=1) + 0 neg checked (0) + 10 neg unchecked (10*5=50) = sum=96, avg=96/20=4.8, norm=(4.8-1)/4=0.95
    // E: 7 pos checked + 3 unchecked + 0 neg checked + 10 neg unchecked = 35+3+50=88, avg=4.4, norm=0.85
    // P: 0 pos checked + 10 unchecked + 8 neg checked + 2 neg unchecked = 10+8+10=28, avg=1.4, norm=0.10
    // F: 5 pos checked + 5 unchecked + 1 neg checked + 9 neg unchecked = 25+5+1+45=76, avg=3.8, norm=0.70

    const list2 = [
      ...wordsFor('dominance', 'positive').slice(0, 9),
      ...wordsFor('extraversion', 'positive').slice(0, 7),
      ...wordsFor('patience', 'negative').slice(0, 8),
      ...wordsFor('formality', 'positive').slice(0, 5),
      ...wordsFor('formality', 'negative').slice(0, 1),
    ]

    const result = scoreAssessment(list2, list2)

    assert.ok(
      result.profile.group === 'field_command',
      `Expected field_command group, got ${result.profile.group} (${result.profile.name})`
    )
  })

  it('Test 6: adaptation stress is high when lists differ maximally', () => {
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const allNegatives = ADJECTIVES.filter(a => a.polarity === 'negative').map(a => a.word)

    const result = scoreAssessment(allPositives, allNegatives)

    // List 1: all 1.0, List 2: all 0.0, delta = 1.0 per dim, stress = 1.0
    assert.ok(result.adaptationStress === 1.0, `Adaptation stress should be 1.0, got ${result.adaptationStress}`)
  })

  it('Test 7: adaptation stress is zero when lists match', () => {
    const words = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(words, words)
    assert.ok(result.adaptationStress === 0.0, `Adaptation stress should be 0, got ${result.adaptationStress}`)
  })

  it('Test 8: fit scoring with exact match target = 100%', () => {
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(allPositives, allPositives, ADJECTIVES, {
      target: { dominance: 1.0, extraversion: 1.0, patience: 1.0, formality: 1.0 },
      weights: { dominance: 0.25, extraversion: 0.25, patience: 0.25, formality: 0.25 },
    })
    assert.ok(result.fitPct === 100, `Fit should be 100%, got ${result.fitPct}%`)
  })

  it('Test 9: v2 quadratic — max gap (1.0) with equal weights = 40%', () => {
    // gap=1.0, penalty = min(1.0^1.5 * 2.5, 0.60) = 0.60
    // total = 0.60 * 0.25 * 4 = 0.60, fit = 40%
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(allPositives, allPositives, ADJECTIVES, {
      target: { dominance: 0.0, extraversion: 0.0, patience: 0.0, formality: 0.0 },
      weights: { dominance: 0.25, extraversion: 0.25, patience: 0.25, formality: 0.25 },
    })
    assert.ok(result.fitPct === 40, `Fit should be 40%, got ${result.fitPct}%`)
  })

  it('Test 10: 16 unique profiles exist', () => {
    const names = new Set(REFERENCE_PROFILES.map(p => p.name))
    assert.equal(names.size, 16, `Should have 16 unique profiles, got ${names.size}`)
  })

  it('Test 11: scores never go below 0 or above 1', () => {
    const allWords = ADJECTIVES.map(a => a.word)
    const result1 = scoreAssessment(allWords, allWords)

    for (const dim of ['dominance', 'extraversion', 'patience', 'formality'] as const) {
      assert.ok(result1.scores[dim] >= 0, `${dim} score should be >= 0`)
      assert.ok(result1.scores[dim] <= 1, `${dim} score should be <= 1`)
    }

    const result2 = scoreAssessment([], [])
    for (const dim of ['dominance', 'extraversion', 'patience', 'formality'] as const) {
      assert.ok(result2.scores[dim] >= 0, `${dim} score should be >= 0`)
      assert.ok(result2.scores[dim] <= 1, `${dim} score should be <= 1`)
    }
  })

  it('Test 12: percentiles are between 0 and 100', () => {
    const words = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(words, words)

    for (const dim of ['dominance', 'extraversion', 'patience', 'formality'] as const) {
      assert.ok(result.percentiles[dim] >= 0, `${dim} percentile should be >= 0`)
      assert.ok(result.percentiles[dim] <= 100, `${dim} percentile should be <= 100`)
    }
  })

  it('Test 13: all words checked produces score of 0.5 (positives and negatives cancel)', () => {
    // All checked: 10 pos checked (5) + 10 neg checked (1) = 60/20 = 3.0, norm = 0.5
    const allWords = ADJECTIVES.map(a => a.word)
    const result = scoreAssessment(allWords, allWords)

    for (const dim of ['dominance', 'extraversion', 'patience', 'formality'] as const) {
      assert.ok(result.scores[dim] === 0.5, `${dim} should be 0.5 with all words checked, got ${result.scores[dim]}`)
    }
  })

  it('Test 14: v2 quadratic — gap=0.20 equal weights → ~93%', () => {
    // gap=0.20, penalty = min(0.20^1.5 * 2.5, 0.60) = min(0.0894*2.5, 0.60) = 0.2236
    // total = 0.2236 * 0.25 * 4 = 0.2236, fit = round((1-0.2236)*100) = 78
    // Candidate score = 0.5, target = 0.7 → gap = 0.2 per dim
    const result = scoreAssessment([], [], ADJECTIVES, {
      target: { dominance: 0.7, extraversion: 0.7, patience: 0.7, formality: 0.7 },
      weights: { dominance: 0.25, extraversion: 0.25, patience: 0.25, formality: 0.25 },
    })
    assert.ok(result.fitPct! >= 75 && result.fitPct! <= 82,
      `Fit for gap=0.20 should be ~78%, got ${result.fitPct}%`)
  })

  it('Test 15: v2 quadratic — gap=0.30 equal weights → ~59%', () => {
    // gap=0.30, penalty = min(0.30^1.5 * 2.5, 0.60) = min(0.1643*2.5, 0.60) = 0.4108
    // total = 0.4108 * 0.25 * 4 = 0.4108, fit = round((1-0.4108)*100) = 59
    const result = scoreAssessment([], [], ADJECTIVES, {
      target: { dominance: 0.8, extraversion: 0.8, patience: 0.8, formality: 0.8 },
      weights: { dominance: 0.25, extraversion: 0.25, patience: 0.25, formality: 0.25 },
    })
    assert.ok(result.fitPct! >= 55 && result.fitPct! <= 62,
      `Fit for gap=0.30 should be ~59%, got ${result.fitPct}%`)
  })

  it('Test 16: v1_stepped variant still works when specified', () => {
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(allPositives, allPositives, ADJECTIVES, {
      target: { dominance: 0.0, extraversion: 0.0, patience: 0.0, formality: 0.0 },
      weights: { dominance: 0.25, extraversion: 0.25, patience: 0.25, formality: 0.25 },
    }, 'v1_stepped')
    // v1: penalty = 0.30 per dim, total = 0.30, fit = 70%
    assert.ok(result.fitPct === 70, `v1_stepped fit should be 70%, got ${result.fitPct}%`)
  })

  it('Test 17: fitLabel boundary at 55 (new Needs Discussion floor)', () => {
    assert.equal(fitLabel(56), 'Needs Discussion')
    assert.equal(fitLabel(55), 'Needs Discussion')
    assert.equal(fitLabel(54), 'Low Fit')
  })
})

// ────────────────────────────────────────────────────────
// Team Fit tests
// ────────────────────────────────────────────────────────
import { getTeamFit, TEAM_FIT } from '../data/teamfit'

describe('getTeamFit', () => {
  it('Test 25: returns data with no HM profile', () => {
    const result = getTeamFit('Pioneer', null)
    assert.equal(result.hmMatch, null)
    assert.equal(result.hmNote, null)
    assert.ok(result.worksWellWith.includes('Navigator'), 'Pioneer should work well with Navigator')
    assert.ok(result.mayClashWith.includes('Renegade'), 'Pioneer may clash with Renegade')
  })

  it('Test 26: good match when HM profile is in worksWellWith', () => {
    const result = getTeamFit('Pioneer', 'Navigator')
    assert.equal(result.hmMatch, 'good')
    assert.ok(result.hmNote?.includes('Navigator'), `hmNote should mention Navigator, got: ${result.hmNote}`)
  })

  it('Test 27: caution when HM profile is in mayClashWith', () => {
    const result = getTeamFit('Pioneer', 'Renegade')
    assert.equal(result.hmMatch, 'caution')
    assert.ok(result.hmNote?.includes('friction'), `hmNote should mention friction, got: ${result.hmNote}`)
  })

  it('Test 28: all 16 profiles return non-empty arrays', () => {
    const profiles = REFERENCE_PROFILES.map(p => p.name)
    for (const name of profiles) {
      const result = getTeamFit(name)
      assert.ok(result.worksWellWith.length > 0, `${name} should have worksWellWith entries`)
      assert.ok(result.mayClashWith.length > 0, `${name} should have mayClashWith entries`)
      assert.ok(result.teamGap.length > 0, `${name} should have a teamGap string`)
    }
  })

  it('Test 29: TEAM_FIT covers all 16 profiles', () => {
    assert.equal(Object.keys(TEAM_FIT).length, 16, `Should have 16 entries, got ${Object.keys(TEAM_FIT).length}`)
  })
})
