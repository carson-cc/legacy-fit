import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Split invites by type so the UI can render them in separate sections
    const candidates   = job.invites.filter(i => i.inviteType !== 'team_member')
    const teamMembers  = job.invites.filter(i => i.inviteType === 'team_member')

    return NextResponse.json({ data: { ...job, invites: candidates, teamMembers } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
