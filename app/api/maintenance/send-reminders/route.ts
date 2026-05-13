import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCandidateReminderEmail } from '@/lib/email'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const ONE_DAY_MS    = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - THREE_DAYS_MS)
  const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS)
  const oneDayAgo    = new Date(now.getTime() - ONE_DAY_MS)
  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Candidates who were sent an invite 3+ days ago and never completed
  const pendingInvites = await prisma.candidateInvite.findMany({
    where: {
      sentAt: { lte: threeDaysAgo },
      completedAt: null,
      email: { not: null },
      name: { not: null },
    },
    include: {
      job: {
        include: {
          org: {
            include: {
              users: {
                where: { role: { in: ['owner', 'admin'] } },
                orderBy: { createdAt: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const invite of pendingInvites) {
    if (!invite.email || !invite.name) { skipped++; continue }

    // Count reminders already sent for this invite
    const reminderEvents = await prisma.eventLog.findMany({
      where: { event: 'invite.reminder_sent', entityId: invite.id },
      orderBy: { createdAt: 'asc' },
    })
    const reminderCount = reminderEvents.length

    // Cap at 2 total reminders
    if (reminderCount >= 2) { skipped++; continue }

    // Rate-limit: don't send twice in one 24-hour window
    const recentReminder = reminderEvents.find(e => e.createdAt >= oneDayAgo)
    if (recentReminder) { skipped++; continue }

    // Second reminder only goes out after 7 days
    if (reminderCount === 1 && invite.sentAt! > sevenDaysAgo) { skipped++; continue }

    const reminderNumber = (reminderCount + 1) as 1 | 2
    const recruiterUser = invite.job.org.users[0]
    const recruiterName = recruiterUser?.name || invite.job.org.name
    const firmName      = invite.job.org.name
    const assessUrl     = `${appUrl}/assess/${invite.token}`

    try {
      await sendCandidateReminderEmail({
        candidateName:  invite.name,
        candidateEmail: invite.email,
        recruiterName,
        firmName,
        jobTitle:       invite.job.title,
        assessUrl,
        reminderNumber,
      })

      await prisma.eventLog.create({
        data: {
          event:    'invite.reminder_sent',
          entityId: invite.id,
          orgId:    invite.job.orgId,
          meta:     JSON.stringify({ reminderNumber, candidateEmail: invite.email }),
        },
      })
      sent++
    } catch (err) {
      errors.push(`invite ${invite.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ sent, skipped, errors: errors.length ? errors : undefined })
}
