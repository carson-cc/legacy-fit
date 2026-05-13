import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, assertJobInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string; contactId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ctx = await requireRole('owner', 'admin')
  if (ctx instanceof NextResponse) return ctx

  const { id, contactId } = await params
  if (!(await assertJobInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const contact = await prisma.clientContact.findUnique({
    where: { id: contactId },
    select: { jobId: true, revokedAt: true },
  })
  if (!contact || contact.jobId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.clientContact.update({
    where: { id: contactId },
    data:  { revokedAt: new Date() },
  })

  await prisma.eventLog.create({
    data: {
      event:    'client_portal.access_revoked',
      entityId: contactId,
      orgId:    ctx.orgId,
      userId:   ctx.userId,
    },
  })

  return NextResponse.json({ ok: true })
}
