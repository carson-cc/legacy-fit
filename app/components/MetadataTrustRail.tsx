'use client'

interface MetadataTrustRailProps {
  signals?: string[]
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md'
}

const DEFAULT_SIGNALS = [
  'Based on 94 behavioral signals',
  'Role benchmark active',
  'Recommendation generated from calibrated signal analysis',
]

export default function MetadataTrustRail({
  signals = DEFAULT_SIGNALS,
  variant = 'dark',
  size = 'md',
}: MetadataTrustRailProps) {
  const color = variant === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const fontSize = size === 'sm' ? 11 : 12

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      {signals.map((signal, i) => (
        <span key={i} style={{ color, fontSize, lineHeight: '18px', whiteSpace: 'nowrap' }}>
          {signal}
          {i < signals.length - 1 && (
            <span style={{ margin: '0 6px', color }}>&middot;</span>
          )}
        </span>
      ))}
    </div>
  )
}
