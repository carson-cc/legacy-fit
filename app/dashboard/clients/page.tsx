'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CompletedHM {
  id: string
  name: string
  profileType: string
}

interface ClientSummary {
  id: string
  name: string
  industry: string | null
  completedHMs: CompletedHM[]
  pendingHMs: number
  activeJobs: number
}

function HMStatusPill({ completedHMs, pendingHMs }: { completedHMs: CompletedHM[]; pendingHMs: number }) {
  if (completedHMs.length > 0) {
    const label = completedHMs[0].profileType || completedHMs[0].name
    const extra = completedHMs.length > 1 ? ` +${completedHMs.length - 1}` : ''
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 6,
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        fontSize: 12, fontWeight: 500, color: '#15803d', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
        {label}{extra}
      </span>
    )
  }
  if (pendingHMs > 0) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 6,
        background: '#fffbeb', border: '1px solid #fde68a',
        fontSize: 12, fontWeight: 500, color: '#b45309', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
        Awaiting{pendingHMs > 1 ? ` ×${pendingHMs}` : ''}
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 6,
      background: '#f9fafb', border: '1px solid #e5e7eb',
      fontSize: 12, fontWeight: 400, color: '#9ca3af', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'transparent', border: '1.5px solid #d1d5db', flexShrink: 0 }} />
      No profile
    </span>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => {
        setClients(d.data || [])
        setLoading(false)
        document.title = 'Veltro — Clients'
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), industry: industry.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else if (data.data) {
        setClients(prev => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)))
        setName('')
        setIndustry('')
        setShowForm(false)
      }
    } catch {
      setError('Network error — please try again')
    }
    setSaving(false)
  }

  const profileCount = clients.filter(c => c.completedHMs.length > 0).length

  return (
    <div style={{ padding: '32px 32px', maxWidth: 820 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
            Clients
          </h1>
          {!loading && clients.length > 0 && (
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#9ca3af' }}>
              {clients.length} {clients.length === 1 ? 'client' : 'clients'}
              {profileCount > 0 && (
                <> &middot; <span style={{ color: '#15803d' }}>{profileCount} with active {profileCount === 1 ? 'profile' : 'profiles'}</span></>
              )}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer',
            padding: '0 14px', height: 34, borderRadius: 7, fontSize: 13, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
            transition: 'background 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1f1f1f' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0a0a0a' }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
          New Client
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10,
            padding: '18px 20px', marginBottom: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Acme Corp"
                autoFocus
                required
                style={{
                  width: '100%', padding: '7px 10px', border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 7, fontSize: 14, color: '#0a0a0a', outline: 'none', boxSizing: 'border-box',
                  background: '#fff',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                Industry <span style={{ color: '#d1d5db', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span>
              </label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="Technology"
                style={{
                  width: '100%', padding: '7px 10px', border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 7, fontSize: 14, color: '#0a0a0a', outline: 'none', boxSizing: 'border-box',
                  background: '#fff',
                }}
              />
            </div>
          </div>
          {error && (
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#dc2626' }}>{error}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#0a0a0a', color: '#fff', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                padding: '0 14px', height: 32, borderRadius: 6,
                fontSize: 13, fontWeight: 500, opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Adding…' : 'Add Client'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setName(''); setIndustry(''); setError('') }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#9ca3af', padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6b7280' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Loading…</p>
      )}

      {/* Empty state */}
      {!loading && clients.length === 0 && !showForm && (
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10,
          padding: '48px 32px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            No clients yet. Add one to get started.
          </p>
        </div>
      )}

      {/* Client list */}
      {!loading && clients.length > 0 && (
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10,
          overflow: 'hidden',
        }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 80px 24px',
            padding: '9px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            gap: 12,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Client</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>HM Profile</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Roles</span>
            <span />
          </div>

          {clients.map((c, i) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}/hiring-manager`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 80px 24px',
                alignItems: 'center',
                padding: '13px 20px',
                borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                textDecoration: 'none',
                gap: 12,
                transition: 'background 100ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fafafa' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* Company */}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0a0a0a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </p>
                {c.industry && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.industry}
                  </p>
                )}
              </div>

              {/* HM profile status — the key signal */}
              <div>
                <HMStatusPill completedHMs={c.completedHMs} pendingHMs={c.pendingHMs} />
              </div>

              {/* Active roles */}
              <div style={{ textAlign: 'right' }}>
                {c.activeJobs > 0 ? (
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                    {c.activeJobs}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: '#e5e7eb' }}>—</span>
                )}
              </div>

              {/* Arrow */}
              <div style={{ color: '#d1d5db', fontSize: 13, textAlign: 'right' }}>→</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
