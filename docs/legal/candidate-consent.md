# Candidate Consent Language

This file contains the consent text embedded in `/assess/[token]` before the assessment begins.
The consent screen renders this language from the `ConsentScreen` component.

---

## Display text (rendered on screen)

The following text should be shown on the consent screen. The candidate must check all three
checkboxes and click "I Agree, Begin Assessment" before proceeding. The timestamp and candidate
invite ID are recorded to `EventLog` when consent is given.

---

### Heading

**Before you begin**

*[Firm name] has invited you to complete a brief behavioral assessment as part of a search process.*

---

### What this assessment is

This is a behavioral adjective inventory — not a personality quiz and not a test with right or wrong
answers. You will see sets of adjectives and select the ones that describe how you naturally operate
at work. The assessment takes approximately 8–12 minutes.

---

### How your responses are used

Your responses will be scored automatically and shared with **[Firm name]** as part of their
evaluation for the **[Role title]** search. Specifically, they will see:

- A behavioral profile (e.g., "Pioneer" or "Conductor") — a summary of your working style
- A fit percentage against the target profile for this role
- A dimension breakdown across four areas: Dominance, Extroversion, Patience, and Formality

Your responses **will not** be used to: make automated hiring decisions without human review; train
AI models; score you for any other search without your separate consent; or be sold to third parties.

---

### Data retention

Your assessment results will be retained by **[Firm name]** and Veltro for **2 years** from
today, or until you request deletion, whichever is earlier.

---

### Your rights

You may request a copy, correction, or deletion of your assessment data at any time by emailing
**[privacy@yourdomain.com]**. You may withdraw your participation at any time before submitting;
once submitted, withdrawal means deletion of results — contact us and we will process it within
30 days.

---

### Checkboxes (all required)

- [ ] I understand this assessment will be shared with **[Firm name]** for the **[Role title]**
  search.
- [ ] I understand my results will be retained for up to 2 years and I can request deletion at any
  time.
- [ ] I consent to complete this assessment and have this data processed as described above.

---

### Button

**I Agree, Begin Assessment**

---

## Implementation notes

- Firm name and role title are resolved server-side from the `CandidateInvite` + `Job` + `Client`
  relations and injected into the page before render. Do not display raw IDs.
- The privacy contact email should be set via `PRIVACY_EMAIL` env var; fall back to the firm's
  `brandPartnerEmail` if set, otherwise to a generic placeholder.
- On "I Agree" click: POST to `/api/assess/[token]/consent` which writes an `EventLog` entry
  `{ event: 'candidate.consent', entityId: inviteId, orgId, userId: null }` and a timestamp,
  then advances the wizard state to the assessment.
- The consent record is the legal basis for processing. Do not allow the assessment to proceed
  without it.
- Declining (closing the tab or clicking "No thanks, exit") should show a confirmation message:
  "No problem. Your data has not been recorded. You can close this tab." Do not record anything.

---

## What is NOT captured

- Demographic information (age, gender, race, disability)
- Employment history, compensation, or LinkedIn profile
- Free-text answers (the assessment is forced-choice adjective selection only)

---

## Attorney review items

- [ ] Confirm this language meets GDPR Art. 7 consent requirements (freely given, specific,
  informed, unambiguous)
- [ ] Confirm the "2 years" retention period aligns with the Privacy Policy and DPA
- [ ] Confirm jurisdiction-specific additions (CCPA disclosure for California candidates, etc.)
- [ ] Confirm the right-to-withdraw language is accurate given your deletion workflow
