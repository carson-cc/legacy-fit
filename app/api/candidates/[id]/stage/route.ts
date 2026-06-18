import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg, assertInviteInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

const VALID_STAGES = ['longlist', 'shortlist', 'client_ready', 'rejected'] as const
type Stage = typeof VALID_STAGES[number]

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertInviteInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  let stage: Stage
  try {
    const body = await req.json()
    if (!VALID_STAGES.includes(body.stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }
    stage = body.stage
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  try {
    const isClientReady = stage === 'client_ready'
    const invite = await prisma.candidateInvite.update({
      where: { id },
      data: {
        stage,
        approvedForClient: isClientReady,
        approvedAt: isClientReady ? new Date() : null,
        approvedByUserId: isClientReady ? ctx.userId : null,
      },
    })

    await prisma.eventLog.create({
      data: {
        event: 'candidate.stage_changed',
        entityId: id,
        orgId: ctx.orgId,
        userId: ctx.userId,
        meta: JSON.stringify({ stage }),
      },
    })

    return NextResponse.json({ data: { id: invite.id, stage: invite.stage } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
