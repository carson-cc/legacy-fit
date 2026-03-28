'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FitModel } from '@/app/components/FitModel'
import SignalTrace from '@/app/components/SignalTrace'
import SearchProcessTimeline from '@/app/components/SearchProcessTimeline'

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
   LIVE REPORT PANEL — starts mid-animation, not from zero
───────────────────────────────────────────────────────────── */

function LiveReportPanel() {
  // Start at step 12 — visitor arrives to a system already running
  const [step, setStep] = useState(12)
  const [score, setScore] = useState(71)

  useEffect(() => {
    // Count up from 71 to 93 on mount
    const t0 = performance.now()
    const from = 71, to = 93, duration = 900
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setScore(Math.round(from + eased * (to - from)))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        // After score settles, animate remaining steps
        setTimeout(() => setStep(13), 200)
        setTimeout(() => setStep(14), 400)
        setTimeout(() => setStep(15), 580)
        setTimeout(() => setStep(16), 760)
        setTimeout(() => setStep(17), 1000)
        setTimeout(() => setStep(18), 1200)
        setTimeout(() => setStep(19), 1500)
        setTimeout(() => setStep(20), 1900)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const show = (s: number) => step >= s
  const fade = (s: number): React.CSSProperties => ({
    opacity: show(s) ? 1 : 0,
    transform: show(s) ? 'none' : 'translateY(5px)',
    transition: 'all 220ms ease-out',
  })

  const G = '#22C55E', R = '#EF4444', B = '#2563EB'
  const DIVIDER: React.CSSProperties = {
    height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 0',
  }

  return (
    <div style={{
      background: '#0D1421',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '24px 24px 20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {/* Top scan line — system processing indicator */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.6) 40%, rgba(37,99,235,0.9) 50%, rgba(37,99,235,0.6) 60%, transparent 100%)',
        animation: 'scanPulse 2.4s ease-in-out infinite',
      }} />

      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, boxShadow: `0 0 8px ${G}` }} />
          <span style={{ fontSize: 10, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Scoring Active</span>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>94 signals · v2.0</span>
      </div>

      {/* Candidate */}
      <p style={{ fontSize: 18, fontWeight: 700, color: '#FFF', marginBottom: 2, letterSpacing: '-0.01em' }}>Marcus Thompson</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 0 }}>Superintendent · Chicago · Gilbane Construction</p>

      <div style={DIVIDER} />

      {/* Score + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
        <svg width={68} height={68} viewBox="0 0 68 68" style={{ flexShrink: 0 }}>
          <circle cx={34} cy={34} r={31} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
          <circle cx={34} cy={34} r={31} fill="none" stroke={G} strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 31}`}
            strokeDashoffset={`${2 * Math.PI * 31 * (1 - score / 100)}`}
            transform="rotate(-90 34 34)"
            style={{ transition: 'stroke-dashoffset 60ms linear' }}
          />
          <text x={34} y={36} textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize={26} fontWeight={700} fontFamily="system-ui">{score}</text>
        </svg>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: G, marginBottom: 3 }}>Strong Hire</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>High confidence · Top 12%</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Role benchmark active</p>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Benchmark */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
        Aligned with high-performing candidates in comparable field leadership roles.
      </p>

      {/* Strengths */}
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Top Strengths</p>
      {[
        'Takes immediate ownership without being asked',
        'Makes clear decisions under pressure',
        'Drives stalled teams forward',
      ].map((s, i) => (
        <div key={s} style={{ ...fade(13 + i), display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: G, flexShrink: 0, marginTop: 4 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4 }}>{s}</span>
        </div>
      ))}

      {/* Risks */}
      <p style={{ ...fade(16), fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 6, marginTop: 10 }}>Primary Risks</p>
      {[
        'May outrun process in structured environments',
        'Can force alignment before full input',
      ].map((r, i) => (
        <div key={r} style={{ ...fade(17 + i), display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(239,68,68,0.7)', flexShrink: 0, marginTop: 4 }} />
          <span style={{ fontSize: 11, color: 'rgba(252,165,165,0.75)', lineHeight: 1.4 }}>{r}</span>
        </div>
      ))}

      <div style={{ ...fade(19), ...DIVIDER }} />

      {/* HM Signal */}
      <div style={{ ...fade(19) }}>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Hiring Manager Signal</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: G }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Compatible · High collaboration alignment</span>
        </div>
      </div>

      {/* FitModel */}
      <div style={{ ...fade(20), display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <FitModel
          scores={{ dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 }}
          target={{ dominance: 0.74, extraversion: 0.54, patience: 0.46, formality: 0.56 }}
          size={200}
          variant="dark"
          animated={step >= 20}
        />
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center' as const, marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Dominance · Extraversion · Patience · Formality</div>
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
  return (
    <div style={{
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
        width={448}
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

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const output = useInView(0.05)
  const howWorks = useInView(0.05)
  const hmSection = useInView(0.05)
  const signalSection = useInView(0.05)
  const sciSection = useInView(0.05)
  const close = useInView(0.05)

  const BG = '#060B14'
  const SF = '#0D1421'
  const B = '#2563EB'
  const G = '#22C55E'
  const MAX = 1280

  return (
    <main style={{ background: BG, color: '#FFF', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? 'rgba(6,11,20,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        transition: 'all 240ms ease-out',
      }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textDecoration: 'none', letterSpacing: '-0.02em' }}>Veltro</Link>
          <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {[
              { label: 'Product', href: '#how-it-works' },
              { label: 'Method', href: '/profiles' },
              { label: 'Archetypes', href: '/archetypes' },
              { label: 'Sample Report', href: '/sample-report' },
            ].map(l => (
              <Link key={l.label} href={l.href}
                style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 160ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >{l.label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 160ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >Sign in</Link>
            <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
              height: 34, padding: '0 20px', borderRadius: 8, background: '#FFF', color: '#060B14',
              fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 160ms ease',
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >Request a walkthrough</a>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
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

        <div className="hero-grid" style={{ maxWidth: MAX, margin: '0 auto', padding: '80px 40px', width: '100%', display: 'grid', gap: 72, alignItems: 'center', position: 'relative', zIndex: 2 }}>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 999, padding: '5px 12px 5px 8px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: B, boxShadow: `0 0 6px ${B}` }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.04em' }}>Built for search &amp; staffing firms</span>
            </div>

            <h1 style={{ fontSize: 60, lineHeight: 1.04, fontWeight: 700, letterSpacing: '-0.035em', marginBottom: 24, color: '#FFF' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>Your gut is right.</span><br />
              Now prove it.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', maxWidth: 460, marginBottom: 40 }}>
              Veltro, a scoring platform for retained search, turns your behavioral read into a scored report your client can&rsquo;t argue with — without changing how you run a search.
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 52 }}>
              <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
                height: 46, padding: '0 24px', borderRadius: 10, background: '#FFF', color: '#060B14',
                fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', transition: 'all 180ms ease', letterSpacing: '-0.01em',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >Request a walkthrough</a>
              <Link href="/sample-report" style={{
                height: 46, padding: '0 24px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.65)',
                fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', transition: 'all 180ms ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#FFF' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
              >See what your client sees &rarr;</Link>
            </div>

            {/* Trust strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
              {[
                { label: '94 behavioral signals', color: '#22C55E' },
                { label: 'Role-specific benchmark', color: '#2563EB' },
                { label: 'Hiring manager pairing', color: '#EAB308' },
              ].map((item, i) => (
                <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && <span style={{ margin: '0 14px', color: 'rgba(255,255,255,0.08)', fontSize: 14, lineHeight: 1 }}>·</span>}
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}80` }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em', fontWeight: 500 }}>{item.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right — live report panel */}
          <LiveReportPanel />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          THE OUTPUT — show before explaining
      ══════════════════════════════════════════════ */}
      <section id="output" style={{ padding: '120px 40px' }}>
        <div ref={output.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>

          <div style={{
            opacity: output.visible ? 1 : 0,
            transform: output.visible ? 'none' : 'translateY(20px)',
            transition: 'all 500ms ease-out',
          }}>
            {/* Section header */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14 }}>The Deliverable</p>
              <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', color: '#FFF', marginBottom: 12, lineHeight: 1.1 }}>
                This is what you open<br />in the client meeting.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480 }}>
                One report. A score, a benchmark, a compatibility read — everything your client needs to say yes with conviction.
              </p>
            </div>

            {/* Report preview + quotes side by side */}
            <div className="output-grid" style={{ display: 'grid', gap: 48, alignItems: 'start' }}>

              {/* Report card */}
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
                      Aligned with high-performing candidates in comparable field leadership roles. Top 12% of evaluated candidates.
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
                    />
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center' as const, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Dominance · Extraversion · Patience · Formality</div>

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
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>94 signals · Role benchmark active · Scoring v2.0</span>
                  <span style={{ fontSize: 10, color: B, fontWeight: 500, cursor: 'pointer' }}>Share report →</span>
                </div>
              </div>

              {/* Positioning */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 28 }}>Who uses it</p>
                <p style={{ fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 36 }}>
                  Retained search firms placing senior talent in field leadership, finance, sales, and operations — where a wrong placement costs the client a year and costs you the relationship.
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28 }}>
                  <Link href="/sample-report" style={{
                    fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'color 160ms ease',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >See the full live report →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — search process timeline
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '120px 40px', background: '#080E1A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div ref={howWorks.ref} style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 14 }}>The Process</p>
          <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', color: '#FFF', marginBottom: 12, lineHeight: 1.1 }}>Your search, unchanged. Your presentation, decisive.</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 520, marginBottom: 56, lineHeight: 1.7 }}>
            One additional step at shortlist. Every candidate scored against a role-specific benchmark. A deliverable your client can hold.
          </p>

          <div style={{
            opacity: howWorks.visible ? 1 : 0,
            transform: howWorks.visible ? 'none' : 'translateY(12px)',
            transition: 'all 400ms ease-out',
          }}>
            <SearchProcessTimeline />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HIRING MANAGER — the differentiator
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '120px 40px' }}>
        <div ref={hmSection.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>
          <div className="two-col-grid" style={{ display: 'grid', gap: 80, alignItems: 'center' }}>

            {/* Left — copy */}
            <div style={{
              opacity: hmSection.visible ? 1 : 0,
              transform: hmSection.visible ? 'none' : 'translateY(16px)',
              transition: 'all 400ms ease-out',
            }}>
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
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 24 }}>Team Compatibility Analysis</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  {[
                    { name: 'Marcus Thompson', role: 'Candidate', scores: { dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 } },
                    { name: 'David Mercer', role: 'Hiring Manager', scores: { dominance: 0.55, extraversion: 0.70, patience: 0.72, formality: 0.65 } },
                  ].map(person => (
                    <div key={person.name} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#FFF', marginBottom: 2 }}>{person.name}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{person.role}</p>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <FitModel scores={person.scores} size={164} variant="dark" animated={hmSection.visible} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: G, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}><strong style={{ color: '#FFF', fontWeight: 600 }}>Works well with:</strong> Collaboration · Decision Speed</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EAB308', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}><strong style={{ color: '#FFF', fontWeight: 600 }}>Watch for:</strong> Adaptability gap · Pace mismatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MID-PAGE CTA
      ══════════════════════════════════════════════ */}
      <div style={{ textAlign: 'center', padding: '64px 40px 0' }}>
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

      {/* ══════════════════════════════════════════════
          SIGNAL TRACE — the science in a visual
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '120px 40px', background: '#080E1A', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                94 signals.<br />Five dimensions.<br />One number that closes the room.
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 20 }}>
                Each evaluation pulls 94 behavioral signals from two structured inputs, mapped across five dimensions that predict performance in the role — not personality in the abstract. The score tells you where a candidate fits, where they strain, and why.
              </p>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32 }}>
                The benchmark is role-specific — field leadership, executive, sales, technical — normed against 2.2 million respondents across eight peer-reviewed validation studies. Not a proprietary black box. Published science.
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

      {/* ══════════════════════════════════════════════
          SCIENCE CREDIBILITY STRIP
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '64px 40px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div ref={sciSection.ref} style={{ maxWidth: MAX, margin: '0 auto' }}>
          <div className="stats-grid" style={{ display: 'grid', gap: 40 }}>
            {[
              { n: '2.2M', label: 'People in the norm dataset', detail: 'IPIP-NEO · 16PF · 8 peer-reviewed studies' },
              { n: '94', label: 'Behavioral signals per evaluation', detail: '80 adjective inputs · 2 structured lists' },
              { n: '5', label: 'Role-relevant dimensions scored', detail: 'Execution · Ownership · Adaptability · Collaboration · Decision Speed' },
              { n: 'v2.0', label: 'Current scoring model', detail: 'Quadratic gap penalty · Role-weighted benchmark' },
            ].map((item, i) => (
              <div key={i} style={{
                opacity: sciSection.visible ? 1 : 0,
                transform: sciSection.visible ? 'none' : 'translateY(8px)',
                transition: `all 280ms ease-out ${i * 60}ms`,
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#FFF', letterSpacing: '-0.02em', marginBottom: 4 }}>{item.n}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLOSE
      ══════════════════════════════════════════════ */}
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
            <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
              height: 48, padding: '0 28px', borderRadius: 10, background: '#FFF', color: BG,
              fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 180ms ease', letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >Request a walkthrough</a>
            <Link href="/sample-report" style={{
              height: 48, padding: '0 28px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 15, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 180ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#FFF' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >See what your client would see &rarr;</Link>
          </div>
        </div>

        <footer style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>© 2025 Veltro</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>veltro.ai · team@veltro.ai</p>
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
          .hero-grid   { grid-template-columns: 1fr; }
          .signal-grid { grid-template-columns: 1fr; }
        }

        /* ── Breakpoint: collapse standard two-column layouts ── */
        @media (max-width: 900px) {
          .two-col-grid  { grid-template-columns: 1fr; }
          .output-grid   { grid-template-columns: 1fr; }
          .stats-grid    { grid-template-columns: 1fr 1fr; }
        }

        /* ── Breakpoint: mobile type scale ── */
        @media (max-width: 768px) {
          .hero-grid { padding: 48px 24px !important; gap: 40px !important; }
          h1 { font-size: 40px !important; }
          h2 { font-size: 28px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Breakpoint: very small screens ── */
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  )
}
