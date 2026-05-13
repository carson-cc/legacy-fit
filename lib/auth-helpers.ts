import { NextResponse } from 'next/server'
import { auth } from './auth'
import { prisma } from './prisma'

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
//
// Every API route that touches tenant data MUST call requireOrg() and use the
// returned orgId in its Prisma queries. The contract is enforced by the test
// in lib/__tests__/tenant-isolation.test.ts which fails if a route returns
// records from another organization.
//
// Helpers return either a typed context object or a NextResponse error so the
// caller can `if (ctx instanceof NextResponse) return ctx`.

export type Role = 'owner' | 'admin' | 'member'

export interface AuthContext {
  userId: string
  email: string
  orgId: string
  role: Role
  isPlatformAdmin: boolean
}

export async function requireSession(): Promise<{ userId: string; email: string } | NextResponse> {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Re-resolve userId from DB. The session JWT carries id but we don't trust
  // it without verifying the user still exists.
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { userId: user.id, email: user.email }
}

export async function requireOrg(): Promise<AuthContext | NextResponse> {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!user.orgId) {
    return NextResponse.json(
      { error: 'No organization on this account. Contact support.' },
      { status: 403 },
    )
  }
  return {
    userId: user.id,
    email: user.email,
    orgId: user.orgId,
    role: (user.role as Role) || 'member',
    isPlatformAdmin: user.isPlatformAdmin,
  }
}

export async function requireRole(...allowed: Role[]): Promise<AuthContext | NextResponse> {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx
  if (!allowed.includes(ctx.role) && !ctx.isPlatformAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Resource-scope verification helpers
// ---------------------------------------------------------------------------
//
// Use these whenever a route operates on a record by id from the URL — they
// confirm the record belongs to the caller's org before any mutation.

export async function assertClientInOrg(clientId: string, orgId: string): Promise<boolean> {
  const c = await prisma.client.findUnique({ where: { id: clientId }, select: { orgId: true } })
  return !!c && c.orgId === orgId
}

export async function assertJobInOrg(jobId: string, orgId: string): Promise<boolean> {
  const j = await prisma.job.findUnique({ where: { id: jobId }, select: { orgId: true } })
  return !!j && j.orgId === orgId
}

export async function assertInviteInOrg(inviteId: string, orgId: string): Promise<boolean> {
  const inv = await prisma.candidateInvite.findUnique({
    where: { id: inviteId },
    select: { job: { select: { orgId: true } } },
  })
  return !!inv && inv.job.orgId === orgId
}

export function forbidden(message = 'Not found') {
  // Use 404 rather than 403 to avoid leaking the existence of other tenants'
  // records via timing or error-message differences.
  return NextResponse.json({ error: message }, { status: 404 })
}
