# Multi-tenant migration — handoff

This document covers the schema and code changes that converted Veltro from a single-tenant prototype into a multi-tenant SaaS. It also lists what was deliberately left for the next session.

## What changed

### Schema (`prisma/schema.prisma`)
Added three new models — `Organization`, `OrgInvite`, `PasswordResetToken` — and put `orgId` foreign keys on `Client`, `Job`, `HiringManagerAssessment`, and `EventLog`. Added `orgId`, `role`, `isPlatformAdmin`, `emailVerifiedAt` to `User`. Added `stage` (`longlist` / `shortlist` / `client_ready` / `rejected`) and `offLimits` to `CandidateInvite`. Added `shareTokenExpiresAt` to `AssessmentResult`.

### New library code
- `lib/auth-helpers.ts` — every API route now uses `requireOrg()` or `requireRole(...)` and threads `ctx.orgId` into Prisma queries. `assertClientInOrg` / `assertJobInOrg` / `assertInviteInOrg` reject cross-tenant access on URL parameters.
- `lib/validation.ts` — lightweight schema validation. No new dependency.

### Patched API routes
Every existing route was updated to filter by `orgId`. The full list:
`/api/jobs`, `/api/jobs/[id]`, `/api/jobs/[id]/target`, `/api/jobs/[id]/invites`, `/api/jobs/[id]/invites/[inviteId]/resend`, `/api/jobs/[id]/suggest-target`, `/api/clients`, `/api/clients/[id]/hiring-manager`, `/api/candidates`, `/api/candidates/[id]`, `/api/candidates/[id]/notes`, `/api/candidates/[id]/outcome`, `/api/admin/ab-stats`, `/api/classify-role`, `/api/generate-benchmark`. The public `/api/report/[shareToken]` now rate-limits by IP and honours `shareTokenExpiresAt`.

### New routes and pages
- `POST /api/auth/signup` — creates a new org + owner, or accepts an org invite.
- `POST /api/auth/forgot-password` — sends reset email. Returns 200 even for unknown emails (no enumeration).
- `POST /api/auth/reset-password` — validates token, swaps password.
- `GET /api/team`, `POST /api/team/invite`, `POST /api/team/invite/[id]/revoke` — team management (admins/owners only).
- `/signup`, `/forgot-password`, `/reset-password/[token]` — pages.
- `/dashboard/settings/team` — team management UI.
- `Team` link added to `DashboardShell`.

### Tests
`lib/__tests__/tenant-isolation.test.ts` — proves Org A cannot read Org B's data via any of the assert helpers, and proves an unscoped `findMany` returns everything (the bug class the refactor exists to prevent). Wired into `npm test`.

## What you must do before running the app

The schema change is breaking. You cannot just pull and `npm run dev`. Steps:

```bash
# 1. From the repo root with your live DATABASE_URL pointing at the prod (or staging) Postgres:
npx prisma migrate dev --name multi_tenant

# 2. If you have existing data in the database, this migration will fail because the new orgId columns
#    on Client/Job/HiringManagerAssessment/User are NOT NULL. Two options:
#
#    OPTION A — empty database (dev / staging with no real data): just run the migrate command above.
#
#    OPTION B — existing data (production): you need a backfill. The pattern is:
#       (a) edit the generated migration file before running it
#       (b) make orgId nullable first
#       (c) create a "Legacy" organization
#       (d) UPDATE every existing row to point at that Legacy org
#       (e) add NOT NULL constraint
#    See docs/multi-tenant-backfill.sql (TODO — write this when you actually have prod data).

# 3. Regenerate the Prisma client and seed:
npx prisma generate
npx prisma db seed

# 4. Run tests:
npm test

# 5. Build:
npm run build
```

## ENV vars you should have set

```
DATABASE_URL=             # postgresql://... — your hosted Postgres
NEXTAUTH_URL=             # https://yourdomain.com (NOT localhost in production)
NEXTAUTH_SECRET=          # generate fresh: openssl rand -base64 32
ANTHROPIC_API_KEY=        # required for /api/classify-role and /api/generate-benchmark
SENDGRID_API_KEY=         # required for invites + password reset
SENDGRID_FROM=            # verified sender email (e.g. invites@yourdomain.com)
APP_URL=                  # https://yourdomain.com — used in email links
```

Rotate `NEXTAUTH_SECRET` before going live with real customer data. Add SPF/DKIM/DMARC records on the domain you send from, or every invite ends up in spam.

## Session 3: Client portal + white-label (2026-05-12)

### What was built

