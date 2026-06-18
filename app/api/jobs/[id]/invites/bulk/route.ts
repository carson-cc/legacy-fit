import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'
import { sendInviteEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

interface BulkRow {
  name: string
  email: string
  phone?: string
}

interface RowResult {
  row: number
  name: string
  email: string
  status: 'created' | 'error'
  inviteId?: string
  assessUrl?: string
  emailSent?: boolean
  error?: string
}

function parseCSV(text: string): BulkRow[] {
  const lines = text.trim().split(/\r?\n/)
  const header = lines[0].toLowerCase().split(',').map(h => h.trim())
  const nameIdx = header.indexOf('name')
  const emailIdx = header.indexOf('email')
  const phoneIdx = header.indexOf('phone')

  if (nameIdx === -1 || emailIdx === -1) {
    throw new Error('CSV must have "name" and "email" columns')
  }

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    return {
      name: cols[nameIdx] ?? '',
      email: cols[emailIdx] ?? '',
      phone: phoneIdx >= 0 ? (cols[phoneIdx] || undefined) : undefined,
    }
  }).filter(r => r.name || r.email)
}

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params

  const job = await prisma.job.findUnique({ where: { id }, include: { client: true } })
  if (!job || job.orgId !== ctx.orgId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  let rows: BulkRow[]
  const contentType = req.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('text/csv')) {
      const text = await req.text()
      rows = parseCSV(text)
    } else {
      const body = await req.json()
      rows = Array.isArray(body) ? body : body.rows
      if (!Array.isArray(rows)) {
        return NextResponse.json({ error: 'Expected JSON array or { rows: [...] }' }, { status: 400 })
      }
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid body' }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }
  if (rows.length > 200) {
    return NextResponse.json({ error: 'Max 200 rows per request' }, { status: 400 })
  }

  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const results: RowResult[] = []

  const existing = await prisma.candidateInvite.findMany({
    where: { jobId: id },
    select: { email: true },
  })
  const existingEmails = new Set(existing.map(e => e.email?.toLowerCase()).filter(Boolean))

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    if (!row.name?.trim() || !row.email?.trim()) {
      results.push({ row: i + 1, name: row.name ?? '', email: row.email ?? '', status: 'error', error: 'name and email are required' })
      continue
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())
    if (!emailOk) {
      results.push({ row: i + 1, name: row.name, email: row.email, status: 'error', error: 'invalid email' })
      continue
    }

    if (existingEmails.has(row.email.trim().toLowerCase())) {
      results.push({ row: i + 1, name: row.name, email: row.email, status: 'error', error: 'already invited' })
      continue
    }

    try {
      const invite = await prisma.candidateInvite.create({
        data: {
          jobId: id,
          name: row.name.trim(),
          email: row.email.trim(),
          phone: row.phone?.trim() || undefined,
        },
      })

      await prisma.eventLog.create({
        data: { event: 'invite.bulk_created', entityId: invite.id, orgId: ctx.orgId, userId: ctx.userId },
      })

      const assessUrl = `${appUrl}/assess/${invite.token}`
      let emailSent = false

      try {
        await sendInviteEmail({
          candidateName: row.name.trim(),
          candidateEmail: row.email.trim(),
          recruiterName: ctx.email,
          firmName: job.client.name,
          jobTitle: job.title,
          roleTitle: job.title,
          assessUrl,
        })
        await prisma.candidateInvite.update({ where: { id: invite.id }, data: { sentAt: new Date() } })
        emailSent = true
      } catch { /* best-effort */ }

      existingEmails.add(row.email.trim().toLowerCase())
      results.push({ row: i + 1, name: row.name, email: row.email, status: 'created', inviteId: invite.id, assessUrl, emailSent })
    } catch {
      results.push({ row: i + 1, name: row.name, email: row.email, status: 'error', error: 'database error' })
    }
  }

  const created = results.filter(r => r.status === 'created').length
  const failed = results.filter(r => r.status === 'error').length
  const status = failed > 0 && created === 0 ? 400 : failed > 0 ? 207 : 200

  return NextResponse.json({ created, failed, results }, { status })
}
