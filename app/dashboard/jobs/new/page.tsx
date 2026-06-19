'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FitModelLight, deriveFitModelAxes } from '@/app/components/FitModel'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { inferRoleType } from '@/lib/role-inference'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client { id: string; name: string }

interface DisplayDims {
  execution: number
  ownership: number
  adaptability: number
  collaboration: number
  decisionSpeed: number
}

interface BaseDims {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

interface EnvSignals {
  decisionEnv: 'autonomous' | 'consensus' | null
  pace: 'fast' | 'methodical' | null
  roleStage: 'building' | 'running' | null
  peopleScope: 'team' | 'ic' | null
}

type Stage = 'brief' | 'generating' | 'review' | 'success'
type Confidence = 'High' | 'Medium' | 'Low'

interface DetectedSignal {
  text: string
  category: 'Environment' | 'Structure' | 'Role expectations'
  pillKey?: keyof EnvSignals
  pillValue?: string
}

// ─── Dimension config ─────────────────────────────────────────────────────────

const DIM_CONFIG: Record<keyof DisplayDims, { label: string; left: string; right: string }> = {
  execution:     { label: 'Execution',      left: 'waits for alignment',   right: 'acts independently' },
  ownership:     { label: 'Ownership',      left: 'shares responsibility', right: 'owns outcomes' },
  adaptability:  { label: 'Adaptability',   left: 'prefers stability',     right: 'adjusts fluidly' },
  collaboration: { label: 'Collaboration',  left: 'works independently',   right: 'builds through others' },
  decisionSpeed: { label: 'Decision Speed', left: 'decides carefully',     right: 'decides quickly' },
}

const DIM_KEYS: (keyof DisplayDims)[] = ['execution', 'ownership', 'adaptability', 'collaboration', 'decisionSpeed']

// ─── Environment pill config ──────────────────────────────────────────────────

const ENV_ROWS: Array<{ key: keyof EnvSignals; label: string; options: Array<{ value: string; label: string }> }> = [
  { key: 'decisionEnv',  label: 'Decision environment', options: [{ value: 'autonomous', label: 'Autonomous scope' }, { value: 'consensus', label: 'Consensus-driven org' }] },
  { key: 'pace',         label: 'Operating pace',       options: [{ value: 'fast', label: 'Fast-moving' }, { value: 'methodical', label: 'Methodical' }] },
  { key: 'roleStage',    label: 'Role stage',           options: [{ value: 'building', label: 'Building from scratch' }, { value: 'running', label: 'Running established op' }] },
  { key: 'peopleScope',  label: 'People scope',         options: [{ value: 'team', label: 'Manages a team' }, { value: 'ic', label: 'Individual contributor' }] },
]

// ─── Signal detection rules ───────────────────────────────────────────────────

interface SignalRule {
  patterns: RegExp[]
  text: string
  category: DetectedSignal['category']
  pillKey?: keyof EnvSignals
  pillValue?: string
}

const SIGNAL_RULES: SignalRule[] = [
  { patterns: [/\bfast[\s-]?moving\b/i, /\brapid\b/i, /\bpace\b/i, /\burgent\b/i, /\bfast\b/i], text: 'Fast-moving environment', category: 'Environment', pillKey: 'pace', pillValue: 'fast' },
  { patterns: [/\bPE[\s-]backed\b/i, /\bprivate equity\b/i, /\boperating partner\b/i, /\bsponsor\b/i], text: 'PE-backed context', category: 'Environment' },
  { patterns: [/\bboard\b/i, /\binvestors?\b/i], text: 'Board-level exposure required', category: 'Environment' },
  { patterns: [/\bfrom scratch\b/i, /\bbuild.{0,20}(team|function|org)\b/i, /\bno (team|systems|playbook)\b/i, /\bgreen.?field\b/i], text: 'Building from scratch', category: 'Environment', pillKey: 'roleStage', pillValue: 'building' },
  { patterns: [/\bturnaround\b/i, /\brestructur\b/i, /\bfix.{0,10}function\b/i], text: 'Turnaround context', category: 'Environment', pillKey: 'roleStage', pillValue: 'building' },
  { patterns: [/\bscale\b/i, /\bgrowth\b/i, /\bexpand\b/i], text: 'Growth or scale environment', category: 'Environment' },
  { patterns: [/\bmethodical\b/i, /\bsystematic\b/i, /\bdeliberate\b/i], text: 'Process-oriented environment', category: 'Environment', pillKey: 'pace', pillValue: 'methodical' },
  { patterns: [/\breports (directly )?to\b/i, /\bdirect (report|line)\b/i, /\breporting (line|to)\b/i], text: 'Direct reporting line identified', category: 'Structure' },
  { patterns: [/\bstakeholder[s]?\b/i, /\bcross.functional\b/i], text: 'Stakeholder complexity present', category: 'Structure' },
  { patterns: [/\balignment\b/i, /\bconsensus\b/i, /\bbuy.?in\b/i, /\bconsult\b/i], text: 'Consensus or alignment dynamic', category: 'Structure', pillKey: 'decisionEnv', pillValue: 'consensus' },
  { patterns: [/\bclear mandate\b/i, /\bautonomous\b/i, /\bbriefed not consulted\b/i, /\blow tolerance\b/i, /\bno tolerance\b/i], text: 'Autonomous decision environment', category: 'Structure', pillKey: 'decisionEnv', pillValue: 'autonomous' },
  { patterns: [/\bdirectly to.{3,30}(CEO|COO|President|partner|founder)/i], text: 'Single direct decision-maker', category: 'Structure' },
  { patterns: [/\bownership\b/i, /\baccountabl\b/i, /\bowns\b/i], text: 'High ownership expectations', category: 'Role expectations' },
  { patterns: [/\bambiguit\b/i, /\buncertain\b/i], text: 'Low tolerance for ambiguity', category: 'Role expectations' },
  { patterns: [/\bfailure\b/i, /\bwould fail\b/i, /\bstruggle\b/i, /\bwouldn.t work\b/i], text: 'Failure condition defined', category: 'Role expectations' },
  { patterns: [/\bdeliver\b/i, /\bexecute\b/i, /\bdriv(e|ing) (result|outcome)\b/i], text: 'Execution and delivery focused', category: 'Role expectations' },
]

const CONFLICT_RULES: Array<{ a: RegExp[]; b: RegExp[]; message: string }> = [
  {
    a: [/\bfast[\s-]?moving\b/i, /\brapid\b/i, /\burgent\b/i],
    b: [/\bconsensus\b/i, /\balignment\b/i, /\bconsult\b/i],
    message: 'Mixed signals — role may require balancing speed and alignment',
  },
  {
    a: [/\bautonomous\b/i, /\bclear mandate\b/i, /\bbriefed not consulted\b/i],
    b: [/\bstakeholder[s]?\b/i, /\bcross.functional\b/i, /\bmultiple\b/i],
    message: 'Autonomous environment with high stakeholder complexity — clarify decision structure',
  },
]

const GEN_PHASES = [
  'Interpreting role context…',
  'Mapping behavioral dimensions…',
  'Constructing benchmark profile…',
]

const EXAMPLE_BRIEF = `PE-backed CFO at a $200M construction platform. Reports directly to the operating partner. Needs to build the finance function from scratch — no team, no systems, no playbook. Board exposure required. The operating partner runs tight: clear mandates, low tolerance for ambiguity, expects to be briefed not consulted before decisions. Success in year one means a clean close process and functional FP&A. Failure looks like someone who needs alignment before acting.`

// ─── Signal detection ─────────────────────────────────────────────────────────

function detectSignals(text: string): DetectedSignal[] {
  if (!text || text.length < 10) return []
  const seen = new Set<string>()
  const results: DetectedSignal[] = []
  for (const rule of SIGNAL_RULES) {
    if (seen.has(rule.text)) continue
    if (rule.patterns.some(p => p.test(text))) {
      seen.add(rule.text)
      results.push({ text: rule.text, category: rule.category, pillKey: rule.pillKey, pillValue: rule.pillValue })
    }
  }
  return results
}

function detectConflict(text: string): string | null {
  for (const rule of CONFLICT_RULES) {
    const hasA = rule.a.some(p => p.test(text))
    const hasB = rule.b.some(p => p.test(text))
    if (hasA && hasB) return rule.message
  }
  return null
}

function getConfidence(signals: DetectedSignal[]): Confidence {
  const cats = new Set(signals.map(s => s.category))
  if (signals.length >= 5 && cats.size >= 2) return 'High'
  if (signals.length >= 2) return 'Medium'
  return 'Low'
}

function buildRoleSummary(signals: DetectedSignal[]): string {
  if (signals.length < 2) return ''
  const has = (t: string) => signals.some(s => s.text.toLowerCase().includes(t.toLowerCase()))
  const hasFast    = has('Fast-moving')
  const hasOwn     = has('ownership')
  const hasAuto    = has('Autonomous')
  const hasBuild   = has('Building') || has('Turnaround')
  const hasConsens = has('Consensus')
  const hasBoard   = has('Board')
  const hasScale   = has('scale')

  if (hasOwn && hasFast && hasAuto)  return 'Execution-heavy role with high ownership and low consensus tolerance'
  if (hasBuild && hasOwn && hasAuto) return 'Builder role requiring ownership, decisiveness, and self-direction'
  if (hasBuild && hasOwn)            return 'Builder role requiring high ownership and personal accountability'
  if (hasOwn && hasFast)             return 'High-execution role with strong ownership expectations'
  if (hasConsens && hasBoard)        return 'Stakeholder-facing role requiring alignment and board presence'
  if (hasScale && hasAuto)           return 'Growth-stage role requiring autonomous execution'
  if (hasAuto)                       return 'Autonomous operator role with independent decision-making'
  if (hasBuild)                      return 'Building context — requires ownership and adaptability'
  if (hasOwn)                        return 'High accountability role with strong ownership expectations'
  if (hasFast)                       return 'Fast-moving environment — execution and decisiveness required'
  return 'Role signal detected'
}

function buildNudges(signals: DetectedSignal[], text: string): string[] {
  if (text.length < 40) return []
  const nudges: string[] = []
  const hasReporting = signals.some(s => s.text.includes('reporting') || s.text.includes('Reporting') || s.text.includes('decision-maker'))
  const hasEnv = signals.some(s => s.category === 'Environment')
  const hasFailure = signals.some(s => s.text.includes('Failure') || s.text.includes('failure')) || /fail/i.test(text)
  if (!hasReporting && text.length > 40) nudges.push('Consider adding who this role reports to')
  if (!hasEnv && text.length > 60) nudges.push('Add context about pace or decision environment')
  if (!hasFailure && text.length > 80) nudges.push('Where would someone struggle in this role?')
  return nudges.slice(0, 2)
}

// ─── Dimension inverse mapping ────────────────────────────────────────────────

function dimsToBase(d: DisplayDims): BaseDims {
  const e = d.execution / 100
  const o = d.ownership / 100
  const c = d.collaboration / 100
  const s = d.decisionSpeed / 100
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  const dominance    = clamp(e * 0.45 + s * 0.35 + o * 0.20)
  const patSpeed     = clamp(1 - (s - dominance * 0.54) / 0.46)
  const patOwn       = clamp((o - dominance * 0.72) / 0.28)
  const patience     = clamp(patSpeed * 0.55 + patOwn * 0.45)
  const formality    = clamp((e - dominance * 0.58) / 0.42)
  const extraversion = clamp((c - patience * 0.32) / 0.68)
  return { dominance, extraversion, patience, formality }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const router = useRouter()

  const [stage, setStage]     = useState<Stage>('brief')
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [brief, setBrief]     = useState('')
  const [envSignals, setEnvSignals] = useState<EnvSignals>({ decisionEnv: null, pace: null, roleStage: null, peopleScope: null })

  const [exampleActive, setExampleActive] = useState(false)
  const [exampleHighlight, setExampleHighlight] = useState(false)

  const [genPhase, setGenPhase]         = useState(0)
  const [showGenPentagon, setShowGenPentagon] = useState(false)
  const [apiResolved, setApiResolved]   = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  const [aiSummary, setAiSummary]       = useState('')
  const [aiDims, setAiDims]             = useState<DisplayDims | null>(null)
  const [aiExplanations, setAiExplanations] = useState<Partial<Record<keyof DisplayDims, string>>>({})
  const [currentDims, setCurrentDims]   = useState<DisplayDims | null>(null)
  const [visibleRows, setVisibleRows]   = useState(0)

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load clients
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => {
        setClients(d.data || [])
        if (d.data?.length) setClientId(d.data[0].id)
        document.title = 'Veltro — Create Benchmark'
      })
  }, [])

  // Generation timing
  useEffect(() => {
    if (stage !== 'generating') return
    setGenPhase(0)
    setShowGenPentagon(false)
    setApiResolved(false)
    setMinTimeElapsed(false)
    const t1 = setTimeout(() => setGenPhase(1), 1100)
    const t2 = setTimeout(() => setGenPhase(2), 2200)
    const t3 = setTimeout(() => setShowGenPentagon(true), 2600)
    const t4 = setTimeout(() => setMinTimeElapsed(true), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [stage])

  // Transition to review
  useEffect(() => {
    if (apiResolved && minTimeElapsed && stage === 'generating') {
      setVisibleRows(0)
      setStage('review')
    }
  }, [apiResolved, minTimeElapsed, stage])

  // Sequential row reveal in review
  useEffect(() => {
    if (stage !== 'review') return
    setVisibleRows(0)
    const timers = DIM_KEYS.map((_, i) =>
      setTimeout(() => setVisibleRows(v => Math.max(v, i + 1)), i * 90 + 120)
    )
    return () => timers.forEach(clearTimeout)
  }, [stage])

  // Derived: signal intelligence
  const signals = useMemo(() => detectSignals(brief), [brief])
  const signalsByCategory = useMemo(() => {
    const map: Partial<Record<DetectedSignal['category'], DetectedSignal[]>> = {}
    for (const s of signals) {
      if (!map[s.category]) map[s.category] = []
      map[s.category]!.push(s)
    }
    return map
  }, [signals])
  const confidence = useMemo(() => getConfidence(signals), [signals])
  const conflictWarning = useMemo(() => detectConflict(brief), [brief])
  const nudges = useMemo(() => buildNudges(signals, brief), [signals, brief])
  const roleSummary = useMemo(() => buildRoleSummary(signals), [signals])

  const suggestedPills = useMemo(() => {
    const map = new Map<keyof EnvSignals, string>()
    for (const s of signals) {
      if (s.pillKey && s.pillValue && !map.has(s.pillKey)) {
        map.set(s.pillKey, s.pillValue)
      }
    }
    return map
  }, [signals])

  const showSignalPanel = brief.length > 50 || signals.length >= 2
  const showEnvSection  = brief.length > 60 || confidence !== 'Low'

  const baseDims = useMemo<BaseDims>(() => {
    if (!currentDims) return { dominance: 0.65, extraversion: 0.50, patience: 0.50, formality: 0.65 }
    return dimsToBase(currentDims)
  }, [currentDims])

  const closestArchetypes = useMemo(() => {
    if (!currentDims) return []
    const t = deriveFitModelAxes(baseDims)
    return REFERENCE_PROFILES
      .map(p => {
        const a = deriveFitModelAxes(p.coords)
        const dist = Math.sqrt(
          Math.pow(t.execution - a.execution, 2) + Math.pow(t.ownership - a.ownership, 2) +
          Math.pow(t.adaptability - a.adaptability, 2) + Math.pow(t.collaboration - a.collaboration, 2) +
          Math.pow(t.decisionSpeed - a.decisionSpeed, 2)
        )
        return { profile: p, dist }
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2)
      .map(d => d.profile)
  }, [baseDims])

  const canGenerate = roleTitle.trim().length >= 1 && brief.trim().length >= 50

  // Generate
  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return
    setError('')
    setStage('generating')
    const clientName = clients.find(c => c.id === clientId)?.name || ''
    try {
      const res = await fetch('/api/generate-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleTitle: roleTitle.trim(), clientName, brief: brief.trim(), environmentSignals: envSignals }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const dims: DisplayDims = {
        execution: data.data.dimensions.execution.value, ownership: data.data.dimensions.ownership.value,
        adaptability: data.data.dimensions.adaptability.value, collaboration: data.data.dimensions.collaboration.value,
        decisionSpeed: data.data.dimensions.decisionSpeed.value,
      }
      setAiSummary(data.data.summary)
      setAiDims(dims)
      setCurrentDims(dims)
      setAiExplanations({
        execution: data.data.dimensions.execution.explanation, ownership: data.data.dimensions.ownership.explanation,
        adaptability: data.data.dimensions.adaptability.explanation, collaboration: data.data.dimensions.collaboration.explanation,
        decisionSpeed: data.data.dimensions.decisionSpeed.explanation,
      })
      setApiResolved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Try again.')
      setStage('brief')
    }
  }, [canGenerate, clients, clientId, roleTitle, brief, envSignals])

  // Save
  async function handleSubmit() {
    if (!currentDims || saving) return
    setSaving(true)
    setError('')
    try {
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: roleTitle.trim(), roleType: inferRoleType(roleTitle), clientId }),
      })
      const jobData = await jobRes.json()
      if (jobData.error) throw new Error(jobData.error)
      const jobId = jobData.data.id
      await fetch(`/api/jobs/${jobId}/target`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseDims, notes: aiSummary || null }),
      })
      setStage('success')
      setTimeout(() => router.push(`/dashboard/jobs/${jobId}`), 1400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save benchmark')
      setSaving(false)
    }
  }

  function setEnvSignal(key: keyof EnvSignals, value: string) {
    setEnvSignals(prev => ({ ...prev, [key]: prev[key] === value ? null : value } as EnvSignals))
  }

  function setDim(key: keyof DisplayDims, value: number) {
    setCurrentDims(prev => prev ? { ...prev, [key]: value } : null)
  }

  function expandTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.max(180, el.scrollHeight) + 'px'
  }

  function loadExample() {
    setBrief(EXAMPLE_BRIEF)
    setExampleActive(true)
    setExampleHighlight(true)
    setTimeout(() => setExampleHighlight(false), 1100)
    setTimeout(() => { if (textareaRef.current) expandTextarea(textareaRef.current) }, 10)
  }

  function clearExample() {
    setBrief('')
    setExampleActive(false)
    if (textareaRef.current) { textareaRef.current.style.height = '180px' }
  }

  // ─── Shared header ────────────────────────────────────────────────────────────

  const confidenceColor = confidence === 'High' ? '#22C55E' : confidence === 'Medium' ? '#F59E0B' : '#D1D5DB'
  const confidenceText  = confidence === 'High' ? 'Strong role signal — ready to generate' : confidence === 'Medium' ? 'Add more detail about reporting or environment' : 'Keep writing — more context improves accuracy'

  const pageHeader = (
    <div style={{ background: '#FFF', borderBottom: '1px solid #F3F4F6', padding: '20px 32px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/dashboard"
          style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 14 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#6B7280')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
        >
          &larr; Hiring Overview
        </Link>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4C9D4', margin: '0 0 4px' }}>Role Setup</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 3px', letterSpacing: '-0.01em' }}>Create role benchmark</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Describe the role and environment. We'll configure the behavioral benchmark.</p>
      </div>
    </div>
  )

  // ─── Success ──────────────────────────────────────────────────────────────────

  if (stage === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(34,197,94,0.08)', border: '1.5px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'popIn 300ms ease-out both' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Benchmark set</h2>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Candidates will now be scored against this role profile.</p>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
      </div>
    )
  }

  // ─── Stage 1: Brief ───────────────────────────────────────────────────────────

  if (stage === 'brief') {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        {pageHeader}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '44px 32px 100px' }}>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 28, border: '1px solid #FECACA' }}>{error}</div>
          )}

          {/* Client + Title row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 36 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Client</label>
              <div style={{ position: 'relative' }}>
                <select value={clientId} onChange={e => setClientId(e.target.value)}
                  style={{ height: 42, width: '100%', borderRadius: 8, border: '1.5px solid #E5E7EB', background: '#FFF', padding: '0 36px 0 14px', fontSize: 14, color: '#374151', outline: 'none', cursor: 'pointer', appearance: 'none', fontFamily: 'inherit', transition: 'border-color 150ms', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role title</label>
              <input type="text" value={roleTitle} onChange={e => setRoleTitle(e.target.value)}
                placeholder="e.g. VP of Operations, CFO, Superintendent"
                style={{ height: 42, width: '100%', borderRadius: 8, border: '1.5px solid #E5E7EB', background: '#FFF', padding: '0 14px', fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', transition: 'border-color 150ms', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>

          {/* Brief textarea */}
          <div style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>Describe the role and environment</label>
              <button type="button" onClick={exampleActive ? clearExample : loadExample}
                style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, transition: 'color 120ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#374151')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                {exampleActive ? 'Clear example' : '+ Show strong example'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 12px', lineHeight: 1.55 }}>
              Write how you'd describe this to a partner. Include who they report to, what the environment is like, and where someone would fail.
            </p>
            <textarea ref={textareaRef} value={brief}
              onChange={e => { setBrief(e.target.value); expandTextarea(e.target); if (exampleActive && e.target.value !== EXAMPLE_BRIEF) setExampleActive(false) }}
              placeholder="e.g. PE-backed CFO at a $200M construction platform. Reports directly to the operating partner. Needs to build the finance function from scratch…"
              style={{
                width: '100%', borderRadius: 10, border: '1.5px solid #E5E7EB',
                background: exampleHighlight ? 'rgba(251,191,36,0.06)' : '#FFF',
                padding: '14px 16px', fontSize: 14, color: '#111827',
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.65,
                resize: 'none', minHeight: 180,
                transition: 'border-color 150ms, background 900ms ease',
                boxSizing: 'border-box', display: 'block',
              }}
              onFocus={e => (e.target.style.borderColor = '#2563EB')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Live signal panel */}
          <div style={{
            marginTop: 12, overflow: 'hidden',
            maxHeight: showSignalPanel ? 400 : 0,
            opacity: showSignalPanel ? 1 : 0,
            transition: 'max-height 300ms ease, opacity 300ms ease',
          }}>
            <div style={{ paddingTop: 16, paddingBottom: 4 }}>
              {/* Confidence header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', margin: 0 }}>Detected from brief</p>
                <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: confidenceColor, transition: 'background 300ms' }} />
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{confidence}</span>
                </div>
              </div>

              {/* Signal groups */}
              {(['Environment', 'Structure', 'Role expectations'] as DetectedSignal['category'][]).map(cat => {
                const items = signalsByCategory[cat] || []
                if (!items.length) return null
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#C4C9D4', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>{cat}</p>
                    {items.map((sig, i) => (
                      <div key={sig.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', animation: `fadeSlideIn 250ms ease both`, animationDelay: `${i * 40}ms` }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#6B7280' }}>{sig.text}</span>
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Conflict warning */}
              {conflictWarning && (
                <div style={{ display: 'flex', gap: 8, padding: '8px 0', borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#F59E0B' }}>↕</span>
                  <span style={{ fontSize: 12, color: '#92400E' }}>{conflictWarning}</span>
                </div>
              )}

              {/* Confidence message */}
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '8px 0 0', lineHeight: 1.5 }}>{confidenceText}</p>
            </div>

            {/* Nudges */}
            {nudges.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {nudges.map(n => (
                  <p key={n} style={{ fontSize: 12, color: '#9CA3AF', margin: 0, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: '#D1D5DB', flexShrink: 0 }}>→</span> {n}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Environment + scope (progressive reveal) */}
          <div style={{
            marginTop: 36, overflow: 'hidden',
            maxHeight: showEnvSection ? 600 : 0,
            opacity: showEnvSection ? 1 : 0,
            transition: 'max-height 400ms ease, opacity 400ms ease',
          }}>
            {/* Context signals */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4C9D4', margin: '0 0 14px' }}>Context signals</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ENV_ROWS.map(row => (
                  <div key={row.key}>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 7px' }}>{row.label}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {row.options.map(opt => {
                        const active = envSignals[row.key] === opt.value
                        const suggested = !active && suggestedPills.get(row.key) === opt.value
                        return (
                          <button key={opt.value} type="button" onClick={() => setEnvSignal(row.key, opt.value)}
                            style={{
                              padding: '6px 13px', borderRadius: 20,
                              border: `1.5px solid ${active ? '#2563EB' : suggested ? '#BFDBFE' : '#EAEAEC'}`,
                              background: active ? 'rgba(37,99,235,0.05)' : suggested ? 'rgba(219,234,254,0.4)' : '#FFF',
                              fontSize: 12, color: active ? '#1D4ED8' : suggested ? '#3B82F6' : '#6B7280',
                              cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 500 : 400,
                              transition: 'all 120ms',
                            }}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role understanding summary */}
          {roleSummary && (
            <div style={{ marginTop: 32, padding: '12px 0', borderTop: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: 13, color: '#374151', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                {roleSummary}
              </p>
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: roleSummary ? 20 : 40 }}>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 14px', lineHeight: 1.5 }}>
              We'll translate this into a behavioral benchmark used to evaluate candidates.
            </p>
            <button type="button" disabled={!canGenerate} onClick={handleGenerate}
              style={{ width: '100%', height: 50, borderRadius: 10, background: canGenerate ? '#111827' : '#EBEBEC', color: canGenerate ? '#FFF' : '#9CA3AF', fontSize: 15, fontWeight: 600, border: 'none', cursor: canGenerate ? 'pointer' : 'not-allowed', transition: 'all 180ms', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (canGenerate) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Generate role profile
            </button>
            {!canGenerate && (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>
                {!roleTitle.trim() ? 'Enter a role title to continue' : 'Write a brief description to continue'}
              </p>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
        `}</style>
      </div>
    )
  }

  // ─── Stage 2: Generating ──────────────────────────────────────────────────────

  if (stage === 'generating') {
    const preview = brief.length > 110 ? brief.slice(0, 110).trimEnd() + '…' : brief
    const neutralDims: BaseDims = { dominance: 0.65, extraversion: 0.50, patience: 0.50, formality: 0.65 }

    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        {pageHeader}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '44px 32px 96px' }}>

          {/* Locked brief card */}
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #F3F4F6', padding: '18px 22px', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{roleTitle}</span>
              {clients.find(c => c.id === clientId) && (
                <><span style={{ color: '#E5E7EB', fontSize: 12 }}>·</span><span style={{ fontSize: 13, color: '#9CA3AF' }}>{clients.find(c => c.id === clientId)?.name}</span></>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>{preview}</p>
            {signals.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                {signals.slice(0, 4).map(s => (
                  <span key={s.text} style={{ fontSize: 11, color: '#9CA3AF', background: '#F9FAFB', padding: '2px 8px', borderRadius: 10, border: '1px solid #F3F4F6' }}>{s.text}</span>
                ))}
                {signals.length > 4 && <span style={{ fontSize: 11, color: '#C4C9D4' }}>+{signals.length - 4} more</span>}
              </div>
            )}
          </div>

          {/* Generation phases */}
          <div style={{ marginBottom: 32 }}>
            {GEN_PHASES.map((label, i) => {
              const isActive = genPhase === i
              const isDone = genPhase > i
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', opacity: genPhase < i ? 0.2 : 1, transition: 'opacity 400ms ease' }}>
                  <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isDone ? (
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="7" height="7" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    ) : isActive ? (
                      <div style={{ width: 15, height: 15, borderRadius: '50%', border: '1.5px solid rgba(37,99,235,0.2)', borderTopColor: '#2563EB', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D1D5DB' }} />
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: isActive ? 500 : 400, color: isDone ? '#9CA3AF' : isActive ? '#111827' : '#C4C9D4', transition: 'color 300ms' }}>{label}</span>
                </div>
              )
            })}
          </div>

          {/* Pentagon builds during generation */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            opacity: showGenPentagon ? 1 : 0,
            transform: showGenPentagon ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
          }}>
            <FitModelLight key="gen-pentagon" scores={neutralDims} size={140} animated showLabels />
            <p style={{ fontSize: 11, color: '#D1D5DB', margin: '8px 0 0', letterSpacing: '0.04em' }}>Constructing profile…</p>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── Stage 3: Review ──────────────────────────────────────────────────────────

  if (stage === 'review' && currentDims && aiDims) {
    const preview = brief.length > 95 ? brief.slice(0, 95).trimEnd() + '…' : brief

    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        {pageHeader}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '44px 32px 100px' }}>

          {/* Brief summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{roleTitle}</span>
                {clients.find(c => c.id === clientId) && (
                  <><span style={{ color: '#E5E7EB', fontSize: 12 }}>·</span><span style={{ fontSize: 13, color: '#9CA3AF' }}>{clients.find(c => c.id === clientId)?.name}</span></>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</p>
            </div>
            <button type="button" onClick={() => setStage('brief')}
              style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 6, border: '1px solid #EAEAEC', background: 'transparent', fontSize: 12, color: '#9CA3AF', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#D1D5DB' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#EAEAEC' }}
            >
              Edit
            </button>
          </div>

          {/* AI summary */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4C9D4', margin: '0 0 10px' }}>Review and adjust</p>
            <p style={{ fontSize: 15, color: '#111827', lineHeight: 1.65, margin: '0 0 4px', fontWeight: 400 }}>
              {aiSummary}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>These are set from your brief. Adjust if needed.</p>
          </div>

          {/* Dimension rows */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
              {DIM_KEYS.map((key, idx) => {
                const cfg = DIM_CONFIG[key]
                const cur = currentDims[key]
                const ai  = aiDims[key]
                const adjusted = Math.abs(cur - ai) >= 5
                const explanation = aiExplanations[key] || ''
                const visible = visibleRows > idx

                return (
                  <div key={key} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 260ms ease, transform 260ms ease' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{cfg.label}</span>
                      {adjusted && <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>Adjusted from AI recommendation</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#9CA3AF', width: 106, textAlign: 'right', flexShrink: 0, lineHeight: 1.35 }}>{cfg.left}</span>
                      <div style={{ flex: 1, position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: '#F0F0F2', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${cur}%`, background: '#2563EB', borderRadius: 3, transition: 'width 60ms ease' }} />
                        </div>
                        {/* AI ghost */}
                        <div title="AI recommendation" style={{ position: 'absolute', left: `calc(${ai}% - 1px)`, width: 2, height: 12, borderRadius: 1, background: 'rgba(37,99,235,0.2)', pointerEvents: 'none' }} />
                        <input type="range" min={0} max={100} step={1} value={cur}
                          onChange={e => setDim(key, parseInt(e.target.value, 10))}
                          style={{ position: 'absolute', left: 0, right: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 24, margin: 0 }}
                        />
                        <div style={{ position: 'absolute', left: `calc(${cur}% - 9px)`, width: 18, height: 18, borderRadius: '50%', background: '#FFF', border: '2px solid #2563EB', boxShadow: '0 1px 4px rgba(37,99,235,0.2)', pointerEvents: 'none', transition: 'left 60ms ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#9CA3AF', width: 106, flexShrink: 0, lineHeight: 1.35 }}>{cfg.right}</span>
                    </div>

                    {explanation && (
                      <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.55, paddingLeft: 118 }}>{explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pentagon */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', marginBottom: 32 }}>
            <FitModelLight scores={baseDims} size={156} animated={false} showLabels />
            <p style={{ fontSize: 11, color: '#C4C9D4', margin: '10px 0 0', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role benchmark</p>
          </div>

          {/* Archetype match */}
          {closestArchetypes.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4C9D4', margin: '0 0 6px' }}>Closest operating style match</p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.6 }}>
                This benchmark most closely favors {closestArchetypes.map(p => p.name).join(' and ')} profiles.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {closestArchetypes.map(p => (
                  <div key={p.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: '1px solid #EAEAEC', background: '#FAFAFA' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>· {p.groupLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #FECACA' }}>{error}</div>
          )}

          {/* Final CTA */}
          <button type="button" disabled={saving} onClick={handleSubmit}
            style={{ width: '100%', height: 50, borderRadius: 10, background: saving ? '#EBEBEC' : '#111827', color: saving ? '#9CA3AF' : '#FFF', fontSize: 15, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 180ms', fontFamily: 'inherit' }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {saving ? 'Saving…' : 'Set as benchmark'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 }}>
            This benchmark will be applied to every candidate assessed for this role.
          </p>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
        `}</style>
      </div>
    )
  }

  return null
}
