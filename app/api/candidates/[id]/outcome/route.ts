import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const invite = await prisma.candidateInvite.findUnique({
      where: { id },
      include: { outcome: true },
    })

    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const { placed, retainedAt90, retainedAt180, performanceRating, notes } = await req.json()

    if (placed == null) {
      return NextResponse.json({ error: 'placed field is required' }, { status: 400 })
    }

    const outcome = await prisma.placementOutcome.upsert({
      where: { inviteId: id },
      update: { placed, retainedAt90, retainedAt180, performanceRating, notes },
      create: { inviteId: id, placed, retainedAt90, retainedAt180, performanceRating, notes },
    })

    return NextResponse.json({ data: outcome })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
