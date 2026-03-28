'use client'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [navLight, setNavLight] = useState(false)

  useEffect(() => {
    const lightBeats = document.querySelectorAll(
      '#beat-light-start, #beat-light-end'
    )
    const obs = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some(e => e.isIntersecting)
        setNavLight(anyVisible)
      },
      { threshold: 0.1 }
    )
    lightBeats.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ── FIXED NAV ─────────────────────────────────────────── */}
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
        WebkitBackdropFilter: navLight ? 'blur(12px)' : 'none',
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

        <div className="nav-links-desktop" style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center'
        }}>
          <a href="/sample-report" style={{
            fontSize: 13,
            color: navLight
              ? 'rgba(0,0,0,0.4)'
              : 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            transition: 'color 300ms ease'
          }}>
            Sample Report
          </a>
          <a href="/profiles" style={{
            fontSize: 13,
            color: navLight
              ? 'rgba(0,0,0,0.4)'
              : 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            transition: 'color 300ms ease'
          }}>
            Method
          </a>
          <a href="/login" style={{
            fontSize: 13,
            color: navLight
              ? 'rgba(0,0,0,0.4)'
              : 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            transition: 'color 300ms ease'
          }}>
            Sign in
          </a>
        </div>

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
      </nav>

      {/* ── BEAT 1 — The Recognition ──────────────────────────── */}
      <section className="beat" style={{ background: '#000' }}>
        <p style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.88)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          textAlign: 'center',
          maxWidth: 620
        }}>
          You already know<br />
          who&apos;s right for the role.
        </p>

        {/* Scroll indicator */}
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
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)'
          }} />
          <span style={{
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)'
          }}>Scroll</span>
        </div>
      </section>

      {/* ── BEAT 2 — The Shift ────────────────────────────────── */}
      <section className="beat" style={{ background: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 18
          }}>
            You already know<br />
            who&apos;s right for the role.
          </p>
          <p style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Now show your client why.
          </p>
        </div>
      </section>

      {/* ── BEAT 3 — The Object ───────────────────────────────── */}
      <section className="beat" style={{ background: '#000', gap: 24 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase'
        }}>
          What your client sees
        </p>

        <div style={{
          width: '100%',
          maxWidth: 640,
          background: '#0D1421',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 14,
          overflow: 'hidden'
        }}>
          {/* Top gradient bar */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, #2563EB, #22C55E)'
          }} />

          {/* Report header */}
          <div style={{
            padding: '14px 22px',
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
              fontSize: 11,
              color: '#2563EB',
              fontWeight: 500
            }}>
              Share report →
            </span>
          </div>

          {/* Report body — two columns desktop, single mobile */}
          <div
            className="report-body-grid"
            style={{
              padding: 22,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20
            }}
          >
            {/* Left column */}
            <div>
              <p style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                marginBottom: 2
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

              {/* Verdict row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 0',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 12
              }}>
                <span style={{
                  fontSize: 38,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1
                }}>93</span>
                <div>
                  <p style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#22C55E',
                    letterSpacing: '-0.02em',
                    marginBottom: 3
                  }}>
                    Strong Hire
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    High confidence · Top 12% · Role benchmark active
                  </p>
                </div>
              </div>

              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
                fontStyle: 'italic',
                lineHeight: 1.65,
                marginBottom: 12
              }}>
                Aligned with high-performing candidates in comparable
                field leadership roles. Decisive under pressure, built
                for environments where someone has to own the outcome.
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
                    padding: '5px 0',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: row.color,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      width: 76,
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
                { label: 'EXECUTION',      value: 72, delta: '+8',  color: '#22C55E', warn: false },
                { label: 'OWNERSHIP',      value: 67, delta: '+1',  color: '#22C55E', warn: false },
                { label: 'ADAPTABILITY',   value: 65, delta: '+15', color: '#22C55E', warn: false },
                { label: 'COLLABORATION',  value: 49, delta: '−3',  color: '#EF4444', warn: true  },
                { label: 'DECISION SPEED', value: 85, delta: '+21', color: '#22C55E', warn: false },
              ].map((dim, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  <span style={{
                    fontSize: 10,
                    color: dim.warn
                      ? 'rgba(239,68,68,0.6)'
                      : 'rgba(255,255,255,0.28)',
                    letterSpacing: '0.06em',
                    fontWeight: 600
                  }}>
                    {dim.warn ? '⚠ ' : ''}{dim.label}
                  </span>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      {dim.value}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: dim.color
                    }}>
                      {dim.delta}
                    </span>
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
                'Tell me about a time you committed to a direction before your team was aligned. What happened?',
                'Describe a situation where you had to slow down for stakeholder input. How did you handle it?'
              ].map((probe, i) => (
                <p key={i} style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.42)',
                  lineHeight: 1.6,
                  marginBottom: 6,
                  paddingLeft: 8,
                  borderLeft: '2px solid rgba(37,99,235,0.3)'
                }}>
                  {probe}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BEAT 4 — The Consequence ──────────────────────────── */}
      <section className="beat" style={{ background: '#000' }}>
        <p style={{
          fontSize: 'clamp(22px, 3.5vw, 32px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '-0.02em',
          fontStyle: 'italic',
          maxWidth: 560,
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          <strong style={{
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 600,
            fontStyle: 'normal'
          }}>
            So you don&apos;t hear
          </strong>
          <br />
          &ldquo;let&apos;s see more candidates.&rdquo;
        </p>
      </section>

      {/* ── BEAT 5 — The Break ────────────────────────────────── */}
      <section className="beat" id="beat-light-start" style={{ background: '#F5F5F0' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 600,
            color: 'rgba(0,0,0,0.25)',
            letterSpacing: '-0.03em',
            marginBottom: 14
          }}>
            This isn&apos;t an assessment.
          </p>
          <p style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.03em'
          }}>
            It&apos;s how you make the call.
          </p>
        </div>
      </section>

      {/* ── BEAT 6 — The Moment ───────────────────────────────── */}
      <section
        className="beat"
        id="beat-light-end"
        style={{
          background: '#F5F5F0',
          alignItems: 'flex-start',
          padding: '80px 15%',
          textAlign: 'left'
        }}
      >
        <div style={{ maxWidth: 640 }}>
          {[
            { text: 'Eight weeks in. Your candidate is right for the role.', muted: false, strong: false },
            { text: 'The client met someone internally.',                    muted: false, strong: false },
            { text: "Now they're not sure.",                                  muted: false, strong: false },
            { text: 'SPACER',                                                 muted: false, strong: false },
            { text: 'This is where most searches break.',                    muted: true,  strong: false },
            { text: 'Not because the candidate is wrong.',                   muted: true,  strong: false },
            { text: "Because the case isn't clear.",                          muted: true,  strong: false },
            { text: 'SPACER',                                                 muted: false, strong: false },
            { text: 'This is what Veltro is for.',                          muted: false, strong: true  },
          ].map((line, i) => {
            if (line.text === 'SPACER') return <div key={i} style={{ height: 28 }} />
            return (
              <p key={i} style={{
                fontSize: 'clamp(17px, 2.2vw, 22px)',
                color: line.strong
                  ? '#000000'
                  : line.muted
                    ? 'rgba(0,0,0,0.35)'
                    : 'rgba(0,0,0,0.7)',
                fontWeight: line.strong ? 700 : 400,
                lineHeight: 1.85,
                letterSpacing: '-0.01em'
              }}>
                {line.text}
              </p>
            )
          })}
        </div>
      </section>

      {/* ── BEAT 7 — The Contrast ─────────────────────────────── */}
      <section className="beat" style={{ background: '#000' }}>
        <div
          className="contrast-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 12,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 700
          }}
        >
          {/* Left — what they hear today */}
          <div style={{ background: '#0A0A0A', padding: 28 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20
            }}>
              What they hear today
            </p>
            {[
              '\u201cStrong background for the role.\u201d',
              '\u201cGood operating fit, we think.\u201d',
              '\u201cWe\u2019re confident in this one.\u201d',
              '\u201cWe think he can do the job.\u201d'
            ].map((q, i) => (
              <p key={i} style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.28)',
                fontStyle: 'italic',
                lineHeight: 1.7,
                marginBottom: 6
              }}>
                {q}
              </p>
            ))}
            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.16)',
              fontStyle: 'italic',
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              Sounds fine. Doesn&apos;t hold up when the client gets nervous.
            </p>
          </div>

          {/* Right — what they see with Veltro */}
          <div style={{
            background: '#0D1421',
            padding: 28,
            borderLeft: '1px solid rgba(37,99,235,0.2)'
          }}>
            <p style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#2563EB',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20
            }}>
              What they see with Veltro
            </p>
            {[
              {
                title: '93 \u2014 Strong Hire',
                sub: 'Top performers score 85+. Marcus is at 93.'
              },
              {
                title: 'Compatible with the team',
                sub: 'High overlap on collaboration. One friction point \u2014 addressable in onboarding.'
              },
              {
                title: '3 interview probes, ready',
                sub: 'Targeted questions tied to specific risks.'
              }
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <p style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: 3
                }}>
                  {item.title}
                </p>
                <p style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.55
                }}>
                  {item.sub}
                </p>
              </div>
            ))}
            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              fontStyle: 'italic',
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              The resume got you to this meeting.<br />
              This gets you out of it with a yes.
            </p>
          </div>
        </div>
      </section>

      {/* ── BEAT 8 — The Simplicity ───────────────────────────── */}
      <section className="beat" style={{ background: '#000', gap: 28 }}>
        <p style={{
          fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          textAlign: 'center'
        }}>
          It fits inside your search.
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 500,
          textAlign: 'center'
        }}>
          {[
            { strong: 'Send the candidate a link.', rest: ' Six minutes. No login.' },
            { strong: 'Get the scored result.',     rest: ' Automatically.' },
            { strong: 'Open it in the meeting.',    rest: ' The room decides.' }
          ].map((step, i) => (
            <p key={i} style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.6
            }}>
              <strong style={{
                color: 'rgba(255,255,255,0.82)',
                fontWeight: 500
              }}>
                {step.strong}
              </strong>
              {step.rest}
            </p>
          ))}
        </div>
      </section>

      {/* ── BEAT 9 — The Depth ────────────────────────────────── */}
      <section className="beat" style={{ background: '#000', gap: 16 }}>
        <p style={{
          fontSize: 'clamp(20px, 2.8vw, 26px)',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.78)',
          letterSpacing: '-0.02em',
          maxWidth: 540,
          lineHeight: 1.5,
          textAlign: 'center',
          marginBottom: 8
        }}>
          Add the people they&apos;ll work with.
          <br />
          Every report shows who they fit &mdash;
          <br />
          and where friction may show up.
        </p>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.3)',
          maxWidth: 440,
          lineHeight: 1.65,
          textAlign: 'center'
        }}>
          Capture the hiring manager once.
          Active on every candidate for that client, forever.
        </p>
      </section>

      {/* ── BEAT 10 — The Proof ───────────────────────────────── */}
      <section className="beat" style={{ background: '#000', gap: 24 }}>
        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.3)',
          fontStyle: 'italic'
        }}>
          Built on real behavioral data.
        </p>
        <div style={{
          display: 'flex',
          gap: 'clamp(24px, 5vw, 64px)',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { val: '2.2M',  label: 'People in the dataset' },
            { val: '94',    label: 'Signals per candidate' },
            { val: '5',     label: 'Dimensions scored' },
            { val: '6 min', label: 'Per evaluation' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.04em',
                lineHeight: 1
              }}>
                {stat.val}
              </p>
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
                marginTop: 6
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEAT 11 — The CTA ─────────────────────────────────── */}
      <section className="beat" style={{ background: '#000', gap: 16 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase'
        }}>
          The deliverable
        </p>
        <p style={{
          fontSize: 'clamp(24px, 3.5vw, 34px)',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: 8
        }}>
          The report your client sees.
        </p>
        <a
          href="/sample-report"
          style={{
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
            marginBottom: 12
          }}
        >
          Open sample report →
        </a>
        <p style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.22)'
        }}>
          Used in real client meetings to make the final call.
        </p>
      </section>

      {/* ── BEAT 12 — The Close ───────────────────────────────── */}
      <section className="beat" style={{ background: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 14
          }}>
            You already know.
          </p>
          <p style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Now show them.
          </p>
        </div>
      </section>
    </>
  )
}
