'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { showToast } from '@/app/components/Toast'
import { FitModelLight } from '@/app/components/FitModel'
import {
  generateStrongestBehaviors,
  generateBehavioralSummary,
} from '@/lib/behavioral-insights'
import { getRecommendationRationale } from '@/lib/scoring'

interface Scores {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}
interface ApiScores {
  execution: number
  collaboration: number
  adaptability: number
  ownership: number
}
interface Target {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}
interface Job {
  id: string
  title: string
  roleType: string
  client: string
  target: Target | null
}
interface Profile {
  name: string
  tagline: string
  group: string
  groupLabel: string
  description: string
  strengths: string[]
  traps: string[]
  bestRoles: string[]
  coords: Scores
}
interface InterviewQuestion {
  dimension: string
  direction: string
  gap: number
  questions: string[]
}
interface Candidate {
  id: string
  name: string
  email: string
  completedAt: string
  job: Job
  scores: ApiScores
  list1Scores: ApiScores
  percentiles: Record<string, number>
  profileName: string
  profileGroup: string
  profile: Profile
  secondaryProfile: Profile | null
  adaptationStress: number
  fitPct: number
  rushed: boolean
  interviewGuide: InterviewQuestion[]
  outcome: string | null
  list1Count: number
  list2Count: number
  resultId: string
  shareToken: string
  recruiterNotes: string
  stage: string
  offLimits: boolean
  approvedForClient: boolean
  approvedByUserId: string | null
  approvedAt: string | null
}

interface Note {
  id: string
  body: string
  createdAt: string
  authorName: string
}

const DIMENSION_MAP = [
  { key: 'dominance' as const, label: 'Execution' },
  { key: 'formality' as const, label: 'Ownership' },
  { key: 'patience' as const, label: 'Adaptability' },
  { key: 'extraversion' as const, label: 'Collaboration' },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return fmtDate(iso)
}

function recommendationLabel(fitPct: number): 'Strong Hire' | 'Proceed with Caution' | 'Do Not Hire' {
  if (fitPct >= 85) return 'Strong Hire'
  if (fitPct >= 70) return 'Proceed with Caution'
  return 'Do Not Hire'
}

function recommendationColor(rec: string): string {
  if (rec === 'Strong Hire') return '#22C55E'
  if (rec === 'Proceed with Caution') return '#EAB308'
  return '#EF4444'
}

function confidenceLevel(fitPct: number, adaptationStress: number): 'High' | 'Medium' | 'Low' {
  if (fitPct >= 85 && adaptationStress < 0.15) return 'High'
  if (fitPct >= 70 || adaptationStress < 0.25) return 'Medium'
  return 'Low'
}

function percentileLabel(fitPct: number): string {
  if (fitPct >= 90) return 'Top 10%'
  if (fitPct >= 82) return 'Top 18%'
  if (fitPct >= 75) return 'Top 25%'
  if (fitPct >= 65) return 'Top 40%'
  return 'Below top 40%'
}

function benchmarkComparison(fitPct: number, roleType: string): string {
  if (fitPct >= 85) return `Aligned with high-performing candidates in comparable ${roleType} roles.`
  if (fitPct >= 70) return `Moderate alignment with the active benchmark for ${roleType} roles.`
  return `Significant misalignment against the current benchmark for ${roleType} roles.`
}

function getStrengths(c: Candidate, mapped: Scores): string[] {
  const base = c.profile?.strengths?.slice(0, 3) ?? []
  if (base.length) return base
  try {
    return generateStrongestBehaviors(mapped).slice(0, 3)
  } catch {
    return []
  }
}

function getRisks(c: Candidate): string[] {
  return c.profile?.traps?.slice(0, 3) ?? []
}

