'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FitModel } from '@/app/components/FitModel'
import FitModelDual from '@/app/components/FitModelDual'
import SignalTrace from '@/app/components/SignalTrace'


/* ─────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useCursorGlow(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const h = (e: MouseEvent) => {
      el.style.setProperty('--cx', e.clientX + 'px')
      el.style.setProperty('--cy', e.clientY + 'px')
    }
    el.addEventListener('mousemove', h, { passive: true })
    return () => el.removeEventListener('mousemove', h)
  }, [ref])
}

/* ─────────────────────────────────────────────────────────────
   LIVE REPORT PANEL
───────────────────────────────────────────────────────────── */

function LiveReportPanel({ mobile }: { mobile: boolean }) {
  const [benchmarkVisible, setBenchmarkVisible] = useState(false)
  const [insightVisible, setInsightVisible] = useState(false)
  const [strengthsLabelVisible, setStrengthsLabelVisible] = useState(false)
  const [str0, setStr0] = useState(false)
  const [str1, setStr1] = useState(false)
  const [str2, setStr2] = useState(false)
  const [divVis, setDivVis] = useState(false)
  const [hmLabelVis, setHmLabelVis] = useState(false)
  const [hmSignalVis, setHmSignalVis] = useState(false)
  const [fitVis, setFitVis] = useState(false)
  const [panelHovered, setPanelHovered] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setBenchmarkVisible(true), 300),
      setTimeout(() => setInsightVisible(true), 500),
      setTimeout(() => setStrengthsLabelVisible(true), 700),
      setTimeout(() => setStr0(true), 820),
      setTimeout(() => setStr1(true), 940),
      setTimeout(() => setStr2(true), 1060),
      setTimeout(() => setDivVis(true), 1200),
      setTimeout(() => setHmLabelVis(true), 1350),
      setTimeout(() => setHmSignalVis(true), 1500),
      setTimeout(() => setFitVis(true), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const G = '#22C55E', R = '#EF4444', B = '#2563EB'
  const DIVIDER: React.CSSProperties = {
    height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 0',
  }

  const panelTransform = mobile
    ? 'none'
    : panelHovered
      ? 'perspective(1200px) rotateY(0deg) rotateX(0deg)'
      : 'perspective(1200px) rotateY(-2deg) rotateX(1deg)'
  const panelShadow = mobile
    ? '0 0 0 1px rgba(255,255,255,0.04), 0 4px 6px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
    : '0 0 0 1px rgba(255,255,255,0.04), 0 4px 6px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.5), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'

  return (
    <div
      onMouseEnter={() => setPanelHovered(true)}
      onMouseLeave={() => setPanelHovered(false)}
      style={{
        background: 'rgba(13,20,33,0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '28px 28px 24px',
        boxShadow: panelShadow,
        transform: panelTransform,
        transition: 'transform 400ms ease-out',
        transformOrigin: 'center center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top scan line — system processing indicator */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.6) 40%, rgba(37,99,235,0.9) 50%, rgba(37,99,235,0.6) 60%, transparent 100%)',
        animation: 'scanPulse 2.4s ease-in-out infinite',
      }} />

      {/* Context strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 6px rgba(34,197,94,0.6)'
          }}/>
          <span style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.08em'
          }}>
            FINAL RECOMMENDATION
          </span>
        </div>
        <span style={{fontSize:10,color:'rgba(255,255,255,0.2)'}}>
          Gilbane Construction · Mar 2026
        </span>
      </div>

      {/* Candidate */}
      <p style={{ fontSize: 22, fontWeight: 700, color: '#FFF', marginBottom: 2, letterSpacing: '-0.01em' }}>Marcus Thompson</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 0 }}>Superintendent · Chicago · Gilbane Construction</p>

      <div style={DIVIDER} />

      {/* Score + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
        <svg width={68} height={68} viewBox="0 0 68 68" style={{ flexShrink: 0 }}>
          <circle cx={34} cy={34} r={31} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
          <circle cx={34} cy={34} r={31} fill="none" stroke={G} strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 31}`}
            strokeDashoffset={`${2 * Math.PI * 31 * (1 - 93 / 100)}`}
            transform="rotate(-90 34 34)"
          />
          <text x={34} y={36} textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize={40} fontWeight={700} fontFamily="system-ui">93</text>
        </svg>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: G, marginBottom: 3 }}>Strong Hire</p>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
            fontStyle: 'italic',
            margin: '4px 0',
            opacity: insightVisible ? 1 : 0,
            transition: 'opacity 400ms ease-out'
          }}>
            Strong fit for field leadership. One condition to address in onboarding.
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>High confidence</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Role benchmark active</p>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Benchmark */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12, opacity: benchmarkVisible ? 1 : 0, transition: 'opacity 300ms ease-out' }}>
        Aligned with high-performing candidates in comparable field leadership roles.
      </p>

      {/* Strengths */}
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 6, opacity: strengthsLabelVisible ? 1 : 0, transition: 'opacity 300ms ease-out' }}>Top Strengths</p>
      {([
        { text: 'Takes immediate ownership without being asked', vis: str0 },
        { text: 'Makes clear decisions under pressure', vis: str1 },
        { text: 'Drives stalled teams forward', vis: str2 },
      ] as { text: string; vis: boolean }[]).map(({ text, vis }) => (
        <div key={text} style={{
          display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5,
          opacity: vis ? 1 : 0,
          transform: vis ? 'none' : 'translateY(6px)',
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: G, flexShrink: 0, marginTop: 4 }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{text}</span>
        </div>
      ))}

      {/* Risks */}
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 6, marginTop: 10 }}>Primary Risks</p>
      {[
        'May outrun process in structured environments',
        'Can force alignment before full input',
      ].map((r) => (
        <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(239,68,68,0.7)', flexShrink: 0, marginTop: 4 }} />
          <span style={{ fontSize: 12, color: 'rgba(252,165,165,0.8)', lineHeight: 1.4 }}>{r}</span>
        </div>
      ))}

      <div style={{
        height: 1,
        background: 'rgba(255,255,255,0.07)',
        margin: '12px 0',
        width: divVis ? '100%' : '0%',
        transition: 'width 250ms ease-out',
      }} />

      {/* HM Signal */}
      <div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 8, opacity: hmLabelVis ? 1 : 0, transition: 'opacity 300ms ease-out' }}>Hiring Manager Signal</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, opacity: hmSignalVis ? 1 : 0, transition: 'opacity 300ms ease-out' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: G }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Compatible · High collaboration alignment</span>
        </div>
      </div>

      {/* FitModel */}
      <div style={{ opacity: fitVis ? 1 : 0, transition: 'opacity 400ms ease-out', display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <FitModel
          scores={{ dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 }}
          target={{ dominance: 0.74, extraversion: 0.54, patience: 0.46, formality: 0.56 }}
          size={200}
          variant="dark"
          animated={fitVis}
          showLabels={false}
        />
      </div>
      <p style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.04em',
        textAlign: 'center',
        marginTop: 8
      }}>
        Execution · Ownership · Adaptability · Collaboration · Decision Speed
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT COUNTER
───────────────────────────────────────────────────────────── */

