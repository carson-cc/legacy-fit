import Link from 'next/link'
import { PRODUCT_NAME, COMPANY_NAME } from '@/lib/brand'

export const metadata = {
  title: `Pricing — ${PRODUCT_NAME}`,
}

const TIERS = [
  {
    name: 'Design Partner',
    price: '$500',
    perAssessment: '$200',
    description: 'Early access in exchange for structured feedback. Capped at 5 customers.',
    features: [
      '12-month commitment',
      'Up to 5 active searches at once',
      'Full platform access',
      'Direct line to the roadmap',
      'Monthly feedback call with the founder',
    ],
    note: 'Capped at 5 design partners total.',
    cta: 'Talk to sales',
    highlight: false,
  },
  {
    name: 'Boutique',
    price: '$1,500',
    perAssessment: '$150',
    description: 'For boutique retained search firms running 20–60 searches per year.',
    features: [
      'Unlimited active searches',
      'White-labeled client portal (firm brand)',
      'Bulk candidate import (CSV)',
      'Team access (unlimited users)',
      'Audit log',
    ],
    note: null,
    cta: 'Talk to sales',
    highlight: true,
  },
  {
    name: 'Firm',
    price: '$4,500',
    perAssessment: '$100',
    description: 'For larger retained search firms. Includes white-label branding on all surfaces.',
    features: [
      'Everything in Boutique',
      'White-label branding (logo, colors, partner contact)',
      'Priority support',
      'Custom onboarding',
      'Multi-office team management',
    ],
    note: null,
    cta: 'Talk to sales',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">{PRODUCT_NAME}</Link>
          <nav className="text-sm text-gray-500 space-x-6">
            <Link href="/about" className="hover:text-gray-900">About</Link>
            <Link href="/demo" className="hover:text-gray-900">Request demo</Link>
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Platform fee billed monthly. Assessments billed on submission — invitations that aren't completed don't cost anything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.highlight
                  ? 'border-blue-500 bg-white shadow-lg'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.highlight && (
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                  Most popular
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                + {tier.perAssessment} per completed assessment
              </div>
              <p className="text-sm text-gray-600 mb-6">{tier.description}</p>

              <ul className="space-y-2 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {tier.note && (
                <p className="text-xs text-gray-400 mb-4">{tier.note}</p>
              )}

              <Link
                href="/demo"
                className={`w-full text-center py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                  tier.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently asked questions</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <Faq q="When does the per-assessment fee apply?">
              The fee applies when a candidate submits their assessment. Invitations that expire or
              are never opened are not charged.
            </Faq>
            <Faq q="Can I try it before committing?">
              Yes — the Design Partner tier is structured as a trial with a formal commitment.
              Talk to us about running a single search as a pilot before signing.
            </Faq>
            <Faq q="What's the white-label branding?">
              Boutique and Firm plans include a white-labeled client portal — your firm logo, primary
              color, and partner contact. Candidates and hiring organizations see your brand, not Veltro's.
            </Faq>
            <Faq q="Do you offer annual billing?">
              The Design Partner tier is 12-month by design. Annual billing for Boutique and Firm
              is available at a discount — ask us.
            </Faq>
            <Faq q="Is there a setup fee or implementation cost?">
              No. You can go from signed agreement to first assessment in under 30 minutes.
            </Faq>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-sm text-gray-400">
        <span>© {new Date().getFullYear()} {COMPANY_NAME}. </span>
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
      </footer>
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{q}</h3>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  )
}