function ScoreRing({ score, color, size = 100 }: { score: number; color: string; size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  const r = (size / 2) - 4
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t0 = performance.now()
    const duration = 500
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(eased * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 60ms ease-out' }}
      />
      <text
        x={size / 2} y={size / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill="#111827" fontSize={Math.round(size * 0.3)} fontWeight={700}
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        {displayed}
      </text>
    </svg>
  )
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: checked ? '#111827' : '#E5E7EB',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 150ms ease',
        flexShrink: 0, opacity: disabled ? 0.4 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: checked ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: '#FFF',
        transition: 'left 150ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  // Process controls state
  const [offLimits, setOffLimits] = useState(false)
  const [approvedForClient, setApprovedForClient] = useState(false)
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
  const [stage, setStage] = useState('longlist')
  const [controlsSaving, setControlsSaving] = useState(false)

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [noteBody, setNoteBody] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/candidates/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => {
        setCandidate(d.data)
        setOffLimits(d.data.offLimits ?? false)
        setApprovedForClient(d.data.approvedForClient ?? false)
        setApprovedAt(d.data.approvedAt ?? null)
        setStage(d.data.stage ?? 'longlist')
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load candidate')
        setLoading(false)
      })
  }, [id])

  const loadNotes = useCallback(() => {
    fetch(`/api/candidates/${id}/notes`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setNotes(d.data ?? []))
      .catch(() => {/* silent */})
  }, [id])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadNotes() }, [loadNotes])

  useEffect(() => {
    if (candidate?.name) document.title = `Veltro — ${candidate.name}`
  }, [candidate?.name])

  async function toggleOffLimits(value: boolean) {
    setOffLimits(value)
    setControlsSaving(true)
    try {
      await fetch(`/api/candidates/${id}/off-limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offLimits: value }),
      })
      showToast(value ? 'Marked off-limits' : 'Off-limits removed')
    } catch {
      setOffLimits(!value)
      showToast('Could not update off-limits status', 'error')
    } finally {
      setControlsSaving(false)
    }
  }

  async function toggleApproval(value: boolean) {
    setApprovedForClient(value)
    setControlsSaving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: value }),
      })
      const json = await res.json()
      setApprovedAt(json.data?.approvedAt ?? null)
      showToast(value ? 'Approved for client portal' : 'Approval removed')
    } catch {
      setApprovedForClient(!value)
      showToast('Could not update approval', 'error')
    } finally {
      setControlsSaving(false)
    }
  }

  async function changeStage(value: string) {
    const prev = stage
    setStage(value)
    setControlsSaving(true)
    try {
      await fetch(`/api/candidates/${id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: value }),
      })
      showToast('Stage updated')
      if (value !== 'client_ready' && approvedForClient) {
        setApprovedForClient(false)
      }
    } catch {
      setStage(prev)
      showToast('Could not update stage', 'error')
    } finally {
      setControlsSaving(false)
    }
  }

  async function submitNote() {
    if (!noteBody.trim()) return
    setNoteSubmitting(true)
    const optimisticNote: Note = {
      id: `tmp-${Date.now()}`,
      body: noteBody.trim(),
      createdAt: new Date().toISOString(),
      authorName: 'You',
    }
    setNotes(prev => [optimisticNote, ...prev])
    setNoteBody('')
    try {
      const res = await fetch(`/api/candidates/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: noteBody.trim() }),
      })
      const json = await res.json()
      if (json.data) {
        setNotes(prev => prev.map(n => n.id === optimisticNote.id ? json.data : n))
      }
    } catch {
      setNotes(prev => prev.filter(n => n.id !== optimisticNote.id))
      setNoteBody(optimisticNote.body)
      showToast('Could not save note', 'error')
    } finally {
      setNoteSubmitting(false)
    }
  }

  function copyShareLink() {
    if (!candidate) return
    const url = `${window.location.origin}/report/${candidate.shareToken}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    showToast('Share link copied')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F9FAFB' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: 96, textAlign: 'center' }}>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6B7280' }}>{error ?? 'Not found'}</p>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: '#111827', fontSize: 12, cursor: 'pointer' }}>
          Back to Hiring Overview
        </button>
      </div>
    )
  }

  const safeScores = {
    dominance: Number(candidate.scores.execution),
    extraversion: Number(candidate.scores.collaboration),
    patience: Number(candidate.scores.adaptability),
    formality: Number(candidate.scores.ownership),
  }

  const fitScore = Math.round(candidate.fitPct ?? 0)
  const recommendation = recommendationLabel(fitScore)
  const recColor = recommendationColor(recommendation)
  const confidence = confidenceLevel(fitScore, candidate.adaptationStress)
  const percentile = percentileLabel(fitScore)
  const benchmark = benchmarkComparison(fitScore, candidate.job.roleType || candidate.job.title)
  const rationale = getRecommendationRationale(
    fitScore,
    safeScores.dominance,
    safeScores.extraversion,
    safeScores.patience,
    safeScores.formality,
  )
  const strengths = getStrengths(candidate, safeScores)
  const risks = getRisks(candidate)
  const totalSignals = 94

  let summary = ''
  try { summary = generateBehavioralSummary(safeScores, candidate.name || 'This candidate') } catch { summary = '' }

  const W = 1200
  const card: React.CSSProperties = {
    background: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    padding: 24,
  }
  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    color: '#9CA3AF', textTransform: 'uppercase',
    marginBottom: 8, display: 'block',
  }

  const headerBg = offLimits ? '#FEF2F2' : '#FFF'
  const headerBorder = offLimits ? '1px solid #FECACA' : '1px solid #E5E7EB'

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>

      {/* Page header */}
      <div style={{ background: headerBg, borderBottom: headerBorder, padding: '20px 32px', transition: 'background 200ms ease, border-color 200ms ease' }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', padding: 0, marginBottom: 16, fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            ← Hiring Overview
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: offLimits ? '#EF4444' : '#111827', textDecoration: offLimits ? 'line-through' : 'none', transition: 'color 200ms ease' }}>
                {candidate.name}
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 16, color: '#6B7280' }}>
                {candidate.job.title} · {candidate.job.client}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginTop: 8, alignItems: 'center' }}>
                {[
                  `Evaluated ${fmtDate(candidate.completedAt)}`,
                  `Based on ${totalSignals} behavioral signals`,
                  'Role benchmark active',
                ].map((item, i) => (
                  <span key={item} style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {i > 0 && <span style={{ margin: '0 8px', color: '#E5E7EB' }}>·</span>}
                    {item}
                  </span>
                ))}
                {offLimits && (
                  <span style={{ marginLeft: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                    Off-limits
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={copyShareLink} style={{
                height: 36, padding: '0 16px', borderRadius: 8,
                background: '#111827', color: '#FFF',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#1F2937'}
                onMouseLeave={e => e.currentTarget.style.background = '#111827'}
              >
                {linkCopied ? 'Copied' : 'Share report'}
              </button>
              <button onClick={() => window.print()} style={{
                height: 36, padding: '0 16px', borderRadius: 8,
                background: '#FFF', color: '#374151',
                border: '1px solid #E5E7EB',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: W, margin: '0 auto', padding: '24px 32px 64px' }}>

        {/* PROCESS CONTROLS */}
        <div style={{ ...card, marginBottom: 24 }}>
          <span style={label}>Process Controls</span>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Stage selector */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 6 }}>Stage</div>
              <select
                value={stage}
                onChange={e => changeStage(e.target.value)}
                disabled={controlsSaving}
                style={{
                  fontSize: 14, fontWeight: 500, color: '#111827',
                  border: '1px solid #E5E7EB', borderRadius: 8,
                  padding: '6px 10px', background: '#FFF',
                  cursor: controlsSaving ? 'not-allowed' : 'pointer',
                  outline: 'none',
                }}
              >
                <option value="longlist">Longlist</option>
                <option value="shortlist">Shortlist</option>
                <option value="client_ready">Client Ready</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div style={{ width: 1, background: '#F3F4F6', alignSelf: 'stretch' }} />

            {/* Off-limits toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Toggle checked={offLimits} onChange={toggleOffLimits} disabled={controlsSaving} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: offLimits ? '#EF4444' : '#111827' }}>Off-limits</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Flag candidate as unavailable for this role</div>
              </div>
            </div>

            <div style={{ width: 1, background: '#F3F4F6', alignSelf: 'stretch' }} />

            {/* Approve for client toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ paddingTop: 2 }}>
                <Toggle
                  checked={approvedForClient}
                  onChange={toggleApproval}
                  disabled={controlsSaving || stage !== 'client_ready'}
                />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: approvedForClient ? '#22C55E' : '#111827', opacity: stage !== 'client_ready' ? 0.4 : 1 }}>
                  Approved for client
                </div>
                {stage !== 'client_ready' ? (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Only available when stage is Client Ready</div>
                ) : approvedForClient && approvedAt ? (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Approved {fmtDate(approvedAt)}</div>
                ) : (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Share candidate with client portal</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* A. DECISION PANEL */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <ScoreRing score={fitScore} color={recColor} size={100} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: recColor }}>{recommendation}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                  {confidence} confidence · {percentile}
                </div>
              </div>
            </div>

            <div>
              <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 40 }}>
                <span style={label}>Benchmark Comparison</span>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginBottom: 24 }}>
                  {benchmark}
                </p>

                <span style={label}>Recommendation Rationale</span>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>
                  {rationale}
                </p>

                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
                  {[
                    `Based on ${totalSignals} behavioral signals`,
                    'Role benchmark active',
                    'Recommendation generated from calibrated signal analysis',
                  ].map((item, i) => (
                    <span key={item} style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {i > 0 && <span style={{ margin: '0 8px', color: '#E5E7EB' }}>·</span>}
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B. STRENGTHS + RISKS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={card}>
            <span style={label}>Top Strengths</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {strengths.length ? strengths.map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{s}</span>
                </div>
              )) : <p style={{ fontSize: 14, color: '#9CA3AF' }}>No strengths data available.</p>}
            </div>
          </div>
          <div style={card}>
            <span style={label}>Primary Risks</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {risks.length ? risks.map((r) => (
                <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{r}</span>
                </div>
              )) : <p style={{ fontSize: 14, color: '#9CA3AF' }}>No risk data available.</p>}
            </div>
          </div>
        </div>

        {/* C. FIT MODEL + BENCHMARK SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, marginBottom: 24, alignItems: 'stretch' }}>
          <div style={card}>
            <span style={label}>Fit Model</span>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
              Observed signal pattern against the active role benchmark.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <FitModelLight
                scores={safeScores}
                target={candidate.job.target ? {
                  dominance: Number(candidate.job.target.dominance),
                  extraversion: Number(candidate.job.target.extraversion),
                  patience: Number(candidate.job.target.patience),
                  formality: Number(candidate.job.target.formality),
                } : undefined}
                size={280}
              />
            </div>
          </div>

          <div style={card}>
            <span style={label}>Benchmark Summary</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
              {DIMENSION_MAP.map(({ key, label: dimLabel }) => {
                const value = Math.round(safeScores[key] * 100)
                const target = candidate.job.target ? Math.round(Number(candidate.job.target[key]) * 100) : null
                const delta = target == null ? null : value - target
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{dimLabel}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        {target == null ? 'No benchmark set' : `Target ${target}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{value}</div>
                      {delta != null && (
                        <div style={{ fontSize: 11, color: delta >= 0 ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
                          {delta >= 0 ? '+' : ''}{delta} vs benchmark
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* D. RECOMMENDATION RATIONALE + AI INTERPRETATION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={card}>
            <span style={label}>Recommendation Rationale</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
              {[
                { title: 'Benchmark alignment', body: benchmark },
                { title: 'Observed strengths', body: strengths.join('. ') || 'Not available.' },
                { title: 'Risk conditions', body: risks.join('. ') || 'No material risk conditions identified.' },
              ].map((item) => (
                <div key={item.title} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, background: '#F9FAFB', border: '1px solid #F3F4F6', boxShadow: 'none' }}>
            <span style={{ ...label, color: '#BFBFBF' }}>AI Interpretation</span>
            <p style={{ fontSize: 11, color: '#BFBFBF', marginBottom: 16, lineHeight: 1.5 }}>
              AI-assisted summary based on observed signal patterns.
            </p>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
              {candidate.name} shows a behavioral pattern strongest in execution, pace, and practical decision-making relative to the active role benchmark. The recommendation is best supported when the role values ownership and visible forward motion. The main caution is fit in environments requiring slower consensus, heavier process discipline, or tighter behavioral consistency across contexts.
            </p>
          </div>
        </div>

        {/* E. SUPPORTING EVIDENCE + NOTES THREAD */}
        <div style={{ ...card, marginBottom: 24 }}>
          <span style={label}>Supporting Evidence</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>
                Decision Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(summary ? summary.split('. ').filter(Boolean).slice(0, 3) : strengths).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
                    <span style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 1 }}>—</span>
                    <span>{s.endsWith('.') ? s : s + '.'}</span>
                  </div>
                ))}
              </div>
              {candidate.adaptationStress > 0.2 && (
                <p style={{ marginTop: 16, fontSize: 13, color: '#B45309', lineHeight: 1.5, padding: '8px 12px', background: '#FFFBEB', borderRadius: 6 }}>
                  Behavioral adaptation detected. Response pattern diverged from self-expectation during evaluation.
                </p>
              )}
            </div>

            {/* Notes thread */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>
                Recruiter Notes
              </div>

              {/* Compose box */}
              <div style={{ marginBottom: 16 }}>
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      submitNote()
                    }
                  }}
                  placeholder="Add a note... (⌘↵ to submit)"
                  rows={3}
                  style={{
                    width: '100%', border: '1px solid #E5E7EB', borderRadius: 8,
                    padding: '10px 14px', fontSize: 14, color: '#111827',
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box', lineHeight: 1.6,
                    transition: 'border-color 150ms ease',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={submitNote}
                    disabled={noteSubmitting || !noteBody.trim()}
                    style={{
                      height: 32, padding: '0 14px', borderRadius: 8,
                      background: noteBody.trim() ? '#111827' : '#F3F4F6',
                      color: noteBody.trim() ? '#FFF' : '#9CA3AF',
                      fontSize: 12, fontWeight: 600, border: 'none',
                      cursor: noteBody.trim() ? 'pointer' : 'default',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {noteSubmitting ? 'Saving...' : 'Add note'}
                  </button>
                </div>
              </div>

              {/* Note thread — newest first */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
                {notes.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No notes yet.</p>
                ) : notes.map((note) => (
                  <div key={note.id} style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{note.authorName}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtRelative(note.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#111827', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{note.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer metadata */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
          {[
            `Report ID: ${candidate.resultId?.slice(0, 8) ?? 'N/A'}`,
            `Assessment completed ${fmtDate(candidate.completedAt)}`,
          ].map((item, i) => (
            <span key={item} style={{ fontSize: 11, color: '#BFBFBF' }}>
              {i > 0 && <span style={{ margin: '0 8px', color: '#E5E7EB' }}>·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
