'use client'

import { useEffect, useRef, useState } from 'react'
import { FitModel } from '@/app/components/FitModel'
import type { FitModelScores } from '@/app/components/FitModel'

// ─── Profiles ────────────────────────────────────────────────────
// Scores are pushed to extremes so each pentagon shape is unmistakably different.
// deriveAxes: exec = dom·0.58 + form·0.42  |  own = dom·0.72 + pat·0.28
//   adapt = ext·0.22 + (1-form)·0.58 + (1-pat)·0.20
//   collab = ext·0.68 + pat·0.32  |  dec = dom·0.54 + (1-pat)·0.46

const PROFILES: {
  name: string; role: string; score: number
  verdict: string; verdictColor: string; archetype: string
  scores: FitModelScores
}[] = [
  {
    name: 'Marcus Thompson',
    role: 'Superintendent · Gilbane Construction',
    score: 93, verdict: 'Strong Hire', verdictColor: '#22C55E', archetype: 'Pioneer',
    // exec≈0.90  own≈0.71  adapt≈0.33  collab≈0.16  dec≈0.94 — spiky at top+upper-left
    scores: { dominance: 0.95, extraversion: 0.20, patience: 0.08, formality: 0.82 }
  },
  {
    name: 'Elena Vasquez',
    role: 'VP of Sales · Meridian Capital',
    score: 87, verdict: 'Strong Hire', verdictColor: '#22C55E', archetype: 'Diplomat',
    // exec≈0.33  own≈0.43  adapt≈0.55  collab≈0.91  dec≈0.19 — wide at collab/adapt
    scores: { dominance: 0.25, extraversion: 0.92, patience: 0.88, formality: 0.45 }
  },
  {
    name: 'James Whitfield',
    role: 'CFO · Portco Holdings',
    score: 78, verdict: 'Proceed with Caution', verdictColor: '#EAB308', archetype: 'Operator',
    // exec≈0.40  own≈0.65  adapt≈0.57  collab≈0.53  dec≈0.34 — leans right (own/adapt)
    scores: { dominance: 0.55, extraversion: 0.35, patience: 0.90, formality: 0.18 }
  },
  {
    name: 'Sarah Okonkwo',
    role: 'Director of Operations · Apex Group',
    score: 91, verdict: 'Strong Hire', verdictColor: '#22C55E', archetype: 'Anchor',
    // exec≈0.20  own≈0.34  adapt≈0.70  collab≈0.84  dec≈0.21 — bottom-heavy pentagon
    scores: { dominance: 0.18, extraversion: 0.88, patience: 0.75, formality: 0.22 }
  }
]

// Benchmark — same across all rotations, renders as dashed muted outline
const BENCHMARK: FitModelScores = {
  dominance: 0.72, extraversion: 0.52, patience: 0.50, formality: 0.66
}

// Hiring team for Section 3 stakeholder visual
const HIRING_MANAGER: FitModelScores = {
  // exec≈0.75  own≈0.68  adapt≈0.38  collab≈0.46  dec≈0.69
  dominance: 0.78, extraversion: 0.48, patience: 0.42, formality: 0.72
}

// Word chips for Section 2 assessment visual
const WORDS_ROLE = [
  { word: 'Decisive',      sel: true  },
  { word: 'Methodical',    sel: false },
  { word: 'Bold',          sel: true  },
  { word: 'Patient',       sel: false },
  { word: 'Competitive',   sel: true  },
  { word: 'Collaborative', sel: false },
  { word: 'Analytical',    sel: false },
  { word: 'Direct',        sel: true  },
]

const WORDS_NATURAL = [
  { word: 'Patient',       sel: true  },
  { word: 'Methodical',    sel: true  },
  { word: 'Thorough',      sel: false },
  { word: 'Collaborative', sel: true  },
  { word: 'Careful',       sel: false },
  { word: 'Decisive',      sel: false },
  { word: 'Systematic',    sel: true  },
  { word: 'Analytical',    sel: false },
]

