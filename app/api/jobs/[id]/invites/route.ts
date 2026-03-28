import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { name, email, phone } = await req.json()

    const invite = await prisma.candidateInvite.create({
      data: { jobId: id, name, email, phone },
    })

    await prisma.eventLog.create({
      data: { event: 'invite.created', entityId: invite.id },
    })

    return NextResponse.json({ data: { ...invite, assessUrl: `/assess/${invite.token}` } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
