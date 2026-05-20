# Privacy Policy

**Effective date:** <!-- TODO: insert effective date before publishing -->  
**Last updated:** <!-- TODO: insert date before publishing -->

This Privacy Policy describes how **[TODO: Legal entity name]** ("Veltro," "we," "us," or "our") collects, uses, and discloses personal information when you use our executive search intelligence platform at [veltro.ai] and related services (collectively, the "Services").

---

## 1. Who This Policy Covers

This policy applies to three categories of people:

| Category | Description |
|---|---|
| **Clients** | Executive search firms and their employees who access the recruiter dashboard |
| **Hiring organizations** | Corporate clients of those search firms who access the client portal |
| **Candidates** | Individuals who complete a Veltro behavioral assessment |

---

## 2. Information We Collect

### 2.1 Information Candidates Provide

When a candidate completes a Veltro assessment:
- **Name and contact information** (name, email address, phone number — as provided by the recruiting firm)
- **Assessment responses** — selections from a behavioral adjective inventory (a forced-choice format; no free-text)
- **Timing data** — how long each assessment page was open (used solely to detect incomplete responses, not to score behavior)
- **Consent acknowledgment** — timestamp and IP address at the moment of consent

We do **not** collect: demographic information (race, gender, age, disability status), employment history, compensation data, or social media profiles — unless you separately provide them.

### 2.2 Information Clients and Hiring Organizations Provide

- Account registration data: name, work email, firm name
- Billing and invoicing contact information (invoicing handled outside the platform at this time)
- Job and search configuration data: job titles, role descriptions, target profiles
- Recruiter notes and internal workflow data added to a search

### 2.3 Information We Collect Automatically

- **Log data:** IP address, browser type, pages visited, timestamps
- **Cookies and session tokens:** authentication session cookies (HttpOnly, SameSite=Lax), portal access cookies
- **Usage data:** feature interactions within the dashboard

We do **not** use third-party advertising trackers, pixels, or behavioral advertising.

---

## 3. How We Use Information

| Purpose | Legal basis (GDPR) |
|---|---|
| Provide and operate the Services | Contract performance |
| Deliver assessment results to the recruiting firm | Legitimate interests (candidate has consented to the assessment) |
| Send invitation and portal access emails | Contract performance |
| Maintain audit logs for compliance | Legitimate interests |
| Improve the platform (aggregate, de-identified) | Legitimate interests |
| Comply with legal obligations | Legal obligation |

We do **not** sell personal information. We do not use candidate assessment data to train AI models without explicit written agreement.

---

## 4. How We Share Information

We share personal information only as described below:

**Sub-processors.** We use the following third-party services to operate the platform:

| Sub-processor | Purpose | Data shared |
|---|---|---|
| Vercel Inc. | Hosting and edge delivery | All request data transits Vercel infrastructure |
| Neon Technologies Inc. | Managed PostgreSQL database | All stored data |
| Anthropic PBC | AI-powered role classification and benchmark generation | Job description text only (no candidate PII) |
| SendGrid (Twilio Inc.) | Transactional email | Candidate name, email; recruiter name, email |

**Recruiting firm clients.** Assessment results (scores, profile, fit percentage) are shared with the recruiting firm that invited the candidate. The recruiting firm may share a white-labeled version with their corporate client (the hiring organization). Recruiter-internal notes are never shared with the hiring organization.

**Legal requirements.** We may disclose information if required by law, court order, or valid legal process.

**Business transfers.** If Veltro is acquired or merges, personal information may transfer as a business asset. We will notify affected users before any such transfer and before data becomes subject to a different privacy policy.

---

## 5. Candidate Rights

Candidates whose data we process have the following rights (regardless of jurisdiction — we apply these globally):

- **Access:** Request a copy of the personal information we hold about you.
- **Correction:** Request correction of inaccurate information.
- **Deletion:** Request deletion of your assessment data. We will delete candidate assessment results within 30 days of a verified request, subject to our retention obligations below.
- **Portability:** Receive your data in a structured, machine-readable format.
- **Withdrawal of consent:** If processing was based on consent, you may withdraw it. This does not affect processing already done.
- **Objection / restriction:** Object to or restrict certain processing.

To exercise any of these rights, email **[TODO: privacy@yourdomain.com]**. We will respond within 30 days. We do not charge a fee for reasonable requests.

---

## 6. Data Retention

| Data type | Retention period |
|---|---|
| Candidate assessment results | 2 years from completion, or until a deletion request, whichever is earlier |
| Audit logs | 1 year |
| Account and firm data | Duration of the client relationship + 3 years |
| Email logs (SendGrid) | 30 days on SendGrid; we do not retain them separately |

After the retention period, data is deleted from the primary database. Neon's backup snapshots may retain data for up to an additional 7 days.

---

## 7. Security

We implement the following measures:

- Data encrypted in transit via TLS 1.2+
- Data encrypted at rest via Neon's default database encryption
- Multi-tenant isolation: every database query is scoped to the authenticated organization; cross-tenant access is tested on every release
- Authentication via NextAuth.js with bcrypt-hashed passwords
- Client portal access via short-lived, revocable magic-link tokens (stored as HttpOnly cookies)
- No API keys or secrets in client-side JavaScript

We do not currently offer MFA or SSO. These are on the roadmap.

We will notify affected users and relevant authorities within 72 hours of becoming aware of a data breach, as required by applicable law.

---

## 8. Children

The Services are not directed to individuals under 18. We do not knowingly collect personal information from minors. If you believe we have collected information from a minor, contact us immediately.

---

## 9. International Transfers

Veltro operates on infrastructure in the United States (Vercel and Neon datacenters). If you are located in the European Economic Area, United Kingdom, or Switzerland, your personal data is transferred to the United States.

<!-- TODO: Attorney to specify transfer mechanism — Standard Contractual Clauses, adequacy decision, or other. -->

---

## 10. Changes to This Policy

We will post the updated policy at this URL and update the "Last updated" date. For material changes affecting candidates, we will provide notice via the assessment invitation email or the recruiter dashboard.

---

## 11. Contact

**Privacy inquiries:**  
[TODO: Legal entity name]  
[TODO: Registered address]  
Email: [TODO: privacy@yourdomain.com]

**For EU/UK data subjects:**  
[TODO: Attorney — specify EU representative if required under GDPR Art. 27]
