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

type Pick = 0 | 1 | 2
type DimKey = 'dominance' | 'extraversion' | 'patience' | 'formality'

interface Respondent {
  id: string
  name: string
  picks: Record<DimKey, Pick>
}

/* ── Dimension config ────────────────────────────────────────────── */

const PICK_VALUES: [number, number, number] = [0.25, 0.50, 0.75]

const DIMS: {
  key: DimKey
  label: string
  options: [string, string, string]
}[] = [
  {
    key: 'dominance',
    label: 'Execution',
    options: [
      'Deliberate — builds consensus, team-led decisions',
      'Balanced — assertive when needed, collaborative by default',
      'Drives hard — pushes for results, expects ownership',
    ],
  },
  {
    key: 'formality',
    label: 'Ownership',
    options: [
      'Pragmatic — adapts process to situation, outcome-focused',
      'Structured — accountable without being rigid',
      'Disciplined — strong process orientation, high accountability',
    ],
  },
  {
    key: 'patience',
    label: 'Adaptability',
    options: [
      'Fast-paced — built for urgency and constant change',
      'Adaptable — handles change without losing effectiveness',
      'Methodical — thrives in stable, long-cycle environments',
    ],
  },
  {
    key: 'extraversion',
    label: 'Collaboration',
    options: [
      'Independent — task-driven, minimal social overhead needed',
      'Collaborative — works well with others, stays task-focused',
      'People-first — success through relationships and sustained alignment',
    ],
  },
]

type BenchmarkDims = { dominance: number; extraversion: number; patience: number; formality: number }

function defaultPicks(): Record<DimKey, Pick> {
  return { dominance: 1, extraversion: 1, patience: 1, formality: 1 }
}

function picksToValues(picks: Record<DimKey, Pick>): BenchmarkDims {
  return {
    dominance: PICK_VALUES[picks.dominance],
    extraversion: PICK_VALUES[picks.extraversion],
    patience: PICK_VALUES[picks.patience],
    formality: PICK_VALUES[picks.formality],
  }
}

function valuesToPicks(dims: BenchmarkDims): Record<DimKey, Pick> {
  function nearestPick(v: number): Pick {
    const dists = PICK_VALUES.map((p, i) => ({ i, d: Math.abs(v - p) }))
    return dists.sort((a, b) => a.d - b.d)[0].i as Pick
  }
  return {
    dominance: nearestPick(dims.dominance),
    extraversion: nearestPick(dims.extraversion),
    patience: nearestPick(dims.patience),
    formality: nearestPick(dims.formality),
  }
}

function averageDims(respondents: Respondent[]): BenchmarkDims {
  if (!respondents.length) return { dominance: 0.5, extraversion: 0.5, patience: 0.5, formality: 0.5 }
  const vals = respondents.map(r => picksToValues(r.picks))
  const n = vals.length
  return {
    dominance: vals.reduce((s, v) => s + v.dominance, 0) / n,
    extraversion: vals.reduce((s, v) => s + v.extraversion, 0) / n,
    patience: vals.reduce((s, v) => s + v.patience, 0) / n,
    formality: vals.reduce((s, v) => s + v.formality, 0) / n,
  }
}

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

let _idCounter = 0
function uid() { return `r-${++_idCounter}-${Date.now()}` }

/* ── Page ────────────────────────────────────────────────────────── */

