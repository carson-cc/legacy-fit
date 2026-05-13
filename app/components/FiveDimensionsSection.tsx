'use client'

export function FiveDimensionsSection({ inView }: { inView: boolean }) {
  return (
    <div style={{ opacity: inView ? 1 : 0, transition: 'opacity 600ms ease', padding: '80px 0', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>
        What we measure
      </div>
      <h2 style={{ fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 16px' }}>
        Four behavioral dimensions.
      </h2>
      <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 560 }}>
        Every assessment maps candidate behavior across Execution, Collaboration, Adaptability, and Ownership — the four dimensions that predict role fit with measurable accuracy.
      </p>
    </div>
  )
}
