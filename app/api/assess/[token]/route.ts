import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scoreAssessment, SCORING_VERSION, fitLabel, getModelConfidence, getPercentileLabel } from '@/lib/scoring'
import { ADJECTIVES } from '@/lib/data/adjectives'
import { ROLE_PRESETS } from '@/lib/data/norms'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { sendCandidateProfileEmail, sendRecruiterNotificationEmail } from '@/lib/email'
import { generateCandidateProfilePdf } from '@/lib/pdf'

type Params = { params: Promise<{ token: string }> }

// GET: fetch invite info for assessment page
export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params
  try {
    // Check CandidateInvite first
    const invite = await prisma.candidateInvite.findUnique({
      where: { token },
      include: { result: true, job: { include: { target: true } } },
    })

    if (invite) {
      if (invite.result) {
        const profile = REFERENCE_PROFILES.find(p => p.name === invite.result!.profileName)
        return NextResponse.json({
          completed: true,
          profileName: invite.result.profileName,
          profileGroup: profile?.groupLabel || invite.result.profileGroup,
          tagline: profile?.tagline || '',
          description: profile?.description || '',
          candidateName: invite.name,
        })
      }
      return NextResponse.json({
        completed: false,
        candidateName: invite.name,
        jobTitle: invite.job.title,
      })
    }

    // Check HiringManagerAssessment
    const hmInvite = await prisma.hiringManagerAssessment.findUnique({ where: { token } })
    if (hmInvite) {
      if (hmInvite.completedAt) {
        const profile = REFERENCE_PROFILES.find(p => p.name === hmInvite.profileType)
        return NextResponse.json({
          completed: true,
          type: 'hiring_manager',
          profileName: hmInvite.profileType,
          profileGroup: profile?.groupLabel || '',
          tagline: profile?.tagline || '',
          description: profile?.description || '',
          candidateName: hmInvite.name,
        })
      }
      return NextResponse.json({
        completed: false,
        type: 'hiring_manager',
        candidateName: hmInvite.name,
      })
    }

    return NextResponse.json({ error: 'Invalid assessment link' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: submit assessment
export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  try {
    // Rate limiting — max 5 attempts per hour
    const recentAttempts = await prisma.eventLog.count({
      where: {
        event: 'assessment.submit_attempt',
        entityId: token,
        createdAt: { gte: new Date(Date.now() - 3600000) },
      },
    })
    if (recentAttempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts. Please wait before trying again.' }, { status: 429 })
    }
    await prisma.eventLog.create({ data: { event: 'assessment.submit_attempt', entityId: token } })

    const body = await req.json()
    const {
      list1Checked, list2Checked, list1Order, list2Order,
      timeOnPage1Ms, timeOnPage2Ms, scoringVariant: clientVariant,
    } = body as {
      list1Checked: string[]; list2Checked: string[]
      list1Order: string[]; list2Order: string[]
      timeOnPage1Ms: number; timeOnPage2Ms: number
      scoringVariant?: string
    }

    if (!Array.isArray(list1Checked) || !Array.isArray(list2Checked) ||
        list1Checked.length < 10 || list2Checked.length < 10) {
      return NextResponse.json({ error: 'Minimum 10 selections required per list' }, { status: 400 })
    }
    if (list1Checked.some(w => typeof w !== 'string') || list2Checked.some(w => typeof w !== 'string')) {
      return NextResponse.json({ error: 'Invalid selection data' }, { status: 400 })
    }

    const variant = (clientVariant === 'v1_stepped' ? 'v1_stepped' : 'v2_quadratic') as 'v1_stepped' | 'v2_quadratic'

    // Check CandidateInvite first
    const invite = await prisma.candidateInvite.findUnique({
      where: { token },
      include: { result: true, job: { include: { target: true } } },
    })

    if (invite) {
      if (invite.result) {
        return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })
      }

      // Build job target for fit scoring
      let jobTarget = null
      if (invite.job.target) {
        const t = invite.job.target
        const roleWeights = ROLE_PRESETS[invite.job.roleType as keyof typeof ROLE_PRESETS]
        if (roleWeights) {
          jobTarget = {
            target: { dominance: t.dominance, extraversion: t.extraversion, patience: t.patience, formality: t.formality },
            weights: { ...roleWeights },
          }
        }
      }

      const result = scoreAssessment(list1Checked, list2Checked, ADJECTIVES, jobTarget, variant)
      const rushed = (timeOnPage1Ms != null && timeOnPage1Ms < 45000) || (timeOnPage2Ms != null && timeOnPage2Ms < 45000)

      const savedResult = await prisma.assessmentResult.create({
        data: {
          inviteId: invite.id,
          dominance: result.scores.dominance,
          extraversion: result.scores.extraversion,
          patience: result.scores.patience,
          formality: result.scores.formality,
          domPercentile: result.percentiles.dominance,
          extPercentile: result.percentiles.extraversion,
          patPercentile: result.percentiles.patience,
          forPercentile: result.percentiles.formality,
          profileName: result.profile.name,
          profileGroup: result.profile.group,
          secondaryProfile: result.secondaryProfile.name,
          adaptationStress: result.adaptationStress,
          fitPct: result.fitPct,
          list1Responses: JSON.stringify(list1Checked),
          list2Responses: JSON.stringify(list2Checked),
          list1Order: JSON.stringify(list1Order),
          list2Order: JSON.stringify(list2Order),
          list1Count: list1Checked.length,
          list2Count: list2Checked.length,
          timeOnPage1Ms, timeOnPage2Ms,
          scoringVersion: SCORING_VERSION,
          scoringVariant: variant,
          rushed,
        },
      })

      await prisma.candidateInvite.update({ where: { id: invite.id }, data: { completedAt: new Date() } })
      await prisma.eventLog.create({ data: { event: 'assessment.scored', entityId: invite.id, meta: JSON.stringify({ profileName: result.profile.name, variant }) } })

      // Fire both emails in parallel without blocking the response
      const candidateEmail = invite.email
      const candidateName = invite.name ?? 'Candidate'
      if (candidateEmail) {
        const fitPct = result.fitPct ?? 0
        const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const reportUrl = `${appUrl}/report/${savedResult.shareToken}`

        Promise.all([
          generateCandidateProfilePdf(candidateName, result.profile)
            .then(pdfBuffer =>
              sendCandidateProfileEmail({
                candidateName,
                candidateEmail,
                profile: result.profile,
                pdfBuffer,
              })
            ),
          prisma.user.findFirst().then(recruiter => {
            if (!recruiter?.email) return
            return sendRecruiterNotificationEmail({
              recruiterEmail: recruiter.email,
              candidateName,
              jobTitle: invite.job.title,
              fitPct,
              recommendation: fitLabel(fitPct),
              confidence: getModelConfidence(fitPct),
              percentileLabel: getPercentileLabel(fitPct),
              reportUrl,
            })
          }),
        ]).catch(err => console.error('Post-assessment email error:', err))
      }

      return NextResponse.json({
        success: true,
        profileName: result.profile.name,
        profileGroup: result.profile.groupLabel,
        tagline: result.profile.tagline,
        description: result.profile.description,
      })
    }

    // Check HiringManagerAssessment
    const hmInvite = await prisma.hiringManagerAssessment.findUnique({ where: { token } })
    if (hmInvite) {
      if (hmInvite.completedAt) {
        return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })
      }

      const result = scoreAssessment(list1Checked, list2Checked, ADJECTIVES)

      await prisma.hiringManagerAssessment.update({
        where: { id: hmInvite.id },
        data: {
          dominance: result.scores.dominance,
          extraversion: result.scores.extraversion,
          patience: result.scores.patience,
          formality: result.scores.formality,
          profileType: result.profile.name,
          completedAt: new Date(),
        },
      })

      await prisma.eventLog.create({ data: { event: 'hm_assessment.scored', entityId: hmInvite.id, meta: JSON.stringify({ profileType: result.profile.name }) } })

      return NextResponse.json({
        success: true,
        type: 'hiring_manager',
        profileName: result.profile.name,
        profileGroup: result.profile.groupLabel,
        tagline: result.profile.tagline,
        description: result.profile.description,
      })
    }

    return NextResponse.json({ error: 'Invalid assessment link' }, { status: 404 })
  } catch (err) {
    console.error('Assessment submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
