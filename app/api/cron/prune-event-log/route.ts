import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Vercel injects Authorization: Bearer <CRON_SECRET> on cron-triggered calls.
// Any other caller without the secret gets a 401.
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected && req.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)

  // Keep audit-trail-worthy events forever; prune everything else older than 180 days.
  const KEEP_EVENTS = [
    'outcome.recorded',
    'placement.created',
    'org.created',
    'client_portal.client_approved',
    'client_portal.rejected',
  ]

  const { count } = await prisma.eventLog.deleteMany({
    where: {
      createdAt: { lt: cutoff },
      event: { notIn: KEEP_EVENTS },
    },
  })

  return NextResponse.json({ deleted: count, cutoff })
}
