'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BG        = '#080808'
const SURFACE   = '#0f0f0f'
const SURFACE2  = '#0c0c0c'
const DIV       = 'rgba(255,255,255,0.07)'
const TEXT      = '#eeece6'
const SUB       = 'rgba(238,236,230,0.42)'
const FAINT     = 'rgba(238,236,230,0.18)'
const BLUE      = '#2563EB'
const GREEN     = '#3aa868'
const AMBER     = '#c8a832'
const RED       = '#e05a3a'
const FONT      = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif'
const CONDENSED = '"Barlow Condensed", system-ui, sans-serif'

// ── Dimension data ────────────────────────────────────────────────────────────
type DimKey = 'execution' | 'ownership' | 'adaptability' | 'collaboration' | 'decisionSpeed'

interface Dim {
  key: DimKey
  label: string
  score: number
  roleTarget: number
  shortlistAvg: number
  teamAvg: number
  delta: number
  impact: string
}

const DIMENSIONS: Dim[] = [
  {
    key: 'execution', label: 'Execution', score: 72, roleTarget: 64, shortlistAvg: 68, teamAvg: 66,
    delta: +8, impact: 'Above benchmark. Field leadership pattern — moves forward, does not wait.',
  },
  {
    key: 'ownership', label: 'Ownership', score: 67, roleTarget: 66, shortlistAvg: 64, teamAvg: 61,
    delta: +1, impact: 'Meets the bar but does not exceed it. Monitor in high-accountability contexts.',
  },
  {
    key: 'adaptability', label: 'Adaptability', score: 65, roleTarget: 50, shortlistAvg: 58, teamAvg: 55,
    delta: +15, impact: 'Well above benchmark. Handles scope shifts without losing execution edge.',
  },
  {
    key: 'collaboration', label: 'Collaboration', score: 49, roleTarget: 52, shortlistAvg: 60, teamAvg: 63,
    delta: -3, impact: 'Only dimension below benchmark. Within tolerance. Probe in cross-functional contexts. This is the tension.',
  },
  {
    key: 'decisionSpeed', label: 'Decision Speed', score: 85, roleTarget: 64, shortlistAvg: 70, teamAvg: 58,
    delta: +21, impact: 'Largest delta. Moves faster than most environments expect. Primary source of Operating Partner friction.',
  },
]

type CompMode = 'role' | 'shortlist' | 'team'

const COMP_LABELS: Record<CompMode, string> = {
  role:      'vs Role',
  shortlist: 'vs Shortlist',
  team:      'vs Team',
}

function getBenchmarkVals(mode: CompMode): number[] {
  return DIMENSIONS.map(d => {
    if (mode === 'role')      return d.roleTarget
    if (mode === 'shortlist') return d.shortlistAvg
    return d.teamAvg
  })
}

function getLargestDelta(mode: CompMode): { label: string; delta: number; sign: string } {
  const vals = getBenchmarkVals(mode)
  let maxAbs = -1, idx = 0
  vals.forEach((v, i) => {
    const diff = DIMENSIONS[i].score - v
    if (Math.abs(diff) > maxAbs) { maxAbs = Math.abs(diff); idx = i }
  })
  const diff = DIMENSIONS[idx].score - vals[idx]
  return { label: DIMENSIONS[idx].label, delta: diff, sign: diff >= 0 ? '+' : '' }
}

// ── Team Dynamics ─────────────────────────────────────────────────────────────
const TEAM_DYNAMICS = [
  {
    role: 'CEO', subtitle: 'Direct report',
    dots: 5, dotColor: GREEN,
    alignedDims: ['execution', 'ownership'] as DimKey[],
    alignment: 'Strong alignment',
    implication: 'Will experience Marcus as highly effective. Speed and ownership match CEO expectations directly.',
  },
  {
    role: 'Operating Partner', subtitle: null,
    dots: 2, dotColor: AMBER,
    alignedDims: ['decisionSpeed', 'collaboration'] as DimKey[],
    alignment: 'Misaligned on pace',
    implication: 'Friction on decision timing is structural, not interpersonal. Requires explicit alignment before they overlap.',
  },
  {
    role: 'Board Member', subtitle: null,
    dots: 3, dotColor: 'rgba(238,236,230,0.45)',
    alignedDims: ['collaboration'] as DimKey[],
    alignment: 'Moderate alignment',
    implication: 'Low risk. May expect more structure on high-stakes calls. Not a friction point.',
  },
]

// ── Interview probes ──────────────────────────────────────────────────────────
const INTERVIEW_PROBES = [
  {
    question: 'Tell me about a time you had to take charge before anyone asked you to. What made you step forward?',
    tests: 'Ownership',
    dim: 'ownership' as DimKey,
    risk: 'Low proactive accountability',
    critical: false,
    rationale: 'Ownership sits just +1 above benchmark. Confirm the pattern is genuine, not situational.',
  },
  {
    question: 'Walk me through a high-stakes decision you made with incomplete information. What was the pressure and how did you move?',
    tests: 'Decision Speed',
    dim: 'decisionSpeed' as DimKey,
    risk: 'Impulsive decisions under pressure',
    critical: true,
    rationale: 'Decision Speed is +21 — the largest delta. Confirm it&apos;s judgment-driven, not reckless.',
  },
  {
    question: "Describe a time you drove a stalled project forward where cross-team buy-in was required — specifically what you did when people weren't moving.",
    tests: 'Collaboration',
    dim: 'collaboration' as DimKey,
    risk: 'Independent execution that bypasses team',
    critical: true,
    rationale: 'Collaboration is the only dimension below benchmark. This question surfaces whether that gap is structural or situational.',
  },
]

// ── Pentagon geometry ─────────────────────────────────────────────────────────
const RADAR_COUNT = 5
const radarAngle = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i) / RADAR_COUNT
const CAND_VALS = DIMENSIONS.map(d => d.score)

