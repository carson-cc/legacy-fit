'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { showToast } from '@/app/components/Toast'
import { FitModelLight } from '@/app/components/FitModel'

/* ── Types ──────────────────────────────────────────────────────── */

interface Job {
  id: string; title: string; roleType: string
  client: { id: string; name: string }
  target: { dominance: number; extraversion: number; patience: number; formality: number; notes: string | null } | null
}

/* ── Dimension config ────────────────────────────────────────────── */

const DIMS = [
  {
    key: 'dominance' as const,
    label: 'Execution',
    desc: (v: number) =>
      v >= 0.70 ? 'Drives outcomes with intensity — expects ownership and resolution at all levels.'
      : v >= 0.40 ? 'Balanced assertiveness with ability to push through obstacles when needed.'
      : 'Steady, collaborative approach — defers to team consensus on high-stakes decisions.',
  },
  {
    key: 'formality' as const,
    label: 'Ownership',
    desc: (v: number) =>
      v >= 0.70 ? 'Precise, disciplined, rule-following — strong accountability expected at all levels.'
      : v >= 0.40 ? 'Balances structure with adaptability — accountable without being rigid.'
      : 'Flexible and practical — adapts process to context, values outcomes over procedure.',
  },
  {
    key: 'patience' as const,
    label: 'Adaptability',
    desc: (v: number) =>
      v >= 0.70 ? 'Consistent and methodical — builds stability in complex, long-cycle environments.'
      : v >= 0.40 ? 'Comfortable with moderate change — adjusts without losing effectiveness.'
      : 'Fast-paced and urgent — thrives in high-pressure, constantly changing environments.',
  },
  {
    key: 'extraversion' as const,
    label: 'Collaboration',
    desc: (v: number) =>
      v >= 0.70 ? 'People-oriented — success depends on relationship building and sustained alignment.'
      : v >= 0.40 ? 'Works well with others while maintaining individual task focus.'
      : 'Independent and task-focused — minimal social energy required; outcome-driven.',
  },
]

