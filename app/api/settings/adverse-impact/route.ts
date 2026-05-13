import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

// 4/5 (80%) rule: a group's selection rate must be >= 80% of the highest-rate group.
// Returns violation flag without ever returning individual candidate data.

interface GroupStats {
  label:         string
  total:         number   // candidates who answered this field
  selected:      number   // candidates who were moved to shortlist/client_ready/client_approved/hired
  rate:          number   // selected / total, 0–1
  fourFifthsFlag: boolean // true if rate < 0.8 * highestRate for this dimension
}

interface DimensionReport {
  dimension: string
  highestRate: number
  groups: GroupStats[]
}

const DIMENSION_OPTIONS: Record<string, { key: keyof typeof fieldMap; labels: Record<string, string> }> = {
  gender: {
    key: 'gender',
    labels: {
      male:       'Man',
      female:     'Woman',
      nonbinary:  'Non-binary',
      prefer_not: 'Prefer not to say',
    },
  },
  race: {
    key: 'race',
    labels: {
      white:       'White',
      black:       'Black / African American',
      hispanic:    'Hispanic / Latino',
      asian:       'Asian',
      aian:        'American Indian / Alaska Native',
      nhpi:        'Native Hawaiian / Pacific Islander',
      two_or_more: 'Two or more races',
      prefer_not:  'Prefer not to say',
    },
  },
  ageRange: {
    key: 'ageRange',
    labels: {
      under_30:   'Under 30',
      '30_39':    '30–39',
      '40_49':    '40–49',
      '50_59':    '50–59',
      '60_plus':  '60+',
      prefer_not: 'Prefer not to say',
    },
  },
  disability: {
    key: 'disability',
    labels: {
      yes:        'Has disability',
      no:         'No disability',
      prefer_not: 'Prefer not to say',
    },
  },
  veteran: {
    key: 'veteran',
    labels: {
      protected:     'Protected veteran',
      not_protected: 'Not a protected veteran',
      prefer_not:    'Prefer not to say',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fieldMap = { gender: '', race: '', ageRange: '', disability: '', veteran: '' }

const POSITIVE_STAGES = new Set(['shortlist', 'client_ready', 'client_approved'])

export async function GET() {
  const ctx = await requireRole('owner', 'admin', 'member')
  if (ctx instanceof NextResponse) return ctx

  // Load all demographics for invites in this org, joined with the invite's stage.
  const rows = await prisma.candidateDemographics.findMany({
    where: {
      invite: { job: { orgId: ctx.orgId } },
    },
    select: {
      gender:    true,
      race:      true,
      ageRange:  true,
      disability: true,
      veteran:   true,
      invite: {
        select: { stage: true },
      },
    },
  })

  const totalResponders = rows.length

  const dimensions: DimensionReport[] = Object.entries(DIMENSION_OPTIONS).map(([dimKey, dimCfg]) => {
    // Aggregate by group value for this dimension
    const groupMap = new Map<string, { total: number; selected: number }>()
    for (const row of rows) {
      const value = row[dimCfg.key as keyof typeof row] as string | null
      if (!value) continue
      const existing = groupMap.get(value) ?? { total: 0, selected: 0 }
      existing.total++
      if (POSITIVE_STAGES.has(row.invite.stage)) existing.selected++
      groupMap.set(value, existing)
    }

    const groups: GroupStats[] = Array.from(groupMap.entries()).map(([value, counts]) => ({
      label:          dimCfg.labels[value] ?? value,
      total:          counts.total,
      selected:       counts.selected,
      rate:           counts.total > 0 ? counts.selected / counts.total : 0,
      fourFifthsFlag: false, // computed below
    }))

    const highestRate = groups.reduce((max, g) => Math.max(max, g.rate), 0)
    // Flag only groups with ≥5 responses (standard statistical floor for the 4/5 rule)
    groups.forEach(g => {
      g.fourFifthsFlag = g.total >= 5 && highestRate > 0 && g.rate < highestRate * 0.8
    })

    return { dimension: dimKey, highestRate, groups }
  })

  return NextResponse.json({
    totalResponders,
    dimensions,
    note: 'Individual candidate data is never included. Minimum 5 responses required per group to flag the 4/5 rule.',
  })
}
