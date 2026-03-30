import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendInviteEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string; inviteId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, inviteId } = await params
  try {
    const invite = await prisma.candidateInvite.findUnique({
      where: { id: inviteId, jobId: id },
      include: { job: { include: { client: true } } },
    })

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    if (invite.completedAt) return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })

    const candidateEmail = invite.email
    const candidateName = invite.name ?? 'Candidate'
    if (!candidateEmail) return NextResponse.json({ error: 'No email on file for this candidate' }, { status: 400 })

    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const assessUrl = `${appUrl}/assess/${invite.token}`

    await sendInviteEmail({
      candidateName,
      candidateEmail,
      recruiterName: session.user?.name || 'Your recruiter',
      firmName: invite.job.client.name,
      jobTitle: invite.job.title,
      roleTitle: invite.job.title,
      assessUrl,
    })

    await prisma.candidateInvite.update({
      where: { id: inviteId },
      data: { sentAt: new Date() },
    })

    await prisma.eventLog.create({
      data: { event: 'invite.resent', entityId: inviteId },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Resend error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
