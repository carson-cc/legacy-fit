'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  recommendation: 'Strong Hire' | 'Proceed with Caution' | 'Do Not Hire'
  animated?: boolean
  showLabel?: boolean
}

const ringColors: Record<ScoreRingProps['recommendation'], string> = {
  'Strong Hire': '#22C55E',
  'Proceed with Caution': '#EAB308',
  'Do Not Hire': '#EF4444',
}

export default function ScoreRing({
  score,
  size = 120,
  recommendation,
  animated = true,
  showLabel = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)
  const [progress, setProgress] = useState(animated ? 0 : 1)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      setProgress(1)
      return
    }
    setDisplayScore(0)
    setProgress(0)
    const start = performance.now()
    const duration = 500

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(eased * score))
      setProgress(eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [score, animated])

  const color = ringColors[recommendation]
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillPercent = (score / 100) * circumference
  const dashOffset = circumference - fillPercent * progress

  const fontSize = size * 0.28

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: animated ? 'stroke-dashoffset 500ms ease-out' : undefined }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
        >
          {displayScore}
        </text>
      </svg>
      {showLabel && (
        <span
          style={{
            color,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
          }}
        >
          {recommendation}
        </span>
      )}
    </div>
  )
}
