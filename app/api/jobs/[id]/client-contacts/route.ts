import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, assertJobInOrg } from '@/lib/auth-helpers'
import { validate, nonEmptyStr } from '@/lib/validation'
import { sendClientPortalEmail } from '@/lib/email'

const PORTAL_EXPIRY_DAYS = 14

type Params = { params: Promise<{ id: string }> }

// GET /api/jobs/[id]/client-contacts — list contacts for this job
export async function GET(_req: NextRequest, { params }: Params) {
  const ctx = await requireRole('owner', 'admin', 'member')
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertJobInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const contacts = await prisma.clientContact.findMany({
    where: { jobId: id, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true,
      expiresAt: true, lastAccessAt: true, createdAt: true,
    },
  })

  return NextResponse.json({ data: contacts })
}

// POST /api/jobs/[id]/client-contacts — create a contact and send magic link
export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireRole('owner', 'admin')
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertJobInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const v = validate(body, {
    name:  nonEmptyStr(120),
    email: nonEmptyStr(254),
  })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + PORTAL_EXPIRY_DAYS)

  const job = await prisma.job.findUnique({
    where: { id },
    include: { client: true, org: true },
  })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contact = await prisma.clientContact.create({
    data: {
      jobId:    id,
      name:     v.value.name,
      email:    v.value.email,
      expiresAt,
    },
  })

  const appUrl   = process.env.APP_URL ?? 'http://localhost:3000'
  const portalUrl = `${appUrl}/api/portal/auth/${contact.token}`

  try {
    await sendClientPortalEmail({
      to:            contact.email,
      contactName:   contact.name,
      firmName:      job.org.name,
      jobTitle:      job.title,
      clientName:    job.client.name,
      portalUrl,
      expiresInDays: PORTAL_EXPIRY_DAYS,
    })
  } catch (err) {
    console.error('sendClientPortalEmail failed', err)
    return NextResponse.json(
      { data: contact, warning: 'Contact created but email delivery failed.' },
      { status: 207 },
    )
  }

  await prisma.eventLog.create({
    data: {
      event:    'client_portal.invite_sent',
      entityId: contact.id,
      orgId:    ctx.orgId,
      userId:   ctx.userId,
      meta:     JSON.stringify({ email: contact.email, jobId: id }),
    },
  })

  return NextResponse.json({ data: contact }, { status: 201 })
}
