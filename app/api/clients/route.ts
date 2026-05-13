import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
      include: {
        hiringManagers: {
          select: { id: true, name: true, profileType: true, completedAt: true },
        },
        jobs: {
          select: { id: true, archivedAt: true },
        },
      },
    })

    const data = clients.map(c => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      completedHMs: c.hiringManagers
        .filter(h => h.completedAt !== null)
        .map(h => ({ id: h.id, name: h.name, profileType: h.profileType })),
      pendingHMs: c.hiringManagers.filter(h => !h.completedAt).length,
      activeJobs: c.jobs.filter(j => !j.archivedAt).length,
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
    const { name, industry } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = await prisma.client.create({ data: { name, industry } as any })
    return NextResponse.json({
      data: { ...client, completedHMs: [], pendingHMs: 0, activeJobs: 0 },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
