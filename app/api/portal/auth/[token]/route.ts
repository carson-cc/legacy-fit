import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { portalCookieHeader } from '@/lib/portal-auth'

type Params = { params: Promise<{ token: string }> }

// GET /api/portal/auth/[token]
// The magic-link URL. Validates the token, sets an HttpOnly cookie, and
// redirects to the portal shortlist. Expired or revoked tokens show a
// plain error page rather than leaking whether the token ever existed.
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  const contact = await prisma.clientContact.findUnique({
    where: { token },
    select: { id: true, jobId: true, expiresAt: true, revokedAt: true },
  })

  if (!contact || contact.revokedAt || contact.expiresAt < new Date()) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(`${appUrl}/portal/expired`)
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const response = NextResponse.redirect(`${appUrl}/portal/shortlist`)

  response.headers.set(
    'Set-Cookie',
    portalCookieHeader(token, contact.expiresAt),
  )

  return response
}
