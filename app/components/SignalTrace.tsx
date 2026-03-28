'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FitModelScores } from './FitModel'

interface SignalTraceProps {
  candidateScores: FitModelScores
  benchmarkScores?: FitModelScores
  width?: number
  variant?: 'dark' | 'light'
  animated?: boolean
}

const AXIS_LABELS = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']
const AXIS_ABBR = ['EXE', 'OWN', 'ADP', 'COL', 'DEC']
const AXIS_KEYS = ['execution', 'ownership', 'adaptability', 'collaboration', 'decisionSpeed'] as const

type DerivedAxes = {
  execution: number
  ownership: number
  adaptability: number
  collaboration: number
  decisionSpeed: number
}

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

// Seeded PRNG for deterministic waveforms
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateWaveform(value: number, numPoints: number, seed: number): number[] {
  const rng = seededRandom(Math.floor(seed * 10000) + 1)
  const points: number[] = []

  for (let i = 0; i < numPoints; i++) {
    const noise = (rng() - 0.5) * 0.6

    let base: number
    if (value > 0.75) {
      // High values: mostly above midpoint with occasional dips
      base = 0.3 + value * 0.4 + noise * 0.25
      // Occasional sharp EKG-like peaks
      if (i % 7 === 3) base += 0.15
      if (i % 11 === 5) base -= 0.08
    } else if (value < 0.35) {
      // Low values: mostly below midpoint
      base = value * 0.5 + noise * 0.2
      // Occasional small rises
      if (i % 9 === 4) base += 0.1
      if (i % 6 === 2) base -= 0.12
    } else {
      // Mid values: oscillate around midpoint
      base = 0.35 + (value - 0.35) * 0.6 + noise * 0.3
      if (i % 5 === 2) base += 0.08
      if (i % 7 === 4) base -= 0.08
    }

    points.push(clamp01(base))
  }

  return points
}

