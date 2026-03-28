'use client'

import { useEffect, useRef, useState } from 'react'

const STAGES = [
  'Kickoff',
  'Sourcing',
  'Screening',
  'Shortlist',
  'Presentation',
  'Client Decision',
  'Placement',
]

const N = STAGES.length

// Veltro-active stage indices per mode
const VELTRO: Record<'a' | 'b', Set<number>> = {
  a: new Set([3, 4]),        // Shortlist, Presentation
  b: new Set([0, 3, 4]),     // Kickoff, Shortlist, Presentation
}

// Center x position of stage i as a percentage of container width
const cx = (i: number) => `${((i + 0.5) / N) * 100}%`

export default function SearchProcessTimeline() {
  const [mode, setMode] = useState<'a' | 'b'>('a')
  const [phase, setPhase] = useState(0)
  const fired = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const B = '#2563EB'

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return
        fired.current = true
        obs.disconnect()
        const t1 = window.setTimeout(() => setPhase(1), 80)
        const t2 = window.setTimeout(() => setPhase(2), 880)
        const t3 = window.setTimeout(() => setPhase(3), 1360)
        const t4 = window.setTimeout(() => setPhase(4), 1760)
        // cleanup handled by obs.disconnect above
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const veltro = VELTRO[mode]

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 40 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginRight: 4 }}>Mode:</span>
        {(['a', 'b'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              height: 32, padding: '0 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              fontWeight: mode === m ? 600 : 400,
              color: mode === m ? '#FFF' : 'rgba(255,255,255,0.4)',
              background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: `1px solid ${mode === m ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 180ms ease',
            }}
          >
            {m === 'a' ? 'Candidate only' : '+ Hiring Manager'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div ref={containerRef} style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ minWidth: 640, position: 'relative' }}>

          {/* Base line */}
          <div style={{
            position: 'absolute', top: 20, left: cx(0), right: `calc(100% - ${cx(N - 1)})`,
            height: 1, background: 'rgba(255,255,255,0.07)',
          }}>
            {/* Draw animation */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.07)',
              transformOrigin: 'left',
              transform: `scaleX(${phase >= 1 ? 1 : 0})`,
              transition: 'transform 800ms ease-out',
            }} />
          </div>

          {/* Blue segment: Shortlist → Presentation (modes A & B) */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: cx(3),
            right: `calc(100% - ${cx(4)})`,
            height: 4, borderRadius: 2,
            background: `linear-gradient(90deg, ${B}88, ${B})`,
            opacity: phase >= 4 ? 0.8 : 0,
            transition: 'opacity 400ms ease',
            animation: phase >= 4 ? 'sptSegPulse 2.5s ease-in-out infinite' : 'none',
          }} />

          {/* Blue segment: Kickoff → Sourcing (mode B only) */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: cx(0),
            right: `calc(100% - ${cx(1)})`,
            height: 4, borderRadius: 2,
            background: `linear-gradient(90deg, ${B}, ${B}88)`,
            opacity: phase >= 4 && mode === 'b' ? 0.8 : 0,
            transition: 'opacity 400ms ease 100ms',
            animation: phase >= 4 && mode === 'b' ? 'sptSegPulse 2.5s ease-in-out infinite 0.4s' : 'none',
          }} />

          {/* Stage circles + labels */}
          <div style={{ display: 'flex', position: 'relative' }}>
            {STAGES.map((label, i) => {
              const isV = veltro.has(i)
              const muted = phase >= 3 && !isV
              const active = phase >= 4 && isV

              return (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    opacity: phase < 2 ? 0 : muted ? 0.2 : 1,
                    transform: phase < 2 ? 'translateY(8px)' : 'none',
                    transition: `opacity 280ms ease ${i * 80}ms, transform 280ms ease ${i * 80}ms`,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: `2px solid ${active ? B : 'rgba(255,255,255,0.1)'}`,
                    background: active ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.02)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? `0 0 0 4px rgba(37,99,235,0.08), 0 0 20px rgba(37,99,235,0.2)` : 'none',
                    transition: 'all 400ms ease',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: active ? B : 'rgba(255,255,255,0.15)',
                      transition: 'background 400ms ease',
                    }} />
                  </div>
                  <div style={{
                    marginTop: 10, fontSize: 10, textAlign: 'center',
                    color: active ? '#FFF' : 'rgba(255,255,255,0.4)',
                    fontWeight: active ? 600 : 400,
                    lineHeight: 1.3, maxWidth: 72,
                    transition: 'color 400ms ease',
                  }}>
                    {label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cards */}
          <div style={{ position: 'relative', marginTop: 20, height: 88 }}>

            {/* Candidate evaluation card — between Shortlist (3) and Presentation (4) */}
            <div style={{
              position: 'absolute',
              left: `${(4 / N) * 100}%`,
              top: 0,
              opacity: phase >= 4 ? 1 : 0,
              transform: phase >= 4 ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)',
              transition: 'opacity 400ms ease, transform 400ms ease',
              width: 200,
              zIndex: 5,
            }}>
              <div style={{
                background: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: 10, padding: '10px 14px',
              }}>
                <p style={{ fontSize: 9, color: B, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Veltro</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                  Evaluation sent. Report generated. Ready to present.
                </p>
              </div>
            </div>

            {/* Hiring manager card — at Kickoff (0), mode B only */}
            <div style={{
              position: 'absolute',
              left: cx(0),
              top: 0,
              opacity: phase >= 4 && mode === 'b' ? 1 : 0,
              transform: phase >= 4 && mode === 'b' ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)',
              transition: 'opacity 400ms ease 180ms, transform 400ms ease 180ms',
              width: 190,
              zIndex: 5,
            }}>
              <div style={{
                background: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: 10, padding: '10px 14px',
              }}>
                <p style={{ fontSize: 9, color: B, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Veltro</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                  Hiring manager profiled. Active on every candidate.
                </p>
              </div>
            </div>

            {/* "Compatibility active" dotted connector label, mode B */}
            <div style={{
              position: 'absolute',
              left: `${((0.5 + 4.5) / 2 / N) * 100}%`,
              top: 68,
              opacity: phase >= 4 && mode === 'b' ? 1 : 0,
              transform: 'translateX(-50%)',
              transition: 'opacity 400ms ease 300ms',
              pointerEvents: 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, borderTop: `1px dashed rgba(37,99,235,0.35)`, width: 48 }} />
                <span style={{ fontSize: 9, color: 'rgba(37,99,235,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Compatibility active
                </span>
                <div style={{ flex: 1, borderTop: `1px dashed rgba(37,99,235,0.35)`, width: 48 }} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes sptSegPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
