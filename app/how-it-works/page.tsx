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

const MODE_A_STEPS = [
  { num: '01', title: 'Define the role', desc: 'Describe the position. AI suggests a behavioral target. 60 seconds.' },
  { num: '02', title: 'Set the behavioral target', desc: 'Four dimensions: Drive, Social, Patience, Structure. Each on a 0\u20131 scale.' },
  { num: '03', title: 'Invite candidates', desc: 'One link. Any device. No login. 6-minute adjective checklist. Two pages.' },
  { num: '04', title: 'Review results', desc: 'Behavioral profile. Fit score. Dimension breakdown. Interview guide. Shareable report.' },
]

const MODE_B_STEPS = [
  { num: '05', title: 'Profile the hiring manager', desc: 'Same 6-minute assessment. Stored once per client.' },
  { num: '06', title: 'See team fit on every report', desc: 'Works well with / May clash with. Interview calibration. Research-backed.' },
]

export default function HowItWorksPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh', color: 'var(--p-t0)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: '88px var(--p-sp) 68px', borderBottom: '1px solid var(--p-b0)' }}>
        <h1 className="text-[40px] md:text-[52px]" style={{ fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'var(--p-t0)', marginBottom: 18 }}>
          How {PRODUCT_NAME} works
        </h1>
        <p style={{ fontSize: 16, color: 'var(--p-t2)', lineHeight: 1.6, maxWidth: 420 }}>
          From open role to confident hire.
        </p>
      </section>

      {/* MODE A */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 40 }}>
          Mode A &middot; Candidates Only
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MODE_A_STEPS.map((step, i) => (
            <div key={step.num} style={{ padding: '28px 0', borderTop: i > 0 ? '1px solid var(--p-b0)' : 'none' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--p-t3)', letterSpacing: '0.04em', flexShrink: 0 }}>{step.num}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)', marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8 }}>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODE B */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 12 }}>
          Mode B &middot; Candidates + Hiring Team
        </p>
        <p style={{ fontSize: 15, color: 'var(--p-t2)', lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
          Everything in Mode A, plus the hiring manager&rsquo;s profile.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MODE_B_STEPS.map((step, i) => (
            <div key={step.num} style={{ padding: '28px 0', borderTop: i > 0 ? '1px solid var(--p-b0)' : 'none' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--p-t3)', letterSpacing: '0.04em', flexShrink: 0 }}>{step.num}</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)', marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8 }}>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Assessment */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 40 }}>
          What Candidates See
        </p>
        <div style={{ maxWidth: 600 }}>
          <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, marginBottom: 16 }}>
            80 adjectives. Two pages.
          </p>
          <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, marginBottom: 16 }}>
            Page 1: how you naturally are. Page 2: how others expect you to act. The gap between the two is adaptation stress.
          </p>
          <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, marginBottom: 16 }}>
            No right or wrong answers. Mobile-first. 6 minutes.
          </p>
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
