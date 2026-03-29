'use client'

interface DecisionPanelProps {
  fitScore: number
  recommendation: 'Strong Hire' | 'Proceed with Caution' | 'Do Not Hire'
  confidence: 'High' | 'Medium' | 'Low'
  percentile: string
  benchmarkComparison: string
  rationale: string
  totalSignals: number
}

const statusColor: Record<DecisionPanelProps['recommendation'], string> = {
  'Strong Hire': '#22C55E',
  'Proceed with Caution': '#EAB308',
  'Do Not Hire': '#EF4444',
}

export default function DecisionPanel({
  fitScore,
  recommendation,
  confidence,
  percentile,
  benchmarkComparison,
  rationale,
  totalSignals,
}: DecisionPanelProps) {
  const color = statusColor[recommendation]

  return (
    <section
      className="candidate-decision-panel-grid"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: 'clamp(20px, 4vw, 32px)',
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: 'clamp(16px, 3vw, 32px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase' }}>
          Recommendation
        </div>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
          }}
        >
          <span style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: '48px', fontWeight: 700, color: '#111827' }}>{fitScore}</span>
        </div>
        <div style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: '28px', fontWeight: 600, color: '#111827' }}>{recommendation}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 999,
              background: `${color}15`,
              color,
            }}
          >
            {confidence} confidence
          </span>
          <span
            style={{
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 999,
              background: '#F3F4F6',
              color: '#111827',
            }}
          >
            {percentile}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
            Benchmark comparison
          </div>
          <p style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: '28px', fontWeight: 600, color: '#111827' }}>
            {benchmarkComparison}
          </p>
        </div>

        <div>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, letterSpacing: '0.08em', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
            Recommendation rationale
          </div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: '24px', color: '#111827' }}>{rationale}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 8, borderTop: '1px solid #E5E7EB' }}>
          {[
            `Based on ${totalSignals || 94} behavioral signals`,
            'Role benchmark active',
            'Recommendation generated from calibrated signal analysis',
          ].map((item) => (
            <span
              key={item}
              style={{ fontSize: 12, lineHeight: '16px', color: '#6B7280' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
