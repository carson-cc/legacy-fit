interface Props {
  d: number
  e: number
  p: number
  f: number
  color: string // hex color for SVG
  size: 'sm' | 'lg'
}

export default function ProfileFingerprint({ d, e, p, f, color, size }: Props) {
  const isSm = size === 'sm'
  const dim = isSm ? 52 : 220
  const cx = dim / 2
  const cy = dim / 2
  const maxR = isSm ? 22 : 88

  const rings = [0.33, 0.66, 1.0].map(pct => maxR * pct)

  // Polygon vertices — D=north, E=east, P=south, F=west
  const points = [
    { x: cx, y: cy - d * maxR },
    { x: cx + e * maxR, y: cy },
    { x: cx, y: cy + p * maxR },
    { x: cx - f * maxR, y: cy },
  ]
  const polyStr = points.map(pt => `${pt.x},${pt.y}`).join(' ')

  const fillColor = color + '1f' // ~12% opacity
  const sw = isSm ? 0.75 : 1.5

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grid circles */}
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
      ))}

      {/* Axis lines */}
      <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
      <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />

      {/* Data polygon */}
      <polygon points={polyStr} fill={fillColor} stroke={color} strokeWidth={sw} strokeLinejoin="round" />

      {/* Vertex dots — LG only */}
      {!isSm && points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill={color} />
      ))}

      {/* Axis labels — LG: full words + technical sublabel */}
      {!isSm && (
        <>
          <text x={cx} y={cy - maxR - 16} textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize={9} fontWeight={600} fontFamily="system-ui" letterSpacing="0.1em">DRIVE</text>
          <text x={cx} y={cy - maxR - 6} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize={7} fontFamily="system-ui">(Dominance)</text>

          <text x={cx + maxR + 10} y={cy - 4} textAnchor="start" fill="rgba(255,255,255,0.32)" fontSize={9} fontWeight={600} fontFamily="system-ui" letterSpacing="0.1em">SOCIAL</text>
          <text x={cx + maxR + 10} y={cy + 7} textAnchor="start" fill="rgba(255,255,255,0.12)" fontSize={7} fontFamily="system-ui">(Extraversion)</text>

          <text x={cx} y={cy + maxR + 16} textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize={9} fontWeight={600} fontFamily="system-ui" letterSpacing="0.1em">PATIENCE</text>
          <text x={cx} y={cy + maxR + 26} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize={7} fontFamily="system-ui">(Patience)</text>

          <text x={cx - maxR - 10} y={cy - 4} textAnchor="end" fill="rgba(255,255,255,0.32)" fontSize={9} fontWeight={600} fontFamily="system-ui" letterSpacing="0.1em">STRUCTURE</text>
          <text x={cx - maxR - 10} y={cy + 7} textAnchor="end" fill="rgba(255,255,255,0.12)" fontSize={7} fontFamily="system-ui">(Formality)</text>
        </>
      )}
    </svg>
  )
}
