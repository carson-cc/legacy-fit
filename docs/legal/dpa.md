# Data Processing Agreement

**GDPR Article 28 — Controller-Processor Agreement**

**[TODO: Attorney review before use. This DPA is a starting point; attorney must review for compliance with GDPR Art. 28, applicable SCCs if data is transferred outside EEA, and any UK GDPR / Swiss DPA requirements.]**

This Data Processing Agreement ("DPA") is entered into between:

**Controller:** [Client legal name] ("Client," "Controller")  
**Processor:** [TODO: Legal entity name] ("Veltro," "Processor")

and forms part of the Master Services Agreement ("MSA") between the parties.

---

## 1. Definitions

"**Data Protection Laws**" means GDPR, UK GDPR, Swiss DPA, and any other applicable data protection legislation.

"**Personal Data**," "**Processing**," "**Data Subject**," "**Controller**," "**Processor**," and "**Supervisory Authority**" have the meanings given under GDPR.

"**Services Personal Data**" means personal data processed by Veltro on behalf of Client in the course of providing the Services.

---

## 2. Scope and Roles

2.1 Client is the Controller of Services Personal Data. Veltro is the Processor.

2.2 Veltro will process Services Personal Data only on documented instructions from Client, including as set forth in this DPA and the MSA.

---

## 3. Description of Processing

| Element | Details |
|---|---|
| **Subject matter** | Provision of the Veltro executive search intelligence platform |
| **Duration** | For the Subscription Term and any post-termination data retention period |
| **Nature of processing** | Storage, retrieval, structuring, analysis, transmission to authorized users |
| **Purpose** | Behavioral assessment scoring, candidate pipeline management, client portal delivery |
| **Types of personal data** | Candidate: name, email, phone, assessment responses, timing data, IP address at consent. Recruiter: name, work email, usage logs. Client contact: name, work email. |
| **Categories of data subjects** | Executive search candidates; recruiting firm employees; hiring organization contacts |

---

## 4. Processor Obligations

4.1 **Lawfulness.** Veltro will process Services Personal Data only on Client's documented instructions, unless required by applicable law. Veltro will inform Client if an instruction infringes Data Protection Laws.

4.2 **Confidentiality.** Veltro will ensure that persons authorized to process Services Personal Data are bound by appropriate confidentiality obligations.

4.3 **Security.** Veltro will implement the technical and organizational measures described in Annex II (Security Measures) to protect Services Personal Data.

4.4 **Sub-processing.** Veltro will not engage a sub-processor without Client's prior authorization. Client authorizes the sub-processors listed in Annex I. Veltro will: (a) impose substantially equivalent data protection obligations on each sub-processor; (b) remain liable to Client for sub-processor performance.

4.5 **Data subject rights.** Veltro will assist Client, to the extent technically feasible, in responding to data subject rights requests (access, rectification, erasure, restriction, portability, objection). Client is responsible for determining whether and how to respond.

4.6 **Security incidents.** Veltro will notify Client without undue delay (and within 72 hours where feasible) upon becoming aware of a personal data breach affecting Services Personal Data. The notice will include: (a) nature of the breach; (b) categories and approximate number of data subjects and records concerned; (c) likely consequences; (d) measures taken or proposed.

4.7 **DPIAs.** Veltro will provide reasonable assistance to Client in conducting data protection impact assessments where required.

4.8 **Audit.** Upon reasonable written notice (at least 30 days), Veltro will make available to Client all information necessary to demonstrate compliance with this DPA and allow for audits (including inspections) conducted by Client or a mandated auditor. Audit costs are borne by Client unless a breach is found.

4.9 **Return or deletion.** Upon termination, Veltro will, at Client's election, return or delete all Services Personal Data, within 30 days, and certify such deletion in writing. Veltro may retain data if required by applicable law, subject to confidentiality obligations.

---

## 5. Controller Obligations

Client warrants that: (a) it has a lawful basis for transferring Services Personal Data to Veltro; (b) it has provided all required notices and obtained all required consents from data subjects; (c) its instructions to Veltro comply with Data Protection Laws.

---

## 6. International Transfers

<!-- TODO: Attorney — complete this section based on transfer mechanism. If data is transferred from EEA to the US, either Standard Contractual Clauses (Module 2 — controller to processor) or another transfer mechanism must be in place. -->

6.1 To the extent that processing involves a transfer of Services Personal Data from the EEA, UK, or Switzerland to a country not recognized as providing adequate protection, the parties agree to execute the applicable Standard Contractual Clauses as specified by the relevant Supervisory Authority.

6.2 [TODO: Attorney — attach SCCs as Annex III if required.]

---

## Annex I — Authorized Sub-processors

| Sub-processor | Entity | Country | Purpose |
|---|---|---|---|
| Vercel Inc. | Vercel, Inc. | USA | Hosting and edge delivery |
| Neon Technologies Inc. | Neon Technologies, Inc. | USA | Managed PostgreSQL database |
| Anthropic PBC | Anthropic, PBC | USA | AI role classification (job text only, no candidate PII) |
| SendGrid | Twilio Inc. | USA | Transactional email delivery |

Veltro will maintain an up-to-date sub-processor list and notify Client of intended changes with at least 10 days' prior notice. Client may object in writing within that period.

---

## Annex II — Technical and Organizational Security Measures

**Access control**
- Authentication via NextAuth.js with bcrypt-hashed passwords
- Role-based access control (owner / admin / member) enforced server-side
- Client portal access via short-lived, revocable magic-link tokens stored as HttpOnly cookies
- No hardcoded credentials or secrets in source code

**Network security**
- All data in transit encrypted via TLS 1.2+
- No open ports beyond HTTPS (443)

**Data separation**
- Multi-tenant isolation: all database queries are scoped to the authenticated organization's `orgId`
- Cross-tenant isolation tested on every release via automated test suite
- Portal users are scoped to their specific job and cannot access other jobs within the same org

**Data at rest**
- Encrypted at rest via Neon's default AES-256 encryption
- Neon provides automated daily backups with point-in-time recovery

**Incident response**
- Veltro will notify Client within 72 hours of becoming aware of a personal data breach

**Personnel**
- Employees with access to production data are subject to confidentiality obligations

**Audit logs**
- All significant system events (login, data access, stage changes) are logged to an immutable EventLog table, scoped per organization, retained for 1 year

---

## Annex III — Standard Contractual Clauses

<!-- TODO: Attorney — attach applicable SCCs here if an international transfer mechanism is required. -->

[To be completed if required.]

---

*This DPA is incorporated into and forms part of the MSA. In case of conflict, this DPA governs with respect to data protection matters.*

**[TODO: Legal entity name]** | **[Client legal name]**
Signature: ___________________ | Signature: ___________________
Date: | Date:
