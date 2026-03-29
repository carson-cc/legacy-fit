'use client'

import { useState } from 'react'
import Link from 'next/link'
import { REFERENCE_PROFILES } from '@/lib/data/profiles'
import { PRODUCT_NAME, COMPANY_EMAIL } from '@/lib/brand'

/* ─────────────────────────────────────────────────────────────
   FAMILY ORDER + COLOR
───────────────────────────────────────────────────────────── */

const FAMILY_ORDER = ['Drivers', 'Catalysts', 'Operators', 'Stabilizers']

function getFamilyColor(family: string): string {
  const colors: Record<string, string> = {
    'Drivers':     '#EF4444',
    'Catalysts':   '#2563EB',
    'Operators':   '#EAB308',
    'Stabilizers': '#22C55E',
  }
  return colors[family] || 'rgba(255,255,255,0.3)'
}

const sorted = [...REFERENCE_PROFILES].sort((a, b) => {
  const fi = FAMILY_ORDER.indexOf(a.groupLabel) - FAMILY_ORDER.indexOf(b.groupLabel)
  if (fi !== 0) return fi
  return a.name.localeCompare(b.name)
})

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

export default function ArchetypesPage() {
  const [scrolled, setScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    // passive scroll listener attached once
  }

  return (
    <main
      style={{
        background: '#000',
        color: '#FFF',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
        overflowX: 'hidden',
      }}
      onScrollCapture={(e) => {
        const target = e.currentTarget
        setScrolled(target.scrollTop > 40)
      }}
    >

      {/* NAV */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        background: scrolled ? 'rgba(0,0,0,0.98)' : 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 240ms ease',
      }}>
        <div
          className="nav-inner"
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 40px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textDecoration: 'none', letterSpacing: '-0.02em' }}
          >
            {PRODUCT_NAME}
          </Link>
          <div className="nav-links-group" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {[
              { label: 'Product',       href: '/#how-it-works' },
              { label: 'Method',        href: '/profiles' },
              { label: 'Archetypes',    href: '/archetypes' },
              { label: 'Sample Report', href: '/sample-report' },
            ].map(l => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontSize: 13,
                  fontWeight: l.href === '/archetypes' ? 600 : 500,
                  color: l.href === '/archetypes' ? '#FFF' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  transition: 'color 160ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={e => (e.currentTarget.style.color = l.href === '/archetypes' ? '#FFF' : 'rgba(255,255,255,0.45)')}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/login"
              className="nav-signin"
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 160ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              Sign in
            </Link>
            <a
              href={`mailto:${COMPANY_EMAIL}`}
              className="nav-cta"
              style={{
                height: 34,
                padding: '0 16px',
                borderRadius: 8,
                background: '#FFF',
                color: '#000',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Talk to us
            </a>
          </div>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 48px',
        position: 'relative',
      }}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          Behavioral Archetypes
        </p>

        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
          maxWidth: 660,
          marginBottom: 20,
        }}>
          You&apos;ve met these people.<br />
          Now you have words for them.
        </h1>

        <p style={{
          fontSize: 17,
          color: 'rgba(255,255,255,0.38)',
          maxWidth: 440,
          lineHeight: 1.65,
          marginBottom: 40,
        }}>
          Browse the patterns recruiters recognize instantly —
          or find your own in six minutes.
        </p>

        <a
          href="/invite-self"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#FFFFFF',
            color: '#000000',
            fontSize: 15,
            fontWeight: 700,
            padding: '13px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            marginBottom: 14,
          }}
        >
          Find my archetype →
        </a>

        <p style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.18)',
        }}>
          Or scroll to browse every archetype.
        </p>

        <div style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.3,
        }}>
          <div style={{
            width: 1,
            height: 32,
            background: 'linear-gradient(180deg,rgba(255,255,255,0.6),transparent)',
          }} />
          <span style={{
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}>Scroll</span>
        </div>
      </section>

      {/* SECTION 2 — THE ARCHETYPES */}
      {sorted.map((profile, i) => (
        <section
          key={profile.name}
          style={{
            minHeight: '100vh',
            background: i % 2 === 0 ? '#000' : '#0B0F14',
            display: 'flex',
            alignItems: 'center',
            padding: '80px 48px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{
            maxWidth: 680,
            margin: '0 auto',
            width: '100%',
          }}>

            <p style={{
              fontSize: 10,
              fontWeight: 600,
              color: getFamilyColor(profile.groupLabel),
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              {profile.groupLabel}
            </p>

            <h2 style={{
              fontSize: 'clamp(56px, 9vw, 108px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              marginBottom: 28,
            }}>
              {profile.name}
            </h2>

            <p style={{
              fontSize: 'clamp(18px, 2.2vw, 22px)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
              marginBottom: 20,
              maxWidth: 540,
            }}>
              {profile.essence}
            </p>

            <p style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.9,
              marginBottom: 32,
              maxWidth: 580,
            }}>
              {profile.scene}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 28px',
            }}>
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.2)',
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 600,
                }}>Works in: </span>
                {profile.worksBestIn}
              </p>
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.2)',
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 600,
                }}>Watch for: </span>
                {profile.watchFor}
              </p>
            </div>

          </div>
        </section>
      ))}

      {/* SECTION 3 — CLOSE */}
      <section style={{
        minHeight: '70vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 48px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h2 style={{
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          maxWidth: 520,
          margin: '0 auto 16px',
        }}>
          You already knew the type.<br />
          Now you can name it.
        </h2>

        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 32,
          maxWidth: 380,
        }}>
          See how archetypes appear in a real candidate report —
          or find out which one you are.
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <a
            href="/sample-report"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#FFFFFF',
              color: '#000000',
              fontSize: 15,
              fontWeight: 700,
              padding: '13px 28px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            See a real report →
          </a>
          <a
            href="/invite-self"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'transparent',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 15,
              fontWeight: 500,
              padding: '13px 24px',
              borderRadius: 8,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Find my archetype →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
          {PRODUCT_NAME} by Legacy Workforce · © 2026
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
          {COMPANY_EMAIL}
        </span>
      </footer>

      <style>{`
        @media (max-width: 767px) {
          .nav-links-group { display: none !important; }
          .nav-signin      { display: none !important; }
          .nav-inner       { padding: 0 20px !important; }
          .nav-cta         { height: 36px !important; padding: 0 14px !important; }
        }
        @media (max-width: 600px) {
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </main>
  )
}
