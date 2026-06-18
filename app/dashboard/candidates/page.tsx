'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  name: string
  completedAt: string
  fitPct: number
  recommendation: string
  confidence: string
  benchmarkTag: string
  profileName: string
  profileGroup: string
  adaptationStress: number
  rushed: boolean
  job: {
    id: string
    title: string
    roleType: string
    client: string
    hasTarget: boolean
  }
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function recColor(rec: string): string {
  if (rec === 'Strong Fit') return '#22C55E'
  if (rec === 'Explore Further') return '#EAB308'
  if (rec === 'Needs Discussion') return '#F97316'
  return '#EF4444'
}

function recBg(rec: string): string {
  if (rec === 'Strong Fit') return '#F0FDF4'
  if (rec === 'Explore Further') return '#FEFCE8'
  if (rec === 'Needs Discussion') return '#FFF7ED'
  return '#FEF2F2'
}

export default function CandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [recFilter, setRecFilter] = useState('All')

  useEffect(() => {
    fetch('/api/candidates')
      .then(r => r.json())
      .then(d => { setCandidates(d.data || []); setLoading(false); document.title = 'Veltro — Candidates' })
      .catch(() => setLoading(false))
  }, [])

  const filtered = candidates
    .filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.job.title.toLowerCase().includes(search.toLowerCase()) ||
        c.job.client.toLowerCase().includes(search.toLowerCase())
      const matchRec = recFilter === 'All' || c.recommendation === recFilter
      return matchSearch && matchRec
    })
    .sort((a, b) => b.fitPct - a.fitPct)

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
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
            Candidates
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>
            {loading ? 'Loading...' : `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} evaluated`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 64px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#FFF', border: '1px solid #E5E7EB',
            borderRadius: 8, padding: '0 14px', height: 38, flex: '0 0 320px',
          }}>
            <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or client..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent' }}
            />
          </div>
          <select
            value={recFilter}
            onChange={e => setRecFilter(e.target.value)}
            style={{
              height: 38, padding: '0 12px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: '#FFF',
              fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}
          >
            {['All', 'Strong Fit', 'Explore Further', 'Needs Discussion', 'Low Fit'].map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={card}>
          {/* Col headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto auto',
            gap: 16, padding: '10px 20px', borderBottom: '1px solid #F3F4F6',
          }}>
            {['SCORE', 'CANDIDATE', 'RECOMMENDATION', 'CONFIDENCE', 'BENCHMARK', 'DATE'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto auto',
                gap: 16, padding: '16px 20px', borderBottom: '1px solid #F9FAFB',
              }}>
                {[40, 200, 120, 80, 100, 60].map((w, j) => (
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
                {search || recFilter !== 'All' ? 'No candidates match your filters.' : 'No candidates evaluated yet.'}
              </p>
            </div>
          ) : filtered.map((c, idx) => {
            const color = recColor(c.recommendation)
            const bg = recBg(c.recommendation)
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/dashboard/candidates/${c.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto auto',
                  gap: 16, padding: '14px 20px', alignItems: 'center',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #F9FAFB' : 'none',
                  cursor: 'pointer', transition: 'background 120ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Score */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: bg, border: `1.5px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color,
                }}>
                  {c.fitPct}
                </div>

                {/* Name + role */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {c.job.title}
                    <span style={{ margin: '0 4px' }}>·</span>
                    {c.job.client}
                  </div>
                </div>

                {/* Recommendation pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', height: 24,
                  padding: '0 10px', borderRadius: 999,
                  background: bg, border: `1px solid ${color}20`,
                  fontSize: 11, fontWeight: 600, color, whiteSpace: 'nowrap',
                }}>
                  {c.recommendation}
                </div>

                {/* Confidence */}
                <span style={{ fontSize: 13, color: '#374151' }}>{c.confidence}</span>

                {/* Benchmark */}
                <span style={{ fontSize: 12, color: '#6B7280' }}>{c.benchmarkTag || '—'}</span>

                {/* Date */}
                <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {fmtDate(c.completedAt)}
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
