'use client'

import ScoreRing from './ScoreRing'
import MetadataTrustRail from './MetadataTrustRail'

interface DecisionPanelProps {
  fitScore: number
  recommendation: 'Strong Hire' | 'Proceed with Caution' | 'Do Not Hire'
  confidence: 'High' | 'Medium' | 'Low'
  percentile: string
  benchmarkComparison: string
  rationale: string
  totalSignals?: number
  strengths?: string[]
  risks?: string[]
  hiringManagerSignal?: string
  variant?: 'dark' | 'light'
}

const statusColor: Record<DecisionPanelProps['recommendation'], string> = {
  'Strong Hire': '#22C55E',
  'Proceed with Caution': '#EAB308',
  'Do Not Hire': '#EF4444',
}

const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"

function SectionLabel({ children, variant }: { children: string; variant: 'dark' | 'light' }) {
  const color = variant === 'dark' ? 'rgba(255,255,255,0.35)' : '#6B7280'
  return (
    <div
      style={{
        fontSize: 9,
        lineHeight: '12px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color,
        textTransform: 'uppercase',
        marginBottom: 6,
        fontFamily: font,
      }}
    >
      {children}
    </div>
  )
}

export default function DecisionPanel({
  fitScore,
  recommendation,
  confidence,
  percentile,
  benchmarkComparison,
  rationale,
  totalSignals,
  strengths,
  risks,
  hiringManagerSignal,
  variant = 'dark',
}: DecisionPanelProps) {
  const color = statusColor[recommendation]
  const isDark = variant === 'dark'

  const bg = isDark ? '#111827' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'
  const textPrimary = isDark ? '#FFFFFF' : '#111827'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'
  const confidenceBg = isDark ? `${color}15` : `${color}15`
  const percentileBg = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'
  const percentileColor = isDark ? '#FFFFFF' : '#111827'

  return (
    <section
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: 32,
        display: 'grid',
        gridTemplateColumns: '240px 1px 1fr',
        gap: 32,
        fontFamily: font,
      }}
    >
      {/* Left column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <ScoreRing
          score={fitScore}
          recommendation={recommendation}
          size={120}
          animated={true}
          showLabel={true}
        />

        {/* Confidence + percentile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 999,
              background: confidenceBg,
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
              background: percentileBg,
              color: percentileColor,
            }}
          >
            {percentile}
          </span>
        </div>

        {/* Hiring manager signal */}
        {hiringManagerSignal && (
          <div style={{ marginTop: 8 }}>
            <SectionLabel variant={variant}>Hiring Manager Signal</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#22C55E',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontFamily: font,
                }}
              >
                {hiringManagerSignal}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ background: dividerColor, width: 1 }} />

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
        {/* Benchmark comparison */}
        <div>
          <SectionLabel variant={variant}>Benchmark Comparison</SectionLabel>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: '26px',
              fontWeight: 600,
              color: textPrimary,
            }}
          >
            {benchmarkComparison}
          </p>
        </div>

        {/* Rationale */}
        <div>
          <SectionLabel variant={variant}>Recommendation Rationale</SectionLabel>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: '22px',
              color: textSecondary,
            }}
          >
            {rationale}
          </p>
        </div>

        {/* Strengths */}
        {strengths && strengths.length > 0 && (
          <div>
            <SectionLabel variant={variant}>Top Strengths</SectionLabel>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {strengths.map((s, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    lineHeight: '20px',
                    color: textSecondary,
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {risks && risks.length > 0 && (
          <div>
            <SectionLabel variant={variant}>Primary Risks</SectionLabel>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {risks.map((r, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    lineHeight: '20px',
                    color: textSecondary,
                  }}
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata trust rail */}
        <div style={{ borderTop: `1px solid ${dividerColor}`, paddingTop: 16 }}>
          <MetadataTrustRail
            variant={variant}
            size="sm"
            signals={[
              `Based on ${totalSignals || 94} behavioral signals`,
              'Role benchmark active',
              'Recommendation generated from calibrated signal analysis',
              'IPIP-NEO validated',
            ]}
          />
        </div>
      </div>
    </section>
  )
}
