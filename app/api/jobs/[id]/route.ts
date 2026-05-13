import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/auth-helpers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: true,
        target: true,
        invites: {
          include: { result: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!job || job.orgId !== ctx.orgId) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Split invites by type so the UI can render them in separate sections
    const candidates  = job.invites.filter(i => i.inviteType !== 'team_member')
    const teamMembers = job.invites.filter(i => i.inviteType === 'team_member')

    return NextResponse.json({ data: { ...job, invites: candidates, teamMembers } })
  } catch (err) {
    logError(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
