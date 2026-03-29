'use client'

import { useEffect, useState, useRef } from 'react'
import { FitModel } from '@/app/components/FitModel'
import SignalTrace from '@/app/components/SignalTrace'

export default function MethodPage() {
  const [dataVisible, setDataVisible] = useState(false)
  const dataRef = useRef<HTMLDivElement>(null)
  const [signalTraceWidth, setSignalTraceWidth] = useState(600)
  const signalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dataRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDataVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = signalRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSignalTraceWidth(Math.min(600, entry.contentRect.width - 48))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{background: '#0B0F14', minHeight: '100vh'}}>

      {/* NAV */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '18px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(11,15,20,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <a href="/" style={{
          fontSize: 15, fontWeight: 700,
          color: '#fff', textDecoration: 'none',
          letterSpacing: '-0.01em'
        }}>
          Veltro
        </a>
        <div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
          {[
            {label: 'Sample Report', href: '/sample-report'},
            {label: 'Method', href: '/profiles'},
            {label: 'Sign in', href: '/login'}
          ].map(link => (
            <a key={link.label} href={link.href} style={{
              fontSize: 13,
              color: link.label === 'Method'
                ? '#FFFFFF'
                : 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              fontWeight: link.label === 'Method' ? 600 : 400
            }}>
              {link.label}
            </a>
          ))}
          <a href="/sample-report" style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '7px 14px', borderRadius: 6,
            textDecoration: 'none'
          }}>
            See the report →
          </a>
        </div>
      </nav>

      {/* =============================================
          SECTION 1 — HERO
          Two-column. Copy left. FitModel right.
      ============================================= */}
      <section style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 520px',
        gap: 60,
        alignItems: 'center',
        padding: '120px 48px 80px',
        maxWidth: 1200,
        margin: '0 auto'
      }} className="hero-grid">

        {/* Left */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 16
          }}>
            Method
          </p>
          <h1 style={{
            fontSize: 'clamp(36px,5vw,56px)',
            fontWeight: 800, color: '#FFFFFF',
            letterSpacing: '-0.03em', lineHeight: 1.05,
            marginBottom: 20
          }}>
            Why the recommendation<br />holds up.
          </h1>
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.75, marginBottom: 12, maxWidth: 440
          }}>
            The score isn&apos;t a personality label.
            It&apos;s a distance from a role-specific benchmark.
          </p>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.22)',
            marginBottom: 36
          }}>
            Model v2.0 · Calibrated Mar 2026 · 2,245,096 respondents
          </p>

          <div style={{display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap'}}>
            <a href="/sample-report" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#FFFFFF', color: '#000',
              fontSize: 14, fontWeight: 700,
              padding: '12px 24px', borderRadius: 8,
              textDecoration: 'none'
            }}>
              See a full recommendation
            </a>
            <a href="#score-build" style={{
              fontSize: 14, color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none'
            }}>
              See how it works ↓
            </a>
          </div>
        </div>

        {/* Right — FitModel card */}
        <div style={{
          background: '#0D1421',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: 9, fontWeight: 600,
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>
              Role Benchmark
            </span>
            <div style={{display: 'flex', gap: 5}}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === 0
                    ? '#2563EB'
                    : 'rgba(255,255,255,0.12)'
                }}/>
              ))}
            </div>
          </div>

          <div style={{padding: '24px 24px 12px', display: 'flex', justifyContent: 'center'}}>
            <FitModel
              scores={{
                dominance: 0.72,
                extraversion: 0.52,
                patience: 0.50,
                formality: 0.66
              }}
              size={260}
              variant="dark"
              animated={true}
            />
          </div>

          <div style={{padding: '0 20px 20px'}}>
            {[
              {name: 'Execution',     val: 'benchmark'},
              {name: 'Ownership',     val: 'benchmark'},
              {name: 'Adaptability',  val: 'benchmark'},
              {name: 'Collaboration', val: 'benchmark'},
              {name: 'Decision Speed',val: 'benchmark'}
            ].map((dim, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < 4
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none'
              }}>
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.65)'
                }}>
                  {dim.name}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: '#2563EB', letterSpacing: '0.04em'
                }}>
                  {dim.val}
                </span>
              </div>
            ))}
            <p style={{
              fontSize: 10, color: 'rgba(255,255,255,0.18)',
              marginTop: 14, textAlign: 'center'
            }}>
              Scroll to see the candidate signal emerge against the benchmark
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 2 — HOW THE SCORE IS BUILT
          Visual equation: 80 → 94 → 5 → 1
      ============================================= */}
      <section id="score-build" style={{
        minHeight: '90vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center',
        padding: '80px 48px',
        maxWidth: 1100,
        margin: '0 auto',
        background: '#000'
      }} className="score-build-grid">

        {/* Left — visual equation */}
        <div>
          {[
            {
              num: '80',
              label: 'Adjective choices',
              sub: 'Two structured word lists. Six minutes.',
              color: 'rgba(255,255,255,0.45)',
              arrow: false
            },
            {num: null, label: null, sub: null, color: null, arrow: true},
            {
              num: '94',
              label: 'Behavioral signals',
              sub: 'Including adaptation gap between the two lists.',
              color: 'rgba(255,255,255,0.62)',
              arrow: false
            },
            {num: null, label: null, sub: null, color: null, arrow: true},
            {
              num: '5',
              label: 'Dimensions scored',
              sub: 'Mapped to role-relevant behavioral factors.',
              color: 'rgba(255,255,255,0.78)',
              arrow: false
            },
            {num: null, label: null, sub: null, color: null, arrow: true},
            {
              num: '1',
              label: 'Fit score vs benchmark',
              sub: 'A precise distance from the target. Not a type.',
              color: '#FFFFFF',
              arrow: false
            }
          ].map((item, i) => {
            if (item.arrow) return (
              <div key={i} style={{
                fontSize: 20,
                color: 'rgba(37,99,235,0.45)',
                padding: '3px 0 3px 8px'
              }}>
                →
              </div>
            )
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                padding: '14px 0',
                borderBottom: i < 6
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none'
              }}>
                <span style={{
                  fontSize: 'clamp(44px,5.5vw,64px)',
                  fontWeight: 900,
                  color: item.color!,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  minWidth: 80,
                  flexShrink: 0
                }}>
                  {item.num}
                </span>
                <div>
                  <p style={{
                    fontSize: 15, fontWeight: 600,
                    color: item.color!, marginBottom: 3
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.25)',
                    lineHeight: 1.5
                  }}>
                    {item.sub}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right — explanation */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 16
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 700, color: '#FFFFFF',
            letterSpacing: '-0.02em', marginBottom: 24
          }}>
            Two word lists.<br />One number<br />that means something.
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.8, marginBottom: 16
          }}>
            The candidate completes two structured word lists
            in six minutes. List one describes how they work
            in a role context. List two describes how they
            naturally operate.
          </p>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.8, marginBottom: 16
          }}>
            The gap between the two lists is the adaptation
            signal — where someone performs differently from
            their natural style. That gap matters under pressure.
          </p>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.8
          }}>
            94 signals map across five dimensions and are
            scored against the active role benchmark.
            The result is a fit score — a precise distance
            from the target, not a personality type.
          </p>
        </div>
      </section>

      {/* =============================================
          SECTION 3 — SIGNAL TRACE
          The structured output visualization
      ============================================= */}
      <section ref={signalRef} style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 48px',
        background: '#0D1117'
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          width: '100%'
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12, textAlign: 'center'
          }}>
            Signal Pattern
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 700, color: '#FFFFFF',
            letterSpacing: '-0.02em', marginBottom: 10,
            textAlign: 'center'
          }}>
            94 signals. One score.
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.65, marginBottom: 48,
            textAlign: 'center', maxWidth: 480,
            margin: '0 auto 48px'
          }}>
            Every candidate produces the same structured output.
            Green is above benchmark. Red is below.
            Each lane is one dimension.
          </p>

          <SignalTrace
            candidateScores={{
              dominance: 0.72,
              extraversion: 0.52,
              patience: 0.50,
              formality: 0.66
            }}
            width={signalTraceWidth}
          />
        </div>
      </section>

      {/* =============================================
          SECTION 4 — FIVE DIMENSIONS
          What the model actually measures
      ============================================= */}
      <section style={{
        minHeight: '80vh',
        padding: '80px 48px',
        background: '#000'
      }}>
        <div style={{maxWidth: 960, margin: '0 auto'}}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12
          }}>
            Five Dimensions
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 700, color: '#FFFFFF',
            letterSpacing: '-0.02em', marginBottom: 12
          }}>
            Each one role-relevant.
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.4)',
            marginBottom: 48, maxWidth: 480, lineHeight: 1.65
          }}>
            Not general personality traits. The five dimensions
            most predictive of performance variation across
            the roles recruiting firms actually place.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 56px'
          }} className="dimensions-grid">
            {[
              {
                name: 'Execution',
                desc: 'Ability to drive forward progress, resolve blockers, and maintain team momentum under pressure.'
              },
              {
                name: 'Ownership',
                desc: 'Tendency to assume responsibility, act without excessive escalation, and carry outcomes all the way through.'
              },
              {
                name: 'Adaptability',
                desc: 'Capacity to adjust pace, judgment, and operating style as context shifts.'
              },
              {
                name: 'Collaboration',
                desc: 'Ability to align others, work through stakeholders, and maintain coordination without losing clarity.'
              },
              {
                name: 'Decision Speed',
                desc: 'Comfort making calls with imperfect information while preserving sound judgment.'
              }
            ].map((dim, i) => (
              <div key={i} style={{
                paddingLeft: 18,
                borderLeft: '2px solid rgba(37,99,235,0.4)',
                paddingBottom: 28,
                marginBottom: 28,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{
                  fontSize: 16, fontWeight: 700,
                  color: '#FFFFFF', marginBottom: 6
                }}>
                  {dim.name}
                </p>
                <p style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.65
                }}>
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 5 — WHERE IT FITS IN THE SEARCH
          Timeline + three steps
      ============================================= */}
      <section style={{
        minHeight: '80vh',
        padding: '80px 48px',
        background: '#0D1117'
      }}>
        <div style={{maxWidth: 960, margin: '0 auto'}}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12
          }}>
            The Search Process
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 700, color: '#FFFFFF',
            letterSpacing: '-0.02em', marginBottom: 12
          }}>
            Where Veltro fits.
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.4)',
            marginBottom: 64, maxWidth: 480, lineHeight: 1.65
          }}>
            One step at shortlist. No change to how you run
            the search. Everything changes in the client meeting.
          </p>

          {/* Timeline */}
          <div style={{position: 'relative', marginBottom: 64}}>
            {/* Base line */}
            <div style={{
              position: 'absolute', top: 19,
              left: '12.5%', right: '12.5%',
              height: 1,
              background: 'rgba(255,255,255,0.08)'
            }}/>
            {/* Active segment Sourcing → Client Meeting */}
            <div style={{
              position: 'absolute', top: 19,
              left: '37.5%', width: '50%',
              height: 1, background: '#2563EB',
              boxShadow: '0 0 8px rgba(37,99,235,0.4)'
            }}/>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              position: 'relative'
            }}>
              {[
                {label: 'Kickoff',        active: false, veltro: false},
                {label: 'Sourcing',       active: false, veltro: false},
                {label: 'Shortlist',      active: true,  veltro: true },
                {label: 'Client Meeting', active: true,  veltro: false}
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <div style={{
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: step.active
                      ? '#2563EB'
                      : 'rgba(255,255,255,0.12)',
                    boxShadow: step.active
                      ? '0 0 12px rgba(37,99,235,0.5)'
                      : 'none',
                    flexShrink: 0,
                    zIndex: 1,
                    position: 'relative'
                  }}/>
                  <p style={{
                    fontSize: 12,
                    color: step.active
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.28)',
                    fontWeight: step.active ? 600 : 400,
                    textAlign: 'center'
                  }}>
                    {step.label}
                  </p>
                  {step.veltro && (
                    <div style={{
                      background: 'rgba(37,99,235,0.12)',
                      border: '1px solid rgba(37,99,235,0.3)',
                      borderRadius: 5,
                      padding: '3px 8px',
                      fontSize: 9, fontWeight: 600,
                      color: '#2563EB',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}>
                      Veltro activates
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Three steps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 36
          }} className="process-steps-grid">
            {[
              {
                num: '01',
                stage: 'At shortlist',
                headline: 'Send the candidate a link.',
                copy: 'Six minutes. No login. Any device. Automatic on submission.'
              },
              {
                num: '02',
                stage: 'Before the meeting',
                headline: 'Get the scored result.',
                copy: 'Fit score, benchmark comparison, confidence level, strengths and risks.'
              },
              {
                num: '03',
                stage: 'In the meeting',
                headline: 'Open the report.',
                copy: 'Score, fit, risks, interview probes. The meeting ends in a decision.'
              }
            ].map(step => (
              <div key={step.num}>
                <div style={{
                  display: 'flex', gap: 10,
                  alignItems: 'center', marginBottom: 10
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: '#2563EB', letterSpacing: '0.08em'
                  }}>
                    {step.num}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    {step.stage}
                  </span>
                </div>
                <p style={{
                  fontSize: 15, fontWeight: 600,
                  color: '#FFFFFF', marginBottom: 6,
                  letterSpacing: '-0.01em'
                }}>
                  {step.headline}
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.65
                }}>
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 6 — DATASET ADDITION VISUAL + CLOSE
          Numbers stack up to 2,245,096
      ============================================= */}
      <section style={{
        minHeight: '90vh',
        padding: '80px 48px 100px',
        background: '#000'
      }}>
        <div style={{maxWidth: 800, margin: '0 auto'}}>

          {/* Addition visual */}
          <div ref={dataRef}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: '#2563EB',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 12
            }}>
              The Dataset
            </p>
            <h2 style={{
              fontSize: 'clamp(26px,3.5vw,38px)',
              fontWeight: 700, color: '#FFFFFF',
              letterSpacing: '-0.02em', marginBottom: 40
            }}>
              Built on real behavioral data.<br />Not a black box.
            </h2>

            <div style={{maxWidth: 560, marginBottom: 56}}>
              {[
                {n: '307,313',  label: 'General population norm dataset'},
                {n: '922,541',  label: 'Five-factor model validation dataset'},
                {n: '49,159',   label: 'Occupational norm dataset'},
                {n: '658,770',  label: 'Cross-validation cohort (4 studies)'},
                {n: '307,313',  label: 'Additional validation cohort'},
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  opacity: dataVisible ? 1 : 0,
                  transform: dataVisible
                    ? 'translateX(0)'
                    : 'translateX(-16px)',
                  transition: `opacity 320ms ease-out ${i * 120}ms,
                               transform 320ms ease-out ${i * 120}ms`
                }}>
                  <span style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.35)',
                    maxWidth: 380, lineHeight: 1.5
                  }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontSize: 16, fontWeight: 600,
                    color: 'rgba(255,255,255,0.55)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                    flexShrink: 0, marginLeft: 16
                  }}>
                    {row.n}
                  </span>
                </div>
              ))}

              {/* Total — arrives last */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderTop: '2px solid rgba(37,99,235,0.4)',
                marginTop: 4,
                opacity: dataVisible ? 1 : 0,
                transition: 'opacity 400ms ease-out 700ms'
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: '#FFFFFF'
                }}>
                  Total respondents
                </span>
                <span style={{
                  fontSize: 'clamp(28px,4vw,44px)',
                  fontWeight: 900, color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  2,245,096
                </span>
              </div>

              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.25)',
                lineHeight: 1.65, marginTop: 14,
                fontStyle: 'italic',
                opacity: dataVisible ? 1 : 0,
                transition: 'opacity 300ms ease-out 900ms'
              }}>
                General adult population norms — not job applicants,
                not proprietary samples.
              </p>
            </div>

            {/* Three supporting stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 32, marginBottom: 72,
              paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }} className="data-stats-grid">
              {[
                {val: '94',    label: 'Signals per evaluation'},
                {val: '8',     label: 'Peer-reviewed studies'},
                {val: '6 min', label: 'Per candidate'}
              ].map((stat, i) => (
                <div key={i}>
                  <p style={{
                    fontSize: 'clamp(28px,3.5vw,40px)',
                    fontWeight: 800, color: 'rgba(255,255,255,0.7)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1, marginBottom: 8
                  }}>
                    {stat.val}
                  </p>
                  <p style={{fontSize: 12, color: 'rgba(255,255,255,0.3)'}}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'rgba(255,255,255,0.07)',
            marginBottom: 64
          }}/>

          {/* Close */}
          <div style={{textAlign: 'center', maxWidth: 480, margin: '0 auto'}}>
            <p style={{
              fontSize: 'clamp(22px,3vw,30px)',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.88)',
              letterSpacing: '-0.02em',
              lineHeight: 1.4, marginBottom: 12
            }}>
              This doesn&apos;t replace your judgment.<br />
              It structures it.
            </p>
            <p style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 36
            }}>
              You still decide. This shows your client why.
            </p>
            <a href="/sample-report" style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#FFFFFF', color: '#000000',
              fontSize: 15, fontWeight: 700,
              padding: '13px 28px', borderRadius: 8,
              textDecoration: 'none'
            }}>
              See the full report →
            </a>
          </div>

        </div>
      </section>

    </div>
  )
}
