import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validate, emailLike, password, nonEmptyStr, optional, str, slugify } from '@/lib/validation'

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
//
// Body:
//   { email, password, name, firmName, inviteToken? }
//
// Two paths:
//   1. No inviteToken → creates a brand new Organization with the user as owner.
//   2. inviteToken    → joins the org bound to that invite. Email must match.
//
// On success the route returns { ok: true, email } and the client redirects to
// /login. We deliberately do NOT auto-sign-in here — the credentials provider
// runs through NextAuth and we want one place where authentication happens.

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const v = validate(body, {
    email: emailLike,
    password,
    name: nonEmptyStr(120),
    firmName: optional(str(200)),
    inviteToken: optional(str(120)),
  })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const { email, password: pw, name, firmName, inviteToken } = v.value

  // Reject duplicate emails — case-insensitive (we already lowercased in
  // validation). NextAuth uses email as the unique key.
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 })
  }

  const hash = await bcrypt.hash(pw, 10)

  try {
    if (inviteToken) {
      // Path 2: redeem an OrgInvite.
      const invite = await prisma.orgInvite.findUnique({ where: { token: inviteToken } })
      if (!invite) return NextResponse.json({ error: 'Invite not found.' }, { status: 404 })
      if (invite.acceptedAt) return NextResponse.json({ error: 'Invite already used.' }, { status: 410 })
      if (invite.revokedAt) return NextResponse.json({ error: 'Invite revoked.' }, { status: 410 })
      if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite expired.' }, { status: 410 })
      if (invite.email.toLowerCase() !== email) {
        return NextResponse.json({ error: 'This invite was sent to a different email address.' }, { status: 403 })
      }

      await prisma.$transaction([
        prisma.user.create({
          data: { email, password: hash, name, orgId: invite.orgId, role: invite.role },
        }),
        prisma.orgInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
        prisma.eventLog.create({
          data: { event: 'org.invite_accepted', entityId: invite.id, orgId: invite.orgId },
        }),
      ])
      return NextResponse.json({ ok: true, email, joinedOrgId: invite.orgId })
    }

    // Path 1: create a new firm. firmName required.
    if (!firmName) {
      return NextResponse.json({ error: 'Firm name is required when creating a new account.' }, { status: 400 })
    }

    // Generate a unique slug. If collision, append a short cuid suffix.
    const baseSlug = slugify(firmName)
    let slug = baseSlug
    if (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const result = await prisma.$transaction(async tx => {
      const org = await tx.organization.create({ data: { name: firmName, slug } })
      const user = await tx.user.create({
        data: { email, password: hash, name, orgId: org.id, role: 'owner' },
      })
      await tx.eventLog.create({
        data: { event: 'org.created', entityId: org.id, orgId: org.id, userId: user.id },
      })
      return { org, user }
    })

    return NextResponse.json({ ok: true, email, orgId: result.org.id })
  } catch (err) {
    logError(err, { route: '/api/auth/signup' })
    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
  }
}
