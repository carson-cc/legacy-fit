import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { INTERVIEW_QUESTIONS } from '@/lib/data/questions'
import { ADJECTIVES } from '@/lib/data/adjectives'
import type { Dimension } from '@/lib/data/adjectives'
import { scoreAssessment, fitLabel, getModelConfidence, getPercentileLabel, getBenchmarkComparison, getRecommendationRationale, SCORING_VERSION } from '@/lib/scoring'
import { getTeamFit } from '@/lib/data/teamfit'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  try {
    const invite = await prisma.candidateInvite.findUnique({
      where: { id },
      include: {
        result: true,
        job: { include: { target: true, client: true } },
        outcome: true,
      },
    })

    // Returning 404 (not 403) on cross-tenant access avoids leaking the
    // existence of records in other orgs.
    if (!invite || invite.job.orgId !== ctx.orgId) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    if (!invite.result) return NextResponse.json({ error: 'Assessment not completed' }, { status: 400 })

    const result = invite.result
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
    } catch { /* fallback to zeros */ }

    let hmProfile: string | null = null
    try {
      const hm = await prisma.hiringManagerAssessment.findFirst({
        where: { clientId: invite.job.client.id, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
      })
      if (hm) hmProfile = hm.profileType
    } catch { /* ignore */ }

    const teamFit = getTeamFit(result.profileName, hmProfile)

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

    await prisma.eventLog.create({
      data: { event: 'candidate.viewed', entityId: id, orgId: ctx.orgId, userId: ctx.userId },
    })

    const fitPct = result.fitPct ?? 0
    const totalSignals = (result.list1Count ?? 0) + (result.list2Count ?? 0)

    return NextResponse.json({
      data: {
        id: invite.id,
        name: invite.name,
        email: invite.email,
        completedAt: invite.completedAt,
        stage: invite.stage,
        offLimits: invite.offLimits,
        job: {
          id: invite.job.id,
          title: invite.job.title,
          roleType: invite.job.roleType,
          client: invite.job.client.name,
          target: invite.job.target,
        },
        scores: {
          execution: result.dominance,
          collaboration: result.extraversion,
          adaptability: result.patience,
          ownership: result.formality,
        },
        percentiles: {
          execution: result.domPercentile,
          collaboration: result.extPercentile,
          adaptability: result.patPercentile,
          ownership: result.forPercentile,
        },
        profileName: result.profileName,
        profileGroup: result.profileGroup,
        profile,
        secondaryProfile: secondaryProfile || null,
        adaptationStress: result.adaptationStress,
        fitPct: result.fitPct,
        rushed: result.rushed,
        interviewGuide,
        outcome: invite.outcome,
        teamFit,
        confidence: getModelConfidence(fitPct),
        percentile: getPercentileLabel(fitPct),
        benchmarkComparison: getBenchmarkComparison(fitPct, invite.job.roleType ?? undefined),
        rationale: getRecommendationRationale(fitPct, result.dominance, result.extraversion, result.patience, result.formality),
        recommendation: fitLabel(fitPct),
        trustMeta: [
          `Based on ${totalSignals} behavioral signals`,
          'Role benchmark active',
          'Recommendation generated from calibrated signal analysis',
          `Scoring ${SCORING_VERSION}`,
        ],
        list1Scores,
        list1Count: result.list1Count,
        list2Count: result.list2Count,
        resultId: result.id,
        shareToken: result.shareToken,
        approvedForClient: invite.approvedForClient,
        approvedAt: invite.approvedAt,
      },
    })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
