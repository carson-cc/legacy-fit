'use client'

import { useEffect, useRef, useState } from 'react'
import { FitModel } from '@/app/components/FitModel'
import type { FitModelScores } from '@/app/components/FitModel'
import SignalTrace from '@/app/components/SignalTrace'

// Raw FitModelScores that produce meaningfully distinct pentagon shapes.
// deriveAxes: execution = dom*0.58 + form*0.42, ownership = dom*0.72 + pat*0.28,
// adaptability = ext*0.22 + (1-form)*0.58 + (1-pat)*0.20,
// collaboration = ext*0.68 + pat*0.32, decisionSpeed = dom*0.54 + (1-pat)*0.46
const PROFILES: {
  name: string
  role: string
  score: number
  verdict: string
  verdictColor: string
  archetype: string
  scores: FitModelScores
}[] = [
  {
    name: 'Marcus Thompson',
    role: 'Superintendent · Gilbane Construction',
    score: 93,
    verdict: 'Strong Hire',
    verdictColor: '#22C55E',
    archetype: 'Pioneer',
    // exec≈0.83, own≈0.69, adapt≈0.37, collab≈0.27, dec≈0.84
    scores: { dominance: 0.88, extraversion: 0.30, patience: 0.20, formality: 0.75 }
  },
  {
    name: 'Elena Vasquez',
    role: 'VP of Sales · Meridian Capital',
    score: 87,
    verdict: 'Strong Hire',
    verdictColor: '#22C55E',
    archetype: 'Diplomat',
    // exec≈0.46, own≈0.51, adapt≈0.47, collab≈0.83, dec≈0.31
    scores: { dominance: 0.40, extraversion: 0.85, patience: 0.78, formality: 0.55 }
  },
  {
    name: 'James Whitfield',
    role: 'CFO · Portco Holdings',
    score: 78,
    verdict: 'Proceed with Caution',
    verdictColor: '#EAB308',
    archetype: 'Operator',
    // exec≈0.48, own≈0.68, adapt≈0.55, collab≈0.57, dec≈0.42
    scores: { dominance: 0.62, extraversion: 0.45, patience: 0.82, formality: 0.28 }
  },
  {
    name: 'Sarah Okonkwo',
    role: 'Director of Operations · Apex Group',
    score: 91,
    verdict: 'Strong Hire',
    verdictColor: '#22C55E',
    archetype: 'Anchor',
    // exec≈0.30, own≈0.40, adapt≈0.63, collab≈0.77, dec≈0.28
    scores: { dominance: 0.28, extraversion: 0.80, patience: 0.72, formality: 0.32 }
  }
]

// Benchmark — same across all rotations, shown as dashed muted outline.
// exec≈0.70, own≈0.66, adapt≈0.41, collab≈0.51, dec≈0.62
const BENCHMARK: FitModelScores = {
  dominance: 0.72, extraversion: 0.52, patience: 0.50, formality: 0.66
}