function waveformToSvgPath(
  points: number[],
  x0: number,
  traceWidth: number,
  laneTop: number,
  laneHeight: number
): string {
  const step = traceWidth / (points.length - 1)
  return points
    .map((v, i) => {
      const x = x0 + i * step
      const y = laneTop + laneHeight * (1 - v)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function fillAreaPath(
  points: number[],
  benchmarkY: number,
  x0: number,
  traceWidth: number,
  laneTop: number,
  laneHeight: number
): { abovePath: string; belowPath: string } {
  const step = traceWidth / (points.length - 1)
  let aboveSegments: string[] = []
  let belowSegments: string[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const x1 = x0 + i * step
    const x2 = x0 + (i + 1) * step
    const y1 = laneTop + laneHeight * (1 - points[i])
    const y2 = laneTop + laneHeight * (1 - points[i + 1])

    if (y1 <= benchmarkY && y2 <= benchmarkY) {
      aboveSegments.push(`M ${x1} ${benchmarkY} L ${x1} ${y1} L ${x2} ${y2} L ${x2} ${benchmarkY} Z`)
    } else if (y1 >= benchmarkY && y2 >= benchmarkY) {
      belowSegments.push(`M ${x1} ${benchmarkY} L ${x1} ${y1} L ${x2} ${y2} L ${x2} ${benchmarkY} Z`)
    } else {
      // Crosses benchmark line - split
      const ratio = (benchmarkY - y1) / (y2 - y1)
      const xCross = x1 + ratio * (x2 - x1)
      if (y1 < benchmarkY) {
        aboveSegments.push(`M ${x1} ${benchmarkY} L ${x1} ${y1} L ${xCross} ${benchmarkY} Z`)
        belowSegments.push(`M ${xCross} ${benchmarkY} L ${x2} ${y2} L ${x2} ${benchmarkY} Z`)
      } else {
        belowSegments.push(`M ${x1} ${benchmarkY} L ${x1} ${y1} L ${xCross} ${benchmarkY} Z`)
        aboveSegments.push(`M ${xCross} ${benchmarkY} L ${x2} ${y2} L ${x2} ${benchmarkY} Z`)
      }
    }
  }

  return {
    abovePath: aboveSegments.join(' '),
    belowPath: belowSegments.join(' '),
  }
}

export default function SignalTrace({
  candidateScores,
  benchmarkScores,
  width = 600,
  variant = 'dark',
  animated = true,
}: SignalTraceProps) {
  const isDark = variant === 'dark'
  const candidateAxes = useMemo(() => deriveAxes(candidateScores), [candidateScores])
  const benchmarkAxes = useMemo(
    () => (benchmarkScores ? deriveAxes(benchmarkScores) : null),
    [benchmarkScores]
  )

  const laneHeight = 48
  const labelWidth = 60
  const traceX0 = labelWidth + 8
  const traceWidth = width - traceX0 - 8
  const totalHeight = laneHeight * 5
  const numPoints = 40

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
  const mutedColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const benchmarkLineColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'

  const lanes = useMemo(() => {
    return AXIS_KEYS.map((key, i) => {
      const value = candidateAxes[key]
      const benchmarkValue = benchmarkAxes ? benchmarkAxes[key] : 0.5
      const waveform = generateWaveform(value, numPoints, value + i * 0.13)
      const laneTop = i * laneHeight
      const benchmarkY = laneTop + laneHeight * (1 - benchmarkValue)

      const signalPath = waveformToSvgPath(waveform, traceX0, traceWidth, laneTop, laneHeight)
      const { abovePath, belowPath } = fillAreaPath(
        waveform, benchmarkY, traceX0, traceWidth, laneTop, laneHeight
      )

      // Calculate total path length for animation
      let pathLength = 0
      const step = traceWidth / (numPoints - 1)
      for (let j = 0; j < numPoints - 1; j++) {
        const y1 = laneTop + laneHeight * (1 - waveform[j])
        const y2 = laneTop + laneHeight * (1 - waveform[j + 1])
        pathLength += Math.hypot(step, y2 - y1)
      }

      return {
        key,
        label: AXIS_LABELS[i],
        laneTop,
        benchmarkY,
        signalPath,
        abovePath,
        belowPath,
        pathLength,
        value,
        index: i,
      }
    })
  }, [candidateAxes, benchmarkAxes, traceX0, traceWidth])

  const [animProgress, setAnimProgress] = useState<number[]>(
    animated ? [0, 0, 0, 0, 0] : [1, 1, 1, 1, 1]
  )
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!animated) {
      setAnimProgress([1, 1, 1, 1, 1])
      return
    }
    setAnimProgress([0, 0, 0, 0, 0])
    const start = performance.now()
    const laneDuration = 400
    const laneDelay = 80

    const tick = (now: number) => {
      const elapsed = now - start
      const newProgress = lanes.map((_, i) => {
        const laneStart = i * laneDelay
        if (elapsed < laneStart) return 0
        const t = Math.min((elapsed - laneStart) / laneDuration, 1)
        return 1 - Math.pow(1 - t, 3)
      })
      setAnimProgress(newProgress)

      if (elapsed < (lanes.length - 1) * laneDelay + laneDuration) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [candidateScores, benchmarkScores, animated])

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      fill="none"
      style={{ display: 'block', fontFamily: font }}
    >
      {lanes.map((lane, i) => {
        const dashOffset = lane.pathLength * (1 - animProgress[i])
        const aboveOpacity = animProgress[i]
        const belowOpacity = animProgress[i]

        return (
          <g key={lane.key}>
            {/* Lane separator */}
            {i > 0 && (
              <line
                x1={0}
                y1={lane.laneTop}
                x2={width}
                y2={lane.laneTop}
                stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
                strokeWidth={1}
              />
            )}

            {/* Lane label */}
            <text
              x={4}
              y={lane.laneTop + laneHeight / 2}
              dominantBaseline="central"
              fill={mutedColor}
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              {AXIS_ABBR[lane.index]}
            </text>

            {/* Benchmark reference line */}
            <line
              x1={traceX0}
              y1={lane.benchmarkY}
              x2={traceX0 + traceWidth}
              y2={lane.benchmarkY}
              stroke={benchmarkLineColor}
              strokeWidth={1}
            />

            {/* Fill areas */}
            <path
              d={lane.abovePath}
              fill="rgba(34,197,94,0.08)"
              opacity={aboveOpacity}
            />
            <path
              d={lane.belowPath}
              fill="rgba(239,68,68,0.08)"
              opacity={belowOpacity}
            />

            {/* Signal trace line */}
            <path
              d={lane.signalPath}
              stroke={lane.value >= 0.5 ? '#22C55E' : '#EF4444'}
              strokeWidth={1.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={lane.pathLength}
              strokeDasharray={lane.pathLength}
              strokeDashoffset={dashOffset}
            />
          </g>
        )
      })}
    </svg>
  )
}
