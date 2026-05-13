// ---------------------------------------------------------------------------
// Lightweight input validation
// ---------------------------------------------------------------------------
//
// Avoids pulling Zod in as a dependency. Returns { ok, value, error } so
// route handlers can pattern-match cleanly:
//
//   const v = validate(body, { email: required(emailLike), name: required(str) })
//   if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

export type Validator<T> = (raw: unknown) => { ok: true; value: T } | { ok: false; error: string }

export const str = (max = 1000): Validator<string> => raw => {
  if (typeof raw !== 'string') return { ok: false, error: 'must be a string' }
  if (raw.length > max) return { ok: false, error: `must be ≤ ${max} chars` }
  return { ok: true, value: raw.trim() }
}

export const nonEmptyStr = (max = 1000): Validator<string> => raw => {
  const r = str(max)(raw)
  if (!r.ok) return r
  if (r.value.length === 0) return { ok: false, error: 'must not be empty' }
  return r
}

export const emailLike: Validator<string> = raw => {
  if (typeof raw !== 'string') return { ok: false, error: 'must be a string' }
  const trimmed = raw.trim().toLowerCase()
  if (trimmed.length === 0 || trimmed.length > 254) return { ok: false, error: 'invalid email' }
  // Deliberately permissive — RFC 5321 compliance is the email server's job,
  // not ours. Reject only what is unambiguously wrong.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'invalid email' }
  }
  return { ok: true, value: trimmed }
}

export const password: Validator<string> = raw => {
  if (typeof raw !== 'string') return { ok: false, error: 'password required' }
  if (raw.length < 8) return { ok: false, error: 'password must be at least 8 characters' }
  if (raw.length > 200) return { ok: false, error: 'password too long' }
  return { ok: true, value: raw }
}

export const optional = <T>(v: Validator<T>): Validator<T | undefined> => raw => {
  if (raw == null || raw === '') return { ok: true, value: undefined }
  return v(raw)
}

export function validate<T extends Record<string, Validator<unknown>>>(
  raw: unknown,
  schema: T,
): { ok: true; value: { [K in keyof T]: ReturnType<T[K]> extends { ok: true; value: infer V } ? V : never } } | { ok: false; error: string } {
  if (raw == null || typeof raw !== 'object') {
    return { ok: false, error: 'expected an object' }
  }
  const obj = raw as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(schema)) {
    const result = schema[k](obj[k])
    if (!result.ok) return { ok: false, error: `${k}: ${result.error}` }
    out[k] = (result as { value: unknown }).value
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ok: true, value: out as any }
}

// Slug used for org URLs / display. Lowercase, alphanumeric + hyphens.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'org'
}
