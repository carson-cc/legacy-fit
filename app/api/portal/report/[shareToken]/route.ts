import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePortalSession } from '@/lib/portal-auth'

type Params = { params: Promise<{ shareToken: string }> }

// GET /api/portal/report/[shareToken]
// White-labeled report for client portal. Portal-auth required (cookie).
// Strips recruiterNotes and injects org branding.
export async function GET(req: NextRequest, { params }: Params) {
  const ctx = await requirePortalSession(req)
  if (ctx instanceof NextResponse) return ctx

  const { shareToken } = await params

  const result = await prisma.assessmentResult.findUnique({
    where: { shareToken },
    include: {
      invite: {
        include: {
          job: {
            include: {
              target: true,
              org: {
                select: {
                  name:               true,
                  brandLogoUrl:       true,
                  brandPrimaryColor:  true,
                  brandPartnerName:   true,
                  brandPartnerEmail:  true,
                },
              },
              client: { select: { name: true } },
            },
          },
        },
      },
    },
  })

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (result.shareTokenExpiresAt && result.shareTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: 'Report link has expired' }, { status: 410 })
  }

  if (result.invite.job.id !== ctx.jobId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const visibleStages = ['client_ready', 'client_approved']
  if (!visibleStages.includes(result.invite.stage)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (result.invite.offLimits || !result.invite.approvedForClient) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { org } = result.invite.job

  return NextResponse.json({
    data: {
      candidate: {
        name:        result.invite.name ?? 'Candidate',
        jobTitle:    result.invite.job.title,
        clientName:  result.invite.job.client.name,
        completedAt: result.invite.completedAt,
        stage:       result.invite.stage,
      },
      scores: {
        dominance:    result.dominance,
        extraversion: result.extraversion,
        patience:     result.patience,
        formality:    result.formality,
        domPercentile: result.domPercentile,
        extPercentile: result.extPercentile,
        patPercentile: result.patPercentile,
        forPercentile: result.forPercentile,
      },
      profile: {
        name:          result.profileName,
        group:         result.profileGroup,
        secondary:     result.secondaryProfile,
        adaptationStress: result.adaptationStress,
      },
      fit: result.invite.job.target
        ? {
            pct:  result.fitPct,
            low:  result.fitLow,
            high: result.fitHigh,
          }
        : null,
      branding: {
        firmName:     org.name,
        logoUrl:      org.brandLogoUrl,
        primaryColor: org.brandPrimaryColor ?? '#111827',
        partnerName:  org.brandPartnerName,
        partnerEmail: org.brandPartnerEmail,
      },
    },
  })
}