**Schema additions** (requires `npx prisma migrate dev --name client_portal` + `npx prisma generate`):
- `ClientContact` model — magic-link portal access per job. Fields: name, email, token, expiresAt, lastAccessAt, revokedAt.
- `Organization` — four new branding columns: `brandLogoUrl`, `brandPrimaryColor`, `brandPartnerName`, `brandPartnerEmail`.
- `Job.clientContacts` — relation added.
- New stage values (string field, no migration needed): `client_approved` (client advanced a candidate).

**New API routes**:
- `GET/POST /api/jobs/[id]/client-contacts` — list contacts, create + send magic-link email (admin/owner only).
- `DELETE /api/jobs/[id]/client-contacts/[contactId]` — revoke access.
- `GET /api/portal/auth/[token]` — magic-link landing: validates token, sets `veltro_portal` HttpOnly cookie, redirects to `/portal/shortlist`. Expired/revoked → `/portal/expired`.
- `GET /api/portal/shortlist` — portal-auth'd; returns `client_ready` candidates for the contact's job (strips `recruiterNotes`, respects `offLimits`).
- `PATCH /api/portal/candidates/[inviteId]/feedback` — client writes `client_approved` or `rejected` back to `CandidateInvite.stage`.
- `GET /api/portal/report/[shareToken]` — portal-auth'd; white-labeled report (strips `recruiterNotes`, raw responses, timing; adds org branding).
- `GET/PATCH /api/settings/branding` — read/update org branding fields (admin/owner only).

**New pages**:
- `/portal/shortlist` — client-facing shortlist: firm header, candidate cards with profile + fit %, Advance/Pass buttons, View Report link.
- `/portal/report/[shareToken]` — white-labeled candidate report: firm logo, primary color, partner contact, dimension bars, profile, fit score. No recruiter notes.
- `/portal/expired` — shown when magic link is expired or revoked.
- `/dashboard/settings/branding` — recruiter UI to set logo URL, primary color, partner name/email with live preview strip.

**Lib additions**:
- `lib/portal-auth.ts` — `requirePortalSession(req)` reads the `veltro_portal` cookie, validates against DB, stamps `lastAccessAt`. Returns `PortalContext | NextResponse` (same pattern as `requireOrg`).
- `lib/email.ts` — `sendClientPortalEmail()` — branded magic-link email to the client contact.

**Dashboard changes**:
- Job detail page (`/dashboard/jobs/[id]`) — new "Client Portal" panel at the bottom: send magic-link form (name + email), list of active contacts with expiry / last-viewed / revoke button.
- Sidebar — "Branding" nav item added.

### Portal auth design notes

- The `ClientContact.token` (cuid, 25 chars) is the credential. It is NEVER returned to the recruiter UI — only sent via email.
- Cookie: `veltro_portal=<token>; Path=/portal; HttpOnly; SameSite=Lax; Expires=<expiresAt>`.
- Every portal API route calls `requirePortalSession()` which hits the DB on every request (no JWT). This keeps revocation instant.
- Revoked contacts: `revokedAt` is set to now; the cookie becomes invalid on the next request.
- Portal reports are scoped: only `client_ready` or `client_approved` candidates are visible, and only within the contact's job.

### What must run before these changes work

```bash
npx prisma migrate dev --name client_portal
npx prisma generate
npm run build
```

## Session 4: Process upgrades (2026-05-12)

### What was built

**Schema additions** (migration name: `process_upgrades`):
- `CandidateNote` model — `id, inviteId, authorUserId, body, createdAt`. Append-only notes thread per candidate. Replaces `AssessmentResult.recruiterNotes` (single field removed).
- `CandidateInvite` — three new fields: `approvedForClient Boolean @default(false)`, `approvedByUserId String?`, `approvedAt DateTime?`. Partner approval gate before client portal visibility.

**New API routes**:
- `POST /api/candidates/[id]/stage` — body `{ stage }` (longlist | shortlist | client_ready | rejected). Auth: `requireOrg` + `assertInviteInOrg`. Logs to `EventLog`.
- `POST /api/candidates/[id]/off-limits` — body `{ offLimits: boolean }`. Same auth. Logs to `EventLog`.
- `POST /api/candidates/[id]/approve` — body `{ approved: boolean }`. Auth: `requireRole('owner','admin')`. Sets `approvedForClient`, `approvedByUserId`, `approvedAt`. Logs to `EventLog`.
- `GET /api/candidates/[id]/notes` — returns thread newest-first.
- `POST /api/candidates/[id]/notes` — body `{ body }`. Creates `CandidateNote`. (Replaces old POST that wrote `recruiterNotes`.)
- `POST /api/jobs/[id]/invites/bulk` — accepts JSON array `[{name,email,phone?}]` or CSV (`Content-Type: text/csv`). Max 200 rows. Validates email format, creates invites, fires emails best-effort, returns per-row status. HTTP 207 on partial failure.

