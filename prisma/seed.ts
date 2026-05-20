import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { scoreAssessment, SCORING_VERSION } from '../lib/scoring'
import { ADJECTIVES } from '../lib/data/adjectives'
import { COMPOSITE_ROLE_PRESETS } from '../lib/data/norms'

const prisma = new PrismaClient()

// Helper: pick words to produce approximate target scores
function pickWords(targets: { dominance: number; extraversion: number; patience: number; formality: number }) {
  const dims = ['dominance', 'extraversion', 'patience', 'formality'] as const
  const checked: string[] = []

  for (const dim of dims) {
    const target = targets[dim]
    const positives = ADJECTIVES.filter(a => a.dimension === dim && a.polarity === 'positive')
    const negatives = ADJECTIVES.filter(a => a.dimension === dim && a.polarity === 'negative')

    // Higher target → check more positives, fewer negatives
    // score = ((posChecked*5 + posUnchecked*1) + (negChecked*1 + negUnchecked*5)) / 20
    // Solve for posChecked count given target and 10 pos + 10 neg:
    // We want normalized = target, so raw = target * 4 + 1
    // raw = (5*Np + 1*(10-Np) + 1*Nn + 5*(10-Nn)) / 20
    // raw = (4Np + 10 + 50 - 4Nn) / 20 = (4Np - 4Nn + 60) / 20
    // target*4+1 = (4Np - 4Nn + 60) / 20
    // 20*(target*4+1) = 4Np - 4Nn + 60
    // 80*target + 20 = 4Np - 4Nn + 60
    // 4Np - 4Nn = 80*target - 40
    // Np - Nn = 20*target - 10
    // With Np in [0..10], Nn in [0..10]
    const diff = Math.round(20 * target - 10) // Np - Nn
    // Choose Np and Nn to satisfy diff = Np - Nn
    let Np = Math.max(0, Math.min(10, Math.round((diff + 10) / 2)))
    let Nn = Np - diff
    if (Nn < 0) { Nn = 0; Np = diff }
    if (Nn > 10) { Nn = 10; Np = diff + 10 }
    Np = Math.max(0, Math.min(10, Np))
    Nn = Math.max(0, Math.min(10, Nn))

    for (let i = 0; i < Np; i++) checked.push(positives[i].word)
    for (let i = 0; i < Nn; i++) checked.push(negatives[i].word)
  }

  return checked
}

