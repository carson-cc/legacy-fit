'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PRODUCT_NAME } from '@/lib/brand'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginTop: 32, letterSpacing: '-0.02em' }}>Reset your password</h1>

        {submitted ? (
          <p style={{ fontSize: 14, color: '#374151', marginTop: 16, lineHeight: 1.7 }}>
            If an account exists for <strong>{email}</strong>, you&rsquo;ll receive a reset link within a few minutes. Check your spam folder if you don&rsquo;t see it.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
              Enter your work email. We&rsquo;ll send a one-hour reset link.
            </p>
            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@firm.com"
                required
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8,
                  fontSize: 14, color: '#111827', outline: 'none', marginBottom: 16,
                }}
              />
              <button type="submit" disabled={loading} style={{
                width: '100%', height: 48, background: '#111827', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 32, textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#2563EB' }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
