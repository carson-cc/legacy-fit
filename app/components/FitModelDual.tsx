'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FitModelScores } from './FitModel'

interface FitModelDualProps {
  candidateScores: FitModelScores
  benchmarkScores: FitModelScores
  candidateLabel?: string
  benchmarkLabel?: string
  size?: number
  variant?: 'dark' | 'light'
  animated?: boolean
  showDeltas?: boolean
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

function polarPoint(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
}

export default function FitModelDual({
  candidateScores,
  benchmarkScores,
  candidateLabel = 'Candidate',
  benchmarkLabel = 'Benchmark',
  size = 320,
  variant = 'dark',
  animated = true,
  showDeltas = false,
}: FitModelDualProps) {
  const [benchmarkProgress, setBenchmarkProgress] = useState(animated ? 0 : 1)
  const [candidateProgress, setCandidateProgress] = useState(animated ? 0 : 1)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!animated) {
      setBenchmarkProgress(1)
      setCandidateProgress(1)
      return
    }
    setBenchmarkProgress(0)
    setCandidateProgress(0)

    const start = performance.now()
    const benchmarkDuration = 150
    const candidateDelay = 300
    const candidateDuration = 200

    const tick = (now: number) => {
      const elapsed = now - start

      // Benchmark phase
      const bt = Math.min(elapsed / benchmarkDuration, 1)
      setBenchmarkProgress(1 - Math.pow(1 - bt, 3))

      // Candidate phase (delayed)
      if (elapsed > candidateDelay) {
        const ct = Math.min((elapsed - candidateDelay) / candidateDuration, 1)
        setCandidateProgress(1 - Math.pow(1 - ct, 3))
      }

      if (elapsed < candidateDelay + candidateDuration) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [candidateScores, benchmarkScores, animated])

  const candidateAxes = useMemo(() => deriveAxes(candidateScores), [candidateScores])
  const benchmarkAxes = useMemo(() => deriveAxes(benchmarkScores), [benchmarkScores])

  const isDark = variant === 'dark'
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.31
  const labelR = size * 0.44
  const rings = [0.22, 0.46, 0.72, 1.0]

  const strokeGrid = isDark ? 'rgba(255,255,255,0.055)' : 'rgba(17,24,39,0.09)'
  const strokeAxis = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(17,24,39,0.06)'
  const labelColor = isDark ? 'rgba(255,255,255,0.34)' : 'rgba(17,24,39,0.48)'

  const benchmarkPoints = AXIS_KEYS.map((key, i) =>
    polarPoint(cx, cy, maxR * benchmarkAxes[key] * benchmarkProgress, i, 5)
  )
  const candidatePoints = AXIS_KEYS.map((key, i) =>
    polarPoint(cx, cy, maxR * candidateAxes[key] * candidateProgress, i, 5)
  )

  const benchmarkPath = pointsToPath(benchmarkPoints)
  const candidatePath = pointsToPath(candidatePoints)

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {rings.map((pct, i) => {
            const ringPoints = Array.from({ length: 5 }, (_, j) => polarPoint(cx, cy, maxR * pct, j, 5))
            return <path key={i} d={pointsToPath(ringPoints)} stroke={strokeGrid} strokeWidth={1} fill="none" />
          })}

          {Array.from({ length: 5 }, (_, i) => {
            const p = polarPoint(cx, cy, maxR, i, 5)
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={strokeAxis} strokeWidth={1} />
          })}

          <path
            d={benchmarkPath}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.15}
            strokeDasharray="3 3"
            fill="none"
          />

          <path d={candidatePath} fill="rgba(37,99,235,0.08)" stroke="none" />
          <path
            d={candidatePath}
            stroke="#2563EB"
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />

          {candidatePoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3.6} fill="#2563EB" opacity={0.9} />
          ))}

          {AXIS_ABBR.map((label, i) => {
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
                fontFamily={font}
                letterSpacing="0.08em"
              >
                {label}
              </text>
            )
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={20} height={2}><line x1={0} y1={1} x2={20} y2={1} stroke="#2563EB" strokeWidth={2} /></svg>
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', fontFamily: font }}>
              {candidateLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={20} height={2}><line x1={0} y1={1} x2={20} y2={1} stroke="rgba(255,255,255,0.25)" strokeWidth={1.15} strokeDasharray="3 3" /></svg>
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', fontFamily: font }}>
              {benchmarkLabel}
            </span>
          </div>
        </div>
      </div>

      {showDeltas && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 48px 48px 56px', gap: 0, fontSize: 11, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
            <span>Axis</span>
            <span style={{ textAlign: 'right' }}>Cand</span>
            <span style={{ textAlign: 'right' }}>Bench</span>
            <span style={{ textAlign: 'right' }}>Delta</span>
          </div>
          {AXIS_KEYS.map((key, i) => {
            const cVal = Math.round(candidateAxes[key] * 100)
            const bVal = Math.round(benchmarkAxes[key] * 100)
            const delta = cVal - bVal
            const deltaColor = delta > 0 ? '#22C55E' : delta < 0 ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')
            const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0'
            return (
              <div
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 48px 48px 56px',
                  gap: 0,
                  fontSize: 12,
                  fontFamily: font,
                  padding: '6px 0',
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', fontWeight: 500 }}>
                  {AXIS_LABELS[i]}
                </span>
                <span style={{ textAlign: 'right', color: isDark ? '#FFFFFF' : '#111827', fontWeight: 600 }}>
                  {cVal}
                </span>
                <span style={{ textAlign: 'right', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', fontWeight: 500 }}>
                  {bVal}
                </span>
                <span style={{ textAlign: 'right', color: deltaColor, fontWeight: 600 }}>
                  {deltaText}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
