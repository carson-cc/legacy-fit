import Link from 'next/link'
import { notFound } from 'next/navigation'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { generateManagementStrategies } from '@/lib/behavioral-insights'
import ProfileNav from '@/app/components/profiles/ProfileNav'
import ProfileFingerprint from '@/app/components/profiles/ProfileFingerprint'
import {
  getGroupColor, getGroupHex, getDimensionLevel,
  getDimensionDescription, getBarFillOpacity, getLevelHeadingColor,
} from '@/app/components/profiles/helpers'

const DIMS = ['dominance', 'extraversion', 'patience', 'formality'] as const
const DIM_LABELS = ['Drive', 'Social', 'Pace', 'Structure'] as const
const DIM_TECHNICAL = ['Execution', 'Collaboration', 'Adaptability', 'Ownership'] as const

export function generateStaticParams() {
  return REFERENCE_PROFILES.map(p => ({ name: p.name.toLowerCase() }))
}

export default async function ProfileDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const idx = REFERENCE_PROFILES.findIndex(p => p.name.toLowerCase() === name.toLowerCase())
  if (idx === -1) return notFound()

  const profile = REFERENCE_PROFILES[idx]
  const prevProfile = REFERENCE_PROFILES[(idx - 1 + REFERENCE_PROFILES.length) % REFERENCE_PROFILES.length]
  const nextProfile = REFERENCE_PROFILES[(idx + 1) % REFERENCE_PROFILES.length]

  // Secondary profile: closest Euclidean distance excluding self
  const secondaryProfile = REFERENCE_PROFILES
    .filter((_, i) => i !== idx)
    .map(p => ({
      profile: p,
      dist: Math.sqrt(
        (profile.coords.dominance - p.coords.dominance) ** 2 +
        (profile.coords.extraversion - p.coords.extraversion) ** 2 +
        (profile.coords.patience - p.coords.patience) ** 2 +
        (profile.coords.formality - p.coords.formality) ** 2
      ),
    }))
    .sort((a, b) => a.dist - b.dist)[0].profile

  const hex = getGroupHex(profile.group)
  const strategies = generateManagementStrategies(profile)

  return (
    <div style={{ background: 'var(--p-bg0)', minHeight: '100svh' }}>
      <ProfileNav
        backLink
        prev={{ name: prevProfile.name, href: `/profiles/${prevProfile.name.toLowerCase()}` }}
        next={{ name: nextProfile.name, href: `/profiles/${nextProfile.name.toLowerCase()}` }}
      />

      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_300px]" style={{ padding: 'clamp(40px, 6vh, 80px) var(--p-sp) 0', gap: 'clamp(32px, 5vw, 80px)', maxWidth: 'min(1100px, calc(100vw - clamp(40px, 8vw, 160px)))', margin: '0 auto', alignItems: 'start' }}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: hex }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: getGroupColor(profile.group) }}>
              {profile.groupLabel}
            </span>
          </div>

          <h1 className="text-[56px] md:text-[80px]" style={{ fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.88, color: 'var(--p-t0)', marginBottom: 20, fontSize: 'clamp(36px, 7vw, 80px)' }}>
            {profile.name}
          </h1>

          <p style={{ fontSize: 18, color: 'var(--p-t1)', lineHeight: 1.5, fontStyle: 'italic', maxWidth: 480, marginBottom: 48 }}>
            {profile.tagline}
          </p>

          <p style={{ fontSize: 15, color: 'var(--p-t2)', lineHeight: 1.8, maxWidth: 520 }}>
            {profile.description}
          </p>
        </div>

        {/* Right */}
        <div style={{ paddingTop: 80 }}>
          <div style={{ marginBottom: 28 }}>
            <ProfileFingerprint d={profile.coords.dominance} e={profile.coords.extraversion} p={profile.coords.patience} f={profile.coords.formality} color={hex} size="lg" />
          </div>

          {/* Dimension legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DIMS.map((dim, i) => {
              const val = profile.coords[dim]
              return (
                <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--p-t2)', width: 56, flexShrink: 0 }}>{DIM_LABELS[i]}</span>
                  <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${val * 100}%`, borderRadius: 2, background: val > 0.65 ? 'rgba(255,255,255,0.90)' : val >= 0.42 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)' }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--p-t2)', width: 52, textAlign: 'right' }}>{getDimensionLevel(val)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sections */}
      <div style={{ marginTop: 80 }}>

        {/* Section 1: Behavioral Shape */}
        <section style={{ padding: `clamp(28px, 5vh, 52px) var(--p-sp)`, borderTop: '1px solid var(--p-b0)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 32 }}>
            Behavioral Shape
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            {DIMS.map((dim, i) => {
              const val = profile.coords[dim]
              return (
                <div key={dim} style={{ background: 'var(--p-bg2)', border: '1px solid var(--p-b0)', borderRadius: 12, padding: 24 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 8 }}>
                    {DIM_TECHNICAL[i]}
                  </p>
                  <p style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: getLevelHeadingColor(val), marginBottom: 10 }}>
                    {getDimensionLevel(val)}
                  </p>
                  <div style={{ width: '100%', height: 2, background: 'var(--p-bg4)', borderRadius: 1, overflow: 'hidden', marginBottom: 14, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${val * 100}%`, borderRadius: 1, background: getBarFillOpacity(val) }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--p-t2)', lineHeight: 1.7 }}>
                    {getDimensionDescription(dim, val)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 2: Strengths + Watch For */}
        <section style={{ padding: `clamp(28px, 5vh, 52px) var(--p-sp)`, borderTop: '1px solid var(--p-b0)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 32 }}>
            Strengths &amp; Watch For
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ border: '1px solid var(--p-b0)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Strengths */}
            <div className="md:border-r" style={{ padding: 36, borderColor: 'var(--p-b0)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 24 }}>Strengths</p>
              {profile.strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: getGroupColor(profile.group), flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: 14, color: 'var(--p-t1)', lineHeight: 1.65 }}>{s}</span>
                </div>
              ))}
            </div>
            {/* Watch For */}
            <div className="border-t md:border-t-0" style={{ padding: 36, borderColor: 'var(--p-b0)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 24 }}>Watch For</p>
              {profile.traps.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--p-t3)', flexShrink: 0 }}>&ndash;</span>
                  <span style={{ fontSize: 14, color: 'var(--p-t1)', lineHeight: 1.65 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Working With */}
        <section style={{ padding: `clamp(28px, 5vh, 52px) var(--p-sp)`, borderTop: '1px solid var(--p-b0)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 32 }}>
            Working with a {profile.name}
          </p>
          {strategies.map((strategy, i) => (
            <div key={i} style={{ display: 'flex', gap: 32, padding: '28px 0', borderBottom: i < strategies.length - 1 ? '1px solid var(--p-b0)' : 'none', ...(i === 0 ? { paddingTop: 0 } : {}) }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--p-t3)', width: 20, flexShrink: 0, marginTop: 3, letterSpacing: '0.04em' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.7 }}>{strategy}</p>
            </div>
          ))}
        </section>

        {/* Section 4: Best Fit Roles */}
        <section style={{ padding: `clamp(28px, 5vh, 52px) var(--p-sp)`, borderTop: '1px solid var(--p-b0)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 32 }}>
            Best Fit Roles
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {profile.bestRoles.map(role => (
              <span key={role} style={{ padding: '10px 18px', border: '1px solid var(--p-b1)', borderRadius: 100, fontSize: 12, color: 'var(--p-t2)', letterSpacing: '0.02em' }}>
                {role}
              </span>
            ))}
          </div>
        </section>

        {/* Section 5: Also Resembles */}
        <section style={{ padding: `clamp(28px, 5vh, 52px) var(--p-sp)`, borderTop: '1px solid var(--p-b0)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--p-t3)', marginBottom: 32 }}>
            Also Resembles
          </p>
          <Link
            href={`/profiles/${secondaryProfile.name.toLowerCase()}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--p-bg2)', border: '1px solid var(--p-b0)', borderRadius: 12,
              padding: '24px 28px', textDecoration: 'none', transition: 'border-color 0.1s',
            }}
            className="hover:!border-[rgba(255,255,255,0.07)]"
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: 'var(--p-t3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Secondary Profile &middot; {secondaryProfile.groupLabel}
              </p>
              <p style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--p-t0)' }}>
                {secondaryProfile.name}
              </p>
              <p style={{ fontSize: 13, color: 'var(--p-t2)', marginTop: 4 }}>
                {secondaryProfile.tagline}
              </p>
            </div>
            <div style={{ marginLeft: 24, flexShrink: 0 }}>
              <ProfileFingerprint d={secondaryProfile.coords.dominance} e={secondaryProfile.coords.extraversion} p={secondaryProfile.coords.patience} f={secondaryProfile.coords.formality} color={getGroupHex(secondaryProfile.group)} size="sm" />
            </div>
            <span style={{ fontSize: 18, color: 'var(--p-t3)', marginLeft: 20 }}>&rarr;</span>
          </Link>
        </section>

        {/* Bottom nav */}
        <div style={{ padding: `clamp(28px, 5vh, 56px) var(--p-sp)`, borderTop: '1px solid var(--p-b0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={`/profiles/${prevProfile.name.toLowerCase()}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--p-t3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>&larr; Previous</span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--p-t0)', transition: 'color 0.1s' }}>{prevProfile.name}</span>
            <span style={{ fontSize: 11, color: getGroupColor(prevProfile.group) }}>{prevProfile.groupLabel}</span>
          </Link>

          <Link href={`/profiles/${nextProfile.name.toLowerCase()}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
            <span style={{ fontSize: 10, color: 'var(--p-t3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next &rarr;</span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--p-t0)', transition: 'color 0.1s' }}>{nextProfile.name}</span>
            <span style={{ fontSize: 11, color: getGroupColor(nextProfile.group) }}>{nextProfile.groupLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