export default function MethodPage() {
  const [activeProfile, setActiveProfile] = useState(0)
  const [fading, setFading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setActiveProfile(p => (p + 1) % PROFILES.length)
        setFading(false)
      }, 300)
    }, 3500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const profile = PROFILES[activeProfile]

  return (
    <div className="snap-page">

      {/* ── FIXED NAV ────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(11,15,20,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <a href="/" style={{
          fontSize: 15, fontWeight: 700, color: '#fff',
          textDecoration: 'none', letterSpacing: '-0.01em'
        }}>Veltro</a>
        <div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
          {[
            {label: 'Sample Report', href: '/sample-report'},
            {label: 'Method',        href: '/profiles'},
            {label: 'Sign in',       href: '/login'}
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 13,
              color: l.label === 'Method' ? '#fff' : 'rgba(255,255,255,0.4)',
              fontWeight: l.label === 'Method' ? 600 : 400,
              textDecoration: 'none'
            }}>{l.label}</a>
          ))}
          <a href="/sample-report" style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '7px 14px', borderRadius: 6, textDecoration: 'none'
          }}>See the report →</a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          Rotating profile card. Each profile has a genuinely different
          pentagon shape against the same muted benchmark outline.
      ══════════════════════════════════════════════════════════════ */}
      <section className="hero-grid snap-beat" style={{
        background: '#0B0F14',
        display: 'grid',
        gridTemplateColumns: '1fr 460px',
        gap: 64,
        alignItems: 'center',
        padding: '0 64px',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto'
      }}>

        {/* Left */}
        <div>
          <p style={{
            fontSize: 10, fontWeight: 700, color: '#2563EB',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20
          }}>Method</p>
          <h1 style={{
            fontSize: 'clamp(38px,5vw,60px)', fontWeight: 900,
            color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1.02, marginBottom: 22
          }}>
            Why the recommendation<br />holds up.
          </h1>
          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7, marginBottom: 10, maxWidth: 420
          }}>
            The score isn&apos;t a personality label.
            It&apos;s a distance from a role-specific benchmark.
          </p>
          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.18)', marginBottom: 40,
            letterSpacing: '0.02em'
          }}>
            Model v2.0 · Calibrated Mar 2026 · 2,245,096 respondents
          </p>
          <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
            <a href="/sample-report" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#FFFFFF', color: '#000',
              fontSize: 14, fontWeight: 700,
              padding: '13px 26px', borderRadius: 8, textDecoration: 'none',
              boxShadow: '0 0 32px rgba(255,255,255,0.08)'
            }}>See a full recommendation</a>
            <span style={{fontSize: 13, color: 'rgba(255,255,255,0.28)'}}>
              Scroll to see how it works ↓
            </span>
          </div>
        </div>

        {/* Right — gradient border card */}
        <div style={{
          background: 'linear-gradient(145deg,rgba(37,99,235,0.25) 0%,rgba(255,255,255,0.06) 50%,rgba(37,99,235,0.1) 100%)',
          padding: 1,
          borderRadius: 18,
          boxShadow: '0 48px 100px rgba(0,0,0,0.8), 0 0 60px rgba(37,99,235,0.08)'
        }}>
          <div style={{
            background: 'linear-gradient(160deg,#0F1825 0%,#080E16 100%)',
            borderRadius: 17,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '13px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>Role Benchmark</span>
              <span style={{
                fontSize: 9, color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.06em', fontWeight: 500
              }}>Field Leadership</span>
            </div>

            {/* Pentagon */}
            <div style={{
              padding: '20px 24px 8px',
              display: 'flex', justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 220, height: 220, borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(37,99,235,0.18) 0%,transparent 70%)',
                pointerEvents: 'none'
              }}/>
              <div style={{
                opacity: fading ? 0 : 1,
                transition: 'opacity 280ms ease',
                position: 'relative', zIndex: 1
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

            {/* Identity */}
            <div style={{
              padding: '0 20px 12px',
              opacity: fading ? 0 : 1,
              transition: 'opacity 280ms ease'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 6
              }}>
                <div>
                  <p style={{fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2}}>
                    {profile.name}
                  </p>
                  <p style={{fontSize: 11, color: 'rgba(255,255,255,0.32)'}}>
                    {profile.role}
                  </p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{
                    fontSize: 32, fontWeight: 900, color: '#fff',
                    letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 2
                  }}>{profile.score}</p>
                  <p style={{fontSize: 10, fontWeight: 600, color: profile.verdictColor}}>
                    {profile.verdict}
                  </p>
                </div>
              </div>
              <p style={{fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em'}}>
                {profile.archetype} · Field Leadership Benchmark
              </p>
            </div>

            {/* Dots */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: 5, padding: '0 0 14px'
            }}>
              {PROFILES.map((_, i) => (
                <button key={i} onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current)
                  setFading(true)
                  setTimeout(() => { setActiveProfile(i); setFading(false) }, 280)
                }} style={{
                  width: i === activeProfile ? 20 : 5, height: 5,
                  borderRadius: 3,
                  background: i === activeProfile ? '#2563EB' : 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 300ms ease'
                }}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — THE ASSESSMENT
          Left: compact 80→94→5→1 equation.
          Right: live word-selection visual showing two lists
          and the adaptation gap between them.
      ══════════════════════════════════════════════════════════════ */}
      <section className="snap-beat" style={{
        background: '#000', padding: '0', width: '100%'
      }}>
        <div style={{
          width: '100%', maxWidth: 1060, padding: '0 64px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 72, alignItems: 'center'
        }} className="score-build-grid">

          {/* Left — equation */}
          <div>
            {[
              { num: '80', label: 'Adjective choices',   sub: 'Two structured word lists. Six minutes.', color: 'rgba(255,255,255,0.45)', arrow: false },
              { arrow: true },
              { num: '94', label: 'Behavioral signals',  sub: 'Including the adaptation gap between lists.', color: 'rgba(255,255,255,0.65)', arrow: false },
              { arrow: true },
              { num: '5',  label: 'Dimensions scored',   sub: 'Mapped to role-relevant behavioral factors.', color: 'rgba(255,255,255,0.82)', arrow: false },
              { arrow: true },
              { num: '1',  label: 'Fit score vs benchmark', sub: 'A precise distance from the target. Not a type.', color: '#FFFFFF', arrow: false }
            ].map((item, i) => {
              if (item.arrow) return (
                <div key={i} style={{fontSize: 18, color: 'rgba(37,99,235,0.5)', padding: '1px 0 1px 6px'}}>→</div>
              )
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'baseline', gap: 14,
                  padding: '10px 0',
                  borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  <span style={{
                    fontSize: 'clamp(40px,4.5vw,56px)', fontWeight: 900,
                    color: item.color, letterSpacing: '-0.04em',
                    lineHeight: 1, minWidth: 68, flexShrink: 0
                  }}>{item.num}</span>
                  <div>
                    <p style={{fontSize: 14, fontWeight: 600, color: item.color, marginBottom: 2}}>
                      {item.label}
                    </p>
                    <p style={{fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5}}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right — word selection card */}
          <div style={{
            background: 'linear-gradient(145deg,rgba(37,99,235,0.15) 0%,rgba(255,255,255,0.04) 100%)',
            padding: 1, borderRadius: 16,
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)'
          }}>
            <div style={{
              background: '#0A0E16', borderRadius: 15,
              padding: '22px 20px 18px'
            }}>
              {/* List 1 */}
              <div style={{marginBottom: 0}}>
                <p style={{
                  fontSize: 9, fontWeight: 700, color: '#2563EB',
                  letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10
                }}>List 1 — In this role</p>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 5}}>
                  {WORDS_ROLE.map((w, i) => (
                    <span key={i} style={{
                      padding: '5px 11px', borderRadius: 20,
                      fontSize: 11, fontWeight: w.sel ? 600 : 400,
                      background: w.sel ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                      color: w.sel ? '#000000' : 'rgba(255,255,255,0.28)',
                      border: w.sel ? 'none' : '1px solid rgba(255,255,255,0.07)',
                      letterSpacing: '-0.01em',
                      boxShadow: w.sel ? '0 0 12px rgba(255,255,255,0.15)' : 'none'
                    }}>{w.word}</span>
                  ))}
                </div>
              </div>

              {/* Gap divider */}
              <div style={{
                margin: '18px -20px',
                height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(37,99,235,0.6),transparent)',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute', left: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                  background: '#0A0E16', padding: '0 10px',
                  fontSize: 8, fontWeight: 700, color: 'rgba(37,99,235,0.7)',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}>Adaptation gap</span>
              </div>

              {/* List 2 */}
              <div style={{marginBottom: 18}}>
                <p style={{
                  fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10
                }}>List 2 — Naturally</p>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 5}}>
                  {WORDS_NATURAL.map((w, i) => (
                    <span key={i} style={{
                      padding: '5px 11px', borderRadius: 20,
                      fontSize: 11, fontWeight: w.sel ? 600 : 400,
                      background: w.sel ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                      color: w.sel ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.22)',
                      border: w.sel ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.06)',
                      letterSpacing: '-0.01em'
                    }}>{w.word}</span>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                paddingTop: 14,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', justifyContent: 'space-between'
              }}>
                {[
                  {val: '6 min', label: 'to complete'},
                  {val: '80',    label: 'adjective choices'},
                  {val: '94',    label: 'signals extracted'}
                ].map((s, i) => (
                  <div key={i} style={{textAlign: i===1 ? 'center' : i===2 ? 'right' : 'left'}}>
                    <p style={{
                      fontSize: 16, fontWeight: 800, color: '#fff',
                      letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 3
                    }}>{s.val}</p>
                    <p style={{fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em'}}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — THE TEAM LAYER
          Can they perform in this environment?
          Left: the concept. Right: candidate vs hiring manager
          pentagon overlaid — three shapes in one visual.
      ══════════════════════════════════════════════════════════════ */}
      <section className="snap-beat" style={{
        background: '#0D1117', padding: '0', width: '100%'
      }}>
        <div style={{
          width: '100%', maxWidth: 1060, padding: '0 64px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 72, alignItems: 'center'
        }} className="signal-grid">

          {/* Left */}
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#2563EB',
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20
            }}>The Team Layer</p>
            <h2 style={{
              fontSize: 'clamp(28px,3.8vw,44px)', fontWeight: 800,
              color: '#fff', letterSpacing: '-0.03em',
              lineHeight: 1.05, marginBottom: 22
            }}>
              Fit for the role.<br />Fit for the room.
            </h2>
            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.8, marginBottom: 14
            }}>
              The benchmark answers whether the candidate can do the job.
              The team layer answers whether they&apos;ll do it here — with
              this manager, these peers, in this environment.
            </p>
            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.8, marginBottom: 28
            }}>
              Profile the hiring manager and key stakeholders once.
              Every candidate is automatically scored against every
              stored profile — showing alignment and friction before
              you walk into the client meeting.
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {[
                'Hiring manager profiled once. Active on every future candidate.',
                'Peer, board, and stakeholder profiles stack automatically.',
                'Friction surfaces before onboarding, not after.'
              ].map((p, i) => (
                <div key={i} style={{display: 'flex', gap: 10, alignItems: 'flex-start'}}>
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#2563EB', flexShrink: 0, marginTop: 8
                  }}/>
                  <p style={{fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65}}>
                    {p}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — triple overlay pentagon */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
            {/* Gradient border card */}
            <div style={{
              background: 'linear-gradient(145deg,rgba(255,255,255,0.08) 0%,rgba(37,99,235,0.2) 100%)',
              padding: 1, borderRadius: 18,
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)'
            }}>
              <div style={{
                background: 'linear-gradient(160deg,#0F1825 0%,#080E16 100%)',
                borderRadius: 17, padding: '20px 24px 14px'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 16
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.22)',
                    letterSpacing: '0.12em', textTransform: 'uppercase'
                  }}>Candidate vs. Hiring Manager</span>
                </div>

                {/* Legend */}
                <div style={{
                  display: 'flex', gap: 16, marginBottom: 16
                }}>
                  {[
                    {color: '#2563EB', label: 'Candidate', solid: true},
                    {color: 'rgba(255,255,255,0.5)', label: 'Hiring Manager', solid: false},
                    {color: 'rgba(255,255,255,0.2)', label: 'Benchmark', solid: false}
                  ].map((item, i) => (
                    <div key={i} style={{display: 'flex', gap: 5, alignItems: 'center'}}>
                      <div style={{
                        width: 14, height: 2,
                        background: item.solid
                          ? item.color
                          : `repeating-linear-gradient(90deg,${item.color} 0,${item.color} 3px,transparent 3px,transparent 6px)`,
                        borderRadius: 1
                      }}/>
                      <span style={{fontSize: 9, color: 'rgba(255,255,255,0.3)'}}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{display: 'flex', justifyContent: 'center', position: 'relative'}}>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 68%)',
                    pointerEvents: 'none'
                  }}/>
                  <FitModel
                    scores={PROFILES[0].scores}
                    target={HIRING_MANAGER}
                    benchmarkScores={BENCHMARK}
                    size={260}
                    variant="dark"
                    animated={true}
                  />
                </div>

                {/* Compatibility rows */}
                <div style={{
                  paddingTop: 14,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  marginTop: 4
                }}>
                  {[
                    {name: 'David Mercer', role: 'Hiring Manager',  pct: 88, color: '#22C55E'},
                    {name: 'Sarah Chen',   role: 'Project Lead',    pct: 61, color: '#EAB308'},
                    {name: 'Tom Ricci',    role: 'Board Observer',  pct: 79, color: '#22C55E'}
                  ].map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: i < 2 ? 8 : 0
                    }}>
                      <div style={{width: 90, flexShrink: 0}}>
                        <p style={{fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.2}}>
                          {p.name}
                        </p>
                        <p style={{fontSize: 9, color: 'rgba(255,255,255,0.22)'}}>
                          {p.role}
                        </p>
                      </div>
                      <div style={{
                        flex: 1, height: 3,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 2, overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%', width: `${p.pct}%`,
                          background: `linear-gradient(90deg,${p.color}88,${p.color})`,
                          borderRadius: 2
                        }}/>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: p.color, width: 30,
                        textAlign: 'right', flexShrink: 0
                      }}>{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — FIVE DIMENSIONS
          Steve Jobs: show the thing. Let it speak.
          Large animated pentagon. Names below. One line of copy.
          No descriptions. Lots of air.
      ══════════════════════════════════════════════════════════════ */}
      <section className="snap-beat" style={{
        background: '#000', padding: '0', width: '100%'
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          padding: '0 48px'
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: '#2563EB',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            marginBottom: 40
          }}>What we measure</p>

          {/* Pentagon — the product shot */}
          <div style={{position: 'relative', marginBottom: 36}}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 360, height: 360, borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 65%)',
              pointerEvents: 'none'
            }}/>
            <FitModel
              scores={BENCHMARK}
              size={300}
              variant="dark"
              animated={true}
              showLabels={true}
            />
          </div>

          {/* Five names — monumental type */}
          <div style={{
            display: 'flex', gap: 0, flexDirection: 'column',
            alignItems: 'center', marginBottom: 40
          }}>
            {[
              {n: '01', name: 'Execution'},
              {n: '02', name: 'Ownership'},
              {n: '03', name: 'Adaptability'},
              {n: '04', name: 'Collaboration'},
              {n: '05', name: 'Decision Speed'}
            ].map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline',
                gap: 14, padding: '6px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                width: 340
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: 'rgba(37,99,235,0.6)',
                  letterSpacing: '0.1em', width: 22, flexShrink: 0
                }}>{d.n}</span>
                <span style={{
                  fontSize: 'clamp(18px,2.2vw,24px)', fontWeight: 700,
                  color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em'
                }}>{d.name}</span>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.01em'
          }}>
            Not personality labels. Behavioral distance from a benchmark.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 — HOW IT WORKS
          Steve Jobs recruiting expert.
          Left: the declaration. Right: the visual argument.
          Send it to everyone in the room. You walk in knowing.
      ══════════════════════════════════════════════════════════════ */}
      <section className="snap-beat" style={{
        background: '#060810', padding: '0', width: '100%'
      }}>
        <div style={{
          width: '100%', maxWidth: 1060, padding: '0 64px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center'
        }} className="howit-grid">

          {/* Left — Jobs-style declaration */}
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#2563EB',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 24
            }}>During shortlisting</p>

            <h2 style={{
              fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900,
              color: '#fff', letterSpacing: '-0.04em',
              lineHeight: 1.02, marginBottom: 32
            }}>
              Send it to everyone<br />in the room.
            </h2>

            {/* Three stark steps — separated by thin lines */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 40
            }}>
              {[
                {step: 'Your shortlisted candidate takes it.',           detail: 'Any device. No login required.'},
                {step: 'Your hiring manager takes it.',                  detail: 'Profiled once. Active on every future search.'},
                {step: 'Your key stakeholders take it.',                 detail: 'Compatibility scored automatically.'}
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <p style={{
                    fontSize: 15, fontWeight: 600, color: '#fff',
                    letterSpacing: '-0.01em', marginBottom: 3
                  }}>{item.step}</p>
                  <p style={{fontSize: 12, color: 'rgba(255,255,255,0.3)'}}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              padding: '0 0 32px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 32
            }}>
              <p style={{
                fontSize: 'clamp(15px,1.8vw,18px)',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '-0.02em',
                lineHeight: 1.5
              }}>
                Six minutes each.<br />
                You walk in knowing.
              </p>
            </div>

            <a href="/sample-report" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#FFFFFF', color: '#000',
              fontSize: 14, fontWeight: 700,
              padding: '13px 26px', borderRadius: 8, textDecoration: 'none',
              boxShadow: '0 0 40px rgba(255,255,255,0.1)'
            }}>See the full report →</a>
          </div>

          {/* Right — three pentagons showing the full picture */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <p style={{
              fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              textAlign: 'center'
            }}>The alignment picture</p>

            {/* Three cards in a column */}
            {[
              {
                label: 'Candidate',
                name: 'Marcus Thompson',
                role: 'Superintendent',
                scores: PROFILES[0].scores,
                badge: '93 · Strong Hire',
                badgeColor: '#22C55E',
                size: 120
              },
              {
                label: 'Hiring Manager',
                name: 'David Mercer',
                role: 'Client — Project Director',
                scores: HIRING_MANAGER,
                badge: '88% compatible',
                badgeColor: '#22C55E',
                size: 120
              },
              {
                label: 'Project Lead',
                name: 'Sarah Chen',
                role: 'Client — Project Lead',
                scores: { dominance: 0.38, extraversion: 0.82, patience: 0.70, formality: 0.50 },
                badge: '61% compatible',
                badgeColor: '#EAB308',
                size: 120
              }
            ].map((person, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <FitModel
                  scores={person.scores}
                  benchmarkScores={BENCHMARK}
                  size={person.size}
                  variant="dark"
                  animated={false}
                  showLabels={false}
                />
                <div style={{flex: 1}}>
                  <p style={{
                    fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4
                  }}>{person.label}</p>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 1
                  }}>{person.name}</p>
                  <p style={{fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8}}>
                    {person.role}
                  </p>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: person.badgeColor,
                    background: `${person.badgeColor}18`,
                    border: `1px solid ${person.badgeColor}44`,
                    padding: '2px 8px', borderRadius: 4
                  }}>{person.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