function StatCounter({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const { ref, visible } = useInView(0.5)
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!visible) return
    const t0 = performance.now(), duration = 1200
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, value])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 44, fontWeight: 700, color: '#FFF', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, letterSpacing: '0.01em' }}>{label}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIGNAL TRACE DEMO — for the method section
───────────────────────────────────────────────────────────── */

function SignalTraceDemo({ visible }: { visible: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [traceWidth, setTraceWidth] = useState(448)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => {
      setTraceWidth(Math.min(448, Math.floor(e.contentRect.width - 48)))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={wrapRef} style={{
      background: '#0D1421',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      padding: '20px 24px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(12px)',
      transition: 'all 500ms ease-out',
    }}>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Signal Pattern vs. Benchmark</p>
      <SignalTrace
        candidateScores={{ dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 }}
        benchmarkScores={{ dominance: 0.74, extraversion: 0.54, patience: 0.46, formality: 0.56 }}
        width={traceWidth}
        variant="dark"
        animated={visible}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HOMEPAGE
───────────────────────────────────────────────────────────── */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLDivElement>(null)
  useCursorGlow(heroRef as React.RefObject<HTMLElement | null>)
  useCursorGlow(closeRef as React.RefObject<HTMLElement | null>)

  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const [sceneTriggered, setSceneTriggered] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneTriggered(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const output = useInView(0.05)
  const howWorks = useInView(0.05)
  const hmSection = useInView(0.05)
  const signalSection = useInView(0.05)
  const sciSection = useInView(0.05)
  const close = useInView(0.05)

  const [processMode, setProcessMode] = useState<'a' | 'b'>('a')
  const processStep2Ref = useRef<HTMLDivElement>(null)
  const processStep5Ref = useRef<HTMLDivElement>(null)
  const processStepsRef = useRef<HTMLDivElement>(null)
  const [connLine, setConnLine] = useState<{ top: number; height: number } | null>(null)
  useEffect(() => {
    if (processMode !== 'b') { setConnLine(null); return }
    const measure = () => {
      const container = processStepsRef.current
      const s2 = processStep2Ref.current
      const s5 = processStep5Ref.current
      if (!container || !s2 || !s5) return
      const cRect = container.getBoundingClientRect()
      const s2Rect = s2.getBoundingClientRect()
      const s5Rect = s5.getBoundingClientRect()
      setConnLine({ top: s2Rect.bottom - cRect.top, height: Math.max(0, s5Rect.top - s2Rect.bottom) })
    }
    const t = setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(t); window.removeEventListener('resize', measure) }
  }, [processMode])

  const BG = '#060B14'
  const SF = '#0D1421'
  const B = '#2563EB'
  const G = '#22C55E'
  const MAX = 1280

  return (
    <main style={{ background: BG, color: '#FFF', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif', overflowX: 'hidden' }}>

      {/* ----------------------------------------------
          NAV
      ---------------------------------------------- */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? 'rgba(6,11,20,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        transition: 'all 240ms ease-out',
      }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="nav-inner">
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textDecoration: 'none', letterSpacing: '-0.02em' }}>Veltro</Link>
          <div className="nav-links-group" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {[
              { label: 'Sample Report', href: '/sample-report' },
              { label: 'Method', href: '/profiles' },
            ].map(l => (
              <Link key={l.label} href={l.href}
                style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 160ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >{l.label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" className="nav-signin" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 160ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >Sign in</Link>
            <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" className="nav-cta" style={{
              height: 34, padding: '0 20px', borderRadius: 8, background: '#FFF', color: '#060B14',
              fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 160ms ease',
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            ><span className="nav-cta-desktop">Request a walkthrough</span><span className="nav-cta-mobile">Talk to us</span></a>
          </div>
        </div>
      </nav>

      {/* ----------------------------------------------
          HERO
      ---------------------------------------------- */}
      <section ref={heroRef} style={{
        position: 'relative', minHeight: '100vh', paddingTop: 64,
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Cursor glow */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(700px circle at var(--cx, 40%) var(--cy, 50%), rgba(37,99,235,0.04), transparent 50%)' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, zIndex: 1, background: `linear-gradient(transparent, ${BG})`, pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ maxWidth: MAX, margin: '0 auto', padding: '32px 32px 0', width: '100%', display: 'grid', gap: 72, alignItems: 'center', position: 'relative', zIndex: 2 }}>

          {/* Left */}
          <div>
            <h1 style={{ fontSize: 60, lineHeight: 1.04, fontWeight: 700, letterSpacing: '-0.035em', marginBottom: 24, color: '#FFF' }}>
              <span style={{ color: 'rgba(255,255,255,0.72)' }}>Your gut is right.</span><br />
              Now show it.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', maxWidth: 460, marginBottom: 40 }}>
              No change to how you run a search. One additional step at shortlist. A report your client acts on.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 52 }}>
              <Link href="/sample-report" style={{
                height: 44, padding: '0 24px', borderRadius: 8, background: '#FFF', color: '#111827',
                fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', transition: 'all 180ms ease', letterSpacing: '-0.01em',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >See what your client sees &rarr;</Link>
              <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
                height: 44, padding: '0 24px', borderRadius: 8,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', transition: 'all 180ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#FFF' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >Request a walkthrough</a>
            </div>

            <p className="hero-italic-line" style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              fontStyle: 'italic',
              marginTop: 16,
              marginBottom: 0,
              letterSpacing: '-0.01em'
            }}>
              So you don&rsquo;t hear &ldquo;let&rsquo;s see more candidates.&rdquo;
            </p>

            {/* Trust strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', marginTop: 8 }}>
              {[
                '80 behavioral signals',
                'Role-specific benchmark',
                'Hiring manager compatibility'
              ].map((item, i) => (
                <span key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', gap: 0 }}>
                  {i > 0 && <span style={{margin: '0 10px', color: 'rgba(255,255,255,0.15)'}}>·</span>}
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — live report panel */}
          <div>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              marginBottom: 12,
              textAlign: 'center'
            }}>
              What your client sees
            </p>
            <LiveReportPanel mobile={isMobile} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------
          THE PAUSE — reframe
      ---------------------------------------------- */}
      <section style={{
        background: '#0B0F14',
        padding: '56px 32px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 22,
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 500,
          lineHeight: 1.5,
          maxWidth: 640,
          margin: '0 auto',
          letterSpacing: '-0.01em',
        }}>
          This doesn&rsquo;t measure personality.
          <br />
          It helps you make the call.
        </p>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.6,
          maxWidth: 480,
          margin: '16px auto 0',
          textAlign: 'center',
          letterSpacing: '-0.01em'
        }}>
          The resume tells you what they&rsquo;ve done.
          <br />
          This tells you how they work.
        </p>
      </section>

      {/* ----------------------------------------------
          THE SCENE — emotional anchor
      ---------------------------------------------- */}
      <section
        ref={sceneRef}
        style={{
          padding: '48px 32px 80px',
          background: '#0B0F14'
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {[
            { text: 'Eight weeks in.', pause: 0, size: 'normal' as const },
            { text: 'Your candidate is right for the role.', pause: 120, size: 'normal' as const },
            { text: 'The client met someone internally.', pause: 240, size: 'normal' as const },
            { text: "Now they\u2019re not sure.", pause: 360, size: 'normal' as const },
            { text: 'BREAK', pause: 0, size: 'break' as const },
            { text: 'This is where most searches break.', pause: 560, size: 'normal' as const },
            { text: 'Not because the candidate is wrong.', pause: 680, size: 'normal' as const },
            { text: "Because they can\u2019t show why the candidate is right.", pause: 800, size: 'normal' as const },
            { text: 'BREAK', pause: 0, size: 'break' as const },
            { text: 'Veltro is built for that moment.', pause: 1100, size: 'verdict' as const },
          ].map((sentence, i) => {
            if (sentence.size === 'break') {
              return <div key={i} style={{ height: 20 }} />
            }
            const isVerdict = sentence.size === 'verdict'
            return (
              <span
                key={i}
                style={{
                  display: 'block',
                  fontSize: isVerdict ? 20 : 17,
                  fontWeight: isVerdict ? 600 : 400,
                  color: isVerdict ? '#FFFFFF' : 'rgba(255,255,255,0.62)',
                  lineHeight: 1.8,
                  letterSpacing: isVerdict ? '-0.02em' : '-0.01em',
                  marginBottom: isVerdict ? 0 : 2,
                  opacity: sceneTriggered ? 1 : 0,
                  transform: sceneTriggered ? 'translateY(0px)' : 'translateY(8px)',
                  transition: sceneTriggered
                    ? `opacity 320ms ease-out ${sentence.pause}ms, transform 320ms ease-out ${sentence.pause}ms`
                    : 'none',
                }}
              >
                {sentence.text}
              </span>
            )
          })}
        </div>
      </section>

      {/* ----------------------------------------------
          THE DIFFERENCE — what changes
      ---------------------------------------------- */}
      <section style={{ padding: '72px 32px' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto' }}>
          <div className="difference-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Left — what they hear today */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 40,
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 24 }}>What your clients hear today</p>
              {[
                '"Strong background for the role."',
                '"Good operating fit, we think."',
                '"We\'re confident in this recommendation."',
                '"We think he can do the job."'
              ].map((line, i) => (
                <p key={i} style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: 8
                }}>
                  {line}
                </p>
              ))}
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.2)',
                marginTop: 20,
                fontStyle: 'italic'
              }}>
                Sounds fine. Doesn&rsquo;t hold up when the client gets nervous.
              </p>
            </div>

            {/* Right — what they see with Veltro */}
            <div style={{
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.25)',
              boxShadow: '0 0 40px rgba(37,99,235,0.06)',
              borderRadius: 16,
              padding: 40,
            }}>
              <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 24 }}>What they see with Veltro</p>
              {[
                { label: '93 — Strong Hire', desc: 'Top performers in field leadership score 85+. Marcus is at 93.' },
                { label: 'Compatible with the hiring team', desc: 'High overlap on collaboration and decision speed. One friction point on pace — addressable in onboarding.' },
                { label: '3 interview probes, ready to use', desc: 'Targeted questions tied directly to the risk areas. Walk into the debrief prepared.' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.3)',
                fontStyle: 'italic',
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                The resume got you to this meeting.
                This gets you out of it with a yes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------
          THE OUTPUT — show before explaining
      ---------------------------------------------- */}
      <section id="output" style={{ padding: '72px 32px' }}>
        <div ref={output.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>

          <div style={{
            opacity: output.visible ? 1 : 0,
            transform: output.visible ? 'none' : 'translateY(20px)',
            transition: 'all 500ms ease-out',
          }}>
            {/* Section header */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14 }}>The Deliverable</p>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#FFF', marginBottom: 0, lineHeight: 1.1 }}>
                The deliverable your client actually sees.
              </h2>
            </div>

            {/* Report preview + quotes side by side */}
            <div className="output-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

              {/* Report card */}
              <div style={{ position: 'relative', maxHeight: 520, overflow: 'hidden' }}>
                <div style={{
                  background: SF, border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ padding: '28px 28px 0' }}>
                  {/* Report header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 3 }}>Marcus Thompson</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Superintendent · Chicago · Gilbane</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <svg width={68} height={68} viewBox="0 0 68 68">
                        <circle cx={34} cy={34} r={31} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2.5} />
                        <circle cx={34} cy={34} r={31} fill="none" stroke={G} strokeWidth={2.5}
                          strokeDasharray={`${2 * Math.PI * 31 * 0.93}`} strokeDashoffset={0}
                          strokeLinecap="round" transform="rotate(-90 34 34)"
                        />
                        <text x={34} y={36} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={24} fontWeight={700}>93</text>
                      </svg>
                      <p style={{ fontSize: 11, color: G, fontWeight: 600, marginTop: 4 }}>Strong Hire</p>
                    </div>
                  </div>

                  {/* Benchmark */}
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      Aligned with high-performing candidates in comparable field leadership roles.
                    </p>
                  </div>

                  {/* FitModel */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <FitModel
                      scores={{ dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 }}
                      target={{ dominance: 0.74, extraversion: 0.54, patience: 0.46, formality: 0.56 }}
                      size={220}
                      variant="dark"
                      animated={false}
                      showLabels={false}
                    />
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                    marginTop: 8
                  }}>
                    Execution · Ownership · Adaptability · Collaboration · Decision Speed
                  </p>

                  {/* Strengths + Risks inline */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Top Strengths</p>
                      {['Takes immediate ownership', 'Decisive under pressure', 'Drives team momentum'].map(s => (
                        <div key={s} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: G, flexShrink: 0, marginTop: 4 }} />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Primary Risks</p>
                      {['May outrun process', 'Can force alignment early'].map(r => (
                        <div key={r} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(239,68,68,0.6)', flexShrink: 0, marginTop: 4 }} />
                          <span style={{ fontSize: 11, color: 'rgba(252,165,165,0.7)' }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>80 signals · Role benchmark active</span>
                  <span style={{ fontSize: 10, color: B, fontWeight: 500, cursor: 'pointer' }}>Share report →</span>
                </div>
              </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #0B0F14)', pointerEvents: 'none' }}></div>
              </div>

              {/* Positioning */}
              <div style={{ paddingTop: 16 }}>
                <p style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.7,
                  marginBottom: 32
                }}>
                  Search and staffing firms placing candidates in field leadership,
                  finance, sales, and operations — where a wrong placement costs
                  the client a year and costs you the relationship.
                </p>
                <Link href="/sample-report" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FFFFFF',
                  color: '#111827',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '12px 24px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  marginBottom: 12,
                  transition: 'all 180ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >Open sample report &rarr;</Link>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
                  Used in client meetings to make the final call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------
          HOW IT WORKS — interactive process timeline
      ---------------------------------------------- */}
      <section id="how-it-works" style={{ padding: '72px 32px', background: '#080E1A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div ref={howWorks.ref} style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Eyebrow */}
          <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14, textAlign: 'center' }}>The Process</p>
          {/* Headline */}
          <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', color: '#FFF', marginBottom: 12, lineHeight: 1.1, textAlign: 'center' }}>Your search, unchanged. Your presentation, decisive.</h2>
          {/* Subhead */}
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.7, margin: '0 auto 48px', textAlign: 'center' }}>
            Start with candidates only. Add hiring manager profiling when you&rsquo;re ready.
          </p>

          {/* Mode toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 4, gap: 4 }}>
              <button
                onClick={() => setProcessMode('a')}
                style={{
                  height: 36, padding: '0 20px', borderRadius: 999, fontSize: 13, border: 'none', cursor: 'pointer',
                  transition: 'all 180ms ease-out',
                  background: processMode === 'a' ? 'white' : 'transparent',
                  color: processMode === 'a' ? '#111827' : 'rgba(255,255,255,0.45)',
                  fontWeight: processMode === 'a' ? 600 : 400,
                }}
              >Candidates only</button>
              <button
                onClick={() => setProcessMode('b')}
                style={{
                  height: 36, padding: '0 20px', borderRadius: 999, fontSize: 13, border: 'none', cursor: 'pointer',
                  transition: 'all 180ms ease-out',
                  background: processMode === 'b' ? 'white' : 'transparent',
                  color: processMode === 'b' ? '#111827' : 'rgba(255,255,255,0.45)',
                  fontWeight: processMode === 'b' ? 600 : 400,
                }}
              >+ Hiring Manager</button>
            </div>
          </div>

          {/* ── MODE A TIMELINE ── */}
          {processMode === 'a' && (
            <div style={{ position: 'relative' }}>
              {/* Spine */}
              <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: 0, top: 8, bottom: 0, width: 1, background: 'rgba(255,255,255,0.1)' }} />

              {/* Step 1 — KICKOFF */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '0ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Kickoff</span>
                <p style={{ fontSize: 17, color: 'white', fontWeight: 600, marginBottom: 6 }}>Define the role benchmark.</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>Veltro suggests a behavioral target based on role type. Adjust and confirm in 60 seconds. The benchmark drives every candidate score.</p>
              </div>

              {/* Step 2 — SHORTLIST */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '80ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '1px solid #2563EB', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Shortlist</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Send each candidate a single link.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>Veltro active</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>No login. Any device. Six minutes per candidate. They complete the evaluation independently.</p>
                <div style={{ marginTop: 12, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 8, padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Candidate receives:</span>
                  <span style={{ fontSize: 11, color: 'white', fontWeight: 500 }}>Evaluation link via email</span>
                </div>
              </div>

              {/* Step 3 — EVALUATION */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '160ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '1px solid #2563EB', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Evaluation</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Scores are generated automatically.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>Veltro active</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>94 behavioral signals processed against your active role benchmark. Fit score, recommendation, and confidence level produced immediately on completion.</p>
              </div>

              {/* Step 4 — PRESENTATION */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '240ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '1px solid #2563EB', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Presentation</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Open the report in the client meeting.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>Veltro active</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>Score, fit, risks, and interview probes. The meeting ends in a decision.</p>
                <div style={{ marginTop: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Client receives:</span>
                  <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>Scored recommendation report</span>
                </div>
              </div>

              {/* Bottom CTA — Mode A */}
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 48 }}>
                Want richer reports?{' '}
                <button
                  onClick={() => setProcessMode('b')}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                >See how Mode B works</button>
              </p>
            </div>
          )}

          {/* ── MODE B TIMELINE ── */}
          {processMode === 'b' && (
            <div ref={processStepsRef} style={{ position: 'relative' }}>
              {/* Spine */}
              <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: 0, top: 8, bottom: 0, width: 1, background: 'rgba(255,255,255,0.1)' }} />

              {/* Connecting line — measured after render */}
              {connLine && !isMobile && (
                <div style={{
                  position: 'absolute',
                  left: 16,
                  top: connLine.top,
                  height: connLine.height,
                  borderLeft: '1px dashed rgba(124,58,237,0.3)',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Step 1 — KICKOFF */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '0ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Kickoff</span>
                <p style={{ fontSize: 17, color: 'white', fontWeight: 600, marginBottom: 6 }}>Define the role benchmark.</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>Veltro suggests a behavioral target based on role type. Adjust and confirm in 60 seconds. The benchmark drives every candidate score.</p>
              </div>

              {/* Step 2 — KICKOFF HIRING MANAGER — purple */}
              <div ref={processStep2Ref} style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '80ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#7C3AED', border: '1px solid #7C3AED', boxShadow: '0 0 8px rgba(124,58,237,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Kickoff — Hiring Manager</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Profile the hiring manager once.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#7C3AED', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>One time per client</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>The hiring manager completes the same six-minute evaluation. Their profile is stored against the client account automatically.</p>
                <div style={{ marginTop: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Stored per client.</span>
                  <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 500 }}>Active on every future candidate, forever.</span>
                </div>
              </div>

              {/* Step 3 — SHORTLIST CANDIDATES */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '160ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '1px solid #2563EB', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Shortlist — Candidates</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Send each candidate a single link.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>Veltro active</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>Same process as Candidates only. The hiring manager profile is already active — no extra steps.</p>
              </div>

              {/* Step 4 — EVALUATION */}
              <div style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, marginBottom: isMobile ? 10 : 48, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '240ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '1px solid #2563EB', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Evaluation</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Scores are generated automatically.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>Veltro active</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>94 behavioral signals processed against your active role benchmark. Fit score, recommendation, and confidence level produced immediately on completion.</p>
              </div>

              {/* Step 5 — PRESENTATION enhanced */}
              <div ref={processStep5Ref} style={{ position: 'relative', paddingLeft: isMobile ? 16 : 32, animation: 'fadeSlideUp 200ms ease-out forwards', animationDelay: '320ms', opacity: 0, ...(isMobile ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10 } : {}) }}>
                <div style={{ display: isMobile ? 'none' : undefined, position: 'absolute', left: -5, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '1px solid #2563EB', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>Presentation</span>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 17, color: 'white', fontWeight: 600 }}>Open the report. It already includes the hiring manager.</span>
                  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 7px', marginLeft: 10, letterSpacing: '0.04em' }}>Veltro active</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>Every report now shows candidate fit AND hiring manager compatibility — who they work well with, where friction may emerge, what to address in onboarding.</p>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Role fit: </span>
                    <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>Scored vs benchmark</span>
                  </div>
                  <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Team fit: </span>
                    <span style={{ fontSize: 11, color: '#A78BFA', fontWeight: 500 }}>Scored vs hiring manager</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA — Mode B */}
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 48 }}>
                Already using Mode A?{' '}
                <button
                  onClick={() => setProcessMode('a')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                >View candidate-only flow</button>
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ----------------------------------------------
          HIRING MANAGER — the differentiator
      ---------------------------------------------- */}
      <section style={{ padding: '72px 32px' }}>
        <div ref={hmSection.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>
          <div className="two-col-grid" style={{ display: 'grid', gap: 80, alignItems: 'center' }}>

            {/* Left — copy */}
            <div style={{
              opacity: hmSection.visible ? 1 : 0,
              transform: hmSection.visible ? 'none' : 'translateY(16px)',
              transition: 'all 400ms ease-out',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#A78BFA', letterSpacing: '0.1em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 12 }}>Mode B</span>
              <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 20 }}>The Differentiator</p>
              <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
                One profile per client.<br />Active on every candidate, forever.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 28 }}>
                Profile your client&rsquo;s hiring manager once. Every candidate report that follows is automatically scored against that pattern — no extra work, no separate process. Takes fifteen minutes. Same intake format as the candidate.
              </p>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 40 }}>
                You stop presenting a name. You present a fit: &ldquo;Marcus scores 93. He aligns with David on collaboration and decision speed — with a known friction point on pace you can address in onboarding.&rdquo;
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Works well with', desc: 'Where candidate and HM behavioral patterns align', color: G },
                  { label: 'Watch for', desc: 'Where friction may emerge under pressure', color: '#EAB308' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>{item.label} </span>
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 28 }}>One profile per client. Active on every candidate, forever.</p>
            </div>

            {/* Right — dual FitModel visual */}
            <div style={{
              opacity: hmSection.visible ? 1 : 0,
              transform: hmSection.visible ? 'none' : 'translateY(16px)',
              transition: 'all 500ms ease-out 150ms',
            }}>
              <div style={{ background: SF, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 20 }}>Candidate · Hiring Manager Overlay</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <FitModelDual
                    candidateScores={{ dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 }}
                    benchmarkScores={{ dominance: 0.55, extraversion: 0.70, patience: 0.72, formality: 0.65 }}
                    candidateLabel="Marcus Thompson"
                    benchmarkLabel="David Mercer (HM)"
                    size={isMobile ? 180 : 240}
                    variant="dark"
                    showDeltas={!isMobile}
                    animated={hmSection.visible}
                  />
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: G, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}><strong style={{ color: '#FFF', fontWeight: 600 }}>Strong overlap:</strong> Collaboration · Decision Speed</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EAB308', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}><strong style={{ color: '#FFF', fontWeight: 600 }}>Gap to probe:</strong> Adaptability · Pace mismatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------
          MID-PAGE CTA
      ---------------------------------------------- */}
      <div style={{ textAlign: 'center', padding: '56px 32px 0' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Ready to see this on a real search?{' '}
          <a
            href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request"
            style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 160ms ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >Request a walkthrough &rarr;</a>
        </span>
      </div>

      {/* ----------------------------------------------
          SIGNAL TRACE — the science in a visual
      ---------------------------------------------- */}
      <section style={{ padding: '72px 32px', background: '#080E1A', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div ref={signalSection.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>
          <div className="signal-grid" style={{ display: 'grid', gap: 80, alignItems: 'center' }}>

            {/* Left — Signal Trace */}
            <SignalTraceDemo visible={signalSection.visible} />

            {/* Right — copy */}
            <div style={{
              opacity: signalSection.visible ? 1 : 0,
              transform: signalSection.visible ? 'none' : 'translateY(16px)',
              transition: 'all 400ms ease-out 150ms',
            }}>
              <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 20 }}>The Model</p>
              <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
                80 signals.<br />Five dimensions.<br />One number that closes the room.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 20 }}>
                Six minutes. Two structured word lists. The candidate describes how they work — not who they are. 80 signals extracted, scored against a benchmark built for the specific role you&rsquo;re filling. The score tells you where they fit, where they strain, and why.
              </p>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32 }}>
                The benchmark is role-specific — field leadership, executive, sales, technical — built on 2.2 million people across eight research studies. Not a black box. Published science.
              </p>
              <Link href="/profiles" style={{
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none', transition: 'color 160ms ease',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >Read the methodology →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------
          SCIENCE CREDIBILITY STRIP
      ---------------------------------------------- */}
      <section style={{ padding: '56px 32px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div ref={sciSection.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 40 }}>
            Built on real behavioral data — so the recommendation holds up in the room.
          </p>
          <div className="stats-grid" style={{ display: 'grid', gap: 40 }}>
            {[
              { n: '2.2M', label: 'People in the norm dataset', detail: null, smallDetail: 'Published norm data across 8 research studies' },
              { n: '94', label: 'Behavioral signals per evaluation', detail: null, smallDetail: null },
              { n: '5', label: 'Role-relevant dimensions scored', detail: 'Execution · Ownership · Adaptability · Collaboration · Decision Speed', smallDetail: null },
              { n: '6 min', label: 'Time per candidate', detail: null, smallDetail: null },
            ].map((item, i) => (
              <div key={i} style={{
                opacity: sciSection.visible ? 1 : 0,
                transform: sciSection.visible ? 'none' : 'translateY(8px)',
                transition: `all 280ms ease-out ${i * 60}ms`,
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF', letterSpacing: '-0.02em', marginBottom: 4 }}>{item.n}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{item.label}</div>
                {item.detail && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>{item.detail}</div>}
                {item.smallDetail && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>{item.smallDetail}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------
          CLOSE
      ---------------------------------------------- */}
      <section ref={closeRef} style={{
        position: 'relative', minHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '128px 40px', overflow: 'hidden',
      }}>
        {/* Backgrounds */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(700px circle at var(--cx, 50%) var(--cy, 50%), rgba(37,99,235,0.04), transparent 50%)' }} />

        <div ref={close.ref} style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720 }}>
          {[
            { text: 'You already know who\'s right for the role.', color: '#FFF' },
            { text: 'Now you can show your client', color: '#FFF' },
            { text: 'exactly why.', color: B },
          ].map((line, i) => (
            <div key={i} style={{
              display: 'block',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: '-0.035em',
              color: line.color,
              opacity: close.visible ? 1 : 0,
              transform: close.visible ? 'none' : 'translateY(16px)',
              transition: `all 300ms ease-out ${180 + i * 120}ms`,
            }}>{line.text}</div>
          ))}

          <div style={{ marginTop: 56, display: 'flex', gap: 14, justifyContent: 'center' }}>
            <Link href="/sample-report" style={{
              height: 48, padding: '0 28px', borderRadius: 10, background: '#FFF', color: BG,
              fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 180ms ease', letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >See what your client sees</Link>
            <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
              height: 48, padding: '0 28px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 15, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 180ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#FFF' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >Request a walkthrough &rarr;</a>
          </div>
        </div>

        <footer style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>Veltro · veltro.ai · team@veltro.ai · © 2026</p>
        </footer>
      </section>

      <style>{`
        @keyframes scanPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* ── Grid definitions ── */
        .hero-grid   { grid-template-columns: 1fr 480px; }
        .output-grid { grid-template-columns: 1fr 400px; }
        .two-col-grid { grid-template-columns: 1fr 1fr; }
        .signal-grid  { grid-template-columns: 500px 1fr; }
        .stats-grid   { grid-template-columns: repeat(4, 1fr); }

        /* ── Breakpoint: collapse side-by-side wide layouts ── */
        @media (max-width: 1100px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .signal-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Breakpoint: collapse standard two-column layouts ── */
        @media (max-width: 900px) {
          .two-col-grid  { grid-template-columns: 1fr; }
          .output-grid   { grid-template-columns: 1fr; }
          .stats-grid    { grid-template-columns: 1fr 1fr; }
          .difference-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }

        /* ── Breakpoint: mobile type scale ── */
        @media (max-width: 768px) {
          .hero-grid { padding: 48px 24px !important; gap: 40px !important; }
          h1 { font-size: 40px !important; }
          h2 { font-size: 28px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .scene-paragraph { font-size: 15px !important; }
          .scene-conclusion { font-size: 18px !important; }
          .difference-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }

        /* ── Breakpoint: very small screens ── */
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }

        /* ── Breakpoint: italic line wrap protection ── */
        @media (max-width: 375px) {
          .hero-italic-line { display: none !important; }
        }

        /* ── Mobile nav: wordmark + CTA only ── */
        .nav-cta-mobile { display: none; }
        @media (max-width: 767px) {
          .nav-links-group { display: none !important; }
          .nav-signin      { display: none !important; }
          .nav-inner       { padding: 0 20px !important; }
          .nav-cta         { height: 36px !important; padding: 0 14px !important; font-size: 13px !important; }
          .nav-cta-desktop { display: none !important; }
          .nav-cta-mobile  { display: inline !important; }
          .hero-grid       { gap: 32px !important; padding: 40px 20px !important; }
          .signal-grid     { gap: 40px !important; }
          .two-col-grid    { grid-template-columns: 1fr !important; gap: 40px !important; }
          section          { padding-left: 20px !important; padding-right: 20px !important; }
          .hero-ctas       { flex-direction: column !important; align-items: stretch !important; }
          .hero-ctas > *   { justify-content: center !important; text-align: center !important; }
        }
      `}</style>
    </main>
  )
}
