import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const eventType = searchParams.get('eventType') ?? ''
  const userId = searchParams.get('userId') ?? ''
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const where: Record<string, unknown> = {}
  if (eventType) where.event = eventType
  if (userId) where.userId = userId
  if (from || to) {
    const dateFilter: Record<string, Date> = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) dateFilter.lte = new Date(to)
    where.createdAt = dateFilter
  }

  try {
    const [total, events, users] = await Promise.all([
      prisma.eventLog.count({ where }),
      prisma.eventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      }),
    ])

    // Collect distinct event types for filter dropdown
    const eventTypes = await prisma.eventLog.findMany({
      select: { event: true },
      distinct: ['event'],
      orderBy: { event: 'asc' },
    })

    return NextResponse.json({
      data: events,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      users,
      eventTypes: eventTypes.map(e => e.event),
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
