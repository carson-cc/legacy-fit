import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg, assertInviteInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertInviteInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }
  try {
    const invite = await prisma.candidateInvite.findUnique({
      where: { id },
      include: { outcome: true },
    })

    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const { placed, retainedAt90, retainedAt180, performanceRating, notes } = await req.json()

    if (typeof placed !== 'boolean') {
      return NextResponse.json({ error: 'placed is required and must be a boolean' }, { status: 400 })
    }
    if (retainedAt90 != null && typeof retainedAt90 !== 'boolean') {
      return NextResponse.json({ error: 'retainedAt90 must be a boolean' }, { status: 400 })
    }
    if (retainedAt180 != null && typeof retainedAt180 !== 'boolean') {
      return NextResponse.json({ error: 'retainedAt180 must be a boolean' }, { status: 400 })
    }
    if (performanceRating != null && (!Number.isInteger(performanceRating) || performanceRating < 1 || performanceRating > 5)) {
      return NextResponse.json({ error: 'performanceRating must be an integer between 1 and 5' }, { status: 400 })
    }

    const outcome = await prisma.placementOutcome.upsert({
      where: { inviteId: id },
      update: { placed, retainedAt90, retainedAt180, performanceRating, notes },
      create: { inviteId: id, placed, retainedAt90, retainedAt180, performanceRating, notes },
    })

    await prisma.eventLog.create({
      data: { event: 'outcome.recorded', entityId: id, orgId: ctx.orgId, userId: ctx.userId },
    })

    return NextResponse.json({ data: outcome })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
