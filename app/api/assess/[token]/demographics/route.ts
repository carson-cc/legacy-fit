import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ token: string }> }

const VALID_GENDERS   = ['male', 'female', 'nonbinary', 'prefer_not'] as const
const VALID_RACES     = ['white', 'black', 'hispanic', 'asian', 'aian', 'nhpi', 'two_or_more', 'prefer_not'] as const
const VALID_AGES      = ['under_30', '30_39', '40_49', '50_59', '60_plus', 'prefer_not'] as const
const VALID_DISABILITY = ['yes', 'no', 'prefer_not'] as const
const VALID_VETERAN   = ['protected', 'not_protected', 'prefer_not'] as const

function nullable<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null
}

// POST: record voluntary demographics for a candidate invite.
// Called before the assessment starts; the invite must not be completed yet.
// All fields are optional — we accept whatever subset the candidate answered.
export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  try {
    const invite = await prisma.candidateInvite.findUnique({ where: { token } })
    if (!invite) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json() as Record<string, unknown>

    const gender     = nullable(body.gender,     VALID_GENDERS)
    const race       = nullable(body.race,        VALID_RACES)
    const ageRange   = nullable(body.ageRange,    VALID_AGES)
    const disability = nullable(body.disability,  VALID_DISABILITY)
    const veteran    = nullable(body.veteran,     VALID_VETERAN)

    // Nothing answered → don't write a row, but still acknowledge
    const anyProvided = [gender, race, ageRange, disability, veteran].some(v => v !== null)
    if (!anyProvided) return NextResponse.json({ ok: true })

    await prisma.candidateInvite.update({
      where: { id: invite.id },
      data:  { demographicsConsent: true },
    })

    await prisma.candidateDemographics.upsert({
      where:  { inviteId: invite.id },
      create: { inviteId: invite.id, gender, race, ageRange, disability, veteran },
      update: { gender, race, ageRange, disability, veteran },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
