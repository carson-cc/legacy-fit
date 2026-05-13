'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Candidate {
  id: string
  name: string | null
  stage: string
  fitPct: number | null
  profileName: string | null
  profileGroup: string | null
}

interface PortalData {
  job: { id: string; title: string; client: string }
  candidates: Candidate[]
}

const STAGE_LABELS: Record<string, string> = {
  longlist: 'Longlist',
  shortlist: 'Shortlist',
  client_ready: 'Client Ready',
  rejected: 'Rejected',
}

const STAGE_COLORS: Record<string, { bg: string; fg: string }> = {
  longlist: { bg: '#F3F4F6', fg: '#6B7280' },
  shortlist: { bg: '#EFF6FF', fg: '#2563EB' },
  client_ready: { bg: '#F0FDF4', fg: '#15803D' },
  rejected: { bg: '#FEF2F2', fg: '#EF4444' },
}

const GROUP_LABELS: Record<string, string> = {
  field_command: 'Drivers',
  people_influence: 'Catalysts',
  process_structure: 'Operators',
  strategic_drive: 'Stabilizers',
}

function fitColor(pct: number): string {
  if (pct >= 85) return '#22C55E'
  if (pct >= 70) return '#EAB308'
  return '#EF4444'
}

function FitRing({ pct }: { pct: number }) {
  const color = fitColor(pct)
  const r = 28
  const circ = 2 * Math.PI * r
  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={4} />
      <circle
        cx={36} cy={36} r={r}
        fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform="rotate(-90 36 36)"
      />
      <text
        x={36} y={37}
        textAnchor="middle" dominantBaseline="middle"
        fill="#111827" fontSize={16} fontWeight={700}
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        {pct}
      </text>
    </svg>
  )
}

export default function PortalPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<PortalData | null>(null)
  const [status, setStatus] = useState<'loading' | 'expired' | 'error' | 'ok'>('loading')

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(async r => {
        if (r.status === 410) { setStatus('expired'); return }
        if (!r.ok) { setStatus('error'); return }
        const json = await r.json()
        setData(json.data)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (status === 'expired' || status === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
            This link is no longer active
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            Contact your recruiter to request a new access link.
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ background: '#FFF', borderBottom: '1px solid #E5E7EB', padding: '20px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 4px' }}>
            {data.job.client}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
            {data.job.title}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>
            {data.candidates.length} candidate{data.candidates.length !== 1 ? 's' : ''} approved for review
          </p>
        </div>
      </div>

      {/* Candidates */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 32px 64px' }}>
        {data.candidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <p style={{ fontSize: 15, color: '#9CA3AF' }}>No candidates have been approved for review yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.candidates.map(c => {
              const stageColors = STAGE_COLORS[c.stage] ?? STAGE_COLORS.longlist
              const groupLabel = c.profileGroup ? (GROUP_LABELS[c.profileGroup] ?? c.profileGroup) : null

              return (
                <div
                  key={c.id}
                  style={{
                    background: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                  }}
                >
                  {c.fitPct != null && (
                    <div style={{ flexShrink: 0 }}>
                      <FitRing pct={c.fitPct} />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 17, fontWeight: 600, color: '#111827' }}>
                        {c.name ?? 'Candidate'}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: stageColors.fg, background: stageColors.bg,
                        padding: '2px 8px', borderRadius: 9999,
                      }}>
                        {STAGE_LABELS[c.stage] ?? c.stage}
                      </span>
                    </div>
                    {(c.profileName || groupLabel) && (
                      <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                        {[c.profileName, groupLabel].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          Powered by Veltro · This link is private — do not share
        </p>
      </div>
    </div>
  )
}