function polyPath(vals: number[], cx: number, cy: number, r: number, prog = 1): string {
  return vals.map((v, i) => {
    const a = radarAngle(i)
    const rv = r * (v / 100) * prog
    return `${i === 0 ? 'M' : 'L'} ${cx + Math.cos(a) * rv} ${cy + Math.sin(a) * rv}`
  }).join(' ') + ' Z'
}

function ringPath(f: number, cx: number, cy: number, r: number): string {
  return DIMENSIONS.map((_, i) => {
    const a = radarAngle(i)
    return `${i === 0 ? 'M' : 'L'} ${cx + Math.cos(a) * r * f} ${cy + Math.sin(a) * r * f}`
  }).join(' ') + ' Z'
}

// ── Utility ───────────────────────────────────────────────────────────────────
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

// ── Sub-components ────────────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <p style={{
      fontSize: 10, lineHeight: '16px', letterSpacing: '0.1em',
      textTransform: 'uppercase', color: FAINT, fontWeight: 700, margin: 0,
    }}>{text}</p>
  )
}

function ActTag({ n, title }: { n: number; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <span style={{
        fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.18em',
        textTransform: 'uppercase', fontFamily: CONDENSED,
      }}>Act {n}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
      <span style={{
        fontSize: 10, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>{title}</span>
    </div>
  )
}

function ActBreak() {
  return (
    <div style={{ position: 'relative', margin: '56px 0' }}>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)' }} />
    </div>
  )
}

function DotRow({ filled, total = 5, color }: { filled: number; total?: number; color: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
          background: i < filled ? color : 'transparent',
          border: `1.5px solid ${i < filled ? color : 'rgba(255,255,255,0.16)'}`,
          opacity: i < filled ? 0.85 : 1,
        }} />
      ))}
    </span>
  )
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, color, animate, size = 140 }: { score: number; color: string; animate: boolean; size?: number }) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)
  const animRef = useRef(false)

  useEffect(() => {
    if (!animate || animRef.current) return
    animRef.current = true
    const t0 = performance.now(), dur = 1100
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setDisplayed(Math.round(easeOutCubic(p) * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate, score])

  const r = size / 2 - 8, circ = 2 * Math.PI * r
  const numSize = Math.round(size * 0.32)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Fit score ${score}`}>
      {/* Subtle glow ring */}
      <circle cx={size/2} cy={size/2} r={r + 4} fill="none" stroke={color + '08'} strokeWidth={14}/>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5}/>
      {/* Fill glow */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color + '18'} strokeWidth={10}/>
      {/* Arc */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - displayed / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 55ms linear' }}
      />
      {/* Score number */}
      <text x={size/2} y={size/2 + 2} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={numSize} fontWeight={900} fontFamily={CONDENSED}
        style={{ fontVariantNumeric: 'tabular-nums' }}>{displayed}</text>
    </svg>
  )
}

// ── Pentagon radar ─────────────────────────────────────────────────────────────
function PentagonRadar({
  compMode,
  hoveredDim,
  onHoverDim,
  animate,
  pulseDim,
}: {
  compMode: CompMode
  hoveredDim: DimKey | null
  onHoverDim: (k: DimKey | null) => void
  animate: boolean
  pulseDim: DimKey | null
}) {
  const [progress, setProgress]       = useState(animate ? 0 : 1)
  const [benchVisible, setBenchVisible] = useState(!animate)
  const [prevBenchVals, setPrevBenchVals] = useState(getBenchmarkVals(compMode))
  const [currBenchVals, setCurrBenchVals] = useState(getBenchmarkVals(compMode))
  const [morphProg, setMorphProg]     = useState(1)
  const morphRef   = useRef<number | null>(null)
  const svgRef     = useRef<SVGSVGElement>(null)
  const animDoneRef = useRef(false)

  // Entrance
  useEffect(() => {
    if (!animate || animDoneRef.current) return
    const el = svgRef.current; if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animDoneRef.current = true
      const t0 = performance.now(), dur = 800
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1)
        setProgress(easeOutCubic(p))
        if (p < 1) requestAnimationFrame(tick)
        else setBenchVisible(true)
      }
      requestAnimationFrame(tick)
      obs.disconnect()
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [animate])

  // Morph on mode change
  useEffect(() => {
    const next = getBenchmarkVals(compMode)
    setPrevBenchVals(currBenchVals)
    setCurrBenchVals(next)
    setMorphProg(0)
    if (morphRef.current) cancelAnimationFrame(morphRef.current)
    const t0 = performance.now(), dur = 320
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setMorphProg(easeOutCubic(p))
      if (p < 1) morphRef.current = requestAnimationFrame(tick)
    }
    morphRef.current = requestAnimationFrame(tick)
    return () => { if (morphRef.current) cancelAnimationFrame(morphRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compMode])

  const cx = 200, cy = 158, rad = 110

  const lerpVals = prevBenchVals.map((v, i) => v + (currBenchVals[i] - v) * morphProg)

  const labelPt = (i: number) => {
    const a = radarAngle(i)
    const rv = rad * 1.22
    return { x: cx + Math.cos(a) * rv, y: cy + Math.sin(a) * rv }
  }

  const vertexPt = (i: number, score: number, prog: number) => {
    const a = radarAngle(i)
    const rv = rad * (score / 100) * prog
    return { x: cx + Math.cos(a) * rv, y: cy + Math.sin(a) * rv }
  }

  const BENCHMARK_COLORS: Record<CompMode, string> = {
    role:      'rgba(255,255,255,0.28)',
    shortlist: 'rgba(255,255,255,0.20)',
    team:      'rgba(255,255,255,0.16)',
  }
  const benchStroke = BENCHMARK_COLORS[compMode]

  return (
    <svg
      ref={svgRef}
      width="100%"
      overflow="visible"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      viewBox="0 0 380 316"
      aria-label="Fit radar chart"
    >
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <path key={f} d={ringPath(f, cx, cy, rad)} fill="none"
          stroke={f === 1 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.035)'}
          strokeWidth={f === 1 ? 1 : 0.75}
        />
      ))}
      {/* Axis lines */}
      {DIMENSIONS.map((d, i) => {
        const a = radarAngle(i)
        const ex = cx + Math.cos(a) * rad, ey = cy + Math.sin(a) * rad
        const isAxisHov = hoveredDim === d.key
        return (
          <line key={d.key + '-axis'} x1={cx} y1={cy} x2={ex} y2={ey}
            stroke={isAxisHov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'}
            strokeWidth={isAxisHov ? '1.5' : '0.75'}
            style={{ transition: 'stroke 150ms ease, stroke-width 150ms ease' }}
          />
        )
      })}

      {/* Benchmark polygon */}
      {benchVisible && (
        <path d={polyPath(lerpVals, cx, cy, rad, 1)}
          fill="rgba(255,255,255,0.015)"
          stroke={benchStroke} strokeWidth="1.5" strokeDasharray="5 4"
          style={{ transition: 'stroke 300ms ease' }}
        />
      )}

      {/* Candidate polygon — filled */}
      <path d={polyPath(CAND_VALS, cx, cy, rad, progress)}
        fill={`rgba(37,99,235,${hoveredDim ? 0.07 : 0.11})`}
        stroke={BLUE} strokeWidth="2"
        style={{ transition: 'fill 200ms ease' }}
      />

      {/* Vertex dots + labels — rendered on top */}
      {DIMENSIONS.map((d, i) => {
        const lp = labelPt(i)
        const vp = vertexPt(i, d.score, progress)
        const isHov   = hoveredDim === d.key
        const anyHov  = hoveredDim !== null
        const isPulse = pulseDim === d.key
        const score   = d.score
        const benchVal = lerpVals[i]
        const delta = score - benchVal
        const deltaSign = delta >= 0 ? '+' : ''
        const deltaColor = delta < 0 ? AMBER : delta >= 15 ? GREEN : 'rgba(58,168,104,0.85)'

        return (
          <g key={d.key} style={{ cursor: 'default' }}
            onMouseEnter={() => onHoverDim(d.key)}
            onMouseLeave={() => onHoverDim(null)}>
            {/* Hit area */}
            <circle cx={vp.x} cy={vp.y} r={18} fill="transparent" />
            {/* Glow ring */}
            {(isHov || isPulse) && (
              <circle cx={vp.x} cy={vp.y} r={isPulse ? 12 : 10}
                fill={isPulse ? AMBER + '20' : BLUE + '20'}
                style={{ transition: 'r 200ms ease' }}
              />
            )}
            {/* Vertex dot */}
            <circle cx={vp.x} cy={vp.y}
              r={isPulse ? 7 : isHov ? 6 : 4}
              fill={isPulse ? AMBER : isHov ? TEXT : BLUE}
              opacity={anyHov && !isHov && !isPulse ? 0.25 : 1}
              style={{ transition: 'r 180ms ease, opacity 180ms ease, fill 180ms ease' }}
            />
            {/* Score + delta badge on hover */}
            {isHov && (
              <>
                <text x={vp.x} y={vp.y - 16} textAnchor="middle" dominantBaseline="middle"
                  fill={TEXT} fontSize="12" fontWeight="800" fontFamily={CONDENSED}
                  opacity={0.95}
                >{score}</text>
                <text x={vp.x} y={vp.y - 29} textAnchor="middle" dominantBaseline="middle"
                  fill={deltaColor} fontSize="10" fontWeight="700" fontFamily={CONDENSED}
                  opacity={0.9}
                >{deltaSign}{Math.round(delta)}</text>
              </>
            )}
            {/* Dim label */}
            <text x={lp.x} y={lp.y}
              fill={isHov ? TEXT : anyHov ? 'rgba(238,236,230,0.18)' : 'rgba(238,236,230,0.5)'}
              fontSize={isHov ? '12.5' : '11.5'} fontWeight={isHov ? '700' : '400'} fontFamily={FONT}
              textAnchor={lp.x < cx - 8 ? 'end' : lp.x > cx + 8 ? 'start' : 'middle'}
              dominantBaseline={lp.y < cy - 8 ? 'auto' : lp.y > cy + 8 ? 'hanging' : 'middle'}
              style={{ transition: 'fill 150ms ease, font-size 150ms ease' }}>
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Dimension bar ─────────────────────────────────────────────────────────────
function DimBar({
  dim, compMode, isHovered, isPulse, anyHovered, onHover,
}: {
  dim: Dim
  compMode: CompMode
  isHovered: boolean
  isPulse: boolean
  anyHovered: boolean
  onHover: (k: DimKey | null) => void
}) {
  const benchVal = compMode === 'role' ? dim.roleTarget : compMode === 'shortlist' ? dim.shortlistAvg : dim.teamAvg
  const delta = dim.score - benchVal
  const isTension = delta < 0
  const isStrong  = delta >= 15
  const dc = isPulse ? AMBER : isTension ? AMBER : isStrong ? GREEN : 'rgba(58,168,104,0.65)'
  const dimmed = anyHovered && !isHovered && !isPulse

  return (
    <div
      onMouseEnter={() => onHover(dim.key)}
      onMouseLeave={() => onHover(null)}
      style={{
        padding: '8px 10px', margin: '0 -10px',
        borderRadius: 7,
        background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderLeft: isHovered ? `2px solid ${isTension ? AMBER : BLUE}40` : '2px solid transparent',
        opacity: dimmed ? 0.3 : 1,
        transition: 'background 150ms ease, opacity 150ms ease, border-color 150ms ease',
        cursor: 'default',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{
          fontSize: isTension || isPulse ? 13.5 : 13,
          fontWeight: isTension || isPulse ? 700 : isHovered ? 600 : 500,
          color: isTension ? AMBER : isPulse ? AMBER : isHovered ? TEXT : 'rgba(238,236,230,0.6)',
          letterSpacing: '-0.01em',
          transition: 'color 150ms ease',
        }}>
          {dim.label}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', fontFamily: CONDENSED }}>{dim.score}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: dc, minWidth: 30,
            fontFamily: CONDENSED, letterSpacing: '0.01em',
            transition: 'color 200ms ease',
          }}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${dim.score}%`, borderRadius: 2,
          background: isTension ? `linear-gradient(90deg, ${AMBER}90, ${AMBER})` : `linear-gradient(90deg, ${BLUE}90, ${BLUE})`,
          transition: 'width 300ms ease',
        }}/>
        {/* Benchmark tick */}
        <div style={{
          position: 'absolute', top: -4, width: 1.5, height: 11,
          left: `${benchVal}%`, background: 'rgba(255,255,255,0.4)', borderRadius: 1,
          transition: 'left 320ms ease',
        }}/>
      </div>
      {isHovered && (
        <p style={{
          margin: '9px 0 2px', fontSize: 12, color: 'rgba(238,236,230,0.5)', lineHeight: 1.6,
          animation: 'fadeSlideUp 160ms ease forwards',
        }}>{dim.impact}</p>
      )}
    </div>
  )
}

