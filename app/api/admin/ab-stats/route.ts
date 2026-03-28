import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const results = await prisma.assessmentResult.findMany({
      include: { invite: { include: { outcome: true } } },
    })

    // Group by scoringVariant
    const groups: Record<string, typeof results> = {}
    for (const r of results) {
      const variant = r.scoringVariant || 'v1_stepped'
      if (!groups[variant]) groups[variant] = []
      groups[variant].push(r)
    }

    const data = Object.entries(groups).map(([variant, items]) => {
      const fitValues = items.filter(i => i.fitPct != null).map(i => i.fitPct!)
      const avgFit = fitValues.length > 0
        ? Math.round(fitValues.reduce((a, b) => a + b, 0) / fitValues.length)
        : 0
      const avgAdaptation = items.reduce((a, i) => a + i.adaptationStress, 0) / items.length
      const placed = items.filter(i => i.invite.outcome?.placed).length
      const retained90 = items.filter(i => i.invite.outcome?.retainedAt90).length

      return {
        variant,
        count: items.length,
        avgFit,
        avgAdaptation,
        placedCount: placed,
        retainedAt90: retained90,
      }
    })

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
