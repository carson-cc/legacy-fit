import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const invites = await prisma.candidateInvite.findMany({
      where: { result: { isNot: null } },
      include: {
        result: true,
        job: { include: { client: true, target: true } },
      },
      orderBy: { completedAt: 'desc' },
    })

    const data = invites.map(invite => {
      const r = invite.result!
      const fitPct = r.fitPct ?? 0
      const rec = fitPct >= 85 ? 'Strong Hire' : fitPct >= 70 ? 'Proceed with Caution' : 'Do Not Hire'
      const conf = fitPct >= 80 ? 'High' : fitPct >= 60 ? 'Medium' : 'Low'
      const benchmarkTag = invite.job.target
        ? fitPct >= 85 ? 'Above benchmark' : fitPct >= 70 ? 'At benchmark' : 'Below benchmark'
        : 'No benchmark'

      return {
        id: invite.id,
        name: invite.name,
        email: invite.email,
        completedAt: invite.completedAt,
        fitPct,
        recommendation: rec,
        confidence: conf,
        benchmarkTag,
        profileName: r.profileName,
        profileGroup: r.profileGroup,
        adaptationStress: r.adaptationStress,
        rushed: r.rushed,
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
