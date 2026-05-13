import Link from 'next/link'
import { PRODUCT_NAME, COMPANY_NAME, COMPANY_EMAIL } from '@/lib/brand'

export const metadata = {
  title: `Privacy Policy — ${PRODUCT_NAME}`,
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">{PRODUCT_NAME}</Link>
          <nav className="text-sm text-gray-500 space-x-4">
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: {/* TODO: insert date before publishing */}
        </p>

        <p className="text-gray-700 mb-8">
          This Privacy Policy describes how {COMPANY_NAME} ("{PRODUCT_NAME}," "we," "us," or "our") collects,
          uses, and discloses personal information when you use the {PRODUCT_NAME} platform and related
          services (collectively, the "Services").
        </p>

        <Section title="1. Who This Policy Covers">
          <p>This policy applies to three categories of people:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Clients</strong> — executive search firms and their employees who access the recruiter dashboard</li>
            <li><strong>Hiring organizations</strong> — corporate clients of those search firms who access the client portal</li>
            <li><strong>Candidates</strong> — individuals who complete a {PRODUCT_NAME} behavioral assessment</li>
          </ul>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="font-semibold text-gray-900 mt-4 mb-2">2.1 Information Candidates Provide</h3>
          <p>When a candidate completes a {PRODUCT_NAME} assessment:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Name and contact information (name, email, phone — as provided by the recruiting firm)</li>
            <li>Assessment responses — selections from a behavioral adjective inventory (forced-choice; no free-text)</li>
            <li>Timing data — how long each page was open (used solely to detect incomplete responses, not to score behavior)</li>
            <li>Consent acknowledgment — timestamp and IP address at the moment of consent</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> collect demographic information (race, gender, age, disability status), employment history, compensation data, or social media profiles — unless you separately provide them.</p>

          <h3 className="font-semibold text-gray-900 mt-4 mb-2">2.2 Information Clients and Hiring Organizations Provide</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Account registration data: name, work email, firm name</li>
            <li>Job and search configuration data: job titles, role descriptions, target profiles</li>
            <li>Recruiter notes and internal workflow data</li>
          </ul>

          <h3 className="font-semibold text-gray-900 mt-4 mb-2">2.3 Information We Collect Automatically</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Log data: IP address, browser type, pages visited, timestamps</li>
            <li>Cookies and session tokens: authentication session cookies (HttpOnly, SameSite=Lax)</li>
            <li>Usage data: feature interactions within the dashboard</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> use third-party advertising trackers or behavioral advertising.</p>
        </Section>

        <Section title="3. How We Use Information">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide and operate the Services</li>
            <li>Deliver assessment results to the recruiting firm</li>
            <li>Send invitation and portal access emails</li>
            <li>Maintain audit logs for compliance</li>
            <li>Improve the platform using aggregated, de-identified data</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> sell personal information. We do not use candidate assessment data to train AI models without explicit written agreement.</p>
        </Section>

        <Section title="4. How We Share Information">
          <p><strong>Sub-processors.</strong> We use the following third-party services:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Vercel Inc. — hosting and edge delivery</li>
            <li>Neon Technologies Inc. — managed PostgreSQL database</li>
            <li>Anthropic PBC — AI role classification (job description text only; no candidate PII)</li>
            <li>SendGrid (Twilio Inc.) — transactional email</li>
          </ul>
          <p className="mt-3"><strong>Recruiting firm clients.</strong> Assessment results are shared with the recruiting firm that invited the candidate. The firm may share a white-labeled version with their corporate client. Recruiter-internal notes are never shared with the hiring organization.</p>
          <p className="mt-3"><strong>Legal requirements.</strong> We may disclose information if required by law or valid legal process.</p>
        </Section>

        <Section title="5. Candidate Rights">
          <p>Regardless of your jurisdiction, you may:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your assessment data (processed within 30 days)</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Withdrawal:</strong> Withdraw consent (does not affect prior processing)</li>
          </ul>
          <p className="mt-3">To exercise any right, email <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>. We will respond within 30 days at no charge.</p>
        </Section>

        <Section title="6. Data Retention">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Candidate assessment results: 2 years from completion, or until deletion request</li>
            <li>Audit logs: 1 year</li>
            <li>Account and firm data: duration of the client relationship + 3 years</li>
          </ul>
        </Section>

        <Section title="7. Security">
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Data encrypted in transit via TLS 1.2+</li>
            <li>Data encrypted at rest via database-level encryption</li>
            <li>Multi-tenant isolation — every query is scoped to the authenticated organization</li>
            <li>Authentication with bcrypt-hashed passwords</li>
            <li>Short-lived, revocable portal access tokens stored as HttpOnly cookies</li>
          </ul>
          <p className="mt-3">We will notify affected users and relevant authorities within 72 hours of becoming aware of a data breach.</p>
        </Section>

        <Section title="8. Children">
          <p>The Services are not directed to individuals under 18. If you believe we have collected information from a minor, contact us immediately.</p>
        </Section>

        <Section title="9. Changes">
          <p>We will post updated policies at this URL and update the "Last updated" date. For material changes affecting candidates, we will provide notice via the dashboard or invitation email.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            {COMPANY_NAME}<br />
            Email: <a href={`mailto:${COMPANY_EMAIL}`} className="text-blue-600 hover:underline">{COMPANY_EMAIL}</a>
          </p>
        </Section>
      </main>

      <footer className="border-t border-gray-200 py-6 px-6 text-center text-sm text-gray-400">
        <span>© {new Date().getFullYear()} {COMPANY_NAME}. </span>
        <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-700 space-y-2">{children}</div>
    </section>
  )
}
