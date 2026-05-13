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

  let offLimits: boolean
  try {
    const body = await req.json()
    if (typeof body.offLimits !== 'boolean') {
      return NextResponse.json({ error: 'offLimits must be a boolean' }, { status: 400 })
    }
    offLimits = body.offLimits
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    const invite = await prisma.candidateInvite.update({
      where: { id },
      data: { offLimits },
    })

    await prisma.eventLog.create({
      data: {
        event: 'candidate.off_limits_changed',
        entityId: id,
        orgId: ctx.orgId,
        userId: ctx.userId,
        meta: JSON.stringify({ offLimits }),
      },
    })

    return NextResponse.json({ data: { id: invite.id, offLimits: invite.offLimits } })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
