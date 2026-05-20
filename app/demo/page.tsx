'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoPage() {
  const [name, setName] = useState('')
  const [firm, setFirm] = useState('')
  const [email, setEmail] = useState('')
  const [searches, setSearches] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const res = await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, firm, email, searches }),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'Something went wrong. Please email us directly.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">Veltro</Link>
          <nav className="text-sm text-gray-500 space-x-6">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/about" className="hover:text-gray-900">About</Link>
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-16">
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Got it — we'll be in touch.</h1>
            <p className="text-gray-600">
              Expect an email from us within one business day to schedule a 30-minute call.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Request a demo</h1>
              <p className="text-gray-600">
                We'll walk you through the full workflow — target setup, candidate invitation, scored
                report, and the client portal — and talk through whether Veltro fits your process.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firm">
                  Firm name
                </label>
                <input
                  id="firm"
                  type="text"
                  required
                  value={firm}
                  onChange={e => setFirm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Smith Executive Search"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane@smithsearch.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="searches">
                  What searches do you typically run?
                </label>
                <textarea
                  id="searches"
                  rows={3}
                  value={searches}
                  onChange={e => setSearches(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g. CFO, VP Sales, GC — mostly PE-backed growth companies in the $50M–$500M range"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {status === 'submitting' ? 'Sending…' : 'Request demo'}
              </button>
            </form>
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 py-6 px-6 text-center text-sm text-gray-400">
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
      </footer>
    </div>
  )
}
