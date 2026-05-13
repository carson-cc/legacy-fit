import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, email } = await req.json() as { name: string; email: string }

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  try {
    const contact = await prisma.clientContact.create({
      data: {
        id: crypto.randomUUID(),
        jobId: id,
        name: name.trim(),
        email: email.trim(),
        token: crypto.randomUUID(),
        expiresAt,
      },
    })

    return NextResponse.json({ data: { token: contact.token, id: contact.id } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
