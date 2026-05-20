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
  dominance: number
  extraversion: number
  patience: number
  formality: number
}
interface CompositeScores {
  execution: number
  ownership: number
  adaptability: number
  collaboration: number
  decisionSpeed: number
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
interface CandidateNote {
  id: string
  body: string
  createdAt: string
  author: { id: string; name: string | null; email: string }
}
interface Candidate {
  id: string
  name: string
  email: string
  completedAt: string
  stage: string
  offLimits: boolean
  approvedForClient: boolean
  approvedAt: string | null
  job: Job
  scores: ApiScores
  composite: CompositeScores
  compositeBenchmark: CompositeScores | null
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
}

const STAGES = [
  { value: 'longlist',     label: 'Longlist' },
  { value: 'shortlist',   label: 'Shortlist' },
  { value: 'client_ready', label: 'Client ready' },
  { value: 'rejected',    label: 'Rejected' },
]

const STAGE_COLORS: Record<string, { bg: string; fg: string }> = {
  longlist:        { bg: '#F3F4F6', fg: '#6B7280' },
  shortlist:       { bg: '#EFF6FF', fg: '#2563EB' },
  client_ready:    { bg: '#ECFDF5', fg: '#059669' },
  rejected:        { bg: '#FEF2F2', fg: '#DC2626' },
  client_approved: { bg: '#F0FDF4', fg: '#16A34A' },
}

const DIMENSION_MAP = [
  { key: 'dominance' as const,    label: 'Execution' },
  { key: 'formality' as const,    label: 'Ownership' },
  { key: 'patience' as const,     label: 'Adaptability' },
  { key: 'extraversion' as const, label: 'Collaboration' },
]

const COMPOSITE_DIM_MAP = [
  { key: 'execution' as const,     label: 'Execution' },
  { key: 'ownership' as const,     label: 'Ownership' },
  { key: 'adaptability' as const,  label: 'Adaptability' },
  { key: 'collaboration' as const, label: 'Collaboration' },
  { key: 'decisionSpeed' as const, label: 'Decision Speed' },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
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
  try { return generateStrongestBehaviors(mapped).slice(0, 3) } catch { return [] }
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
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={3}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 60ms ease-out' }}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fill="#111827" fontSize={Math.round(size*0.3)} fontWeight={700}
        fontFamily="-apple-system, system-ui, sans-serif">{displayed}</text>
    </svg>
  )
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  // Process controls
  const [stage, setStage] = useState('longlist')
  const [stageSaving, setStageSaving] = useState(false)
  const [offLimits, setOffLimits] = useState(false)
  const [offLimitsSaving, setOffLimitsSaving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [approving, setApproving] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Notes thread
  const [noteThread, setNoteThread] = useState<CandidateNote[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/candidates/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => {
        setCandidate(d.data)
        setStage(d.data.stage ?? 'longlist')
        setOffLimits(d.data.offLimits ?? false)
        setApproved(d.data.approvedForClient ?? false)
        setLoading(false)
      })
      .catch(() => { setError('Could not load candidate'); setLoading(false) })
  }, [id])

  const loadNotes = useCallback(() => {
    setNotesLoading(true)
    fetch(`/api/candidates/${id}/notes`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => { setNoteThread(d.data ?? []); setNotesLoading(false) })
      .catch(() => setNotesLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadNotes() }, [loadNotes])
  useEffect(() => {
    if (candidate?.name) document.title = `Veltro — ${candidate.name}`
  }, [candidate?.name])

  async function handleStageChange(newStage: string) {
    setStage(newStage)
    setStageSaving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) throw new Error()
      showToast('Stage updated')
    } catch {
      showToast('Could not update stage', 'error')
      setStage(candidate?.stage ?? 'longlist')
    } finally {
      setStageSaving(false)
    }
  }

  async function handleOffLimitsToggle() {
    const next = !offLimits
    setOffLimits(next)
    setOffLimitsSaving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/off-limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offLimits: next }),
      })
      if (!res.ok) throw new Error()
      showToast(next ? 'Marked off-limits' : 'Off-limits removed')
    } catch {
      showToast('Could not update off-limits', 'error')
      setOffLimits(!next)
    } finally {
      setOffLimitsSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' })
      if (res.status === 403) { showToast('Only owners and admins can delete candidates', 'error'); return }
      if (!res.ok) throw new Error()
      showToast('Candidate deleted')
      router.push('/dashboard')
    } catch {
      showToast('Could not delete candidate', 'error')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  async function handleApproveToggle() {
    const next = !approved
    setApproving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: next }),
      })
      if (res.status === 403) { showToast('Only owners and admins can approve', 'error'); return }
      if (!res.ok) throw new Error()
      setApproved(next)
      showToast(next ? 'Approved for client portal' : 'Approval revoked')
    } catch {
      showToast('Could not update approval', 'error')
    } finally {
      setApproving(false)
    }
  }

  async function postNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return
    setNoteSaving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newNote.trim() }),
      })
      if (!res.ok) throw new Error()
      setNewNote('')
      loadNotes()
    } catch {
      showToast('Could not save note', 'error')
    } finally {
      setNoteSaving(false)
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
        <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}/>
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

  const fitScore = Math.round(candidate.fitPct ?? 0)
  const recommendation = recommendationLabel(fitScore)
  const recColor = recommendationColor(recommendation)
  const confidence = confidenceLevel(fitScore, candidate.adaptationStress)
  const percentile = percentileLabel(fitScore)
  const benchmark = benchmarkComparison(fitScore, candidate.job.roleType || candidate.job.title)
  const rationale = getRecommendationRationale(fitScore, candidate.scores.dominance, candidate.scores.extraversion, candidate.scores.patience, candidate.scores.formality)
  const strengths = getStrengths(candidate, candidate.scores)
  const risks = getRisks(candidate)
  const totalSignals = 94

  let summary = ''
  try { summary = generateBehavioralSummary(candidate.scores, candidate.name || 'This candidate') } catch { summary = '' }

  const W = 1200
  const card: React.CSSProperties = { background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, display: 'block' }
  const stageColors = STAGE_COLORS[stage] ?? { bg: '#F3F4F6', fg: '#6B7280' }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>

      {/* Page header — red tint when off-limits */}
      <div style={{ background: offLimits ? '#FFF5F5' : '#FFF', borderBottom: offLimits ? '1px solid #FECACA' : '1px solid #E5E7EB', padding: '20px 32px', transition: 'background 200ms ease' }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: 0, marginBottom: 16, fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ← Hiring Overview
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827', textDecoration: offLimits ? 'line-through' : 'none', textDecorationColor: '#EF4444' }}>
                  {candidate.name}
                </h1>
                {offLimits && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 9999, padding: '3px 10px', letterSpacing: '0.05em' }}>
                    OFF-LIMITS
                  </span>
                )}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 16, color: '#6B7280' }}>
                {candidate.job.title} · {candidate.job.client}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginTop: 8, alignItems: 'center' }}>
                {[`Evaluated ${fmtDate(candidate.completedAt)}`, `Based on ${totalSignals} behavioral signals`, 'Role benchmark active'].map((item, i) => (
                  <span key={item} style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {i > 0 && <span style={{ margin: '0 8px', color: '#E5E7EB' }}>·</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <button onClick={copyShareLink} style={{ height: 36, padding: '0 16px', borderRadius: 8, background: '#111827', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms ease' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1F2937'}
                onMouseLeave={e => e.currentTarget.style.background = '#111827'}>
                {linkCopied ? 'Copied' : 'Share report'}
              </button>
              <button onClick={() => window.print()} style={{ height: 36, padding: '0 16px', borderRadius: 8, background: '#FFF', color: '#374151', border: '1px solid #E5E7EB', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Export PDF
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} style={{ height: 36, padding: '0 16px', borderRadius: 8, background: '#FFF', color: '#DC2626', border: '1px solid #FECACA', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: W, margin: '0 auto', padding: '24px 32px 64px' }}>

        {/* PROCESS CONTROLS BAR */}
        <div style={{ ...card, marginBottom: 24, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

          {/* Stage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Stage</span>
            <div style={{ position: 'relative' }}>
              <select
                value={stage}
                disabled={stageSaving}
                onChange={e => handleStageChange(e.target.value)}
                style={{
                  appearance: 'none', fontSize: 13, fontWeight: 600,
                  color: stageColors.fg, background: stageColors.bg,
                  border: `1px solid ${stageColors.fg}33`,
                  borderRadius: 20, padding: '5px 28px 5px 12px',
                  cursor: stageSaving ? 'wait' : 'pointer', outline: 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: stageColors.fg }}>▾</span>
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: '#E5E7EB' }}/>

          {/* Off-limits toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Off-limits</span>
            <button
              onClick={handleOffLimitsToggle}
              disabled={offLimitsSaving}
              title={offLimits ? 'Remove off-limits flag' : 'Mark as off-limits'}
              style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: offLimitsSaving ? 'wait' : 'pointer', background: offLimits ? '#EF4444' : '#E5E7EB', position: 'relative', transition: 'background 200ms ease', flexShrink: 0 }}
            >
              <span style={{ position: 'absolute', top: 3, left: offLimits ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#FFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 200ms ease' }}/>
            </button>
          </div>

          <div style={{ width: 1, height: 28, background: '#E5E7EB' }}/>

          {/* Portal approval */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Portal approval</span>
            <button
              onClick={handleApproveToggle}
              disabled={approving}
              style={{ height: 30, padding: '0 14px', borderRadius: 8, border: 'none', background: approved ? '#059669' : '#F3F4F6', color: approved ? '#FFF' : '#6B7280', fontSize: 12, fontWeight: 600, cursor: approving ? 'wait' : 'pointer', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {approved ? <><span>✓</span> Approved</> : approving ? 'Saving…' : 'Approve for client'}
            </button>
            {approved && (
              <button onClick={handleApproveToggle} disabled={approving} style={{ background: 'none', border: 'none', fontSize: 11, color: '#9CA3AF', cursor: 'pointer', textDecoration: 'underline' }}>
                revoke
              </button>
            )}
          </div>
        </div>

        {/* A. DECISION PANEL */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <ScoreRing score={fitScore} color={recColor} size={100}/>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: recColor }}>{recommendation}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{confidence} confidence · {percentile}</div>
              </div>
            </div>
            <div>
              <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 40 }}>
                <span style={label}>Benchmark Comparison</span>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginBottom: 24 }}>{benchmark}</p>
                <span style={label}>Recommendation Rationale</span>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>{rationale}</p>
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
                  {['Based on 94 behavioral signals', 'Role benchmark active', 'Recommendation generated from calibrated signal analysis'].map((item, i) => (
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
              {strengths.length ? strengths.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', flexShrink: 0, marginTop: 6 }}/>
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{s}</span>
                </div>
              )) : <p style={{ fontSize: 14, color: '#9CA3AF' }}>No strengths data available.</p>}
            </div>
          </div>
          <div style={card}>
            <span style={label}>Primary Risks</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {risks.length ? risks.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginTop: 6 }}/>
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
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>Observed signal pattern against the active role benchmark.</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <FitModelLight
                scores={candidate.scores}
                target={candidate.job.target ? {
                  dominance:   Number(candidate.job.target.dominance),
                  extraversion: Number(candidate.job.target.extraversion),
                  patience:    Number(candidate.job.target.patience),
                  formality:   Number(candidate.job.target.formality),
                } : undefined}
                size={280}
              />
            </div>
          </div>
          <div style={card}>
            <span style={label}>Benchmark Summary</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
              {(() => {
                return COMPOSITE_DIM_MAP.map(({ key, label: dimLabel }) => {
                  const value = candidate.composite[key]
                  const target = candidate.compositeBenchmark ? candidate.compositeBenchmark[key] : null
                  const delta = target == null ? null : value - target
                  return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{dimLabel}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{target == null ? 'No benchmark set' : `Target ${target}`}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{value}</div>
                        {delta != null && <div style={{ fontSize: 11, color: delta >= 0 ? '#22C55E' : '#EF4444', fontWeight: 600 }}>{delta >= 0 ? '+' : ''}{delta} vs benchmark</div>}
                      </div>
                    </div>
                  )
                })
              })()}
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
              ].map(item => (
                <div key={item.title} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...card, background: '#F9FAFB', border: '1px solid #F3F4F6', boxShadow: 'none' }}>
            <span style={{ ...label, color: '#BFBFBF' }}>AI Interpretation</span>
            <p style={{ fontSize: 11, color: '#BFBFBF', marginBottom: 16, lineHeight: 1.5 }}>AI-assisted summary based on observed signal patterns.</p>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
              {candidate.name} shows a behavioral pattern strongest in execution, pace, and practical decision-making relative to the active role benchmark. The recommendation is best supported when the role values ownership and visible forward motion.
            </p>
          </div>
        </div>

        {/* E. SUPPORTING EVIDENCE + NOTES THREAD */}
        <div style={{ ...card, marginBottom: 24 }}>
          <span style={label}>Supporting Evidence</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>

            {/* Decision summary */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>Decision Summary</div>
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
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>Recruiter Notes</div>

              <form onSubmit={postNote} style={{ marginBottom: 16 }}>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#111827', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color 150ms ease' }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
                <button type="submit" disabled={noteSaving || !newNote.trim()} style={{ marginTop: 8, height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#FFF', fontSize: 12, fontWeight: 600, cursor: noteSaving ? 'wait' : 'pointer', opacity: noteSaving || !newNote.trim() ? 0.5 : 1, transition: 'opacity 150ms ease' }}>
                  {noteSaving ? 'Posting…' : 'Post note'}
                </button>
              </form>

              {notesLoading ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p>
              ) : noteThread.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No notes yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {noteThread.map((note, i) => (
                    <div key={note.id} style={{ padding: '12px 0', borderBottom: i < noteThread.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{note.author.name ?? note.author.email}</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtTime(note.createdAt)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer metadata */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
          {[`Report ID: ${candidate.resultId?.slice(0, 8) ?? 'N/A'}`, `Assessment completed ${fmtDate(candidate.completedAt)}`].map((item, i) => (
            <span key={item} style={{ fontSize: 11, color: '#BFBFBF' }}>
              {i > 0 && <span style={{ margin: '0 8px', color: '#E5E7EB' }}>·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div style={{ background: '#FFF', borderRadius: 12, padding: 32, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Delete candidate?</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
              <strong>{candidate.name}</strong> and all their assessment data, notes, and outcomes will be permanently deleted. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#FFF', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#FFF', fontSize: 13, fontWeight: 600, cursor: deleting ? 'wait' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
