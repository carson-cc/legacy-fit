'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  roleType: string
  client: { id: string; name: string }
  hasTarget: boolean
  candidateCount: number
  pendingCount: number
  topFit: number
  createdAt: string
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fitColor(fit: number, count: number): string {
  if (count === 0) return '#9CA3AF'
  if (fit >= 85) return '#22C55E'
  if (fit >= 70) return '#EAB308'
  return '#EF4444'
}

export default function RolesPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(d => { setJobs(d.data || []); setLoading(false); document.title = 'Veltro — Roles' })
      .catch(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.client.name.toLowerCase().includes(search.toLowerCase()) ||
    j.roleType.toLowerCase().includes(search.toLowerCase())
  )

  const card: React.CSSProperties = {
    background: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ background: '#FFF', borderBottom: '1px solid #E5E7EB', padding: '20px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Roles</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>
              {loading ? 'Loading...' : `${jobs.length} active role${jobs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/jobs/new')}
            style={{
              height: 36, padding: '0 16px', borderRadius: 8,
              background: '#111827', color: '#FFF',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1F2937'}
            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
          >
            + New benchmark
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 32px 64px' }}>
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#FFF', border: '1px solid #E5E7EB',
            borderRadius: 8, padding: '0 14px', height: 38, maxWidth: 360,
          }}>
            <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search roles..."
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 13,
                color: '#111827', background: 'transparent',
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={card}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
            gap: 16, padding: '10px 20px',
            borderBottom: '1px solid #F3F4F6',
          }}>
            {['ROLE', 'CLIENT', 'CANDIDATES', 'TOP FIT', 'CREATED'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            [1,2,3].map(i => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                gap: 16, padding: '16px 20px', borderBottom: '1px solid #F9FAFB',
              }}>
                {[180,100,80,60,80].map((w, j) => (
                  <div key={j} style={{
                    height: 14, width: w, borderRadius: 4, background: '#F3F4F6',
                    animation: 'shimmer 1.2s infinite',
                  }} />
                ))}
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF' }}>
                {search ? 'No roles match your search.' : 'No roles yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => router.push('/dashboard/jobs/new')}
                  style={{
                    marginTop: 12, height: 34, padding: '0 14px', borderRadius: 8,
                    background: '#111827', color: '#FFF',
                    fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  }}
                >
                  Create first benchmark
                </button>
              )}
            </div>
          ) : filtered.map((job, idx) => {
            const color = fitColor(job.topFit, job.candidateCount)
            return (
              <div
                key={job.id}
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                  gap: 16, padding: '16px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #F9FAFB' : 'none',
                  cursor: 'pointer', transition: 'background 120ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {job.roleType}
                    {!job.hasTarget && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                        color: '#EAB308', background: '#FFFBEB', padding: '1px 6px', borderRadius: 4,
                        textTransform: 'uppercase',
                      }}>
                        No benchmark
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: '#374151', alignSelf: 'center' }}>{job.client.name}</span>
                <div style={{ textAlign: 'center', alignSelf: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{job.candidateCount}</div>
                  {job.pendingCount > 0 && (
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{job.pendingCount} pending</div>
                  )}
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color, alignSelf: 'center', textAlign: 'center' }}>
                  {job.candidateCount > 0 ? job.topFit : '—'}
                </span>
                <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                  {fmtDate(job.createdAt)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
      `}</style>
    </div>
  )
}
