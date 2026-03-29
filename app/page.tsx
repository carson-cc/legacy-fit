'use client'

import { useEffect, useState, useRef } from 'react'
import { FitModel } from '@/app/components/FitModel'

export default function HomePage() {
  const [navLight, setNavLight] = useState(false)
  const [lineDrawn, setLineDrawn] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
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

  return (
    <div className="snap-page" ref={snapRef}>

      {/* FIXED NAV */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '18px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: navLight
          ? 'rgba(245,245,240,0.96)'
          : 'transparent',
        backdropFilter: navLight ? 'blur(12px)' : 'none',
        transition: 'all 300ms ease'
      }}>
        <span style={{
          fontSize: 15,
          fontWeight: 700,
          color: navLight ? '#000' : '#fff',
          letterSpacing: '-0.01em',
          transition: 'color 300ms ease'
        }}>
          Veltro
        </span>
        <div className="nav-links-desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[
            { label: 'Sample Report', href: '/sample-report' },
            { label: 'Method', href: '/profiles' },
            { label: 'Sign in', href: '/login' }
          ].map(link => (
            <a key={link.label} href={link.href} style={{
              fontSize: 13,
              color: navLight
                ? 'rgba(0,0,0,0.4)'
                : 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              transition: 'color 300ms ease'
            }}>
              {link.label}
            </a>
          ))}
          <a href="/sample-report" style={{
            fontSize: 13,
            fontWeight: 600,
            color: navLight ? '#000' : '#fff',
            background: navLight
              ? 'rgba(0,0,0,0.06)'
              : 'rgba(255,255,255,0.1)',
            border: `1px solid ${navLight
              ? 'rgba(0,0,0,0.12)'
              : 'rgba(255,255,255,0.15)'}`,
            padding: '7px 14px',
            borderRadius: 6,
            textDecoration: 'none',
            transition: 'all 300ms ease'
          }}>
            See the report →
          </a>
        </div>
      </nav>

      {/* ============================================
          BEAT 1 — The Recognition → The Shift
          Second line animates in on first scroll attempt.
      ============================================ */}
      <section className="snap-beat" style={{ background: '#000' }}>
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

        <div style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: showWhy ? 0 : 0.35,
          transition: 'opacity 300ms ease'
        }}>
          <div style={{
            width: 1,
            height: 32,
            background: 'linear-gradient(180deg,rgba(255,255,255,0.6),transparent)'
          }} />
          <span style={{
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)'
          }}>
            Scroll
          </span>
        </div>
      </section>

      {/* ============================================
          BEAT 3 — The Object
          The report appears. It just exists.
          snap-beat-scroll allows internal scroll
          if report exceeds viewport height.
      ============================================ */}
      <section ref={reportRef} className="snap-beat-scroll" style={{ background: '#000', position: 'relative', overflow: 'hidden' }}>

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

        <p style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 12,
          textAlign: 'center',
          flexShrink: 0
        }}>
          What your client sees
        </p>

        <div style={{
          width: '100%',
          maxWidth: 1060,
          background: 'linear-gradient(160deg, #0F1825, #0A1018)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(37,99,235,0.05), 0 0 120px rgba(37,99,235,0.03), inset 0 1px 0 rgba(255,255,255,0.03)'
        }}>
          <div style={{
            height: 1,
            background: 'rgba(37,99,235,0.4)'
          }} />

          <div style={{
            padding: '8px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Candidate Recommendation Report
            </span>
            <span style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.18)',
              letterSpacing: '0.04em'
            }}>
              Presented to client
            </span>
          </div>

          {/* TOP BLOCK — The Call */}
          <div style={{
            padding: '12px 28px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 24,
            alignItems: 'start'
          }} className="report-top-block">

            {/* Left: name + score + verdict */}
            <div>
              <p style={{
                fontSize: 9,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.16)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                PE-Backed CFO · Velocity Growth Partners
              </p>
              <p style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: 6
              }}>
                Kent Morrison
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <span style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.9,
                  flexShrink: 0
                }}>
                  93
                </span>
                <div style={{ paddingBottom: 3 }}>
                  <p style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#22C55E',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    marginBottom: 2
                  }}>
                    Strong Hire — with one execution risk
                  </p>
                  <p style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.22)'
                  }}>
                    Decision confidence: High
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Primary Tension */}
            <div style={{
              background: 'rgba(234,179,8,0.05)',
              border: '1px solid rgba(234,179,8,0.18)',
              borderRadius: 8,
              padding: '8px 14px',
              minWidth: 200,
              maxWidth: 260
            }}>
              <p style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(234,179,8,0.6)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                Primary Tension
              </p>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.62)',
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
                marginBottom: 3
              }}>
                Execution Speed vs.<br />Stakeholder Alignment
              </p>
              <p style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.34)',
                lineHeight: 1.5
              }}>
                Kent will move faster than the operating partner expects.
              </p>
            </div>

          </div>

          {/* BODY — two columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.55fr'
          }} className="report-body-cols">

            {/* LEFT — Role Fit */}
            <div style={{
              borderRight: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 16px 10px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <p style={{
                fontSize: 9,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.16)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 4
              }}>
                Role Fit
              </p>
              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.32)',
                lineHeight: 1.4,
                marginBottom: 0
              }}>
                Above benchmark on execution and decision speed. Slight drop in collaboration.
              </p>

              <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
                <div style={{
                  position: 'absolute',
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <FitModel
                  scores={{
                    dominance: 0.88,
                    extraversion: 0.49,
                    patience: 0.35,
                    formality: 0.67
                  }}
                  benchmarkScores={{
                    dominance: 0.72,
                    extraversion: 0.52,
                    patience: 0.50,
                    formality: 0.66
                  }}
                  size={160}
                  variant="dark"
                  animated={false}
                  showLabels={true}
                />
              </div>

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.12)',
                marginTop: 6,
                textAlign: 'center'
              }}>
                Solid: Kent · Dashed: Benchmark
              </p>
            </div>

            {/* RIGHT — Execution Environment + Decision Frame + Insight + Probes */}
            <div style={{ padding: '10px 20px 10px 16px' }}>

              <p style={{
                fontSize: 9,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.16)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 6
              }}>
                Execution Environment
              </p>

              {[
                {
                  name: 'CEO',
                  role: 'Direct Report',
                  score: 91,
                  label: 'Aligned on speed',
                  color: '#22C55E',
                  note: 'Aligned on fast execution and independent ownership'
                },
                {
                  name: 'Operating Partner',
                  role: 'Key Stakeholder',
                  score: 58,
                  label: 'Pacing mismatch risk',
                  color: '#EAB308',
                  note: 'Expects structured alignment — pacing mismatch risk'
                },
                {
                  name: 'Board Member',
                  role: 'Key Stakeholder',
                  score: 82,
                  label: 'Aligned on ownership',
                  color: '#22C55E',
                  note: 'Aligned on ownership expectations'
                }
              ].map((person, i) => (
                <div key={i} style={{
                  marginBottom: 6,
                  paddingBottom: 6,
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 3
                  }}>
                    <div>
                      <p style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.85)',
                        marginBottom: 1
                      }}>
                        {person.name}
                      </p>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)' }}>
                        {person.role}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: person.color,
                      textAlign: 'right',
                      maxWidth: 130,
                      lineHeight: 1.3
                    }}>
                      {person.label}
                    </span>
                  </div>
                  <div style={{
                    height: 2,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    marginBottom: 3
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${person.score}%`,
                      background: person.color,
                      borderRadius: 2,
                      opacity: 0.45
                    }} />
                  </div>
                </div>
              ))}

              {/* Decision Frame */}
              <p style={{
                fontSize: 9,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.16)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                margin: '5px 0 4px'
              }}>
                Decision Frame
              </p>

              <div style={{
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 5
              }}>
                {[
                  {
                    label: 'HIRE IF',
                    color: '#22C55E',
                    bg: 'rgba(34,197,94,0.04)',
                    text: 'You need a decisive, execution-first CFO who operates with autonomy under pressure.'
                  },
                  {
                    label: 'DO NOT HIRE IF',
                    color: '#EF4444',
                    bg: 'rgba(239,68,68,0.04)',
                    text: 'The role requires stakeholder consensus before major decisions.'
                  }
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 10,
                    padding: '5px 12px',
                    background: row.bg,
                    borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <span style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: row.color,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      width: 72,
                      paddingTop: 2
                    }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', lineHeight: 1.45 }}>
                      {row.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Key Insight */}
              <div style={{
                background: 'rgba(37,99,235,0.04)',
                border: '1px solid rgba(37,99,235,0.10)',
                borderRadius: 8,
                padding: '6px 10px',
                marginBottom: 5
              }}>
                <p style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: 'rgba(37,99,235,0.55)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 3
                }}>
                  Key Insight
                </p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.46)', lineHeight: 1.5 }}>
                  Kent&apos;s execution and ownership scores are strong. The only flag is pace — the operating partner runs slower. Get ahead of that before he starts.
                </p>
              </div>

              {/* Interview Probes */}
              <p style={{
                fontSize: 9,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.16)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 4
              }}>
                Interview Probes
              </p>

              {[
                {
                  risk: 'Decision Speed',
                  q: 'Tell me about a time you moved forward before full stakeholder alignment.'
                },
                {
                  risk: 'Stakeholder Management',
                  q: 'Describe a situation where you had to slow down to bring leadership along.'
                }
              ].map((probe, i) => (
                <div key={i} style={{
                  marginBottom: 3,
                  paddingLeft: 7,
                  borderLeft: '2px solid rgba(37,99,235,0.16)'
                }}>
                  <p style={{
                    fontSize: 8,
                    fontWeight: 600,
                    color: 'rgba(37,99,235,0.45)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 2
                  }}>
                    {probe.risk}
                  </p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)', lineHeight: 1.4 }}>
                    {probe.q}
                  </p>
                </div>
              ))}

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.10)',
                marginTop: 5,
                paddingTop: 4,
                borderTop: '1px solid rgba(255,255,255,0.04)'
              }}>
                94 signals · Benchmark confidence: High
              </p>

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
        style={{ background: '#000' }}
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
        style={{ background: '#000', position: 'relative', overflow: 'hidden' }}
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
            background: '#0D1421',
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

    </div>
  )
}
