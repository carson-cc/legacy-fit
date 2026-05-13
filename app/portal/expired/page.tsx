export default function PortalExpiredPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F9FAFB', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: 40, maxWidth: 420 }}>
        <p style={{ fontSize: 40, margin: '0 0 16px' }}>🔗</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>This link has expired</h1>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6 }}>
          Portal links are single-use and time-limited. Please contact your search firm partner to receive a new link.
        </p>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
          You can safely close this tab.
        </p>
      </div>
    </div>
  )
}
