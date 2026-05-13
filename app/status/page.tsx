import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Veltro Status' }

async function getHealth() {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, dbMs: Date.now() - start, error: null }
  } catch (err) {
    return { ok: false, dbMs: null, error: String(err) }
  }
}

export default async function StatusPage() {
  const { ok, dbMs } = await getHealth()
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.npm_package_version ??
    'dev'

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">System Status</h1>

        <div className="flex items-center gap-3 mb-6">
          <span
            className={`inline-block w-3 h-3 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-base font-medium text-gray-800">
            {ok ? 'All systems operational' : 'Service degraded'}
          </span>
        </div>

        <dl className="space-y-3 text-sm text-gray-500">
          <div className="flex justify-between">
            <dt>Database</dt>
            <dd className="font-mono">{ok ? `${dbMs} ms` : 'unreachable'}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Version</dt>
            <dd className="font-mono">{version}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Checked at</dt>
            <dd className="font-mono tabular-nums">{new Date().toISOString()}</dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
