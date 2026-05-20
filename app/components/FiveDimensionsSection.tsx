'use client'

const TEXT  = 'rgba(255,255,255,0.88)'
const MUTED = 'rgba(255,255,255,0.40)'
const BORD  = 'rgba(255,255,255,0.07)'
const BLUE  = '#2563EB'
const FONT  = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'

const DIMS = [
  {
    label: 'Execution',
    desc: 'Drive to initiate, follow through, and deliver results under pressure. Combines conscientiousness, dominance, and urgency.',
  },
  {
    label: 'Ownership',
    desc: 'Proactive accountability — claiming problems before they\'re assigned. Strongest predictor of leadership emergence in high-autonomy roles.',
  },
  {
    label: 'Adaptability',
    desc: 'Flexibility under changing conditions. Low rigidity, high social bandwidth, and emotional steadiness under uncertainty.',
  },
  {
    label: 'Collaboration',
    desc: 'Orientation toward shared outcomes. Extraversion and agreeableness working together — the two strongest predictors of team performance.',
  },
  {
    label: 'Decision Speed',
    desc: 'Comfort making decisions with incomplete information. Decisiveness, urgency, and tolerance for ambiguity — bidirectionally scored.',
  },
]

export function FiveDimensionsSection({ inView }: { inView: boolean }) {
  return (
    <div style={{ fontFamily: FONT, padding: '80px 0', opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: BLUE, textTransform: 'uppercase', marginBottom: 16 }}>
          What we measure
        </p>
        <h2 style={{ fontSize: 42, fontWeight: 700, color: TEXT, margin: '0 0 16px', lineHeight: 1.1 }}>
          Five recruiter-readable dimensions.
        </h2>
        <p style={{ fontSize: 16, color: MUTED, margin: '0 0 64px', lineHeight: 1.6, maxWidth: 560 }}>
          Derived from four raw behavioral signals via meta-analytic formulas. Each dimension maps directly to how high-performing candidates behave on the job.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
          {DIMS.map((d, i) => (
            <div key={d.label} style={{
              padding: '32px 28px',
              border: `1px solid ${BORD}`,
              borderRadius: i === 0 ? '12px 0 0 12px' : i === DIMS.length - 1 ? '0 12px 12px 0' : 0,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: BLUE, textTransform: 'uppercase', marginBottom: 12 }}>
                0 — 100
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 12 }}>{d.label}</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
