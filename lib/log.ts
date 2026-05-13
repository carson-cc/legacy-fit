import * as Sentry from '@sentry/nextjs'

interface LogMeta {
  route?: string
  orgId?: string
  userId?: string
  event?: string
}

export function logError(err: unknown, meta: LogMeta = {}) {
  Sentry.captureException(err)
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      error: err instanceof Error ? err.message : String(err),
      ...meta,
    }),
  )
}

export function logWarn(message: string, meta: LogMeta = {}) {
  console.warn(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      message,
      ...meta,
    }),
  )
}
