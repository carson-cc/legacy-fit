interface Props {
  coords: { dominance: number; extraversion: number; patience: number; formality: number }
  size?: 'sm' | 'lg'
}

const DIMS = [
  { key: 'dominance' as const, label: 'Execution' },
  { key: 'extraversion' as const, label: 'Collaboration' },
  { key: 'patience' as const, label: 'Adaptability' },
  { key: 'formality' as const, label: 'Ownership' },
]

export default function DimensionBars({ coords, size = 'sm' }: Props) {
  const barH = size === 'lg' ? 'h-1.5' : 'h-1'
  const labelSize = size === 'lg' ? 'text-[13px]' : 'text-[11px]'
  const gap = size === 'lg' ? 'space-y-3' : 'space-y-2'
  const trackW = 'flex-1'

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
          </div>
        )
      })}
    </div>
  )
}
