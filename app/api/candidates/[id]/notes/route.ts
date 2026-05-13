import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg, assertInviteInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertInviteInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  try {
    const notes = await prisma.candidateNote.findMany({
      where: { inviteId: id },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: notes })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertInviteInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  let body: string
  try {
    const parsed = await req.json()
    if (!parsed.body || typeof parsed.body !== 'string' || !parsed.body.trim()) {
      return NextResponse.json({ error: 'body is required' }, { status: 400 })
    }
    body = parsed.body.trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const note = await prisma.candidateNote.create({
      data: { inviteId: id, authorUserId: ctx.userId, body },
      include: { author: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json({ data: note }, { status: 201 })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
