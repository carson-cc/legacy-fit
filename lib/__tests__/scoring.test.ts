import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { scoreAssessment, normCDF, fitLabel, computeCompositeDimensions, CompositeFitWeights } from '../scoring'
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
    // When candidate DEPF == target DEPF, composites are identical, all gaps = 0, fitPct = 100
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(allPositives, allPositives, ADJECTIVES, {
      target: { dominance: 1.0, extraversion: 1.0, patience: 1.0, formality: 1.0 },
      compositeWeights: { execution: 0.20, ownership: 0.20, adaptability: 0.20, collaboration: 0.20, decisionSpeed: 0.20 },
    })
    assert.ok(result.fitPct === 100, `Fit should be 100%, got ${result.fitPct}%`)
  })

  it('Test 9: directional — being above target on execution is penalised less than being below by same gap', () => {
    // Isolate execution direction using execution-only weights.
    //
    // Candidate A (all-positives, DEPF 1/1/1/1):
    //   exec = clamp(1*0.40 + 1*0.35 + (1-1)*0.25) = 75
    // Target A (DEPF 0/0/1/0 → patience=1 so (1-P)=0):
    //   exec = clamp(0*0.40 + 0*0.35 + 0*0.25) = 0
    //   → candidate 75pts ABOVE → dir multiplier 0.5
    //   gap=0.75, penalty = min(0.75^1.5*2.5, 0.60)*0.5 = 0.60*0.5 = 0.30 → fitPct=70
    //
    // Candidate B (all-negatives, DEPF 0/0/0/0):
    //   exec = clamp(0*0.40 + 0*0.35 + (1-0)*0.25) = 25
    // Target B (DEPF 1/1/1/1):
    //   exec = 75 → candidate 50pts BELOW → dir multiplier 1.0
    //   gap=0.50, penalty = min(0.50^1.5*2.5, 0.60)*1.0 = min(0.884, 0.60) = 0.60 → fitPct=40
    //
    // fitPct_A(70) > fitPct_B(40) demonstrates the directional penalty.
    const execOnlyWeights: CompositeFitWeights = { execution: 1.0, ownership: 0.0, adaptability: 0.0, collaboration: 0.0, decisionSpeed: 0.0 }
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const allNegatives = ADJECTIVES.filter(a => a.polarity === 'negative').map(a => a.word)

    // Candidate exec=75 ABOVE target exec=0 → gap=75pts, above × 0.5 → fitPct ~70
    const aboveResult = scoreAssessment(allPositives, allPositives, ADJECTIVES, {
      target: { dominance: 0.0, extraversion: 0.0, patience: 1.0, formality: 0.0 },
      compositeWeights: execOnlyWeights,
    })

    // Candidate exec=25 BELOW target exec=75 → gap=50pts, below × 1.0 → fitPct ~40
    const belowResult = scoreAssessment(allNegatives, allNegatives, ADJECTIVES, {
      target: { dominance: 1.0, extraversion: 1.0, patience: 1.0, formality: 1.0 },
      compositeWeights: execOnlyWeights,
    })

    assert.ok(
      aboveResult.fitPct! > belowResult.fitPct!,
      `Above target (${aboveResult.fitPct}%) should score higher than below target (${belowResult.fitPct}%)`,
    )
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

  it('Test 14: small composite gap gives high fit score (≥ 85)', () => {
    // Candidate DEPF 0.5 (midrange), target DEPF 0.55 — tiny gap on all composites
    // Candidate below target, so full below-multiplier (1.0), but gap is tiny → high fitPct
    const result = scoreAssessment([], [], ADJECTIVES, {
      target: { dominance: 0.55, extraversion: 0.55, patience: 0.55, formality: 0.55 },
      compositeWeights: { execution: 0.20, ownership: 0.20, adaptability: 0.20, collaboration: 0.20, decisionSpeed: 0.20 },
    })
    assert.ok(result.fitPct! >= 85,
      `Small composite gap should give fitPct ≥ 85, got ${result.fitPct}%`)
  })

  it('Test 15: larger composite gap gives lower fit score than smaller gap', () => {
    const weights: CompositeFitWeights = { execution: 0.20, ownership: 0.20, adaptability: 0.20, collaboration: 0.20, decisionSpeed: 0.20 }
    // Small gap: candidate 0.5, target 0.55
    const smallGap = scoreAssessment([], [], ADJECTIVES, {
      target: { dominance: 0.55, extraversion: 0.55, patience: 0.55, formality: 0.55 },
      compositeWeights: weights,
    })
    // Large gap: candidate 0.5, target 0.9
    const largeGap = scoreAssessment([], [], ADJECTIVES, {
      target: { dominance: 0.90, extraversion: 0.90, patience: 0.90, formality: 0.90 },
      compositeWeights: weights,
    })
    assert.ok(
      smallGap.fitPct! > largeGap.fitPct!,
      `Small gap (${smallGap.fitPct}%) should score higher than large gap (${largeGap.fitPct}%)`,
    )
  })

  it('Test 16: equal weights, zero gap on 4 dims, 50-point gap on 1 dim above target', () => {
    // Candidate DEPF all 1.0 (all-positives); target DEPF = 1.0 for D/E/P but F = 0.0
    // Composite execution = clamp(F*0.40 + D*0.35 + (1-P)*0.25)
    // Candidate: F=1,D=1,P=1 → exec = clamp(0.40+0.35+0) = 75
    // Target:    F=0,D=1,P=1 → exec = clamp(0+0.35+0) = 35
    // Candidate is 40 pts ABOVE target on execution → above multiplier 0.5
    // Other dims: compute manually to verify ordering — just assert fitPct is within ±10 of expected
    // Expected: penalty only on execution (above), gap=40/100=0.40,
    //           penalty = min(0.40^1.5 * 2.5, 0.60) * 0.5 = min(0.6325*0.5, 0.30) = 0.3163 * 0.20 weight
    //           = 0.0633 → fitPct ≈ round((1 - 0.0633) * 100) = 94 (plus small gaps on other dims)
    const allPositives = ADJECTIVES.filter(a => a.polarity === 'positive').map(a => a.word)
    const result = scoreAssessment(allPositives, allPositives, ADJECTIVES, {
      target: { dominance: 1.0, extraversion: 1.0, patience: 1.0, formality: 0.0 },
      compositeWeights: { execution: 0.20, ownership: 0.20, adaptability: 0.20, collaboration: 0.20, decisionSpeed: 0.20 },
    })
    // Manually: candidate composite vs target composite
    // Candidate: F=1,D=1,E=1,P=1
    //   exec=75, own=80, adapt=0, collab=35, dspd=5 (all clamped)
    // Wait — adapt=clamp((1-1)*0.40 + 1*0.30 + 1*0.30) = clamp(0+0.30+0.30) = 60
    // collab=clamp(1*0.45+1*0.35+(1-1)*0.20) = clamp(0.45+0.35+0) = 80
    // dspd=clamp(1*0.45+(1-1)*0.35+(1-1)*0.20) = clamp(0.45) = 45
    // exec=clamp(1*0.40+1*0.35+(1-1)*0.25) = clamp(0.40+0.35+0) = 75
    // own=clamp(1*0.55+(1-1)*0.25+1*0.20) = clamp(0.55+0+0.20) = 75
    // Target: F=0,D=1,E=1,P=1
    //   exec=clamp(0*0.40+1*0.35+0*0.25)=35, own=clamp(1*0.55+0*0.25+0*0.20)=55
    //   adapt=clamp(1*0.40+1*0.30+1*0.30)=100, collab=80, dspd=clamp(1*0.45+0+1*0.20)=65
    // Gaps (cand - target): exec=40↑, own=20↑, adapt=-40↓, collab=0, dspd=-20↓
    // Penalties (multiplier=5.0):
    //   exec: gap=0.40,dir=0.5 → min(0.40^1.5*5.0,0.60)*0.5=min(1.265,0.60)*0.5=0.30, w=0.20 → 0.06
    //   own:  gap=0.20,dir=0.5 → min(0.20^1.5*5.0,0.60)*0.5=min(0.4472,0.60)*0.5=0.2236, w=0.20 → 0.04472
    //   adapt:gap=0.40,dir=1.0 → 0.60, w=0.20 → 0.12
    //   collab:gap=0,dir=0.65 → 0, w=0.20 → 0
    //   dspd: gap=0.20,dir=1.0 → 0.4472, w=0.20 → 0.08944
    // total = 0.06+0.04472+0.12+0+0.08944 = 0.31416
    // fitPct = round((1-0.31416)*100) = round(68.584) = 69
    assert.ok(result.fitPct! >= 67 && result.fitPct! <= 71,
      `Expected fitPct ~69 (±2), got ${result.fitPct}%`)
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
