import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'
import { validate, nonEmptyStr, optional, str } from '@/lib/validation'

export async function GET() {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  try {
    const clients = await prisma.client.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { name: 'asc' },
      include: {
        hiringManagers: {
          select: { id: true, name: true, profileType: true, completedAt: true },
        },
        jobs: {
          select: { id: true, archivedAt: true },
        },
      },
    })

    const data = clients.map(c => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      completedHMs: c.hiringManagers
        .filter(h => h.completedAt !== null)
        .map(h => ({ id: h.id, name: h.name, profileType: h.profileType })),
      pendingHMs: c.hiringManagers.filter(h => !h.completedAt).length,
      activeJobs: c.jobs.filter(j => !j.archivedAt).length,
    }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  try {
    const body = await req.json()
    const v = validate(body, {
      name: nonEmptyStr(200),
      industry: optional(str(120)),
    })
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

    const client = await prisma.client.create({
      data: {
        name: v.value.name,
        industry: v.value.industry ?? null,
        orgId: ctx.orgId,
      },
    })

    await prisma.eventLog.create({
      data: { event: 'client.created', entityId: client.id, orgId: ctx.orgId, userId: ctx.userId },
    })

    return NextResponse.json({
      data: { ...client, completedHMs: [], pendingHMs: 0, activeJobs: 0 },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
