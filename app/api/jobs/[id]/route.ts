import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        target: true,
        invites: {
          include: { result: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    return NextResponse.json({ data: job })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
