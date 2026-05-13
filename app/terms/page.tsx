import Link from 'next/link'
import { PRODUCT_NAME, COMPANY_NAME, COMPANY_EMAIL } from '@/lib/brand'

export const metadata = {
  title: `Terms of Service — ${PRODUCT_NAME}`,
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">{PRODUCT_NAME}</Link>
          <nav className="text-sm text-gray-500 space-x-4">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: {/* TODO: insert date before publishing */}
        </p>

        <p className="text-gray-700 mb-8">
          These Terms of Service ("Terms") govern your access to and use of the {PRODUCT_NAME} executive
          search intelligence platform and related services ("Services") provided by {COMPANY_NAME} ("Veltro," "we," "us").
          By creating an account or using the Services, you agree to these Terms.
        </p>

        <Section title="1. Services Description">
          <p>{PRODUCT_NAME} is a behavioral assessment platform for executive search professionals. It enables recruiting firms to invite candidates to complete behavioral assessments, generate scored reports, share curated shortlists with corporate clients via a branded portal, and manage search pipelines.</p>
          <p>The platform is <strong>not</strong> a consumer product. Access requires an active subscription held by a recruiting firm.</p>
        </Section>

        <Section title="2. Accounts and Access">
          <ul className="list-disc pl-6 space-y-1">
            <li>You must be at least 18 years old and authorized to act on behalf of your firm.</li>
            <li>You are responsible for maintaining the confidentiality of your credentials. Notify us immediately of unauthorized access.</li>
            <li>You agree to provide accurate registration information and keep it current.</li>
          </ul>
        </Section>

        <Section title="3. Acceptable Use">
          <p>You agree <strong>not</strong> to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Services to discriminate against candidates on the basis of any protected characteristic</li>
            <li>Share login credentials with individuals outside your organization</li>
            <li>Reverse-engineer, decompile, or attempt to extract the assessment item bank, scoring algorithm, or normative data</li>
            <li>Use the Services to assess anyone who has not provided informed consent via the {PRODUCT_NAME} consent screen</li>
            <li>Resell or white-label the platform without a written agreement with {PRODUCT_NAME}</li>
          </ul>
          <p className="mt-3 font-medium">Regarding employment law compliance.</p>
          <p>It is your responsibility — not {PRODUCT_NAME}'s — to ensure your use of assessment data complies with applicable employment laws, including EEOC guidelines and the Uniform Guidelines on Employee Selection Procedures. {PRODUCT_NAME} has not conducted a formal adverse-impact validation study on its assessment instruments.</p>
        </Section>

        <Section title="4. Candidate Consent">
          <p>Before sending a candidate a {PRODUCT_NAME} assessment invitation, you agree that you have:</p>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Disclosed to the candidate that they will complete a behavioral assessment</li>
            <li>Obtained the candidate's consent, either through the {PRODUCT_NAME} consent screen or your own documented process</li>
            <li>Informed the candidate of the firm commissioning the search</li>
          </ol>
        </Section>

        <Section title="5. Intellectual Property">
          <p>{PRODUCT_NAME} retains all rights in the platform, assessment items, scoring model, and normative database. You retain ownership of data you upload. You grant {PRODUCT_NAME} a license to process that data solely to provide the Services.</p>
          <p className="mt-2">{PRODUCT_NAME} may use de-identified, aggregated assessment data to improve the normative database. We will not publish or share individual-level data.</p>
        </Section>

        <Section title="6. Fees and Payment">
          <p>Fees are as agreed in your Order Form. Invoices are due within 30 days of the invoice date. {PRODUCT_NAME} may suspend access for accounts more than 30 days past due after written notice. Fees are non-refundable except as required by applicable law or as stated in your Order Form.</p>
        </Section>

        <Section title="7. Disclaimers">
          <p className="uppercase text-sm leading-relaxed">
            THE SERVICES ARE PROVIDED "AS IS." TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {PRODUCT_NAME.toUpperCase()} DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. {PRODUCT_NAME.toUpperCase()} DOES NOT WARRANT THAT ASSESSMENT RESULTS WILL PREDICT JOB PERFORMANCE FOR ANY PARTICULAR CANDIDATE OR ENSURE COMPLIANCE WITH EMPLOYMENT LAWS.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p className="uppercase text-sm leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, {PRODUCT_NAME.toUpperCase()}'S TOTAL LIABILITY WILL NOT EXCEED THE FEES PAID BY YOU IN THE THREE MONTHS PRECEDING THE CLAIM. IN NO EVENT WILL {PRODUCT_NAME.toUpperCase()} BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
          </p>
        </Section>

        <Section title="9. Term and Termination">
          <p>Either party may terminate with 30 days' written notice. Either party may terminate immediately for material breach that is not cured within 10 days of written notice. Upon termination, {PRODUCT_NAME} will provide a data export within 30 days upon request.</p>
        </Section>

        <Section title="10. Changes to These Terms">
          <p>We will notify you at least 14 days before material changes via email. Continued use after the effective date constitutes acceptance.</p>
        </Section>

        <Section title="11. Contact">
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
