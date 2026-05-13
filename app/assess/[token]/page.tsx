'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ADJECTIVES } from '@/lib/data/adjectives'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { DEPTH, DIM_DEPTH } from '@/lib/data/depth'
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
    coreSignal: "You clear the path for other people's execution without making it obvious that's what you're doing. The room moves because you removed the friction — they just don't always know when you did it.",
    whereYouWin: "Roles where authority is expected but formal title is not enough — where results require pulling the right people in the right direction, across competing agendas, without creating enemies.",
    watchFor: "The alignment you manufacture is real but fragile. You can surface buy-in without fully testing it, and gaps show up later at the worst possible moment.",
    emotionalLine: "Rooms reorganize themselves around you — sometimes before you say a word.",
  },
  Pioneer: {
    coreSignal: "You act before the room has agreed on what to do, and the gap between your decision and everyone else's awareness rarely bothers you. Ownership isn't something you wait to be assigned.",
    whereYouWin: "Roles where accountability is individual, authority is implicit, and the organization rewards outcomes over process. Any environment where the cost of waiting exceeds the cost of being wrong.",
    watchFor: "You leave people behind not out of malice but out of momentum. The information they had was relevant. You moved anyway. This repeats.",
    emotionalLine: "You were already three steps ahead before anyone called the meeting.",
  },
  Purist: {
    coreSignal: "You hold the standard even after the room has quietly decided the standard no longer applies. You're not moralistic about it — you just don't accept the rationalization.",
    whereYouWin: "Environments where the cost of error compounds — compliance, finance, safety-critical operations, technical quality. Anywhere the wrong answer is expensive and invisible until it isn't.",
    watchFor: "You apply the same rigor to low-stakes decisions that you apply to high-stakes ones. This is not efficient. You probably know it and do it anyway.",
    emotionalLine: "You hold the line on quality when everyone else has rationalized their way past it.",
  },
  Renegade: {
    coreSignal: "You create forward motion by force of presence — and the motion persists longer than the friction you leave behind. You change what the room is doing by being in it.",
    whereYouWin: "High-visibility competitive environments where energy is a structural resource. Sales, turnarounds, launches, anything where someone needs to ignite a room that has gone cold.",
    watchFor: "What you start brilliantly needs someone to finish. That someone is rarely you, and the cycle repeats at a rate others notice before you do.",
    emotionalLine: "You say the thing no one else will say, then prove you were right.",
  },
  Catalyst: {
    coreSignal: "You convert latent possibility into active motion without needing the full plan in place first. You make the outcome feel achievable, which is often the precondition for it becoming achievable.",
    whereYouWin: "Early-stage work, stalled teams, new initiatives — any situation where someone needs to believe before the evidence is there. You supply the conviction that gets things off the ground.",
    watchFor: "Initiation and completion are structurally separate for you. The gap between them is a real cost you carry, and it accumulates across projects.",
    emotionalLine: "You create motion in rooms that had gone completely still.",
  },
  Diplomat: {
    coreSignal: "You manage the relationship layer that everyone else is pretending doesn't exist. You set expectations before misalignment becomes visible, and people trust you because of it.",
    whereYouWin: "Multi-stakeholder environments where trust is the actual delivery mechanism. Any role where what you say matters less than whether people believe you'll follow through.",
    watchFor: "The alignment you build can outlast the decision it's built around. You can sustain a flawed direction by making every stakeholder feel heard.",
    emotionalLine: "You hold people together through situations that should have broken them apart.",
  },
  Rainmaker: {
    coreSignal: "You build the kind of relationships that make people want to help you before they fully understand why. Warmth is not a tactic — it's how you operate, and others can tell the difference.",
    whereYouWin: "Roles where the path runs through people — business development, client partnership, any environment where outcomes depend on trust built over time rather than authority exercised in the moment.",
    watchFor: "Your warmth creates expectations that don't always match your capacity or interest. People who test your limits will eventually find them.",
    emotionalLine: "You open doors that shouldn't open, through warmth alone.",
  },
  Unifier: {
    coreSignal: "You notice what's wrong with the team before it's been named, and you do something about it without making it an event. The team's functioning is something you feel as a personal responsibility.",
    whereYouWin: "Team-intensive environments where the interpersonal layer is what actually determines output. Roles where holding the group together through difficulty is itself the high-leverage function.",
    watchFor: "Protecting people from discomfort can become protecting dysfunction from accountability. The team you're holding together may need to break before it can reform correctly.",
    emotionalLine: "People trust you before they know why. That's not charm — that's integrity.",
  },
  Anchor: {
    coreSignal: "You deliver in a straight line regardless of what the environment is doing around you. Consistency isn't your brand — it's your structural default, and it shows up in the quality of your output over time.",
    whereYouWin: "Operations-intensive roles where the product is consistent reliable output and the cost of variability compounds. Anywhere the machine needs to keep running regardless of who is watching.",
    watchFor: "Being the person everything runs through eventually becomes being the person everything depends on. The difference matters when you're not there.",
    emotionalLine: "Steady isn't a compromise. For you, it's the strategy.",
  },
  Navigator: {
    coreSignal: "You build the map before anyone knows they'll need it, then let others follow it without explaining where it came from. Anticipation is not instinct for you — it's method.",
    whereYouWin: "Complex multi-variable environments where foresight is structurally valuable — project leadership, operations planning, any role where poor sequencing creates downstream costs that are hard to recover from.",
    watchFor: "You can stay in preparation long enough to arrive late. The pull to refine the plan one more time is real and you don't always recognize when it has become the problem.",
    emotionalLine: "You see three moves ahead and let others think it was obvious.",
  },
  Sentinel: {
    coreSignal: "You catch what others rationalize past — not sometimes, but as a structural feature of how you operate. The thing that seems minor is the thing you track.",
    whereYouWin: "High-accuracy, high-consequence environments where the system fails if someone misses what others considered low-priority. Compliance, audit, quality control, risk, anything where the wrong detail is expensive.",
    watchFor: "The same scrutiny you apply to critical decisions you also apply to minor ones. You can't always distinguish between them in the moment, and the cost is pace.",
    emotionalLine: "You catch what would embarrass the organization later. Quietly. Every time.",
  },
  Standard: {
    coreSignal: "You repeat quality at a rate others can't sustain. Not through discipline alone — it's become structural. Year one and year ten produce the same thing, and that's rarer than it sounds.",
    whereYouWin: "Process-dependent roles where repeatability is more valuable than innovation, and the cost of variability compounds over time. Operations, production, service delivery at scale.",
    watchFor: "The consistency that makes you reliable can become the inertia that makes you hard to change. When the situation genuinely requires a different approach, you may not recognize the signal in time.",
    emotionalLine: "The machine runs because you run it. That's not small — that's everything.",
  },
  Agent: {
    coreSignal: "You bring depth that others don't question in the moment, even when they should. The knowledge you carry took years to build and it shows in how you operate — including how little you need to assert it.",
    whereYouWin: "Specialist roles where domain depth is the actual differentiator. Advisory, technical leadership, expert functions where shallow generalism creates real risk and only depth resolves it.",
    watchFor: "The authority your expertise grants doesn't transfer cleanly to adjacent domains. The confidence carries, but the foundation doesn't, and the gap isn't always visible until it is.",
    emotionalLine: "You know things that can't be learned quickly, and everyone in the room knows it.",
  },
  Executor: {
    coreSignal: "You build the structures that keep producing after you've moved on — then move on. Scale isn't an aspiration; it's the operating context you're designed for.",
    whereYouWin: "Scaling environments where ambition and operational discipline are required simultaneously and the role demands someone who can hold both without trading one for the other.",
    watchFor: "You distinguish poorly between people who can't meet your standard and people who won't. The difference matters for how you manage it, and the error is costly.",
    emotionalLine: "You don't wait for permission. You wait for clarity — then you move.",
  },
  Trailblazer: {
    coreSignal: "You set the pace by operating at it — not by announcing it. Others adjust their sense of what's possible around you, sometimes before they've consciously noticed what you've done.",
    whereYouWin: "Performance-intensive environments where output is the actual differentiator. Competitive sales, individual contributor leadership, any context where your own numbers are the measure that matters.",
    watchFor: "You can exhaust people who are genuinely trying to match your standard, and you may read their exhaustion as insufficient effort rather than real limit.",
    emotionalLine: "You raise what everyone thought was possible, then make it look routine.",
  },
  Veteran: {
    coreSignal: "You've seen this break before. That's not a credential — it's what makes your judgment structurally different from someone who hasn't watched the same mistake compound across time.",
    whereYouWin: "Long-horizon roles where institutional knowledge and sustained reliability are what the function actually requires. Operations, program leadership, any context where the stakes accumulate over years.",
    watchFor: "Experience is a pattern-matching system. The pattern you've seen before may not be the right frame for what's in front of you now, and you may not notice until the mismatch is expensive.",
    emotionalLine: "You're the person teams rely on when things quietly start to fall apart.",
  },
}

