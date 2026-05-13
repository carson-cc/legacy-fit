import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const hms = await prisma.hiringManagerAssessment.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, profileType: true, completedAt: true, token: true, dominance: true, extraversion: true, patience: true, formality: true },
    })
    return NextResponse.json({ data: hms })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { name, email } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hm = await prisma.hiringManagerAssessment.create({
      data: { clientId: id, name, email: email || null } as any,
    })

    return NextResponse.json({
      data: { ...hm, assessmentUrl: `/assess/${hm.token}?type=hm` },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
