'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRODUCT_NAME } from '@/lib/brand'

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords don\'t match.'); return }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Could not reset password.')
      return
    }
    setDone(true)
    setTimeout(() => router.push('/login'), 1500)
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginTop: 32, letterSpacing: '-0.02em' }}>Choose a new password</h1>

        {done ? (
          <p style={{ fontSize: 14, color: '#047857', marginTop: 16 }}>Password updated. Redirecting to sign in…</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            {error && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>}

            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>New password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', height: 48, padding: '0 16px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none' }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Confirm password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ width: '100%', height: 48, padding: '0 16px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none' }} />

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 48, background: '#111827', color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}

        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 32, textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#2563EB' }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