export default function MethodPage() {
  const [activeProfile, setActiveProfile] = useState(0)
  const [fading, setFading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setActiveProfile(prev => (prev + 1) % PROFILES.length)
        setFading(false)
      }, 300)
    }, 3500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const profile = PROFILES[activeProfile]

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
              color: link.label === 'Method' ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              fontWeight: link.label === 'Method' ? 600 : 400,
              textDecoration: 'none'
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
          Two column. Copy left. Rotating profile card right.
          Pentagon shows candidate shape vs fixed benchmark outline.
      ============================================= */}
      <section className="hero-grid snap-beat" style={{
        background: '#0B0F14',
        display: 'grid',
        gridTemplateColumns: '1fr 480px',
        gap: 60,
        alignItems: 'center',
        padding: '0 48px',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto'
      }}>

        {/* Left — copy */}
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
            <span style={{
              fontSize: 14, color: 'rgba(255,255,255,0.35)'
            }}>
              Scroll to see how it works ↓
            </span>
          </div>
        </div>

        {/* Right — rotating profile card */}
        <div style={{
          background: 'linear-gradient(160deg,#0F1825 0%,#0A1018 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.05)',
            '0 40px 80px rgba(0,0,0,0.7)',
            '0 0 80px rgba(37,99,235,0.07)'
          ].join(',')
        }}>
          {/* Blue accent line at top */}
          <div style={{height: 1, background: 'rgba(37,99,235,0.4)'}}/>

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
            <span style={{
              fontSize: 9, fontWeight: 600,
              color: 'rgba(255,255,255,0.18)',
              letterSpacing: '0.06em'
            }}>
              Field Leadership
            </span>
          </div>

          {/* Pentagon with ambient glow */}
          <div style={{
            padding: '24px 24px 12px',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 240, height: 240,
              borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(37,99,235,0.14) 0%,transparent 70%)',
              pointerEvents: 'none'
            }}/>
            <div style={{
              opacity: fading ? 0 : 1,
              transition: 'opacity 300ms ease',
              position: 'relative',
              zIndex: 1
            }}>
              <FitModel
                scores={profile.scores}
                benchmarkScores={BENCHMARK}
                size={220}
                variant="dark"
                animated={false}
              />
            </div>
          </div>

          {/* Candidate identity */}
          <div style={{
            padding: '0 20px 16px',
            opacity: fading ? 0 : 1,
            transition: 'opacity 300ms ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 8
            }}>
              <div>
                <p style={{
                  fontSize: 14, fontWeight: 700,
                  color: '#FFFFFF', marginBottom: 2
                }}>
                  {profile.name}
                </p>
                <p style={{fontSize: 11, color: 'rgba(255,255,255,0.35)'}}>
                  {profile.role}
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={{
                  fontSize: 28, fontWeight: 900,
                  color: '#FFFFFF', letterSpacing: '-0.03em',
                  lineHeight: 1, marginBottom: 2
                }}>
                  {profile.score}
                </p>
                <p style={{
                  fontSize: 11, fontWeight: 600,
                  color: profile.verdictColor
                }}>
                  {profile.verdict}
                </p>
              </div>
            </div>
            <span style={{fontSize: 10, color: 'rgba(255,255,255,0.22)'}}>
              {profile.archetype} · Field Leadership Benchmark
            </span>
          </div>

          {/* Dot indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            padding: '0 0 16px'
          }}>
            {PROFILES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current)
                  setFading(true)
                  setTimeout(() => {
                    setActiveProfile(i)
                    setFading(false)
                  }, 300)
                }}
                style={{
                  width: i === activeProfile ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === activeProfile
                    ? '#2563EB'
                    : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 300ms ease'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 2 — HOW THE SCORE IS BUILT
          80 → 94 → 5 → 1. Two column.
      ============================================= */}
      <section className="score-build-grid snap-beat" style={{
        background: '#000',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center',
        padding: '0 48px',
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto'
      }}>

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
                padding: '2px 0 2px 8px'
              }}>→</div>
            )
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                padding: '12px 0',
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
            their natural style. That gap surfaces under pressure.
          </p>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.8
          }}>
            94 signals map across five dimensions and score
            against the active role benchmark. The result is
            a fit score — a precise distance from the target.
          </p>
        </div>
      </section>

      {/* =============================================
          SECTION 3 — TEAM SIGNAL
          Can they perform in this environment?
          Copy left. Signal trace + team compatibility right.
      ============================================= */}
      <section className="snap-beat" style={{
        background: '#0D1117',
        padding: '0 48px',
        width: '100%'
      }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center'
        }} className="signal-grid">

          {/* Left — copy */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 600, color: '#2563EB',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 16
            }}>
              Team Signal
            </p>
            <h2 style={{
              fontSize: 'clamp(26px,3.5vw,38px)',
              fontWeight: 700, color: '#FFFFFF',
              letterSpacing: '-0.02em', marginBottom: 20
            }}>
              Can they perform<br />in this environment?
            </h2>
            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.8, marginBottom: 16
            }}>
              The role benchmark answers whether the candidate
              can do the job. The team layer answers whether
              they&apos;ll do it here — with this manager,
              these peers, in this environment.
            </p>
            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.8, marginBottom: 24
            }}>
              Profile the hiring manager and key stakeholders
              once per client. Every candidate is automatically
              scored against every stored profile — showing
              where alignment is strong and where friction emerges.
            </p>
            {[
              'Hiring manager profiled once. Active on every future candidate.',
              'Peer and board member profiles stack automatically.',
              'Friction surfaces before onboarding, not after.'
            ].map((point, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                marginBottom: 10
              }}>
                <div style={{
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: '#2563EB',
                  flexShrink: 0,
                  marginTop: 7
                }}/>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.6
                }}>
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* Right — signal trace card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '20px 20px 16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <span style={{
                fontSize: 9, fontWeight: 600,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>
                Signal Pattern vs. Benchmark
              </span>
              <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                <div style={{display: 'flex', gap: 5, alignItems: 'center'}}>
                  <div style={{width: 16, height: 2, background: '#22C55E', borderRadius: 1}}/>
                  <span style={{fontSize: 9, color: 'rgba(255,255,255,0.3)'}}>Candidate</span>
                </div>
                <div style={{display: 'flex', gap: 5, alignItems: 'center'}}>
                  <div style={{
                    width: 16, height: 2,
                    background: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.4) 0px,rgba(255,255,255,0.4) 4px,transparent 4px,transparent 8px)',
                    borderRadius: 1
                  }}/>
                  <span style={{fontSize: 9, color: 'rgba(255,255,255,0.3)'}}>Benchmark</span>
                </div>
              </div>
            </div>

            <SignalTrace
              candidateScores={PROFILES[0].scores}
              benchmarkScores={BENCHMARK}
              width={340}
              variant="dark"
              animated={true}
            />

            {/* Team compatibility strip */}
            <div style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <p style={{
                fontSize: 9, fontWeight: 600,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 10
              }}>
                Team Compatibility
              </p>
              {[
                {name: 'David Mercer', role: 'Hiring Manager', pct: 88, color: '#22C55E'},
                {name: 'Sarah Chen',   role: 'Project Lead',   pct: 61, color: '#EAB308'},
                {name: 'Tom Ricci',    role: 'Ops Director',   pct: 79, color: '#22C55E'}
              ].map((person, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 7
                }}>
                  <span style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.5)',
                    width: 110, flexShrink: 0
                  }}>
                    {person.name}
                  </span>
                  <div style={{
                    flex: 1, height: 3,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 2, overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${person.pct}%`,
                      background: person.color,
                      opacity: 0.75,
                      borderRadius: 2
                    }}/>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: person.color, width: 32,
                    textAlign: 'right', flexShrink: 0
                  }}>
                    {person.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          SECTION 4 — WHAT WE MEASURE
          Five dimensions. Two column grid. Blue left borders.
      ============================================= */}
      <section className="snap-beat" style={{
        background: '#000',
        padding: '0 48px',
        width: '100%'
      }}>
        <div style={{maxWidth: 960, margin: '0 auto', width: '100%'}}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12
          }}>
            What We Measure
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 700, color: '#FFFFFF',
            letterSpacing: '-0.02em', marginBottom: 12
          }}>
            Five dimensions. Each one role-relevant.
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.4)',
            marginBottom: 40, maxWidth: 520, lineHeight: 1.65
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
                paddingBottom: 24,
                marginBottom: 24,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{
                  fontSize: 16, fontWeight: 700,
                  color: '#FFFFFF', marginBottom: 6
                }}>
                  {dim.name}
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.45)',
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
          SECTION 5 — WHERE VELTRO FITS + DATA CLOSE
          Vertical timeline left. Five numbers + close right.
      ============================================= */}
      <section className="process-grid snap-beat" style={{
        background: '#0D1117',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 80,
        alignItems: 'center',
        padding: '0 48px',
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto'
      }}>

        {/* Left — vertical timeline */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 16
          }}>
            The Search Process
          </p>
          <h2 style={{
            fontSize: 'clamp(26px,3.5vw,38px)',
            fontWeight: 700, color: '#FFFFFF',
            letterSpacing: '-0.02em', marginBottom: 48
          }}>
            Where Veltro fits.
          </h2>

          <div style={{position: 'relative', paddingLeft: 32}}>
            {/* Base vertical line */}
            <div style={{
              position: 'absolute',
              left: 6, top: 8, bottom: 8,
              width: 1,
              background: 'rgba(255,255,255,0.08)'
            }}/>
            {/* Active segment — Shortlist to Client Meeting */}
            <div style={{
              position: 'absolute',
              left: 6,
              top: '47%',
              height: '40%',
              width: 1,
              background: '#2563EB',
              boxShadow: '0 0 8px rgba(37,99,235,0.6)'
            }}/>

            {[
              {
                label: 'Kickoff',
                copy: 'Define the role. Confirm the benchmark.',
                active: false,
                veltro: false
              },
              {
                label: 'Sourcing',
                copy: 'Build the candidate pool.',
                active: false,
                veltro: false
              },
              {
                label: 'Shortlist',
                copy: 'Send the evaluation. Six minutes per candidate.',
                active: true,
                veltro: true
              },
              {
                label: 'Client Meeting',
                copy: 'Open the report. The room decides.',
                active: true,
                veltro: false
              }
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 20,
                marginBottom: i < 3 ? 32 : 0,
                position: 'relative'
              }}>
                {/* Node */}
                <div style={{
                  position: 'absolute',
                  left: -32, top: 6,
                  width: 13, height: 13,
                  borderRadius: '50%',
                  background: step.active ? '#2563EB' : 'rgba(255,255,255,0.12)',
                  boxShadow: step.active
                    ? '0 0 0 3px rgba(37,99,235,0.2), 0 0 12px rgba(37,99,235,0.5)'
                    : 'none',
                  zIndex: 1
                }}/>
                <div>
                  <div style={{
                    display: 'flex', gap: 10,
                    alignItems: 'center', marginBottom: 4
                  }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: step.active ? 700 : 500,
                      color: step.active ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                      letterSpacing: '-0.01em'
                    }}>
                      {step.label}
                    </p>
                    {step.veltro && (
                      <span style={{
                        fontSize: 8, fontWeight: 700,
                        color: '#2563EB',
                        background: 'rgba(37,99,235,0.12)',
                        border: '1px solid rgba(37,99,235,0.3)',
                        padding: '2px 6px', borderRadius: 4,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase'
                      }}>
                        Veltro activates
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12,
                    color: step.active
                      ? 'rgba(255,255,255,0.45)'
                      : 'rgba(255,255,255,0.2)',
                    lineHeight: 1.5
                  }}>
                    {step.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — five numbers + close */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#2563EB',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 24
          }}>
            Backed by real data
          </p>

          {/* Five numbers — 2-col grid, last item spans both */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px 32px',
            marginBottom: 48
          }}>
            {[
              {val: '2.2M+', label: 'People in the dataset',  sub: 'General adult population norms'},
              {val: '94',    label: 'Signals per evaluation', sub: 'Extracted from structured inputs'},
              {val: '5',     label: 'Dimensions scored',      sub: 'Role-relevant behavioral factors'},
              {val: '8',     label: 'Peer-reviewed studies',  sub: 'Across four validation cohorts'},
              {val: '6 min', label: 'Per candidate',          sub: 'No login. Any device.'}
            ].map((stat, i) => (
              <div key={i} style={{
                gridColumn: i === 4 ? 'span 2' : 'span 1'
              }}>
                <p style={{
                  fontSize: i === 4
                    ? 'clamp(24px,3vw,36px)'
                    : 'clamp(28px,3.5vw,42px)',
                  fontWeight: 900, color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1, marginBottom: 6
                }}>
                  {stat.val}
                </p>
                <p style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.45)',
                  marginBottom: 2
                }}>
                  {stat.label}
                </p>
                <p style={{fontSize: 10, color: 'rgba(255,255,255,0.2)'}}>
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            height: 1,
            background: 'rgba(255,255,255,0.07)',
            marginBottom: 32
          }}/>

          <p style={{
            fontSize: 'clamp(18px,2.2vw,22px)',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '-0.02em',
            lineHeight: 1.45,
            marginBottom: 10
          }}>
            This doesn&apos;t replace your judgment.
            <br/>It structures it.
          </p>
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 24
          }}>
            You still decide. This shows your client why.
          </p>
          <a href="/sample-report" style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#FFFFFF', color: '#000',
            fontSize: 14, fontWeight: 700,
            padding: '12px 24px', borderRadius: 8,
            textDecoration: 'none'
          }}>
            See the full report →
          </a>
        </div>
      </section>

    </div>
  )
}
