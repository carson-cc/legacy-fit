'use client'

export default function MethodPage() {
  return (
    <main style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      color: '#FFFFFF'
    }}>

      {/* ── SECTION 1 — Hero ─────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: '#0B0F14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 48px'
      }}>
        <p style={{
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.88)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 16,
          maxWidth: 640
        }}>
          This isn&apos;t a personality test.
        </p>
        <p style={{
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: 640
        }}>
          It&apos;s how you make the call.
        </p>
      </section>

      {/* ── SECTION 2 — Method prose + dimensions ────────────── */}
      <section style={{
        padding: '80px 48px',
        background: '#0D1117'
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {[
            'The candidate answers 80 questions in six minutes. No login. Any device. Completely independent.',
            'Their responses are scored against a benchmark built for the role — not a generic personality scale. Field leadership scores against a field leadership benchmark. Executive roles against an executive benchmark.',
            'You get a fit score, a recommendation, and the reasoning behind it. Strengths, risks, and three interview probes tied to what the data actually found.'
          ].map((para, i) => (
            <p key={i} style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.75,
              marginBottom: 28
            }}>
              {para}
            </p>
          ))}

          <div style={{ marginTop: 48 }}>
            {[
              {
                name: 'Execution',
                desc: 'Ability to drive forward progress, resolve blockers, and maintain team momentum under pressure.'
              },
              {
                name: 'Ownership',
                desc: 'Tendency to assume responsibility, act without excessive escalation, and carry outcomes all the way through.'
              },
              {
                name: 'Adaptability',
                desc: 'Capacity to adjust pace, judgment, and operating style as context shifts.'
              },
              {
                name: 'Collaboration',
                desc: 'Ability to align others, work through stakeholders, and maintain coordination without losing clarity.'
              },
              {
                name: 'Decision Speed',
                desc: 'Comfort making calls with imperfect information while preserving sound judgment.'
              }
            ].map((dim, i, arr) => (
              <div key={i} style={{
                paddingLeft: 20,
                borderLeft: '2px solid rgba(37,99,235,0.4)',
                paddingBottom: 24,
                marginBottom: i < arr.length - 1 ? 24 : 0,
                borderBottom: i < arr.length - 1
                  ? '1px solid rgba(255,255,255,0.05)'
                  : 'none'
              }}>
                <p style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: 5
                }}>
                  {dim.name}
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.65
                }}>
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — Science + stats ──────────────────────── */}
      <section style={{
        padding: '80px 48px',
        background: '#0B0F14',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto 56px' }}>
          {[
            'Built on 2.2 million people.',
            'Eight peer-reviewed studies.',
            'Not a black box.',
            'Published science.'
          ].map((line, i) => (
            <p key={i} style={{
              fontSize: 'clamp(16px, 2.2vw, 20px)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.8
            }}>
              {line}
            </p>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 32,
          maxWidth: 640,
          margin: '0 auto'
        }} className="stats-grid">
          {[
            { val: '2.2M',  label: 'People in the dataset' },
            { val: '94',    label: 'Signals per evaluation' },
            { val: '8',     label: 'Peer-reviewed studies' },
            { val: '6 min', label: 'Per candidate' }
          ].map((stat, i) => (
            <div key={i}>
              <p style={{
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: 6
              }}>
                {stat.val}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 — Philosophy + CTA ─────────────────────── */}
      <section style={{
        padding: '80px 48px 100px',
        background: '#0D1117',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{
            fontSize: 'clamp(20px, 2.8vw, 28px)',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: '-0.02em',
            lineHeight: 1.4,
            marginBottom: 12
          }}>
            This doesn&apos;t replace your judgment.
            <br />It structures it.
          </p>
          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 40,
            lineHeight: 1.6
          }}>
            You still decide. This shows your client why.
          </p>
          <a href="/sample-report" style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#FFFFFF',
            color: '#000000',
            fontSize: 15,
            fontWeight: 700,
            padding: '13px 28px',
            borderRadius: 8,
            textDecoration: 'none',
            marginBottom: 12
          }}>
            See the full report →
          </a>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.18)',
            marginTop: 10
          }}>
            Every candidate you assess gets one exactly like this.
          </p>
        </div>
      </section>

    </main>
  )
}
