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

// Veltro-active stage indices — always shown, no toggle
const VELTRO = new Set([0, 2, 3, 6])

// Center x position of stage i as a percentage of container width
const cx = (i: number) => `${((i + 0.5) / N) * 100}%`

const CARDS: Record<number, string> = {
  0: 'Benchmark set. HM profiled. Active from day one.',
  2: 'Hidden fits surface before the shortlist.',
  3: 'Evaluation sent. Report ready to present.',
  6: 'Fit score on record. Guarantee period covered.',
}

export default function SearchProcessTimeline() {
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
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div>
      {/* Timeline */}
      <div ref={containerRef} style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ minWidth: 640, position: 'relative' }}>

          {/* Base line */}
          <div style={{
            position: 'absolute', top: 20, left: cx(0), right: `calc(100% - ${cx(N - 1)})`,
            height: 1, background: 'rgba(255,255,255,0.07)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.07)',
              transformOrigin: 'left',
              transform: `scaleX(${phase >= 1 ? 1 : 0})`,
              transition: 'transform 800ms ease-out',
            }} />
          </div>

          {/* Blue segment: Kickoff → Screening */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: cx(0),
            right: `calc(100% - ${cx(2)})`,
            height: 4, borderRadius: 2,
            background: `linear-gradient(90deg, ${B}, ${B}88)`,
            opacity: phase >= 4 ? 0.8 : 0,
            transition: 'opacity 400ms ease 100ms',
            animation: phase >= 4 ? 'sptSegPulse 2.5s ease-in-out infinite 0.2s' : 'none',
          }} />

          {/* Blue segment: Shortlist → Placement */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: cx(3),
            right: `calc(100% - ${cx(6)})`,
            height: 4, borderRadius: 2,
            background: `linear-gradient(90deg, ${B}88, ${B})`,
            opacity: phase >= 4 ? 0.8 : 0,
            transition: 'opacity 400ms ease',
            animation: phase >= 4 ? 'sptSegPulse 2.5s ease-in-out infinite' : 'none',
          }} />

          {/* Stage circles + labels */}
          <div style={{ display: 'flex', position: 'relative' }}>
            {STAGES.map((label, i) => {
              const isV = VELTRO.has(i)
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

          {/* Cards — flex row aligned with stage columns */}
          <div style={{ display: 'flex', marginTop: 16 }}>
            {STAGES.map((label, i) => {
              const showCard = VELTRO.has(i) && phase >= 4
              if (!showCard) return <div key={label} style={{ flex: 1 }} />
              return (
                <div key={label} style={{
                  flex: 1,
                  opacity: 1,
                  transition: 'opacity 400ms ease, transform 400ms ease',
                  padding: '0 4px',
                }}>
                  <div style={{
                    background: 'rgba(37,99,235,0.1)',
                    border: '1px solid rgba(37,99,235,0.25)',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <p style={{ fontSize: 9, color: B, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 4 }}>Veltro</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, margin: 0 }}>
                      {CARDS[i]}
                    </p>
                  </div>
                </div>
              )
            })}
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
