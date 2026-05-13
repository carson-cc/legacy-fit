# Veltro Security Overview

## Hosting

Veltro runs on **Vercel** (application layer) and **Neon** (managed PostgreSQL). Both are SOC 2
Type II certified infrastructure providers operating in the United States.

- Vercel edge network: 99.99% uptime SLA, DDoS mitigation, global CDN
- Neon: serverless Postgres with automated backups, point-in-time recovery, and multi-region
  replication options

## Encryption

| Layer | Method |
|---|---|
| Data in transit | TLS 1.2+ enforced on all connections (HTTPS everywhere, no HTTP fallback) |
| Data at rest | AES-256 encryption via Neon's default database encryption |
| Passwords | bcrypt with cost factor 12 |
| Portal tokens | Cryptographically random cuid2 tokens (25 chars, ~125 bits of entropy) |

## Authentication and access control

- **Recruiter accounts:** Email/password authentication via NextAuth.js. Sessions are stored
  server-side as signed JWTs; user existence is re-verified on every privileged request.
- **Role-based access:** Three roles — owner, admin, member — enforced server-side on every API
  route. Role checks cannot be bypassed from the client.
- **Client portal:** Hiring organization contacts access candidate shortlists via a single-use,
  time-limited magic-link token sent by email. Tokens are stored as HttpOnly, SameSite=Lax cookies
  and are revocable instantly by the recruiting firm.
- **Candidate assessment:** Candidates access assessments via unique one-time tokens included in
  invitation emails. Tokens expire after use.

## Multi-tenant isolation

Every database query in Veltro is scoped to the authenticated organization's `orgId`. This is
enforced by a server-side helper (`requireOrg()`) that resolves the caller's organization from the
session and injects it into every Prisma query. Routes that operate on records by URL parameter
additionally verify that the record belongs to the caller's organization before any mutation.

**Cross-tenant isolation is tested on every release** via an automated test suite
(`lib/__tests__/tenant-isolation.test.ts`) that seeds two independent organizations, attempts
cross-tenant data access through every lookup helper, and asserts that all cross-tenant queries
return empty or fail. No deployment passes CI without these tests.

## Data minimization

- Candidate assessment responses are stored as JSON (selected adjectives only)
- Timing data is captured per-page but is not scored or exposed to clients
- Recruiter notes are stored only within the recruiting firm's tenant; they are stripped before
  delivery to the hiring organization via the client portal
- Anthropic (AI sub-processor) receives only job description text for role classification — no
  candidate PII is sent to Anthropic

## Audit logging

Every significant system event is recorded in an immutable `EventLog` table:

- Candidate stage changes, off-limits flags, and portal approvals
- Client portal access (per-contact)
- Job and client creation/modification
- Authentication events

Audit logs are scoped per organization and retained for 1 year. Recruiters can query the audit
log from the Settings → Audit tab in the dashboard.

## Data deletion

Clients can request data deletion for a specific candidate by contacting
[TODO: privacy@yourdomain.com]. Veltro will delete the candidate's assessment result from the
primary database within 30 days. Neon backup snapshots may retain the data for up to an additional
7 days before rotation.

Recruiting firms can also self-serve candidate data deletion by contacting Veltro; this is on the
product roadmap as a dashboard feature.

## Sub-processors

| Sub-processor | Purpose | Data shared |
|---|---|---|
| **Vercel Inc.** | Application hosting and edge delivery | All request data transits Vercel |
| **Neon Technologies Inc.** | Managed PostgreSQL | All stored personal data |
| **Anthropic PBC** | AI role classification and benchmark generation | Job description text only — no candidate PII |
| **SendGrid (Twilio Inc.)** | Transactional email | Candidate name + email; recruiter name + email |

All sub-processors are bound by data processing agreements. Veltro maintains the right to audit
sub-processor compliance.

## What we don't do (yet)

The following are on the roadmap but not yet implemented:

- MFA / TOTP on recruiter accounts
- SSO (SAML / OIDC) for enterprise customers
- Penetration testing by a third party
- SOC 2 Type II certification for Veltro itself
- Rate-limiting on the client portal shortlist and report routes (currently rate-limited on the
  public report share route only)

We disclose these gaps proactively. Design Partner customers should factor them into their risk
assessment.

## Security contact

To report a security issue, email **[TODO: security@yourdomain.com]**. We will acknowledge within
48 hours and provide a fix timeline within 5 business days for confirmed vulnerabilities.
