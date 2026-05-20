import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100svh',
      display: 'grid',
      placeItems: 'center',
      background: '#F9FAFB',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <p style={{
          margin: '0 0 12px',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#9CA3AF',
        }}>
          404
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>
          This page doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', height: 36,
            padding: '0 16px', borderRadius: 8,
            background: '#111827', color: '#FFF',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          Back to Hiring Overview
        </Link>
      </div>
    </div>
  )
}
