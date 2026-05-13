import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'

// GET /api/team — list members + outstanding invites for the caller's org.
export async function GET() {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const [members, invites] = await Promise.all([
    prisma.user.findMany({
      where: { orgId: ctx.orgId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, emailVerifiedAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.orgInvite.findMany({
      where: { orgId: ctx.orgId, acceptedAt: null, revokedAt: null, expiresAt: { gte: new Date() } },
      select: { id: true, email: true, role: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({ data: { members, invites, currentUserId: ctx.userId, currentUserRole: ctx.role } })
}
