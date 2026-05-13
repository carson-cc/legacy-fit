import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePortalSession } from '@/lib/portal-auth'

const ALLOWED_VERDICTS = ['client_approved', 'rejected'] as const
type Verdict = typeof ALLOWED_VERDICTS[number]

type Params = { params: Promise<{ inviteId: string }> }

// PATCH /api/portal/candidates/[inviteId]/feedback
// Body: { verdict: 'client_approved' | 'rejected' }
// Writes the client's decision back to CandidateInvite.stage.
// Only candidates in this contact's job and in stage 'client_ready' can be acted on.
export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = await requirePortalSession(req)
  if (ctx instanceof NextResponse) return ctx

  const { inviteId } = await params

  const body = await req.json().catch(() => null)
  const verdict: unknown = body?.verdict
  if (!ALLOWED_VERDICTS.includes(verdict as Verdict)) {
    return NextResponse.json(
      { error: `verdict must be one of: ${ALLOWED_VERDICTS.join(', ')}` },
      { status: 400 },
    )
  }

  const invite = await prisma.candidateInvite.findUnique({
    where: { id: inviteId },
    select: { id: true, jobId: true, stage: true },
  })

  if (!invite || invite.jobId !== ctx.jobId || invite.stage !== 'client_ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.candidateInvite.update({
    where: { id: inviteId },
    data:  { stage: verdict as string },
  })

  await prisma.eventLog.create({
    data: {
      event:    `client_portal.${verdict as string}`,
      entityId: inviteId,
      orgId:    ctx.orgId,
      meta:     JSON.stringify({ contactId: ctx.contactId }),
    },
  })

  return NextResponse.json({ ok: true, stage: verdict })
}
