/**
 * End-to-end smoke test for the Veltro process-upgrades stack.
 * Run: npx tsx scripts/smoke-test.ts
 * Requires the dev server to be running: npm run dev
 */

const BASE = 'http://localhost:3000'
const TS = Date.now()
const FIRM  = `SmokeTest-${TS}`
const EMAIL = `smoke-${TS}@test.local`
const PASS  = 'TestPass123!'

// 15 valid positive adjectives from the ADJECTIVES bank
const POSITIVE_WORDS = [
  'decisive','bold','direct','driven','determined',
  'self-confident','competitive','commanding','take-charge','dominant',
  'outgoing','warm','engaging','animated','social',
]
// 15 low-dominance / high-patience words for a different profile
const ALT_WORDS = [
  'steady','calm','patient','even-tempered','settled',
  'level-headed','relaxed','easygoing','measured','consistent',
  'passive','quiet','modest','accommodating','soft-spoken',
]
// All 80 adjective words in arbitrary order (used for list1Order / list2Order)
const ALL_WORDS = [
  'decisive','commanding','competitive','bold','direct','dominant','take-charge','driven','determined','self-confident',
  'passive','follower','approval-seeking','quiet','modest','accommodating','avoids conflict','goes along','soft-spoken','yielding',
  'outgoing','warm','engaging','animated','approachable','communicative','people-oriented','conversational','social','sociable',
  'withdrawn','private','solitary','self-contained','reserved','serious','inward','composed','independent','introverted',
  'steady','calm','patient','even-tempered','settled','level-headed','relaxed','easygoing','measured','consistent',
  'urgent','fast-paced','restless','impatient','impulsive','reactive','action-oriented','high-energy','intense','quick to act',
  'organized','precise','detail-oriented','systematic','disciplined','rule-following','thorough','structured','responsible','by-the-book',
  'flexible','spontaneous','loose','informal','improvises','casual','goes with flow','free-form','relaxed-rules','adaptable',
]

// ---------------------------------------------------------------------------
// HTTP helpers — manual cookie jar
// ---------------------------------------------------------------------------

const jar: Record<string, string> = {}

function cookieHeader(): string {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')
}

function extractCookies(res: Response) {
  // Node fetch returns multiple Set-Cookie as a single comma-joined string in
  // some environments; iterate all header entries instead.
  res.headers.forEach((val, key) => {
    if (key.toLowerCase() !== 'set-cookie') return
    // May be a single value or "a=b; Path=/, c=d; Path=/" — split on ", " boundaries
    // that start a new cookie name (heuristic: ", " followed by word chars and "=")
    const parts = val.split(/,\s*(?=[^;,]+=)/)
    for (const part of parts) {
      const [nameVal] = part.split(';')
      const eq = nameVal.indexOf('=')
      if (eq < 0) continue
      const name = nameVal.slice(0, eq).trim()
      const value = nameVal.slice(eq + 1).trim()
      if (value) jar[name] = value
      else delete jar[name]
    }
  })
}

async function api(
  path: string,
  opts: RequestInit & { json?: unknown } = {},
): Promise<{ status: number; body: unknown }> {
  const headers: Record<string, string> = { Cookie: cookieHeader() }
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(opts.json)
    delete (opts as Record<string, unknown>).json
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers as Record<string, string> ?? {}) } })
  extractCookies(res)
  let body: unknown
  try { body = await res.json() } catch { body = {} }
  return { status: res.status, body }
}

// ---------------------------------------------------------------------------
// Assertion helper
// ---------------------------------------------------------------------------

let pass = 0, fail = 0
function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    pass++
  } else {
    console.log(`  ✗ ${label}${detail ? `  ← ${detail}` : ''}`)
    fail++
  }
}

// ---------------------------------------------------------------------------
// NextAuth sign-in
// ---------------------------------------------------------------------------

async function signIn(email: string, password: string): Promise<boolean> {
  // Step 1: get CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { Cookie: cookieHeader() } })
  extractCookies(csrfRes)
  const { csrfToken } = await csrfRes.json() as { csrfToken: string }

  // Step 2: post credentials
  const body = new URLSearchParams({
    email, password, csrfToken,
    callbackUrl: `${BASE}/dashboard`,
    json: 'true',
  })
  const signinRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookieHeader() },
    body: body.toString(),
    redirect: 'manual',
  })
  extractCookies(signinRes)

  // A successful sign-in redirects; we get a 302 with Location and a session cookie
  return signinRes.status === 302 || signinRes.status === 200 || Object.keys(jar).some(k => k.includes('session'))
}

// ---------------------------------------------------------------------------
// Smoke test
// ---------------------------------------------------------------------------

