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
          0%, 100% { r: 4px; opacity: 0.10; }
          50% { r: 9px; opacity: 0; }
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
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 100, padding: '2px 8px',
                  fontSize: 9, fontWeight: 300, color: 'rgba(238,236,230,0.28)',
                  display: 'inline-block', marginTop: 4
                }}>
                  Role profile · AI-configured
                </span>
              </div>

              {/* Middle: Custom SVG radar — three polygon layers */}
              <div style={{ width: '100%', aspectRatio: '1 / 1', flexShrink: 0 }}>
                {/* viewBox: cx=100 cy=100 maxR=72, with label overflow room */}
                <svg viewBox="-35 -5 260 215" style={{ width: '100%', height: '100%' }}>
                  {/* Background rings at 50% and 100% radius */}
                  <polygon points="100.0,28.0 168.5,77.8 142.3,158.2 57.7,158.2 31.5,77.8"
                    fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <polygon points="100.0,64.0 134.2,88.9 121.2,129.1 78.8,129.1 65.8,88.9"
                    fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                  {/* Layer 1 — Pioneer archetype reference (faintest) */}
                  {/* values: Execution 82, Ownership 78, Adaptability 76, Collaboration 68, Decision Speed 88 */}
                  <polygon points="100.0,41.0 153.4,82.6 132.2,144.3 71.2,139.6 39.7,80.4"
                    fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                  {/* Layer 2 — Role benchmark (dashed) */}
                  {/* values: Execution 75, Ownership 72, Adaptability 65, Collaboration 68, Decision Speed 78 */}
                  <polygon points="100.0,46.0 149.3,84.0 127.5,137.9 71.2,139.6 46.6,82.6"
                    fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />

                  {/* Role annotation — top vertex of benchmark polygon */}
                  <text x="100" y="38" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.28)">Role</text>

                  {/* Layer 3 — Candidate Kent Morrison (solid blue) */}
                  {/* values: Execution 82, Ownership 74, Adaptability 70, Collaboration 62, Decision Speed 88 */}
                  <polygon points="100.0,41.0 150.7,83.5 129.6,140.8 73.7,136.1 39.7,80.4"
                    fill="rgba(74,142,255,0.1)" stroke="#4a8eff" strokeWidth="2" />

                  {/* Glow pulses — Execution (i=0, top) and Decision Speed (i=4, left) only */}
                  <circle cx="100" cy="41" r="8" fill="rgba(74,142,255,0.12)" className="vglow-ex" />
                  <circle cx="39.7" cy="80.4" r="8" fill="rgba(74,142,255,0.12)" className="vglow-ds" />

                  {/* Axis labels */}
                  <text x="100" y="16" textAnchor="middle" fontSize="9" fill="rgba(238,236,230,0.35)">Execution</text>
                  <text x="178" y="80" textAnchor="start" fontSize="9" fill="rgba(238,236,230,0.35)">Ownership</text>
                  <text x="150" y="170" textAnchor="start" fontSize="9" fill="rgba(238,236,230,0.35)">Adapt.</text>
                  <text x="50" y="170" textAnchor="end" fontSize="9" fill="rgba(238,236,230,0.35)">Collab.</text>
                  <text x="20" y="80" textAnchor="end" fontSize="9" fill="rgba(238,236,230,0.35)">Dec. Speed</text>
                </svg>
              </div>

              {/* Bottom: Operating Style */}
              <div>
                <p style={{ fontSize: 8, color: 'rgba(238,236,230,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Operating Style
                </p>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(238,236,230,0.65)', marginBottom: 5, letterSpacing: '-0.01em' }}>
                  Pioneer — Execution-first operator
                </p>
                <p style={{ fontSize: 9, fontWeight: 300, color: 'rgba(238,236,230,0.38)', lineHeight: 1.55, margin: '0 0 6px' }}>
                  Moves first, decides fast, drives without waiting for alignment. Trades collaboration for speed under pressure.
                </p>
                <p style={{ fontSize: 8, color: 'rgba(238,236,230,0.18)', marginBottom: 0 }}>
                  — Candidate &nbsp;·&nbsp; - - Role
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN — 60% — 3-layer decision hierarchy */}
            <div className="report-card-right" style={{
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: '18px 22px', overflow: 'hidden'
            }}>

              {/* ── LAYER 1: DECISION (anchor, immediate) ── */}
              <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <span style={{
                  display: 'block',
                  fontSize: 76, fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 900, color: '#eeece6', lineHeight: 1, letterSpacing: '-0.03em',
                  marginBottom: 6
                }}>93</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#3aa868', lineHeight: 1.15, marginBottom: 4 }}>
                  Strong hire — with one execution risk
                </p>
                <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.38)' }}>
                  Pioneer archetype · 4 of 5 dimensions above threshold · 1 of 3 shortlisted
                </p>
              </div>

              {/* ── LAYER 2: INSIGHT (where decisions are made) ── */}

              {/* Core insight — Primary Tension, dominant */}
              <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <p style={{ fontSize: 9, color: 'rgba(200,168,50,0.6)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Primary Tension
                </p>
                {/* Directional tension bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(74,142,255,0.8)', letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>
                    Kent
                  </span>
                  <div style={{ flex: 1, height: 2, borderRadius: 1, background: 'linear-gradient(90deg, rgba(74,142,255,0.5) 0%, rgba(200,168,50,0.5) 100%)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '30%', top: '50%', transform: 'translateY(-50%)', color: 'rgba(238,236,230,0.4)', fontSize: 10 }}>→</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(200,168,50,0.6)', letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>
                    Environment
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#eeece6', lineHeight: 1.4, marginBottom: 6 }}>
                  Moves faster than the organization can align
                </p>
                <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(200,168,50,0.75)', marginBottom: 5 }}>
                  → Risk of friction with the operating partner
                </p>
                <p style={{ fontSize: 10, fontWeight: 300, fontStyle: 'italic', color: 'rgba(238,236,230,0.35)' }}>
                  Best in autonomous roles with clear ownership and speed.
                </p>
              </div>

              {/* Hire If / Don't Hire If — the actual decision */}
              <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, color: '#3aa868', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 9 }}>✔ Hire if</p>
                    {['Speed matters more than consensus', 'Clear ownership, low dependency'].map((t) => (
                      <div key={t} style={{ borderLeft: '1.5px solid rgba(58,168,104,0.35)', paddingLeft: 8, fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.65)', lineHeight: 1.5, marginBottom: 6 }}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 9, color: '#e05a3a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 9 }}>✖ Don&apos;t hire if</p>
                    {['Alignment is critical before action', 'Stakeholders expect to be consulted'].map((t) => (
                      <div key={t} style={{ borderLeft: '1.5px solid rgba(224,90,58,0.35)', paddingLeft: 8, fontSize: 11, fontWeight: 300, color: 'rgba(238,236,230,0.65)', lineHeight: 1.5, marginBottom: 6 }}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Dynamics */}
              <div style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <p style={{ fontSize: 8, color: 'rgba(238,236,230,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Team Dynamics
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {([
                    { role: 'CEO', dots: 5, color: '#3aa868', text: 'Aligned on speed and ownership', note: 'Likely to experience candidate as highly effective' },
                    { role: 'Operating Partner', dots: 2, color: '#c8a832', text: 'Misaligned on pacing', note: 'Friction on decision timing' },
                    { role: 'Board Member', dots: 3, color: 'rgba(238,236,230,0.4)', text: 'Moderate alignment on ownership', note: 'May expect more structure' },
                  ] as Array<{ role: string; dots: number; color: string; text: string; note: string }>).map(({ role, dots, color, text, note }) => (
                    <div key={role} style={{ display: 'grid', gridTemplateColumns: '76px 48px 1fr', gap: '0 4px', alignItems: 'start' }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(238,236,230,0.5)', paddingTop: 1, lineHeight: 1.2 }}>{role}</span>
                      <span style={{ display: 'inline-flex', gap: 2, paddingTop: 3, flexShrink: 0 }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', display: 'inline-block', flexShrink: 0, background: i < dots ? 'rgba(238,236,230,0.55)' : 'transparent', border: `1px solid ${i < dots ? 'rgba(238,236,230,0.45)' : 'rgba(255,255,255,0.14)'}` }} />
                        ))}
                      </span>
                      <div>
                        <span style={{ fontSize: 9, fontWeight: 600, color, display: 'block', lineHeight: 1.2 }}>{text}</span>
                        <span style={{ fontSize: 8, fontWeight: 300, color: 'rgba(238,236,230,0.35)', display: 'block', lineHeight: 1.35 }}>→ {note}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: '7px 0 0', fontSize: 8, fontWeight: 300, fontStyle: 'italic', color: 'rgba(238,236,230,0.35)', lineHeight: 1.45 }}>
                  Aligns strongly with CEO, diverges with Operating Partner on pace — primary execution risk.
                </p>
              </div>

              {/* ── LAYER 3: EVIDENCE (de-emphasized, supporting) ── */}
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>

                {/* Signal bars — visual, no deltas */}
                <p style={{ fontSize: 9, color: 'rgba(238,236,230,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Signal profile
                </p>
                {([
                  { label: 'Execution', score: 82, pos: true },
                  { label: 'Ownership', score: 74, pos: true },
                  { label: 'Adaptability', score: 70, pos: true },
                  { label: 'Collaboration', score: 62, pos: false },
                  { label: 'D. Speed', score: 88, pos: true },
                ] as Array<{ label: string; score: number; pos: boolean }>).map((dim) => (
                  <div key={dim.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 8, color: 'rgba(238,236,230,0.25)', width: 68, flexShrink: 0, letterSpacing: '0.04em' }}>{dim.label}</span>
                    <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <div style={{
                        width: `${dim.score}%`, height: '100%', borderRadius: 2,
                        background: dim.pos ? 'rgba(74,142,255,0.38)' : 'rgba(224,90,58,0.5)'
                      }} />
                    </div>
                    <span style={{ fontSize: 8, color: dim.pos ? 'rgba(238,236,230,0.28)' : 'rgba(224,90,58,0.65)', width: 18, textAlign: 'right', flexShrink: 0 }}>{dim.score}</span>
                  </div>
                ))}

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
