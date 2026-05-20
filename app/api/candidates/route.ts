import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'

export async function GET() {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  try {
    const invites = await prisma.candidateInvite.findMany({
      where: {
        result: { isNot: null },
        // Reach into Job → orgId to scope candidates to this org.
        job: { orgId: ctx.orgId },
      },
      include: {
        result: true,
        job: { include: { client: true, target: true } },
      },
      orderBy: { completedAt: 'desc' },
    })

    const data = invites.map(invite => {
      const r = invite.result!
      const fitPct = r.fitPct
      const hasBenchmark = fitPct !== null
      const rec = !hasBenchmark ? null
        : fitPct! >= 85 ? 'Strong Fit'
        : fitPct! >= 70 ? 'Explore Further'
        : fitPct! >= 55 ? 'Needs Discussion'
        : 'Low Fit'
      const conf = !hasBenchmark ? null
        : fitPct! >= 80 ? 'High' : fitPct! >= 60 ? 'Medium' : 'Low'
      const benchmarkTag = (!invite.job.target || fitPct === null) ? 'No benchmark'
        : fitPct >= 85 ? 'Above benchmark'
        : fitPct >= 70 ? 'At benchmark'
        : 'Below benchmark'

      return {
        id: invite.id,
        name: invite.name,
        email: invite.email,
        completedAt: invite.completedAt,
        fitPct,
        hasBenchmark,
        recommendation: rec,
        confidence: conf,
        benchmarkTag,
        profileName: r.profileName,
        profileGroup: r.profileGroup,
        adaptationStress: r.adaptationStress,
        rushed: r.rushed,
        stage: invite.stage,
        offLimits: invite.offLimits,
        job: {
          id: invite.job.id,
          title: invite.job.title,
          roleType: invite.job.roleType,
          client: invite.job.client.name,
          hasTarget: !!invite.job.target,
        },
      }
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