export default function RoleBenchmarkPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [respondents, setRespondents] = useState<Respondent[]>([
    { id: uid(), name: 'You', picks: defaultPicks() },
  ])

  const [aiLoading, setAiLoading] = useState(false)
  const [aiRationale, setAiRationale] = useState('')
  const [aiConfidence, setAiConfidence] = useState('')
  const [aiApplied, setAiApplied] = useState(false)

  const benchmark = averageDims(respondents)

  // Detect divergence: any dimension where respondents disagree by more than 1 option
  const divergentDims: string[] = respondents.length > 1 ? DIMS.filter(d => {
    const vals = respondents.map(r => r.picks[d.key])
    return Math.max(...vals) - Math.min(...vals) > 1
  }).map(d => d.label) : []

  const fetchJob = useCallback(() => {
    setLoading(true)
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(d => {
        const j = d.data as Job
        setJob(j)
        if (j.target) {
          setNotes(j.target.notes ?? '')
          setRespondents([{ id: uid(), name: 'You', picks: valuesToPicks(j.target) }])
        }
        setLoading(false)
        if (!j.target && j.title) classifyRole(j.title)
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
        const aiPicks = valuesToPicks({ dominance: s.dominance, extraversion: s.extraversion, patience: s.patience, formality: s.formality })
        // Seed the first respondent's picks with AI values — don't add a separate AI respondent
        setRespondents(prev => prev.map((r, i) => i === 0 ? { ...r, picks: aiPicks } : r))
        setAiRationale(s.rationale)
        setAiConfidence(s.confidence)
        setAiApplied(true)
      }
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  function setPick(respondentId: string, key: DimKey, pick: Pick) {
    setRespondents(prev => prev.map(r =>
      r.id === respondentId ? { ...r, picks: { ...r.picks, [key]: pick } } : r
    ))
  }

  function addRespondent() {
    setRespondents(prev => [...prev, { id: uid(), name: '', picks: defaultPicks() }])
  }

  function removeRespondent(respondentId: string) {
    setRespondents(prev => prev.filter(r => r.id !== respondentId))
  }

  function setRespondentName(respondentId: string, name: string) {
    setRespondents(prev => prev.map(r => r.id === respondentId ? { ...r, name } : r))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/jobs/${id}/target`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...benchmark, notes: notes || null }),
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

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* AI rationale banner */}
          {aiApplied && aiRationale && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" stroke="#2563EB" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  <strong style={{ color: '#1D4ED8' }}>AI starting point applied.</strong> Adjust to match your intake call. {aiRationale}
                </p>
              </div>
              <button
                onClick={() => {
                  setRespondents(prev => prev.map((r, i) => i === 0 ? { ...r, picks: defaultPicks() } : r))
                  setAiApplied(false)
                  setAiRationale('')
                }}
                style={{ fontSize: 11, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px 4px' }}
              >Reset</button>
            </div>
          )}

          {/* Respondents */}
          {respondents.map((respondent, rIdx) => (
            <div key={respondent.id} style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28 }}>

              {/* Respondent header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#6B7280', flexShrink: 0,
                  }}>{rIdx + 1}</div>
                  {rIdx === 0 && respondents.length === 1 && respondent.name === 'You' ? (
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Your input</span>
                  ) : (
                    <input
                      value={respondent.name}
                      onChange={e => setRespondentName(respondent.id, e.target.value)}
                      placeholder="Name or role (e.g. Hiring Manager)"
                      style={{
                        fontSize: 14, fontWeight: 500, color: '#111827',
                        border: 'none', borderBottom: '1px solid #E5E7EB',
                        outline: 'none', background: 'transparent', padding: '2px 0',
                        width: 240,
                      }}
                      onFocus={e => (e.target.style.borderBottomColor = '#2563EB')}
                      onBlur={e => (e.target.style.borderBottomColor = '#E5E7EB')}
                    />
                  )}
                </div>
                {respondents.length > 1 && (
                  <button
                    onClick={() => removeRespondent(respondent.id)}
                    style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                  >Remove</button>
                )}
              </div>

              {/* Dimension pickers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {DIMS.map(dim => (
                  <div key={dim.key}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>{dim.label}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {dim.options.map((opt, optIdx) => {
                        const selected = respondent.picks[dim.key] === optIdx
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setPick(respondent.id, dim.key, optIdx as Pick)}
                            style={{
                              textAlign: 'left', padding: '12px 16px', borderRadius: 8,
                              border: selected ? '1.5px solid #2563EB' : '1px solid #E5E7EB',
                              background: selected ? 'rgba(37,99,235,0.04)' : '#FAFAFA',
                              cursor: 'pointer', transition: 'all 120ms ease',
                              display: 'flex', alignItems: 'center', gap: 12,
                            }}
                            onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#D1D5DB' }}
                            onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#E5E7EB' }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                              border: selected ? '2px solid #2563EB' : '2px solid #D1D5DB',
                              background: selected ? '#2563EB' : 'transparent',
                              transition: 'all 120ms ease',
                            }} />
                            <span style={{ fontSize: 13, color: selected ? '#1D4ED8' : '#374151', lineHeight: 1.4 }}>{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add respondent */}
          <button
            onClick={addRespondent}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
              border: '1.5px dashed #D1D5DB', borderRadius: 12, background: 'transparent',
              cursor: 'pointer', fontSize: 14, color: '#6B7280', transition: 'all 150ms ease',
              width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = '#374151' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#6B7280' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            Add another perspective
          </button>

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

          {/* Divergence warning */}
          {divergentDims.length > 0 && (
            <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                <strong>Input divergence on {divergentDims.join(', ')}.</strong> Respondents disagree — review before saving. The benchmark will average conflicting inputs.
              </p>
            </div>
          )}

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
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              {respondents.length > 1 ? `Synthesized from ${respondents.length} inputs` : 'Refine after evaluating candidates.'}
            </span>
          </div>
        </div>

        {/* RIGHT: Live Model Panel — sticky */}
        <div style={{
          position: 'sticky', top: 32,
          background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12,
          padding: 24,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Benchmark shape</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 20px' }}>
            {respondents.length > 1 ? `Synthesized from ${respondents.length} perspectives` : 'Updates as you select options'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <FitModelLight scores={benchmark} size={280} animated />
          </div>

          {/* Interpretation */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>What this means</p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#374151' }}>{interpret(benchmark)}</p>
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
