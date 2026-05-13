import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg, assertClientInOrg } from '@/lib/auth-helpers'
import { validate, nonEmptyStr } from '@/lib/validation'

export async function GET() {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  try {
    const jobs = await prisma.job.findMany({
      where: { orgId: ctx.orgId, archivedAt: null },
      include: {
        client: true,
        target: true,
        invites: { include: { result: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = jobs.map(job => ({
      id: job.id,
      title: job.title,
      roleType: job.roleType,
      client: { id: job.client.id, name: job.client.name },
      hasTarget: !!job.target,
      candidateCount: job.invites.filter(i => i.result).length,
      pendingCount: job.invites.filter(i => !i.result).length,
      topFit: job.invites
        .filter(i => i.result?.fitPct != null)
        .reduce((max, i) => Math.max(max, i.result!.fitPct!), 0),
      createdAt: job.createdAt,
    }))

    return NextResponse.json({ data })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  try {
    const body = await req.json()
    const v = validate(body, {
      title: nonEmptyStr(200),
      roleType: nonEmptyStr(80),
      clientId: nonEmptyStr(60),
    })
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

    // Confirm the client belongs to this org before linking — otherwise
    // a user could reach across tenants by submitting an arbitrary clientId.
    if (!(await assertClientInOrg(v.value.clientId, ctx.orgId))) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const job = await prisma.job.create({
      data: {
        title: v.value.title,
        roleType: v.value.roleType,
        clientId: v.value.clientId,
        orgId: ctx.orgId,
      },
    })

    await prisma.eventLog.create({
      data: { event: 'job.created', entityId: job.id, orgId: ctx.orgId, userId: ctx.userId },
    })

    return NextResponse.json({ data: job })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
