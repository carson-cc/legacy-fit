'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">An error occurred</h2>
        <p className="text-gray-500 text-sm mb-6">
          We were unable to load this page. Please contact your search firm for assistance.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
