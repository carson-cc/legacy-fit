import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { requireOrg, assertJobInOrg } from '@/lib/auth-helpers'
import Anthropic from '@anthropic-ai/sdk'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const { id } = await params
  if (!(await assertJobInOrg(id, ctx.orgId))) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  try {
    const { roleDescription } = await req.json()
    if (!roleDescription || typeof roleDescription !== 'string' || roleDescription.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide a more detailed role description.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI suggestions are not configured. Set the target manually.' }, { status: 503 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: `You are a calibrated behavioral signal analyst specializing in workplace role alignment. You understand four behavioral dimensions: Execution (drive to control outcomes and deliver results), Collaboration (social energy and communication), Adaptability (preference for steady pace vs urgency), and Ownership (need for rules, structure, and accountability). Given a role description, suggest optimal behavioral targets as decimal values 0.0-1.0 for each dimension.`,
      messages: [
        {
          role: 'user',
          content: `Role: ${roleDescription.trim()}

Return ONLY valid JSON in this exact format, no other text:
{
  "execution": 0.0,
  "ownership": 0.0,
  "adaptability": 0.0,
  "collaboration": 0.0,
  "decisionSpeed": 0.0,
  "summary": "string describing ideal candidate",
  "riskMismatches": ["string", "string", "string"]
}`,
        },
      ],
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response.' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    const clamp = (v: unknown) => Math.max(0, Math.min(1, Number(v) || 0.5))

    const result = {
      dominance: clamp(parsed.execution),
      extraversion: clamp(parsed.collaboration),
      patience: clamp(parsed.adaptability),
      formality: clamp(parsed.ownership),
      decisionSpeed: clamp(parsed.decisionSpeed),
      summary: String(parsed.summary || ''),
      riskMismatches: Array.isArray(parsed.riskMismatches) ? parsed.riskMismatches.map(String).slice(0, 5) : [],
    }

    return NextResponse.json({ data: result })
  } catch (err) {
    logError(err, { route: '/api/jobs/[id]/suggest-target' })
    return NextResponse.json({ error: 'Could not generate a suggestion. Set the target manually.' }, { status: 500 })
  }
}
