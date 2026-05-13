'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Candidate {
  id: string
  name: string
  completedAt: string
  fitPct: number | null
  hasBenchmark: boolean
  recommendation: string | null
  confidence: string | null
  benchmarkTag: string
  profileName: string
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

function fitColor(pct: number | null): string {
  if (pct === null) return '#9CA3AF'
  if (pct >= 85) return '#22C55E'
  if (pct >= 70) return '#EAB308'
  if (pct >= 55) return '#F97316'
  return '#EF4444'
}
function fitBg(pct: number | null): string {
  if (pct === null) return 'rgba(156,163,175,0.10)'
  if (pct >= 85) return 'rgba(34,197,94,0.10)'
  if (pct >= 70) return 'rgba(234,179,8,0.10)'
  if (pct >= 55) return 'rgba(249,115,22,0.10)'
  return 'rgba(239,68,68,0.10)'
}
function fitBorder(pct: number | null): string {
  if (pct === null) return 'rgba(156,163,175,0.25)'
  if (pct >= 85) return 'rgba(34,197,94,0.25)'
  if (pct >= 70) return 'rgba(234,179,8,0.25)'
  if (pct >= 55) return 'rgba(249,115,22,0.25)'
  return 'rgba(239,68,68,0.25)'
}
function recColor(rec: string | null): string {
  if (rec === 'Strong Fit') return '#22C55E'
  if (rec === 'Explore Further') return '#EAB308'
  if (rec === 'Needs Discussion') return '#F97316'
  return '#EF4444'
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* Skeleton row */
function SkeletonRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20, padding: '16px 24px',
      borderBottom: '1px solid #F9FAFB',
    }}>
      <div style={{ width: 52, height: 28, borderRadius: 999, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 14, width: '40%', borderRadius: 4, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite' }} />
        <div style={{ height: 11, width: '25%', borderRadius: 4, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.1s' }} />
      </div>
      <div style={{ width: 120, height: 14, borderRadius: 4, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.2s' }} />
      <div style={{ width: 72, height: 22, borderRadius: 4, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.15s' }} />
      <div style={{ width: 44, height: 11, borderRadius: 4, background: '#F3F4F6', animation: 'shimmer 1.4s ease infinite', animationDelay: '0.3s' }} />
    </div>
  )
}

/* Empty state */
function EmptyState() {
  return (
    <div style={{
      background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '72px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: '#F9FAFB', border: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>No evaluations yet</h2>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 8px', maxWidth: 360, lineHeight: 1.6, marginLeft: 'auto', marginRight: 'auto' }}>
        Create your first role benchmark to start evaluating candidates. The process takes 6 minutes per candidate.
      </p>
      <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 32px' }}>No login required for candidates &middot; Works on any device</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/dashboard/jobs/new" style={{
          height: 44, padding: '0 24px', borderRadius: 8,
          background: '#111827', color: '#FFF',
          fontSize: 14, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center',
          textDecoration: 'none', transition: 'all 150ms ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Create role benchmark
        </Link>
      </div>
    </div>
  )
}

export default function HiringOverview() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [search, setSearch] = useState('')
  const [recFilter, setRecFilter] = useState('all')

  useEffect(() => {
    fetch('/api/candidates')
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then(d => {
        setCandidates(d.data || [])
        setLoading(false)
        document.title = 'Veltro — Hiring Overview'
      })
      .catch(() => { setFetchError(true); setLoading(false) })
  }, [])

  const filtered = candidates
    .filter(c => {
      if (search) {
        const q = search.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !c.job.title.toLowerCase().includes(q) && !c.job.client.toLowerCase().includes(q)) return false
      }
      if (recFilter === 'strong'   && (c.fitPct ?? -1) < 85) return false
      if (recFilter === 'explore'  && ((c.fitPct ?? -1) < 70 || (c.fitPct ?? -1) >= 85)) return false
      if (recFilter === 'discuss'  && ((c.fitPct ?? -1) < 55 || (c.fitPct ?? -1) >= 70)) return false
      if (recFilter === 'low'      && (c.fitPct ?? -1) >= 55) return false
      return true
    })
    .sort((a, b) => (b.fitPct ?? -1) - (a.fitPct ?? -1))

  const flaggedRisks = candidates.filter(c => c.fitPct !== null && c.fitPct >= 70 && c.fitPct < 80)
  const recentEvals = [...candidates].slice(0, 5)
  const needsCoverage = candidates.filter(c => !c.hasBenchmark || (c.fitPct !== null && c.fitPct < 55))

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>

      {/* Page Header */}
      <div style={{
        background: '#FFF', borderBottom: '1px solid #E5E7EB',
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Hiring Overview</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0' }}>
            {loading ? 'Loading...' : `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} evaluated`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard/jobs/new" style={{
            height: 36, padding: '0 16px', borderRadius: 8,
            background: '#111827', color: '#FFF',
            fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center',
            textDecoration: 'none', transition: 'all 150ms ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            + New benchmark
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#FFF', borderBottom: '1px solid #F3F4F6',
        padding: '12px 32px',
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, role, or client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', height: 34, paddingLeft: 32, paddingRight: 12,
              border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, color: '#111827', outline: 'none', background: '#FFF',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={recFilter}
          onChange={e => setRecFilter(e.target.value)}
          style={{
            height: 34, border: '1px solid #E5E7EB', borderRadius: 8,
            padding: '0 12px', fontSize: 13, color: '#374151',
            background: '#FFF', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">All recommendations</option>
          <option value="strong">Strong Fit</option>
          <option value="explore">Explore Further</option>
          <option value="discuss">Needs Discussion</option>
          <option value="low">Low Fit</option>
        </select>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
            {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && fetchError && (
          <div style={{
            background: '#FFF', border: '1px solid #FCA5A5', borderRadius: 12,
            padding: '32px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#EF4444', fontWeight: 600, marginBottom: 8 }}>Failed to load candidates</p>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Check your connection and refresh the page.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && candidates.length === 0 && <EmptyState />}

        {/* Candidates table */}
        {!loading && !fetchError && candidates.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Candidates &mdash; ranked by fit score
            </p>

            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 160px 130px 100px 56px 32px',
                padding: '10px 24px',
                borderBottom: '1px solid #F3F4F6',
                gap: 16,
              }}>
                {['Score', 'Candidate', 'Recommendation', 'Confidence', 'Benchmark', 'Date', ''].map((h, i) => (
                  <span key={h + i} style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/dashboard/candidates/${c.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 160px 130px 100px 56px 32px',
                    padding: '14px 24px',
                    gap: 16,
                    borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none',
                    textDecoration: 'none',
                    alignItems: 'center',
                    background: '#FFF',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#F9FAFB'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#FFF'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Score pill */}
                  <div style={{
                    width: 52, height: 28, borderRadius: 999,
                    background: fitBg(c.fitPct), border: `1px solid ${fitBorder(c.fitPct)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: fitColor(c.fitPct),
                    flexShrink: 0,
                  }}>
                    {c.fitPct ?? '—'}
                  </div>

                  {/* Candidate info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.name}
                      {c.adaptationStress > 0.2 && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#EAB308', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 999, padding: '1px 6px' }}>Adapting</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.job.title} &middot; {c.job.client}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: recColor(c.recommendation) }}>
                      {c.recommendation ?? 'No benchmark'}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: c.confidence === 'High' ? '#22C55E' : c.confidence === 'Medium' ? '#EAB308' : '#9CA3AF',
                      }} />
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{c.confidence}</span>
                    </div>
                  </div>

                  {/* Benchmark tag */}
                  <div>
                    <span style={{
                      background: '#F3F4F6', color: '#6B7280', borderRadius: 4,
                      padding: '3px 8px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                    }}>
                      {c.benchmarkTag}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                    {c.completedAt ? fmtDate(c.completedAt) : ''}
                  </div>

                  {/* Arrow */}
                  <div style={{ fontSize: 14, color: '#D1D5DB', textAlign: 'right' }}>&rarr;</div>
                </Link>
              ))}

              {/* No filtered results */}
              {filtered.length === 0 && candidates.length > 0 && (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: '#9CA3AF' }}>No candidates match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secondary panels */}
        {!loading && !fetchError && candidates.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

            {/* Flagged Risks */}
            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Flagged Risks</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Strong score, notable dimension gap</div>
              {flaggedRisks.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No flags on current candidates.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {flaggedRisks.slice(0, 4).map(c => (
                    <Link key={c.id} href={`/dashboard/candidates/${c.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{c.name}</span>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.job.title}</div>
                        </div>
                        <span style={{ fontSize: 12, color: '#EAB308', fontWeight: 700 }}>{c.fitPct}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Evaluations */}
            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Recent Evaluations</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Last 5 completed</div>
              {recentEvals.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No evaluations completed yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentEvals.map(c => (
                    <Link key={c.id} href={`/dashboard/candidates/${c.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{c.name}</span>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.completedAt ? fmtDate(c.completedAt) : ''}</div>
                        </div>
                        <div style={{
                          minWidth: 32, height: 20, borderRadius: 999,
                          background: fitBg(c.fitPct), border: `1px solid ${fitBorder(c.fitPct)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: fitColor(c.fitPct), padding: '0 6px',
                        }}>
                          {c.fitPct ?? '—'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Needs Coverage */}
            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Below Benchmark</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Candidates not meeting threshold</div>
              {needsCoverage.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>All candidates above benchmark threshold.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {needsCoverage.slice(0, 4).map(c => (
                    <Link key={c.id} href={`/dashboard/candidates/${c.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{c.name}</span>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.job.title}</div>
                        </div>
                        <span style={{ fontSize: 11, color: c.recommendation ? recColor(c.recommendation) : '#9CA3AF' }}>
                          {c.recommendation ?? 'No benchmark'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
