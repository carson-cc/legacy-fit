'use client'

import { useState, useEffect, useCallback } from 'react'

interface EventLogEntry {
  id: string
  event: string
  entityId: string
  userId: string | null
  meta: string | null
  createdAt: string
}

interface User {
  id: string
  name: string | null
  email: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function metaSnippet(meta: string | null): string {
  if (!meta) return '—'
  try {
    const obj = JSON.parse(meta)
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')
      .slice(0, 60)
  } catch {
    return meta.slice(0, 60)
  }
}

export default function AuditLogPage() {
  const [events, setEvents] = useState<EventLogEntry[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [page, setPage] = useState(1)
  const [filterEvent, setFilterEvent] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (filterEvent) params.set('eventType', filterEvent)
    if (filterUser) params.set('userId', filterUser)
    if (filterFrom) params.set('from', filterFrom)
    if (filterTo) params.set('to', filterTo)

    fetch(`/api/settings/audit-log?${params}`)
      .then(r => r.json())
      .then(d => {
        setEvents(d.data ?? [])
        setTotal(d.total ?? 0)
        setTotalPages(d.totalPages ?? 1)
        if (d.users) setUsers(d.users)
        if (d.eventTypes) setEventTypes(d.eventTypes)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, filterEvent, filterUser, filterFrom, filterTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  useEffect(() => { document.title = 'Veltro — Audit Log' }, [])

  const inputStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#374151',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '7px 10px',
    outline: 'none',
    background: '#FFFFFF',
  }

  const userLabel = (userId: string | null) => {
    if (!userId) return '—'
    const u = users.find(u => u.id === userId)
    return u ? (u.name ?? u.email) : userId.slice(0, 8) + '…'
  }

  return (
    <div style={{ padding: '32px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          Audit Log
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          {total} events total
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginBottom: 20, padding: '14px 16px',
        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10,
      }}>
        <select
          value={filterEvent}
          onChange={e => { setFilterEvent(e.target.value); setPage(1) }}
          style={{ ...inputStyle, minWidth: 160 }}
        >
          <option value="">All event types</option>
          {eventTypes.map(et => (
            <option key={et} value={et}>{et}</option>
          ))}
        </select>

        <select
          value={filterUser}
          onChange={e => { setFilterUser(e.target.value); setPage(1) }}
          style={{ ...inputStyle, minWidth: 160 }}
        >
          <option value="">All users</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
          ))}
        </select>

        <input
          type="date"
          value={filterFrom}
          onChange={e => { setFilterFrom(e.target.value); setPage(1) }}
          style={{ ...inputStyle }}
          title="From date"
        />
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>to</span>
        <input
          type="date"
          value={filterTo}
          onChange={e => { setFilterTo(e.target.value); setPage(1) }}
          style={{ ...inputStyle }}
          title="To date"
        />

        {(filterEvent || filterUser || filterFrom || filterTo) && (
          <button
            onClick={() => { setFilterEvent(''); setFilterUser(''); setFilterFrom(''); setFilterTo(''); setPage(1) }}
            style={{
              fontSize: 12, color: '#6B7280', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 200px 160px 160px 1fr',
          gap: 16,
          padding: '11px 20px',
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
        }}>
          {['Timestamp', 'Event Type', 'Entity', 'User', 'Details'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            Loading…
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No events found
          </div>
        ) : (
          events.map((ev, i) => (
            <div
              key={ev.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 200px 160px 160px 1fr',
                gap: 16,
                padding: '12px 20px',
                borderBottom: i < events.length - 1 ? '1px solid #F3F4F6' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 12, color: '#6B7280' }}>{formatDate(ev.createdAt)}</span>
              <span style={{
                fontSize: 12, fontWeight: 500, color: '#374151',
                background: '#F3F4F6', borderRadius: 4, padding: '2px 7px', display: 'inline-block',
              }}>
                {ev.event}
              </span>
              <span style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                {ev.entityId.slice(0, 12)}…
              </span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{userLabel(ev.userId)}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {metaSnippet(ev.meta)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              fontSize: 13, padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
              background: '#FFFFFF', cursor: page === 1 ? 'default' : 'pointer',
              color: page === 1 ? '#D1D5DB' : '#374151',
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              fontSize: 13, padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: 8,
              background: '#FFFFFF', cursor: page === totalPages ? 'default' : 'pointer',
              color: page === totalPages ? '#D1D5DB' : '#374151',
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
