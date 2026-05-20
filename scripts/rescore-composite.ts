// scripts/rescore-composite.ts
// Run with: npx tsx scripts/rescore-composite.ts
// Recomputes fitPct for all candidates using v4.0.0 composite-space scoring.

import { prisma } from '@/lib/prisma'
import { computeCompositeDimensions, computeFitComposite } from '@/lib/scoring'
import { COMPOSITE_ROLE_PRESETS } from '@/lib/data/norms'
import type { RolePresetKey } from '@/lib/data/norms'

const DEFAULT_COMPOSITE_WEIGHTS = {
  execution: 0.20,
  ownership: 0.20,
  adaptability: 0.20,
  collaboration: 0.20,
  decisionSpeed: 0.20,
}

async function main() {
  const results = await prisma.assessmentResult.findMany({
    where: { fitPct: { not: null } },
    include: {
      invite: {
        include: {
          job: { include: { target: true } },
        },
      },
    },
  })

  console.log(`Found ${results.length} AssessmentResult records with fitPct set.`)

  let updated = 0
  let skipped = 0

  for (const record of results) {
    const target = record.invite.job.target
    if (!target) {
      console.log(`[${record.id}] skipped — no job target`)
      skipped++
      continue
    }

    const candidateScores = {
      dominance: record.dominance,
      extraversion: record.extraversion,
      patience: record.patience,
      formality: record.formality,
    }

    const targetScores = {
      dominance: target.dominance,
      extraversion: target.extraversion,
      patience: target.patience,
      formality: target.formality,
    }

    const roleType = record.invite.job.roleType as RolePresetKey
    const compositeWeights = COMPOSITE_ROLE_PRESETS[roleType] ?? DEFAULT_COMPOSITE_WEIGHTS

    const fitResult = computeFitComposite(
      computeCompositeDimensions(candidateScores),
      computeCompositeDimensions(targetScores),
      compositeWeights,
    )

    const oldFitPct = record.fitPct
    const newFitPct = fitResult.fitPct

    await prisma.assessmentResult.update({
      where: { id: record.id },
      data: { fitPct: newFitPct },
    })

    console.log(`[${record.id}] old: ${oldFitPct} → new: ${newFitPct}`)
    updated++
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
