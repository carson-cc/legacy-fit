'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Branding {
  firmName:     string
  logoUrl:      string | null
  primaryColor: string
  partnerName:  string | null
  partnerEmail: string | null
}

interface Scores {
  dominance:     number
  extraversion:  number
  patience:      number
  formality:     number
  domPercentile: number
  extPercentile: number
  patPercentile: number
  forPercentile: number
}

interface Profile {
  name:             string
  group:            string
  secondary:        string | null
  adaptationStress: number
}

interface ReportData {
  candidate: {
    name:        string
    jobTitle:    string
    clientName:  string
    completedAt: string | null
    stage:       string
  }
  scores:   Scores
  profile:  Profile
  fit:      { pct: number | null; low: number | null; high: number | null } | null
  branding: Branding
}

const DIM_LABELS: Record<string, string> = {
  dominance:    'Dominance',
  extraversion: 'Extraversion',
  patience:     'Patience',
  formality:    'Formality',
}

function ScoreRow({
  label, value, percentile, primary,
}: { label: string; value: number; percentile: number; primary: string }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{label}</span>
        <span style={{ fontSize: 14, color: '#6B7280' }}>{pct} · {Math.round(percentile)}th percentile</span>
      </div>
      <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: primary, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function PortalReportPage() {
  const params = useParams<{ shareToken: string }>()
  const [data, setData]   = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/portal/report/${params.shareToken}`)
      .then(r => {
        if (r.status === 404) throw new Error('not-found')
        if (!r.ok)            throw new Error('server-error')
        return r.json()
      })
      .then(j => setData(j.data))
      .catch(e => setError(e.message))
  }, [params.shareToken])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 18, color: '#374151', marginBottom: 8 }}>
            {error === 'not-found' ? 'Report not available.' : 'Something went wrong.'}
          </p>
          <a href="/portal/shortlist" style={{ fontSize: 14, color: '#2563EB' }}>Back to shortlist</a>
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

  const { branding, candidate, scores, profile, fit } = data
  const primary = branding.primaryColor

  const fitLabel =
    fit?.pct != null ? `${fit.pct}% fit`
    : fit !== null   ? 'Benchmark set — score pending'
    : 'No benchmark set'

  const stressLabel = profile.adaptationStress < 0.33 ? 'Low' : profile.adaptationStress < 0.66 ? 'Moderate' : 'High'

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      {/* Header */}
      <div style={{ background: primary, padding: '0 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div>
            {branding.logoUrl
              ? <img src={branding.logoUrl} alt={branding.firmName} style={{ height: 28, objectFit: 'contain' }} />
              : <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{branding.firmName}</span>
            }
          </div>
          <a href="/portal/shortlist" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textDecoration: 'none' }}>
            &larr; Shortlist
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Candidate hero */}
        <div style={{ background: '#111827', borderRadius: 16, padding: '36px 40px', marginBottom: 32, color: '#fff' }}>
          <p style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
            {candidate.clientName} · {candidate.jobTitle}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.03em' }}>{candidate.name}</h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile</p>
              <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#F9FAFB' }}>{profile.name}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{profile.group}</p>
            </div>
            {fit && (
              <div>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role Fit</p>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#F9FAFB' }}>{fitLabel}</p>
                {fit.low != null && fit.high != null && (
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>Range: {fit.low}–{fit.high}%</p>
                )}
              </div>
            )}
            <div>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adaptation Stress</p>
              <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#F9FAFB' }}>{stressLabel}</p>
            </div>
          </div>
        </div>

        {/* Dimension scores */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '28px 32px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>Behavioral Dimensions</h2>
          <ScoreRow label="Dominance"    value={scores.dominance}    percentile={scores.domPercentile} primary={primary} />
          <ScoreRow label="Extraversion" value={scores.extraversion} percentile={scores.extPercentile} primary={primary} />
          <ScoreRow label="Patience"     value={scores.patience}     percentile={scores.patPercentile} primary={primary} />
          <ScoreRow label="Formality"    value={scores.formality}    percentile={scores.forPercentile} primary={primary} />
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, marginBottom: 0 }}>
            Percentiles are relative to the general working population. Higher scores indicate stronger expression of each trait.
          </p>
        </div>

        {/* Profile secondary */}
        {profile.secondary && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 32px', marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Secondary Profile</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>{profile.secondary}</p>
          </div>
        )}

        {/* Methodology note */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
            This profile was generated from a validated behavioral instrument administered by {branding.firmName}.
            Results reflect natural working style, not skill or performance.
            {branding.partnerName && branding.partnerEmail && (
              <> Questions? Contact <a href={`mailto:${branding.partnerEmail}`} style={{ color: primary }}>{branding.partnerName}</a>.</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
