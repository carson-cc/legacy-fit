'use client'
import Link from 'next/link'
import { PRODUCT_NAME, COMPANY_NAME, COMPANY_EMAIL } from '@/lib/brand'

const NAV_LINKS = [
  { label: 'For Staffing', href: '/for-staffing-firms' },
  { label: 'For Executive Search', href: '/for-executive-search' },
  { label: 'Science', href: '/science' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Profiles', href: '/profiles' },
]

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 52, background: 'rgba(6,6,6,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--p-b0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--p-sp)' }}>
      <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', textDecoration: 'none', letterSpacing: '-0.01em' }}>{PRODUCT_NAME}</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 24 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, color: 'var(--p-t2)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--p-t1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--p-t2)')}
            >{l.label}</Link>
          ))}
        </div>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 32, padding: '0 16px', background: '#ffffff', color: '#000000', fontSize: 13, fontWeight: 500, borderRadius: 8, textDecoration: 'none' }}>Login</Link>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--p-b0)', padding: '32px var(--p-sp)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <span style={{ fontSize: 12, color: 'var(--p-t3)' }}>{PRODUCT_NAME} by {COMPANY_NAME} &middot; &copy; 2026</span>
      <span style={{ fontSize: 12, color: 'var(--p-t3)' }}>{COMPANY_EMAIL}</span>
    </footer>
  )
}

const VALUE_PROPS = [
  {
    title: 'A scientific assessment in every search',
    body: 'IPIP-NEO and 16PF validated. 1.2M+ primary norms.',
  },
  {
    title: 'A deliverable for the client',
    body: 'Professional behavioral report. Profile, fit score, interview guide, team dynamics.',
  },
  {
    title: 'Candidate\u2013manager pairing no competitor offers',
    body: 'The hiring manager takes the same 6-minute assessment. Every report shows compatibility.',
  },
]

export default function ForExecutiveSearchPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh', color: 'var(--p-t0)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: '88px var(--p-sp) 68px', borderBottom: '1px solid var(--p-b0)' }}>
        <h1 className="text-[40px] md:text-[52px]" style={{ fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'var(--p-t0)', marginBottom: 18 }}>
          Behavioral science for executive search
        </h1>
        <p style={{ fontSize: 16, color: 'var(--p-t2)', lineHeight: 1.6, maxWidth: 520 }}>
          When a board asks how you evaluate leadership fit, this is your answer.
        </p>
      </section>

      {/* Value Props */}
      <section style={{ padding: '56px var(--p-sp) 56px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
          {VALUE_PROPS.map(vp => (
            <div key={vp.title} style={{ background: 'var(--p-bg2)', border: '1px solid var(--p-b0)', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)', marginBottom: 12, lineHeight: 1.2 }}>{vp.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8 }}>{vp.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Report */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 24 }}>
          The Report
        </p>
        <div style={{ maxWidth: 560 }}>
          <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, marginBottom: 16 }}>
            Every candidate receives a shareable behavioral report containing their profile assignment, four-dimension breakdown, fit score against the role target, an auto-generated interview guide, and team dynamics analysis when Mode B is active.
          </p>
          <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, marginBottom: 24 }}>
            Reports are designed to be shared directly with clients. No login required.
          </p>
          <Link href="/profiles/pioneer" style={{ fontSize: 13, fontWeight: 500, color: 'var(--p-t2)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
            View a sample report &rarr;
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 80px', textAlign: 'center' }}>
        <a href={`mailto:${COMPANY_EMAIL}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 44, padding: '0 32px', background: '#ffffff', color: '#000000', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Request a Demo
        </a>
      </section>

      <Footer />
    </div>
  )
}
