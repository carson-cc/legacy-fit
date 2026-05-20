'use client'

import Link from 'next/link'

type ActivePage = 'archetypes' | 'profiles' | 'sample-report'

interface NavProps {
  activePage?: ActivePage
  /** Homepage passes this from its IntersectionObserver navLight state */
  light?: boolean
}

const LINKS: { label: string; href: string; page: ActivePage }[] = [
  { label: 'Archetypes',    href: '/archetypes',    page: 'archetypes' },
  { label: 'Method',        href: '/profiles',      page: 'profiles' },
  { label: 'Sample Report', href: '/sample-report', page: 'sample-report' },
]

export default function Nav({ activePage, light = false }: NavProps) {
  const bg          = light ? 'rgba(245,245,240,0.96)' : 'rgba(8,8,8,0.88)'
  const logoColor   = light ? '#000' : '#fff'
  const mutedColor  = light ? 'rgba(0,0,0,0.45)'        : 'rgba(255,255,255,0.42)'
  const activeColor = light ? '#000'                     : '#fff'
  const ctaBg       = light ? 'rgba(0,0,0,0.07)'         : 'rgba(255,255,255,0.1)'
  const ctaBorder   = light ? 'rgba(0,0,0,0.12)'         : 'rgba(255,255,255,0.15)'

  return (
    <>
      <style>{`
        .nav-links-desktop { display: flex; gap: 28px; align-items: center; }
        .nav-signin-link { display: inline; }
        @media (max-width: 1024px) {
          .nav-links-desktop { display: none !important; }
          .nav-signin-link { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-cta-link { padding: 8px 14px !important; }
        }
      `}</style>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 64px)',
        background: bg,
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 300ms ease',
      }}>
        <Link href="/" style={{
          fontSize: 15, fontWeight: 700, color: logoColor,
          textDecoration: 'none', letterSpacing: '-0.01em',
          transition: 'color 300ms ease',
        }}>Veltro</Link>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="nav-links-desktop">
            {LINKS.map(l => {
              const isActive = activePage === l.page
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? activeColor : mutedColor,
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = activeColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = isActive ? activeColor : mutedColor)}
                >
                  {l.label}
                </Link>
              )
            })}

            <Link
              href="/login"
              className="nav-signin-link"
              style={{
                fontSize: 13, color: mutedColor,
                textDecoration: 'none',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = activeColor)}
              onMouseLeave={e => (e.currentTarget.style.color = mutedColor)}
            >Sign in</Link>
          </div>

          <Link
            href="/sample-report"
            className="nav-cta-link"
            style={{
              fontSize: 13, fontWeight: 500, color: activeColor,
              background: ctaBg,
              border: `1px solid ${ctaBorder}`,
              padding: '7px 14px', borderRadius: 6,
              textDecoration: 'none',
              transition: 'all 300ms ease',
              minHeight: 44,
              display: 'inline-flex', alignItems: 'center',
            }}
          >See the report →</Link>
        </div>
      </nav>
    </>
  )
}
