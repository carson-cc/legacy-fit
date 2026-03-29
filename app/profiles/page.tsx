'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { FitModel } from '@/app/components/FitModel'
import type { FitModelScores } from '@/app/components/FitModel'

// ─── Brand tokens ────────────────────────────────────────────────────
const BG    = '#080808'
const CARD  = '#0e0e0e'
const TEXT  = '#eeece6'
const MUTED = 'rgba(238,236,230,0.4)'
const DIM   = 'rgba(238,236,230,0.18)'
const BORD  = 'rgba(255,255,255,0.07)'
const BLUE  = '#2563EB'
const GREEN = '#22C55E'
const AMBER = '#EAB308'
const RED   = '#EF4444'
const BC    = '"Barlow Condensed", system-ui'
const DM    = '"DM Sans", -apple-system, sans-serif'

// ─── Profile data ────────────────────────────────────────────────────
// Scores are raw (dominance / extraversion / patience / formality).
// Pushed to extremes so each pentagon shape is unmistakably distinct.
const PROFILES = [
  {
    name: 'Marcus Thompson', role: 'Superintendent · Gilbane Construction',
    score: 93, verdict: 'Strong Hire', verdictColor: GREEN, archetype: 'Pioneer',
    // exec≈0.90  own≈0.71  adapt≈0.33  collab≈0.16  dec≈0.94
    scores: { dominance: 0.95, extraversion: 0.20, patience: 0.08, formality: 0.82 } as FitModelScores,
  },
  {
    name: 'Elena Vasquez', role: 'VP of Sales · Meridian Capital',
    score: 87, verdict: 'Strong Hire', verdictColor: GREEN, archetype: 'Diplomat',
    // exec≈0.33  own≈0.43  adapt≈0.55  collab≈0.91  dec≈0.19
    scores: { dominance: 0.25, extraversion: 0.92, patience: 0.88, formality: 0.45 } as FitModelScores,
  },
  {
    name: 'James Whitfield', role: 'CFO · Portco Holdings',
    score: 78, verdict: 'Proceed with Caution', verdictColor: AMBER, archetype: 'Operator',
    // exec≈0.40  own≈0.65  adapt≈0.57  collab≈0.53  dec≈0.34
    scores: { dominance: 0.55, extraversion: 0.35, patience: 0.90, formality: 0.18 } as FitModelScores,
  },
  {
    name: 'Sarah Okonkwo', role: 'Director of Operations · Apex Group',
    score: 91, verdict: 'Strong Hire', verdictColor: GREEN, archetype: 'Anchor',
    // exec≈0.20  own≈0.34  adapt≈0.70  collab≈0.84  dec≈0.21
    scores: { dominance: 0.18, extraversion: 0.88, patience: 0.75, formality: 0.22 } as FitModelScores,
  },
]

const BENCHMARK: FitModelScores = { dominance: 0.72, extraversion: 0.52, patience: 0.50, formality: 0.66 }
const HIRING_MANAGER: FitModelScores = { dominance: 0.78, extraversion: 0.48, patience: 0.42, formality: 0.72 }

// ─── deriveAxes (mirrors FitModel.tsx exactly) ───────────────────────
function clamp01(v: number) { return Math.max(0, Math.min(1, v)) }
function deriveAxes(s: FitModelScores) {
  return {
    execution:     clamp01(s.dominance * 0.58 + s.formality * 0.42),
    ownership:     clamp01(s.dominance * 0.72 + s.patience * 0.28),
    adaptability:  clamp01(s.extraversion * 0.22 + (1 - s.formality) * 0.58 + (1 - s.patience) * 0.20),
    collaboration: clamp01(s.extraversion * 0.68 + s.patience * 0.32),
    decisionSpeed: clamp01(s.dominance * 0.54 + (1 - s.patience) * 0.46),
  }
}

const AXIS_LABELS = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']
const AXIS_DESCS  = [
  'How quickly and precisely they act under pressure.',
  'Degree of personal accountability for outcomes.',
  'Comfort with ambiguity and shifting priorities.',
  'Orientation toward building consensus and working through others.',
  'Urgency in making and acting on key decisions.',
]

// ─── Hooks ───────────────────────────────────────────────────────────
function useInView(threshold = 0.25) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [val, setVal] = useState(0)
  const ran = useRef(false)
  useEffect(() => {
    if (!trigger || ran.current) return
    ran.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [trigger, target, duration])
  return val
}

