'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/app/components/Toast'
import { PRODUCT_NAME } from '@/lib/brand'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InviteResult {
  fitPct: number
  profileName: string
  profileGroup: string
  adaptationStress: number
  rushed: boolean
}

interface Invite {
  id: string
  token: string
  name: string
  email: string | null
  completedAt: string | null
  sentAt: string | null
  result: InviteResult | null
}

interface Target {
  dominance: number
  extraversion: number
  patience: number
  formality: number
  notes: string | null
}

interface Job {
  id: string
  title: string
  roleType: string
  client: { id: string; name: string }
  target: Target | null
  invites: Invite[]
  teamMembers: Invite[]   // team_member invites separated by API
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fitColor(pct: number): string {
  if (pct >= 85) return '#22C55E'
  if (pct >= 70) return '#EAB308'
  return '#EF4444'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const GROUP_LABELS: Record<string, string> = {
  field_command: 'Drivers',
  people_influence: 'Catalysts',
  process_structure: 'Operators',
  strategic_drive: 'Stabilizers',
}

type SortKey = 'fit' | 'name' | 'date'

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ pct }: { pct: number }) {
  const color = fitColor(pct)
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 700, color }}>{pct}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

function Badge({ label, variant }: { label: string; variant: 'amber' | 'red' }) {
  const bg = variant === 'amber' ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)'
  const fg = variant === 'amber' ? '#EAB308' : '#EF4444'
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: fg,
        backgroundColor: bg,
        padding: '2px 8px',
        borderRadius: 9999,
        marginLeft: 8,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Search Icon (inline SVG)                                           */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* Search & sort */
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('fit')

  /* Invite form */
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteType, setInviteType] = useState<'candidate' | 'team_member'>('candidate')
  const [inviteFirstName, setInviteFirstName] = useState('')
  const [inviteLastName, setInviteLastName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRoleTitle, setInviteRoleTitle] = useState('')
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteEmailSent, setInviteEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [resending, setResending] = useState<string | null>(null)

  /* Fetch */
  const fetchJob = useCallback(() => {
    setLoading(true)
    fetch(`/api/jobs/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load job')
        return r.json()
      })
      .then(d => {
        setJob(d.data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [id])

  useEffect(() => { fetchJob() }, [fetchJob])

  useEffect(() => {
    if (job?.title) document.title = `Veltro — ${job.title}`
  }, [job?.title])

  /* Invite handlers */
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    const firstName = inviteFirstName.trim()
    const lastName = inviteLastName.trim()
    const email = inviteEmail.trim()
    if (!firstName || !lastName || !email) return
    setInviteSubmitting(true)
    try {
      const res = await fetch(`/api/jobs/${id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          roleTitle: inviteRoleTitle.trim() || job?.title,
          inviteType,
        }),
      })
      if (!res.ok) throw new Error('Failed to create invite')
      const d = await res.json()
      setInviteLink(`${window.location.origin}/assess/${d.data.token}`)
      setInviteEmailSent(!!d.emailSent)
      setCopied(false)
      showToast(d.emailSent ? 'Evaluation sent' : 'Invite created')
      fetchJob()
    } catch {
      showToast('Could not send evaluation', 'error')
    } finally {
      setInviteSubmitting(false)
    }
  }

  function resetInviteForm() {
    setShowInviteForm(false)
    setInviteType('candidate')
    setInviteFirstName('')
    setInviteLastName('')
    setInviteEmail('')
    setInviteRoleTitle('')
    setInviteLink(null)
    setInviteEmailSent(false)
    setCopied(false)
  }

  async function handleResend(inviteId: string) {
    setResending(inviteId)
    try {
      const res = await fetch(`/api/jobs/${id}/invites/${inviteId}/resend`, { method: 'POST' })
      if (res.ok) {
        showToast('Invite resent')
        fetchJob()
      } else {
        const body = await res.json().catch(() => ({}))
        showToast(body.error || 'Failed to resend')
      }
    } catch {
      showToast('Network error — try again')
    } finally {
      setResending(null)
    }
  }

  function copyLink() {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    showToast('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  /* ---- Derived data ------------------------------------------------ */

  const allCompleted = (job?.invites ?? []).filter(i => i.result !== null)
  const pending = (job?.invites ?? []).filter(i => i.result === null)
  const teamCompleted = (job?.teamMembers ?? []).filter(i => i.result !== null)
  const teamPending = (job?.teamMembers ?? []).filter(i => i.result === null)

  const candidates = allCompleted
    .filter(i => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        i.name.toLowerCase().includes(q) ||
        (i.result?.profileName ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fit':
          return b.result!.fitPct - a.result!.fitPct
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return (
            new Date(b.completedAt ?? 0).getTime() -
            new Date(a.completedAt ?? 0).getTime()
          )
      }
    })

  /* ------------------------------------------------------------------ */
  /*  Shared styles                                                      */
  /* ------------------------------------------------------------------ */

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }

  const inputStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#111827',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '8px 12px',
    outline: 'none',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
    width: '100%',
    background: '#FFFFFF',
  }

  const secondaryBtnStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 180ms ease',
    whiteSpace: 'nowrap',
  }

  const primaryBtnStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: '#FFFFFF',
    background: '#2563EB',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 180ms ease',
    whiteSpace: 'nowrap',
  }

  /* ------------------------------------------------------------------ */
  /*  Loading & Error states                                             */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div style={{ padding: '48px 48px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ height: 12, width: 80, borderRadius: 4, background: '#F3F4F6', marginBottom: 32, animation: 'shimmer 1.4s ease infinite' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ height: 28, width: 240, borderRadius: 6, background: '#F3F4F6', marginBottom: 8, animation: 'shimmer 1.4s ease infinite' }} />
            <div style={{ height: 14, width: 160, borderRadius: 4, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.1s' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ height: 36, width: 100, borderRadius: 8, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.15s' }} />
            <div style={{ height: 36, width: 80, borderRadius: 8, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.2s' }} />
          </div>
        </div>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 72, borderRadius: 8, background: '#F3F4F6', marginBottom: 8, animation: 'shimmer 1.4s ease infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
        <style>{`@keyframes shimmer { 0%,100%{opacity:1}50%{opacity:0.5} }`}</style>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div style={{ padding: '64px 48px', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>Unable to load this role</p>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>{error ?? 'Role not found'}</p>
        <Link href="/dashboard" style={{ fontSize: 14, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
          Back to Hiring Overview
        </Link>
      </div>
    )
  }

  /* ------------------------------------------------------------------ */
  /*  Main Render                                                        */
  /* ------------------------------------------------------------------ */

  return (
    <div style={{ padding: '32px 48px', maxWidth: 960, margin: '0 auto' }}>

      {/* ---- Back link ---- */}
      <Link
        href="/dashboard"
        style={{
          fontSize: 12,
          color: '#9CA3AF',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 24,
          transition: 'color 180ms ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#6B7280')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
      >
        &larr; Hiring Overview
      </Link>

      {/* ---- Header ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
            {job.title}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            {job.client.name} &middot;{' '}
            {job.roleType.charAt(0).toUpperCase() + job.roleType.slice(1)}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href={`/dashboard/jobs/${job.id}/target`}
            style={{ ...secondaryBtnStyle, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
          >
            {job.target ? 'Edit Target' : 'Set Target'}
          </Link>
          <button
            onClick={() => {
              resetInviteForm()
              setInviteRoleTitle(job?.title ?? '')
              setShowInviteForm(true)
            }}
            style={primaryBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            + Invite
          </button>
        </div>
      </div>

      {/* ---- Invite Form (slides down) ---- */}
      {showInviteForm && (
        <div
          style={{
            ...cardStyle,
            marginBottom: 32,
            animation: 'slideDown 180ms ease',
          }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {(['candidate', 'team_member'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setInviteType(t)}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: inviteType === t ? 'none' : '1px solid #E5E7EB',
                    background: inviteType === t ? '#111827' : 'transparent',
                    color: inviteType === t ? '#FFFFFF' : '#6B7280',
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                  }}
                >
                  {t === 'candidate' ? 'Candidate' : 'Team Member'}
                </button>
              ))}
            </div>
            <button
              onClick={resetInviteForm}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                color: '#9CA3AF',
                cursor: 'pointer',
                transition: 'color 180ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6B7280')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
            >
              Cancel
            </button>
          </div>

          {inviteLink ? (
            <div>
              {/* Success header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5l2.5 2.5L10 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  {inviteEmailSent ? (
                    <>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
                        {inviteType === 'team_member' ? 'Team member invite' : 'Evaluation'} sent to {inviteEmail}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                        {inviteFirstName} {inviteLastName} will receive the invite email shortly
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
                        {inviteType === 'team_member' ? 'Team member invite' : 'Invite'} created for {inviteFirstName} {inviteLastName}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>Share the link below</p>
                    </>
                  )}
                </div>
              </div>

              {/* Link row */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
                  {inviteEmailSent ? 'Or copy link manually' : 'Assessment link'}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    onFocus={e => e.target.select()}
                    style={{
                      ...inputStyle, flex: 1,
                      fontFamily: 'ui-monospace, monospace', fontSize: 12,
                      color: '#374151', background: '#F9FAFB',
                    }}
                  />
                  <button
                    onClick={copyLink}
                    style={{ ...primaryBtnStyle, flexShrink: 0, height: 38 }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setInviteFirstName('')
                  setInviteLastName('')
                  setInviteEmail('')
                  setInviteRoleTitle('')
                  setInviteLink(null)
                  setInviteEmailSent(false)
                  setCopied(false)
                }}
                style={{
                  background: 'none', border: 'none', fontSize: 12,
                  color: '#9CA3AF', cursor: 'pointer', marginTop: 12,
                  textDecoration: 'underline', transition: 'color 180ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                + Send to another candidate
              </button>
            </div>
          ) : (
            <form onSubmit={handleInvite}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                    First name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First"
                    value={inviteFirstName}
                    onChange={e => setInviteFirstName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                    Last name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last"
                    value={inviteLastName}
                    onChange={e => setInviteLastName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                  Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="candidate@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                  Role
                </label>
                <input
                  type="text"
                  placeholder={job?.title ?? 'Role title'}
                  value={inviteRoleTitle}
                  onChange={e => setInviteRoleTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={inviteSubmitting}
                style={{
                  ...primaryBtnStyle,
                  opacity: inviteSubmitting ? 0.5 : 1,
                  pointerEvents: inviteSubmitting ? 'none' : 'auto',
                }}
                onMouseEnter={e => {
                  if (!inviteSubmitting) e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'
                }}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {inviteSubmitting ? 'Sending...' : inviteType === 'team_member' ? 'Send team invite' : 'Send evaluation'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ---- Empty State ---- */}
      {allCompleted.length === 0 && pending.length === 0 && teamCompleted.length === 0 && teamPending.length === 0 && !showInviteForm && (
        <div
          style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '64px 24px',
          }}
        >
          <p style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
            No candidates yet
          </p>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>
            Invite your first candidate to get started.
          </p>
          <button
            onClick={() => {
              resetInviteForm()
              setInviteRoleTitle(job?.title ?? '')
              setShowInviteForm(true)
            }}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#FFFFFF',
              background: '#2563EB',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              cursor: 'pointer',
              transition: 'box-shadow 180ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            + Invite your first candidate
          </button>
        </div>
      )}

      {/* ---- Candidates Section ---- */}
      {allCompleted.length > 0 && (
        <div style={{ marginBottom: 48 }}>

          {/* Section header + controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Candidates ({candidates.length})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                  }}
                >
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: 180,
                    paddingLeft: 32,
                  }}
                />
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortKey)}
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  padding: '8px 12px',
                  outline: 'none',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'border-color 180ms ease',
                }}
              >
                <option value="fit">Fit &darr;</option>
                <option value="name">Name A-Z</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>

          {/* Candidate cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {candidates.map(invite => {
              const r = invite.result!
              const groupLabel = GROUP_LABELS[r.profileGroup] ?? r.profileGroup

              return (
                <Link
                  key={invite.id}
                  href={`/dashboard/candidates/${invite.id}`}
                  style={{
                    ...cardStyle,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    transition: 'all 180ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Score ring */}
                  <ScoreRing pct={r.fitPct} />

                  {/* Middle: name, profile, badges */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                        {invite.name}
                      </span>
                      {r.adaptationStress > 0.2 && (
                        <Badge label="Adapting" variant="amber" />
                      )}
                      {r.rushed && <Badge label="Rushed" variant="red" />}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: '#6B7280',
                        margin: '2px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.profileName} &middot; {groupLabel}
                    </p>
                  </div>

                  {/* Right: date + arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {invite.completedAt ? formatDate(invite.completedAt) : ''}
                    </span>
                    <span style={{ fontSize: 14, color: '#9CA3AF' }}>&rarr;</span>
                  </div>
                </Link>
              )
            })}

            {candidates.length === 0 && search && (
              <p style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', padding: 24 }}>
                No candidates match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---- Pending Section ---- */}
      {pending.length > 0 && (
        <div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Pending ({pending.length})
          </span>

          <div>
            {pending.map(invite => (
              <div
                key={invite.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
                    {invite.name}
                  </span>
                  {invite.sentAt && (
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      &middot; Sent {formatDate(invite.sentAt)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleResend(invite.id)}
                  disabled={resending === invite.id}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: resending === invite.id ? '#9CA3AF' : '#2563EB',
                    cursor: resending === invite.id ? 'default' : 'pointer',
                    textDecoration: 'underline',
                    transition: 'color 180ms ease',
                  }}
                  onMouseEnter={e => { if (resending !== invite.id) e.currentTarget.style.color = '#1D4ED8' }}
                  onMouseLeave={e => { if (resending !== invite.id) e.currentTarget.style.color = '#2563EB' }}
                >
                  {resending === invite.id ? 'Sending…' : 'Resend'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Team Members Section ---- */}
      {(teamCompleted.length > 0 || teamPending.length > 0) && (
        <div style={{ marginTop: 40 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            paddingTop: 32, borderTop: '1px solid #F3F4F6',
          }}>
            <span style={{
              fontSize: 12, fontWeight: 600, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Team Profiles ({teamCompleted.length + teamPending.length})
            </span>
            <span style={{
              fontSize: 11, color: '#9CA3AF', background: '#F9FAFB',
              border: '1px solid #E5E7EB', borderRadius: 4, padding: '2px 7px',
            }}>
              For team fit analysis
            </span>
          </div>

          {teamCompleted.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {teamCompleted.map(invite => {
                const r = invite.result!
                const groupLabel = GROUP_LABELS[r.profileGroup] ?? r.profileGroup
                return (
                  <Link
                    key={invite.id}
                    href={`/dashboard/candidates/${invite.id}`}
                    style={{
                      ...cardStyle,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'all 180ms ease',
                      borderLeft: '3px solid #E5E7EB',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Profile badge */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: '#F3F4F6', border: '1px solid #E5E7EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                        {invite.name}
                      </span>
                      <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>
                        {r.profileName} · {groupLabel}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {invite.completedAt ? formatDate(invite.completedAt) : ''}
                      </span>
                      <span style={{ fontSize: 14, color: '#9CA3AF' }}>&rarr;</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {teamPending.length > 0 && (
            <div>
              {teamPending.map(invite => (
                <div
                  key={invite.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
                      {invite.name}
                    </span>
                    <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 4, padding: '1px 6px' }}>
                      pending
                    </span>
                    {invite.sentAt && (
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                        · Sent {formatDate(invite.sentAt)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleResend(invite.id)}
                    disabled={resending === invite.id}
                    style={{
                      background: 'none', border: 'none', fontSize: 12,
                      color: resending === invite.id ? '#9CA3AF' : '#2563EB',
                      cursor: resending === invite.id ? 'default' : 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {resending === invite.id ? 'Sending…' : 'Resend'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