async function main() {
  // ─── Default organization ────────────────────────────────────────────────
  // With the multi-tenant migration every Client/Job/HM belongs to an Org.
  // We seed one demo firm and one admin user. A second org is created by
  // the tenant-isolation test fixture (see lib/__tests__/tenant-isolation).
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-firm' },
    update: {},
    create: { id: 'org-demo', name: 'Demo Search Firm', slug: 'demo-firm' },
  })

  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@veltro.ai' },
    update: { orgId: demoOrg.id, role: 'owner' },
    create: {
      email: 'admin@veltro.ai',
      password: hashedPassword,
      name: 'Admin User',
      orgId: demoOrg.id,
      role: 'owner',
    },
  })

  // Seed sample clients
  const gilbane = await prisma.client.upsert({
    where: { id: 'client-gilbane' },
    update: { orgId: demoOrg.id },
    create: {
      id: 'client-gilbane',
      name: 'Gilbane Construction',
      industry: 'Commercial Construction',
      orgId: demoOrg.id,
    },
  })

  const ford = await prisma.client.upsert({
    where: { id: 'client-ford' },
    update: { orgId: demoOrg.id },
    create: {
      id: 'client-ford',
      name: 'Ford Motor Company',
      industry: 'Automotive Manufacturing',
      orgId: demoOrg.id,
    },
  })

  // Seed sample jobs
  const supeJob = await prisma.job.upsert({
    where: { id: 'job-supe-chi' },
    update: { orgId: demoOrg.id },
    create: {
      id: 'job-supe-chi',
      title: 'Superintendent — Chicago',
      roleType: 'superintendent',
      clientId: gilbane.id,
      orgId: demoOrg.id,
    },
  })

  await prisma.jobTarget.upsert({
    where: { jobId: supeJob.id },
    update: {},
    create: {
      jobId: supeJob.id,
      dominance: 0.75,
      extraversion: 0.55,
      patience: 0.35,
      formality: 0.60,
      notes: 'Need someone who can run a 50-person crew without daily oversight.',
    },
  })

  const foremanJob = await prisma.job.upsert({
    where: { id: 'job-foreman-cle' },
    update: { orgId: demoOrg.id },
    create: {
      id: 'job-foreman-cle',
      title: 'Foreman — Cleveland',
      roleType: 'foreman',
      clientId: gilbane.id,
      orgId: demoOrg.id,
    },
  })

  await prisma.jobTarget.upsert({
    where: { jobId: foremanJob.id },
    update: {},
    create: {
      jobId: foremanJob.id,
      dominance: 0.65,
      extraversion: 0.45,
      patience: 0.50,
      formality: 0.55,
    },
  })

  const fordJob = await prisma.job.upsert({
    where: { id: 'job-trades-dearborn' },
    update: { orgId: demoOrg.id },
    create: {
      id: 'job-trades-dearborn',
      title: 'Skilled Trades — Dearborn',
      roleType: 'foreman',
      clientId: ford.id,
      orgId: demoOrg.id,
    },
  })

  await prisma.jobTarget.upsert({
    where: { jobId: fordJob.id },
    update: {},
    create: {
      jobId: fordJob.id,
      dominance: 0.55,
      extraversion: 0.40,
      patience: 0.65,
      formality: 0.75,
    },
  })

  // ------------------------------------------------------------------
  //  Seed 4 completed candidates with realistic assessment results
  // ------------------------------------------------------------------

  // 1. Marcus Thompson — Pioneer target (D=0.85, E=0.70, P=0.25, F=0.60)
  const marcusList2 = pickWords({ dominance: 0.85, extraversion: 0.70, patience: 0.25, formality: 0.60 })
  const marcusList1 = pickWords({ dominance: 0.80, extraversion: 0.65, patience: 0.30, formality: 0.55 })
  const marcusResult = scoreAssessment(marcusList1, marcusList2, ADJECTIVES, {
    target: { dominance: 0.75, extraversion: 0.55, patience: 0.35, formality: 0.60 },
    compositeWeights: COMPOSITE_ROLE_PRESETS.superintendent,
  })

  const marcusInvite = await prisma.candidateInvite.upsert({
    where: { id: 'invite-marcus' },
    update: { completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    create: {
      id: 'invite-marcus',
      jobId: supeJob.id,
      token: 'demo-marcus-token',
      name: 'Marcus Thompson',
      email: 'marcus@example.com',
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  })

  await prisma.assessmentResult.upsert({
    where: { inviteId: marcusInvite.id },
    update: {},
    create: {
      inviteId: marcusInvite.id,
      dominance: marcusResult.scores.dominance,
      extraversion: marcusResult.scores.extraversion,
      patience: marcusResult.scores.patience,
      formality: marcusResult.scores.formality,
      domPercentile: marcusResult.percentiles.dominance,
      extPercentile: marcusResult.percentiles.extraversion,
      patPercentile: marcusResult.percentiles.patience,
      forPercentile: marcusResult.percentiles.formality,
      profileName: marcusResult.profile.name,
      profileGroup: marcusResult.profile.group,
      secondaryProfile: marcusResult.secondaryProfile.name,
      adaptationStress: marcusResult.adaptationStress,
      fitPct: marcusResult.fitPct,
      list1Responses: JSON.stringify(marcusList1),
      list2Responses: JSON.stringify(marcusList2),
      list1Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list2Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list1Count: marcusList1.length,
      list2Count: marcusList2.length,
      timeOnPage1Ms: 185000,
      timeOnPage2Ms: 162000,
      scoringVersion: SCORING_VERSION,
      rushed: false,
    },
  })

  // 2. Keisha Williams — Navigator target (D=0.50, E=0.35, P=0.70, F=0.85)
  const keishaList2 = pickWords({ dominance: 0.50, extraversion: 0.35, patience: 0.70, formality: 0.85 })
  const keishaList1 = pickWords({ dominance: 0.55, extraversion: 0.40, patience: 0.65, formality: 0.80 })
  const keishaResult = scoreAssessment(keishaList1, keishaList2, ADJECTIVES, {
    target: { dominance: 0.75, extraversion: 0.55, patience: 0.35, formality: 0.60 },
    compositeWeights: COMPOSITE_ROLE_PRESETS.superintendent,
  })

  const keishaInvite = await prisma.candidateInvite.upsert({
    where: { id: 'invite-keisha' },
    update: { completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    create: {
      id: 'invite-keisha',
      jobId: supeJob.id,
      token: 'demo-keisha-token',
      name: 'Keisha Williams',
      email: 'keisha@example.com',
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  })

  await prisma.assessmentResult.upsert({
    where: { inviteId: keishaInvite.id },
    update: {},
    create: {
      inviteId: keishaInvite.id,
      dominance: keishaResult.scores.dominance,
      extraversion: keishaResult.scores.extraversion,
      patience: keishaResult.scores.patience,
      formality: keishaResult.scores.formality,
      domPercentile: keishaResult.percentiles.dominance,
      extPercentile: keishaResult.percentiles.extraversion,
      patPercentile: keishaResult.percentiles.patience,
      forPercentile: keishaResult.percentiles.formality,
      profileName: keishaResult.profile.name,
      profileGroup: keishaResult.profile.group,
      secondaryProfile: keishaResult.secondaryProfile.name,
      adaptationStress: keishaResult.adaptationStress,
      fitPct: keishaResult.fitPct,
      list1Responses: JSON.stringify(keishaList1),
      list2Responses: JSON.stringify(keishaList2),
      list1Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list2Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list1Count: keishaList1.length,
      list2Count: keishaList2.length,
      timeOnPage1Ms: 210000,
      timeOnPage2Ms: 195000,
      scoringVersion: SCORING_VERSION,
      rushed: false,
    },
  })

  // 3. Andre Jackson — Rainmaker target (D=0.65, E=0.90, P=0.35, F=0.25)
  const andreList2 = pickWords({ dominance: 0.65, extraversion: 0.90, patience: 0.35, formality: 0.25 })
  const andreList1 = pickWords({ dominance: 0.60, extraversion: 0.85, patience: 0.40, formality: 0.30 })
  const andreResult = scoreAssessment(andreList1, andreList2, ADJECTIVES, {
    target: { dominance: 0.75, extraversion: 0.55, patience: 0.35, formality: 0.60 },
    compositeWeights: COMPOSITE_ROLE_PRESETS.superintendent,
  })

  const andreInvite = await prisma.candidateInvite.upsert({
    where: { id: 'invite-andre' },
    update: { completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    create: {
      id: 'invite-andre',
      jobId: supeJob.id,
      token: 'demo-andre-token',
      name: 'Andre Jackson',
      email: 'andre@example.com',
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.assessmentResult.upsert({
    where: { inviteId: andreInvite.id },
    update: {},
    create: {
      inviteId: andreInvite.id,
      dominance: andreResult.scores.dominance,
      extraversion: andreResult.scores.extraversion,
      patience: andreResult.scores.patience,
      formality: andreResult.scores.formality,
      domPercentile: andreResult.percentiles.dominance,
      extPercentile: andreResult.percentiles.extraversion,
      patPercentile: andreResult.percentiles.patience,
      forPercentile: andreResult.percentiles.formality,
      profileName: andreResult.profile.name,
      profileGroup: andreResult.profile.group,
      secondaryProfile: andreResult.secondaryProfile.name,
      adaptationStress: andreResult.adaptationStress,
      fitPct: andreResult.fitPct,
      list1Responses: JSON.stringify(andreList1),
      list2Responses: JSON.stringify(andreList2),
      list1Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list2Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list1Count: andreList1.length,
      list2Count: andreList2.length,
      timeOnPage1Ms: 145000,
      timeOnPage2Ms: 130000,
      scoringVersion: SCORING_VERSION,
      rushed: false,
    },
  })

  // 4. Sarah Chen — Veteran target (D=0.60, E=0.45, P=0.65, F=0.75)
  const sarahList2 = pickWords({ dominance: 0.60, extraversion: 0.45, patience: 0.65, formality: 0.75 })
  const sarahList1 = pickWords({ dominance: 0.55, extraversion: 0.50, patience: 0.60, formality: 0.70 })
  const sarahResult = scoreAssessment(sarahList1, sarahList2, ADJECTIVES, {
    target: { dominance: 0.55, extraversion: 0.40, patience: 0.65, formality: 0.75 },
    compositeWeights: COMPOSITE_ROLE_PRESETS.foreman,
  })

  const sarahInvite = await prisma.candidateInvite.upsert({
    where: { id: 'invite-sarah' },
    update: { completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    create: {
      id: 'invite-sarah',
      jobId: fordJob.id,
      token: 'demo-sarah-token',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.assessmentResult.upsert({
    where: { inviteId: sarahInvite.id },
    update: {},
    create: {
      inviteId: sarahInvite.id,
      dominance: sarahResult.scores.dominance,
      extraversion: sarahResult.scores.extraversion,
      patience: sarahResult.scores.patience,
      formality: sarahResult.scores.formality,
      domPercentile: sarahResult.percentiles.dominance,
      extPercentile: sarahResult.percentiles.extraversion,
      patPercentile: sarahResult.percentiles.patience,
      forPercentile: sarahResult.percentiles.formality,
      profileName: sarahResult.profile.name,
      profileGroup: sarahResult.profile.group,
      secondaryProfile: sarahResult.secondaryProfile.name,
      adaptationStress: sarahResult.adaptationStress,
      fitPct: sarahResult.fitPct,
      list1Responses: JSON.stringify(sarahList1),
      list2Responses: JSON.stringify(sarahList2),
      list1Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list2Order: JSON.stringify(ADJECTIVES.map(a => a.word)),
      list1Count: sarahList1.length,
      list2Count: sarahList2.length,
      timeOnPage1Ms: 160000,
      timeOnPage2Ms: 140000,
      scoringVersion: SCORING_VERSION,
      rushed: false,
    },
  })

  // Mark Sarah as placed and retained for outcome data
  await prisma.placementOutcome.upsert({
    where: { inviteId: sarahInvite.id },
    update: {},
    create: {
      inviteId: sarahInvite.id,
      placed: true,
      retainedAt90: true,
      retainedAt180: true,
      performanceRating: 4,
      notes: 'Strong placement. Onboarded smoothly.',
    },
  })

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
