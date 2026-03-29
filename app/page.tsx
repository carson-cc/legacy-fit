'use client'

import { useEffect, useState, useRef } from 'react'
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
      <style>{`
        .snap-page::-webkit-scrollbar{display:none}
        @keyframes radarPulse {
          0%, 100% { r: 4px; opacity: 0.15; }
          50% { r: 13px; opacity: 0; }
        }
        .vglow-ex { animation: radarPulse 2.5s ease-in-out infinite 0s; }
        .vglow-ds { animation: radarPulse 2.5s ease-in-out infinite 1.2s; }
        @media (max-width: 768px) {
          .report-card-body { flex-direction: column !important; }
          .report-card-left { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          .report-card-right { padding: 16px !important; }
        }
      `}</style>

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
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '140%', paddingBottom: '140%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* CARD */}
        <div style={{
          width: '100%',
          maxWidth: 'min(1060px, calc(100vw - clamp(40px, 8vw, 160px)))',
          height: 'calc(100svh - 58px)',
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(37,99,235,0.05)'
        }}>

          {/* TOP BAR — 40px */}
          <div style={{
            height: 40, padding: '0 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
          }}>
            <span style={{ fontSize: 10, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Candidate Recommendation Report
            </span>
            <span style={{ fontSize: 10, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Presented to client · Mar 14, 2026
            </span>
          </div>

          {/* BODY — two columns */}
          <div className="report-card-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

            {/* LEFT COLUMN — 40% */}
            <div className="report-card-left" style={{
              width: '40%', flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.07)',
              padding: '20px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>

              {/* Top: Candidate identity */}
              <div>
                <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                  PE-BACKED CFO · VELOCITY GROWTH PARTNERS
                </p>
                <p style={{ fontSize: 20, fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, color: '#eeece6', marginBottom: 2 }}>
                  Kent Morrison
                </p>
                <span style={{
                  background: 'rgba(74,142,255,0.08)', border: '1px solid rgba(74,142,255,0.18)',
                  borderRadius: 100, padding: '2px 8px',
                  fontSize: 9, fontWeight: 300, color: 'rgba(74,142,255,0.65)',
                  display: 'inline-block', marginTop: 4
                }}>
                  Role profile · AI-configured
                </span>
              </div>

              {/* Middle: Custom SVG radar — three polygon layers */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: '8px 0' }}>
                {/* viewBox: cx=100 cy=100 maxR=72, with label overflow room */}
                <svg viewBox="-25 -5 250 215" style={{ width: '100%', maxWidth: 240, minWidth: 180 }}>
                  {/* Background rings at 50% and 100% radius */}
                  <polygon points="100.0,28.0 168.5,77.8 142.3,158.2 57.7,158.2 31.5,77.8"
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <polygon points="100.0,64.0 134.2,88.9 121.2,129.1 78.8,129.1 65.8,88.9"
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

                  {/* Layer 1 — Pioneer archetype reference (faintest) */}
                  {/* values: Execution 82, Ownership 78, Adaptability 76, Collaboration 68, Decision Speed 88 */}
                  <polygon points="100.0,41.0 153.4,82.6 132.2,144.3 71.2,139.6 39.7,80.4"
                    fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />

                  {/* Layer 2 — Role benchmark (dashed) */}
                  {/* values: Execution 75, Ownership 72, Adaptability 65, Collaboration 68, Decision Speed 78 */}
                  <polygon points="100.0,46.0 149.3,84.0 127.5,137.9 71.2,139.6 46.6,82.6"
                    fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4 3" />

                  {/* Layer 3 — Candidate Kent Morrison (solid blue) */}
                  {/* values: Execution 82, Ownership 74, Adaptability 70, Collaboration 62, Decision Speed 88 */}
                  <polygon points="100.0,41.0 150.7,83.5 129.6,140.8 73.7,136.1 39.7,80.4"
                    fill="rgba(74,142,255,0.1)" stroke="#4a8eff" strokeWidth="1.5" />

                  {/* Glow pulses — Execution (i=0, top) and Decision Speed (i=4, left) only */}
                  <circle cx="100" cy="41" r="8" fill="rgba(74,142,255,0.12)" className="vglow-ex" />
                  <circle cx="39.7" cy="80.4" r="8" fill="rgba(74,142,255,0.12)" className="vglow-ds" />

                  {/* Axis labels — abbreviated to fit */}
                  <text x="100" y="16" textAnchor="middle" fontSize="9" fill="rgba(238,236,230,0.35)">Execution</text>
                  <text x="178" y="80" textAnchor="start" fontSize="9" fill="rgba(238,236,230,0.35)">Ownership</text>
                  <text x="150" y="170" textAnchor="start" fontSize="9" fill="rgba(238,236,230,0.35)">Adapt.</text>
                  <text x="50" y="170" textAnchor="end" fontSize="9" fill="rgba(238,236,230,0.35)">Collab.</text>
                  <text x="20" y="80" textAnchor="end" fontSize="9" fill="rgba(238,236,230,0.35)">D. Speed</text>
                </svg>
              </div>

              {/* Bottom: legend + archetype one-liner */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.28)', marginBottom: 4 }}>
                  — Candidate &nbsp;·&nbsp; - - Role &nbsp;·&nbsp; ··· Pioneer
                </p>
                <p style={{ fontSize: 9, fontWeight: 300, fontStyle: 'italic', color: 'rgba(238,236,230,0.32)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Pioneer: moves first, decides fast, drives without waiting for alignment.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN — 60% — six blocks */}
            <div className="report-card-right" style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              padding: '16px 20px', overflow: 'hidden'
            }}>

              {/* Block 1 — The Verdict */}
              <div style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    fontSize: 64, fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 900, color: '#eeece6', lineHeight: 1, flexShrink: 0, letterSpacing: '-0.03em'
                  }}>93</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#3aa868', lineHeight: 1.2 }}>
                      Strong Hire — with one execution risk
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.4)', marginTop: 3 }}>
                      Above role threshold on 4 of 5 dimensions
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 300, color: 'rgba(238,236,230,0.32)', marginTop: 2 }}>
                      1 of 3 shortlisted candidates
                    </p>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 100, padding: '2px 8px',
                      fontSize: 9, color: 'rgba(238,236,230,0.45)',
                      marginTop: 4, display: 'inline-block'
                    }}>Pioneer archetype</span>
                  </div>
                </div>
              </div>

              {/* Block 2 — Primary Tension */}
              <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ borderLeft: '2px solid #c8a832', paddingLeft: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#c8a832', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      Primary Tension
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 8, color: 'rgba(238,236,230,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>FRICTION</span>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c8a832', display: 'inline-block' }} />
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block', marginLeft: 3 }} />
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'inline-block', marginLeft: 3 }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#eeece6', marginTop: 4 }}>
                    Execution Speed vs. Stakeholder Alignment
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.52)', marginTop: 2 }}>
                    Kent will move faster than the operating partner expects.
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 300, fontStyle: 'italic', color: 'rgba(238,236,230,0.38)', marginTop: 3 }}>
                    Best fit: autonomous scope, direct reporting line, pace-first culture.
                  </p>
                  <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.25)', letterSpacing: '0.06em', marginTop: 3 }}>
                    AI synthesis · 94 behavioral signals
                  </p>
                </div>
              </div>

              {/* Block 3 — Signal Profile */}
              <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7 }}>
                  Signal Profile
                </p>
                {([
                  { label: 'Execution', score: 82, delta: '+8', pos: true },
                  { label: 'Ownership', score: 74, delta: '+1', pos: true },
                  { label: 'Adaptability', score: 70, delta: '+15', pos: true },
                  { label: 'Collaboration', score: 62, delta: '−3', pos: false },
                  { label: 'Decision Speed', score: 88, delta: '+21', pos: true },
                ] as Array<{ label: string; score: number; delta: string; pos: boolean }>).map((dim) => (
                  <div key={dim.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: dim.pos ? '2px 0' : '2px 6px',
                    background: dim.pos ? 'transparent' : 'rgba(224,90,58,0.06)',
                    borderRadius: dim.pos ? 0 : 4,
                    marginLeft: dim.pos ? 0 : -6,
                    marginRight: dim.pos ? 0 : -6,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 300, color: dim.pos ? 'rgba(238,236,230,0.45)' : '#e05a3a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {dim.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: dim.pos ? '#eeece6' : '#e05a3a' }}>
                      {dim.score}{' '}
                      <span style={{ fontSize: 10, fontWeight: dim.pos ? 300 : 700, color: dim.pos ? '#3aa868' : '#e05a3a' }}>
                        {dim.delta}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Block 4 — Hire If / Do Not Hire If */}
              <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 9, color: '#3aa868', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Hire If</p>
                    {['Pace over consensus', 'Autonomous scope, clear accountability'].map((t) => (
                      <div key={t} style={{ borderLeft: '1.5px solid rgba(58,168,104,0.3)', paddingLeft: 7, fontSize: 10, fontWeight: 300, color: 'rgba(238,236,230,0.55)', lineHeight: 1.4, marginBottom: 3 }}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: '#e05a3a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Do Not Hire If</p>
                    {['Consensus required before decisions', 'Hiring manager expects consultation'].map((t) => (
                      <div key={t} style={{ borderLeft: '1.5px solid rgba(224,90,58,0.3)', paddingLeft: 7, fontSize: 10, fontWeight: 300, color: 'rgba(238,236,230,0.55)', lineHeight: 1.4, marginBottom: 3 }}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Block 5 — Team Alignment */}
              <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 9, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Team Alignment</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 100, padding: '1px 6px', fontSize: 8, color: 'rgba(238,236,230,0.35)'
                  }}>MODE B</span>
                </div>
                {([
                  { name: 'David Mercer', role: 'Hiring Manager', score: 74, color: '#c8a832', fill: 'rgba(200,168,50,0.1)', pts: '8.0,3.3 12.7,6.5 10.1,10.9 6.1,10.7 3.9,6.7' },
                  { name: 'Sarah Chen', role: 'Project Manager', score: 61, color: '#c8a832', fill: 'rgba(200,168,50,0.1)', pts: '8.0,4.9 11.3,6.9 10.9,12.0 5.0,12.1 5.4,7.2' },
                  { name: 'James Okafor', role: 'Site Supervisor', score: 88, color: '#3aa868', fill: 'rgba(58,168,104,0.1)', pts: '8.0,2.7 12.8,6.4 10.3,11.2 5.9,10.8 3.4,6.5' },
                ] as Array<{ name: string; role: string; score: number; color: string; fill: string; pts: string }>).map((person) => (
                  <div key={person.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                      <polygon points="8,2 13.7,6.1 11.5,12.9 4.5,12.9 2.3,6.1" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                      <polygon points={person.pts} fill={person.fill} stroke={person.color} strokeWidth="1" />
                    </svg>
                    <span style={{ flex: 1, fontSize: 10, fontWeight: 500, color: '#eeece6' }}>
                      {person.name}{' '}
                      <span style={{ fontWeight: 300, color: 'rgba(238,236,230,0.38)' }}>· {person.role}</span>
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: person.color }}>{person.score}</span>
                  </div>
                ))}
              </div>

              {/* Block 6 — The One Thing to Verify */}
              <div style={{ paddingTop: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                  The One Thing to Verify
                </p>
                <p style={{ fontSize: 11, fontWeight: 300, fontStyle: 'italic', color: 'rgba(238,236,230,0.62)', lineHeight: 1.55 }}>
                  Does Kent know when to slow down — or does he only know how to go fast?
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
              <span style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff' }}>93</span>
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
