import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { notes } = await req.json() as { notes: string }

    const invite = await prisma.candidateInvite.findUnique({
      where: { id },
      include: { result: true },
    })

    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    if (!invite.result) return NextResponse.json({ error: 'Assessment not completed' }, { status: 400 })

    await prisma.assessmentResult.update({
      where: { id: invite.result.id },
      data: { recruiterNotes: notes || null },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