type BenchmarkDims = {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

function pct(v: number) { return Math.round(v * 100) }

function interpret(dims: BenchmarkDims): string {
  const ex = dims.dominance, ow = dims.formality, ad = dims.patience, co = dims.extraversion
  if (ex >= 0.8 && ow >= 0.8) return 'Benchmark demands elite execution and complete ownership. Candidates must drive outcomes independently at high velocity.'
  if (ex >= 0.65 && ow >= 0.65) return 'This benchmark emphasizes forward momentum, ownership, and independent execution under pressure.'
  if (ad <= 0.35 && ow >= 0.65) return 'This role favors structured environments with strong accountability. Candidates requiring flexibility may underperform.'
  if (co >= 0.65 && ex >= 0.65) return 'Requires both strong stakeholder coordination and visible forward momentum. Rare combination — benchmark is selective.'
  if (ad >= 0.65) return 'High adaptability requirement. Candidates must operate effectively in fast-changing contexts without losing quality.'
  if (co >= 0.8) return 'Collaboration-intensive role. Success depends on alignment skills and sustained stakeholder management.'
  return 'Balanced benchmark — consistent execution and role alignment emphasized across dimensions.'
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function RoleBenchmarkPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  const [dims, setDims] = useState<BenchmarkDims>({
    dominance: 0.65,
    extraversion: 0.50,
    patience: 0.50,
    formality: 0.65,
  })

  const [aiLoading, setAiLoading] = useState(false)
  const [aiRationale, setAiRationale] = useState('')
  const [aiConfidence, setAiConfidence] = useState('')

  const fetchJob = useCallback(() => {
    setLoading(true)
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(d => {
        const j = d.data as Job
        setJob(j)
        if (j.target) {
          setDims({
            dominance: j.target.dominance,
            extraversion: j.target.extraversion,
            patience: j.target.patience,
            formality: j.target.formality,
          })
          setNotes(j.target.notes ?? '')
        }
        setLoading(false)
        // Auto-classify if no target set yet
        if (!j.target && j.title) {
          classifyRole(j.title)
        }
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchJob() }, [fetchJob])

  async function classifyRole(roleTitle: string) {
    setAiLoading(true)
    try {
      const res = await fetch('/api/classify-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleTitle }),
      })
      const data = await res.json()
      if (data.data) {
        const s = data.data
        setDims({
          dominance: s.dominance,
          extraversion: s.extraversion,
          patience: s.patience,
          formality: s.formality,
        })
        setAiRationale(s.rationale)
        setAiConfidence(s.confidence)
      }
    } catch { /* silent — user can set manually */ }
    finally { setAiLoading(false) }
  }

  function setDim(key: keyof BenchmarkDims, value: number) {
    setDims(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${id}/target`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dominance: dims.dominance,
          extraversion: dims.extraversion,
          patience: dims.patience,
          formality: dims.formality,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      showToast('Benchmark saved')
    } catch { showToast('Could not save', 'error') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 32px 96px' }}>

      {/* Back */}
      <Link href={`/dashboard/jobs/${id}`} style={{
        fontSize: 12, fontWeight: 500, color: '#9CA3AF', textDecoration: 'none',
        display: 'inline-block', marginBottom: 32, transition: 'color 180ms ease',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = '#6B7280')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
      >&larr; Back to position</Link>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>Benchmark Calibration</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: '#111827', margin: 0 }}>Role Benchmark</h1>
        {job && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{job.title} &middot; {job.client.name}</p>
            {aiLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, border: '1.5px solid rgba(37,99,235,0.2)', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#6B7280' }}>AI classifying role...</span>
              </div>
            )}
            {!aiLoading && aiRationale && (
              <span style={{ fontSize: 12, color: '#2563EB', fontWeight: 500 }}>
                AI-suggested &middot; {aiConfidence} confidence
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

        {/* LEFT: Dimensions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* AI rationale banner */}
          {aiRationale && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#2563EB" strokeWidth="1.5"/>
                <path d="M12 8v4M12 16h.01" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                <strong style={{ color: '#1D4ED8' }}>AI benchmark suggestion:</strong> {aiRationale}
              </p>
            </div>
          )}

          {/* Dimension sliders */}
          <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Benchmark dimensions</h2>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 28px' }}>
              {aiRationale ? 'AI-suggested targets. Adjust to fit your expectations.' : 'Set the behavioral expectations for strong performers in this role.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {DIMS.map(dim => {
                const val = dims[dim.key]
                const percentage = pct(val)
                return (
                  <div key={dim.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{dim.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB', minWidth: 36, textAlign: 'right' }}>{percentage}%</span>
                    </div>
                    <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: '#F3F4F6', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: '#2563EB', borderRadius: 4, transition: 'width 60ms ease' }} />
                      </div>
                      <input
                        type="range" min={0} max={1} step={0.01} value={val}
                        onChange={e => setDim(dim.key, parseFloat(e.target.value))}
                        style={{ position: 'absolute', left: 0, right: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 20, margin: 0 }}
                      />
                      <div style={{
                        position: 'absolute', left: `calc(${percentage}% - 9px)`,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#FFF', border: '2px solid #2563EB',
                        boxShadow: '0 1px 4px rgba(37,99,235,0.25)', pointerEvents: 'none',
                        transition: 'left 60ms ease',
                      }} />
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.5 }}>{dim.desc(val)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Internal notes</h2>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes about this benchmark — visible only to your team..."
              style={{
                width: '100%', height: 80, borderRadius: 8, border: '1px solid #D1D5DB',
                padding: '12px 16px', fontSize: 14, color: '#111827', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', transition: 'border-color 180ms ease', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#2563EB')}
              onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
            />
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={handleSave} disabled={saving} style={{
              height: 44, padding: '0 28px', borderRadius: 8,
              background: '#111827', color: '#FFF', fontSize: 14, fontWeight: 600,
              border: 'none', cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.5 : 1, transition: 'all 180ms ease',
            }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >{saving ? 'Saving...' : 'Save benchmark'}</button>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Refine after evaluating candidates.</span>
          </div>
        </div>

        {/* RIGHT: Live Model Panel — sticky */}
        <div style={{
          position: 'sticky', top: 32,
          background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12,
          padding: 24,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Benchmark shape</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 20px' }}>Updates as you adjust dimensions</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <FitModelLight scores={dims} size={280} animated />
          </div>

          {/* Dimension readout */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 12 }}>Active Benchmark</p>
            {DIMS.map(dim => (
              <div key={dim.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{dim.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 52, height: 4, borderRadius: 4, background: '#F3F4F6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct(dims[dim.key])}%`, background: '#2563EB', borderRadius: 4, transition: 'width 60ms ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 28, textAlign: 'right' }}>{pct(dims[dim.key])}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interpretation */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>Interpretation</p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#374151' }}>{interpret(dims)}</p>
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Model version 2.1', 'Mahalanobis distance scoring', 'Population-normed dimensions'].map(m => (
              <span key={m} style={{ fontSize: 11, color: '#D1D5DB' }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 900px) {
          [style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
          [style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  )
}
