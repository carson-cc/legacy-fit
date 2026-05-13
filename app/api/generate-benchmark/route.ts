import { logError } from '@/lib/log'
import { NextRequest, NextResponse } from 'next/server'
import { requireOrg } from '@/lib/auth-helpers'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const ctx = await requireOrg()
  if (ctx instanceof NextResponse) return ctx

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured.' }, { status: 503 })

  try {
    const { roleTitle, clientName, brief, roleScope, environmentSignals } = await req.json()

    if (!roleTitle || typeof roleTitle !== 'string' || roleTitle.trim().length < 1) {
      return NextResponse.json({ error: 'Provide a role title.' }, { status: 400 })
    }
    if (!brief || typeof brief !== 'string' || brief.trim().length < 20) {
      return NextResponse.json({ error: 'Provide a meaningful role brief (at least 20 characters).' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const envLines = Object.entries(environmentSignals || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join('\n')

    const userMessage = [
      `Role title: ${roleTitle.trim()}`,
      clientName ? `Client: ${clientName}` : null,
      roleScope ? `Role scope: ${roleScope}` : null,
      envLines ? `Environment signals:\n${envLines}` : null,
      '',
      `Role brief:`,
      brief.trim(),
    ].filter(Boolean).join('\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      system: `You are configuring a behavioral benchmark for an executive search role.

Based on the role title, role brief, role scope, and environment signals provided, set values from 0–100 for five behavioral dimensions and provide a one-line plain-English explanation for each.

The five dimensions are:
- Execution: how quickly and decisively the person acts under pressure
- Ownership: degree of personal accountability for outcomes
- Adaptability: comfort with ambiguity and shifting priorities
- Collaboration: orientation toward working through others vs. independently
- Decision Speed: urgency in making and committing to decisions

Also provide a one-sentence summary of the kind of operator this role favors.

Guidelines:
- Set values based on what strong performers in this role actually need, not generic ideals
- 50 is average
- 75+ means this dimension is meaningfully important
- 85+ should be reserved for roles where that dimension is truly critical
- Collaboration and execution may trade off
- Autonomous environments should generally increase execution and lower collaboration
- Consensus-heavy environments should generally increase collaboration and moderate decision speed
- Building-from-scratch roles should generally increase ownership and adaptability
- Return only valid JSON with no extra commentary`,
      messages: [
        {
          role: 'user',
          content: `${userMessage}

Return ONLY valid JSON:
{
  "summary": "One plain-English sentence describing the kind of operator this role favors.",
  "dimensions": {
    "execution": { "value": 0, "explanation": "..." },
    "ownership": { "value": 0, "explanation": "..." },
    "adaptability": { "value": 0, "explanation": "..." },
    "collaboration": { "value": 0, "explanation": "..." },
    "decisionSpeed": { "value": 0, "explanation": "..." }
  }
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
    const clampInt = (v: unknown) => {
      const n = Number(v)
      return isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50
    }
    const str = (v: unknown) => String(v || '')

    return NextResponse.json({
      data: {
        summary: str(parsed.summary),
        dimensions: {
          execution:     { value: clampInt(parsed.dimensions?.execution?.value),     explanation: str(parsed.dimensions?.execution?.explanation) },
          ownership:     { value: clampInt(parsed.dimensions?.ownership?.value),     explanation: str(parsed.dimensions?.ownership?.explanation) },
          adaptability:  { value: clampInt(parsed.dimensions?.adaptability?.value),  explanation: str(parsed.dimensions?.adaptability?.explanation) },
          collaboration: { value: clampInt(parsed.dimensions?.collaboration?.value), explanation: str(parsed.dimensions?.collaboration?.explanation) },
          decisionSpeed: { value: clampInt(parsed.dimensions?.decisionSpeed?.value), explanation: str(parsed.dimensions?.decisionSpeed?.explanation) },
        },
      },
    })
  } catch (err) {
    logError(err, { route: '/api/generate-benchmark' })
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
