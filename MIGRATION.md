# Migration Notes

## Auth pattern

All authenticated API routes call `const session = await auth()` from `lib/auth`. The session now exposes `session.user.id` and `session.user.role` via JWT callbacks. Role values: `owner`, `admin`, `recruiter` (default).

## Deferred

- Client portal routes (reading invites for client-facing views) are not yet built. When implemented, filter `CandidateInvite` with `approvedForClient: true AND stage: 'client-ready' AND offLimits: false`.

---

## Process upgrade schema changes (2026-05-12)

Run the following after pulling this branch:

```bash
npx prisma migrate dev --name process_upgrades
npx prisma generate
```

### Fields added to `CandidateInvite`

| Field | Type | Default | Purpose |
|---|---|---|---|
| `stage` | `String` | `"longlist"` | Candidate stage: `longlist`, `shortlist`, `client-ready`, `rejected` |
| `offLimits` | `Boolean` | `false` | Hides candidate from client portal and flags in recruiter UI |
| `approvedForClient` | `Boolean` | `false` | Gate for client portal visibility |
| `approvedByUserId` | `String?` | — | ID of the user who approved |
| `approvedAt` | `DateTime?` | — | Timestamp of approval |

### New model: `CandidateNote`

Replaces `AssessmentResult.recruiterNotes` (single text field) with a threaded note model.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` | CUID primary key |
| `inviteId` | `String` | FK → `CandidateInvite.id` |
| `authorUserId` | `String?` | Nullable (system notes have no author) |
| `authorName` | `String?` | Denormalised name at write time |
| `body` | `String` | Note content |
| `createdAt` | `DateTime` | Auto |

### Removed from `AssessmentResult`

- `recruiterNotes String?` — replaced by `CandidateNote`. **Existing note data is not migrated** (confirmed by user).

---

## New API endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/candidates/[id]/stage` | session | Update `stage` and/or `offLimits` on an invite |
| `GET` | `/api/candidates/[id]/notes` | session | List threaded notes for a candidate |
| `POST` | `/api/candidates/[id]/notes` | session | Add a note to the thread |
| `POST` | `/api/candidates/[id]/approve` | session | `action: 'approve'` (owner/admin) or `action: 'request'` (recruiter → emails partners) |
| `POST` | `/api/jobs/[id]/invites/bulk` | session | Bulk import — body `{ rows: [{name, email, phone?}] }`, max 200 rows, best-effort email |
