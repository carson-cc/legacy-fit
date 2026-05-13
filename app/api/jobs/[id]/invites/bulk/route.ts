import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendInviteEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

interface BulkRow {
  name: string
  email: string
  phone?: string
}

interface RowResult {
  name: string
  email: string
  status: 'created' | 'error'
  inviteId?: string
  error?: string
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { rows } = await req.json() as { rows: BulkRow[] }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }
    if (rows.length > 200) {
      return NextResponse.json({ error: 'Max 200 rows per import' }, { status: 400 })
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { client: true },
    })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const results: RowResult[] = []

    for (const row of rows) {
      const name = row.name?.trim()
      const email = row.email?.trim()
      if (!name || !email) {
        results.push({ name: name || '', email: email || '', status: 'error', error: 'Missing name or email' })
        continue
      }

      try {
        const invite = await prisma.candidateInvite.create({
          data: { jobId: id, name, email, phone: row.phone?.trim() || null, inviteType: 'candidate' },
        })

        await prisma.eventLog.create({
          data: { event: 'invite.created', entityId: invite.id, meta: 'bulk_import' },
        })

        // Best-effort email
        try {
          await sendInviteEmail({
            candidateName: name,
            candidateEmail: email,
            recruiterName: session.user?.name || 'Your recruiter',
            firmName: job.client.name,
            jobTitle: job.title,
            roleTitle: job.title,
            assessUrl: `${appUrl}/assess/${invite.token}`,
          })
          await prisma.candidateInvite.update({
            where: { id: invite.id },
            data: { sentAt: new Date() },
          })
        } catch { /* ignore email failures */ }

        results.push({ name, email, status: 'created', inviteId: invite.id })
      } catch (err: any) {
        results.push({ name, email, status: 'error', error: err?.message || 'DB error' })
      }
    }

    return NextResponse.json({ data: { results, total: rows.length, created: results.filter(r => r.status === 'created').length } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
