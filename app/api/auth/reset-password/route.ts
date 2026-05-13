import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validate, password, nonEmptyStr } from '@/lib/validation'

// POST /api/auth/reset-password { token, password }
// Validates the token, swaps the user's password, marks the token used.
export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const v = validate(body, { token: nonEmptyStr(200), password })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const row = await prisma.passwordResetToken.findUnique({ where: { token: v.value.token } })
  if (!row) return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 400 })
  if (row.usedAt) return NextResponse.json({ error: 'This link has already been used.' }, { status: 400 })
  if (row.expiresAt < new Date()) return NextResponse.json({ error: 'This link has expired.' }, { status: 400 })

  const hash = await bcrypt.hash(v.value.password, 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { password: hash } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.eventLog.create({ data: { event: 'password.reset', entityId: row.userId, userId: row.userId } }),
  ])

  return NextResponse.json({ ok: true })
}
