'use client'

import { useEffect, useState, useRef } from 'react'
import { FitModel } from '@/app/components/FitModel'
import Nav from '@/app/components/Nav'

export default function HomePage() {
  const [navLight, setNavLight] = useState(false)
  const [lineDrawn, setLineDrawn] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const beat4Ref = useRef<HTMLDivElement>(null)
  const snapRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const lightSections = document.querySelectorAll('.beat-light')
    const obs = new IntersectionObserver(
      (entries) => {
        setNavLight(entries.some(e => e.isIntersecting))
      },
      { threshold: 0.1 }
    )
    lightSections.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = beat4Ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLineDrawn(true)
          obs.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const container = snapRef.current
    if (!container) return

    const handled = { current: false }
    const scrollingAway = { current: false }
    let touchStartY = 0

    const tryReveal = (e: Event) => {
      if (container.scrollTop > 10 || handled.current) return
      handled.current = true
      scrollingAway.current = true
      e.preventDefault()
      setShowWhy(true)
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 900)
    }

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) tryReveal(e)
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY - e.changedTouches[0].clientY > 30) tryReveal(e)
    }
    const onScroll = () => {
      if (scrollingAway.current) {
        if (container.scrollTop > 50) scrollingAway.current = false
        return
      }
      if (container.scrollTop < 10) {
        handled.current = false
        setShowWhy(false)
      }
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: false })
    container.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const container = snapRef.current
    if (!container) return
    const sections = Array.from(container.querySelectorAll('section'))
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(sections.indexOf(entry.target as HTMLElement))
          }
        })
      },
      { threshold: 0.5, root: container }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="snap-page" ref={snapRef}>
      <style>{`.snap-page::-webkit-scrollbar{display:none}`}</style>

      {/* FIXED NAV */}
      <Nav light={navLight} />

      {/* ============================================
          BEAT 1 — The Recognition → The Shift
          Second line animates in on first scroll attempt.
      ============================================ */}
      <section className="snap-beat" style={{ background: '#080808' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 700,
            color: showWhy ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.88)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: showWhy ? 18 : 0,
            transition: 'color 500ms ease, margin-bottom 500ms ease'
          }}>
            You already know<br />
            who&apos;s right for the role.
          </p>
          <p style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            opacity: showWhy ? 1 : 0,
            transform: showWhy ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 450ms ease 80ms, transform 450ms ease 80ms',
            pointerEvents: 'none'
          }}>
            Now show your client why.
          </p>
        </div>

      </section>

      {/* ============================================
          BEAT 3 — The Object
          The report appears. It just exists.
          snap-beat keeps it in one viewport.
      ============================================ */}
      <section ref={reportRef} className="snap-beat" style={{ background: '#080808', position: 'relative', overflow: 'hidden', padding: 0 }}>

        {/* Radial glow — sits behind everything */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '140%',
          paddingBottom: '140%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* CARD */}
        <div style={{
          width: '100%',
          maxWidth: 1060,
          height: 'calc(100vh - 58px)',
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(37,99,235,0.05)'
        }}>

          {/* TOP BAR */}
          <div style={{
            height: 44,
            padding: '0 28px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(238,236,230,0.3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Candidate Recommendation Report
            </span>
            <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(238,236,230,0.3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Presented to client
            </span>
          </div>

          {/* BODY — two columns */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

            {/* LEFT COLUMN — 42% */}
            <div style={{
              width: '42%',
              flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
            }}>
              {/* Top: candidate header */}
              <div>
                <p style={{ fontSize: 10, color: 'rgba(238,236,230,0.38)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  PE-Backed CFO · Velocity Growth Partners
                </p>
                <p style={{ fontSize: 22, fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, color: '#eeece6' }}>
                  Kent Morrison
                </p>
              </div>

              {/* Middle: radar — fills remaining space */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0, padding: '12px 0' }}>
                <div style={{
                  position: 'absolute',
                  width: '55%',
                  paddingBottom: '55%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <FitModel
                  scores={{ dominance: 0.88, extraversion: 0.49, patience: 0.35, formality: 0.67 }}
                  benchmarkScores={{ dominance: 0.72, extraversion: 0.52, patience: 0.50, formality: 0.66 }}
                  size={260}
                  variant="dark"
                  animated={false}
                  showLabels={true}
                />
              </div>

              {/* Bottom: legend + role fit line */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.22)', marginBottom: 6 }}>
                  — Candidate &nbsp;·&nbsp; - - Benchmark
                </p>
                <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.4)', lineHeight: 1.5 }}>
                  Above benchmark on execution and decision speed.<br />Gap on collaboration.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN — 58% */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 24px',
              overflow: 'hidden'
            }}>

              {/* Block 1 — Score + Verdict */}
              <div style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 0 }}>
                  <span style={{
                    fontSize: 72,
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 900,
                    color: '#eeece6',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    flexShrink: 0
                  }}>
                    93
                  </span>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#3aa868', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
                      Strong Hire — with one execution risk
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(238,236,230,0.3)' }}>
                      Decision confidence: High · Pioneer archetype
                    </p>
                  </div>
                </div>
              </div>

              {/* Block 2 — Primary Tension */}
              <div style={{ padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ borderLeft: '2px solid #c8a832', paddingLeft: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#c8a832', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 }}>
                    Primary Tension
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#eeece6', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 2 }}>
                    Execution Speed vs. Stakeholder Alignment
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.55)', lineHeight: 1.4 }}>
                    Kent will move faster than the operating partner expects.
                  </p>
                </div>
              </div>

              {/* Block 3 — Signal Profile */}
              <div style={{ padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7 }}>
                  Signal Profile
                </p>
                {[
                  { label: 'Execution', score: 72, delta: '+8', pos: true },
                  { label: 'Ownership', score: 67, delta: '+1', pos: true },
                  { label: 'Adaptability', score: 65, delta: '+15', pos: true },
                  { label: 'Collaboration', score: 49, delta: '−3', pos: false },
                  { label: 'Decision Speed', score: 85, delta: '+21', pos: true },
                ].map((dim) => (
                  <div key={dim.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(238,236,230,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {dim.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: dim.pos ? 'rgba(238,236,230,0.65)' : '#e05a3a' }}>
                      {dim.score} <span style={{ fontSize: 10, color: dim.pos ? 'rgba(58,168,104,0.85)' : '#e05a3a', fontWeight: dim.pos ? 400 : 700 }}>{dim.delta}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Block 4 — Hire If / Do Not Hire If */}
              <div style={{ padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#3aa868', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Hire If</p>
                    {['Pace over consensus', 'Autonomous scope with visible accountability'].map((t) => (
                      <div key={t} style={{ marginBottom: 4, fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.45)', lineHeight: 1.4, paddingLeft: 8, borderLeft: '1.5px solid rgba(255,255,255,0.15)' }}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#e05a3a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Do Not Hire If</p>
                    {['Consensus required before major decisions', 'Hiring manager expects frequent consultation'].map((t) => (
                      <div key={t} style={{ marginBottom: 4, fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.45)', lineHeight: 1.4, paddingLeft: 8, borderLeft: '1.5px solid rgba(255,255,255,0.15)' }}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Block 5 — The One Thing to Verify */}
              <div style={{ paddingTop: 9, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                  The One Thing to Verify
                </p>
                <p style={{ fontSize: 12, fontStyle: 'italic', fontWeight: 300, color: 'rgba(238,236,230,0.65)', lineHeight: 1.55 }}>
                  Does Kent know when to slow down — or does he only know how to go fast?
                </p>
                <p style={{ fontSize: 10, color: 'rgba(238,236,230,0.28)', marginTop: 'auto', paddingTop: 6 }}>
                  Full report includes team alignment, interview probes, and dimensional impact →
                </p>
              </div>

            </div>
          </div>
        </div>

        </div>{/* end zIndex wrapper */}
      </section>

      {/* ============================================
          BEAT 4 — The Consequence
          One line. The specific fear.
      ============================================ */}
      <section
        className="snap-beat"
        style={{ background: '#080808' }}
        ref={beat4Ref}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.82)',
            letterSpacing: '-0.02em',
            marginBottom: 12
          }}>
            So you don&apos;t hear
          </p>
          <p style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '-0.02em',
            fontStyle: 'italic'
          }}>
            &ldquo;let&apos;s see more candidates.&rdquo;
          </p>
        </div>

        {/* Drawing line */}
        <div style={{
          position: 'absolute',
          bottom: 48,
          left: '10%',
          right: '10%',
          height: 1,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'rgba(255,255,255,0.12)',
            transformOrigin: 'left',
            transform: lineDrawn ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 600ms ease-out'
          }} />
        </div>
      </section>

      {/* ============================================
          BEAT 5 — The Break
          Hard cut to light. Two lines. Nothing else.
      ============================================ */}
      <section
        className="snap-beat beat-light"
        style={{ background: '#F5F5F0' }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 600,
            color: 'rgba(0,0,0,0.22)',
            letterSpacing: '-0.03em',
            marginBottom: 14
          }}>
            This isn&apos;t an assessment.
          </p>
          <p style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.03em'
          }}>
            It&apos;s how you make the call.
          </p>
        </div>
      </section>

      {/* ============================================
          BEAT 6 — The Close
          Ghost report behind the text. One CTA.
      ============================================ */}
      <section
        className="snap-beat"
        style={{ background: '#080808', position: 'relative', overflow: 'hidden' }}
      >
        {/* Ghost report — subliminal, behind everything */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%',
          maxWidth: 680,
          opacity: 0.05,
          filter: 'blur(4px)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <div style={{
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14,
            padding: 32
          }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Marcus Thompson
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              Superintendent · Chicago · Gilbane Construction
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: '#fff' }}>93</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>Strong Hire</span>
            </div>
            {[
              'EXECUTION +8',
              'OWNERSHIP +1',
              'ADAPTABILITY +15',
              'COLLABORATION −3',
              'DECISION SPEED +21'
            ].map((d, i) => (
              <div key={i} style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Foreground */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24
        }}>
          <div>
            <p style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.88)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginBottom: 12
            }}>
              You already know.
            </p>
            <p style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05
            }}>
              Now show them.
            </p>
          </div>

          <a href="/sample-report" style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#FFFFFF',
            color: '#000000',
            fontSize: 16,
            fontWeight: 700,
            padding: '15px 36px',
            borderRadius: 9,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            maxWidth: 320
          }}>
            Open sample report →
          </a>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            Used in real client meetings to make the final call.
          </p>
        </div>
      </section>

      {/* DOT NAV */}
      <div style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: activeSection === i
              ? 'rgba(255,255,255,0.75)'
              : 'rgba(255,255,255,0.2)',
            transition: 'all 300ms ease',
          }} />
        ))}
      </div>

    </div>
  )
}
