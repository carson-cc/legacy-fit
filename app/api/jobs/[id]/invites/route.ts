import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'
import { sendInviteEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  try {
    const { name, email, phone, roleTitle, inviteType = 'candidate' } = await req.json()

    // Verify the job belongs to this org before creating an invite under it.
    const job = await prisma.job.findUnique({ where: { id }, include: { client: true } })
    if (!job || job.orgId !== ctx.orgId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const invite = await prisma.candidateInvite.create({
      data: { jobId: id, name, email, phone, inviteType },
    })

    await prisma.eventLog.create({
      data: { event: 'invite.created', entityId: invite.id, orgId: ctx.orgId, userId: ctx.userId },
    })

    let emailSent = false

    if (email) {
      try {
        const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const assessUrl = `${appUrl}/assess/${invite.token}`

        await sendInviteEmail({
          candidateName: name,
          candidateEmail: email,
          recruiterName: ctx.email,
          firmName: job.client.name,
          jobTitle: job.title,
          roleTitle: roleTitle || job.title,
          assessUrl,
        })

        await prisma.candidateInvite.update({
          where: { id: invite.id },
          data: { sentAt: new Date() },
        })

        emailSent = true
      } catch (emailErr) {
        console.error('Failed to send invite email:', emailErr)
      }
    }

    return NextResponse.json({
      data: { ...invite, assessUrl: `/assess/${invite.token}` },
      emailSent,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
