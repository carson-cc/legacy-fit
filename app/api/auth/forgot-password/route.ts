import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { validate, emailLike } from '@/lib/validation'

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------
//
// Always returns 200 — regardless of whether the email exists — so the
// endpoint cannot be used as an account-enumeration oracle. The user is told
// "if an account exists, you'll get an email."

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const v = validate(body, { email: emailLike })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: v.value.email } })
  if (user) {
    // Generate a high-entropy token. crypto.randomBytes(32) → 256 bits, hex
    // encoded for URL safety.
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } })

    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password/${token}`
    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl })
    } catch (err) {
      console.error('Password reset email failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
