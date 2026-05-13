import { logError } from '@/lib/log'
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

    if (placed == null) {
      return NextResponse.json({ error: 'placed field is required' }, { status: 400 })
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
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
