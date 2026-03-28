'use client'

interface RecommendationPillProps {
  recommendation: 'Strong Hire' | 'Proceed with Caution' | 'Do Not Hire'
  size?: 'sm' | 'md' | 'lg'
  confidence?: 'High' | 'Medium' | 'Low'
  showConfidence?: boolean
}

const colorMap = {
  'Strong Hire': {
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
    text: '#22C55E',
  },
  'Proceed with Caution': {
    bg: 'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.3)',
    text: '#EAB308',
  },
  'Do Not Hire': {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    text: '#EF4444',
  },
}

const sizeMap = {
  sm: { height: 22, fontSize: 11, padding: '0 8px' },
  md: { height: 28, fontSize: 12, padding: '0 12px' },
  lg: { height: 34, fontSize: 14, padding: '0 16px' },
}

export default function RecommendationPill({
  recommendation,
  size = 'md',
  confidence,
  showConfidence = false,
}: RecommendationPillProps) {
  const colors = colorMap[recommendation]
  const dims = sizeMap[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: dims.height,
        padding: dims.padding,
        borderRadius: 999,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: dims.fontSize,
        fontWeight: 600,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      {recommendation}
      {showConfidence && confidence && (
        <span style={{ opacity: 0.6, marginLeft: 4 }}>
          · {confidence} confidence
        </span>
      )}
    </span>
  )
}
