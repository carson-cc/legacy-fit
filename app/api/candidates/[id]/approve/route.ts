import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendApprovalRequestEmail } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userRole = (session.user as any)?.role ?? 'recruiter'
  const userId = (session.user as any)?.id as string
  const userName = session.user?.name ?? 'A recruiter'

  try {
    const { action } = await req.json() as { action: 'approve' | 'request' }

    const invite = await prisma.candidateInvite.findUnique({
      where: { id },
      include: { job: { include: { client: true } } },
    })
    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    if (action === 'approve') {
      if (userRole !== 'owner' && userRole !== 'admin') {
        return NextResponse.json({ error: 'Only owners and admins can approve' }, { status: 403 })
      }
      await prisma.candidateInvite.update({
        where: { id },
        data: { approvedForClient: true, approvedByUserId: userId, approvedAt: new Date() },
      })
      return NextResponse.json({ data: { approvedForClient: true } })
    }

    if (action === 'request') {
      // Send approval request email to all owners and admins
      const partners = await prisma.user.findMany({
        where: { role: { in: ['owner', 'admin'] } },
      })

      const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const dashboardUrl = `${appUrl}/dashboard/candidates/${id}`

      const emailResults = await Promise.allSettled(
        partners.map(p =>
          sendApprovalRequestEmail({
            partnerEmail: p.email,
            partnerName: p.name ?? p.email,
            requesterName: userName,
            candidateName: invite.name ?? 'Candidate',
            jobTitle: invite.job.title,
            clientName: invite.job.client.name,
            dashboardUrl,
          })
        )
      )

      const sent = emailResults.filter(r => r.status === 'fulfilled').length

      return NextResponse.json({ data: { requested: true, emailsSent: sent } })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
