import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, assertInviteInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireRole('owner', 'admin')
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertInviteInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  let approved: boolean
  try {
    const body = await req.json()
    approved = body.approved !== false // default true if not specified
  } catch {
    approved = true
  }

  try {
    const invite = await prisma.candidateInvite.update({
      where: { id },
      data: {
        approvedForClient: approved,
        approvedByUserId: approved ? ctx.userId : null,
        approvedAt: approved ? new Date() : null,
      },
    })

    await prisma.eventLog.create({
      data: {
        event: approved ? 'candidate.approved_for_client' : 'candidate.approval_revoked',
        entityId: id,
        orgId: ctx.orgId,
        userId: ctx.userId,
      },
    })

    return NextResponse.json({
      data: {
        id: invite.id,
        approvedForClient: invite.approvedForClient,
        approvedAt: invite.approvedAt,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
