'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ADJECTIVES } from '@/lib/data/adjectives'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { PRODUCT_NAME } from '@/lib/brand'

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function pentagonPts(values: number[], cx: number, cy: number, maxR: number): string {
  return values.map((v, i) => {
    const a = (270 + i * 72) * Math.PI / 180
    return `${(cx + v * maxR * Math.cos(a)).toFixed(2)},${(cy + v * maxR * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

function ringPts(cx: number, cy: number, r: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const a = (270 + i * 72) * Math.PI / 180
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

function profileToValues(coords: { dominance: number; extraversion: number; patience: number; formality: number }): number[] {
  const { dominance, extraversion, patience, formality } = coords
  return [dominance, formality, (1 - formality + patience) / 2, extraversion, 1 - patience]
}

function computeSignal(checked: Set<string>) {
  let drive = 0, social = 0, pace = 0, structure = 0
  for (const w of checked) {
    const adj = ADJECTIVES.find(a => a.word === w)
    if (!adj) continue
    if (adj.dimension === 'dominance' && adj.polarity === 'positive') drive++
    if (adj.dimension === 'extraversion' && adj.polarity === 'positive') social++
    if (adj.dimension === 'patience' && adj.polarity === 'negative') pace++
    if (adj.dimension === 'formality' && adj.polarity === 'positive') structure++
  }
  return {
    drive: Math.min(drive / 10, 1),
    social: Math.min(social / 10, 1),
    pace: Math.min(pace / 10, 1),
    structure: Math.min(structure / 10, 1),
  }
}

// ─── Archetype Insights ──────────────────────────────────────────────────────

const INSIGHTS: Record<string, { coreSignal: string; whereYouWin: string; watchFor: string; emotionalLine: string }> = {
  Conductor: {
    coreSignal: "You adapt your authority to the room — and that's exactly what makes people trust you.",
    whereYouWin: "Environments where execution speed and team cohesion both matter — neither alone is enough.",
    watchFor: "You may absorb friction that should belong to others just to keep things moving.",
    emotionalLine: "Rooms reorganize themselves around you — sometimes before you say a word.",
  },
  Pioneer: {
    coreSignal: "You move before permission arrives — and you're usually right to.",
    whereYouWin: "High-stakes autonomous environments where decisive ownership is the competitive advantage.",
    watchFor: "Speed without patience can leave behind people who had something important to say.",
    emotionalLine: "You were already three steps ahead before anyone called the meeting.",
  },
  Purist: {
    coreSignal: "You hold the line on standards when everyone else is looking for the shortcut.",
    whereYouWin: "Quality-critical environments where the cost of getting it wrong compounds over time.",
    watchFor: "High standards without warmth can create fear in rooms that needed excellence.",
    emotionalLine: "You're the reason the thing that should have failed didn't.",
  },
  Renegade: {
    coreSignal: "You change the energy in a room the moment you walk in — and the direction shortly after.",
    whereYouWin: "Competitive, high-visibility environments where momentum is the product.",
    watchFor: "What you start brilliantly needs someone to finish — and that someone isn't always there.",
    emotionalLine: "The reason the stalled thing started moving again was you.",
  },
  Catalyst: {
    coreSignal: "You make things feel possible — then make them feel urgent.",
    whereYouWin: "Launch phases and new initiatives where energy is the scarce resource.",
    watchFor: "The gap between what you start and what gets completed can quietly widen.",
    emotionalLine: "Before anyone else saw the opportunity, you were already selling it.",
  },
  Diplomat: {
    coreSignal: "You set expectations before the problem develops — and people remember that.",
    whereYouWin: "Stakeholder-intensive environments where trust is the actual deliverable.",
    watchFor: "Prioritizing alignment over speed can cost you decisions that needed to be made.",
    emotionalLine: "The agreement felt unanimous. You'd been steering it there since you walked in.",
  },
  Rainmaker: {
    coreSignal: "You open doors through warmth, not pressure — and they stay open.",
    whereYouWin: "External-facing roles where authentic relationships determine outcomes.",
    watchFor: "Your generosity can be mistaken for a blank check by people who will test its limits.",
    emotionalLine: "They didn't stay for the contract. They stayed because of you.",
  },
  Unifier: {
    coreSignal: "You notice when people are struggling before anyone else does — and you do something about it.",
    whereYouWin: "Team-intensive environments where interpersonal trust is what makes everything else work.",
    watchFor: "Protecting people from discomfort can let problems fester longer than they should.",
    emotionalLine: "You don't fully understand what they do until they're gone.",
  },
  Anchor: {
    coreSignal: "You prioritize consistency over visibility — and people notice.",
    whereYouWin: "Operations-intensive roles where reliability and follow-through are the actual product.",
    watchFor: "Being the person everything goes through can quietly become the person everything depends on.",
    emotionalLine: "You're the person teams rely on when things quietly start to fall apart.",
  },
  Navigator: {
    coreSignal: "You already planned for the problem someone is about to bring you.",
    whereYouWin: "Complex environments where the ability to sequence and anticipate determines outcomes.",
    watchFor: "Waiting for perfect information can delay decisions that needed to happen yesterday.",
    emotionalLine: "The project wasn't supposed to land on time. You're the reason it did.",
  },
  Sentinel: {
    coreSignal: "You catch the thing nobody was looking for — before it becomes the thing nobody can ignore.",
    whereYouWin: "Compliance and quality roles where accuracy has real consequences that compound.",
    watchFor: "Precision applied to low-stakes decisions can slow environments that need momentum.",
    emotionalLine: "They didn't know they needed you until what you caught would have cost them everything.",
  },
  Standard: {
    coreSignal: "You deliver the same quality in year ten that you delivered in week one.",
    whereYouWin: "Process-dependent roles where repeatability is more valuable than variability.",
    watchFor: "Consistency can become inertia when the situation genuinely requires adaptation.",
    emotionalLine: "Steady isn't a compromise. For you, it's the strategy.",
  },
  Agent: {
    coreSignal: "You know things that can't be learned quickly — and everyone in the room knows it.",
    whereYouWin: "Specialist and expert roles where depth of knowledge is the actual differentiator.",
    watchFor: "The influence you carry through mastery doesn't always travel outside your domain.",
    emotionalLine: "You know things that can't be learned quickly, and everyone in the room knows it.",
  },
  Executor: {
    coreSignal: "You don't just win — you build the organization that keeps winning after you've moved on.",
    whereYouWin: "Scaling environments where ambition and operational discipline are required simultaneously.",
    watchFor: "Perfectionism can become a bottleneck when good enough shipped beats perfect pending.",
    emotionalLine: "You set the ambitious goal. Then you built the system that actually reached it.",
  },
  Trailblazer: {
    coreSignal: "You set a pace others didn't know was possible — and then hold it.",
    whereYouWin: "Competitive scaling environments where performance itself is the differentiator.",
    watchFor: "The bar you set can exhaust people who are genuinely trying to keep up.",
    emotionalLine: "You didn't announce the bar had been raised. You just raised it.",
  },
  Veteran: {
    coreSignal: "You've seen what happens when people cut corners — and you show up every time to make sure it doesn't.",
    whereYouWin: "Operations and project leadership where sustained reliable performance matters most.",
    watchFor: "You may stay loyal to approaches that have quietly stopped working.",
    emotionalLine: "You're the person teams rely on when things quietly start to fall apart.",
  },
}

const PENTAGON_LABELS = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Dec. Speed']

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'welcome' | 'list1' | 'list2' | 'submitting' | 'complete' | 'error'

interface CompletionData {
  profileName: string
  profileGroup: string
  tagline: string
  description: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AssessPage() {
  const params = useParams()
  const token = params.token as string

  const [phase, setPhase] = useState<Phase>('loading')
  const [candidateName, setCandidateName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)

  const [list1Order, setList1Order] = useState<string[]>([])
  const [list2Order, setList2Order] = useState<string[]>([])
  const [list1Checked, setList1Checked] = useState<Set<string>>(new Set())
  const [list2Checked, setList2Checked] = useState<Set<string>>(new Set())

  const page1StartRef = useRef<number>(0)
  const page2StartRef = useRef<number>(0)
  const [timeOnPage1Ms, setTimeOnPage1Ms] = useState(0)
  const [timeOnPage2Ms, setTimeOnPage2Ms] = useState(0)

  const [showLowCountWarning, setShowLowCountWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<'finishList1' | 'submitAssessment' | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scoringVariant, setScoringVariant] = useState<'v1_stepped' | 'v2_quadratic'>('v2_quadratic')
  const [isSubmittingAnimating, setIsSubmittingAnimating] = useState(false)

  const [resultStage, setResultStage] = useState(0)
  const [displayedName, setDisplayedName] = useState('')
  const [pentagonActive, setPentagonActive] = useState(false)

  const storageKey = `legacy-fit-${token}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.list1Order) setList1Order(data.list1Order)
        if (data.list2Order) setList2Order(data.list2Order)
        if (data.list1Checked) setList1Checked(new Set(data.list1Checked))
        if (data.list2Checked) setList2Checked(new Set(data.list2Checked))
        if (data.phase && data.phase !== 'loading' && data.phase !== 'submitting') {
          setPhase(data.phase)
          return
        }
      }
    } catch { /* ignore */ }

    const variantKey = `lf-variant-${token}`
    const savedVariant = localStorage.getItem(variantKey)
    if (savedVariant === 'v1_stepped' || savedVariant === 'v2_quadratic') {
      setScoringVariant(savedVariant)
    } else {
      const assigned = Math.random() < 0.5 ? 'v1_stepped' : 'v2_quadratic'
      localStorage.setItem(variantKey, assigned)
      setScoringVariant(assigned)
    }

    const words = ADJECTIVES.map(a => a.word)
    setList1Order(shuffleArray(words))
    setList2Order(shuffleArray(words))
  }, [storageKey])

  useEffect(() => {
    fetch(`/api/assess/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error)
          setPhase('error')
        } else if (data.completed) {
          setCompletionData({
            profileName: data.profileName,
            profileGroup: data.profileGroup || '',
            tagline: data.tagline || '',
            description: data.description || '',
          })
          setCandidateName(data.candidateName || '')
          setPhase('complete')
        } else {
          setCandidateName(data.candidateName || '')
          if (phase === 'loading') setPhase('welcome')
        }
      })
      .catch(() => {
        setErrorMsg('Failed to load assessment. Check your link and try again.')
        setPhase('error')
      })
  }, [token, phase])

  const saveState = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        list1Order, list2Order,
        list1Checked: Array.from(list1Checked),
        list2Checked: Array.from(list2Checked),
        phase,
      }))
    } catch { /* ignore */ }
  }, [storageKey, list1Order, list2Order, list1Checked, list2Checked, phase])

  useEffect(() => { saveState() }, [saveState])

  useEffect(() => {
    if (phase !== 'list1' && phase !== 'list2') return
    function handleScroll() { setShowScrollTop(window.scrollY > 400) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [phase])

  // Results sequence
  useEffect(() => {
    if (phase !== 'complete' || !completionData) return
    const name = completionData.profileName
    const typeMs = name.length * 55

    const t1 = setTimeout(() => setResultStage(1), 400)
    const t2 = setTimeout(() => setResultStage(2), 1000)

    let idx = 0
    const ticker = setInterval(() => {
      idx++
      setDisplayedName(name.slice(0, idx))
      if (idx >= name.length) clearInterval(ticker)
    }, 55)

    const done = 1000 + typeMs
    const t3 = setTimeout(() => setResultStage(3), done + 400)
    const t4 = setTimeout(() => { setResultStage(4); setPentagonActive(true) }, done + 800)
    const t5 = setTimeout(() => setResultStage(5), done + 2400)
    const t6 = setTimeout(() => setResultStage(6), done + 4600)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6)
      clearInterval(ticker)
    }
  }, [phase, completionData])

  function toggleWord(list: 1 | 2, word: string) {
    const setter = list === 1 ? setList1Checked : setList2Checked
    setter(prev => {
      const next = new Set(prev)
      if (next.has(word)) next.delete(word); else next.add(word)
      return next
    })
  }

  function startList1() {
    setPhase('list1')
    page1StartRef.current = Date.now()
  }

  function finishList1() {
    if (list1Checked.size < 10) return
    if (list1Checked.size < 15) { setShowLowCountWarning(true); setPendingAction('finishList1'); return }
    doFinishList1()
  }

  function doFinishList1() {
    setShowLowCountWarning(false)
    setPendingAction(null)
    setTimeOnPage1Ms(Date.now() - page1StartRef.current)
    setPhase('list2')
    page2StartRef.current = Date.now()
    window.scrollTo(0, 0)
  }

  async function submitAssessment() {
    if (list2Checked.size < 10) return
    if (list2Checked.size < 15) { setShowLowCountWarning(true); setPendingAction('submitAssessment'); return }
    await doAnimatedSubmit()
  }

  async function doAnimatedSubmit() {
    setShowLowCountWarning(false)
    setPendingAction(null)
    setIsSubmittingAnimating(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsSubmittingAnimating(false)
    doSubmitAssessment()
  }

  async function doSubmitAssessment() {
    const t2 = Date.now() - page2StartRef.current
    setTimeOnPage2Ms(t2)
    setPhase('submitting')

    const payload = {
      list1Checked: Array.from(list1Checked),
      list2Checked: Array.from(list2Checked),
      list1Order, list2Order,
      timeOnPage1Ms, timeOnPage2Ms: t2,
      scoringVariant,
    }

    let retries = 0
    while (retries < 3) {
      try {
        const res = await fetch(`/api/assess/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setCompletionData(data)
          setPhase('complete')
          localStorage.removeItem(storageKey)
          return
        }
        if (data.error === 'Assessment already completed') { setPhase('complete'); return }
        throw new Error(data.error || 'Submission failed')
      } catch {
        retries++
        if (retries < 3) await new Promise(r => setTimeout(r, 1000 * retries))
      }
    }

    setErrorMsg('Something went wrong. Your answers are saved — please try again.')
    setPhase('list2')
  }

  function handleContinueAnyway() {
    if (pendingAction === 'finishList1') doFinishList1()
    else if (pendingAction === 'submitAssessment') doAnimatedSubmit()
  }

  // ─── LOADING ─────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
        <div style={{ width: 18, height: 18, border: '1.5px solid rgba(255,255,255,0.06)', borderTopColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────

  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#eeece6', margin: '0 0 8px' }}>Unable to load assessment</h1>
          <p style={{ fontSize: 15, color: 'rgba(238,236,230,0.45)', lineHeight: 1.6 }}>{errorMsg}</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── WELCOME ──────────────────────────────────────────────────────────────

  if (phase === 'welcome') {
    const firstName = candidateName ? candidateName.split(' ')[0] : ''
    const bgPentPts = ringPts(160, 160, 140)
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes pent-draw {
            0%   { stroke-dashoffset: 830; opacity: 0; }
            8%   { opacity: 1; }
            50%  { stroke-dashoffset: 0; opacity: 1; }
            83%  { stroke-dashoffset: 0; opacity: 1; }
            100% { stroke-dashoffset: 830; opacity: 0; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px) }
            to   { opacity: 1; transform: translateY(0) }
          }
        `}</style>

        {/* Ambient pentagon */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            <polygon points={bgPentPts} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              style={{ strokeDasharray: 830, animation: 'pent-draw 6s ease-in-out infinite' }} />
            <polygon points={ringPts(160, 160, 90)} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1"
              style={{ strokeDasharray: 540, animation: 'pent-draw 6s ease-in-out infinite', animationDelay: '1s' }} />
          </svg>
        </div>

        <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1, animation: 'fadeUp 500ms ease-out both' }}>
          {/* Wordmark */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(238,236,230,0.5)', letterSpacing: '-0.01em' }}>{PRODUCT_NAME}</span>
          </div>

          {/* Greeting */}
          {firstName && (
            <p style={{ fontSize: 16, color: 'rgba(238,236,230,0.45)', margin: '0 0 12px', fontWeight: 300 }}>Hi {firstName},</p>
          )}

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, color: '#eeece6', margin: '0 0 20px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            You&rsquo;ve been selected for a behavioral calibration.
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: 15, color: 'rgba(238,236,230,0.52)', margin: '0 0 6px', fontWeight: 300, lineHeight: 1.5 }}>
            There are no right or wrong answers.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(238,236,230,0.52)', margin: '0 0 32px', fontWeight: 300, lineHeight: 1.5 }}>
            Select words that feel true. Don&rsquo;t overthink it.
          </p>

          {/* What you'll get */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px', marginBottom: 40 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(238,236,230,0.55)', lineHeight: 1.65, fontWeight: 300 }}>
              When you finish, you&rsquo;ll see your behavioral profile — your archetype, your signal pattern, and where you&rsquo;re likely to perform at your best.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={startList1}
            style={{ width: '100%', height: 52, borderRadius: 100, background: '#eeece6', color: '#080808', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 160ms ease', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#eeece6'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Begin calibration
          </button>

          <p style={{ fontSize: 11, color: 'rgba(238,236,230,0.25)', textAlign: 'center', marginTop: 16 }}>
            About 6 minutes &nbsp;&middot;&nbsp; Confidential
          </p>
        </div>
      </div>
    )
  }

  // ─── SUBMITTING ───────────────────────────────────────────────────────────

  if (phase === 'submitting') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
        <div style={{ width: 36, height: 36, border: '1.5px solid rgba(255,255,255,0.05)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 20 }} />
        <p style={{ fontSize: 15, fontWeight: 500, color: '#eeece6', margin: '0 0 6px' }}>Analyzing your responses</p>
        <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.35)', fontWeight: 300 }}>This takes just a moment</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── COMPLETE ─────────────────────────────────────────────────────────────

  if (phase === 'complete') {
    const firstName = candidateName ? candidateName.split(' ')[0] : ''
    const profile = REFERENCE_PROFILES.find(p => p.name === completionData?.profileName)
    const pentagonValues = profile ? profileToValues(profile.coords) : [0.5, 0.5, 0.5, 0.5, 0.5]
    const insights = completionData ? INSIGHTS[completionData.profileName] : null

    return (
      <div style={{ minHeight: '100svh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
          .result-fade { animation: fadeIn 400ms ease both; }
          .result-up   { animation: fadeUp 500ms ease both; }
        `}</style>

        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>

          {/* MOMENT 1 — "You're done" */}
          {resultStage === 1 && (
            <p className="result-fade" style={{ fontSize: 16, color: 'rgba(238,236,230,0.45)', fontWeight: 300, margin: 0 }}>
              {firstName ? `You're done, ${firstName}.` : "You're done."}
            </p>
          )}

          {/* MOMENT 2+ — Archetype name */}
          {resultStage >= 2 && (
            <div>
              <h1 style={{
                fontSize: 'clamp(52px, 8vw, 88px)', fontWeight: 800, color: '#eeece6',
                letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 0',
                fontFamily: '"Barlow Condensed", "SF Pro Display", -apple-system, sans-serif',
                animation: resultStage === 2 ? 'none' : undefined,
              }}>
                {displayedName}
                {resultStage === 2 && <span style={{ opacity: 0.3, animation: 'blink 0.8s step-end infinite' }}>|</span>}
              </h1>

              {/* MOMENT 3 — Group label */}
              {resultStage >= 3 && completionData && (
                <p className="result-fade" style={{ fontSize: 16, fontStyle: 'italic', color: 'rgba(238,236,230,0.38)', fontWeight: 300, margin: '12px 0 0' }}>
                  {completionData.profileGroup}
                </p>
              )}
            </div>
          )}

          {/* MOMENT 4 — Pentagon */}
          {resultStage >= 4 && (
            <div className="result-up" style={{ margin: '36px auto 0', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                {/* Background rings */}
                <polygon points={ringPts(110, 110, 88)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                <polygon points={ringPts(110, 110, 44)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                {/* Axis lines */}
                {Array.from({ length: 5 }, (_, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  return (
                    <line key={i}
                      x1="110" y1="110"
                      x2={(110 + 88 * Math.cos(a)).toFixed(2)}
                      y2={(110 + 88 * Math.sin(a)).toFixed(2)}
                      stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
                    />
                  )
                })}
                {/* Data polygon */}
                <polygon
                  points={pentagonPts(pentagonValues, 110, 110, 88)}
                  fill="rgba(37,99,235,0.1)"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  style={{
                    strokeDasharray: 530,
                    strokeDashoffset: pentagonActive ? 0 : 530,
                    transition: pentagonActive ? 'stroke-dashoffset 1200ms ease-out' : 'none',
                  }}
                />
                {/* Vertex labels */}
                {PENTAGON_LABELS.map((label, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  const lx = 110 + 104 * Math.cos(a)
                  const ly = 110 + 104 * Math.sin(a)
                  return (
                    <text key={label} x={lx.toFixed(1)} y={ly.toFixed(1)}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="rgba(238,236,230,0.28)" fontSize="8.5"
                      fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                    >{label}</text>
                  )
                })}
              </svg>
            </div>
          )}

          {/* MOMENT 5 — Insights */}
          {resultStage >= 5 && insights && (
            <div style={{ marginTop: 40, textAlign: 'left' }}>
              {/* Core signal */}
              <div className="result-up" style={{ marginBottom: 20, animationDelay: '0ms' }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px', fontWeight: 500 }}>Core Signal</p>
                <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.82)', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>{insights.coreSignal}</p>
              </div>
              {/* Where you win */}
              <div className="result-up" style={{ marginBottom: 20, animationDelay: '200ms' }}>
                <p style={{ fontSize: 9, color: '#3aa868', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px', fontWeight: 500 }}>Where You Win</p>
                <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.65)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{insights.whereYouWin}</p>
              </div>
              {/* Watch for */}
              <div className="result-up" style={{ marginBottom: 0, animationDelay: '400ms' }}>
                <p style={{ fontSize: 9, color: '#c8a832', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px', fontWeight: 500 }}>Watch For</p>
                <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.55)', lineHeight: 1.6, margin: 0, fontWeight: 300, fontStyle: 'italic' }}>{insights.watchFor}</p>
              </div>
              {/* Emotional line */}
              <p className="result-up" style={{ fontSize: 16, color: 'rgba(238,236,230,0.75)', lineHeight: 1.6, margin: '32px 0 0', textAlign: 'center', animationDelay: '700ms' }}>
                {insights.emotionalLine}
              </p>
            </div>
          )}

          {/* MOMENT 6 — Closing */}
          {resultStage >= 6 && (
            <div className="result-up" style={{ marginTop: 40 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 13, color: '#eeece6', margin: '0 0 4px', fontWeight: 400 }}>
                  Your profile has been shared with your search partner.
                </p>
                <p style={{ fontSize: 12, color: 'rgba(238,236,230,0.42)', margin: 0, fontWeight: 300, lineHeight: 1.55 }}>
                  They&rsquo;ll use this to evaluate role alignment. Your results are on file.
                </p>
              </div>
            </div>
          )}
        </div>

        <style>{`@keyframes blink { 0%,100% { opacity: 0.3 } 50% { opacity: 0 } }`}</style>
      </div>
    )
  }

  // ─── WORD LISTS ───────────────────────────────────────────────────────────

  const isList1 = phase === 'list1'
  const currentOrder = isList1 ? list1Order : list2Order
  const currentChecked = isList1 ? list1Checked : list2Checked
  const selectionCount = currentChecked.size
  const canProceed = selectionCount >= 10

  const signal = computeSignal(currentChecked)
  const signalBars = [
    { label: 'Drive', value: signal.drive },
    { label: 'Social', value: signal.social },
    { label: 'Pace', value: signal.pace },
    { label: 'Structure', value: signal.structure },
  ]
  const dominantSignal = signalBars.reduce((a, b) => b.value > a.value ? b : a, signalBars[0])

  let counterText = ''
  let counterColor = 'rgba(238,236,230,0.35)'
  if (selectionCount === 0) { counterText = 'Select at least 10 words to continue'; counterColor = 'rgba(238,236,230,0.3)' }
  else if (selectionCount < 15) { counterText = `${selectionCount} selected — 15+ for best results`; counterColor = 'rgba(238,236,230,0.45)' }
  else if (selectionCount < 20) { counterText = 'Good — keep going'; counterColor = 'rgba(238,236,230,0.55)' }
  else if (selectionCount <= 45) { counterText = 'Ready'; counterColor = '#3aa868' }
  else { counterText = `${selectionCount} selected — consider narrowing`; counterColor = '#c8a832' }

  return (
    <div style={{ minHeight: '100svh', background: '#080808', paddingBottom: 96, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes chip-pop { 0% { transform: scale(1) } 40% { transform: scale(1.06) } 100% { transform: scale(1) } }
        .word-chip {
          display: flex; align-items: center; justify-content: center;
          padding: 8px 16px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
          color: rgba(238,236,230,0.65);
          font-size: 13px; font-weight: 400;
          cursor: pointer; transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
          user-select: none; -webkit-tap-highlight-color: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
          min-height: 40px; white-space: nowrap;
        }
        .word-chip:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(238,236,230,0.88);
          background: rgba(255,255,255,0.05);
          transform: scale(1.02);
        }
        .word-chip[data-sel="true"] {
          background: rgba(255,255,255,0.92);
          color: #080808;
          border-color: transparent;
          font-weight: 600;
          animation: chip-pop 180ms ease;
        }
        .word-chip[data-sel="true"]:hover { transform: scale(1); }
        @media (max-width: 1100px) { .signal-panel { display: none !important; } }
        @media (max-width: 600px) { .word-chips { padding: 0 16px !important; } .list-header { padding: 24px 16px 16px !important; } }
      `}</style>

      {/* Top bar */}
      <div style={{ height: 48, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontSize: 13, color: 'rgba(238,236,230,0.3)', fontWeight: 400 }}>{PRODUCT_NAME}</span>
        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isList1 ? '#2563EB' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 250ms ease', flexShrink: 0 }}>
            {!isList1 && (
              <svg width="5" height="5" viewBox="0 0 5 5" fill="none">
                <path d="M1 2.5L2 3.5L4 1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: !isList1 ? '#2563EB' : 'rgba(255,255,255,0.15)', transition: 'background 250ms ease' }} />
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Instruction */}
      <div className="list-header" style={{ maxWidth: 680, margin: '0 auto', padding: '32px 48px 24px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#eeece6', margin: '0 0 8px', lineHeight: 1.3 }}>
          {isList1
            ? 'Select words that describe what others expect from you at work.'
            : 'Now, remove the expectations.'}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.45)', margin: 0, fontWeight: 300 }}>
          {isList1
            ? 'Your manager, team, or environment. What do they seem to need from you?'
            : 'What words feel most authentically true to you — regardless of context?'}
        </p>
      </div>

      {/* Word chips */}
      <div className="word-chips" style={{ maxWidth: 680, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {currentOrder.map(word => (
            <button
              key={word}
              onClick={() => toggleWord(isList1 ? 1 : 2, word)}
              className="word-chip"
              data-sel={currentChecked.has(word) ? 'true' : 'false'}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Live signal panel */}
      <div className="signal-panel" style={{ position: 'fixed', right: 32, top: '50%', transform: 'translateY(-50%)', width: 180, background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, zIndex: 10 }}>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 14px', fontWeight: 500 }}>Signal</p>
        {signalBars.map(bar => (
          <div key={bar.label} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px', fontWeight: 500 }}>{bar.label}</p>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#2563EB', borderRadius: 1, width: `${bar.value * 100}%`, transition: 'width 300ms ease' }} />
            </div>
          </div>
        ))}
        {selectionCount >= 5 && dominantSignal.value > 0 && (
          <p style={{ fontSize: 10, color: 'rgba(238,236,230,0.35)', fontStyle: 'italic', margin: '6px 0 0' }}>
            {dominantSignal.label} dominant
          </p>
        )}
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ position: 'fixed', bottom: 88, right: 20, zIndex: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', color: '#eeece6', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms ease' }}
          aria-label="Scroll to top"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2.5L2.5 7.5H5.5V11.5H8.5V7.5H11.5L7 2.5Z" fill="currentColor" />
          </svg>
        </button>
      )}

      {/* Processing overlay */}
      {isSubmittingAnimating && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 300ms ease' }}>
          <p style={{ color: 'rgba(238,236,230,0.6)', fontSize: 14, fontWeight: 300, letterSpacing: '0.02em' }}>
            Analyzing
            <span style={{ animation: 'blink3 1.2s step-end infinite' }}>...</span>
          </p>
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes blink3 { 0%,100% { opacity: 1 } 33% { opacity: 0 } 66% { opacity: 0.5 } }
          `}</style>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 72, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', zIndex: 10 }}>
        {/* Low count warning */}
        {showLowCountWarning && (
          <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, padding: '0 48px' }}>
            <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(238,236,230,0.65)', lineHeight: 1.4, fontWeight: 300 }}>
                Fewer than 15 words selected. Results may be less accurate.
              </span>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <button onClick={handleContinueAnyway} style={{ fontSize: 13, fontWeight: 500, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer' }}>Continue anyway</button>
                <button onClick={() => { setShowLowCountWarning(false); setPendingAction(null) }} style={{ fontSize: 13, color: 'rgba(238,236,230,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button>
              </div>
            </div>
          </div>
        )}

        <span style={{ fontSize: 13, color: counterColor, transition: 'color 300ms ease', fontWeight: 400 }}>{counterText}</span>

        {isList1 ? (
          <button
            onClick={finishList1}
            disabled={!canProceed}
            style={{ height: 42, padding: '0 28px', borderRadius: 100, background: canProceed ? '#eeece6' : 'rgba(255,255,255,0.08)', color: canProceed ? '#080808' : 'rgba(238,236,230,0.2)', fontSize: 13, fontWeight: 600, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', transition: 'all 150ms ease' }}
            onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = '#ffffff' }}
            onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = '#eeece6' }}
          >
            Continue &rarr;
          </button>
        ) : (
          <button
            onClick={submitAssessment}
            disabled={!canProceed || isSubmittingAnimating}
            style={{ height: 42, padding: '0 28px', borderRadius: 100, background: canProceed ? '#eeece6' : 'rgba(255,255,255,0.08)', color: canProceed ? '#080808' : 'rgba(238,236,230,0.2)', fontSize: 13, fontWeight: 600, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', transition: 'all 150ms ease' }}
            onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = '#ffffff' }}
            onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = '#eeece6' }}
          >
            {isSubmittingAnimating ? 'Analyzing...' : 'Complete calibration'}
          </button>
        )}
      </div>
    </div>
  )
}