// ── Page component ────────────────────────────────────────────────────────────
export default function SampleReportPage() {
  const [phase,          setPhase]          = useState(0)
  const [compMode,       setCompMode]       = useState<CompMode>('role')
  const [hoveredDim,     setHoveredDim]     = useState<DimKey | null>(null)
  const [hoveredTeam,    setHoveredTeam]    = useState<string | null>(null)
  const [hoveredQ,       setHoveredQ]       = useState<number | null>(null)
  const [pulseDim,       setPulseDim]       = useState<DimKey | null>(null)
  const [scoreAnimate,   setScoreAnimate]   = useState(false)
  const [stickyVisible,  setStickyVisible]  = useState(false)
  const [activeAct,      setActiveAct]      = useState(0)
  const hasEntered   = useRef(false)
  const heroRef      = useRef<HTMLElement>(null)
  const actRefs      = useRef<(HTMLElement | null)[]>([null, null, null, null, null])
  const containerRef = useRef<HTMLDivElement>(null)

  // Entrance sequence
  useEffect(() => {
    if (hasEntered.current) return
    hasEntered.current = true
    const key = 'veltro_sr_entered'
    if (sessionStorage.getItem(key)) { setPhase(4); return }
    sessionStorage.setItem(key, '1')
    setTimeout(() => setPhase(1), 60)
    setTimeout(() => setPhase(2), 320)
    setTimeout(() => setPhase(3), 700)
    setTimeout(() => { setPhase(4); setScoreAnimate(true) }, 1350)
    setTimeout(() => setPulseDim('decisionSpeed'), 1700)
    setTimeout(() => setPulseDim(null), 2400)
  }, [])

  // Sticky header
  useEffect(() => {
    const el = heroRef.current; if (!el) return
    const check = () => setStickyVisible(el.getBoundingClientRect().bottom < 80)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  // Active act tracking
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = actRefs.current.indexOf(entry.target as HTMLElement)
          if (idx >= 0) setActiveAct(idx)
        }
      })
    }, { threshold: 0.3 })
    actRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Effective hovered dim (bars > team > question)
  const effectiveDim: DimKey | null = (() => {
    if (hoveredDim) return hoveredDim
    if (hoveredTeam) {
      const t = TEAM_DYNAMICS.find(t => t.role === hoveredTeam)
      return t ? t.alignedDims[0] : null
    }
    if (hoveredQ !== null) {
      return INTERVIEW_PROBES[hoveredQ]?.dim ?? null
    }
    return null
  })()

  const anyHov = effectiveDim !== null
  const largestDelta = getLargestDelta(compMode)

  const setActRef = useCallback((el: HTMLElement | null, idx: number) => {
    actRefs.current[idx] = el
  }, [])

  // Phase helpers
  const p1: React.CSSProperties = {
    opacity: phase >= 1 ? 1 : 0,
    transform: phase >= 1 ? 'none' : 'translateY(10px)',
    transition: 'opacity 550ms ease, transform 550ms ease',
  }
  const p2 = (delay = 0): React.CSSProperties => ({
    opacity: phase >= 2 ? 1 : 0,
    transform: phase >= 2 ? 'none' : 'translateY(7px)',
    transition: `opacity 450ms ease ${delay}ms, transform 450ms ease ${delay}ms`,
  })
  const p3 = (delay = 0): React.CSSProperties => ({
    opacity: phase >= 3 ? 1 : 0,
    transform: phase >= 3 ? 'none' : 'translateY(5px)',
    transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(5px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes stickyIn {
          from { opacity: 0; transform: translateY(-10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes pulseRing {
          0%   { opacity: 0.6; transform: scale(1) }
          100% { opacity: 0; transform: scale(2.2) }
        }
        .sr-root-enter {
          opacity: 0; transform: scale(0.988) translateY(10px);
          transition: opacity 600ms ease, transform 600ms ease;
        }
        .sr-root-enter.sr-phase1 { opacity: 1; transform: none; }
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; }
          .sr-banner, .sr-sticky { display: none !important; }
        }
        @media (max-width: 900px) {
          .rpt-hero-grid  { grid-template-columns: 1fr !important; }
          .rpt-two-col    { grid-template-columns: 1fr !important; }
          .rpt-proof-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .rpt-proof-grid > div:last-child { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px !important; }
          .rpt-hero-grid > div:last-child  { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px !important; }
        }
        .team-row { border-radius: 8px; transition: background 150ms ease; }
        .team-row:hover { background: rgba(255,255,255,0.025) !important; }
        .q-row { border-radius: 8px; transition: background 150ms ease; }
        .q-row:hover { background: rgba(255,255,255,0.02) !important; }
        .comp-btn { border: none; background: none; cursor: pointer; }
        .act-section { }
      `}</style>

      {/* ── Document identity rail ────────────────────────────────────────────── */}
      <div style={{
        height: 38, padding: '0 28px', background: BG,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
            Veltro
          </span>
          <span style={{ width: 1, height: 13, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
            Candidate Recommendation Report
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Prepared for client · Mar 14, 2026
        </span>
      </div>

      {/* ── Demo banner ──────────────────────────────────────────────────────── */}
      <div className="sr-banner" style={{
        position: 'sticky', top: 36, zIndex: 55,
        background: 'rgba(37,99,235,0.08)', borderBottom: '1px solid rgba(37,99,235,0.15)',
        padding: '9px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, backdropFilter: 'blur(12px)',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: BLUE }}>Sample report</span>
          {' — '}this is what your client receives for every candidate assessed.
        </p>
        <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
          flexShrink: 0, height: 30, padding: '0 16px', borderRadius: 8,
          background: BLUE, color: '#FFF', fontSize: 12, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>Request a walkthrough</a>
      </div>

      {/* ── Sticky executive header ───────────────────────────────────────────── */}
      {stickyVisible && (
        <div className="sr-sticky" style={{
          position: 'fixed', top: 36, left: 0, right: 0, zIndex: 50,
          height: 52, padding: '0 28px',
          background: 'rgba(8,8,8,0.96)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          animation: 'stickyIn 180ms ease forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Marcus Thompson</span>
            <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Strong Hire</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(238,236,230,0.35)', fontFamily: CONDENSED }}>93</span>
          </div>
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {(['role', 'shortlist', 'team'] as CompMode[]).map(m => (
              <button key={m} className="comp-btn" onClick={() => setCompMode(m)} style={{
                height: 26, padding: '0 11px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                letterSpacing: '0.04em', color: compMode === m ? TEXT : 'rgba(255,255,255,0.28)',
                background: compMode === m ? 'rgba(255,255,255,0.07)' : 'transparent',
                transition: 'background 200ms ease, color 200ms ease',
              }}>
                {COMP_LABELS[m]}
              </button>
            ))}
          </div>
          <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
            flexShrink: 0, height: 28, padding: '0 14px', borderRadius: 7,
            background: BLUE, color: '#FFF', fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}>Request a walkthrough</a>
        </div>
      )}

      <main ref={containerRef} style={{ minHeight: '100svh', background: BG, color: TEXT, fontFamily: FONT }}>
        <div
          className={`sr-root-enter${phase >= 1 ? ' sr-phase1' : ''}`}
          style={{
            maxWidth: 'min(980px, calc(100vw - clamp(40px, 8vw, 160px)))',
            margin: '0 auto',
            padding: 'clamp(48px, 7vh, 72px) clamp(16px, 3vw, 24px) clamp(72px, 10vh, 112px)',
          }}>

          {/* ── Report identity header ─────────────────────────────────────── */}
          <header ref={heroRef} style={{ textAlign: 'center', marginBottom: 60, ...p1 }}>
            <p style={{
              margin: '0 0 20px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(238,236,230,0.18)', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
              Candidate Recommendation Report
              <span style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
            </p>
            <h1 style={{
              margin: '0 0 10px',
              fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.0,
              letterSpacing: '-0.035em', fontWeight: 800, color: TEXT, fontFamily: CONDENSED,
            }}>
              Marcus Thompson
            </h1>
            <p style={{
              margin: '0 0 18px', fontSize: 13, color: 'rgba(238,236,230,0.32)', letterSpacing: '0.01em',
            }}>
              Superintendent · Gilbane Construction
            </p>
            {/* Verdict pill — visible immediately */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              background: 'rgba(58,168,104,0.06)', border: '1px solid rgba(58,168,104,0.18)',
              borderRadius: 100, padding: '8px 20px', marginBottom: 16,
            }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: GREEN, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: CONDENSED }}>
                Strong Hire
              </span>
              <span style={{ width: 1, height: 14, background: 'rgba(58,168,104,0.25)' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: GREEN, fontFamily: CONDENSED }}>93</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.04em' }}>
              Assessment completed Mar 14, 2026 · Report ID a4f2c8d1
            </p>
          </header>

          {/* ══════════════════════════════════════════════════════════════════
              ACT 1 — VERDICT
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={el => setActRef(el, 0)}
            className="act-section"
            style={{ marginBottom: 0, ...p2(0) }}
            aria-label="Act 1: Verdict"
          >
            <ActTag n={1} title="Verdict" />

            <div style={{
              background: SURFACE,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 'clamp(28px, 4vw, 44px)',
            }}>
              <div className="rpt-hero-grid" style={{
                display: 'grid', gridTemplateColumns: '160px minmax(0,1fr)', gap: 'clamp(28px, 5vw, 52px)', alignItems: 'start',
              }}>

                {/* Score + verdict column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                  <div>
                    <Label text="Fit Score" />
                    <div style={{ marginTop: 12 }}>
                      <ScoreRing score={93} color={GREEN} animate={scoreAnimate} size={148} />
                    </div>
                  </div>
                  <div>
                    <p style={{
                      margin: '0 0 3px', fontSize: 26, fontWeight: 900, color: GREEN,
                      lineHeight: 1.0, fontFamily: CONDENSED, textTransform: 'uppercase', letterSpacing: '0.02em',
                    }}>
                      Strong Hire
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                      Decision confidence: High
                    </p>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 7, padding: '5px 11px',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>Pioneer</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>archetype</span>
                  </div>
                </div>

                {/* Verdict detail column */}
                <div style={{ borderLeft: `1px solid ${DIV}`, paddingLeft: 'clamp(24px, 4vw, 44px)', display: 'flex', flexDirection: 'column', gap: 32 }}>

                  {/* Primary tension block */}
                  <div style={{
                    borderLeft: `3px solid ${AMBER}`,
                    background: 'rgba(200,168,50,0.03)', borderRadius: '0 10px 10px 0', padding: '20px 24px',
                  }}>
                    <p style={{ margin: '0 0 7px', fontSize: 10, fontWeight: 700, color: 'rgba(200,168,50,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      Primary Tension
                    </p>
                    <p style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
                      Decision Speed vs. Collaboration
                    </p>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                      Marcus decides before the room is ready. In field leadership, that&apos;s an asset. In cross-functional environments, it&apos;s the risk.
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <Label text="Recommendation" />
                    <p style={{ margin: '11px 0 0', fontSize: 15, lineHeight: 1.75, color: 'rgba(238,236,230,0.52)', fontWeight: 400, maxWidth: 560 }}>
                      Marcus fits this role. Decisive under pressure, high execution drive, ownership without prompting — that&apos;s what field leadership demands. Collaboration is the only flag: below benchmark, worth probing, not a disqualifier.
                    </p>
                  </div>

                  {/* Three stats */}
                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Dimensions above', value: '4 / 5', color: GREEN },
                      { label: 'Largest advantage', value: '+21 Dec. Speed', color: BLUE },
                      { label: 'Only shortfall', value: 'Collaboration −3', color: AMBER },
                    ].map(stat => (
                      <div key={stat.label}>
                        <p style={{ margin: '0 0 3px', fontSize: 9, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</p>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: stat.color, fontFamily: CONDENSED, letterSpacing: '-0.01em' }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 2 — WHY
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={el => setActRef(el, 1)}
            className="act-section"
            style={{ marginBottom: 0, ...p3(0) }}
            aria-label="Act 2: Why"
          >
            <ActTag n={2} title="The Analysis" />

            <div style={{
              background: SURFACE,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 'clamp(28px, 4vw, 44px)',
            }}>
              {/* Section header + toggle */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                <div>
                  <Label text="Signal Profile" />
                  <p style={{ margin: '7px 0 0', fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
                    Five dimensions. One tension.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: 2 }}>
                    {(['role', 'shortlist', 'team'] as CompMode[]).map(m => (
                      <button key={m} className="comp-btn" onClick={() => setCompMode(m)} style={{
                        height: 28, padding: '0 13px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                        letterSpacing: '0.03em', color: compMode === m ? TEXT : 'rgba(255,255,255,0.3)',
                        background: compMode === m ? 'rgba(255,255,255,0.09)' : 'transparent',
                        transition: 'background 200ms ease, color 200ms ease',
                      }}>
                        {COMP_LABELS[m]}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.28)', textAlign: 'right' }}>
                    Largest delta {compMode === 'role' ? 'vs role' : compMode === 'shortlist' ? 'vs shortlist' : 'vs team'}:{' '}
                    <span style={{ color: 'rgba(238,236,230,0.6)', fontWeight: 700 }}>
                      {largestDelta.label} ({largestDelta.sign}{largestDelta.delta})
                    </span>
                  </p>
                </div>
              </div>

              <div className="rpt-proof-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1.15fr) minmax(240px,0.85fr)', gap: 'clamp(24px, 4vw, 48px)' }}>

                {/* Pentagon + operating style */}
                <div>
                  <PentagonRadar
                    compMode={compMode}
                    hoveredDim={effectiveDim}
                    onHoverDim={setHoveredDim}
                    animate={phase >= 3}
                    pulseDim={pulseDim}
                  />

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 16, height: 2, background: BLUE, borderRadius: 1 }}/>
                      <span style={{ fontSize: 11, color: 'rgba(238,236,230,0.38)' }}>Marcus Thompson</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 16, height: 2, borderRadius: 1, backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 5px, transparent 5px 9px)' }}/>
                      <span style={{ fontSize: 11, color: 'rgba(238,236,230,0.38)' }}>
                        {compMode === 'role' ? 'Role benchmark' : compMode === 'shortlist' ? 'Shortlist avg.' : 'Team avg.'}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, textAlign: 'center' }}>
                    Hover a dimension to see details. Outperforms on 4 of 5 — one shortfall.
                  </p>

                  {/* Operating style */}
                  <div style={{ marginTop: 26, paddingTop: 22, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                      }}>Operating Style</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: TEXT, letterSpacing: '-0.03em', fontFamily: CONDENSED }}>Pioneer</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' }}>
                        Moves first. Asks forgiveness, not permission.
                      </span>
                    </div>
                    <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.72, color: 'rgba(238,236,230,0.44)' }}>
                      Drives outcomes without waiting for alignment. In fast-moving environments this is an asset — in consensus-driven ones, it creates friction. Most effective when scope is clear and authority belongs to one person.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {[
                        'Begins execution before alignment is complete',
                        'Absorbs ambiguity without stalling',
                        'Holds accountability personally, not collectively',
                        'Deprioritizes process when momentum is available',
                      ].map(trait => (
                        <div key={trait} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 6 }}/>
                          <span style={{ fontSize: 12, color: 'rgba(238,236,230,0.38)', lineHeight: 1.55 }}>{trait}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dimension bars */}
                <div style={{ borderLeft: `1px solid ${DIV}`, paddingLeft: 'clamp(18px, 3vw, 32px)' }}>
                  <div style={{ marginBottom: 18 }}>
                    <Label text="Dimension Breakdown" />
                    <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
                      Bar = candidate · Tick = {compMode === 'role' ? 'role target' : compMode === 'shortlist' ? 'shortlist avg' : 'team avg'} · Δ = delta
                    </p>
                  </div>
                  {DIMENSIONS.map(dim => (
                    <DimBar
                      key={dim.key}
                      dim={dim}
                      compMode={compMode}
                      isHovered={effectiveDim === dim.key}
                      isPulse={pulseDim === dim.key}
                      anyHovered={anyHov}
                      onHover={setHoveredDim}
                    />
                  ))}
                  <p style={{ margin: '18px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.16)', lineHeight: 1.55, fontStyle: 'italic' }}>
                    Hover any dimension above to connect it to the radar.
                  </p>
                </div>

              </div>
            </div>
          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 3 — WHERE IT WORKS / BREAKS
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={el => setActRef(el, 2)}
            className="act-section"
            style={{ ...p3(60) }}
            aria-label="Act 3: Where it works / breaks"
          >
            <ActTag n={3} title="Fit Conditions" />

            <p style={{ margin: '0 0 28px', fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
              Where he wins — and where the risk lives
            </p>

            {/* Hire If / Pass If */}
            <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

              <div style={{
                background: SURFACE, border: '1px solid rgba(58,168,104,0.12)',
                borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }}/>
                  <Label text="Hire If" />
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    'The environment rewards pace over consensus.',
                    'Scope is clear and accountability belongs to one person.',
                    'The client wants forward motion, not deliberation.',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 9 }}/>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: SURFACE, border: '1px solid rgba(224,90,58,0.10)',
                borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0 }}/>
                  <Label text="Pass If" />
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    'Success requires stakeholder buy-in before decisions.',
                    'The hiring manager expects consultation before direction changes.',
                    'The team runs on shared authority — no one holds the call.',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 9 }}/>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: TEXT }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Team Dynamics */}
            <div style={{
              background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)',
            }}>
              <div style={{ marginBottom: 22 }}>
                <Label text="Team Dynamics" />
                <p style={{ margin: '7px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.24)', lineHeight: 1.5 }}>
                  Behavioral alignment with key stakeholders. Hover a row — the pentagon will highlight the relevant dimensions.
                </p>
              </div>

              {TEAM_DYNAMICS.map((person, i) => {
                const isTeamHov = hoveredTeam === person.role
                return (
                  <div
                    key={person.role}
                    className="team-row"
                    onMouseEnter={() => setHoveredTeam(person.role)}
                    onMouseLeave={() => setHoveredTeam(null)}
                    style={{
                      display: 'grid', gridTemplateColumns: '148px 1fr',
                      gap: 20, alignItems: 'start',
                      padding: '15px 10px',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.045)' : 'none',
                    }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{person.role}</p>
                      {person.subtitle
                        ? <p style={{ margin: '0 0 9px', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{person.subtitle}</p>
                        : <div style={{ marginBottom: 9 }} />
                      }
                      <DotRow filled={person.dots} color={person.dotColor} />
                      {isTeamHov && (
                        <p style={{ margin: '8px 0 0', fontSize: 10, color: FAINT, letterSpacing: '0.07em', textTransform: 'uppercase', animation: 'fadeSlideUp 140ms ease forwards' }}>
                          {person.alignedDims.map(k => DIMENSIONS.find(d => d.key === k)?.label).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 700, color: person.dotColor as string, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                        {person.alignment}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: SUB, lineHeight: 1.6 }}>
                        {person.implication}
                      </p>
                    </div>
                  </div>
                )
              })}

              <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.055)' }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(238,236,230,0.36)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  Strong alignment with CEO. Structural friction with Operating Partner on pace. Primary risk is process-level, not relationship-level.
                </p>
              </div>
            </div>

          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 4 — HOW TO VALIDATE
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={el => setActRef(el, 3)}
            className="act-section"
            aria-label="Act 4: How to validate"
          >
            <ActTag n={4} title="Pressure-Test" />

            <p style={{ margin: '0 0 28px', fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: CONDENSED }}>
              What to confirm before the final round
            </p>

            {/* Dimension signal summary */}
            <div style={{
              background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 14,
            }}>
              <Label text="Signal Summary" />
              <div style={{ marginTop: 18, display: 'grid', gap: 0 }}>
                {[
                  { label: 'Decision Speed +21', note: 'Largest delta. Moves significantly faster than the role requires. Asset in field environments — friction anywhere that runs on consensus.', tension: false, strong: true },
                  { label: 'Adaptability +15',   note: 'Well above benchmark. Handles shifting scope and ambiguity without losing execution edge.', tension: false, strong: true },
                  { label: 'Execution +8',        note: 'Above benchmark. Pattern-matches field leadership demands — moves forward, does not wait.', tension: false, strong: false },
                  { label: 'Ownership +1',        note: 'Meets the bar but does not exceed it. Watch in roles with high accountability stakes.', tension: false, strong: false },
                  { label: 'Collaboration −3',    note: 'Only dimension below benchmark. Within tolerance. Probe it in roles with cross-functional dependency. This is the tension.', tension: true, strong: false },
                ].map((item, i) => (
                  <div key={item.label} style={{
                    paddingTop: i > 0 ? 16 : 0, paddingBottom: 16,
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.045)' : 'none',
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 2, flexShrink: 0, alignSelf: 'stretch', minHeight: 24, borderRadius: 2,
                      background: item.tension ? AMBER : item.strong ? GREEN : 'rgba(255,255,255,0.1)',
                      marginTop: 2,
                    }}/>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: item.tension ? AMBER : TEXT, letterSpacing: '-0.01em', fontFamily: CONDENSED }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: SUB }}>{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview probes */}
            <div style={{
              background: SURFACE, border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 'clamp(20px, 3vw, 28px)',
            }}>
              <div style={{ marginBottom: 24 }}>
                <Label text="Interview Probes" />
                <p style={{ margin: '8px 0 0', fontSize: 13, color: SUB, lineHeight: 1.65, maxWidth: 540 }}>
                  Three questions derived directly from the signal profile. Each targets a specific dimension and risk. Ask them in order.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 0 }}>
                {INTERVIEW_PROBES.map((probe, i) => {
                  const isHov = hoveredQ === i
                  return (
                    <div
                      key={i}
                      className="q-row"
                      onMouseEnter={() => { setHoveredQ(i); setHoveredDim(probe.dim) }}
                      onMouseLeave={() => { setHoveredQ(null); setHoveredDim(null) }}
                      style={{
                        display: 'flex', gap: 20, alignItems: 'flex-start',
                        padding: `${i > 0 ? 22 : 10}px 10px 22px`,
                        borderBottom: i < INTERVIEW_PROBES.length - 1 ? '1px solid rgba(255,255,255,0.045)' : 'none',
                        borderLeft: isHov ? `2px solid ${probe.critical ? AMBER : BLUE}50` : '2px solid transparent',
                        borderRadius: 8,
                        background: isHov ? 'rgba(255,255,255,0.018)' : 'transparent',
                        transition: 'background 150ms ease, border-color 150ms ease',
                        cursor: 'default',
                      }}>
                      <span style={{
                        fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900,
                        color: isHov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        lineHeight: 1, flexShrink: 0, letterSpacing: '-0.04em',
                        fontVariantNumeric: 'tabular-nums', minWidth: 36, fontFamily: CONDENSED,
                        transition: 'color 150ms ease',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.72, color: isHov ? TEXT : 'rgba(238,236,230,0.85)', fontStyle: 'italic', transition: 'color 150ms ease' }}>
                          &ldquo;{probe.question}&rdquo;
                        </p>
                        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: FAINT }}>
                            Tests: <span style={{ color: isHov ? 'rgba(238,236,230,0.7)' : 'rgba(238,236,230,0.42)', fontWeight: 600, transition: 'color 150ms ease' }}>{probe.tests}</span>
                          </span>
                          <span style={{ fontSize: 11, color: FAINT }}>
                            Risk: <span style={{ color: isHov ? AMBER : 'rgba(200,168,50,0.45)', fontWeight: 600, transition: 'color 150ms ease' }}>{probe.risk}</span>
                          </span>
                          {probe.critical && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: isHov ? 'rgba(224,90,58,0.9)' : 'rgba(224,90,58,0.38)', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 150ms ease' }}>
                              Would change rec if weak
                            </span>
                          )}
                        </div>
                        {isHov && (
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(238,236,230,0.38)', lineHeight: 1.6, animation: 'fadeSlideUp 150ms ease forwards' }}
                            dangerouslySetInnerHTML={{ __html: probe.rationale }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </section>

          <ActBreak />

          {/* ══════════════════════════════════════════════════════════════════
              ACT 5 — DECISION SUPPORT
          ══════════════════════════════════════════════════════════════════ */}
          <section
            ref={el => setActRef(el, 4)}
            className="act-section"
            aria-label="Act 5: Decision support"
          >
            <ActTag n={5} title="Decision Support" />

            {/* Metadata rail */}
            <div style={{
              background: SURFACE2, border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10, marginBottom: 14, padding: '14px 22px',
            }}>
              <div className="rpt-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px 24px' }}>
                {[
                  '94 behavioral signals · 6-minute assessment',
                  'Benchmark confidence: High — calibrated shortlist',
                  'Recommendation from structured signal analysis',
                  'Use alongside structured interviews and references',
                ].map(item => (
                  <p key={item} style={{ margin: 0, fontSize: 11, color: 'rgba(238,236,230,0.22)', lineHeight: 1.6 }}>{item}</p>
                ))}
              </div>
            </div>

            {/* CTA block */}
            <div style={{
              border: '1px solid rgba(37,99,235,0.14)',
              borderRadius: 14, padding: 'clamp(36px, 5vw, 56px) clamp(24px, 4vw, 44px)',
              textAlign: 'center',
              background: `linear-gradient(135deg, rgba(37,99,235,0.06) 0%, ${SURFACE} 55%)`,
            }}>
              <p style={{ margin: '0 0 10px', fontSize: 10, color: FAINT, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                Every candidate. Every search.
              </p>
              <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.1, fontFamily: CONDENSED }}>
                One additional step. A defensible recommendation.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(238,236,230,0.44)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 32px' }}>
                Six minutes of structured assessment per candidate. A precise instrument your client can hold. Delivered at shortlist.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="mailto:team@veltro.ai?subject=Veltro%20Walkthrough%20Request" style={{
                  height: 46, padding: '0 28px', borderRadius: 10,
                  background: '#FFF', color: BG,
                  fontSize: 14, fontWeight: 800, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                  letterSpacing: '-0.02em',
                }}>Request a walkthrough</a>
                <Link href="/" style={{
                  height: 46, padding: '0 24px', borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.1)`, color: 'rgba(238,236,230,0.45)',
                  fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                }}>Back to Veltro</Link>
              </div>
            </div>

          </section>

          {/* ── Footer ───────────────────────────────────────────────────────── */}
          <footer style={{ paddingTop: 40, marginTop: 10 }}>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.045)', marginBottom: 20 }}/>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 8, alignItems: 'center' }}>
              {['Report ID: a4f2c8d1', 'Assessment completed Mar 14, 2026'].map((item, i) => (
                <span key={item} style={{ fontSize: 11, color: SUB }}>
                  {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
                  {item}
                </span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.65, color: FAINT, maxWidth: 640 }}>
              Prepared by Veltro · veltro.ai. Recommendation generated from calibrated signal analysis. Intended for use alongside structured interviews and reference checks. Not a substitute for professional judgment.
            </p>
          </footer>

        </div>
      </main>
    </>
  )
}
