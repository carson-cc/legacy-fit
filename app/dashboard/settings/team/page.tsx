'use client'

import { useEffect, useState, useCallback } from 'react'

type Member = { id: string; email: string; name: string | null; role: string; createdAt: string; emailVerifiedAt: string | null }
type Invite = { id: string; email: string; role: string; createdAt: string; expiresAt: string }

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string>('member')
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/team')
    if (res.ok) {
      const body = await res.json()
      setMembers(body.data.members || [])
      setInvites(body.data.invites || [])
      setCurrentUserRole(body.data.currentUserRole || 'member')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Veltro — Team'
    refresh()
  }, [refresh])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    setBusy(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Could not send invite')
      return
    }
    setInviteEmail('')
    refresh()
  }

  async function revoke(id: string) {
    if (!confirm('Revoke this invite?')) return
    await fetch(`/api/team/invite/${id}/revoke`, { method: 'POST' })
    refresh()
  }

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>Team</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Manage who at your firm can access Veltro.</p>

      {canManage && (
        <section style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Invite teammate</h2>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input
                type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@firm.com"
                style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'member')}
                style={{ height: 40, padding: '0 12px', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={busy} style={{
              height: 40, padding: '0 18px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1,
            }}>{busy ? 'Sending…' : 'Send invite'}</button>
          </form>
          {error && <p style={{ marginTop: 12, color: '#EF4444', fontSize: 13 }}>{error}</p>}
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Members ({members.length})</h2>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? <Row><span style={{ color: '#9CA3AF' }}>Loading…</span></Row> : members.map((m) => (
            <Row key={m.id}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{m.name || m.email}</p>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{m.email}</p>
              </div>
              <RolePill role={m.role} />
            </Row>
          ))}
        </div>
      </section>

      {invites.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Pending invites ({invites.length})</h2>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
            {invites.map(inv => (
              <Row key={inv.id}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{inv.email}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    Sent {new Date(inv.createdAt).toLocaleDateString()} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <RolePill role={inv.role} />
                {canManage && (
                  <button onClick={() => revoke(inv.id)} style={{
                    fontSize: 12, color: '#6B7280', background: 'transparent', border: '1px solid #E5E7EB',
                    borderRadius: 6, padding: '6px 10px', cursor: 'pointer', marginLeft: 12,
                  }}>Revoke</button>
                )}
              </Row>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #F3F4F6' }}>{children}</div>
}

function RolePill({ role }: { role: string }) {
  const color = role === 'owner' ? '#7C3AED' : role === 'admin' ? '#2563EB' : '#6B7280'
  const bg    = role === 'owner' ? '#F5F3FF' : role === 'admin' ? '#EFF6FF' : '#F3F4F6'
  return <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</span>
}
