'use client'

import { useEffect, useState, useCallback } from 'react'

interface GroupStats {
  label:          string
  total:          number
  selected:       number
  rate:           number
  fourFifthsFlag: boolean
}

interface DimensionReport {
  dimension:   string
  highestRate: number
  groups:      GroupStats[]
}

interface ReportData {
  totalResponders: number
  dimensions:      DimensionReport[]
  note:            string
}

const DIM_LABELS: Record<string, string> = {
  gender:     'Gender Identity',
  race:       'Race / Ethnicity',
  ageRange:   'Age Range',
  disability: 'Disability Status',
  veteran:    'Veteran Status',
}

function pct(rate: number) {
  return (rate * 100).toFixed(1) + '%'
}

export default function AdverseImpactPage() {
  const [data,    setData]    = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/settings/adverse-impact')
    if (!res.ok) { setError('Failed to load data.'); setLoading(false); return }
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Veltro — Adverse Impact'
    load()
  }, [load])

  const inner = (() => {
    if (loading) return <p style={{ color: '#6B7280', fontSize: 14 }}>Loading...</p>
    if (error)   return <p style={{ color: '#EF4444', fontSize: 14 }}>{error}</p>
    if (!data)   return null

    if (data.totalResponders === 0) {
      return (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '40px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No demographic data yet</p>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
            Candidates who opt in to the voluntary demographic capture screen will appear here once their assessment is complete.
          </p>
        </div>
      )
    }

    const flaggedCount = data.dimensions.reduce(
      (acc, dim) => acc + dim.groups.filter(g => g.fourFifthsFlag).length,
      0,
    )

    return (
      <div>
        {/* Summary banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: flaggedCount > 0 ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
          border: `1px solid ${flaggedCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          borderRadius: 10, padding: '16px 20px', marginBottom: 28,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: flaggedCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          }}>
            {flaggedCount > 0
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            }
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {flaggedCount > 0
                ? `${flaggedCount} group${flaggedCount > 1 ? 's' : ''} below the 4/5 rule threshold`
                : 'No 4/5 rule violations detected'}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              {data.totalResponders} candidate{data.totalResponders !== 1 ? 's' : ''} with demographic data · Groups with fewer than 5 responses are not flagged
            </p>
          </div>
        </div>

        {/* Dimension tables */}
        {data.dimensions.map(dim => {
          const visibleGroups = dim.groups.filter(g => g.total > 0)
          if (visibleGroups.length === 0) return null
          return (
            <div key={dim.dimension} style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {DIM_LABELS[dim.dimension] ?? dim.dimension}
              </h3>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 120px',
                  background: '#F9FAFB', padding: '10px 16px',
                  borderBottom: '1px solid #E5E7EB',
                  fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <span>Group</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                  <span style={{ textAlign: 'right' }}>Advanced</span>
                  <span style={{ textAlign: 'right' }}>Rate</span>
                  <span style={{ textAlign: 'right' }}>4/5 Rule</span>
                </div>
                {visibleGroups.map((g, i) => (
                  <div key={g.label} style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 120px',
                    padding: '12px 16px', alignItems: 'center',
                    borderBottom: i < visibleGroups.length - 1 ? '1px solid #F3F4F6' : 'none',
                    background: g.fourFifthsFlag ? 'rgba(239,68,68,0.02)' : 'white',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{g.label}</span>
                    <span style={{ fontSize: 13, color: '#6B7280', textAlign: 'right' }}>{g.total}</span>
                    <span style={{ fontSize: 13, color: '#6B7280', textAlign: 'right' }}>{g.selected}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'right' }}>{pct(g.rate)}</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {g.total < 5 ? (
                        <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>n &lt; 5</span>
                      ) : g.fourFifthsFlag ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                          background: 'rgba(239,68,68,0.1)', color: '#EF4444', letterSpacing: '0.04em',
                        }}>
                          ⚠ BELOW 4/5
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                          background: 'rgba(34,197,94,0.08)', color: '#16A34A', letterSpacing: '0.04em',
                        }}>
                          PASS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {/* Bar mini-chart row */}
                <div style={{ padding: '12px 16px 14px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 32 }}>
                    {visibleGroups.map(g => {
                      const barHeight = dim.highestRate > 0 ? Math.round((g.rate / dim.highestRate) * 32) : 0
                      return (
                        <div key={g.label} title={`${g.label}: ${pct(g.rate)}`} style={{
                          flex: 1, height: Math.max(barHeight, 2),
                          borderRadius: 2,
                          background: g.fourFifthsFlag ? '#EF4444' : '#22C55E',
                          opacity: g.total < 5 ? 0.3 : 0.7,
                          transition: 'height 300ms ease',
                        }} />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.7, marginTop: 8 }}>
          {data.note}
        </p>
      </div>
    )
  })()

  return (
    <div style={{ maxWidth: 720, padding: '32px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Adverse Impact Monitoring
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.55 }}>
          Aggregate selection rates by demographic group across all assessed candidates in your organization.
          Individual candidate data is never shown here.
        </p>
      </div>

      {inner}
    </div>
  )
}
