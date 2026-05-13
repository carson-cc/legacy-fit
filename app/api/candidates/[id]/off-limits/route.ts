import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { offLimits } = await req.json() as { offLimits: boolean }

  try {
    const invite = await prisma.candidateInvite.update({
      where: { id },
      data: { offLimits },
    })

    await prisma.eventLog.create({
      data: {
        event: 'candidate.off_limits_changed',
        entityId: id,
        userId: (session.user as { id?: string }).id ?? null,
        meta: JSON.stringify({ offLimits }),
      },
    })

    return NextResponse.json({ data: invite })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
