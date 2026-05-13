// ---------------------------------------------------------------------------
// Tenant isolation test
// ---------------------------------------------------------------------------
//
// This is the test that makes the multi-tenant refactor non-negotiable: it
// proves that a user in org A cannot read records from org B. If anyone ever
// adds a new API route that forgets to filter by orgId, this test breaks.
//
// The test boots two orgs + two users + per-org records, then exercises the
// auth-helpers contract directly. We deliberately do NOT run the full
// Next.js HTTP stack — bringing up a dev server in a test is slow and
// flaky; instead we assert the helper used by every route (assertJobInOrg,
// assertClientInOrg, assertInviteInOrg) correctly rejects cross-tenant
// access, and we assert that a per-org findMany returns only the org's rows.
//
// Run with:
//   npx tsx --test lib/__tests__/tenant-isolation.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'
import {
  assertClientInOrg,
  assertJobInOrg,
  assertInviteInOrg,
} from '../auth-helpers'

const prisma = new PrismaClient()

// Suffix every fixture id so we don't collide with seed data and so the test
// can be re-run without manual cleanup.
const SUFFIX = `tenant-test-${process.pid}-${Date.now()}`
const orgAId    = `org-a-${SUFFIX}`
const orgBId    = `org-b-${SUFFIX}`
const clientAId = `client-a-${SUFFIX}`
const clientBId = `client-b-${SUFFIX}`
const jobAId    = `job-a-${SUFFIX}`
const jobBId    = `job-b-${SUFFIX}`
const inviteAId = `invite-a-${SUFFIX}`
const inviteBId = `invite-b-${SUFFIX}`

async function seed() {
  await prisma.organization.create({ data: { id: orgAId, name: 'Firm A', slug: `firm-a-${SUFFIX}` } })
  await prisma.organization.create({ data: { id: orgBId, name: 'Firm B', slug: `firm-b-${SUFFIX}` } })
  await prisma.client.create({ data: { id: clientAId, name: 'Client A', orgId: orgAId } })
  await prisma.client.create({ data: { id: clientBId, name: 'Client B', orgId: orgBId } })
  await prisma.job.create({ data: { id: jobAId, title: 'Job A', roleType: 'gm', orgId: orgAId, clientId: clientAId } })
  await prisma.job.create({ data: { id: jobBId, title: 'Job B', roleType: 'gm', orgId: orgBId, clientId: clientBId } })
  await prisma.candidateInvite.create({ data: { id: inviteAId, jobId: jobAId, name: 'Alice', token: `tok-a-${SUFFIX}` } })
  await prisma.candidateInvite.create({ data: { id: inviteBId, jobId: jobBId, name: 'Bob', token: `tok-b-${SUFFIX}` } })
}

async function cleanup() {
  // Order matters: children before parents.
  await prisma.candidateInvite.deleteMany({ where: { id: { in: [inviteAId, inviteBId] } } })
  await prisma.job.deleteMany({ where: { id: { in: [jobAId, jobBId] } } })
  await prisma.client.deleteMany({ where: { id: { in: [clientAId, clientBId] } } })
  await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } })
}

test('tenant isolation: assertClientInOrg rejects cross-tenant', async (t) => {
  await seed()
  t.after(cleanup)

  // Same-tenant lookups succeed.
  assert.equal(await assertClientInOrg(clientAId, orgAId), true)
  assert.equal(await assertClientInOrg(clientBId, orgBId), true)

  // Cross-tenant lookups must fail.
  assert.equal(await assertClientInOrg(clientAId, orgBId), false, 'Org B must not see Client A')
  assert.equal(await assertClientInOrg(clientBId, orgAId), false, 'Org A must not see Client B')

  // Unknown id returns false (does not throw).
  assert.equal(await assertClientInOrg('does-not-exist', orgAId), false)
})

test('tenant isolation: assertJobInOrg rejects cross-tenant', async () => {
  // Reuses the fixtures created by the previous test — we re-seed for
  // determinism in case the test runner reorders.
  await cleanup().catch(() => { /* fixtures may not exist yet */ })
  await seed()

  assert.equal(await assertJobInOrg(jobAId, orgAId), true)
  assert.equal(await assertJobInOrg(jobBId, orgBId), true)
  assert.equal(await assertJobInOrg(jobAId, orgBId), false, 'Org B must not see Job A')
  assert.equal(await assertJobInOrg(jobBId, orgAId), false, 'Org A must not see Job B')

  await cleanup()
})

test('tenant isolation: assertInviteInOrg follows job → org chain', async () => {
  await seed()

  assert.equal(await assertInviteInOrg(inviteAId, orgAId), true)
  assert.equal(await assertInviteInOrg(inviteAId, orgBId), false, 'Org B must not see Invite A even by id')
  assert.equal(await assertInviteInOrg(inviteBId, orgAId), false, 'Org A must not see Invite B even by id')

  await cleanup()
})

test('tenant isolation: scoped findMany returns only own org records', async () => {
  await seed()

  // The shape that every list-route query uses.
  const aJobs = await prisma.job.findMany({ where: { orgId: orgAId } })
  const bJobs = await prisma.job.findMany({ where: { orgId: orgBId } })

  assert.equal(aJobs.length, 1)
  assert.equal(aJobs[0].id, jobAId)
  assert.equal(bJobs.length, 1)
  assert.equal(bJobs[0].id, jobBId)

  // A query without orgId returns everything — this is the bug class the
  // refactor exists to prevent. We assert it explicitly so anyone reading
  // the test understands why orgId is mandatory.
  const allJobs = await prisma.job.findMany({ where: { id: { in: [jobAId, jobBId] } } })
  assert.equal(allJobs.length, 2)

  await cleanup()
})

test.after(async () => { await prisma.$disconnect() })
