import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { INTERVIEW_QUESTIONS } from '@/lib/data/questions'
import { ADJECTIVES } from '@/lib/data/adjectives'
import { scoreAssessment, fitLabel, getModelConfidence, getPercentileLabel, getBenchmarkComparison, getRecommendationRationale, computeCompositeDimensions, SCORING_VERSION } from '@/lib/scoring'
import type { Dimension } from '@/lib/data/adjectives'
import { getTeamFit } from '@/lib/data/teamfit'

type Params = { params: Promise<{ shareToken: string }> }

// Public — no auth required. The shareToken IS the credential.
//
// Two added defenses since the audit:
//  1. Rate limit by IP via EventLog count over the past hour.
//  2. Honour shareTokenExpiresAt so issuers can revoke a link.
export async function GET(req: NextRequest, { params }: Params) {
  const { shareToken } = await params

  // Coarse rate limit — abuse a single token from a single IP triggers 429.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateKey = `report_view:${ip}`
  const recent = await prisma.eventLog.count({
    where: { event: 'report.view_attempt', entityId: rateKey, createdAt: { gte: new Date(Date.now() - 3600_000) } },
  })
  if (recent >= 60) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  await prisma.eventLog.create({ data: { event: 'report.view_attempt', entityId: rateKey } })

  try {
    const result = await prisma.assessmentResult.findUnique({
      where: { shareToken },
      include: {
        invite: {
          include: {
            job: { include: { target: true, client: true } },
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (result.shareTokenExpiresAt && result.shareTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Report link has expired' }, { status: 410 })
    }

    const invite = result.invite
    const profile = REFERENCE_PROFILES.find(p => p.name === result.profileName)
    const secondaryProfile = REFERENCE_PROFILES.find(p => p.name === result.secondaryProfile)

    // Re-derive list1 scores from stored raw responses for self-concept overlay
    let list1Scores = { execution: 0, collaboration: 0, adaptability: 0, ownership: 0 }
    try {
      const list1Checked: string[] = JSON.parse(result.list1Responses)
      const list2Checked: string[] = JSON.parse(result.list2Responses)
      const rescored = scoreAssessment(list1Checked, list2Checked, ADJECTIVES)
      list1Scores = {
        execution: rescored.list1Scores.dominance,
        collaboration: rescored.list1Scores.extraversion,
        adaptability: rescored.list1Scores.patience,
        ownership: rescored.list1Scores.formality,
      }
    } catch { /* fallback */ }

    // Interview guide
    const dimensionLabelMap: Record<string, string> = {
      dominance: 'Execution',
      extraversion: 'Collaboration',
      patience: 'Adaptability',
      formality: 'Ownership',
    }

    let interviewGuide: { dimension: string; direction: string; gap: number; questions: string[] }[] = []
    if (invite.job.target) {
      const target = invite.job.target
      const dims: Dimension[] = ['dominance', 'extraversion', 'patience', 'formality']
      const targetScores = { dominance: target.dominance, extraversion: target.extraversion, patience: target.patience, formality: target.formality }
      const candidateScores = { dominance: result.dominance, extraversion: result.extraversion, patience: result.patience, formality: result.formality }

      interviewGuide = dims
        .map(dim => ({
          dimension: dim,
          gap: candidateScores[dim] - targetScores[dim],
          absGap: Math.abs(candidateScores[dim] - targetScores[dim]),
        }))
        .filter(g => g.absGap > 0.20)
        .sort((a, b) => b.absGap - a.absGap)
        .slice(0, 2)
        .map(g => {
          const direction = g.gap < 0 ? 'too_low' : 'too_high'
          return {
            dimension: dimensionLabelMap[g.dimension] || g.dimension,
            direction,
            gap: Math.round(g.gap * 100) / 100,
            questions: INTERVIEW_QUESTIONS[g.dimension as Dimension][direction].slice(0, 2),
          }
        })
    }

    // Team fit with HM profile
    let hmProfile: string | null = null
    try {
      const hm = await prisma.hiringManagerAssessment.findFirst({
        where: { clientId: invite.job.client.id, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
      })
      if (hm) hmProfile = hm.profileType
    } catch { /* ignore */ }
    const teamFit = getTeamFit(result.profileName, hmProfile)

    const fitPct = result.fitPct
    const hasBenchmark = fitPct !== null
    const totalSignals = (result.list1Count ?? 0) + (result.list2Count ?? 0)

    const rawScores = { dominance: result.dominance, extraversion: result.extraversion, patience: result.patience, formality: result.formality }
    const compositeDims = computeCompositeDimensions(rawScores)

    const target = invite.job.target
    const benchmarkDims = target
      ? computeCompositeDimensions({ dominance: target.dominance, extraversion: target.extraversion, patience: target.patience, formality: target.formality })
      : null

    const dimensions = [
      { label: 'Execution',     score: compositeDims.execution,     benchmark: benchmarkDims?.execution     ?? null, delta: benchmarkDims ? compositeDims.execution     - benchmarkDims.execution     : null },
      { label: 'Ownership',     score: compositeDims.ownership,     benchmark: benchmarkDims?.ownership     ?? null, delta: benchmarkDims ? compositeDims.ownership     - benchmarkDims.ownership     : null },
      { label: 'Adaptability',  score: compositeDims.adaptability,  benchmark: benchmarkDims?.adaptability  ?? null, delta: benchmarkDims ? compositeDims.adaptability  - benchmarkDims.adaptability  : null },
      { label: 'Collaboration', score: compositeDims.collaboration, benchmark: benchmarkDims?.collaboration ?? null, delta: benchmarkDims ? compositeDims.collaboration - benchmarkDims.collaboration : null },
      { label: 'Decision Speed',score: compositeDims.decisionSpeed, benchmark: benchmarkDims?.decisionSpeed ?? null, delta: benchmarkDims ? compositeDims.decisionSpeed - benchmarkDims.decisionSpeed : null },
    ]

    const verdict = hasBenchmark ? {
      fitPct,
      recommendation: fitLabel(fitPct!),
      confidence: getModelConfidence(fitPct!),
      percentile: getPercentileLabel(fitPct!),
      benchmarkComparison: getBenchmarkComparison(fitPct!, invite.job.roleType ?? undefined),
      rationale: getRecommendationRationale(fitPct!, result.dominance, result.extraversion, result.patience, result.formality, target),
    } : {
      fitPct: null,
      recommendation: null,
      confidence: null,
      percentile: null,
      benchmarkComparison: 'No role benchmark has been configured for this assessment.',
      rationale: 'Set a role benchmark on this job to generate a behavioral fit score.',
    }

    return NextResponse.json({
      data: {
        name: invite.name,
        completedAt: invite.completedAt,
        job: {
          title: invite.job.title,
          roleType: invite.job.roleType,
          client: invite.job.client.name,
          target: invite.job.target,
        },
        scores: {
          execution:     result.dominance,
          collaboration: result.extraversion,
          adaptability:  result.patience,
          ownership:     result.formality,
        },
        list1Scores,
        percentiles: {
          execution:     result.domPercentile,
          collaboration: result.extPercentile,
          adaptability:  result.patPercentile,
          ownership:     result.forPercentile,
        },
        profileName: result.profileName,
        profileGroup: result.profileGroup,
        profile,
        secondaryProfile: secondaryProfile || null,
        adaptationStress: result.adaptationStress,
        hasBenchmark,
        dimensions,
        ...verdict,
        rushed: result.rushed,
        interviewGuide,
        trustMeta: [
          `Based on ${totalSignals} behavioral signals`,
          hasBenchmark ? 'Role benchmark active' : 'No benchmark — profile only',
          'Recommendation generated from calibrated signal analysis',
          `Scoring ${SCORING_VERSION}`,
        ],
        list1Count: result.list1Count,
        list2Count: result.list2Count,
        resultId: result.id,
        teamFit,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
