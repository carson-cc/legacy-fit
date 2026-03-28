interface Props {
  coords: { dominance: number; extraversion: number; patience: number; formality: number }
  size?: 'sm' | 'lg'
}

const DIMS = [
  { key: 'dominance' as const, label: 'Dominance' },
  { key: 'extraversion' as const, label: 'Extraversion' },
  { key: 'patience' as const, label: 'Patience' },
  { key: 'formality' as const, label: 'Formality' },
]

function level(v: number): string {
  if (v > 0.70) return 'High'
  if (v >= 0.45) return 'Mid'
  return 'Low'
}

function levelColor(v: number): string {
  if (v > 0.70) return 'text-white'
  if (v >= 0.45) return 'text-[#888888]'
  return 'text-[#555555]'
}

export default function DimensionBars({ coords, size = 'sm' }: Props) {
  const barH = size === 'lg' ? 'h-1.5' : 'h-1'
  const labelSize = size === 'lg' ? 'text-[13px]' : 'text-[11px]'
  const levelSize = size === 'lg' ? 'text-[12px]' : 'text-[10px]'
  const gap = size === 'lg' ? 'space-y-3' : 'space-y-2'
  const trackW = size === 'lg' ? 'w-[200px]' : 'w-[120px]'

  return (
    <div className={gap}>
      {DIMS.map(({ key, label }) => {
        const v = coords[key]
        return (
          <div key={key} className="flex items-center gap-3">
            <span className={`${labelSize} text-[#888888] w-24 shrink-0`}>{label}</span>
            <div className={`${trackW} ${barH} bg-[#1a1a1a] rounded-full overflow-hidden`}>
              <div className={`${barH} bg-white rounded-full`} style={{ width: `${Math.round(v * 100)}%` }} />
            </div>
            <span className={`${levelSize} ${levelColor(v)} font-medium w-8`}>{level(v)}</span>
          </div>
        )
      })}
    </div>
  )
}
