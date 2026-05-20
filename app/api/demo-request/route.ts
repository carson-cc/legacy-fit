import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PRODUCT_NAME } from '@/lib/brand'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 3
const ipCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
  const firm = typeof body.firm === 'string' ? body.firm.trim().slice(0, 100) : ''
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : ''
  const searches = typeof body.searches === 'string' ? body.searches.trim().slice(0, 1000) : ''

  if (!name || !firm || !email) {
    return NextResponse.json({ error: 'name, firm, and email are required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const meta = JSON.stringify({ name, firm, email, searches, ip })

  await prisma.eventLog.create({
    data: {
      event: 'demo.request',
      entityId: email,
      meta,
    },
  })

  // Best-effort email — don't fail the request if SendGrid is down
  await sendDemoRequestEmail({ name, firm, email, searches }).catch(err =>
    console.error('demo-request email failed:', err),
  )

  return NextResponse.json({ ok: true })
}

async function sendDemoRequestEmail(opts: {
  name: string
  firm: string
  email: string
  searches: string
}) {
  const apiKey = process.env.SENDGRID_API_KEY
  const founderEmail = process.env.FOUNDER_EMAIL
  const from = process.env.SENDGRID_FROM
  if (!apiKey || !founderEmail || !from) return

  const { default: sgMail } = await import('@sendgrid/mail')
  sgMail.setApiKey(apiKey)

  const subject = `[${PRODUCT_NAME}] Demo request — ${opts.firm}`
  const text = [
    `New demo request from ${opts.name} at ${opts.firm}.`,
    '',
    `Name: ${opts.name}`,
    `Firm: ${opts.firm}`,
    `Email: ${opts.email}`,
    `Searches: ${opts.searches || '(not provided)'}`,
    '',
    'Reply directly to schedule a call.',
  ].join('\n')

  await sgMail.send({
    to: founderEmail,
    from,
    replyTo: opts.email,
    subject,
    text,
  })
}