**Portal change**:
- `GET /api/portal/shortlist` now requires `approvedForClient = true` in addition to `stage = 'client_ready'` and `offLimits = false`.

**Dashboard UI changes**:
- Candidate detail page — "Process Controls" bar: stage dropdown (color-coded pill), off-limits toggle (red slider), portal approval button (owner/admin). Header tints red and name gets strikethrough when off-limits. Notes section replaced with thread (newest at top, compose box above).
- Job detail page — candidate cards show `OFF-LIMITS` red badge and struck-through name when `offLimits = true`. "Bulk import" button opens drag-drop CSV zone with preview table; commit button sends to bulk endpoint, results table shown after.

### What must run before these changes work

```bash
npx prisma migrate dev --name process_upgrades
npx prisma generate
npm run build
```

### Notes

- `recruiterNotes` is removed from `AssessmentResult`. The migration drops the column without backfilling. If a production DB ever has rows with `recruiterNotes` populated, run this before applying the migration:
  ```sql
  INSERT INTO "CandidateNote" (id, "inviteId", "authorUserId", body, "createdAt")
  SELECT gen_random_uuid()::text,
         ar."inviteId",
         (SELECT id FROM "User" WHERE "isPlatformAdmin" = true LIMIT 1),
         ar."recruiterNotes",
         ar."createdAt"
  FROM "AssessmentResult" ar
  WHERE ar."recruiterNotes" IS NOT NULL;
  ```
  Safe to skip entirely if the DB has no real recruiter-notes data (i.e., fresh Neon instance).
- The approve endpoint requires `owner` or `admin` role. Members see the button but get a toast error — by design (visible affordance, server enforced).
- Bulk import fires emails best-effort. Failed email sends do not fail the row — the invite is created regardless.

## Session 5: Candidate experience polish (2026-05-13)

### What was built

**Mobile responsive pass** — no schema changes, no migration required:
- `/assess/[token]` — top bar and low-count warning padding fixed at 375px; archetype name clamp lowered so long names (Trailblazer, Navigator) don't overflow.
- `/` (landing page) — sample report card height unlocked on mobile (Beat 2 scrolls); right header span hidden on small screens.
- `/report/[shareToken]` — nav rail right-side hidden at ≤500px; existing 900px grid stack preserved.
- `/portal/shortlist` — candidate card grid stacks at ≤500px; action buttons go horizontal.
- `app/globals.css` — added `.report-beat` class rule to allow Beat 2 to scroll vertically on mobile.

**Reminder emails for non-completers**:
- `lib/email.ts` — `sendCandidateReminderEmail()` — two-variant reminder (reminderNumber 1 or 2) with appropriate subject lines.
- `app/api/maintenance/send-reminders/route.ts` — `GET` endpoint:
  - Finds invites where `sentAt ≤ now-3d`, `completedAt IS NULL`, email + name set.
  - Skips if 2+ reminders already sent (cap), or if a reminder was sent in the last 24 hours.
  - Sends reminder 1 at the 3-day mark; reminder 2 only once `sentAt ≤ now-7d`.
  - Logs to `EventLog` as `invite.reminder_sent` with `reminderNumber` in `meta`.
  - Protected by `Authorization: Bearer <CRON_SECRET>` if `CRON_SECRET` env var is set.
- `vercel.json` — cron entry: `"0 9 * * *"` (daily at 09:00 UTC) hitting `/api/maintenance/send-reminders`.

**Optional demographic capture** (adverse-impact monitoring):
- Schema: `CandidateInvite.demographicsConsent Boolean @default(false)` + new `CandidateDemographics` model (see below).
- `/assess/[token]` — new `demographics` phase inserted between `consent` and `welcome`; single-screen skip-in-one-tap design.
- `/api/settings/adverse-impact` — aggregate selection rates by demographic group; never returns individual data.
- `/dashboard/settings/adverse-impact` — 4/5-rule flag table.

### New schema (requires migration `candidate_ux`)

```prisma
// On CandidateInvite:
demographicsConsent  Boolean  @default(false)

// New model:
model CandidateDemographics {
  id             String          @id @default(cuid())
  inviteId       String          @unique
  invite         CandidateInvite @relation(fields: [inviteId], references: [id], onDelete: Cascade)
  gender         String?   // "male" | "female" | "nonbinary" | "prefer_not"
  race           String?   // EEOC categories: "white" | "black" | "hispanic" | "asian" | "aian" | "nhpi" | "two_or_more" | "prefer_not"
  ageRange       String?   // "under_30" | "30_39" | "40_49" | "50_59" | "60_plus" | "prefer_not"
  disability     String?   // "yes" | "no" | "prefer_not"
  veteran        String?   // "protected" | "not_protected" | "prefer_not"
  createdAt      DateTime  @default(now())

  @@index([inviteId])
}
```

