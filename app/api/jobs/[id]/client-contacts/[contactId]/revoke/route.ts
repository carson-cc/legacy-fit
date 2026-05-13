import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string; contactId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contactId } = await params

  try {
    const contact = await prisma.clientContact.update({
      where: { id: contactId },
      data: { revokedAt: new Date() },
    })

    return NextResponse.json({ data: contact })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
