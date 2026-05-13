import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg, assertClientInOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertClientInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
  try {
    const hms = await prisma.hiringManagerAssessment.findMany({
      where: { clientId: id, orgId: ctx.orgId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, profileType: true, completedAt: true, token: true, dominance: true, extraversion: true, patience: true, formality: true },
    })
    return NextResponse.json({ data: hms })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertClientInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
  try {
    const { name, email } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const hm = await prisma.hiringManagerAssessment.create({
      data: { clientId: id, name, email: email || null, orgId: ctx.orgId },
    })

    return NextResponse.json({
      data: { ...hm, assessmentUrl: `/assess/${hm.token}?type=hm` },
    })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
