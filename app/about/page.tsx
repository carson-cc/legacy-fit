import Link from 'next/link'
import { PRODUCT_NAME, COMPANY_NAME, COMPANY_EMAIL } from '@/lib/brand'

export const metadata = {
  title: `About — ${PRODUCT_NAME}`,
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">{PRODUCT_NAME}</Link>
          <nav className="text-sm text-gray-500 space-x-6">
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/demo" className="hover:text-gray-900">Request demo</Link>
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About {PRODUCT_NAME}</h1>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What we do</h2>
          <p className="text-gray-700 mb-4">
            {PRODUCT_NAME} gives executive search firms a structured behavioral data layer they can
            actually use in their process. Candidates complete a short forced-choice adjective
            inventory. {PRODUCT_NAME} scores them against a 2.245 million-profile normative database
            and against the recruiter's target profile for the role. The recruiter gets a one-page
            report they can present confidently. The hiring organization gets a white-labeled portal
            to review the shortlist.
          </p>
          <p className="text-gray-700 mb-4">
            We built {PRODUCT_NAME} because the tools that existed were either too expensive
            ($300–$800 per assessment, certification required), too generic (consumer personality
            tests not built for search), or buried in a larger HR platform that a boutique firm
            would never buy.
          </p>
          <p className="text-gray-700">
            {PRODUCT_NAME} does one thing: it makes the shortlist debrief defensible. The recruiter
            still makes the recommendation. We just give them data to stand behind it.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Methodology</h2>
          <p className="text-gray-700 mb-4">
            The behavioral inventory is grounded in the DISC model — a framework with over 60 years
            of applied use in organizational psychology. The forced-choice format reduces social
            desirability bias relative to Likert-style self-reports. Scores are percentile-ranked
            against a 2.245 million-profile normative sample.
          </p>
          <p className="text-gray-700 mb-4">
            We are transparent about what we don't claim: {PRODUCT_NAME} has not been the subject
            of an independent criterion-validity study. Our scores are grounded in a well-validated
            framework (Barrick &amp; Mount, 1991; Schmidt &amp; Hunter, 1998), but we haven't yet
            published data correlating {PRODUCT_NAME} scores with specific job performance outcomes.
            That study is on the roadmap.
          </p>
          <p className="text-gray-700">
            We recommend using {PRODUCT_NAME} as one structured input alongside structured interviews
            and reference checks — not as a standalone screening filter.
          </p>
          <p className="mt-4">
            <Link href="/docs/sales/methodology.md" className="text-blue-600 hover:underline text-sm">
              Read the full methodology one-pager →
            </Link>
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">The team</h2>
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {/* TODO: Replace with founder name */}
              [Founder name]
            </h3>
            <p className="text-sm text-gray-500 mb-3">Founder &amp; CEO</p>
            <p className="text-gray-700">
              {/* TODO: Replace with founder bio — 2-3 sentences on background relevant to executive search and behavioral science */}
              [Founder bio — background in executive search, talent assessment, or related field. What motivated building Veltro.]
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
          <p className="text-gray-700 mb-2">
            For sales and demo requests:{' '}
            <Link href="/demo" className="text-blue-600 hover:underline">Request a demo</Link>
          </p>
          <p className="text-gray-700 mb-2">
            For privacy or data requests:{' '}
            <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>
          </p>
          <p className="text-gray-700">
            For everything else:{' '}
            <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 px-6 text-center text-sm text-gray-400">
        <span>© {new Date().getFullYear()} {COMPANY_NAME}. </span>
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
      </footer>
    </div>
  )
}
