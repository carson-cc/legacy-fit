import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { roleTitle } = await req.json()
    if (!roleTitle || typeof roleTitle !== 'string' || roleTitle.trim().length < 3) {
      return NextResponse.json({ error: 'Provide a role title.' }, { status: 400 })
    }
    if (roleTitle.trim().length > 120) {
      return NextResponse.json({ error: 'Role title is too long.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI classification not configured.' }, { status: 503 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are a calibrated behavioral signal analyst. You understand four behavioral dimensions used to profile workplace performance:
- Execution (dominance): drive to control outcomes, push through obstacles, and deliver results under pressure. High = assertive, decisive, controlling. Low = collaborative, deferential, steady.
- Collaboration (extraversion): social energy, communication, relationship building. High = outgoing, persuasive, people-oriented. Low = reserved, independent, task-focused.
- Adaptability (patience): preference for steady pace vs urgency, tolerance for change. High = calm, methodical, consistent. Low = fast-paced, urgent, restless.
- Ownership (formality): need for structure, rules, accountability, and adherence to process. High = disciplined, precise, compliance-focused. Low = flexible, informal, improvises.

Given a role title, return the ideal behavioral target profile for strong performers in that role. Values are 0.0-1.0.`,
      messages: [
        {
          role: 'user',
          content: `Role title: "${roleTitle.trim()}"

Return ONLY valid JSON, no markdown, no extra text:
{
  "roleType": "brief category (e.g. Field Operations, Finance, Sales, Executive, HR)",
  "dominance": 0.0,
  "extraversion": 0.0,
  "patience": 0.0,
  "formality": 0.0,
  "confidence": "High" | "Medium" | "Low",
  "rationale": "One sentence explaining the behavioral profile and why it fits this role"
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
    const clamp = (v: unknown) => { const n = Number(v); return isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5 }

    return NextResponse.json({
      data: {
        roleType: String(parsed.roleType || roleTitle),
        dominance: clamp(parsed.dominance),
        extraversion: clamp(parsed.extraversion),
        patience: clamp(parsed.patience),
        formality: clamp(parsed.formality),
        confidence: String(parsed.confidence || 'Medium'),
        rationale: String(parsed.rationale || ''),
      },
    })
  } catch (err) {
    console.error('Classify role error:', err)
    return NextResponse.json({ error: 'Classification failed. Set the benchmark manually.' }, { status: 500 })
  }
}
