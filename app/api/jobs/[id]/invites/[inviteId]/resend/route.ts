import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'
import { sendInviteEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string; inviteId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id, inviteId } = await params
  try {
    const invite = await prisma.candidateInvite.findUnique({
      where: { id: inviteId, jobId: id },
      include: { job: { include: { client: true } } },
    })

    if (!invite || invite.job.orgId !== ctx.orgId) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }
    if (invite.completedAt) return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })

    const candidateEmail = invite.email
    const candidateName = invite.name ?? 'Candidate'
    if (!candidateEmail) return NextResponse.json({ error: 'No email on file for this candidate' }, { status: 400 })

    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const assessUrl = `${appUrl}/assess/${invite.token}`

    await sendInviteEmail({
      candidateName,
      candidateEmail,
      recruiterName: ctx.email,
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
      data: { event: 'invite.resent', entityId: inviteId, orgId: ctx.orgId, userId: ctx.userId },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logError(err, { route: '/api/jobs/[id]/invites/[inviteId]/resend' })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
