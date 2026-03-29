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
    emotionalLine: "You hold the line on quality when everyone else has rationalized their way past it.",
  },
  Renegade: {
    coreSignal: "You change the energy in a room the moment you walk in — and the direction shortly after.",
    whereYouWin: "Competitive, high-visibility environments where momentum is the product.",
    watchFor: "What you start brilliantly needs someone to finish — and that someone isn't always there.",
    emotionalLine: "You say the thing no one else will say, then prove you were right.",
  },
  Catalyst: {
    coreSignal: "You make things feel possible — then make them feel urgent.",
    whereYouWin: "Launch phases and new initiatives where energy is the scarce resource.",
    watchFor: "The gap between what you start and what gets completed can quietly widen.",
    emotionalLine: "You create motion in rooms that had gone completely still.",
  },
  Diplomat: {
    coreSignal: "You set expectations before the problem develops — and people remember that.",
    whereYouWin: "Stakeholder-intensive environments where trust is the actual deliverable.",
    watchFor: "Prioritizing alignment over speed can cost you decisions that needed to be made.",
    emotionalLine: "You hold people together through situations that should have broken them apart.",
  },
  Rainmaker: {
    coreSignal: "You open doors through warmth, not pressure — and they stay open.",
    whereYouWin: "External-facing roles where authentic relationships determine outcomes.",
    watchFor: "Your generosity can be mistaken for a blank check by people who will test its limits.",
    emotionalLine: "You open doors that shouldn't open, through warmth alone.",
  },
  Unifier: {
    coreSignal: "You notice when people are struggling before anyone else does — and you do something about it.",
    whereYouWin: "Team-intensive environments where interpersonal trust is what makes everything else work.",
    watchFor: "Protecting people from discomfort can let problems fester longer than they should.",
    emotionalLine: "People trust you before they know why. That's not charm — that's integrity.",
  },
  Anchor: {
    coreSignal: "You prioritize consistency over visibility — and people notice.",
    whereYouWin: "Operations-intensive roles where reliability and follow-through are the actual product.",
    watchFor: "Being the person everything goes through can quietly become the person everything depends on.",
    emotionalLine: "Steady isn't a compromise. For you, it's the strategy.",
  },
  Navigator: {
    coreSignal: "You already planned for the problem someone is about to bring you.",
    whereYouWin: "Complex environments where the ability to sequence and anticipate determines outcomes.",
    watchFor: "Waiting for perfect information can delay decisions that needed to happen yesterday.",
    emotionalLine: "You see three moves ahead and let others think it was obvious.",
  },
  Sentinel: {
    coreSignal: "You catch the thing nobody was looking for — before it becomes the thing nobody can ignore.",
    whereYouWin: "Compliance and quality roles where accuracy has real consequences that compound.",
    watchFor: "Precision applied to low-stakes decisions can slow environments that need momentum.",
    emotionalLine: "You catch what would embarrass the organization later. Quietly. Every time.",
  },
  Standard: {
    coreSignal: "You deliver the same quality in year ten that you delivered in week one.",
    whereYouWin: "Process-dependent roles where repeatability is more valuable than variability.",
    watchFor: "Consistency can become inertia when the situation genuinely requires adaptation.",
    emotionalLine: "The machine runs because you run it. That's not small — that's everything.",
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
    emotionalLine: "You don't wait for permission. You wait for clarity — then you move.",
  },
  Trailblazer: {
    coreSignal: "You set a pace others didn't know was possible — and then hold it.",
    whereYouWin: "Competitive scaling environments where performance itself is the differentiator.",
    watchFor: "The bar you set can exhaust people who are genuinely trying to keep up.",
    emotionalLine: "You raise what everyone thought was possible, then make it look routine.",
  },
  Veteran: {
    coreSignal: "You've seen what happens when people cut corners — and you show up every time to make sure it doesn't.",
    whereYouWin: "Operations and project leadership where sustained reliable performance matters most.",
    watchFor: "You may stay loyal to approaches that have quietly stopped working.",
    emotionalLine: "You're the person teams rely on when things quietly start to fall apart.",
  },
}

