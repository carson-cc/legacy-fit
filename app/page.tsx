'use client'

import { useEffect, useState, useRef } from 'react'

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
      <section className="snap-beat-scroll" style={{ background: '#000' }}>
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
          maxWidth: 900,
          background: 'linear-gradient(160deg, #0F1825, #0A1018)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 60px 140px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}>
          <div style={{
            height: 1,
            background: 'rgba(37,99,235,0.4)'
          }} />

          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase'
            }}>
              Candidate Recommendation Report
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontWeight: 500, letterSpacing: '0.06em' }}>
              Presented to client
            </span>
          </div>

          <div style={{
            padding: 24,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24
          }} className="report-grid">

            {/* Left column */}
            <div>
              <p style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                marginBottom: 3
              }}>
                Marcus Thompson
              </p>
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 16
              }}>
                Superintendent · Chicago · Gilbane Construction
              </p>

              <div style={{
                padding: '16px 0 12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 72,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                    lineHeight: 1
                  }}>93</span>
                  <p style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#22C55E',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    paddingBottom: 6
                  }}>
                    Strong Hire
                  </p>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  High confidence · Top 12% · Role benchmark active
                </p>
              </div>

              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
                fontStyle: 'italic',
                lineHeight: 1.65,
                marginBottom: 12
              }}>
                Aligned with high-performing candidates in comparable field
                leadership roles. Decisive under pressure, built for
                environments where someone has to own the outcome.
              </p>

              {/* Decision Frame */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 7,
                padding: '12px 14px'
              }}>
                {[
                  {
                    label: 'HIRE IF',
                    color: '#22C55E',
                    text: 'The role requires independent execution and fast decisions without waiting for consensus.'
                  },
                  {
                    label: 'DO NOT HIRE IF',
                    color: '#EF4444',
                    text: 'Success depends on consensus-driven decisions or cross-functional alignment before action.'
                  }
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 10,
                    padding: '7px 8px',
                    borderRadius: 5,
                    marginBottom: i === 0 ? 4 : 0,
                    background: i === 0 ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)'
                  }}>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: row.color,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      width: 80,
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.6
                    }}>
                      {row.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div>
              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8
              }}>
                Benchmark Alignment
              </p>

              {[
                { label: 'EXECUTION',     value: 72, color: '#22C55E', warn: false },
                { label: 'OWNERSHIP',     value: 67, color: '#22C55E', warn: false },
                { label: 'ADAPTABILITY',  value: 65, color: '#22C55E', warn: false },
                { label: 'COLLABORATION', value: 49, color: '#EF4444', warn: true  },
                { label: 'DECISION SPEED',value: 85, color: '#22C55E', warn: false },
              ].map((dim, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4
                  }}>
                    <span style={{
                      fontSize: 9,
                      color: dim.warn ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.28)',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {dim.warn ? '⚠ ' : ''}{dim.label}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: dim.warn ? '#EF4444' : 'rgba(255,255,255,0.55)'
                    }}>
                      {dim.value}
                    </span>
                  </div>
                  <div style={{
                    height: 3,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${dim.value}%`,
                      background: dim.color,
                      borderRadius: 2,
                      opacity: dim.warn ? 0.6 : 0.8
                    }} />
                  </div>
                </div>
              ))}

              <p style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: '14px 0 8px'
              }}>
                Interview Probes
              </p>

              {[
                { dim: 'COLLABORATION', color: '#EF4444', text: 'Tell me about a time you committed to a direction before your team was aligned. What happened?' },
                { dim: 'COLLABORATION', color: '#EF4444', text: 'Describe a situation where you had to slow down for stakeholder input. How did you handle it?' }
              ].map((probe, i) => (
                <div key={i} style={{
                  marginBottom: 8,
                  paddingLeft: 10,
                  borderLeft: `2px solid ${probe.color}`,
                }}>
                  <p style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: probe.color,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                    opacity: 0.7
                  }}>
                    {probe.dim}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.42)',
                    lineHeight: 1.6
                  }}>
                    {probe.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
