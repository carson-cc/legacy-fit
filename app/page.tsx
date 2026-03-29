'use client'

import { useEffect, useState, useRef } from 'react'
import { FitModel } from '@/app/components/FitModel'

export default function HomePage() {
  const [navLight, setNavLight] = useState(false)
  const [lineDrawn, setLineDrawn] = useState(false)
  const beat4Ref = useRef<HTMLDivElement>(null)

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

  return (
    <div className="snap-page">

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
          BEAT 1 — The Recognition
          Black screen. One line. Nothing else.
      ============================================ */}
      <section className="snap-beat" style={{ background: '#000' }}>
        <p style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.88)',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          textAlign: 'center',
          maxWidth: 700
        }}>
          You already know<br />
          who&apos;s right for the role.
        </p>

        <div style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.35
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
          BEAT 2 — The Shift
          First line dims. Second line arrives.
      ============================================ */}
      <section className="snap-beat" style={{ background: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(32px, 5vw, 60px)',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 16
          }}>
            You already know<br />
            who&apos;s right for the role.
          </p>
          <p style={{
            fontSize: 'clamp(32px, 5vw, 60px)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.05
          }}>
            Now show your client why.
          </p>
        </div>
      </section>

      {/* ============================================
          BEAT 3 — The Object
          The report appears. It just exists.
          snap-beat-scroll allows internal scroll
          if report exceeds viewport height.
      ============================================ */}
      <section className="snap-beat-scroll" style={{ background: '#000', position: 'relative', overflow: 'hidden' }}>

        {/* Radial glow — sits behind everything */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '140%',
          paddingBottom: '140%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 20,
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
          boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(37,99,235,0.08), 0 0 120px rgba(37,99,235,0.05), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}>
          <div style={{
            height: 1,
            background: 'rgba(37,99,235,0.4)'
          }} />

          <div style={{
            padding: '14px 24px',
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

          {/* Main body — three columns */}
          <div style={{
            padding: 24,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 20
          }} className="report-three-col">

            {/* COLUMN 1 — Role fit */}
            <div style={{
              borderRight: '1px solid rgba(255,255,255,0.06)',
              paddingRight: 20
            }}>
              <p style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12
              }}>
                Role Fit
              </p>

              <p style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                marginBottom: 2
              }}>
                Marcus Thompson
              </p>
              <p style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.32)',
                marginBottom: 14
              }}>
                Superintendent · Chicago · Gilbane
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.9,
                  flexShrink: 0
                }}>
                  93
                </span>
                <div style={{ paddingTop: 4 }}>
                  <p style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#22C55E',
                    letterSpacing: '-0.02em',
                    marginBottom: 3
                  }}>
                    Strong Hire
                  </p>
                  <p style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.28)'
                  }}>
                    Top 12% · High confidence
                  </p>
                </div>
              </div>

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8
              }}>
                Signal vs. Benchmark
              </p>

              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
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
                  size={180}
                  variant="dark"
                  animated={false}
                  showLabels={true}
                />
              </div>

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.16)',
                marginTop: 6,
                textAlign: 'center'
              }}>
                Solid: Marcus · Dashed: Benchmark
              </p>
            </div>

            {/* COLUMN 2 — Team compatibility */}
            <div style={{
              borderRight: '1px solid rgba(255,255,255,0.06)',
              paddingRight: 20
            }}>
              <p style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12
              }}>
                Team Compatibility
              </p>

              {[
                {
                  name: 'David Mercer',
                  role: 'Direct Manager',
                  score: 88,
                  label: 'Strong alignment',
                  color: '#22C55E',
                  note: 'High overlap on execution and decision speed'
                },
                {
                  name: 'Sarah Chen',
                  role: 'Project Lead',
                  score: 61,
                  label: 'Watch for pace',
                  color: '#EAB308',
                  note: 'Marcus moves faster than her alignment style'
                },
                {
                  name: 'Tom Ricci',
                  role: 'Operations Director',
                  score: 79,
                  label: 'Compatible',
                  color: '#22C55E',
                  note: 'Shared ownership orientation'
                }
              ].map((person, i) => (
                <div key={i} style={{
                  marginBottom: 14,
                  paddingBottom: 14,
                  borderBottom: i < 2
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 5
                  }}>
                    <div>
                      <p style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        marginBottom: 1
                      }}>
                        {person.name}
                      </p>
                      <p style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.28)'
                      }}>
                        {person.role}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: person.color
                    }}>
                      {person.label}
                    </span>
                  </div>

                  <div style={{
                    height: 3,
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    marginBottom: 5
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${person.score}%`,
                      background: person.color,
                      borderRadius: 2,
                      opacity: 0.8
                    }} />
                  </div>

                  <p style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.28)',
                    lineHeight: 1.5
                  }}>
                    {person.note}
                  </p>
                </div>
              ))}
            </div>

            {/* COLUMN 3 — Decision Frame + Key Insight */}
            <div>
              <p style={{
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12
              }}>
                Decision Frame
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 14
              }}>
                {[
                  {
                    label: 'HIRE IF',
                    color: '#22C55E',
                    bg: 'rgba(34,197,94,0.05)',
                    text: 'Role requires independent execution and fast decisions.'
                  },
                  {
                    label: 'DO NOT HIRE IF',
                    color: '#EF4444',
                    bg: 'rgba(239,68,68,0.05)',
                    text: 'Success depends on consensus-first execution.'
                  }
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 12px',
                    background: row.bg,
                    borderBottom: i === 0
                      ? '1px solid rgba(255,255,255,0.06)'
                      : 'none'
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
                    <span style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.55)',
                      lineHeight: 1.55
                    }}>
                      {row.text}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.15)',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 14
              }}>
                <p style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: '#2563EB',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 6
                }}>
                  Key Insight
                </p>
                <p style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}>
                  &ldquo;Marcus scores 93 and aligns strongly with David.
                  One condition: set pace expectations with Sarah
                  before week one &mdash; not week six.&rdquo;
                </p>
              </div>

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8
              }}>
                Interview Probes
              </p>

              {[
                {
                  risk: 'Decision Speed',
                  q: 'Tell me about a time you committed before your team was aligned.'
                },
                {
                  risk: 'Collaboration',
                  q: 'Describe a time you had to slow down for stakeholder input.'
                }
              ].map((probe, i) => (
                <div key={i} style={{
                  marginBottom: 10,
                  paddingLeft: 8,
                  borderLeft: '2px solid rgba(37,99,235,0.3)'
                }}>
                  <p style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'rgba(37,99,235,0.6)',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: 3
                  }}>
                    {probe.risk}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.42)',
                    lineHeight: 1.55
                  }}>
                    {probe.q}
                  </p>
                </div>
              ))}

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.14)',
                marginTop: 14,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.05)'
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