async function run() {
  console.log('\n══════════════════════════════════════════')
  console.log('  Veltro smoke test')
  console.log('══════════════════════════════════════════\n')

  // ── 0. Wait for server ──────────────────────────────────────────────────
  console.log('Pinging dev server...')
  for (let i = 0; i < 30; i++) {
    try { await fetch(`${BASE}/api/auth/csrf`); break } catch { await new Promise(r => setTimeout(r, 1000)) }
    if (i === 29) { console.error('Server not reachable after 30s'); process.exit(1) }
  }
  console.log('Server ready.\n')

  // ── 1. Sign up Firm A ───────────────────────────────────────────────────
  console.log('Step 1 — Sign up Firm A')
  const signupRes = await api('/api/auth/signup', {
    method: 'POST',
    json: { email: EMAIL, password: PASS, name: 'Smoke Tester', firmName: FIRM },
  })
  assert('signup returns 200/201', signupRes.status === 200 || signupRes.status === 201, `got ${signupRes.status}: ${JSON.stringify(signupRes.body)}`)

  const loggedIn = await signIn(EMAIL, PASS)
  assert('sign in succeeds', loggedIn)

  // ── 2. Create client + job ──────────────────────────────────────────────
  console.log('\nStep 2 — Create client + job')
  const clientRes = await api('/api/clients', { method: 'POST', json: { name: 'Acme Corp', industry: 'technology' } })
  assert('create client 200', clientRes.status === 200, JSON.stringify(clientRes.body))
  const clientId = (clientRes.body as { data: { id: string } }).data.id

  const jobRes = await api('/api/jobs', { method: 'POST', json: { title: 'Head of Sales', roleType: 'sales', clientId } })
  assert('create job 200', jobRes.status === 200, JSON.stringify(jobRes.body))
  const jobId = (jobRes.body as { data: { id: string } }).data.id

  // ── 3. Create two candidates + complete their assessments ───────────────
  console.log('\nStep 3 — Create candidates and submit assessments')

  // Candidate A: will be approved
  const invA = await api(`/api/jobs/${jobId}/invites`, { method: 'POST', json: { name: 'Alice Approved', email: `alice-${TS}@test.local` } })
  assert('create invite A 200', invA.status === 200, JSON.stringify(invA.body))
  const inviteA = (invA.body as { data: { id: string; token: string } }).data

  // Candidate B: client_ready but NOT approved — should stay hidden from portal
  const invB = await api(`/api/jobs/${jobId}/invites`, { method: 'POST', json: { name: 'Bob Blocked', email: `bob-${TS}@test.local` } })
  assert('create invite B 200', invB.status === 200, JSON.stringify(invB.body))
  const inviteB = (invB.body as { data: { id: string; token: string } }).data

  // Submit assessments (public endpoint — no auth)
  const assessPayload = (words: string[]) => ({
    list1Checked: words, list2Checked: words,
    list1Order: ALL_WORDS, list2Order: ALL_WORDS,
    timeOnPage1Ms: 90000, timeOnPage2Ms: 90000,
  })

  const assessA = await api(`/api/assess/${inviteA.token}`, { method: 'POST', json: assessPayload(POSITIVE_WORDS) })
  assert('assessment A submitted', assessA.status === 200, JSON.stringify(assessA.body))

  const assessB = await api(`/api/assess/${inviteB.token}`, { method: 'POST', json: assessPayload(ALT_WORDS) })
  assert('assessment B submitted', assessB.status === 200, JSON.stringify(assessB.body))

  // ── 4. Stage controls ───────────────────────────────────────────────────
  console.log('\nStep 4 — Stage controls')

  const stageA = await api(`/api/candidates/${inviteA.id}/stage`, { method: 'POST', json: { stage: 'client_ready' } })
  assert('set A → client_ready', stageA.status === 200)
  assert('stage value correct', (stageA.body as { data: { stage: string } }).data?.stage === 'client_ready')

  const stageB = await api(`/api/candidates/${inviteB.id}/stage`, { method: 'POST', json: { stage: 'client_ready' } })
  assert('set B → client_ready', stageB.status === 200)

  const invalidStage = await api(`/api/candidates/${inviteA.id}/stage`, { method: 'POST', json: { stage: 'client_approved' } })
  assert('reject client_approved via stage endpoint', invalidStage.status === 400)

  // ── 5. Off-limits toggle ────────────────────────────────────────────────
  console.log('\nStep 5 — Off-limits toggle')

  const olOn = await api(`/api/candidates/${inviteA.id}/off-limits`, { method: 'POST', json: { offLimits: true } })
  assert('mark off-limits → true', olOn.status === 200)
  assert('offLimits value true', (olOn.body as { data: { offLimits: boolean } }).data?.offLimits === true)

  const olOff = await api(`/api/candidates/${inviteA.id}/off-limits`, { method: 'POST', json: { offLimits: false } })
  assert('unmark off-limits → false', olOff.status === 200)
  assert('offLimits value false', (olOff.body as { data: { offLimits: boolean } }).data?.offLimits === false)

  // ── 6. Approve gate ─────────────────────────────────────────────────────
  console.log('\nStep 6 — Approval gate')

  // Approve A only
  const approveA = await api(`/api/candidates/${inviteA.id}/approve`, { method: 'POST', json: { approved: true } })
  assert('approve A', approveA.status === 200)
  assert('approvedForClient true', (approveA.body as { data: { approvedForClient: boolean } }).data?.approvedForClient === true)
  assert('approvedAt set', !!(approveA.body as { data: { approvedAt: string } }).data?.approvedAt)

  // B is NOT approved — stays hidden

  // ── 7. Bulk import ──────────────────────────────────────────────────────
  console.log('\nStep 7 — Bulk import')

  const bulkRows = [
    { name: 'Bulk One', email: `bulk1-${TS}@test.local` },
    { name: 'Bulk Two', email: `bulk2-${TS}@test.local` },
    { name: 'Bad Row',  email: 'not-an-email' },
  ]
  const bulk = await api(`/api/jobs/${jobId}/invites/bulk`, { method: 'POST', json: bulkRows })
  assert('bulk returns 207 (partial)', bulk.status === 207, `got ${bulk.status}`)
  assert('bulk created=2', (bulk.body as { created: number }).created === 2)
  assert('bulk failed=1',  (bulk.body as { failed: number }).failed === 1)

  // ── 8. Portal: create client contact ────────────────────────────────────
  console.log('\nStep 8 — Client portal: contact + shortlist gate')

  const contactRes = await api(`/api/jobs/${jobId}/client-contacts`, {
    method: 'POST',
    json: { name: 'Client Smith', email: `client-${TS}@hiring.com` },
  })
  // 200 = email sent, 207 = contact created but email failed (expected in test env)
  assert('create client contact', [200, 201, 207].includes(contactRes.status),
    `got ${contactRes.status}: ${JSON.stringify(contactRes.body)}`)

  // Get the token directly from DB — email isn't sent in test, need the token
  const { prisma } = await import('../lib/prisma')
  const contact = await prisma.clientContact.findFirst({
    where: { jobId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  assert('contact exists in DB', !!contact)

  // Auth as the portal client: hit the magic link endpoint
  const portalAuthRes = await fetch(`${BASE}/api/portal/auth/${contact!.token}`, { redirect: 'manual' })
  extractCookies(portalAuthRes)
  assert('portal auth redirects', portalAuthRes.status === 302 || portalAuthRes.status === 307,
    `got ${portalAuthRes.status}`)
  const hasPortalCookie = Object.keys(jar).some(k => k === 'veltro_portal')
  assert('portal cookie set', hasPortalCookie, `jar keys: ${Object.keys(jar).join(', ')}`)

  // Hit the shortlist
  const shortlistRes = await api('/api/portal/shortlist')
  assert('portal shortlist 200', shortlistRes.status === 200, JSON.stringify(shortlistRes.body))
  const candidates = (shortlistRes.body as { data: { candidates: unknown[] } }).data?.candidates ?? []

  assert('approved candidate A visible in portal', candidates.some((c: unknown) => (c as { inviteId: string }).inviteId === inviteA.id))
  assert('unapproved candidate B NOT visible', !candidates.some((c: unknown) => (c as { inviteId: string }).inviteId === inviteB.id))

  // ── 9. Portal feedback: client clicks Approve ───────────────────────────
  console.log('\nStep 9 — Portal feedback (client approves)')

  const feedbackRes = await api(`/api/portal/candidates/${inviteA.id}/feedback`, {
    method: 'PATCH',
    json: { verdict: 'client_approved' },
  })
  assert('portal feedback 200', feedbackRes.status === 200, JSON.stringify(feedbackRes.body))

  const updatedInvite = await prisma.candidateInvite.findUnique({ where: { id: inviteA.id }, select: { stage: true } })
  assert('stage flipped to client_approved', updatedInvite?.stage === 'client_approved',
    `got: ${updatedInvite?.stage}`)

  // ── 10. Notes thread ────────────────────────────────────────────────────
  console.log('\nStep 10 — Notes thread (re-auth as recruiter)')

  // Clear portal cookie, re-sign-in as recruiter
  delete jar['veltro_portal']
  await signIn(EMAIL, PASS)

  const notePost = await api(`/api/candidates/${inviteA.id}/notes`, { method: 'POST', json: { body: 'Strong pipeline fit.' } })
  assert('post note 201', notePost.status === 201, JSON.stringify(notePost.body))

  const notePost2 = await api(`/api/candidates/${inviteA.id}/notes`, { method: 'POST', json: { body: 'Follow-up scheduled.' } })
  assert('post second note 201', notePost2.status === 201)

  const notesGet = await api(`/api/candidates/${inviteA.id}/notes`)
  assert('GET notes 200', notesGet.status === 200)
  const thread = (notesGet.body as { data: unknown[] }).data ?? []
  assert('thread has 2 notes', thread.length === 2, `got ${thread.length}`)
  assert('newest note first', (thread[0] as { body: string }).body === 'Follow-up scheduled.')

  // ── Cleanup ──────────────────────────────────────────────────────────────
  await prisma.$disconnect()

  // ── Summary ──────────────────────────────────────────────────────────────
  const total = pass + fail
  console.log('\n══════════════════════════════════════════')
  console.log(`  ${pass}/${total} assertions passed${fail > 0 ? `  (${fail} FAILED)` : ''}`)
  console.log('══════════════════════════════════════════\n')
  process.exit(fail > 0 ? 1 : 0)
}

run().catch(err => { console.error(err); process.exit(1) })
