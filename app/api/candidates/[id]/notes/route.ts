import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const invite = await prisma.candidateInvite.findUnique({ where: { id } })
    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const notes = await prisma.candidateNote.findMany({
      where: { inviteId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ data: notes })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { body } = await req.json() as { body: string }
    if (!body?.trim()) return NextResponse.json({ error: 'Note body is required' }, { status: 400 })

    const invite = await prisma.candidateInvite.findUnique({ where: { id } })
    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const note = await prisma.candidateNote.create({
      data: {
        inviteId: id,
        authorUserId: (session.user as any)?.id ?? null,
        authorName: session.user?.name ?? session.user?.email ?? 'Unknown',
        body: body.trim(),
      },
    })

    return NextResponse.json({ data: note })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
