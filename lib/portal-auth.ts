import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

export const PORTAL_COOKIE = 'veltro_portal'

export interface PortalContext {
  contactId: string
  jobId:     string
  orgId:     string
}

/**
 * Reads the portal cookie from a request, validates the token against the DB,
 * and returns the contact context. Returns a NextResponse error on failure.
 *
 * Same 404-not-403 policy as the recruiter auth helpers — we don't reveal
 * whether a token exists in a different state.
 */
export async function requirePortalSession(
  req: NextRequest,
): Promise<PortalContext | NextResponse> {
  const token = req.cookies.get(PORTAL_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const contact = await prisma.clientContact.findUnique({
    where: { token },
    include: { job: { select: { orgId: true } } },
  })

  if (!contact || contact.revokedAt || contact.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Stamp last access time (fire-and-forget; don't block the response)
  prisma.clientContact
    .update({ where: { id: contact.id }, data: { lastAccessAt: new Date() } })
    .catch(() => {})

  return { contactId: contact.id, jobId: contact.jobId, orgId: contact.job.orgId }
}

/** Builds a Set-Cookie header value for the portal token. */
export function portalCookieHeader(token: string, expiresAt: Date): string {
  const expires = expiresAt.toUTCString()
  return `${PORTAL_COOKIE}=${token}; Path=/portal; HttpOnly; SameSite=Lax; Expires=${expires}`
}
