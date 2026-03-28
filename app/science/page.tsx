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

const INSTRUMENTS = [
  { name: 'IPIP-NEO', n: '307,313', items: '300 items', measures: 'Five-factor personality with 30 facets. The most comprehensive public-domain personality instrument.', source: 'Johnson (2014), IPIP' },
  { name: 'IPIP-FFM', n: '922,541', items: '50 items', measures: 'Five-factor personality at the domain level. High efficiency for large-scale norming.', source: 'Goldberg (1992), IPIP' },
  { name: '16PF Factor E', n: '49,159', items: '10 items', measures: 'Dominance. Assertiveness and influence in interpersonal interactions.', source: 'Cattell & Mead (2008), IPIP proxy' },
]

const DIMENSIONS = [
  { name: 'Execution', mapping: '16PF Factor E (Dominance)', desc: 'Assertiveness, decisiveness, and willingness to take charge in ambiguous situations. Maps to drive toward results and ownership of outcomes.' },
  { name: 'Collaboration', mapping: 'IPIP Extraversion', desc: 'Comfort with people, energy in group settings, and preference for collaborative work. Predicts alignment in roles requiring sustained stakeholder management.' },
  { name: 'Adaptability', mapping: 'IPIP Neuroticism (inverted)', desc: 'Emotional steadiness and tolerance for change. Inverted: high scores reflect calm, fast-paced response to shifting environments.' },
  { name: 'Ownership', mapping: 'IPIP Conscientiousness', desc: 'Preference for planning, attention to detail, and adherence to process. Reflects accountability orientation and commitment to structure.' },
]

const CITATIONS = [
  { authors: 'Smith & Canger (2004)', finding: 'Supervisor\u2013subordinate personality similarity predicts subordinate job satisfaction and supervisor performance ratings.', means: 'A candidate who works the same way as their manager is more satisfied and rated more highly \u2014 regardless of skill.' },
  { authors: 'Kristof-Brown et al. (2005)', finding: 'Person\u2013supervisor fit has significant effects on job satisfaction, organizational commitment, and intent to quit.', means: 'Fit between candidate and supervisor predicts whether someone stays, not just whether they perform.' },
  { authors: 'Sears & Rowe (2003)', finding: 'Personality congruence between manager and employee predicts team performance and retention.', means: 'Personality match between manager and employee is one of the strongest predictors of long-term retention.' },
]

const LIMITATIONS = [
  `No internal validity study has been conducted on the ${PRODUCT_NAME} instrument itself. All psychometric claims reference the underlying IPIP and 16PF source instruments.`,
  'Behavioral profiles are a supplement to structured interviews, not a replacement.',
  'Fit scores are decision-support tools, never screening filters. They should not be used to reject candidates.',
  'Boundary profiles\u2014candidates who score near the midpoint on multiple dimensions\u2014require additional nuance in interpretation.',
]

export default function SciencePage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh', color: 'var(--p-t0)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: '88px var(--p-sp) 68px', borderBottom: '1px solid var(--p-b0)' }}>
        <h1 className="text-[40px] md:text-[52px]" style={{ fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'var(--p-t0)', marginBottom: 18 }}>
          Not our proprietary model. Published science, applied to hiring decisions.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--p-t2)', lineHeight: 1.6, maxWidth: 540 }}>
          We didn&apos;t build the underlying psychology — we applied it. Every instrument {PRODUCT_NAME} uses has been validated across millions of people in peer-reviewed studies.
        </p>
      </section>

      {/* Instruments */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 32 }}>
          The Instruments
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
          {INSTRUMENTS.map(inst => (
            <div key={inst.name} style={{ background: 'var(--p-bg2)', border: '1px solid var(--p-b0)', borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)', marginBottom: 4 }}>{inst.name}</h3>
              <p style={{ fontSize: 11, color: 'var(--p-t3)', marginBottom: 16, letterSpacing: '0.02em' }}>
                n = {inst.n} &middot; {inst.items}
              </p>
              <p style={{ fontSize: 14, color: 'var(--p-t1)', lineHeight: 1.7, marginBottom: 12 }}>{inst.measures}</p>
              <p style={{ fontSize: 11, color: 'var(--p-t3)' }}>{inst.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Four Dimensions */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 16 }}>
          The Four Measured Dimensions
        </p>
        <p style={{ fontSize: 14, color: 'var(--p-t2)', lineHeight: 1.7, maxWidth: 560, marginBottom: 32 }}>
          The assessment directly measures four dimensions. In reports, these are displayed as five role-relevant composites (Execution, Ownership, Adaptability, Collaboration, Decision Speed) — each a weighted combination of the four measured dimensions optimized for workforce prediction.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DIMENSIONS.map((dim, i) => (
            <div key={dim.name} style={{ padding: '24px 0', borderTop: i > 0 ? '1px solid var(--p-b0)' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--p-t0)' }}>{dim.name}</h3>
                <p style={{ fontSize: 11, color: 'var(--p-t3)', letterSpacing: '0.02em', marginBottom: 4 }}>{dim.mapping}</p>
                <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, maxWidth: 560 }}>{dim.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Norms */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 24 }}>
          The Norms
        </p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '24px 32px', textAlign: 'center', flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>1,229,854</p>
            <p style={{ fontSize: 13, color: '#888', marginTop: 8, margin: 0, marginBlockStart: 8 }}>Primary Responses</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '24px 32px', textAlign: 'center', flex: 1, minWidth: 180 }}>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>2,245,096</p>
            <p style={{ fontSize: 13, color: '#888', marginTop: 8, margin: 0, marginBlockStart: 8 }}>Cross-Validated Total</p>
          </div>
        </div>
        <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, maxWidth: 560, marginBottom: 12 }}>
          Percentile tables built from actual sorted distributions across 8 independent datasets. Binary search lookup against real rank-order data. Not parametric approximations.
        </p>
        <p style={{ fontSize: 13, color: 'var(--p-t3)', lineHeight: 1.7, maxWidth: 560 }}>
          These norms reflect a general adult population across 8 public-domain datasets, not a job-applicant sample. The cross-validated total of 2.2M includes all sources; the 1.2M primary population is what drives dimension scoring.
        </p>
      </section>

      {/* Team Fit Science */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 56px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 16 }}>
          Team Fit Science
        </p>
        <p style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.8, maxWidth: 560, marginBottom: 32 }}>
          The strongest predictor of whether a placed candidate stays isn&apos;t their skill — it&apos;s whether their behavioral pattern matches their manager&apos;s. Three peer-reviewed studies back this up.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {CITATIONS.map((cite, i) => (
            <div key={cite.authors} style={{ padding: '20px 0', borderTop: i > 0 ? '1px solid var(--p-b0)' : 'none' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--p-t0)', marginBottom: 4, letterSpacing: '-0.01em' }}>{cite.authors}</p>
              <p style={{ fontSize: 14, color: 'var(--p-t1)', lineHeight: 1.7 }}>{cite.finding}</p>
              <p style={{ fontSize: 14, color: '#AAAAAA', fontStyle: 'italic', lineHeight: 1.7, marginTop: 6 }}>What this means: {cite.means}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Limitations */}
      <section style={{ borderTop: '1px solid var(--p-b0)', padding: '56px var(--p-sp) 80px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 24 }}>
          What {PRODUCT_NAME} Is and Isn&apos;t
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 32 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {LIMITATIONS.map((item, i) => (
              <li key={i} style={{ fontSize: 15, color: 'var(--p-t1)', lineHeight: 1.7, paddingLeft: 16, borderLeft: '2px solid var(--p-b1)', maxWidth: 600 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  )
}
