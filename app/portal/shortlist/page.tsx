'use client'

import { useEffect, useState, useCallback } from 'react'

interface Branding {
  firmName:     string
  logoUrl:      string | null
  primaryColor: string
  partnerName:  string | null
  partnerEmail: string | null
}

interface CandidateResult {
  shareToken:    string
  profileName:   string
  profileGroup:  string
  fitPct:        number | null
  dominance:     number
  extraversion:  number
  patience:      number
  formality:     number
  adaptationStress: number
}

interface Candidate {
  inviteId:    string
  name:        string
  stage:       string
  completedAt: string | null
  result:      CandidateResult | null
}

interface ShortlistData {
  job:        { id: string; title: string; clientName: string }
  branding:   Branding
  candidates: Candidate[]
}

const STAGE_LABEL: Record<string, string> = {
  client_ready:    'Awaiting review',
  client_approved: 'Advanced',
  rejected:        'Passed',
}

const STAGE_COLOR: Record<string, string> = {
  client_ready:    '#92400E',
  client_approved: '#065F46',
  rejected:        '#991B1B',
}

const STAGE_BG: Record<string, string> = {
  client_ready:    '#FEF3C7',
  client_approved: '#D1FAE5',
  rejected:        '#FEE2E2',
}

function DimBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 2 }}>
        <span>{label}</span><span>{pct}</span>
      </div>
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#374151', borderRadius: 2 }} />
      </div>
    </div>
  )
}

export default function PortalShortlistPage() {
  const [data, setData]   = useState<ShortlistData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy]   = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/portal/shortlist')
    if (res.status === 404) { setError('Your access link has expired or is invalid.'); return }
    if (!res.ok) { setError('Something went wrong. Please try again.'); return }
    const json = await res.json()
    setData(json.data)
  }, [])

  useEffect(() => { load() }, [load])

  const submitFeedback = async (inviteId: string, verdict: 'client_approved' | 'rejected') => {
    setBusy(inviteId)
    const res = await fetch(`/api/portal/candidates/${inviteId}/feedback`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ verdict }),
    })
    if (res.ok) await load()
    setBusy(null)
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 18, color: '#374151', marginBottom: 8 }}>{error}</p>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Contact your search firm partner for a new link.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <p style={{ color: '#6B7280' }}>Loading...</p>
      </div>
    )
  }

  const { branding, job, candidates } = data
  const primary = branding.primaryColor

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <div style={{ background: primary, padding: '0 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {branding.logoUrl
              ? <img src={branding.logoUrl} alt={branding.firmName} style={{ height: 32, objectFit: 'contain' }} />
              : <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{branding.firmName}</span>
            }
          </div>
          {branding.partnerName && (
            <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{branding.partnerName}</div>
              {branding.partnerEmail && (
                <a href={`mailto:${branding.partnerEmail}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 12 }}>
                  {branding.partnerEmail}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 32px 0' }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          {job.clientName}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {job.title}
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} ready for review
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: 32, display: 'grid', gap: 16 }}>
        {candidates.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#9CA3AF' }}>
            No candidates are ready for review yet.
          </div>
        )}
        {candidates.map(c => {
          const stageLabel = STAGE_LABEL[c.stage] ?? c.stage
          const stageColor = STAGE_COLOR[c.stage] ?? '#374151'
          const stageBg    = STAGE_BG[c.stage]    ?? '#F3F4F6'
          const r          = c.result
          const isPending  = busy === c.inviteId

          return (
            <div key={c.inviteId} style={{
              background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
              padding: 24, display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{c.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                    background: stageBg, color: stageColor, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{stageLabel}</span>
                </div>
                {r && (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{r.profileGroup} · </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.profileName}</span>
                      {r.fitPct != null && (
                        <span style={{ marginLeft: 12, fontSize: 13, color: '#6B7280' }}>
                          Fit: <strong style={{ color: '#111827' }}>{r.fitPct}%</strong>
                        </span>
                      )}
                    </div>
                    <div style={{ maxWidth: 320 }}>
                      <DimBar label="Dominance"    value={r.dominance}    />
                      <DimBar label="Extraversion" value={r.extraversion} />
                      <DimBar label="Patience"     value={r.patience}     />
                      <DimBar label="Formality"    value={r.formality}    />
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                {r && (
                  <a href={`/portal/report/${r.shareToken}`} style={{
                    display: 'block', textAlign: 'center', padding: '9px 16px',
                    background: primary, color: '#fff', borderRadius: 8,
                    fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  }}>
                    View Report
                  </a>
                )}
                {c.stage === 'client_ready' && (
                  <>
                    <button disabled={isPending} onClick={() => submitFeedback(c.inviteId, 'client_approved')}
                      style={{
                        padding: '9px 16px', background: '#D1FAE5', color: '#065F46',
                        border: '1px solid #A7F3D0', borderRadius: 8, fontWeight: 600,
                        fontSize: 13, cursor: isPending ? 'not-allowed' : 'pointer',
                      }}>
                      {isPending ? '...' : 'Advance'}
                    </button>
                    <button disabled={isPending} onClick={() => submitFeedback(c.inviteId, 'rejected')}
                      style={{
                        padding: '9px 16px', background: '#FEE2E2', color: '#991B1B',
                        border: '1px solid #FECACA', borderRadius: 8, fontWeight: 600,
                        fontSize: 13, cursor: isPending ? 'not-allowed' : 'pointer',
                      }}>
                      {isPending ? '...' : 'Pass'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: '1px solid #E5E7EB', padding: '20px 32px', textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
        Behavioral assessments by {branding.firmName}
        {branding.partnerEmail && (
          <> &middot; <a href={`mailto:${branding.partnerEmail}`} style={{ color: '#9CA3AF' }}>Contact</a></>
        )}
      </div>
    </div>
  )
}
