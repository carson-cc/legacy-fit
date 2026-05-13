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
      where: { inviteId: invite.id },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    })

    return NextResponse.json({
      data: notes.map(n => ({
        id: n.id,
        body: n.body,
        createdAt: n.createdAt,
        authorName: n.author.name ?? 'Unknown',
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { body } = await req.json() as { body: string }

  if (!body?.trim()) {
    return NextResponse.json({ error: 'Note body is required' }, { status: 400 })
  }

  const authorUserId = (session.user as { id: string }).id

  try {
    const invite = await prisma.candidateInvite.findUnique({ where: { id } })
    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const note = await prisma.candidateNote.create({
      data: {
        id: crypto.randomUUID(),
        inviteId: invite.id,
        authorUserId,
        body: body.trim(),
      },
      include: { author: { select: { name: true } } },
    })

    return NextResponse.json({
      data: {
        id: note.id,
        body: note.body,
        createdAt: note.createdAt,
        authorName: note.author.name ?? 'Unknown',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
