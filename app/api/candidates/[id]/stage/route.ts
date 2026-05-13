import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

const VALID_STAGES = ['longlist', 'shortlist', 'client-ready', 'rejected']

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json() as { stage?: string; offLimits?: boolean }

    const invite = await prisma.candidateInvite.findUnique({ where: { id } })
    if (!invite) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const data: { stage?: string; offLimits?: boolean } = {}

    if (body.stage !== undefined) {
      if (!VALID_STAGES.includes(body.stage)) {
        return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
      }
      data.stage = body.stage
    }

    if (body.offLimits !== undefined) {
      data.offLimits = body.offLimits
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await prisma.candidateInvite.update({ where: { id }, data })

    return NextResponse.json({ data: { stage: updated.stage, offLimits: updated.offLimits } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