// ─── Fade-in style helper ─────────────────────────────────────────────
const fi = (inView: boolean, delay = 0): React.CSSProperties => ({
  opacity: inView ? 1 : 0,
  transform: inView ? 'none' : 'translateY(20px)',
  transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
})

// ─── SVG dimension icons (stroke-only, 24×24) ────────────────────────
function DimIcon({ dim }: { dim: string }) {
  const paths: Record<string, React.ReactNode> = {
    'Execution':      <path d="M5 12h14M14 7l5 5-5 5" />,
    'Ownership':      <><path d="M6 4v16" /><path d="M6 4l11 4.5L6 13" /></>,
    'Adaptability':   <><path d="M19 9A7 7 0 0 0 5.5 7" /><path d="M5 15a7 7 0 0 0 13.5-2" /><path d="M19 9l1.5-2.5M19 9l-2.5.5" /><path d="M5 15l-1.5 2.5M5 15l2.5-.5" /></>,
    'Collaboration':  <><circle cx="9" cy="8" r="3" /><circle cx="15" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" /></>,
    'Decision Speed': <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[dim]}
    </svg>
  )
}

// ─── Assessment simulation card ───────────────────────────────────────
const LIST1_WORDS = ['Decisive', 'Bold', 'Competitive', 'Direct', 'Methodical', 'Patient', 'Collaborative', 'Analytical', 'Thorough', 'Systematic', 'Careful', 'Adaptable']
const LIST2_WORDS = ['Patient', 'Methodical', 'Thorough', 'Collaborative', 'Careful', 'Systematic', 'Analytical', 'Precise', 'Steady', 'Deliberate', 'Structured', 'Consistent']
const SEL1 = ['Decisive', 'Bold', 'Competitive']
const SEL2 = ['Patient', 'Methodical', 'Collaborative']

type SimStage = 1 | 2 | 3 | 4 | 5

