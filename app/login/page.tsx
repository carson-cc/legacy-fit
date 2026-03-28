'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PRODUCT_NAME, COMPANY_URL } from '@/lib/brand'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) setError('Invalid email or password')
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left — dark brand panel */}
      <div className="hidden md:flex" style={{
        width: '50%', background: '#0B0F14', flexDirection: 'column',
        justifyContent: 'space-between', padding: 64,
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

      {/* Right — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FFFFFF', padding: '0 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Sign in</h1>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8 }}>Access the hiring decision engine</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#FEF2F2', color: '#EF4444', padding: '12px 16px',
                borderRadius: 8, fontSize: 14, marginBottom: 24,
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8,
                  fontSize: 14, color: '#111827', outline: 'none',
                  background: '#FFFFFF',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.14)'}
                required
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8,
                  fontSize: 14, color: '#111827', outline: 'none',
                  background: '#FFFFFF',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.14)'}
                required
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 32 }}>
              <a href="#" style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: 48, background: '#111827', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#1F2937' }}
              onMouseLeave={e => (e.target as HTMLElement).style.background = '#111827'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
