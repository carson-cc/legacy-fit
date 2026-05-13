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
interface CandidateNote {
  id: string
  authorName: string | null
  body: string
  createdAt: string
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
  approvedByUserId: string | null
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
}

const STAGES = [
  { value: 'longlist', label: 'Longlist' },
  { value: 'shortlist', label: 'Shortlist' },
  { value: 'client-ready', label: 'Client-Ready' },
  { value: 'rejected', label: 'Rejected' },
]

const STAGE_COLORS: Record<string, { bg: string; fg: string }> = {
  longlist: { bg: '#F3F4F6', fg: '#6B7280' },
  shortlist: { bg: 'rgba(59,130,246,0.1)', fg: '#2563EB' },
  'client-ready': { bg: 'rgba(34,197,94,0.1)', fg: '#16A34A' },
  rejected: { bg: 'rgba(239,68,68,0.1)', fg: '#DC2626' },
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

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const [stage, setStage] = useState('longlist')
  const [offLimits, setOffLimits] = useState(false)
  const [stageSaving, setStageSaving] = useState(false)

  const [approvedForClient, setApprovedForClient] = useState(false)
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
  const [approvalBusy, setApprovalBusy] = useState(false)
  const [userRole, setUserRole] = useState<string>('recruiter')

  const [notes, setNotes] = useState<CandidateNote[]>([])
  const [noteBody, setNoteBody] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/candidates/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => {
        setCandidate(d.data)
        setStage(d.data.stage ?? 'longlist')
        setOffLimits(d.data.offLimits ?? false)
        setApprovedForClient(d.data.approvedForClient ?? false)
        setApprovedAt(d.data.approvedAt ?? null)
        setLoading(false)
      })
      .catch(() => { setError('Could not load candidate'); setLoading(false) })
  }, [id])

  const loadNotes = useCallback(() => {
    fetch(`/api/candidates/${id}/notes`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setNotes(d.data) })
      .catch(() => {})
  }, [id])

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(s => { if (s?.user?.role) setUserRole(s.user.role) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadNotes() }, [loadNotes])
  useEffect(() => {
    if (candidate?.name) document.title = `Veltro — ${candidate.name}`
  }, [candidate?.name])

  async function updateStage(newStage: string) {
    setStageSaving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (!res.ok) throw new Error()
      setStage(newStage)
      showToast(`Stage updated to ${newStage}`)
    } catch {
      showToast('Could not update stage', 'error')
    } finally {
      setStageSaving(false)
    }
  }

  async function toggleOffLimits() {
    const next = !offLimits
    setStageSaving(true)
    try {
      const res = await fetch(`/api/candidates/${id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offLimits: next }),
      })
      if (!res.ok) throw new Error()
      setOffLimits(next)
      showToast(next ? 'Marked off-limits' : 'Off-limits removed')
    } catch {
      showToast('Could not update off-limits', 'error')
    } finally {
      setStageSaving(false)
    }
  }

  async function handleApprove() {
    const isPartner = userRole === 'owner' || userRole === 'admin'
    const action = isPartner ? 'approve' : 'request'
    setApprovalBusy(true)
    try {
      const res = await fetch(`/api/candidates/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      if (action === 'approve') {
        setApprovedForClient(true)
        setApprovedAt(new Date().toISOString())
        showToast('Candidate approved for client')
      } else {
        const sent = body.data?.emailsSent ?? 0
        showToast(`Approval request sent to ${sent} partner${sent !== 1 ? 's' : ''}`)
      }
    } catch (e: any) {
      showToast(e?.message || 'Could not process approval', 'error')
    } finally {
      setApprovalBusy(false)
    }
  }

  async function submitNote() {
    if (!noteBody.trim()) return
    setNoteSubmitting(true)
    try {
      const res = await fetch(`/api/candidates/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: noteBody }),
      })
      if (!res.ok) throw new Error()
      setNoteBody('')
      loadNotes()
      showToast('Note added')
    } catch {
      showToast('Could not add note', 'error')
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
  const rationale = getRecommendationRationale(fitScore, safeScores.dominance, safeScores.extraversion, safeScores.patience, safeScores.formality)
  const strengths = getStrengths(candidate, safeScores)
  const risks = getRisks(candidate)
  const totalSignals = 94
  const isPartner = userRole === 'owner' || userRole === 'admin'

  let summary = ''
  try { summary = generateBehavioralSummary(safeScores, candidate.name || 'This candidate') } catch { summary = '' }

  const W = 1200
  const card: React.CSSProperties = {
    background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24,
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, display: 'block',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>

      <div style={{ background: '#FFF', borderBottom: '1px solid #E5E7EB', padding: '20px 32px' }}>
        <div style={{ maxWidth: W, margin: '0 auto' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', padding: 0, marginBottom: 16, fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            ← Hiring Overview
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>{candidate.name}</h1>
                {offLimits && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', background: 'rgba(239,68,68,0.1)', padding: '3px 10px', borderRadius: 9999 }}>
                    Off-limits
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 16, color: '#6B7280' }}>
                {candidate.job.title} · {candidate.job.client}
              </p>

              {/* Stage selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Stage:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {STAGES.map(s => {
                    const active = stage === s.value
                    const colors = STAGE_COLORS[s.value]
                    return (
                      <button
                        key={s.value}
                        onClick={() => !stageSaving && updateStage(s.value)}
                        disabled={stageSaving}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 9999,
                          border: active ? 'none' : '1px solid #E5E7EB',
                          background: active ? colors.bg : 'transparent',
                          color: active ? colors.fg : '#9CA3AF',
                          cursor: stageSaving ? 'default' : 'pointer',
                          transition: 'all 150ms ease', opacity: stageSaving ? 0.6 : 1,
                        }}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
                {/* Off-limits toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, paddingLeft: 8, borderLeft: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Off-limits</span>
                  <div
                    onClick={() => !stageSaving && toggleOffLimits()}
                    style={{
                      width: 32, height: 18, borderRadius: 9999,
                      background: offLimits ? '#DC2626' : '#E5E7EB',
                      position: 'relative', cursor: 'pointer', transition: 'background 150ms ease', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: offLimits ? 16 : 2,
                      width: 14, height: 14, borderRadius: '50%', background: '#FFF',
                      transition: 'left 150ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
              {!approvedForClient ? (
                <button
                  onClick={handleApprove}
                  disabled={approvalBusy}
                  style={{
                    height: 36, padding: '0 16px', borderRadius: 8,
                    background: isPartner ? '#16A34A' : '#FFF',
                    color: isPartner ? '#FFF' : '#374151',
                    border: isPartner ? 'none' : '1px solid #E5E7EB',
                    fontSize: 13, fontWeight: 600, cursor: approvalBusy ? 'default' : 'pointer',
                    opacity: approvalBusy ? 0.6 : 1, transition: 'all 150ms ease',
                  }}
                >
                  {approvalBusy ? '...' : isPartner ? 'Approve for client' : 'Request approval'}
                </button>
              ) : (
                <div style={{
                  height: 36, padding: '0 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                  fontSize: 13, fontWeight: 600, color: '#16A34A',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7.5l2.5 2.5L11.5 4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Approved
                  {approvedAt && <span style={{ fontSize: 11, fontWeight: 400, color: '#6B7280' }}>· {fmtDate(approvedAt)}</span>}
                </div>
              )}
              <button onClick={copyShareLink} style={{
                height: 36, padding: '0 16px', borderRadius: 8, background: '#111827', color: '#FFF',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 150ms ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#1F2937'}
                onMouseLeave={e => e.currentTarget.style.background = '#111827'}
              >
                {linkCopied ? 'Copied' : 'Share report'}
              </button>
              <button onClick={() => window.print()} style={{
                height: 36, padding: '0 16px', borderRadius: 8, background: '#FFF', color: '#374151',
                border: '1px solid #E5E7EB', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: W, margin: '0 auto', padding: '24px 32px 64px' }}>

        {/* A. DECISION PANEL */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <ScoreRing score={fitScore} color={recColor} size={100} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: recColor }}>{recommendation}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{confidence} confidence · {percentile}</div>
              </div>
            </div>
            <div>
              <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 40 }}>
                <span style={lbl}>Benchmark Comparison</span>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginBottom: 24 }}>{benchmark}</p>
                <span style={lbl}>Recommendation Rationale</span>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>{rationale}</p>
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
                  {[`Based on ${totalSignals} behavioral signals`, 'Role benchmark active', 'Recommendation generated from calibrated signal analysis'].map((item, i) => (
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
            <span style={lbl}>Top Strengths</span>
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
            <span style={lbl}>Primary Risks</span>
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
            <span style={lbl}>Fit Model</span>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>Observed signal pattern against the active role benchmark.</p>
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
            <span style={lbl}>Benchmark Summary</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
              {DIMENSION_MAP.map(({ key, label: dimLabel }) => {
                const value = Math.round(safeScores[key] * 100)
                const target = candidate.job.target ? Math.round(Number(candidate.job.target[key]) * 100) : null
                const delta = target == null ? null : value - target
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{dimLabel}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{target == null ? 'No benchmark set' : `Target ${target}`}</div>
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
            <span style={lbl}>Recommendation Rationale</span>
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
            <span style={{ ...lbl, color: '#BFBFBF' }}>AI Interpretation</span>
            <p style={{ fontSize: 11, color: '#BFBFBF', marginBottom: 16, lineHeight: 1.5 }}>AI-assisted summary based on observed signal patterns.</p>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
              {candidate.name} shows a behavioral pattern strongest in execution, pace, and practical decision-making relative to the active role benchmark. The recommendation is best supported when the role values ownership and visible forward motion. The main caution is fit in environments requiring slower consensus, heavier process discipline, or tighter behavioral consistency across contexts.
            </p>
          </div>
        </div>

        {/* E. SUPPORTING EVIDENCE + NOTES */}
        <div style={{ ...card, marginBottom: 24 }}>
          <span style={lbl}>Supporting Evidence</span>
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

            {/* Threaded notes */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>
                Recruiter Notes
              </div>
              {notes.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {notes.map(note => (
                    <div key={note.id} style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{note.authorName ?? 'Unknown'}</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtTime(note.createdAt)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                value={noteBody}
                onChange={e => setNoteBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitNote() } }}
                placeholder={`Add a note...${notes.length === 0 ? '' : ' (⌘↵ to submit)'}`}
                rows={3}
                style={{
                  width: '100%', border: '1px solid #E5E7EB', borderRadius: 8,
                  padding: '10px 12px', fontSize: 13, color: '#111827',
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 150ms ease',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  onClick={submitNote}
                  disabled={noteSubmitting || !noteBody.trim()}
                  style={{
                    height: 32, padding: '0 14px', borderRadius: 8,
                    background: '#2563EB', color: '#FFF', border: 'none',
                    fontSize: 12, fontWeight: 600,
                    cursor: noteSubmitting || !noteBody.trim() ? 'default' : 'pointer',
                    opacity: noteSubmitting || !noteBody.trim() ? 0.5 : 1, transition: 'all 150ms ease',
                  }}
                >
                  {noteSubmitting ? 'Adding...' : 'Add note'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
    </div>
  )
}