function SimCard() {
  const [stage, setStage]         = useState<SimStage>(1)
  const [vis1, setVis1]           = useState(0)
  const [picked1, setPicked1]     = useState<string[]>([])
  const [vis2, setVis2]           = useState(0)
  const [picked2, setPicked2]     = useState<string[]>([])
  const [connectors, setConn]     = useState(0)
  const [score, setScore]         = useState(0)
  const [barsGo, setBarsGo]       = useState(false)
  const [archIn, setArchIn]       = useState(false)
  const loopRef  = useRef(0)
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([])

  const addT = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }, [])

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const run = useCallback(() => {
    clearAll()
    setStage(1); setVis1(0); setPicked1([]); setVis2(0); setPicked2([])
    setConn(0); setScore(0); setBarsGo(false); setArchIn(false)

    // Stage 1 — pills appear (0–1200ms), 3 selected (1200–2400ms)
    LIST1_WORDS.forEach((_, i) => addT(() => setVis1(i + 1), i * 80))
    addT(() => setPicked1(['Decisive']),                   1300)
    addT(() => setPicked1(['Decisive', 'Bold']),           1700)
    addT(() => setPicked1(['Decisive', 'Bold', 'Competitive']), 2100)

    // Stage 2 — crossfade (3500ms), pills + selection
    addT(() => { setStage(2); setVis2(0); setPicked2([]) }, 3500)
    LIST2_WORDS.forEach((_, i) => addT(() => setVis2(i + 1), 3500 + i * 80))
    addT(() => setPicked2(['Patient']),                    4800)
    addT(() => setPicked2(['Patient', 'Methodical']),      5200)
    addT(() => setPicked2(['Patient', 'Methodical', 'Collaborative']), 5600)

    // Stage 3 — both lists + connectors (7000ms)
    addT(() => { setStage(3) },        7000)
    addT(() => setConn(1),             7400)
    addT(() => setConn(2),             7700)
    addT(() => setConn(3),             8000)

    // Stage 4 — score ring (10000ms)
    addT(() => { setStage(4); setScore(0) }, 10000)
    const scoreStart = 10100
    const dur = 1200
    const scoreStep = (startMs: number) => {
      const elapsed = Date.now() - startMs
      const t = Math.min(elapsed / dur, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = Math.round(78 * eased)
      setScore(v)
      if (t < 1) addT(() => scoreStep(startMs), 16)
    }
    addT(() => scoreStep(Date.now()), scoreStart)

    // Stage 5 — archetype (12500ms)
    addT(() => { setStage(5); setBarsGo(false); setArchIn(false) }, 12500)
    addT(() => setArchIn(true),  12650)
    addT(() => setBarsGo(true),  13200)

    // Loop (16000ms)
    addT(() => { loopRef.current++; run() }, 16000)
  }, [addT, clearAll])

  useEffect(() => {
    run()
    return clearAll
  }, [run, clearAll])

  const pillStyle = (word: string, list: 1 | 2, visible: boolean): React.CSSProperties => {
    if (!visible) return { opacity: 0, transform: 'scale(0.9)' }
    const isSelected = list === 1 ? picked1.includes(word) : picked2.includes(word)
    return {
      opacity: 1, transform: 'scale(1)',
      transition: 'opacity 200ms ease, transform 200ms ease, background 200ms ease, color 200ms ease',
      padding: '5px 12px', borderRadius: 100, cursor: 'default',
      fontSize: 12, fontFamily: DM, fontWeight: isSelected ? 500 : 400,
      background: isSelected ? TEXT : 'transparent',
      color: isSelected ? '#0a0a0a' : MUTED,
      border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
    }
  }

  const circum = Math.PI * 2 * 36 // r=36
  const dash = circum
  const offset = dash - (score / 100) * dash

  const dimBars = [
    { label: 'Execution',     val: 62 },
    { label: 'Decision Speed', val: 45 },
    { label: 'Ownership',     val: 71 },
  ]

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORD}`, borderRadius: 14,
      padding: '28px 32px', height: 520, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Stage 1 & 2: word lists */}
      {(stage === 1 || stage === 2) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{
            fontSize: 10, fontFamily: DM, fontWeight: 300, color: MUTED,
            letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16,
            transition: 'opacity 300ms ease', opacity: stage === 1 ? 1 : 0.4
          }}>
            {stage === 1 ? 'List 1 — In this role' : 'List 2 — Naturally'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(stage === 1 ? LIST1_WORDS : LIST2_WORDS).map((word, i) => (
              <span key={word} style={pillStyle(word, stage as 1 | 2, stage === 1 ? i < vis1 : i < vis2)}>
                {word}
              </span>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <p style={{ fontSize: 9, fontFamily: DM, color: DIM, letterSpacing: '0.08em' }}>
            {stage === 1
              ? `${picked1.length}/80 choices — selecting behaviors for this role`
              : `${picked2.length}/80 choices — selecting natural behaviors`}
          </p>
        </div>
      )}

      {/* Stage 3: adaptation gap */}
      {stage === 3 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 10, fontFamily: DM, fontWeight: 300, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>
            Adaptation gap
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 0, flex: 1 }}>
            <div>
              <p style={{ fontSize: 9, fontFamily: DM, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>In this role</p>
              {SEL1.map(w => (
                <div key={w} style={{ padding: '7px 12px', borderRadius: 100, background: TEXT, color: '#0a0a0a', fontSize: 12, fontFamily: DM, fontWeight: 500, marginBottom: 8, display: 'inline-block' }}>{w}</div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {SEL1.map((_, i) => (
                <div key={i} style={{
                  height: 1, width: connectors > i ? 32 : 0,
                  background: `rgba(37,99,235,0.4)`,
                  transition: 'width 400ms ease',
                }} />
              ))}
            </div>
            <div>
              <p style={{ fontSize: 9, fontFamily: DM, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Naturally</p>
              {SEL2.map(w => (
                <div key={w} style={{ padding: '7px 12px', borderRadius: 100, border: `1px solid ${BORD}`, color: MUTED, fontSize: 12, fontFamily: DM, marginBottom: 8, display: 'inline-block' }}>{w}</div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 9, fontFamily: DM, color: DIM, letterSpacing: '0.08em', marginTop: 8 }}>
            Gap between role demands and natural profile generates 94 behavioral signals
          </p>
        </div>
      )}

      {/* Stage 4: scoring ring */}
      {stage === 4 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r="36" fill="none" stroke={BORD} strokeWidth="4" />
            <circle cx="44" cy="44" r="36" fill="none" stroke={BLUE} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circum}
              strokeDashoffset={offset}
            />
          </svg>
          <div style={{ textAlign: 'center', marginTop: -76 }}>
            <span style={{ fontFamily: BC, fontSize: 28, fontWeight: 700, color: TEXT }}>{score}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <p style={{ fontSize: 10, fontFamily: DM, fontWeight: 300, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Behavioral fit score</p>
          </div>
        </div>
      )}

      {/* Stage 5: archetype reveal */}
      {stage === 5 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          <div style={{
            opacity: archIn ? 1 : 0,
            transform: archIn ? 'none' : 'translateY(12px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
          }}>
            <p style={{ fontSize: 9, fontFamily: DM, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Closest archetype match</p>
            <p style={{ fontFamily: BC, fontSize: 32, fontWeight: 900, color: TEXT, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>The Operator</p>
            <p style={{ fontSize: 12, fontFamily: DM, color: MUTED }}>Deliberate · Output-focused</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dimBars.map((d, i) => (
              <div key={d.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: DM, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{d.label}</span>
                  <span style={{ fontSize: 10, fontFamily: DM, color: MUTED }}>{d.val}%</span>
                </div>
                <div style={{ height: 3, background: BORD, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: BLUE,
                    width: barsGo ? `${d.val}%` : '0%',
                    transition: `width 400ms ease ${i * 180}ms`,
                  }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 9, fontFamily: DM, color: DIM }}>From 20 reference profiles · 94 signals</p>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────
export default function MethodPage() {
  const s1 = useInView(0.2)
  const s2 = useInView(0.2)
  const s3 = useInView(0.2)
  const s4 = useInView(0.2)
  const s5 = useInView(0.2)

  const v80  = useCountUp(80,  900, s2.inView)
  const v94  = useCountUp(94,  900, s2.inView)
  const v5   = useCountUp(5,   700, s2.inView)
  const v1   = useCountUp(1,   500, s2.inView)

  const [activeProfile, setActiveProfile] = useState(0)
  const [fading, setFading] = useState(false)
  const [tooltip, setTooltip] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Font loading
  useEffect(() => {
    if (document.getElementById('veltro-fonts')) return
    const link = document.createElement('link')
    link.id = 'veltro-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap'
    document.head.appendChild(link)
  }, [])

  // Profile rotation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setActiveProfile(p => (p + 1) % PROFILES.length)
        setFading(false)
      }, 300)
    }, 3500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const profile = PROFILES[activeProfile]

  // Hero card vertex tooltips — compute axis hit positions for size=280
  const HERO_SIZE = 280
  const cx = HERO_SIZE / 2
  const cy = HERO_SIZE / 2
  const hitR = HERO_SIZE * 0.36
  const vertexHits = AXIS_LABELS.map((label, i) => {
    const angle = (Math.PI * 2 * i / 5) - Math.PI / 2
    return { label, desc: AXIS_DESCS[i], x: cx + hitR * Math.cos(angle), y: cy + hitR * Math.sin(angle) }
  })

  const SECTION_STYLE: React.CSSProperties = {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '100px 64px', position: 'relative',
    background: BG,
  }

  const eyebrow = (text: string): React.CSSProperties => ({
    fontSize: 10, fontFamily: DM, fontWeight: 300, color: BLUE,
    letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 18,
  })

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: DM }}>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 48px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.92)',
        borderBottom: `1px solid ${BORD}`,
      }}>
        <a href="/" style={{ fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: DM, textDecoration: 'none', letterSpacing: '-0.01em' }}>Veltro</a>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[
            { label: 'Sample Report', href: '/sample-report' },
            { label: 'Method', href: '/profiles' },
            { label: 'Sign in', href: '/login' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 13, fontFamily: DM,
              color: l.label === 'Method' ? TEXT : MUTED,
              fontWeight: l.label === 'Method' ? 500 : 300,
              textDecoration: 'none',
            }}>{l.label}</a>
          ))}
          <a href="/sample-report" style={{
            fontSize: 13, fontFamily: DM, fontWeight: 500, color: TEXT,
            border: `1px solid ${BORD}`, padding: '7px 16px',
            borderRadius: 100, textDecoration: 'none',
          }}>See the report →</a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════ */}
      <section ref={s1.ref as React.RefObject<HTMLElement>} style={{ ...SECTION_STYLE, gap: 80 }}>
        <div style={{
          width: '100%', maxWidth: 1120,
          display: 'grid', gridTemplateColumns: '1fr 420px',
          gap: 80, alignItems: 'center',
        }} className="hero-grid">

          {/* Left */}
          <div style={fi(s1.inView)}>
            <p style={eyebrow('Method')}>Method</p>
            <h1 style={{
              fontFamily: BC, fontSize: 'clamp(44px,5.5vw,72px)',
              fontWeight: 900, color: TEXT, letterSpacing: '-0.02em',
              lineHeight: 1.0, textTransform: 'uppercase', marginBottom: 24,
            }}>
              Why the recommendation<br />holds up.
            </h1>
            <p style={{
              fontSize: 17, fontFamily: DM, fontWeight: 300, color: MUTED,
              lineHeight: 1.75, marginBottom: 10, maxWidth: 400,
            }}>
              The score isn&apos;t a personality label.
              It&apos;s a distance from a role-specific benchmark.
            </p>
            <p style={{ fontSize: 11, fontFamily: DM, fontWeight: 300, color: DIM, marginBottom: 44, letterSpacing: '0.02em' }}>
              Model v2.0 · Calibrated Mar 2026 · 2,245,096 respondents
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="/sample-report" style={{
                display: 'inline-flex', alignItems: 'center',
                background: TEXT, color: '#080808',
                fontSize: 14, fontFamily: DM, fontWeight: 500,
                padding: '12px 28px', borderRadius: 100, textDecoration: 'none',
              }}>See a full recommendation</a>
              <span style={{ fontSize: 13, fontFamily: DM, fontWeight: 300, color: MUTED }}>Scroll to see how it works ↓</span>
            </div>
          </div>

          {/* Right — rotating profile card */}
          <div style={{ ...fi(s1.inView, 120), display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{
              background: CARD, border: `1px solid ${BORD}`, borderRadius: 16,
              overflow: 'visible',
            }}>
              {/* Card header */}
              <div style={{
                padding: '13px 18px', borderBottom: `1px solid ${BORD}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: DIM, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Role Benchmark
                </span>
                <span style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: DIM, letterSpacing: '0.06em' }}>
                  Field Leadership
                </span>
              </div>

              {/* Radar + tooltip overlay */}
              <div style={{ padding: '18px 20px 10px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 280ms ease' }}>
                  <FitModel
                    scores={profile.scores}
                    benchmarkScores={BENCHMARK}
                    size={HERO_SIZE}
                    variant="dark"
                    animated={false}
                    showLabels={true}
                  />
                </div>

                {/* Invisible vertex hit areas */}
                {!fading && vertexHits.map((v, i) => (
                  <button key={i}
                    onMouseEnter={() => setTooltip(i)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      position: 'absolute', left: v.x + 16, top: v.y + 28,
                      transform: 'translate(-50%, -50%)',
                      width: 32, height: 32, borderRadius: '50%',
                      background: tooltip === i ? 'rgba(37,99,235,0.12)' : 'transparent',
                      border: `1px solid ${tooltip === i ? 'rgba(37,99,235,0.3)' : 'transparent'}`,
                      cursor: 'default', padding: 0,
                      transition: 'all 150ms ease',
                    }}
                  />
                ))}

                {/* Tooltip */}
                {tooltip !== null && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#111', border: `1px solid ${BORD}`,
                    borderRadius: 8, padding: '10px 14px',
                    width: 220, pointerEvents: 'none', zIndex: 10, marginBottom: 8,
                  }}>
                    <p style={{ fontSize: 11, fontFamily: DM, fontWeight: 500, color: TEXT, marginBottom: 4 }}>
                      {vertexHits[tooltip].label}
                    </p>
                    <p style={{ fontSize: 11, fontFamily: DM, fontWeight: 300, color: MUTED, lineHeight: 1.5 }}>
                      {vertexHits[tooltip].desc}
                    </p>
                  </div>
                )}
              </div>

              {/* Profile identity */}
              <div style={{
                padding: '0 18px 14px',
                opacity: fading ? 0 : 1, transition: 'opacity 280ms ease',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  paddingTop: 10, borderTop: `1px solid ${BORD}`, marginBottom: 4,
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontFamily: DM, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{profile.name}</p>
                    <p style={{ fontSize: 11, fontFamily: DM, fontWeight: 300, color: MUTED }}>{profile.role}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: BC, fontSize: 36, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 2 }}>
                      {profile.score}
                    </p>
                    <p style={{ fontSize: 10, fontFamily: DM, fontWeight: 500, color: profile.verdictColor }}>{profile.verdict}</p>
                  </div>
                </div>
                <p style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: DIM, letterSpacing: '0.04em' }}>
                  {profile.archetype} · Field Leadership Benchmark
                </p>
              </div>

              {/* Dot indicators */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 14 }}>
                {PROFILES.map((_, i) => (
                  <button key={i} onClick={() => {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    setFading(true)
                    setTimeout(() => { setActiveProfile(i); setFading(false) }, 280)
                  }} style={{
                    width: i === activeProfile ? 20 : 5, height: 5, borderRadius: 3,
                    background: i === activeProfile ? BLUE : BORD,
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 300ms ease',
                  }} />
                ))}
              </div>
            </div>

            <p style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: DIM, textAlign: 'center', marginTop: 10, letterSpacing: '0.04em' }}>
              Hover the chart to explore dimensions
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section ref={s2.ref as React.RefObject<HTMLElement>} style={{ ...SECTION_STYLE, borderTop: `1px solid ${BORD}` }}>
        <div style={{
          width: '100%', maxWidth: 1120,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center',
        }} className="score-build-grid">

          {/* Left — stats + copy */}
          <div style={fi(s2.inView)}>
            <p style={eyebrow('How it works')}>How it works</p>
            <h2 style={{
              fontFamily: BC, fontSize: 'clamp(36px,4.5vw,56px)',
              fontWeight: 800, color: TEXT, letterSpacing: '-0.01em',
              textTransform: 'uppercase', lineHeight: 1.0, marginBottom: 20,
            }}>
              Six minutes.<br />Ninety-four signals.
            </h2>
            <p style={{
              fontSize: 14, fontFamily: DM, fontWeight: 300, color: MUTED,
              lineHeight: 1.8, marginBottom: 40, maxWidth: 380,
            }}>
              A candidate sees two word lists. What they need to be in this role.
              And who they naturally are. The gap between those two answers is
              where the signal lives.
            </p>

            {/* 2×2 stat grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: `1px solid ${BORD}`, borderRadius: 12, overflow: 'hidden',
            }}>
              {[
                { n: v80,  label: 'Adjective choices' },
                { n: v94,  label: 'Behavioral signals' },
                { n: v5,   label: 'Dimensions scored' },
                { n: v1,   label: 'Fit score vs benchmark' },
              ].map((stat, i) => (
                <div key={i} style={{
                  padding: '24px 22px',
                  borderRight: i % 2 === 0 ? `1px solid ${BORD}` : 'none',
                  borderBottom: i < 2 ? `1px solid ${BORD}` : 'none',
                }}>
                  <p style={{ fontFamily: BC, fontSize: 64, fontWeight: 900, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                    {stat.n}
                  </p>
                  <p style={{ fontSize: 11, fontFamily: DM, fontWeight: 300, color: MUTED }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — assessment simulation */}
          <div style={fi(s2.inView, 150)}>
            <SimCard />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — TEAM LAYER
      ══════════════════════════════════════════════════════════════ */}
      <section ref={s3.ref as React.RefObject<HTMLElement>} style={{ ...SECTION_STYLE, borderTop: `1px solid ${BORD}` }}>
        <div style={{
          width: '100%', maxWidth: 1120,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center',
        }} className="signal-grid">

          {/* Left */}
          <div style={fi(s3.inView)}>
            <p style={eyebrow('The team layer')}>The team layer</p>
            <h2 style={{
              fontFamily: BC, fontSize: 'clamp(32px,4vw,52px)',
              fontWeight: 800, color: TEXT, letterSpacing: '-0.01em',
              textTransform: 'uppercase', lineHeight: 1.0, marginBottom: 24,
            }}>
              Fit for the role.<br />Fit for the room.
            </h2>
            <p style={{ fontSize: 14, fontFamily: DM, fontWeight: 300, color: MUTED, lineHeight: 1.8, marginBottom: 14 }}>
              The benchmark answers whether the candidate can do the job.
              The team layer answers whether they&apos;ll do it here — with
              this manager, these peers, in this environment.
            </p>
            <p style={{ fontSize: 14, fontFamily: DM, fontWeight: 300, color: MUTED, lineHeight: 1.8, marginBottom: 36 }}>
              Profile the hiring manager and key stakeholders once.
              Every candidate is automatically scored against every stored
              profile — showing alignment and friction before the client meeting.
            </p>

            {/* Icon list */}
            {[
              { icon: 'M4 12h16M4 6h16M4 18h10', text: 'Hiring manager profiled once. Active on every future candidate.' },
              { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', text: 'Peer, board, and stakeholder profiles stack automatically.' },
              { icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3', text: 'Friction surfaces before onboarding, not after.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d={item.icon} />
                </svg>
                <p style={{ fontSize: 13, fontFamily: DM, fontWeight: 300, color: MUTED, lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Right */}
          <div style={{ ...fi(s3.inView, 150), display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: '20px 22px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: DIM, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Candidate vs. Hiring Manager</span>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                {[
                  { color: BLUE, label: 'Candidate', dashed: false },
                  { color: 'rgba(255,255,255,0.5)', label: 'Hiring Manager', dashed: true },
                  { color: 'rgba(255,255,255,0.2)', label: 'Benchmark', dashed: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <div style={{
                      width: 14, height: 2,
                      background: item.dashed
                        ? `repeating-linear-gradient(90deg,${item.color} 0,${item.color} 3px,transparent 3px,transparent 6px)`
                        : item.color,
                    }} />
                    <span style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: MUTED }}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FitModel
                  scores={PROFILES[0].scores}
                  target={HIRING_MANAGER}
                  benchmarkScores={BENCHMARK}
                  size={240}
                  variant="dark"
                  animated={s3.inView}
                />
              </div>

              {/* Compat rows */}
              <div style={{ paddingTop: 14, borderTop: `1px solid ${BORD}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { name: 'David Mercer', role: 'Hiring Manager',  pct: 91, color: GREEN, sub: 'Strong behavioral alignment across all five dimensions.' },
                  { name: 'Sarah Chen',   role: 'Project Lead',    pct: 54, color: AMBER, sub: 'Communication style divergence — pace and collaboration gap.' },
                  { name: 'Tom Ricci',    role: 'Board Observer',  pct: 38, color: RED,   sub: 'High friction — pace and risk tolerance misaligned.' },
                ].map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 12, fontFamily: DM, fontWeight: 500, color: TEXT, marginRight: 6 }}>{p.name}</span>
                        <span style={{ fontSize: 10, fontFamily: DM, fontWeight: 300, color: MUTED }}>{p.role}</span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: DM, fontWeight: 500, color: p.color, flexShrink: 0 }}>{p.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: BORD, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 2 }} />
                    </div>
                    <p style={{ fontSize: 10, fontFamily: DM, fontWeight: 300, color: DIM, paddingLeft: 13 }}>{p.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — WHAT WE MEASURE
      ══════════════════════════════════════════════════════════════ */}
      <section ref={s4.ref as React.RefObject<HTMLElement>} style={{ ...SECTION_STYLE, borderTop: `1px solid ${BORD}` }}>
        <div style={{ width: '100%', maxWidth: 1120 }}>
          <div style={{ ...fi(s4.inView), textAlign: 'center', marginBottom: 64 }}>
            <p style={{ ...eyebrow('What we measure'), display: 'block' }}>What we measure</p>
            <h2 style={{
              fontFamily: BC, fontSize: 'clamp(40px,5vw,64px)',
              fontWeight: 900, color: TEXT, letterSpacing: '-0.02em',
              textTransform: 'uppercase', lineHeight: 1.0, marginBottom: 16,
            }}>
              Five dimensions.<br />Infinite signal.
            </h2>
            <p style={{ fontSize: 15, fontFamily: DM, fontWeight: 300, color: MUTED, maxWidth: 480, margin: '0 auto' }}>
              Not personality labels. Behavioral distance from a benchmark.
            </p>
          </div>

          {/* 5-column grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1,
            border: `1px solid ${BORD}`, borderRadius: 12, overflow: 'hidden',
          }}>
            {[
              {
                dim: 'Execution',
                desc: 'How quickly and precisely they act under pressure. High scorers move without needing consensus.',
                hi: 85, lo: 30,
              },
              {
                dim: 'Ownership',
                desc: 'Degree of personal accountability. High: takes full responsibility for outcomes and decisions.',
                hi: 78, lo: 42,
              },
              {
                dim: 'Adaptability',
                desc: 'Comfort with ambiguity and change. High: thrives in shifting environments and unclear mandates.',
                hi: 70, lo: 55,
              },
              {
                dim: 'Collaboration',
                desc: 'Orientation toward working through others. High: builds consensus, energized by the team.',
                hi: 90, lo: 25,
              },
              {
                dim: 'Decision Speed',
                desc: 'Urgency in making and acting on decisions. High: fast and instinctive. Low: thorough, deliberate.',
                hi: 80, lo: 35,
              },
            ].map((col, i) => (
              <div key={col.dim} style={{
                ...fi(s4.inView, i * 80),
                padding: '28px 22px 24px',
                background: CARD,
                borderLeft: i > 0 ? `1px solid ${BORD}` : 'none',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <DimIcon dim={col.dim} />
                <p style={{ fontFamily: BC, fontSize: 15, fontWeight: 800, color: TEXT, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                  {col.dim}
                </p>
                <p style={{ fontSize: 11, fontFamily: DM, fontWeight: 300, color: MUTED, lineHeight: 1.65, flex: 1 }}>
                  {col.desc}
                </p>
                {/* Sparkline — 4 bars showing high vs low */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[col.hi, (col.hi + col.lo) / 2, col.lo, col.hi * 0.6].map((w, j) => (
                    <div key={j} style={{ height: 2, borderRadius: 1, background: DIM, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${w}%`, background: j === 0 ? MUTED : DIM, borderRadius: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 — SEND IT TO EVERYONE
      ══════════════════════════════════════════════════════════════ */}
      <section ref={s5.ref as React.RefObject<HTMLElement>} style={{ ...SECTION_STYLE, borderTop: `1px solid ${BORD}` }}>
        <div style={{
          width: '100%', maxWidth: 1120,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center',
        }} className="howit-grid">

          {/* Left */}
          <div style={fi(s5.inView)}>
            <p style={eyebrow('During shortlisting')}>During shortlisting</p>
            <h2 style={{
              fontFamily: BC, fontSize: 'clamp(36px,4.5vw,60px)',
              fontWeight: 900, color: TEXT, letterSpacing: '-0.02em',
              textTransform: 'uppercase', lineHeight: 1.0, marginBottom: 36,
            }}>
              Send it to everyone<br />in the room.
            </h2>

            {/* Three steps */}
            <div style={{ marginBottom: 44 }}>
              {[
                { step: 'Your shortlisted candidate takes it.',   detail: 'Any device. No login required.' },
                { step: 'Your hiring manager takes it.',           detail: 'Profiled once. Active on every future search.' },
                { step: 'Your key stakeholders take it.',          detail: 'Compatibility scored automatically.' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '16px 0',
                  borderBottom: `0.5px solid rgba(255,255,255,0.08)`,
                  borderTop: i === 0 ? `0.5px solid rgba(255,255,255,0.08)` : 'none',
                }}>
                  <p style={{ fontSize: 15, fontFamily: DM, fontWeight: 500, color: TEXT, letterSpacing: '-0.01em', marginBottom: 3 }}>{item.step}</p>
                  <p style={{ fontSize: 12, fontFamily: DM, fontWeight: 300, color: MUTED }}>{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Hero line */}
            <p style={{
              fontFamily: BC, fontSize: 'clamp(22px,2.6vw,30px)',
              fontWeight: 800, color: TEXT, letterSpacing: '-0.01em',
              textTransform: 'uppercase', lineHeight: 1.15,
              marginBottom: 36, paddingTop: 4,
            }}>
              Six minutes each.<br />You walk in knowing.
            </p>

            <a href="/sample-report" style={{
              display: 'inline-flex', alignItems: 'center',
              background: TEXT, color: '#080808',
              fontSize: 14, fontFamily: DM, fontWeight: 500,
              padding: '13px 28px', borderRadius: 100, textDecoration: 'none',
            }}>See the full report →</a>
          </div>

          {/* Right — three profile cards */}
          <div style={{ ...fi(s5.inView, 150), display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 9, fontFamily: DM, fontWeight: 300, color: DIM, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>The alignment picture</p>
            {[
              {
                label: 'Candidate', name: 'Marcus Thompson', role: 'Superintendent',
                scores: PROFILES[0].scores, badge: '93 · Strong Hire', badgeColor: GREEN,
              },
              {
                label: 'Hiring Manager', name: 'David Mercer', role: 'Client — Project Director',
                scores: HIRING_MANAGER, badge: '91% compatible', badgeColor: GREEN,
              },
              {
                label: 'Project Lead', name: 'Sarah Chen', role: 'Client — Project Lead',
                scores: { dominance: 0.38, extraversion: 0.82, patience: 0.70, formality: 0.50 } as FitModelScores,
                badge: '54% compatible', badgeColor: AMBER,
              },
            ].map((person, i) => (
              <div key={i} style={{
                background: CARD, border: `1px solid ${BORD}`, borderRadius: 12,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <FitModel
                  scores={person.scores}
                  benchmarkScores={BENCHMARK}
                  size={80}
                  variant="dark"
                  animated={false}
                  showLabels={false}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 8, fontFamily: DM, fontWeight: 300, color: DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{person.label}</p>
                  <p style={{ fontSize: 13, fontFamily: DM, fontWeight: 500, color: TEXT, marginBottom: 1 }}>{person.name}</p>
                  <p style={{ fontSize: 10, fontFamily: DM, fontWeight: 300, color: MUTED, marginBottom: 8 }}>{person.role}</p>
                  <span style={{
                    fontSize: 10, fontFamily: DM, fontWeight: 500,
                    color: person.badgeColor,
                    background: `${person.badgeColor}18`,
                    border: `1px solid ${person.badgeColor}40`,
                    padding: '2px 8px', borderRadius: 100,
                  }}>{person.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
