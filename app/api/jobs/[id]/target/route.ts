import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg, assertJobInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertJobInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  try {
    const { dominance, extraversion, patience, formality, notes } = await req.json()

    const target = await prisma.jobTarget.upsert({
      where: { jobId: id },
      update: { dominance, extraversion, patience, formality, notes },
      create: { jobId: id, dominance, extraversion, patience, formality, notes },
    })

    await prisma.eventLog.create({
      data: { event: 'job_target.set', entityId: id, orgId: ctx.orgId, userId: ctx.userId },
    })

    return NextResponse.json({ data: target })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
