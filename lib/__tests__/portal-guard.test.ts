// ---------------------------------------------------------------------------
// Portal report guard conditions
// ---------------------------------------------------------------------------
//
// Verifies that the conditions the portal/report route uses to block
// offLimits and unapproved candidates are correctly stored in and returned
// from the DB. Tests exercise Prisma directly (no HTTP server required).
//
// Run with:
//   npx tsx --test lib/__tests__/portal-guard.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SUFFIX = `portal-guard-${process.pid}-${Date.now()}`
const orgId    = `org-${SUFFIX}`
const clientId = `client-${SUFFIX}`
const jobId    = `job-${SUFFIX}`

const makeInvite = (id: string, opts: { offLimits: boolean; approvedForClient: boolean; stage: string }) => ({
  id,
  jobId,
  name: 'Test Candidate',
  token: `tok-${id}`,
  offLimits: opts.offLimits,
  approvedForClient: opts.approvedForClient,
  stage: opts.stage,
})

async function seed() {
  await prisma.organization.create({ data: { id: orgId, name: 'Test Firm', slug: `firm-${SUFFIX}` } })
  await prisma.client.create({ data: { id: clientId, name: 'Test Client', orgId } })
  await prisma.job.create({ data: { id: jobId, title: 'Test Role', roleType: 'gm', orgId, clientId } })
}

async function cleanup() {
  await prisma.candidateInvite.deleteMany({ where: { jobId } })
  await prisma.job.delete({ where: { id: jobId } })
  await prisma.client.delete({ where: { id: clientId } })
  await prisma.organization.delete({ where: { id: orgId } })
}

test('portal guard: offLimits=true blocks candidate', async (t) => {
  await seed()
  t.after(cleanup)

  const id = `invite-ol-${SUFFIX}`
  await prisma.candidateInvite.create({ data: makeInvite(id, { offLimits: true, approvedForClient: true, stage: 'client_ready' }) })

  const invite = await prisma.candidateInvite.findUnique({ where: { id } })
  assert.ok(invite, 'invite should exist')
  // The portal route guard: if (result.invite.offLimits || !result.invite.approvedForClient) → 404
  assert.ok(invite.offLimits || !invite.approvedForClient,
    'offLimits=true should trigger the portal guard')
})

test('portal guard: approvedForClient=false blocks candidate', async (t) => {
  await seed()
  t.after(cleanup)

  const id = `invite-na-${SUFFIX}`
  await prisma.candidateInvite.create({ data: makeInvite(id, { offLimits: false, approvedForClient: false, stage: 'client_ready' }) })

  const invite = await prisma.candidateInvite.findUnique({ where: { id } })
  assert.ok(invite)
  assert.ok(invite.offLimits || !invite.approvedForClient,
    'approvedForClient=false should trigger the portal guard')
})

test('portal guard: approved non-offLimits candidate passes guard', async (t) => {
  await seed()
  t.after(cleanup)

  const id = `invite-ok-${SUFFIX}`
  await prisma.candidateInvite.create({ data: makeInvite(id, { offLimits: false, approvedForClient: true, stage: 'client_ready' }) })

  const invite = await prisma.candidateInvite.findUnique({ where: { id } })
  assert.ok(invite)
  assert.ok(!(invite.offLimits || !invite.approvedForClient),
    'clean candidate should not trigger the portal guard')
})

test('portal guard: stage not in visibleStages blocks candidate', async (t) => {
  await seed()
  t.after(cleanup)

  const id = `invite-stage-${SUFFIX}`
  await prisma.candidateInvite.create({ data: makeInvite(id, { offLimits: false, approvedForClient: true, stage: 'longlist' }) })

  const invite = await prisma.candidateInvite.findUnique({ where: { id } })
  assert.ok(invite)
  const visibleStages = ['client_ready', 'client_approved']
  assert.ok(!visibleStages.includes(invite.stage),
    'longlist stage should not be visible in portal')
})

test.after(async () => { await prisma.$disconnect() })
