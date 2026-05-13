import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

const VALID_STAGES = ['longlist', 'shortlist', 'client_ready', 'rejected']

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { stage } = await req.json() as { stage: string }

  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  const userId = (session.user as { id?: string }).id ?? null

  try {
    const invite = await prisma.candidateInvite.update({
      where: { id },
      data: { stage },
    })

    await prisma.eventLog.create({
      data: {
        event: 'candidate.stage_changed',
        entityId: id,
        userId,
        meta: JSON.stringify({ stage }),
      },
    })

    return NextResponse.json({ data: invite })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