### New ENV var

```
CRON_SECRET=   # random string; Vercel sends it as Authorization: Bearer <value> on cron calls
```

Generate with: `openssl rand -base64 32`. Set in Vercel project settings under Environment Variables.

### What must run before these changes work

```bash
npx prisma migrate dev --name candidate_ux
npx prisma generate
npm run build
```

---

## What was deliberately deferred to a future session

These are real gaps that the audit identified. Each is a separate, bounded chunk of work.

**Engineering / security**
- MFA / TOTP on user accounts.
- SSO (SAML / OIDC) for enterprise customers.
- Audit log UI — `EventLog` now captures `userId` and `orgId` but there is no admin view that surfaces it.
- Impersonation tool for platform admins to debug customer issues.
- Sentry / error tracking wiring.
- `/healthz` endpoint and a public status page.
- A real backfill SQL script for production multi-tenant migration (only matters if there's existing prod data — there is none yet).
- Cross-tenant isolation test extended to also hit the HTTP layer (currently tests the helpers directly).
- Portal rate-limiting (currently the portal shortlist/report have no rate limit; add IP-based limiting like the public report route).

**Process / UX inside the dashboard**
- Shortlist staging view — kanban or list view grouping candidates by stage across a job (currently stage is set per-candidate on the detail page, no aggregate pipeline view).
- Bulk-invite email preview before send (currently emails fire immediately on commit).
- Interview guide export to PDF / Word per candidate.

**Client experience (remaining)**
- Logo upload via the dashboard (currently the branding page requires a URL; S3/Cloudflare R2 upload not wired).
- Resend magic-link to existing contact (recruiter currently must revoke and re-add).
- Per-search partner contact override (branding is org-level; some firms want different partners per search).
- Client portal mobile pass at 375px (basic layout works but not optimized).

**Candidate experience**
- Real consent screen on `/assess/[token]` with what-is-collected / how-long-retained / right-to-delete language.
- Mobile pass at 375px.
- Optional demographic capture for adverse-impact monitoring (this is a sales feature for the firms, not a UX detail).

**Legal / commercial**
- Privacy Policy, ToS, candidate consent text, MSA / Order Form / DPA drafts.
- Pricing page, demo request form, methodology one-pager, security one-pager.
- About / team page.

**Billing**
- No Stripe / subscription / metering yet. Charge design partners by invoice for now.

## Housekeeping

A scratch file `tsconfig.syntax.json` may be sitting in the repo root from a verification step. Delete it: `del tsconfig.syntax.json` (Windows) or `rm tsconfig.syntax.json` (Unix). It is not used by any tool.

## Notes about the code shape

- `auth-helpers.ts` returns either an `AuthContext` or a `NextResponse` error. Route handlers must check `instanceof NextResponse` and short-circuit. This pattern was chosen so we don't throw inside route handlers — Next.js 16 swallows uncaught errors awkwardly.
- All cross-tenant lookups return **404, not 403**, to avoid leaking whether a record exists in another tenant via timing or error-message differences. Don't change this without thinking about it.
- The public report route now records every view attempt to `EventLog` with a synthetic `entityId` of the form `report_view:<ip>`. If `EventLog` grows unbounded, prune entries older than 7 days with a maintenance task.
- The signup flow does not auto-sign-in via the API route; the client calls `signIn('credentials', ...)` separately. This keeps NextAuth as the single point of session creation. Don't combine them.
- All emails are best-effort. If SendGrid is down, account creation / invite creation still succeed, but the customer-facing UX shows the error. There is no retry queue yet.

## Quick smoke test after migration

```bash
# 1. Sign up a brand new firm
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@a.com","password":"password123","name":"Alice","firmName":"Firm A"}'

# 2. Sign up a second firm
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"bob@b.com","password":"password123","name":"Bob","firmName":"Firm B"}'

# 3. Log in as Alice in your browser, create a Client + Job
# 4. Log out, log in as Bob
# 5. Confirm Bob sees ZERO clients / jobs / candidates (not Alice's data)
# 6. npm test — tenant-isolation tests should pass
```

If step 5 leaks Alice's data, the multi-tenant guards are broken. Open the route in question and confirm it uses `requireOrg()` + `where: { orgId: ctx.orgId }` (or one of the assert helpers).
