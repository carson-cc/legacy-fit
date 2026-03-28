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

const OBJECTIONS = [
  {
    q: 'Our client already uses PI.',
    a: 'PI is a hiring tool for HR teams. Veltro is a presentation tool for search firms. You\'re not replacing their process — you\'re adding a deliverable to yours. They can run both.',
  },
  {
    q: 'How does this fit into a retained search?',
    a: 'One additional step at shortlist. Candidates complete a 6-minute assessment. You receive a scored report 24 hours before the client meeting. Nothing else changes.',
  },
  {
    q: 'Will candidates push back on another assessment?',
    a: 'It\'s 6 minutes, forced-choice adjectives. At the shortlist stage, qualified candidates expect due diligence. Frame it as part of how you present them — they want the report too.',
  },
]

export default function ForExecutiveSearchPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh', color: 'var(--p-t0)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: '88px var(--p-sp) 68px', borderBottom: '1px solid var(--p-b0)' }}>
        <h1 className="text-[40px] md:text-[52px]" style={{ fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'var(--p-t0)', marginBottom: 18 }}>
          When a board asks how you evaluate leadership fit, this is your answer.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--p-t2)', lineHeight: 1.6, maxWidth: 520 }}>
          A behavioral assessment in every search. A client-ready report. Candidate–manager compatibility no other firm offers.
        </p>
      </section>

      {/* The shortlist moment */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '64px var(--p-sp) 64px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 24 }}>
          The Moment It Pays Off
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              step: '1',
              title: 'You present three finalists.',
              body: 'The client says they like two of them and wants to know how you\'d differentiate. You open the report.',
            },
            {
              step: '2',
              title: 'You show the fit scores.',
              body: 'Candidate A scores 91 against your role benchmark. Candidate B scores 74 — strong skills, but the pace mismatch is a real risk for this environment. The numbers end the conversation.',
            },
            {
              step: '3',
              title: 'The client asks about manager fit.',
              body: 'You already profiled their hiring manager. You show the compatibility read. "High collaboration alignment, known friction point on pace — here\'s how we\'d address that in onboarding."',
            },
          ].map(s => (
            <div key={s.step} style={{ background: 'var(--p-bg2)', border: '1px solid var(--p-b0)', borderRadius: 16, padding: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-t3)', letterSpacing: '0.12em', marginBottom: 12 }}>{s.step}</p>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)', marginBottom: 10, lineHeight: 1.2 }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 32 }}>
          What&apos;s In Every Report
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          {[
            { label: 'Fit score', desc: 'Candidate scored against a role-specific behavioral benchmark. Not a generic population percentile.' },
            { label: 'Behavioral profile', desc: '20 archetypes, normed against 2.2M responses. Filed under a name your client can remember.' },
            { label: 'Dimension breakdown', desc: 'Execution, Ownership, Adaptability, Collaboration, Decision Speed — each scored, each explained.' },
            { label: 'Interview probes', desc: 'Auto-generated questions targeting the candidate\'s specific risk areas. Ready to use in the client debrief.' },
            { label: 'Manager compatibility', desc: 'When the hiring manager is profiled: a compatibility read and predicted friction points. The differentiator no other firm offers.' },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '20px 0', borderTop: i > 0 ? '1px solid var(--p-b0)' : 'none', display: 'flex', gap: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--p-t0)', width: 160, flexShrink: 0, margin: 0, lineHeight: 1.5 }}>{item.label}</p>
              <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <Link href="/sample-report" style={{ fontSize: 13, fontWeight: 500, color: 'var(--p-t2)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
            View a sample report &rarr;
          </Link>
        </div>
      </section>

      {/* Objections */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 32 }}>
          Questions We Hear
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          {OBJECTIONS.map((item, i) => (
            <div key={i} style={{ padding: '20px 0', borderTop: i > 0 ? '1px solid var(--p-b0)' : 'none' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--p-t0)', marginBottom: 8, lineHeight: 1.4 }}>{item.q}</p>
              <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 80px' }}>
        <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)', marginBottom: 20, maxWidth: 480, lineHeight: 1.3 }}>
          Walk through a live search scenario with us. Thirty minutes.
        </p>
        <a href={`mailto:${COMPANY_EMAIL}?subject=Executive%20Search%20Walkthrough`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 44, padding: '0 32px', background: '#ffffff', color: '#000000', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Request a walkthrough
        </a>
      </section>

      <Footer />
    </div>
  )
}
