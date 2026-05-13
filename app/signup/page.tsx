'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PRODUCT_NAME, COMPANY_URL } from '@/lib/brand'

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const inviteToken = params.get('invite') || undefined
  const presetEmail = params.get('email') || ''

  const [email, setEmail] = useState(presetEmail)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [firmName, setFirmName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, firmName: inviteToken ? undefined : firmName, inviteToken }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Could not create account.')
      setLoading(false)
      return
    }

    // Auto sign-in. Falls back to /login if it fails so the user can retry.
    const signin = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (signin?.error) {
      router.push('/login?signupComplete=1')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex' }}>
      {/* Left brand panel */}
      <div className="hidden md:flex" style={{
        width: '50%', background: '#0B0F14', flexDirection: 'column',
        justifyContent: 'space-between', padding: 'clamp(32px, 5vw, 64px)',
      }}>
        <div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 16, maxWidth: 320, lineHeight: 1.7 }}>
            The hiring decision engine. Analyze behavioral signals, benchmark against high-performing archetypes, and generate scored recommendations your clients can act on.
          </p>
        </div>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Based on 2,245,096 validated responses</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{COMPANY_URL}</p>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FFFFFF', padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              {inviteToken ? 'Join your team' : 'Create your firm'}
            </h1>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8 }}>
              {inviteToken
                ? 'Set up your account to join the firm that invited you.'
                : 'You\'ll be the owner. You can invite teammates once signed in.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <Field label="Full name" value={name} onChange={setName} required />
            <Field label="Work email" type="email" value={email} onChange={setEmail} required readOnly={!!presetEmail} />
            <Field label="Password (8+ characters)" type="password" value={password} onChange={setPassword} required />
            {!inviteToken && <Field label="Firm name" value={firmName} onChange={setFirmName} required />}

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 48, background: loading ? '#9CA3AF' : '#111827',
              color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer', marginTop: 8,
            }}>
              {loading ? 'Creating account…' : (inviteToken ? 'Join team' : 'Create account')}
            </button>

            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 24, textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#2563EB', fontWeight: 500 }}>Sign in</Link>
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 16, textAlign: 'center', lineHeight: 1.5 }}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, readOnly = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; readOnly?: boolean
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        required={required}
        style={{
          width: '100%', height: 44, padding: '0 14px',
          border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8,
          fontSize: 14, color: '#111827', outline: 'none',
          background: readOnly ? '#F9FAFB' : '#FFFFFF',
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = '#2563EB' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.14)' }}
      />
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
      <SignupForm />
    </Suspense>
  )
}
