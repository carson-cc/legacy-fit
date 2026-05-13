import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { approved } = await req.json() as { approved: boolean }

  const userId = (session.user as { id?: string }).id ?? null

  try {
    const invite = await prisma.candidateInvite.update({
      where: { id },
      data: approved
        ? {
            approvedForClient: true,
            approvedByUserId: userId,
            approvedAt: new Date(),
          }
        : {
            approvedForClient: false,
            approvedByUserId: null,
            approvedAt: null,
          },
    })

    await prisma.eventLog.create({
      data: {
        event: 'candidate.approved',
        entityId: id,
        userId,
        meta: JSON.stringify({ approved }),
      },
    })

    return NextResponse.json({ data: invite })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
