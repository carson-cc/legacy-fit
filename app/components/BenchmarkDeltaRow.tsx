'use client'

interface BenchmarkDeltaRowProps {
  label: string
  candidateValue: number
  benchmarkValue: number
  showBar?: boolean
  variant?: 'dark' | 'light'
}

export default function BenchmarkDeltaRow({
  label,
  candidateValue,
  benchmarkValue,
  showBar = true,
  variant = 'dark',
}: BenchmarkDeltaRowProps) {
  const delta = candidateValue - benchmarkValue
  const deltaColor = delta > 0 ? '#22C55E' : delta < 0 ? '#EF4444' : 'rgba(255,255,255,0.35)'
  const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0'

  const isDark = variant === 'dark'
  const textColor = isDark ? '#FFFFFF' : '#111827'
  const labelColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'
  const trackColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const benchmarkMarkerColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const deltaPillBg = delta > 0
    ? 'rgba(34,197,94,0.12)'
    : delta < 0
    ? 'rgba(239,68,68,0.12)'
    : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const rowHeight = showBar ? 52 : 32

  return (
    <div
      style={{
        height: rowHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderBottom: `1px solid ${borderColor}`,
        padding: '0 0 4px 0',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: labelColor, minWidth: 100 }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>
          {candidateValue}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: deltaColor,
              background: deltaPillBg,
              borderRadius: 999,
              padding: '2px 8px',
            }}
          >
            {deltaText}
          </span>
        </span>
      </div>

      {showBar && (
        <div
          style={{
            position: 'relative',
            height: 3,
            borderRadius: 2,
            background: trackColor,
            marginTop: 6,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${Math.min(candidateValue, 100)}%`,
              borderRadius: 2,
              background: delta >= 0 ? '#22C55E' : '#EF4444',
              transition: 'width 240ms ease-out',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -3,
              left: `${Math.min(benchmarkValue, 100)}%`,
              width: 1,
              height: 9,
              background: benchmarkMarkerColor,
              transform: 'translateX(-0.5px)',
            }}
          />
        </div>
      )}
    </div>
  )
}
