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
  stage: string
  offLimits: boolean
  result: InviteResult | null
  approvedForClient: boolean
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

function stageColor(stage: string): { bg: string; fg: string } {
  switch (stage) {
    case 'shortlist':    return { bg: 'rgba(217,119,6,0.1)',   fg: '#D97706' }
    case 'client_ready': return { bg: 'rgba(5,150,105,0.1)',   fg: '#059669' }
    case 'rejected':     return { bg: 'rgba(220,38,38,0.1)',   fg: '#DC2626' }
    default:             return { bg: 'rgba(37,99,235,0.1)',    fg: '#2563EB' }
  }
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

const STAGE_LABELS: Record<string, string> = {
  longlist: 'Longlist',
  shortlist: 'Shortlist',
  client_ready: 'Client Ready',
  rejected: 'Rejected',
}

const STAGES = ['longlist', 'shortlist', 'client_ready', 'rejected'] as const

type SortKey = 'fit' | 'name' | 'date'

interface ClientContact {
  id:           string
  name:         string
  email:        string
  expiresAt:    string
  lastAccessAt: string | null
  createdAt:    string
}

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

function Badge({ label, variant }: { label: string; variant: 'amber' | 'red' | 'green' }) {
  const bg = variant === 'amber' ? 'rgba(234,179,8,0.12)' : variant === 'green' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'
  const fg = variant === 'amber' ? '#EAB308' : variant === 'green' ? '#22C55E' : '#EF4444'
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

  /* Search, sort & stage filter */
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('fit')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [stageDropdown, setStageDropdown] = useState<string | null>(null)

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

  /* Client portal */
  const [contacts, setContacts]           = useState<ClientContact[]>([])
  const [portalName, setPortalName]       = useState('')
  const [portalEmail, setPortalEmail]     = useState('')
  const [portalSubmitting, setPortalSubmitting] = useState(false)
  const [revoking, setRevoking]           = useState<string | null>(null)

  /* Bulk import */
  const [showBulk, setShowBulk]           = useState(false)
  const [bulkRows, setBulkRows]           = useState<{name:string;email:string;phone?:string}[]>([])
  const [bulkCommitting, setBulkCommitting] = useState(false)
  const [bulkResults, setBulkResults]     = useState<{row:number;name:string;email:string;status:string;error?:string}[]|null>(null)

  /* Pipeline view */
  const [view, setView] = useState<'list' | 'pipeline'>('list')
  const [moveMenu, setMoveMenu] = useState<string | null>(null)
  const [movingStage, setMovingStage] = useState<string | null>(null)

  /* Close move menu / stage dropdown on outside click */
  useEffect(() => {
    if (!moveMenu && !stageDropdown) return
    const close = () => { setMoveMenu(null); setStageDropdown(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [moveMenu, stageDropdown])

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

  const fetchContacts = useCallback(() => {
    fetch(`/api/jobs/${id}/client-contacts`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setContacts(d.data) })
      .catch(() => {})
  }, [id])

  useEffect(() => { fetchContacts() }, [fetchContacts])

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

  async function handlePortalInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!portalName.trim() || !portalEmail.trim()) return
    setPortalSubmitting(true)
    try {
      const res = await fetch(`/api/jobs/${id}/client-contacts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: portalName.trim(), email: portalEmail.trim() }),
      })
      if (res.status === 207) showToast('Contact added — email delivery failed', 'error')
      else if (!res.ok) showToast('Could not send portal link', 'error')
      else showToast('Portal link sent')
      setPortalName('')
      setPortalEmail('')
      fetchContacts()
    } catch {
      showToast('Network error', 'error')
    } finally {
      setPortalSubmitting(false)
    }
  }

  async function revokeContact(contactId: string) {
    setRevoking(contactId)
    try {
      const res = await fetch(`/api/jobs/${id}/client-contacts/${contactId}`, { method: 'DELETE' })
      if (res.ok) { showToast('Access revoked'); fetchContacts() }
      else showToast('Could not revoke', 'error')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setRevoking(null)
    }
  }

  async function handleMoveStage(inviteId: string, stage: string) {
    setMovingStage(inviteId)
    setMoveMenu(null)
    try {
      const res = await fetch(`/api/candidates/${inviteId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      })
      if (res.ok) {
        showToast(`Moved to ${STAGE_LABELS[stage]}`)
        fetchJob()
      } else {
        showToast('Failed to move candidate', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setMovingStage(null)
    }
  }

  function copyLink() {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    showToast('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCSVDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => parseCSVPreview(ev.target?.result as string)
    reader.readAsText(file)
  }

  function handleCSVInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => parseCSVPreview(ev.target?.result as string)
    reader.readAsText(file)
  }

  function parseCSVPreview(text: string) {
    const lines = text.trim().split(/\r?\n/)
    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const nameIdx = header.indexOf('name')
    const emailIdx = header.indexOf('email')
    const phoneIdx = header.indexOf('phone')
    if (nameIdx === -1 || emailIdx === -1) { showToast('CSV must have "name" and "email" columns', 'error'); return }
    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      return { name: cols[nameIdx] ?? '', email: cols[emailIdx] ?? '', phone: phoneIdx >= 0 ? (cols[phoneIdx] || undefined) : undefined }
    }).filter(r => r.name || r.email)
    setBulkRows(rows)
    setBulkResults(null)
  }

  async function commitBulk() {
    if (!bulkRows.length) return
    setBulkCommitting(true)
    try {
      const res = await fetch(`/api/jobs/${id}/invites/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkRows),
      })
      const data = await res.json()
      setBulkResults(data.results ?? [])
      if (data.created > 0) { showToast(`${data.created} candidate${data.created > 1 ? 's' : ''} added`); fetchJob() }
      if (data.failed > 0) showToast(`${data.failed} row${data.failed > 1 ? 's' : ''} failed`, 'error')
    } catch {
      showToast('Bulk import failed', 'error')
    } finally {
      setBulkCommitting(false)
    }
  }

  /* ---- Derived data ------------------------------------------------ */

  const allCompleted = (job?.invites ?? []).filter(i => i.result !== null)
  const pending = (job?.invites ?? []).filter(i => i.result === null)
  const teamCompleted = (job?.teamMembers ?? []).filter(i => i.result !== null)
  const teamPending = (job?.teamMembers ?? []).filter(i => i.result === null)

  const candidates = allCompleted
    .filter(i => {
      if (stageFilter !== 'all' && (i.stage || 'longlist') !== stageFilter) return false
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
          return (b.result?.fitPct ?? -1) - (a.result?.fitPct ?? -1)
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
    <div style={{ padding: '32px 48px', maxWidth: view === 'pipeline' ? 'none' : 960, margin: view === 'pipeline' ? 0 : '0 auto' }}>

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
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            {(['list', 'pipeline'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '7px 14px',
                  border: 'none',
                  background: view === v ? '#111827' : '#FFFFFF',
                  color: view === v ? '#FFFFFF' : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {v === 'list' ? 'List' : 'Pipeline'}
              </button>
            ))}
          </div>

          <Link
            href={`/dashboard/jobs/${job.id}/target`}
            style={{ ...secondaryBtnStyle, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
          >
            {job.target ? 'Edit Target' : 'Set Target'}
          </Link>
          <button
            onClick={() => { setShowBulk(v => !v); setBulkRows([]); setBulkResults(null) }}
            style={secondaryBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
          >
            Bulk import
          </button>
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

      {/* ---- Bulk Import Panel ---- */}
      {showBulk && (
        <div style={{ ...cardStyle, marginBottom: 24, animation: 'slideDown 180ms ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Bulk import candidates</span>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>CSV must have &ldquo;name&rdquo; and &ldquo;email&rdquo; columns. &ldquo;phone&rdquo; is optional.</p>
            </div>
            <button onClick={() => { setShowBulk(false); setBulkRows([]); setBulkResults(null) }} style={{ background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>Cancel</button>
          </div>

          {!bulkResults && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleCSVDrop}
                style={{ border: '2px dashed #E5E7EB', borderRadius: 10, padding: '32px 24px', textAlign: 'center', marginBottom: 16, transition: 'border-color 150ms ease', cursor: 'pointer' }}
                onDragEnter={e => (e.currentTarget.style.borderColor = '#2563EB')}
                onDragLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
              >
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px' }}>Drop a CSV file here, or</p>
                <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                  <span style={{ ...secondaryBtnStyle, display: 'inline-block' }}>Browse file</span>
                  <input type="file" accept=".csv,text/csv" onChange={handleCSVInput} style={{ display: 'none' }}/>
                </label>
              </div>

              {/* Preview table */}
              {bulkRows.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{bulkRows.length} rows ready to import. Emails will be sent automatically.</p>
                  <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                          {['#', 'Name', 'Email', 'Phone'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6B7280' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRows.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '8px 12px', color: '#9CA3AF' }}>{i + 1}</td>
                            <td style={{ padding: '8px 12px', color: '#111827' }}>{row.name}</td>
                            <td style={{ padding: '8px 12px', color: '#6B7280' }}>{row.email}</td>
                            <td style={{ padding: '8px 12px', color: '#6B7280' }}>{row.phone ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={commitBulk}
                    disabled={bulkCommitting}
                    style={{ ...primaryBtnStyle, opacity: bulkCommitting ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!bulkCommitting) e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)' }}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    {bulkCommitting ? 'Importing…' : `Import ${bulkRows.length} candidate${bulkRows.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Results */}
          {bulkResults && (
            <div>
              <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      {['#', 'Name', 'Email', 'Status'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6B7280' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map(row => (
                      <tr key={row.row} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '8px 12px', color: '#9CA3AF' }}>{row.row}</td>
                        <td style={{ padding: '8px 12px', color: '#111827' }}>{row.name}</td>
                        <td style={{ padding: '8px 12px', color: '#6B7280' }}>{row.email}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {row.status === 'created'
                            ? <span style={{ color: '#059669', fontWeight: 600 }}>✓ Created</span>
                            : <span style={{ color: '#DC2626' }}>{row.error ?? 'Error'}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => { setBulkRows([]); setBulkResults(null) }} style={secondaryBtnStyle}>Import more</button>
            </div>
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

      {/* ---- Pipeline View ---- */}
      {view === 'pipeline' && allCompleted.length > 0 && (
        <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', gap: 16, minWidth: 960 }}>
            {STAGES.map(stage => {
              const stageCandidates = allCompleted.filter(i => (i.stage || 'longlist') === stage)
              return (
                <div key={stage}>
                  {/* Column header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                    padding: '10px 14px',
                    background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{STAGE_LABELS[stage]}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                      background: '#E5E7EB', borderRadius: 99, padding: '1px 7px',
                    }}>
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stageCandidates.map(invite => {
                      const r = invite.result!
                      const groupLabel = GROUP_LABELS[r.profileGroup] ?? r.profileGroup
                      const isMoving = movingStage === invite.id

                      return (
                        <div
                          key={invite.id}
                          style={{
                            background: invite.offLimits ? 'rgba(239,68,68,0.04)' : '#FFFFFF',
                            border: `1px solid ${invite.offLimits ? 'rgba(239,68,68,0.2)' : '#E5E7EB'}`,
                            borderRadius: 8,
                            padding: '12px 14px',
                            opacity: isMoving ? 0.5 : 1,
                            transition: 'opacity 180ms ease',
                            position: 'relative',
                          }}
                        >
                          {/* Top row: name + badges */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Link
                                href={`/dashboard/candidates/${invite.id}`}
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: '#111827',
                                  textDecoration: invite.offLimits ? 'line-through' : 'none',
                                  textDecorationColor: '#EF4444',
                                }}
                              >
                                {invite.name}
                              </Link>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              {invite.offLimits && <Badge label="Off-limits" variant="red" />}
                              {invite.approvedForClient && <Badge label="Approved" variant="green" />}
                            </div>
                          </div>

                          {/* Profile + fit */}
                          <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px' }}>
                            {r.profileName} · {groupLabel}
                            <span style={{
                              marginLeft: 6,
                              fontWeight: 600,
                              color: fitColor(r.fitPct),
                            }}>
                              {r.fitPct}%
                            </span>
                          </p>

                          {/* Move button */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => setMoveMenu(moveMenu === invite.id ? null : invite.id)}
                              disabled={isMoving}
                              style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: '#6B7280',
                                background: 'none',
                                border: '1px solid #E5E7EB',
                                borderRadius: 6,
                                padding: '3px 10px',
                                cursor: isMoving ? 'default' : 'pointer',
                                transition: 'all 150ms ease',
                              }}
                              onMouseEnter={e => { if (!isMoving) { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = '#374151' } }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                            >
                              {isMoving ? 'Moving…' : 'Move →'}
                            </button>

                            {moveMenu === invite.id && (
                              <div
                                style={{
                                  position: 'absolute', left: 0, top: '100%', marginTop: 4,
                                  zIndex: 20, background: '#FFFFFF',
                                  border: '1px solid #E5E7EB', borderRadius: 8,
                                  padding: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                  minWidth: 140,
                                }}
                              >
                                {STAGES.filter(s => s !== stage).map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleMoveStage(invite.id, s)}
                                    style={{
                                      display: 'block', width: '100%', textAlign: 'left',
                                      fontSize: 13, padding: '7px 12px', border: 'none',
                                      background: 'none', cursor: 'pointer', borderRadius: 6,
                                      color: '#374151', transition: 'background 120ms ease',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                  >
                                    {STAGE_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {stageCandidates.length === 0 && (
                      <div style={{
                        border: '1px dashed #E5E7EB', borderRadius: 8,
                        padding: '20px 14px', textAlign: 'center',
                        color: '#D1D5DB', fontSize: 12,
                      }}>
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ---- Candidates Section ---- */}
      {view === 'list' && allCompleted.length > 0 && (
        <div style={{ marginBottom: 48 }}>

          {/* Stage filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
            {([
              { key: 'all', label: 'All' },
              { key: 'longlist', label: 'Longlist' },
              { key: 'shortlist', label: 'Shortlist' },
              { key: 'client_ready', label: 'Client Ready' },
              { key: 'rejected', label: 'Rejected' },
            ] as const).map(({ key, label }) => {
              const count = key === 'all'
                ? allCompleted.length
                : allCompleted.filter(i => (i.stage || 'longlist') === key).length
              const active = stageFilter === key
              const sc = key !== 'all' ? stageColor(key) : null
              return (
                <button
                  key={key}
                  onClick={() => setStageFilter(key)}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: active
                      ? `1px solid ${sc?.fg ?? '#111827'}`
                      : '1px solid #E5E7EB',
                    background: active
                      ? (sc?.bg ?? '#111827')
                      : '#FFFFFF',
                    color: active
                      ? (sc?.fg ?? '#111827')
                      : '#6B7280',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {label}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: active ? 'rgba(0,0,0,0.1)' : '#F3F4F6',
                    color: active ? (sc?.fg ?? '#111827') : '#9CA3AF',
                    borderRadius: 99,
                    padding: '0px 5px',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

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
              {stageFilter === 'all' ? `Candidates (${candidates.length})` : `${STAGE_LABELS[stageFilter]} (${candidates.length})`}
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
                      <span style={{ fontSize: 16, fontWeight: 600, color: invite.offLimits ? '#9CA3AF' : '#111827', textDecoration: invite.offLimits ? 'line-through' : 'none', textDecorationColor: '#EF4444' }}>
                        {invite.name}
                      </span>
                      {invite.offLimits && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 9999, padding: '1px 7px', marginLeft: 8, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                          OFF-LIMITS
                        </span>
                      )}
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

                  {/* Right: stage pill + date + arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    {/* Stage pill — stops navigation, opens dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          setStageDropdown(stageDropdown === invite.id ? null : invite.id)
                        }}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 99,
                          border: `1px solid ${stageColor(invite.stage || 'longlist').fg}`,
                          background: stageColor(invite.stage || 'longlist').bg,
                          color: stageColor(invite.stage || 'longlist').fg,
                          cursor: 'pointer',
                          transition: 'opacity 150ms ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        {STAGE_LABELS[invite.stage || 'longlist']} ▾
                      </button>

                      {stageDropdown === invite.id && (
                        <div
                          style={{
                            position: 'absolute', right: 0, top: '100%', marginTop: 4,
                            zIndex: 30, background: '#FFFFFF',
                            border: '1px solid #E5E7EB', borderRadius: 8,
                            padding: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            minWidth: 140,
                          }}
                          onClick={e => { e.preventDefault(); e.stopPropagation() }}
                        >
                          {STAGES.filter(s => s !== (invite.stage || 'longlist')).map(s => {
                            const sc = stageColor(s)
                            return (
                              <button
                                key={s}
                                onClick={async e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setStageDropdown(null)
                                  await handleMoveStage(invite.id, s)
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  width: '100%', textAlign: 'left',
                                  fontSize: 13, padding: '7px 12px', border: 'none',
                                  background: 'none', cursor: 'pointer', borderRadius: 6,
                                  color: '#374151', transition: 'background 120ms ease',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                <span style={{
                                  width: 8, height: 8, borderRadius: '50%',
                                  background: sc.fg, flexShrink: 0,
                                }} />
                                {STAGE_LABELS[s]}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {invite.completedAt ? formatDate(invite.completedAt) : ''}
                    </span>
                    <span style={{ fontSize: 14, color: '#9CA3AF' }}>&rarr;</span>
                  </div>
                </Link>
              )
            })}

            {candidates.length === 0 && (search || stageFilter !== 'all') && (
              <p style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', padding: 24 }}>
                {search
                  ? `No candidates match "${search}"${stageFilter !== 'all' ? ` in ${STAGE_LABELS[stageFilter]}` : ''}`
                  : `No candidates in ${STAGE_LABELS[stageFilter]}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---- Pending Section ---- */}
      {view === 'list' && pending.length > 0 && (
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

      {/* ── Client Portal ─────────────────────────────────────────────── */}
      {job && (
        <div style={{ ...cardStyle, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Client Portal</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                Send a magic link to your client so they can review the shortlist privately.
              </p>
            </div>
          </div>

          {/* Send form */}
          <form onSubmit={handlePortalInvite} style={{ display: 'flex', gap: 8, marginBottom: contacts.length ? 20 : 0, flexWrap: 'wrap' }}>
            <input
              value={portalName} onChange={e => setPortalName(e.target.value)}
              placeholder="Contact name" required
              style={{ ...inputStyle, flex: '1 1 160px', minWidth: 140 }}
            />
            <input
              value={portalEmail} onChange={e => setPortalEmail(e.target.value)}
              placeholder="Contact email" type="email" required
              style={{ ...inputStyle, flex: '1 1 200px', minWidth: 180 }}
            />
            <button type="submit" disabled={portalSubmitting} style={{ ...primaryBtnStyle, opacity: portalSubmitting ? 0.6 : 1 }}>
              {portalSubmitting ? 'Sending…' : 'Send link'}
            </button>
          </form>

          {/* Existing contacts */}
          {contacts.length > 0 && (
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
              <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Active access</p>
              {contacts.map(c => {
                const expired = new Date(c.expiresAt) < new Date()
                return (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{c.name}</span>
                      <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 8 }}>{c.email}</span>
                      <span style={{
                        fontSize: 11, marginLeft: 8, padding: '1px 6px', borderRadius: 4,
                        background: expired ? '#FEE2E2' : '#D1FAE5',
                        color:      expired ? '#991B1B' : '#065F46',
                      }}>
                        {expired ? 'Expired' : `Expires ${formatDate(c.expiresAt)}`}
                      </span>
                      {c.lastAccessAt && (
                        <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>
                          · Viewed {formatDate(c.lastAccessAt)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => revokeContact(c.id)}
                      disabled={revoking === c.id}
                      style={{
                        background: 'none', border: 'none', fontSize: 12,
                        color: revoking === c.id ? '#9CA3AF' : '#EF4444',
                        cursor: revoking === c.id ? 'default' : 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {revoking === c.id ? 'Revoking…' : 'Revoke'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
