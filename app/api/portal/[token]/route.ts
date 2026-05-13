import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  const contact = await prisma.clientContact.findUnique({
    where: { token },
    include: {
      job: {
        include: {
          client: true,
          invites: {
            where: {
              approvedForClient: true,
              completedAt: { not: null },
            },
            include: { result: true },
          },
        },
      },
    },
  })

  if (!contact) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (contact.revokedAt || contact.expiresAt < new Date()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  await prisma.clientContact.update({
    where: { token },
    data: { lastAccessAt: new Date() },
  })

  const candidates = contact.job.invites.map(invite => ({
    id: invite.id,
    name: invite.name,
    stage: invite.stage,
    fitPct: invite.result?.fitPct ?? null,
    profileName: invite.result?.profileName ?? null,
    profileGroup: invite.result?.profileGroup ?? null,
  }))

  return NextResponse.json({
    data: {
      job: {
        id: contact.job.id,
        title: contact.job.title,
        client: contact.job.client.name,
      },
      candidates,
    },
  })
}
