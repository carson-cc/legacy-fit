'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FitModelLight } from '@/app/components/FitModel'

interface Client { id: string; name: string }

interface BenchmarkDims {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

interface AISuggestion extends BenchmarkDims {
  roleType: string
  confidence: string
  rationale: string
}

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

function pct(v: number) { return Math.round(v * 100) }

export default function NewJobPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [aiError, setAiError] = useState('')
  const [aiTriggered, setAiTriggered] = useState(false)

  const [dims, setDims] = useState<BenchmarkDims>({
    dominance: 0.65,
    extraversion: 0.50,
    patience: 0.50,
    formality: 0.65,
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => {
        setClients(d.data || [])
        if (d.data?.length) setClientId(d.data[0].id)
        document.title = 'Veltro — Create Benchmark'
      })
  }, [])

  const classifyRole = useCallback(async (roleTitle: string) => {
    if (roleTitle.trim().length < 3) return
    setAiLoading(true)
    setAiError('')
    setAiTriggered(true)
    try {
      const res = await fetch('/api/classify-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleTitle }),
      })
      const data = await res.json()
      if (data.error) {
        setAiError(data.error)
        setAiLoading(false)
        return
      }
      const s = data.data as AISuggestion
      setAiSuggestion(s)
      setDims({
        dominance: s.dominance,
        extraversion: s.extraversion,
        patience: s.patience,
        formality: s.formality,
      })
    } catch {
      setAiError('Could not classify role. Set dimensions manually.')
    } finally {
      setAiLoading(false)
    }
  }, [])

  function handleTitleChange(value: string) {
    setTitle(value)
    setAiSuggestion(null)
    setAiError('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => classifyRole(value), 500)
    }
  }

  function setDim(key: keyof BenchmarkDims, value: number) {
    setDims(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !clientId) return
    setSaving(true)
    setError('')
    try {
      // Step 1: Create job
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          roleType: aiSuggestion?.roleType || title.trim(),
          clientId,
        }),
      })
      const jobData = await jobRes.json()
      if (jobData.error) throw new Error(jobData.error)
      const jobId = jobData.data.id

      // Step 2: Save benchmark target
      await fetch(`/api/jobs/${jobId}/target`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dominance: dims.dominance,
          extraversion: dims.extraversion,
          patience: dims.patience,
          formality: dims.formality,
          notes: aiSuggestion?.rationale || null,
        }),
      })

      setSuccess(true)
      setTimeout(() => router.push(`/dashboard/jobs/${jobId}`), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create benchmark')
      setSaving(false)
    }
  }

  const liveScores = dims

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F9FAFB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22C55E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'popIn 300ms ease-out both',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Benchmark created</h2>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Redirecting to your role...</p>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Page header */}
      <div style={{
        background: '#FFF', borderBottom: '1px solid #E5E7EB',
        padding: '20px 32px',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Link href="/dashboard" style={{
            fontSize: 12, fontWeight: 500, color: '#9CA3AF',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
            marginBottom: 12,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6B7280')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
          >
            &larr; Hiring Overview
          </Link>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', margin: '0 0 4px' }}>Role Setup</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Create Role Benchmark</h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>Define the behavioral target used to evaluate every candidate for this role.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 32px 96px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Role + Client */}
              <div style={{
                background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                {error && (
                  <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 20, border: '1px solid #FECACA' }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    What role are you evaluating for?
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={title}
                      onChange={e => handleTitleChange(e.target.value)}
                      placeholder="e.g. VP of Operations, Superintendent Chicago, Sales Manager..."
                      required
                      style={{
                        height: 48, width: '100%', borderRadius: 8,
                        border: '1.5px solid #D1D5DB', background: '#FFF',
                        padding: '0 44px 0 16px', fontSize: 15, color: '#111827',
                        outline: 'none', fontFamily: 'inherit',
                        transition: 'border-color 180ms ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#2563EB')}
                      onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                    />
                    {aiLoading && (
                      <div style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        width: 16, height: 16, border: '2px solid rgba(37,99,235,0.2)',
                        borderTopColor: '#2563EB', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                    )}
                    {aiSuggestion && !aiLoading && (
                      <div style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        width: 16, height: 16, borderRadius: '50%',
                        background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22C55E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5.5l2.5 2.5L8 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* AI suggestion banner */}
                  {aiTriggered && !aiLoading && aiSuggestion && (
                    <div style={{
                      marginTop: 10, padding: '10px 14px',
                      background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)',
                      borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10" stroke="#2563EB" strokeWidth="1.5"/>
                        <path d="M12 8v4M12 16h.01" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, color: '#1D4ED8', fontWeight: 500 }}>
                          AI classified as <strong>{aiSuggestion.roleType}</strong> &middot; {aiSuggestion.confidence} confidence
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                          {aiSuggestion.rationale}
                        </p>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                      {aiError} Adjust sliders manually below.
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Client account
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={clientId}
                      onChange={e => setClientId(e.target.value)}
                      required
                      style={{
                        height: 44, width: '100%', borderRadius: 8,
                        border: '1.5px solid #D1D5DB', background: '#FFF',
                        padding: '0 40px 0 16px', fontSize: 14, color: '#374151',
                        outline: 'none', cursor: 'pointer', appearance: 'none',
                        fontFamily: 'inherit', transition: 'border-color 180ms ease',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#2563EB')}
                      onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dimension sliders */}
              <div style={{
                background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Benchmark dimensions</h2>
                  <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                    {aiSuggestion ? 'AI-suggested targets. Adjust to match your expectations for this role.' : 'Set the behavioral expectations for strong performers in this role.'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {DIMS.map(dim => {
                    const val = dims[dim.key]
                    const percentage = pct(val)
                    const trackColor = percentage >= 70 ? '#2563EB' : percentage >= 40 ? '#2563EB' : '#2563EB'
                    return (
                      <div key={dim.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{dim.label}</span>
                          <span style={{
                            fontSize: 13, fontWeight: 700, color: '#2563EB',
                            minWidth: 36, textAlign: 'right',
                          }}>{percentage}%</span>
                        </div>

                        {/* Slider */}
                        <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            position: 'absolute', left: 0, right: 0, height: 4,
                            background: '#F3F4F6', borderRadius: 4,
                          }}>
                            <div style={{
                              height: '100%', width: `${percentage}%`,
                              background: trackColor, borderRadius: 4,
                              transition: 'width 60ms ease',
                            }} />
                          </div>
                          <input
                            type="range"
                            min={0} max={1} step={0.01}
                            value={val}
                            onChange={e => setDim(dim.key, parseFloat(e.target.value))}
                            style={{
                              position: 'absolute', left: 0, right: 0,
                              width: '100%', opacity: 0, cursor: 'pointer', height: 20,
                              margin: 0,
                            }}
                          />
                          {/* Thumb visual */}
                          <div style={{
                            position: 'absolute',
                            left: `calc(${percentage}% - 9px)`,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#FFF', border: '2px solid #2563EB',
                            boxShadow: '0 1px 4px rgba(37,99,235,0.25)',
                            pointerEvents: 'none',
                            transition: 'left 60ms ease',
                          }} />
                        </div>

                        <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.5 }}>
                          {dim.desc(val)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <p style={{ fontSize: 11, color: '#D1D5DB', marginTop: 24 }}>
                  This benchmark is applied to every candidate evaluated for this role.
                </p>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !clientId}
                  style={{
                    height: 44, padding: '0 28px', borderRadius: 8,
                    background: (!title.trim() || !clientId) ? '#E5E7EB' : '#111827',
                    color: (!title.trim() || !clientId) ? '#9CA3AF' : '#FFF',
                    fontSize: 14, fontWeight: 600, border: 'none',
                    cursor: (saving || !title.trim() || !clientId) ? 'not-allowed' : 'pointer',
                    transition: 'all 180ms ease',
                    boxShadow: (!title.trim() || !clientId) ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                  }}
                  onMouseEnter={e => {
                    if (title.trim() && clientId && !saving) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = (!title.trim() || !clientId) ? 'none' : '0 1px 2px rgba(0,0,0,0.08)'
                  }}
                >
                  {saving ? 'Creating...' : 'Create benchmark'}
                </button>
                {!title.trim() && (
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Enter a role title to continue</span>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN — Live FitModel preview (sticky) */}
            <div style={{
              position: 'sticky', top: 24,
              background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>Benchmark shape</h2>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 20px' }}>Updates as you adjust dimensions</p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <FitModelLight scores={liveScores} size={280} animated />
              </div>

              {/* Dimension readout */}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                {DIMS.map(dim => (
                  <div key={dim.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{dim.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 52, height: 4, borderRadius: 4, background: '#F3F4F6', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct(dims[dim.key])}%`,
                          background: '#2563EB', borderRadius: 4,
                          transition: 'width 60ms ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', minWidth: 28, textAlign: 'right' }}>
                        {pct(dims[dim.key])}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI rationale */}
              {aiSuggestion?.rationale && (
                <div style={{
                  marginTop: 16, padding: '10px 12px',
                  background: '#F9FAFB', borderRadius: 8,
                  borderLeft: '2px solid #2563EB',
                }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{aiSuggestion.rationale}</p>
                </div>
              )}

              <p style={{ margin: '16px 0 0', fontSize: 11, color: '#D1D5DB', lineHeight: 1.5 }}>
                This benchmark will be applied to every candidate evaluated for this role.
              </p>
            </div>
          </div>
        </form>
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
