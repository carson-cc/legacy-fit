'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface FitModelScores {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

interface FitModelProps {
  scores: FitModelScores
  target?: FitModelScores | null
  benchmarkScores?: FitModelScores | null
  size?: number
  accent?: string
  animated?: boolean
  showLabels?: boolean
  showDeltas?: boolean
  className?: string
  variant?: 'dark' | 'light'
}

type DerivedAxes = {
  execution: number
  ownership: number
  adaptability: number
  collaboration: number
  decisionSpeed: number
}

const AXIS_LABELS = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']
const AXIS_ABBR = ['EXE', 'OWN', 'ADP', 'COL', 'DEC']
const AXIS_KEYS = ['execution', 'ownership', 'adaptability', 'collaboration', 'decisionSpeed'] as const

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function deriveAxes(s: FitModelScores): DerivedAxes {
  return {
    execution: clamp01(s.dominance * 0.58 + s.formality * 0.42),
    ownership: clamp01(s.dominance * 0.72 + s.patience * 0.28),
    adaptability: clamp01(s.extraversion * 0.22 + (1 - s.formality) * 0.58 + (1 - s.patience) * 0.20),
    collaboration: clamp01(s.extraversion * 0.68 + s.patience * 0.32),
    decisionSpeed: clamp01(s.dominance * 0.54 + (1 - s.patience) * 0.46),
  }
}

function polarPoint(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
}

function FitModelBase({
  scores,
  target,
  benchmarkScores,
  size = 320,
  accent = '#2563EB',
  animated = true,
  showLabels = true,
  showDeltas = false,
  className = '',
  variant = 'dark',
}: FitModelProps) {
  const [progress, setProgress] = useState(animated ? 0 : 1)
  const [deltaVisible, setDeltaVisible] = useState(!animated)
  const rafRef = useRef<number>(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!animated) {
      setProgress(1)
      setDeltaVisible(true)
      return
    }
    // Only animate once per component lifecycle — prevents re-triggering on scroll re-renders
    if (hasAnimated.current) return
    hasAnimated.current = true

    setProgress(0)
    setDeltaVisible(false)
    const start = performance.now()
    const duration = 260

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setDeltaVisible(true), 80)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animated]) // eslint-disable-line react-hooks/exhaustive-deps

  const axes = useMemo(() => deriveAxes(scores), [scores])
  const targetAxes = useMemo(() => (target ? deriveAxes(target) : null), [target])
  const benchmarkAxes = useMemo(() => (benchmarkScores ? deriveAxes(benchmarkScores) : null), [benchmarkScores])

  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.31
  const labelR = size * 0.44
  const rings = [0.22, 0.46, 0.72, 1.0]

  const strokeGrid = variant === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(17,24,39,0.09)'
  const strokeAxis = variant === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(17,24,39,0.06)'
  const labelColor = variant === 'dark' ? 'rgba(255,255,255,0.34)' : 'rgba(17,24,39,0.48)'
  const panelGlow = variant === 'dark' ? `${accent}22` : `${accent}16`
  const fillColor = variant === 'dark' ? `${accent}10` : `${accent}12`
  const targetStroke = variant === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(17,24,39,0.28)'

  const points = AXIS_KEYS.map((key, i) => {
    const val = axes[key] * progress
    return polarPoint(cx, cy, maxR * val, i, 5)
  })
  const polyPath = pointsToPath(points)

  const targetPoints = targetAxes
    ? AXIS_KEYS.map((key, i) => polarPoint(cx, cy, maxR * targetAxes[key], i, 5))
    : null
  const targetPath = targetPoints ? pointsToPath(targetPoints) : ''

  const benchmarkPoints = benchmarkAxes
    ? AXIS_KEYS.map((key, i) => polarPoint(cx, cy, maxR * benchmarkAxes[key], i, 5))
    : null
  const benchmarkPath = benchmarkPoints ? pointsToPath(benchmarkPoints) : ''

  const perimeter = useMemo(() => {
    let total = 0
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]
      const b = points[(i + 1) % points.length]
      total += Math.hypot(b.x - a.x, b.y - a.y)
    }
    return total
  }, [polyPath])

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <filter id={`fit-model-glow-${variant}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`fit-model-radial-${variant}`} cx="50%" cy="36%" r="64%">
            <stop offset="0%" stopColor={panelGlow} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={maxR * 1.15} fill={`url(#fit-model-radial-${variant})`} />

        {rings.map((pct, i) => {
          const ringPoints = Array.from({ length: 5 }, (_, j) => polarPoint(cx, cy, maxR * pct, j, 5))
          return <path key={i} d={pointsToPath(ringPoints)} stroke={strokeGrid} strokeWidth={1} fill="none" />
        })}

        {Array.from({ length: 5 }, (_, i) => {
          const p = polarPoint(cx, cy, maxR, i, 5)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={strokeAxis} strokeWidth={1} />
        })}

        {targetPath && (
          <path
            d={targetPath}
            stroke={targetStroke}
            strokeWidth={1.15}
            strokeDasharray="5 5"
            fill="none"
            opacity={0.9}
          />
        )}

        {benchmarkPath && (
          <path
            d={benchmarkPath}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.15}
            strokeDasharray="3 3"
            fill="none"
          />
        )}

        <path d={polyPath} fill="rgba(37,99,235,0.08)" stroke="none" opacity={0.95} />
        <path
          d={polyPath}
          stroke={accent}
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          filter={`url(#fit-model-glow-${variant})`}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          style={{ transition: animated ? 'stroke-dashoffset 260ms ease-out' : undefined }}
        />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.6} fill={accent} opacity={0.9} />
        ))}

        {showLabels &&
          AXIS_ABBR.map((label, i) => {
            const p = polarPoint(cx, cy, labelR, i, 5)
            const anchor = p.x < cx - 8 ? 'end' : p.x > cx + 8 ? 'start' : 'middle'
            return (
              <text
                key={i}
                x={p.x}
                y={p.y + (p.y < cy ? -2 : 5)}
                textAnchor={anchor}
                fill={labelColor}
                fontSize="10"
                fontWeight="600"
                fontFamily="Inter, SF Pro Display, system-ui, sans-serif"
                letterSpacing="0.08em"
              >
                {label}
              </text>
            )
          })}

        {showDeltas && benchmarkAxes && deltaVisible &&
          AXIS_KEYS.map((key, i) => {
            const candidateVal = axes[key]
            const benchmarkVal = benchmarkAxes[key]
            const delta = Math.round((candidateVal - benchmarkVal) * 100)
            if (delta === 0) return null
            const deltaColor = delta > 0 ? '#22C55E' : '#EF4444'
            const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`
            const p = polarPoint(cx, cy, maxR * candidateVal * progress + 14, i, 5)
            return (
              <text
                key={`delta-${i}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={deltaColor}
                fontSize="10"
                fontWeight="600"
                fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
                opacity={deltaVisible ? 1 : 0}
                style={{ transition: 'opacity 240ms ease-out' }}
              >
                {deltaLabel}
              </text>
            )
          })}
      </svg>
    </div>
  )
}

export function FitModel(props: FitModelProps) {
  return <FitModelBase {...props} variant={props.variant ?? 'dark'} />
}

export function FitModelLight(props: FitModelProps) {
  return <FitModelBase {...props} variant="light" />
}

export function deriveFitModelAxes(scores: FitModelScores) {
  return deriveAxes(scores)
}
