import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const ctx = await requireRole('owner', 'admin')
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  const invite = await prisma.orgInvite.findUnique({ where: { id } })
  if (!invite || invite.orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }
  await prisma.orgInvite.update({ where: { id }, data: { revokedAt: new Date() } })
  await prisma.eventLog.create({ data: { event: 'org.invite_revoked', entityId: id, orgId: ctx.orgId, userId: ctx.userId } })
  return NextResponse.json({ ok: true })
}
