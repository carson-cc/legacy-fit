import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePortalSession } from '@/lib/portal-auth'

// GET /api/portal/shortlist
// Returns client_ready candidates for the job this contact was invited to view.
// Strips recruiterNotes and any data the hiring company should not see.
export async function GET(req: NextRequest) {
  const ctx = await requirePortalSession(req)
  if (ctx instanceof NextResponse) return ctx

  const job = await prisma.job.findUnique({
    where: { id: ctx.jobId },
    include: {
      client: { select: { name: true } },
      org: {
        select: {
          name:               true,
          brandLogoUrl:       true,
          brandPrimaryColor:  true,
          brandPartnerName:   true,
          brandPartnerEmail:  true,
        },
      },
      invites: {
        where: { stage: 'client_ready', offLimits: false, approvedForClient: true },
        include: {
          result: {
            select: {
              id:            true,
              shareToken:    true,
              dominance:     true,
              extraversion:  true,
              patience:      true,
              formality:     true,
              domPercentile: true,
              extPercentile: true,
              patPercentile: true,
              forPercentile: true,
              profileName:   true,
              profileGroup:  true,
              fitPct:        true,
              adaptationStress: true,
              // recruiterNotes intentionally omitted
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!job || job.orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const candidates = job.invites
    .filter(i => i.result)
    .map(i => ({
      inviteId:    i.id,
      name:        i.name ?? 'Candidate',
      stage:       i.stage,
      completedAt: i.completedAt,
      result: i.result
        ? {
            shareToken:    i.result.shareToken,
            profileName:   i.result.profileName,
            profileGroup:  i.result.profileGroup,
            fitPct:        i.result.fitPct,
            dominance:     i.result.dominance,
            extraversion:  i.result.extraversion,
            patience:      i.result.patience,
            formality:     i.result.formality,
            domPercentile: i.result.domPercentile,
            extPercentile: i.result.extPercentile,
            patPercentile: i.result.patPercentile,
            forPercentile: i.result.forPercentile,
            adaptationStress: i.result.adaptationStress,
          }
        : null,
    }))

  return NextResponse.json({
    data: {
      job: {
        id:         job.id,
        title:      job.title,
        clientName: job.client.name,
      },
      branding: {
        firmName:     job.org.name,
        logoUrl:      job.org.brandLogoUrl,
        primaryColor: job.org.brandPrimaryColor ?? '#111827',
        partnerName:  job.org.brandPartnerName,
        partnerEmail: job.org.brandPartnerEmail,
      },
      candidates,
    },
  })
}
