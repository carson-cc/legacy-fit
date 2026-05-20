import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendInviteEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { name, email, phone, roleTitle, inviteType = 'candidate' } = await req.json()

    const invite = await prisma.candidateInvite.create({
      data: { jobId: id, name, email, phone, inviteType },
    })

    await prisma.eventLog.create({
      data: { event: 'invite.created', entityId: invite.id },
    })

    let emailSent = false

    if (email) {
      try {
        const job = await prisma.job.findUnique({
          where: { id },
          include: { client: true },
        })
        const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const assessUrl = `${appUrl}/assess/${invite.token}`

        await sendInviteEmail({
          candidateName: name,
          candidateEmail: email,
          recruiterName: session.user?.name || 'Your recruiter',
          firmName: job?.client.name || 'Veltro',
          jobTitle: job?.title || 'this role',
          roleTitle: roleTitle || job?.title || 'this role',
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
