import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { dominance, extraversion, patience, formality, notes } = await req.json()

    const target = await prisma.jobTarget.upsert({
      where: { jobId: id },
      update: { dominance, extraversion, patience, formality, notes },
      create: { jobId: id, dominance, extraversion, patience, formality, notes },
    })

    await prisma.eventLog.create({
      data: { event: 'job_target.set', entityId: id },
    })

    return NextResponse.json({ data: target })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
