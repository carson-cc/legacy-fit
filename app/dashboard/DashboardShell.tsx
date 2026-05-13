'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ToastContainer } from '@/app/components/Toast'

const NAV_ITEMS = [
  { label: 'Hiring Overview', href: '/dashboard' },
  { label: 'Candidates', href: '/dashboard/candidates' },
  { label: 'Roles', href: '/dashboard/jobs' },
  { label: 'Clients', href: '/dashboard/clients' },
  { label: 'Team', href: '/dashboard/settings/team' },
  { label: 'Branding', href: '/dashboard/settings/branding' },
]

const SETTINGS_ITEMS = [
  { label: 'Audit Log', href: '/dashboard/settings/audit' },
  { label: 'Adverse Impact', href: '/dashboard/settings/adverse-impact' },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9FAFB' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 30 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#0B0F14',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link href="/dashboard" style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#FFFFFF',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}>
            Veltro
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 38,
                  padding: '0 20px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderLeft: active ? '2px solid #2563EB' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Settings section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
          <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Settings
          </div>
          {SETTINGS_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 36,
                  padding: '0 20px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderLeft: active ? '2px solid #2563EB' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  )
}
