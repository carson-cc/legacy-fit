import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const jobs = await prisma.job.findMany({
      where: { archivedAt: null },
      include: {
        client: true,
        target: true,
        invites: { include: { result: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = jobs.map(job => ({
      id: job.id,
      title: job.title,
      roleType: job.roleType,
      client: { id: job.client.id, name: job.client.name },
      hasTarget: !!job.target,
      candidateCount: job.invites.filter(i => i.result).length,
      pendingCount: job.invites.filter(i => !i.result).length,
      topFit: job.invites
        .filter(i => i.result?.fitPct != null)
        .reduce((max, i) => Math.max(max, i.result!.fitPct!), 0),
      createdAt: job.createdAt,
    }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, roleType, clientId } = await req.json()
    if (!title || !roleType || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: { title, roleType, clientId },
    })

    return NextResponse.json({ data: job })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
