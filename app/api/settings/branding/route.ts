import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth-helpers'

// GET /api/settings/branding — returns current org branding fields
export async function GET() {
  const ctx = await requireRole('owner', 'admin', 'member')
  if (ctx instanceof NextResponse) return ctx

  const org = await prisma.organization.findUnique({
    where: { id: ctx.orgId },
    select: {
      name:               true,
      brandLogoUrl:       true,
      brandPrimaryColor:  true,
      brandPartnerName:   true,
      brandPartnerEmail:  true,
    },
  })

  return NextResponse.json({ data: org })
}

// PATCH /api/settings/branding — updates org branding (owner/admin only)
export async function PATCH(req: NextRequest) {
  const ctx = await requireRole('owner', 'admin')
  if (ctx instanceof NextResponse) return ctx

  const body = await req.json().catch(() => ({}))
  const { brandLogoUrl, brandPrimaryColor, brandPartnerName, brandPartnerEmail } = body

  // Validate hex color if provided
  if (brandPrimaryColor && !/^#[0-9A-Fa-f]{6}$/.test(brandPrimaryColor)) {
    return NextResponse.json({ error: 'brandPrimaryColor must be a 6-digit hex color (e.g. #1D4ED8)' }, { status: 400 })
  }

  const updated = await prisma.organization.update({
    where: { id: ctx.orgId },
    data: {
      brandLogoUrl:      typeof brandLogoUrl      === 'string' ? brandLogoUrl.trim()      || null : undefined,
      brandPrimaryColor: typeof brandPrimaryColor  === 'string' ? brandPrimaryColor.trim() || null : undefined,
      brandPartnerName:  typeof brandPartnerName   === 'string' ? brandPartnerName.trim()  || null : undefined,
      brandPartnerEmail: typeof brandPartnerEmail  === 'string' ? brandPartnerEmail.trim() || null : undefined,
    },
    select: {
      brandLogoUrl: true, brandPrimaryColor: true,
      brandPartnerName: true, brandPartnerEmail: true,
    },
  })

  await prisma.eventLog.create({
    data: { event: 'org.branding_updated', entityId: ctx.orgId, orgId: ctx.orgId, userId: ctx.userId },
  })

  return NextResponse.json({ data: updated })
}