const PENTAGON_LABELS = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Dec. Speed']
const PROC_DIMS = ['EXECUTION', 'OWNERSHIP', 'ADAPTABILITY', 'COLLABORATION', 'DECISION SPEED']

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'welcome' | 'list1' | 'list2' | 'processing' | 'complete' | 'error'

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

  // Processing screen animation (Change 2)
  const [procStage, setProcStage] = useState(0) // 0=black,1=line,2-6=dims,7=fadeout

  // Results animation (Change 3)
  const [resultMoment, setResultMoment] = useState(0) // 0-10
  const [displayedName, setDisplayedName] = useState('')

  // Timer management (all timeouts tracked for cleanup)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

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
        if (data.phase && data.phase !== 'loading' && data.phase !== 'processing') {
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

  // Processing screen animation sequence
  useEffect(() => {
    if (phase !== 'processing') { setProcStage(0); return }
    schedule(() => setProcStage(1), 400)
    schedule(() => setProcStage(2), 900)
    schedule(() => setProcStage(3), 1060)
    schedule(() => setProcStage(4), 1220)
    schedule(() => setProcStage(5), 1380)
    schedule(() => setProcStage(6), 1540)
    schedule(() => setProcStage(7), 1800)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Results sequence
  useEffect(() => {
    if (phase !== 'complete' || !completionData) return
    setResultMoment(0)
    setDisplayedName('')

    const name = completionData.profileName

    schedule(() => setResultMoment(1), 200)
    schedule(() => setResultMoment(2), 500)
    schedule(() => setResultMoment(3), 600)

    // Typewriter starts at 1400ms
    schedule(() => {
      setResultMoment(4)
      let idx = 0
      const tick = setInterval(() => {
        idx++
        setDisplayedName(name.slice(0, idx))
        if (idx >= name.length) clearInterval(tick)
      }, 40)
      timers.current.push(tick as unknown as ReturnType<typeof setTimeout>)
    }, 1400)

    schedule(() => setResultMoment(5), 1800)
    schedule(() => setResultMoment(6), 2200)
    schedule(() => setResultMoment(7), 2800)
    schedule(() => setResultMoment(8), 3200)
    schedule(() => setResultMoment(9), 3800)
    schedule(() => setResultMoment(10), 4600)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    await doSubmitAssessment()
  }

  async function doSubmitAssessment() {
    setShowLowCountWarning(false)
    setPendingAction(null)
    const t2 = Date.now() - page2StartRef.current
    setTimeOnPage2Ms(t2)
    setPhase('processing')

    const payload = {
      list1Checked: Array.from(list1Checked),
      list2Checked: Array.from(list2Checked),
      list1Order, list2Order,
      timeOnPage1Ms, timeOnPage2Ms: t2,
      scoringVariant,
    }

    // Run animation (2200ms minimum) and API call in parallel
    const minDuration = new Promise<void>(res => setTimeout(res, 2200))

    type ApiResult = { data: CompletionData | null; error: boolean }
    const apiCall = async (): Promise<ApiResult> => {
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
            localStorage.removeItem(storageKey)
            return { data: data as CompletionData, error: false }
          }
          if (data.error === 'Assessment already completed') {
            return { data: null, error: false }
          }
          throw new Error(data.error || 'Submission failed')
        } catch {
          retries++
          if (retries < 3) await new Promise(r => setTimeout(r, 1000 * retries))
        }
      }
      return { data: null, error: true }
    }

    const [, result] = await Promise.all([minDuration, apiCall()])

    if (result.error) {
      setErrorMsg('Something went wrong. Your answers are saved — please try again.')
      setPhase('list2')
      return
    }
    if (result.data) setCompletionData(result.data)
    setPhase('complete')
  }

  function handleContinueAnyway() {
    if (pendingAction === 'finishList1') doFinishList1()
    else if (pendingAction === 'submitAssessment') doSubmitAssessment()
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
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes pent-bg {
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

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            <polygon points={ringPts(160, 160, 140)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              style={{ strokeDasharray: 830, animation: 'pent-bg 6s ease-in-out infinite' }} />
            <polygon points={ringPts(160, 160, 90)} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1"
              style={{ strokeDasharray: 540, animation: 'pent-bg 6s ease-in-out infinite', animationDelay: '1s' }} />
          </svg>
        </div>

        <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1, animation: 'fadeUp 500ms ease-out both' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(238,236,230,0.5)', letterSpacing: '-0.01em' }}>{PRODUCT_NAME}</span>
          </div>
          {firstName && (
            <p style={{ fontSize: 16, color: 'rgba(238,236,230,0.45)', margin: '0 0 12px', fontWeight: 300 }}>Hi {firstName},</p>
          )}
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, color: '#eeece6', margin: '0 0 20px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            You&rsquo;ve been selected for a behavioral calibration.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(238,236,230,0.52)', margin: '0 0 6px', fontWeight: 300, lineHeight: 1.5 }}>
            There are no right or wrong answers.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(238,236,230,0.52)', margin: '0 0 32px', fontWeight: 300, lineHeight: 1.5 }}>
            Select words that feel true. Don&rsquo;t overthink it.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px', marginBottom: 40 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(238,236,230,0.55)', lineHeight: 1.65, fontWeight: 300 }}>
              When you finish, you&rsquo;ll see your behavioral profile — your archetype, your signal pattern, and where you&rsquo;re likely to perform at your best.
            </p>
          </div>
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

  // ─── PROCESSING (Change 2) ────────────────────────────────────────────────

  if (phase === 'processing') {
    const fading = procStage === 7
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
        <style>{`
          @keyframes proc-fadein { from { opacity: 0 } to { opacity: 1 } }
        `}</style>

        {/* Phase 2: "Analyzing 94 signals." */}
        <p style={{
          fontSize: 16, fontWeight: 300, color: 'rgba(238,236,230,0.55)',
          margin: '0 0 20px', letterSpacing: '0.01em',
          opacity: procStage >= 1 ? (fading ? 0 : 1) : 0,
          transition: procStage >= 1 ? (fading ? 'opacity 200ms ease' : 'opacity 250ms ease') : 'none',
        }}>
          Analyzing 94 signals.
        </p>

        {/* Phase 3: Dimension labels */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {PROC_DIMS.map((dim, i) => (
            <p key={dim} style={{
              fontSize: 10, fontWeight: 300, color: 'rgba(238,236,230,0.25)',
              textTransform: 'uppercase', letterSpacing: '0.2em',
              margin: 0,
              opacity: procStage >= i + 2 ? (fading ? 0 : 1) : 0,
              transition: procStage >= i + 2 ? (fading ? 'opacity 200ms ease' : 'opacity 200ms ease') : 'none',
            }}>
              {dim}
            </p>
          ))}
        </div>
      </div>
    )
  }

  // ─── COMPLETE (Change 3) ──────────────────────────────────────────────────

  if (phase === 'complete') {
    const firstName = candidateName ? candidateName.split(' ')[0] : ''
    const profile = REFERENCE_PROFILES.find(p => p.name === completionData?.profileName)
    const pentagonValues = profile ? profileToValues(profile.coords) : [0.5, 0.5, 0.5, 0.5, 0.5]
    const insights = completionData ? INSIGHTS[completionData.profileName] : null

    // Pentagon perimeter ≈ 530px
    const PENT_PERIMETER = 530

    return (
      <div style={{ minHeight: '100svh', background: '#080808', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes rings-in { from { opacity: 0 } to { opacity: 1 } }
          @keyframes pent-stroke {
            from { stroke-dashoffset: ${PENT_PERIMETER}; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes pent-fill { from { fill-opacity: 0 } to { fill-opacity: 1 } }
          @keyframes blink { 0%,100% { opacity: 0.3 } 50% { opacity: 0 } }
        `}</style>

        {/* MOMENT 1 — Greeting, centered fullscreen */}
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 10,
          opacity: resultMoment === 1 ? 1 : 0,
          transition: resultMoment >= 2 ? 'opacity 200ms ease' : 'none',
        }}>
          {resultMoment >= 1 && (
            <p style={{ fontSize: 18, fontWeight: 300, color: 'rgba(238,236,230,0.45)', margin: 0, animation: 'fadeIn 300ms ease both' }}>
              {firstName ? `You're done, ${firstName}.` : "You're done."}
            </p>
          )}
        </div>

        {/* MOMENTS 2–6 — Main reveal content */}
        {resultMoment >= 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '18vh', paddingBottom: 72, paddingLeft: 24, paddingRight: 24 }}>

            {/* MOMENT 2 — Pentagon */}
            <div style={{ animation: 'fadeIn 400ms ease both' }}>
              <svg width="252" height="244" viewBox="-32 -24 284 268">
                {/* Background rings fade in first */}
                <polygon points={ringPts(110, 110, 88)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
                  style={{ animation: 'rings-in 400ms ease-out both', animationDelay: '0ms' }} />
                <polygon points={ringPts(110, 110, 44)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"
                  style={{ animation: 'rings-in 400ms ease-out both', animationDelay: '100ms' }} />
                {/* Axis lines */}
                {Array.from({ length: 5 }, (_, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  return (
                    <line key={i}
                      x1="110" y1="110"
                      x2={(110 + 88 * Math.cos(a)).toFixed(2)}
                      y2={(110 + 88 * Math.sin(a)).toFixed(2)}
                      stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
                      style={{ animation: 'rings-in 400ms ease-out both', animationDelay: '50ms' }}
                    />
                  )
                })}
                {/* Data polygon: stroke draws in 800ms, fill fades in after */}
                <polygon
                  points={pentagonPts(pentagonValues, 110, 110, 88)}
                  fill="rgba(37,99,235,0.07)"
                  stroke="#2563EB"
                  strokeWidth="2"
                  style={{
                    strokeDasharray: PENT_PERIMETER,
                    animation: `pent-stroke 800ms cubic-bezier(0.25,0.46,0.45,0.94) 200ms forwards,
                                 pent-fill 400ms ease 900ms forwards`,
                    fillOpacity: 0,
                    strokeDashoffset: PENT_PERIMETER,
                  }}
                />
                {/* Vertex labels: appear as stroke passes each vertex */}
                {PENTAGON_LABELS.map((label, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  const lx = 110 + 106 * Math.cos(a)
                  const ly = 110 + 106 * Math.sin(a)
                  const labelDelay = 200 + Math.round((i / 5) * 800)
                  return (
                    <text key={label} x={lx.toFixed(1)} y={ly.toFixed(1)}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="rgba(238,236,230,0.3)" fontSize="8.5"
                      fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                      style={{ animation: `fadeIn 200ms ease both`, animationDelay: `${labelDelay + 100}ms`, opacity: 0 }}
                    >{label}</text>
                  )
                })}
              </svg>
            </div>

            {/* MOMENT 3 — Archetype name */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              {resultMoment >= 4 && (
                <h1 style={{
                  fontSize: 'clamp(52px, 7vw, 80px)', fontWeight: 900, color: '#eeece6',
                  letterSpacing: '-0.02em', lineHeight: 1, margin: 0,
                  fontFamily: '"Barlow Condensed", "SF Pro Display", -apple-system, sans-serif',
                }}>
                  {displayedName}
                  <span style={{ opacity: 0.25, animation: 'blink 0.7s step-end infinite' }}>|</span>
                </h1>
              )}

              {/* MOMENT 3b — Group label */}
              {resultMoment >= 5 && completionData && (
                <p style={{ fontSize: 16, fontStyle: 'italic', color: 'rgba(238,236,230,0.38)', fontWeight: 300, margin: '10px 0 0', animation: 'fadeIn 300ms ease both' }}>
                  {completionData.profileGroup}
                </p>
              )}
            </div>

            {/* MOMENT 4 — Insight blocks */}
            {insights && (
              <div style={{ width: '100%', maxWidth: 440, marginTop: 40, textAlign: 'left' }}>
                {resultMoment >= 6 && (
                  <div style={{ marginBottom: 20, animation: 'fadeUp 400ms ease both' }}>
                    <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.3)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 6px', fontWeight: 500 }}>Core Signal</p>
                    <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.8)', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>{insights.coreSignal}</p>
                  </div>
                )}
                {resultMoment >= 7 && (
                  <div style={{ marginBottom: 20, animation: 'fadeUp 400ms ease both' }}>
                    <p style={{ fontSize: 9, color: '#3aa868', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 6px', fontWeight: 500 }}>Where You Win</p>
                    <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.65)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{insights.whereYouWin}</p>
                  </div>
                )}
                {resultMoment >= 8 && (
                  <div style={{ marginBottom: 0, animation: 'fadeUp 400ms ease both' }}>
                    <p style={{ fontSize: 9, color: '#c8a832', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 6px', fontWeight: 500 }}>Watch For</p>
                    <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.55)', lineHeight: 1.6, margin: 0, fontWeight: 300, fontStyle: 'italic' }}>{insights.watchFor}</p>
                  </div>
                )}
              </div>
            )}

            {/* MOMENT 5 — Emotional line */}
            {resultMoment >= 9 && insights && (
              <p style={{
                fontSize: 17, fontWeight: 400, color: 'rgba(238,236,230,0.72)',
                lineHeight: 1.65, margin: '32px 0 0', textAlign: 'center',
                maxWidth: 520, animation: 'fadeIn 500ms ease both',
              }}>
                {insights.emotionalLine}
              </p>
            )}

            {/* MOMENT 6 — Closing */}
            {resultMoment >= 10 && (
              <div style={{ width: '100%', maxWidth: 440, marginTop: 40, animation: 'fadeIn 400ms ease both' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 22px' }}>
                  <p style={{ fontSize: 13, color: '#eeece6', margin: '0 0 4px', fontWeight: 400 }}>
                    Your profile has been shared with your search partner.
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(238,236,230,0.4)', margin: 0, fontWeight: 300, lineHeight: 1.55 }}>
                    They&rsquo;ll use this to evaluate role alignment. Your results are on file.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ─── WORD LISTS (Change 1: signal panel removed, grid expanded to 860px) ──

  const isList1 = phase === 'list1'
  const currentOrder = isList1 ? list1Order : list2Order
  const currentChecked = isList1 ? list1Checked : list2Checked
  const selectionCount = currentChecked.size
  const canProceed = selectionCount >= 10

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
          cursor: pointer; transition: border-color 120ms ease, color 120ms ease, background 120ms ease, transform 120ms ease;
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
        @media (max-width: 600px) {
          .word-chips { padding: 0 16px !important; }
          .list-header { padding: 24px 16px 16px !important; }
          .bottom-bar { padding: 0 16px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ height: 48, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontSize: 13, color: 'rgba(238,236,230,0.3)', fontWeight: 400 }}>{PRODUCT_NAME}</span>
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
      <div className="list-header" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 48px 24px' }}>
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

      {/* Word chips — full 860px width, no signal panel */}
      <div className="word-chips" style={{ maxWidth: 860, margin: '0 auto', padding: '0 48px' }}>
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

      {/* Bottom bar */}
      <div className="bottom-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 72, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', zIndex: 10 }}>
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
            disabled={!canProceed}
            style={{ height: 42, padding: '0 28px', borderRadius: 100, background: canProceed ? '#eeece6' : 'rgba(255,255,255,0.08)', color: canProceed ? '#080808' : 'rgba(238,236,230,0.2)', fontSize: 13, fontWeight: 600, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', transition: 'all 150ms ease' }}
            onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = '#ffffff' }}
            onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = '#eeece6' }}
          >
            Complete calibration
          </button>
        )}
      </div>
    </div>
  )
}
