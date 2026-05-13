import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Module-level start time survives warm lambda restarts
const START = Date.now()

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const dbMs = Date.now() - dbStart
    const version =
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.npm_package_version ??
      'dev'
    return NextResponse.json({
      ok: true,
      db: dbMs,
      version,
      uptime: Math.floor((Date.now() - START) / 1000),
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 503 })
  }
}
