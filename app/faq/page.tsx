'use client'

import { useState } from 'react'
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

interface FAQItem {
  q: string
  a: string
}

interface FAQGroup {
  label: string
  items: FAQItem[]
}

const FAQ_DATA: FAQGroup[] = [
  {
    label: 'Science & Validity',
    items: [
      {
        q: 'Is this scientifically validated?',
        a: `${PRODUCT_NAME} is built on the IPIP-NEO, IPIP-FFM, and 16PF Factor E\u2014three of the most validated public-domain instruments in personality science. All three map to the Big Five framework. The norming tables are derived from 1.2 million primary responses across 8 independent datasets.`,
      },
      {
        q: 'How is this different from MBTI or DISC?',
        a: `The Big Five model (which ${PRODUCT_NAME} uses) is the only personality framework consistently validated for workplace prediction. MBTI is typological\u2014it assigns categories rather than measuring traits on a continuum. DISC has weaker psychometric backing and limited normative data compared to the IPIP instruments.`,
      },
      {
        q: 'Is this EEOC compliant?',
        a: `${PRODUCT_NAME} is a decision-support tool, never a screening filter. Scores are guidance for interviewers, not pass/fail gates. No candidate should be rejected on the basis of a behavioral profile alone.`,
      },
      {
        q: 'What\u2019s the sample size?',
        a: '1,229,854 primary responses across the three source instruments. 2,245,096 cross-validated responses. 8 independent datasets in total.',
      },
    ],
  },
  {
    label: 'How It Works',
    items: [
      {
        q: 'How long does the assessment take?',
        a: '6 minutes. It runs on any mobile device or desktop browser. No app download required.',
      },
      {
        q: 'Can candidates game it?',
        a: 'The assessment presents 80 adjectives that require internal consistency across two separate pages. Systematic faking is difficult because candidates cannot see how individual adjectives map to dimensions, and inconsistencies between the two pages are detectable.',
      },
      {
        q: 'What does adaptation stress mean?',
        a: 'Adaptation stress is the gap between how you naturally are (Page 1) and how you think others expect you to act (Page 2). A large gap on any dimension suggests the candidate is spending energy conforming to perceived expectations, which can predict burnout or disengagement over time.',
      },
      {
        q: 'What if someone retakes it?',
        a: 'Both results are stored. Consistency across retakes is itself diagnostic\u2014stable profiles indicate high self-awareness, while significant shifts may indicate context-dependent behavior.',
      },
    ],
  },
  {
    label: 'Who Can Use It',
    items: [
      {
        q: 'Does this work with staffing firms?',
        a: `Yes. ${PRODUCT_NAME} was built specifically for staffing firms and recruiting agencies who need to present behavioral data to clients alongside candidate submissions.`,
      },
      {
        q: 'Can I use this for executive placements?',
        a: 'Yes. The 16 behavioral profiles cover the full range from entry-level to C-suite. The report format and language are designed for board-level presentation.',
      },
      {
        q: 'What industries?',
        a: 'All industries. The four behavioral dimensions are universal across roles and sectors. Current clients operate in construction, automotive, and industrial services.',
      },
    ],
  },
  {
    label: 'Results',
    items: [
      {
        q: 'How accurate are the profiles?',
        a: 'Behavioral profiles are one input among many in a hiring decision. Research shows that structured behavioral data is more predictive of job performance than unstructured interviews alone. The profile should inform interview questions, not replace them.',
      },
      {
        q: 'What\u2019s the fit score based on?',
        a: 'The fit score measures the gap between a candidate\u2019s behavioral scores and the behavioral target set for the role. Each dimension is weighted by its importance to the position. A high fit score means the candidate\u2019s natural tendencies align closely with what the role demands.',
      },
    ],
  },
  {
    label: 'Hiring Manager Feature',
    items: [
      {
        q: 'What is interviewer calibration?',
        a: `Interviewer calibration uses the hiring manager\u2019s own behavioral profile to surface similar-to-me bias. Research shows managers unconsciously favor candidates who share their personality traits. By making this visible, ${PRODUCT_NAME} helps interviewers evaluate candidates on role fit rather than personal similarity.`,
      },
      {
        q: 'Does the hiring manager have to take a test?',
        a: 'Same 6-minute adjective checklist as the candidate. It only needs to be completed once and is stored permanently for all future searches with that hiring manager.',
      },
      {
        q: 'Is the hiring manager profile shared with candidates?',
        a: 'No. The hiring manager\u2019s profile is visible only to the recruiter. Candidates never see manager data.',
      },
    ],
  },
]

function Accordion({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--p-b0)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: '#ffffff', lineHeight: 1.4, paddingRight: 24 }}>{q}</span>
        <span style={{ fontSize: 18, color: 'var(--p-t3)', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'var(--p-t1)', lineHeight: 1.7, maxWidth: 600 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div style={{ background: 'var(--p-bg)', minHeight: '100vh', color: 'var(--p-t0)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: '88px var(--p-sp) 68px', borderBottom: '1px solid var(--p-b0)' }}>
        <h1 className="text-[40px] md:text-[52px]" style={{ fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'var(--p-t0)' }}>
          Frequently asked questions
        </h1>
      </section>

      {/* FAQ Groups */}
      <div style={{ padding: '0 var(--p-sp)' }}>
        {FAQ_DATA.map((group, gi) => (
          <section key={group.label} style={{ paddingTop: 48, paddingBottom: 16, borderTop: gi > 0 ? '1px solid var(--p-b0)' : 'none' }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--p-t3)', textTransform: 'uppercase', marginBottom: 8 }}>
              {group.label}
            </p>
            <div>
              {group.items.map(item => (
                <Accordion key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section style={{ marginTop: 72, padding: 48, background: 'rgba(255,255,255,0.04)', borderRadius: 16, textAlign: 'center' as const }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Still have questions?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 32px' }}>
          Talk to someone who knows the product. We&apos;ll walk you through how it fits your workflow before you commit to anything.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const }}>
          <a href={`mailto:${COMPANY_EMAIL}?subject=${PRODUCT_NAME} Demo`} style={{ background: '#fff', color: '#000', height: 44, padding: '0 28px', borderRadius: 8, fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            Request a Demo
          </a>
          <a href={`mailto:${COMPANY_EMAIL}`} style={{ background: 'transparent', color: '#fff', height: 44, padding: '0 28px', borderRadius: 8, fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
            Email Us
          </a>
        </div>
      </section>

      <div style={{ paddingBottom: 60 }} />

      <Footer />
    </div>
  )
}