const PENTAGON_LABELS = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']

// ─── Results Helpers ─────────────────────────────────────────────────────────

function getInterpretiveLine(values: number[]): string {
  const dimNames = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']
  const ranked = [...values.map((v, i) => ({ v, i }))].sort((a, b) => b.v - a.v)
  return `Defining edge: ${dimNames[ranked[0].i]} + ${dimNames[ranked[1].i]}`
}

function getDimCaption(dimIdx: number, values: number[]): string {
  const dimNames = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']
  const ranked = [...values.map((v, i) => ({ v, i }))].sort((a, b) => b.v - a.v)
  const rank = ranked.findIndex(r => r.i === dimIdx)
  const name = dimNames[dimIdx]
  if (rank === 0) return `${name} is one of your defining edges.`
  if (rank === 1) return `${name} is a strong secondary signal.`
  if (rank >= 3) return `${name} is not your dominant signal.`
  return `${name} is present, but not your primary driver.`
}
const PROC_DIMS = ['EXECUTION', 'OWNERSHIP', 'ADAPTABILITY', 'COLLABORATION', 'DECISION SPEED']

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'consent' | 'demographics' | 'welcome' | 'list1' | 'list2' | 'processing' | 'complete' | 'error'

interface DemographicsData {
  gender:     string | null
  race:       string | null
  ageRange:   string | null
  disability: string | null
  veteran:    string | null
}

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

  const [demographics, setDemographics] = useState<DemographicsData>({ gender: null, race: null, ageRange: null, disability: null, veteran: null })

  const [showLowCountWarning, setShowLowCountWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<'finishList1' | 'submitAssessment' | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scoringVariant, setScoringVariant] = useState<'v1_stepped' | 'v2_quadratic'>('v2_quadratic')

  // Processing screen animation (Change 2)
  const [procStage, setProcStage] = useState(0) // 0=black,1=line,2-6=dims,7=fadeout

  // Results animation
  const [resultMoment, setResultMoment] = useState(0) // 0-12
  const [hoveredDim, setHoveredDim] = useState<number | null>(null)
  const [expandedDim, setExpandedDim] = useState<number | null>(null)

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
          if (phase === 'loading') setPhase('consent')
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
    setHoveredDim(null)
    setExpandedDim(null)

    // Phase 1: full-screen calibration reveal (fixed overlay, moments 1–6)
    // Phase 2: fixed overlay fades out, scrollable page fades in (moment 7+)
    schedule(() => setResultMoment(1),   200)   // greeting
    schedule(() => setResultMoment(2),   500)   // greeting fades
    schedule(() => setResultMoment(3),   600)   // large pentagon mounts + draws (CSS handles sequence internally)
    schedule(() => setResultMoment(4),  1900)   // archetype name blur-reveals (1300ms after pentagon mounts)
    schedule(() => setResultMoment(5),  2380)   // category label
    schedule(() => setResultMoment(6),  2540)   // interpretive line
    schedule(() => setResultMoment(7),  3200)   // COLLAPSE reveal → scrollable page fades in (all phase 2 content uses CSS delays)
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

  // ─── CONSENT ─────────────────────────────────────────────────────────────

  if (phase === 'consent') {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: '32px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif' }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 400ms ease-out both' }}>

          {/* Wordmark */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(238,236,230,0.5)', letterSpacing: '-0.01em' }}>{PRODUCT_NAME}</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#eeece6', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Before you begin
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(238,236,230,0.45)', margin: '0 0 32px', fontWeight: 300, lineHeight: 1.55 }}>
            This assessment collects behavioral signals. Here&rsquo;s what you should know.
          </p>

          {/* Disclosure cards */}
          {([
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
              ),
              label: 'What we collect',
              body: 'Your word selections and completion time. No other personal data is captured during the assessment. Your name and email were provided by the firm that invited you.',
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
              label: 'How long we retain it',
              body: 'Your profile is retained for the duration of the search process and for up to 12 months afterward. You may request deletion at any time.',
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              label: 'Your rights',
              body: 'You can request a copy or deletion of your data by emailing privacy@veltro.ai. Results are shared with the firm that invited you and are not sold to third parties.',
            },
          ] as const).map(({ icon, label, body }) => (
            <div key={label} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(238,236,230,0.5)' }}>
                {icon}
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'rgba(238,236,230,0.8)', letterSpacing: '-0.01em' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(238,236,230,0.42)', fontWeight: 300, lineHeight: 1.6 }}>{body}</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 32 }}>
            <button
              onClick={() => setPhase('demographics')}
              style={{ width: '100%', height: 52, borderRadius: 100, background: '#eeece6', color: '#080808', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 160ms ease', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#eeece6'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              I understand — continue
            </button>
            <p style={{ fontSize: 11, color: 'rgba(238,236,230,0.2)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
              By continuing you acknowledge that your responses will be processed as described above.
            </p>
          </div>

        </div>
      </div>
    )
  }

  // ─── DEMOGRAPHICS ────────────────────────────────────────────────────────

  if (phase === 'demographics') {
    const DEMO_FIELDS: Array<{
      key: keyof DemographicsData
      question: string
      options: Array<{ value: string; label: string }>
    }> = [
      {
        key: 'gender',
        question: 'Gender identity',
        options: [
          { value: 'male',       label: 'Man' },
          { value: 'female',     label: 'Woman' },
          { value: 'nonbinary',  label: 'Non-binary / gender non-conforming' },
          { value: 'prefer_not', label: 'Prefer not to say' },
        ],
      },
      {
        key: 'race',
        question: 'Race / Ethnicity',
        options: [
          { value: 'white',       label: 'White' },
          { value: 'black',       label: 'Black or African American' },
          { value: 'hispanic',    label: 'Hispanic or Latino' },
          { value: 'asian',       label: 'Asian' },
          { value: 'aian',        label: 'American Indian or Alaska Native' },
          { value: 'nhpi',        label: 'Native Hawaiian or Pacific Islander' },
          { value: 'two_or_more', label: 'Two or more races' },
          { value: 'prefer_not',  label: 'Prefer not to say' },
        ],
      },
      {
        key: 'ageRange',
        question: 'Age range',
        options: [
          { value: 'under_30',   label: 'Under 30' },
          { value: '30_39',      label: '30–39' },
          { value: '40_49',      label: '40–49' },
          { value: '50_59',      label: '50–59' },
          { value: '60_plus',    label: '60 or older' },
          { value: 'prefer_not', label: 'Prefer not to say' },
        ],
      },
      {
        key: 'disability',
        question: 'Disability status',
        options: [
          { value: 'yes',        label: 'Yes, I have a disability' },
          { value: 'no',         label: 'No disability' },
          { value: 'prefer_not', label: 'Prefer not to say' },
        ],
      },
      {
        key: 'veteran',
        question: 'Veteran status',
        options: [
          { value: 'protected',     label: 'I am a protected veteran' },
          { value: 'not_protected', label: 'I am not a protected veteran' },
          { value: 'prefer_not',    label: 'Prefer not to say' },
        ],
      },
    ]

    async function saveDemographics(demo: DemographicsData, consented: boolean) {
      if (!consented) { setPhase('welcome'); return }
      try {
        await fetch(`/api/assess/${token}/demographics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demo),
        })
      } catch { /* best-effort */ }
      setPhase('welcome')
    }

    const anyAnswered = Object.values(demographics).some(v => v !== null)

    return (
      <div style={{ minHeight: '100svh', background: '#080808', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif', overflowY: 'auto' }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px 64px', animation: 'fadeUp 350ms ease-out both' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(238,236,230,0.5)', letterSpacing: '-0.01em' }}>{PRODUCT_NAME}</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#eeece6', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Optional: help us monitor for fairness
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.42)', margin: '0 0 6px', fontWeight: 300, lineHeight: 1.55 }}>
            This is voluntary. Your answers are anonymized in aggregate reports and never shared with the hiring firm for your individual assessment.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.28)', margin: '0 0 32px', fontWeight: 300 }}>
            Each question is independently skippable.
          </p>

          {DEMO_FIELDS.map(field => (
            <div key={field.key} style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(238,236,230,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                {field.question}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {field.options.map(opt => {
                  const selected = demographics[field.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDemographics(prev => ({ ...prev, [field.key]: selected ? null : opt.value }))}
                      style={{
                        padding: '8px 14px', borderRadius: 100, fontSize: 13,
                        border: selected ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        background: selected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                        color: selected ? 'rgba(238,236,230,0.95)' : 'rgba(238,236,230,0.5)',
                        cursor: 'pointer', transition: 'all 120ms ease', fontFamily: 'inherit',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => saveDemographics(demographics, anyAnswered)}
              style={{
                width: '100%', height: 52, borderRadius: 100,
                background: '#eeece6', color: '#080808',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                transition: 'all 160ms ease', letterSpacing: '-0.01em',
              }}
            >
              {anyAnswered ? 'Submit and continue' : 'Continue without answering'}
            </button>
            <button
              onClick={() => setPhase('welcome')}
              style={{
                width: '100%', height: 44, borderRadius: 100,
                background: 'transparent', color: 'rgba(238,236,230,0.35)',
                fontSize: 13, border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', transition: 'all 160ms ease', letterSpacing: '-0.01em',
              }}
            >
              Skip entirely
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'rgba(238,236,230,0.18)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            Answers are aggregated across all candidates and never attributed to you individually.
          </p>
        </div>
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

  // ─── COMPLETE ─────────────────────────────────────────────────────────────

  if (phase === 'complete') {
    const firstName = candidateName ? candidateName.split(' ')[0] : ''
    const profile = REFERENCE_PROFILES.find(p => p.name === completionData?.profileName)
    const pentagonValues = profile ? profileToValues(profile.coords) : [0.5, 0.5, 0.5, 0.5, 0.5]
    const insights = completionData ? INSIGHTS[completionData.profileName] : null
    const interpretiveLine = getInterpretiveLine(pentagonValues)

    // Large reveal pentagon dimensions
    const RCX = 200, RCY = 200, R_MAX = 160
    // Perimeter of pentagon inscribed in r=160: 5 × 2×160×sin(π/5) ≈ 939
    const R_PERIM = 939

    // Compact profile pentagon dimensions
    const cx = 110, cy = 110, maxR = 95
    const PENT_PERIMETER = 558

    // Phase 1 is the full-screen reveal stage (moments 1–6).
    // Phase 2 content starts appearing at moment 7 as a scrollable page below.
    const inRevealStage = resultMoment < 7

    return (
      <div style={{ minHeight: '100svh', background: '#080808', overflowX: 'hidden' }}>
        <style>{`
          @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
          @keyframes fadeUp  { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes rings-in { from { opacity: 0 } to { opacity: 1 } }
          @keyframes axis-draw {
            from { stroke-dashoffset: 200px; opacity: 0; }
            to   { stroke-dashoffset: 0px;   opacity: 1; }
          }
          @keyframes pent-draw {
            from { stroke-dashoffset: ${R_PERIM}px; }
            to   { stroke-dashoffset: 0px; }
          }
          @keyframes pent-fill { from { fill-opacity: 0 } to { fill-opacity: 1 } }
          @keyframes pent-pulse {
            0%   { filter: drop-shadow(0 0 0px rgba(37,99,235,0)); }
            50%  { filter: drop-shadow(0 0 12px rgba(37,99,235,0.35)); }
            100% { filter: drop-shadow(0 0 0px rgba(37,99,235,0)); }
          }
          @keyframes pent-stroke {
            from { stroke-dashoffset: ${PENT_PERIMETER}px; }
            to   { stroke-dashoffset: 0px; }
          }
          @keyframes arch-reveal {
            from { opacity: 0; transform: translateY(12px); filter: blur(10px); }
            to   { opacity: 1; transform: translateY(0);    filter: blur(0px);  }
          }
          @keyframes reveal-collapse {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to   { opacity: 0; transform: scale(0.88) translateY(-20px); }
          }
          @keyframes radial-glow {
            from { opacity: 0; transform: scale(0.7); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* ═══════════════════════════════════════════════════
            PHASE 1 — FULL-SCREEN REVEAL STAGE
        ═══════════════════════════════════════════════════ */}
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#080808', zIndex: 20, pointerEvents: inRevealStage ? 'auto' : 'none',
          opacity: inRevealStage ? 1 : 0,
          transition: !inRevealStage ? 'opacity 500ms ease' : 'none',
        }}>

          {/* Greeting — fades before pentagon mounts */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: resultMoment === 1 ? 1 : 0,
            transition: resultMoment >= 2 ? 'opacity 220ms ease' : 'none',
            pointerEvents: 'none',
          }}>
            {resultMoment >= 1 && (
              <p style={{ fontSize: 18, fontWeight: 300, color: 'rgba(238,236,230,0.45)', margin: 0, animation: 'fadeIn 280ms ease both' }}>
                {firstName ? `You're done, ${firstName}.` : "You're done."}
              </p>
            )}
          </div>

          {/* Large calibration pentagon */}
          {resultMoment >= 3 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'fadeIn 400ms ease both',
              marginTop: '-6vh',
            }}>
              {/* Radial atmosphere */}
              <div style={{
                position: 'absolute',
                width: 'min(520px, 90vw)', height: 'min(520px, 90vw)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0.01) 50%, transparent 75%)',
                animation: 'radial-glow 800ms ease both',
                pointerEvents: 'none',
              }} />

              <div style={{ width: 'min(440px, 88vw)', aspectRatio: '440 / 428', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="-64 -48 528 496">

                  {/* Outer ring */}
                  <polygon points={ringPts(RCX, RCY, R_MAX)}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75"
                    style={{ animation: 'rings-in 400ms ease-out both', animationDelay: '0ms' }} />
                  {/* Mid ring */}
                  <polygon points={ringPts(RCX, RCY, Math.round(R_MAX * 0.63))}
                    fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="0.5"
                    style={{ animation: 'rings-in 400ms ease-out both', animationDelay: '60ms' }} />
                  {/* Inner ring */}
                  <polygon points={ringPts(RCX, RCY, Math.round(R_MAX * 0.33))}
                    fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"
                    style={{ animation: 'rings-in 400ms ease-out both', animationDelay: '120ms' }} />

                  {/* Axis lines draw outward from center */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const a = (270 + i * 72) * Math.PI / 180
                    return (
                      <line key={i}
                        x1={RCX} y1={RCY}
                        x2={(RCX + R_MAX * Math.cos(a)).toFixed(2)}
                        y2={(RCY + R_MAX * Math.sin(a)).toFixed(2)}
                        stroke="rgba(255,255,255,0.08)" strokeWidth="0.75"
                        strokeDasharray="200"
                        style={{ animation: `axis-draw 380ms ease-out ${180 + i * 40}ms both` }}
                      />
                    )
                  })}

                  {/* Data polygon — draws then pulses to confirm */}
                  <polygon
                    points={pentagonPts(pentagonValues, RCX, RCY, R_MAX)}
                    fill="rgba(37,99,235,0.07)"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: R_PERIM,
                      strokeDashoffset: R_PERIM,
                      fillOpacity: 0,
                      animation: `pent-draw 1100ms cubic-bezier(0.25,0.46,0.45,0.94) 380ms forwards,
                                   pent-fill 500ms ease 1300ms forwards,
                                   pent-pulse 600ms ease-out 1500ms both`,
                    }}
                  />

                  {/* Vertex dots */}
                  {pentagonValues.map((v, i) => {
                    const a = (270 + i * 72) * Math.PI / 180
                    const dotDelay = 380 + Math.round((i / 5) * 1100) + 120
                    return (
                      <circle key={i}
                        cx={(RCX + v * R_MAX * Math.cos(a)).toFixed(2)}
                        cy={(RCY + v * R_MAX * Math.sin(a)).toFixed(2)}
                        r="3.5" fill="#2563EB"
                        style={{ opacity: 0, animation: `fadeIn 250ms ease ${dotDelay}ms both` }}
                      />
                    )
                  })}

                  {/* Axis labels */}
                  {PENTAGON_LABELS.map((label, i) => {
                    const a = (270 + i * 72) * Math.PI / 180
                    const lx = RCX + 192 * Math.cos(a)
                    const ly = RCY + 192 * Math.sin(a)
                    const labelDelay = 380 + Math.round((i / 5) * 1100) + 280
                    const parts = label.split(' ')
                    return (
                      <text key={label} textAnchor="middle"
                        fill="rgba(238,236,230,0.28)" fontSize="13"
                        fontFamily="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
                        fontWeight="300"
                        style={{ opacity: 0, animation: `fadeIn 240ms ease ${labelDelay}ms both` }}
                      >
                        {parts.length === 1
                          ? <tspan x={lx.toFixed(1)} y={ly.toFixed(1)}>{parts[0]}</tspan>
                          : <>
                              <tspan x={lx.toFixed(1)} y={(ly - 8).toFixed(1)}>{parts[0]}</tspan>
                              <tspan x={lx.toFixed(1)} y={(ly + 9).toFixed(1)}>{parts[1]}</tspan>
                            </>
                        }
                      </text>
                    )
                  })}
                </svg>
              </div>

              {/* Archetype name — verdict stamp */}
              {resultMoment >= 4 && completionData && (
                <h1 style={{
                  fontSize: 'clamp(48px, 14vw, 108px)', fontWeight: 900, color: '#eeece6',
                  letterSpacing: '-0.025em', lineHeight: 1, margin: '16px 0 0', textAlign: 'center',
                  fontFamily: '"Barlow Condensed", "SF Pro Display", -apple-system, sans-serif',
                  animation: 'arch-reveal 480ms cubic-bezier(0.22,0.61,0.36,1) both',
                }}>
                  {completionData.profileName}
                </h1>
              )}

              {/* Category label */}
              {resultMoment >= 5 && completionData && (
                <p style={{
                  fontSize: 15, fontStyle: 'italic', color: 'rgba(238,236,230,0.36)',
                  fontWeight: 300, margin: '10px 0 0', textAlign: 'center',
                  animation: 'fadeIn 300ms ease both',
                }}>
                  {completionData.profileGroup}
                </p>
              )}

              {/* Interpretive line */}
              {resultMoment >= 6 && (
                <p style={{
                  fontSize: 12, color: 'rgba(238,236,230,0.38)', textAlign: 'center',
                  margin: '18px 0 0', fontWeight: 300, letterSpacing: '0.02em',
                  animation: 'fadeIn 300ms ease both',
                }}>
                  {interpretiveLine}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            PHASE 2 — SCROLLABLE PROFILE PAGE
            Mounts beneath fixed reveal stage; reveal fades out
        ═══════════════════════════════════════════════════ */}
        {resultMoment >= 7 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: '48px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px',
            animation: 'fadeIn 500ms ease both',
          }}>

            {/* ── Compact pentagon + identity ── */}
            <div style={{ width: 'min(240px, 80vw)', aspectRatio: '240 / 232', position: 'relative', marginBottom: '8px' }}>
              <svg width="100%" height="100%" viewBox="-38 -28 296 276">
                <polygon points={ringPts(cx, cy, maxR)}
                  fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                <polygon points={ringPts(cx, cy, Math.round(maxR * 0.63))}
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <polygon points={ringPts(cx, cy, Math.round(maxR * 0.33))}
                  fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                {Array.from({ length: 5 }, (_, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  return (
                    <line key={i} x1={cx} y1={cy}
                      x2={(cx + maxR * Math.cos(a)).toFixed(2)}
                      y2={(cy + maxR * Math.sin(a)).toFixed(2)}
                      stroke={hoveredDim === i ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}
                      strokeWidth="0.5"
                      style={{ transition: 'stroke 180ms ease' }}
                    />
                  )
                })}
                <polygon
                  points={pentagonPts(pentagonValues, cx, cy, maxR)}
                  fill="rgba(37,99,235,0.09)" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round"
                  style={{
                    strokeDasharray: PENT_PERIMETER, strokeDashoffset: PENT_PERIMETER, fillOpacity: 0,
                    animation: `pent-stroke 700ms cubic-bezier(0.25,0.46,0.45,0.94) 100ms forwards,
                                 pent-fill 350ms ease 700ms forwards`,
                  }}
                />
                {pentagonValues.map((v, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  return (
                    <circle key={i}
                      cx={(cx + v * maxR * Math.cos(a)).toFixed(2)}
                      cy={(cy + v * maxR * Math.sin(a)).toFixed(2)}
                      r="2.5"
                      fill={hoveredDim === i ? '#60a5fa' : '#2563EB'}
                      style={{
                        opacity: 0, animation: `fadeIn 200ms ease ${500 + i * 80}ms both`,
                        filter: hoveredDim === i ? 'drop-shadow(0 0 4px rgba(37,99,235,0.7))' : 'none',
                        transition: 'fill 180ms ease, filter 180ms ease',
                      }}
                    />
                  )
                })}
                {PENTAGON_LABELS.map((label, i) => {
                  const a = (270 + i * 72) * Math.PI / 180
                  const lx = cx + 116 * Math.cos(a)
                  const ly = cy + 116 * Math.sin(a)
                  const parts = label.split(' ')
                  const isHov = hoveredDim === i
                  return (
                    <text key={label} textAnchor="middle"
                      fill={isHov ? 'rgba(238,236,230,0.78)' : 'rgba(238,236,230,0.32)'}
                      fontSize="9.5"
                      fontFamily="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
                      fontWeight="300"
                      style={{
                        opacity: 0, animation: `fadeIn 200ms ease ${700 + i * 80}ms both`,
                        cursor: 'pointer', transition: 'fill 180ms ease',
                      }}
                      onMouseEnter={() => setHoveredDim(i)}
                      onMouseLeave={() => setHoveredDim(null)}
                      onClick={() => setHoveredDim(hoveredDim === i ? null : i)}
                    >
                      {parts.length === 1
                        ? <tspan x={lx.toFixed(1)} y={ly.toFixed(1)}>{parts[0]}</tspan>
                        : <>
                            <tspan x={lx.toFixed(1)} y={(ly - 5.5).toFixed(1)}>{parts[0]}</tspan>
                            <tspan x={lx.toFixed(1)} y={(ly + 6.5).toFixed(1)}>{parts[1]}</tspan>
                          </>
                      }
                    </text>
                  )
                })}
              </svg>
            </div>

            {/* Dim caption slot */}
            <div style={{ height: 22, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hoveredDim !== null && (
                <p style={{
                  fontSize: 11, color: 'rgba(238,236,230,0.48)', margin: 0, fontWeight: 300,
                  textAlign: 'center', letterSpacing: '0.01em',
                  animation: 'fadeIn 150ms ease both',
                }}>
                  {getDimCaption(hoveredDim, pentagonValues)}
                </p>
              )}
            </div>

            {/* Archetype name (compact, page anchor) */}
            {completionData && (
              <h1 style={{
                fontSize: 'clamp(52px, 8vw, 80px)', fontWeight: 900, color: '#eeece6',
                letterSpacing: '-0.02em', lineHeight: 1, margin: 0, textAlign: 'center',
                fontFamily: '"Barlow Condensed", "SF Pro Display", -apple-system, sans-serif',
                animation: 'fadeIn 300ms ease both',
              }}>
                {completionData.profileName}
              </h1>
            )}

            {/* Category label */}
            {completionData && (
              <p style={{
                fontSize: 15, fontStyle: 'italic', color: 'rgba(238,236,230,0.36)',
                fontWeight: 300, margin: '8px 0 0', textAlign: 'center',
                animation: 'fadeIn 300ms ease 80ms both',
              }}>
                {completionData.profileGroup}
              </p>
            )}

            {/* Separator + interpretive line */}
            <>
              <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.11)', margin: '20px 0 14px', animation: 'fadeIn 200ms ease both' }} />
              <p style={{
                fontSize: 12, color: 'rgba(238,236,230,0.4)', textAlign: 'center',
                margin: 0, fontWeight: 300, letterSpacing: '0.01em',
                animation: 'fadeIn 300ms ease 100ms both',
              }}>
                {interpretiveLine}
              </p>
            </>

            {/* ── Insight blocks — staggered by CSS delay, all present when phase2 mounts ── */}
            {insights && (
              <div style={{ width: '100%', maxWidth: 500, marginTop: 34, textAlign: 'left' }}>
                <div style={{ marginBottom: 20, animation: 'fadeUp 320ms ease 0ms both' }}>
                  <p style={{ fontSize: 10, color: 'rgba(238,236,230,0.38)', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 7px', fontWeight: 600 }}>Core Signal</p>
                  <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.75)', lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{insights.coreSignal}</p>
                </div>
                <div style={{ marginBottom: 20, animation: 'fadeUp 320ms ease 200ms both' }}>
                  <p style={{ fontSize: 10, color: '#3aa868', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 7px', fontWeight: 600 }}>Where You Win</p>
                  <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.75)', lineHeight: 1.65, margin: 0, fontWeight: 300 }}>{insights.whereYouWin}</p>
                </div>
                <div style={{ marginBottom: 0, animation: 'fadeUp 320ms ease 400ms both' }}>
                  <p style={{ fontSize: 10, color: '#c8a832', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 7px', fontWeight: 600 }}>Watch For</p>
                  <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.55)', lineHeight: 1.65, margin: 0, fontWeight: 300, fontStyle: 'italic' }}>{insights.watchFor}</p>
                </div>
              </div>
            )}

            {/* ── Emotional line ── */}
            {insights && (
              <p style={{
                fontSize: 'clamp(17px, 2.2vw, 21px)', fontWeight: 400, color: 'rgba(238,236,230,0.8)',
                lineHeight: 1.6, margin: '52px 0 0', textAlign: 'center',
                maxWidth: 520, fontStyle: 'italic',
                animation: 'fadeIn 600ms ease 600ms both',
              }}>
                {insights.emotionalLine}
              </p>
            )}

            {/* ── Closing box ── */}
            <div style={{ width: '100%', maxWidth: 440, marginTop: 48, animation: 'fadeIn 400ms ease 900ms both' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '20px 24px',
              }}>
                <p style={{ fontSize: 13, color: '#eeece6', margin: '0 0 5px', fontWeight: 500 }}>
                  Your profile has been shared with your search partner.
                </p>
                <p style={{ fontSize: 12, color: 'rgba(238,236,230,0.42)', margin: 0, fontWeight: 300, lineHeight: 1.55 }}>
                  They&rsquo;ll use this to evaluate role alignment. Your results are on file.
                </p>
              </div>
            </div>

            {/* ── Explore divider ── */}
            <div style={{
              marginTop: 64, display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', maxWidth: 500,
              animation: 'fadeIn 600ms ease 1100ms both',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 10, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 400, whiteSpace: 'nowrap' }}>
                your behavioral profile
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            DEPTH SECTIONS — BEHAVIORAL SYSTEM EXPLORER
        ═══════════════════════════════════════════════════ */}
        {resultMoment >= 7 && completionData && (() => {
          const depth = DEPTH[completionData.profileName]
          if (!depth) return null

          const sectionStyle = (delay: number): React.CSSProperties => ({
            animation: `fadeUp 420ms ease ${delay}ms both`,
          })

          const labelStyle = (color = 'rgba(238,236,230,0.28)'): React.CSSProperties => ({
            fontSize: 10, color, textTransform: 'uppercase' as const,
            letterSpacing: '0.2em', fontWeight: 600, margin: '0 0 6px',
          })

          const subLabelStyle = (color = 'rgba(238,236,230,0.38)'): React.CSSProperties => ({
            fontSize: 10, color, textTransform: 'uppercase' as const,
            letterSpacing: '0.16em', fontWeight: 600, margin: '0 0 10px',
          })

          const bulletStyle: React.CSSProperties = {
            fontSize: 14, color: 'rgba(238,236,230,0.7)', lineHeight: 1.7,
            margin: '0 0 6px', fontWeight: 300, paddingLeft: 14, position: 'relative',
          }

          return (
            <div
              id="phase2-anchor"
              style={{
                width: '100%', maxWidth: 540, margin: '0 auto',
                padding: '0 24px 96px',
                fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {/* ── 1. HOW YOU SHOW UP ── */}
              <div style={{ marginBottom: 56, ...sectionStyle(80) }}>
                <p style={labelStyle()}>How you show up</p>
                <h2 style={{ fontSize: 20, fontWeight: 300, color: '#eeece6', margin: '0 0 32px', lineHeight: 1.3 }}>
                  Three lenses on the same signal.
                </h2>

                {/* A: How you operate */}
                <div style={{ marginBottom: 28 }}>
                  <p style={subLabelStyle('rgba(238,236,230,0.38)')}>How you operate</p>
                  {depth.howYouOperate.map((b, i) => (
                    <p key={i} style={bulletStyle}>
                      <span style={{ position: 'absolute', left: 0, color: 'rgba(238,236,230,0.22)', fontWeight: 400 }}>·</span>
                      {b}
                    </p>
                  ))}
                </div>

                {/* B: How others experience you */}
                <div style={{ marginBottom: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={subLabelStyle('rgba(238,236,230,0.38)')}>How others experience you</p>
                  {depth.howOthersExperienceYou.map((b, i) => (
                    <p key={i} style={bulletStyle}>
                      <span style={{ position: 'absolute', left: 0, color: 'rgba(238,236,230,0.22)', fontWeight: 400 }}>·</span>
                      {b}
                    </p>
                  ))}
                </div>

                {/* C: Friction */}
                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={subLabelStyle('#c8a832')}>Where this creates friction</p>
                  {depth.friction.map((b, i) => (
                    <p key={i} style={{ ...bulletStyle, color: 'rgba(238,236,230,0.55)', fontStyle: 'italic' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'rgba(200,168,50,0.35)', fontWeight: 400, fontStyle: 'normal' }}>·</span>
                      {b}
                    </p>
                  ))}
                </div>
              </div>

              {/* ── 2. CORE TENSION ── */}
              <div style={{ marginBottom: 56, ...sectionStyle(200) }}>
                <p style={labelStyle()}>Your core tension</p>
                <h3 style={{
                  fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 400, fontStyle: 'italic',
                  color: '#eeece6', margin: '0 0 20px', lineHeight: 1.25, letterSpacing: '-0.01em',
                }}>
                  {depth.tension.title}
                </h3>
                {depth.tension.lines.map((line, i) => (
                  <p key={i} style={{ ...bulletStyle, color: i === 0 ? 'rgba(238,236,230,0.72)' : i === 1 ? 'rgba(238,236,230,0.55)' : 'rgba(238,236,230,0.45)' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'rgba(238,236,230,0.2)', fontWeight: 400 }}>·</span>
                    {line}
                  </p>
                ))}
              </div>

              {/* ── 3. ENVIRONMENT FIT ── */}
              <div style={{ marginBottom: 56, ...sectionStyle(320) }}>
                <p style={labelStyle()}>Environment fit</p>
                <h2 style={{ fontSize: 20, fontWeight: 300, color: '#eeece6', margin: '0 0 28px', lineHeight: 1.3 }}>
                  Where the signal is an asset. Where it costs.
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                  <div>
                    <p style={subLabelStyle('#3aa868')}>You thrive when</p>
                    {depth.thriveWhen.map((b, i) => (
                      <p key={i} style={bulletStyle}>
                        <span style={{ position: 'absolute', left: 0, color: 'rgba(58,168,104,0.4)', fontWeight: 400 }}>·</span>
                        {b}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p style={subLabelStyle('#c8a832')}>You struggle when</p>
                    {depth.struggleWhen.map((b, i) => (
                      <p key={i} style={{ ...bulletStyle, color: 'rgba(238,236,230,0.55)' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'rgba(200,168,50,0.35)', fontWeight: 400 }}>·</span>
                        {b}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 4. REAL-WORLD TRANSLATION ── */}
              <div style={{ marginBottom: 56, ...sectionStyle(440) }}>
                <p style={labelStyle()}>What this looks like in practice</p>
                <h2 style={{ fontSize: 20, fontWeight: 300, color: '#eeece6', margin: '0 0 28px', lineHeight: 1.3 }}>
                  Concrete. Specific. Recognizable.
                </h2>
                {[
                  { label: 'In meetings', bullets: depth.inMeetings, color: 'rgba(238,236,230,0.38)' },
                  { label: 'In conflict',  bullets: depth.inConflict,  color: 'rgba(238,236,230,0.38)' },
                  { label: 'Under pressure', bullets: depth.underPressure, color: 'rgba(238,236,230,0.38)' },
                ].map(({ label, bullets, color }, si) => (
                  <div key={label} style={{ marginBottom: si < 2 ? 24 : 0, paddingBottom: si < 2 ? 24 : 0, borderBottom: si < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <p style={subLabelStyle(color as string)}>{label}</p>
                    {bullets.map((b, i) => (
                      <p key={i} style={bulletStyle}>
                        <span style={{ position: 'absolute', left: 0, color: 'rgba(238,236,230,0.2)', fontWeight: 400 }}>·</span>
                        {b}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* ── 5. SIGNAL BREAKDOWN (dimension accordion) ── */}
              <div style={{ ...sectionStyle(560) }}>
                <p style={labelStyle()}>Your signal breakdown</p>
                <h2 style={{ fontSize: 20, fontWeight: 300, color: '#eeece6', margin: '0 0 8px', lineHeight: 1.3 }}>
                  Five dimensions. Your specific shape.
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(238,236,230,0.35)', margin: '0 0 28px', fontWeight: 300 }}>
                  Select a dimension to see what it means for you specifically.
                </p>

                {/* Compact pentagon */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                  <div style={{ width: 'min(180px, 54vw)', aspectRatio: '180 / 174' }}>
                    <svg width="100%" height="100%" viewBox="-30 -24 220 210">
                      {/* Rings */}
                      <polygon points={ringPts(80, 80, 68)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
                      <polygon points={ringPts(80, 80, 34)} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
                      {/* Axis lines */}
                      {Array.from({ length: 5 }, (_, i) => {
                        const a = (270 + i * 72) * Math.PI / 180
                        return (
                          <line key={i}
                            x1="80" y1="80"
                            x2={(80 + 68 * Math.cos(a)).toFixed(2)}
                            y2={(80 + 68 * Math.sin(a)).toFixed(2)}
                            stroke={hoveredDim === i || expandedDim === i ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}
                            strokeWidth="0.5"
                            style={{ transition: 'stroke 200ms ease' }}
                          />
                        )
                      })}
                      {/* Data polygon */}
                      <polygon
                        points={pentagonPts(pentagonValues, 80, 80, 68)}
                        fill="rgba(37,99,235,0.09)"
                        stroke="#2563EB"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      {/* Vertex dots */}
                      {pentagonValues.map((v, i) => {
                        const a = (270 + i * 72) * Math.PI / 180
                        return (
                          <circle key={i}
                            cx={(80 + v * 68 * Math.cos(a)).toFixed(2)}
                            cy={(80 + v * 68 * Math.sin(a)).toFixed(2)}
                            r="2"
                            fill={hoveredDim === i || expandedDim === i ? '#60a5fa' : '#2563EB'}
                            style={{ transition: 'fill 200ms ease', filter: hoveredDim === i || expandedDim === i ? 'drop-shadow(0 0 3px rgba(37,99,235,0.7))' : 'none' }}
                          />
                        )
                      })}
                      {/* Labels */}
                      {PENTAGON_LABELS.map((label, i) => {
                        const a = (270 + i * 72) * Math.PI / 180
                        const lx = 80 + 84 * Math.cos(a)
                        const ly = 80 + 84 * Math.sin(a)
                        const parts = label.split(' ')
                        const isActive = hoveredDim === i || expandedDim === i
                        return (
                          <text key={label}
                            textAnchor="middle"
                            fill={isActive ? 'rgba(238,236,230,0.8)' : 'rgba(238,236,230,0.3)'}
                            fontSize="8"
                            fontFamily="DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
                            fontWeight="300"
                            style={{ cursor: 'pointer', transition: 'fill 180ms ease' }}
                            onMouseEnter={() => setHoveredDim(i)}
                            onMouseLeave={() => setHoveredDim(null)}
                            onClick={() => setExpandedDim(expandedDim === i ? null : i)}
                          >
                            {parts.length === 1
                              ? <tspan x={lx.toFixed(1)} y={ly.toFixed(1)}>{parts[0]}</tspan>
                              : <>
                                  <tspan x={lx.toFixed(1)} y={(ly - 4.5).toFixed(1)}>{parts[0]}</tspan>
                                  <tspan x={lx.toFixed(1)} y={(ly + 5.5).toFixed(1)}>{parts[1]}</tspan>
                                </>
                            }
                          </text>
                        )
                      })}
                    </svg>
                  </div>
                </div>

                {/* Accordion */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {DIM_DEPTH.map((dim, i) => {
                    const value = pentagonValues[i]
                    const scoreLevel: 'high' | 'mid' | 'low' = value >= 0.65 ? 'high' : value >= 0.35 ? 'mid' : 'low'
                    const bullets = dim[scoreLevel]
                    const isExpanded = expandedDim === i
                    const isHov = hoveredDim === i
                    return (
                      <div key={dim.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {/* Row */}
                        <button
                          onClick={() => setExpandedDim(isExpanded ? null : i)}
                          onMouseEnter={() => setHoveredDim(i)}
                          onMouseLeave={() => setHoveredDim(null)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
                            gap: 16, textAlign: 'left',
                          }}
                        >
                          <span style={{
                            fontSize: 13, fontWeight: 500,
                            color: isHov || isExpanded ? '#eeece6' : 'rgba(238,236,230,0.6)',
                            transition: 'color 180ms ease', letterSpacing: '-0.01em',
                            fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                          }}>
                            {dim.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            {/* Score bar */}
                            <div style={{ width: 48, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
                              <div style={{
                                width: `${Math.round(value * 100)}%`, height: '100%', borderRadius: 1,
                                background: isExpanded ? '#2563EB' : 'rgba(37,99,235,0.6)',
                                transition: 'background 200ms ease',
                              }} />
                            </div>
                            <span style={{
                              fontSize: 14, color: isExpanded ? 'rgba(238,236,230,0.6)' : 'rgba(238,236,230,0.22)',
                              transition: 'color 180ms ease', lineHeight: 1, userSelect: 'none',
                              fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
                            }}>
                              {isExpanded ? '−' : '+'}
                            </span>
                          </div>
                        </button>

                        {/* Expanded panel */}
                        {isExpanded && (
                          <div style={{ paddingBottom: 20, animation: 'fadeUp 260ms ease both' }}>
                            {bullets.map((b, bi) => (
                              <p key={bi} style={{ ...bulletStyle, margin: '0 0 5px' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'rgba(37,99,235,0.5)', fontWeight: 400 }}>·</span>
                                {b}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )
        })()}

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
          .top-bar { padding: 0 16px !important; }
          .warn-bar { padding: 0 16px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="top-bar" style={{ height: 48, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(8px)' }}>
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
          <div className="warn-bar" style={{ position: 'absolute', bottom: 80, left: 0, right: 0, padding: '0 48px' }}>
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
