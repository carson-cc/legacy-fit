import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'
import { sendTeamInviteEmail } from '@/lib/email'
import { validate, emailLike, str, optional } from '@/lib/validation'

// POST /api/team/invite — admins/owners only.
//
// Creates an OrgInvite, emails a magic link to the invitee. The invitee
// completes signup at /signup?invite=<token>. The signup route verifies the
// email matches the invite and binds the new user to the org.
export async function POST(req: NextRequest) {
  const ctx = await requireRole('owner', 'admin')
  if (ctx instanceof NextResponse) return ctx

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const v = validate(body, { email: emailLike, role: optional(str(20)) })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const role = v.value.role === 'admin' ? 'admin' : 'member'

  // Refuse if the email already belongs to a user in this org (idempotent
  // surface — we don't want duplicate seats).
  const existing = await prisma.user.findUnique({ where: { email: v.value.email } })
  if (existing && existing.orgId === ctx.orgId) {
    return NextResponse.json({ error: 'That user is already on your team.' }, { status: 409 })
  }
  if (existing && existing.orgId && existing.orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'That email is already used at another firm. They can transfer by contacting support.' }, { status: 409 })
  }

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days

  // Revoke any prior pending invite for the same email so we don't accumulate.
  await prisma.orgInvite.updateMany({
    where: { orgId: ctx.orgId, email: v.value.email, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  const invite = await prisma.orgInvite.create({
    data: { orgId: ctx.orgId, email: v.value.email, role, invitedBy: ctx.userId, expiresAt },
  })

  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId }, select: { name: true } })
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const acceptUrl = `${appUrl}/signup?invite=${invite.token}&email=${encodeURIComponent(v.value.email)}`

  let emailSent = false
  try {
    await sendTeamInviteEmail({
      to: v.value.email,
      inviterName: ctx.email,
      firmName: org?.name || 'your firm',
      acceptUrl,
    })
    emailSent = true
  } catch (err) {
    console.error('Failed to send team invite email:', err)
  }

  await prisma.eventLog.create({
    data: { event: 'org.invite_sent', entityId: invite.id, orgId: ctx.orgId, userId: ctx.userId },
  })

  return NextResponse.json({ data: { id: invite.id, email: invite.email, role: invite.role, expiresAt: invite.expiresAt, acceptUrl }, emailSent })
}
