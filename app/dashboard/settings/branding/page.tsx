'use client'

import { useEffect, useState, useCallback } from 'react'
import { showToast } from '@/app/components/Toast'

interface BrandingData {
  brandLogoUrl:      string | null
  brandPrimaryColor: string | null
  brandPartnerName:  string | null
  brandPartnerEmail: string | null
}

export default function BrandingSettingsPage() {
  const [branding, setBranding]           = useState<BrandingData | null>(null)
  const [logoUrl, setLogoUrl]             = useState('')
  const [primaryColor, setPrimaryColor]   = useState('#111827')
  const [partnerName, setPartnerName]     = useState('')
  const [partnerEmail, setPartnerEmail]   = useState('')
  const [saving, setSaving]               = useState(false)
  const [colorError, setColorError]       = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/settings/branding')
    if (res.ok) {
      const d: BrandingData = (await res.json()).data
      setBranding(d)
      setLogoUrl(d.brandLogoUrl      ?? '')
      setPrimaryColor(d.brandPrimaryColor ?? '#111827')
      setPartnerName(d.brandPartnerName   ?? '')
      setPartnerEmail(d.brandPartnerEmail ?? '')
    }
  }, [])

  useEffect(() => {
    document.title = 'Veltro — Client Branding'
    load()
  }, [load])

  function validateColor(val: string) {
    if (val && !/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setColorError('Must be a 6-digit hex color, e.g. #1D4ED8')
    } else {
      setColorError('')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (colorError) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings/branding', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandLogoUrl:      logoUrl      || null,
          brandPrimaryColor: primaryColor || null,
          brandPartnerName:  partnerName  || null,
          brandPartnerEmail: partnerEmail || null,
        }),
      })
      if (res.ok) showToast('Branding saved')
      else showToast('Failed to save', 'error')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    fontSize: 14, color: '#111827', border: '1px solid #E5E7EB', borderRadius: 8,
    padding: '8px 12px', outline: 'none', width: '100%', background: '#fff',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 760, margin: '0 auto', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Client Portal Branding</h1>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 32px' }}>
        These details appear on the client-facing shortlist and candidate reports. Leave a field blank to use the default.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28, marginBottom: 24, display: 'grid', gap: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Firm Identity</h2>

          <div>
            <label style={labelStyle}>Logo URL</label>
            <input
              value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://yourfirm.com/logo.png"
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
              Publicly accessible image URL. Displayed in the portal header (height: 32px).
            </p>
            {logoUrl && (
              <div style={{ marginTop: 10, padding: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, display: 'inline-block' }}>
                <img src={logoUrl} alt="Logo preview" style={{ height: 32, objectFit: 'contain', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Primary Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={primaryColor}
                onChange={e => { setPrimaryColor(e.target.value); setColorError('') }}
                style={{ width: 40, height: 36, border: '1px solid #E5E7EB', borderRadius: 6, padding: 2, cursor: 'pointer' }}
              />
              <input
                value={primaryColor}
                onChange={e => { setPrimaryColor(e.target.value); validateColor(e.target.value) }}
                placeholder="#111827"
                maxLength={7}
                style={{ ...inputStyle, width: 110 }}
              />
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: colorError ? '#E5E7EB' : primaryColor,
                border: '1px solid #E5E7EB', flexShrink: 0,
              }} />
            </div>
            {colorError && <p style={{ fontSize: 12, color: '#EF4444', margin: '4px 0 0' }}>{colorError}</p>}
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
              Used for the portal header, buttons, and report accent color.
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28, marginBottom: 24, display: 'grid', gap: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Partner Contact</h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Shown in the portal header and on candidate reports. Typically the lead partner on the search.
          </p>

          <div>
            <label style={labelStyle}>Partner Name</label>
            <input
              value={partnerName} onChange={e => setPartnerName(e.target.value)}
              placeholder="Jane Smith"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Partner Email</label>
            <input
              value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)}
              placeholder="jane@yourfirm.com"
              type="email"
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
              Used as the reply-to for client questions. Displayed as a mailto link in the portal.
            </p>
          </div>
        </div>

        {/* Preview strip */}
        {primaryColor && !colorError && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Portal header preview</p>
            <div style={{ background: primaryColor, borderRadius: 8, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                {logoUrl ? '[ logo ]' : (branding ? 'Your Firm Name' : '…')}
              </span>
              {partnerName && (
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>{partnerName}</span>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !!colorError}
          style={{
            fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563EB',
            border: 'none', borderRadius: 8, padding: '10px 24px',
            cursor: saving || colorError ? 'not-allowed' : 'pointer',
            opacity: saving || colorError ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save branding'}
        </button>
      </form>
    </div>
  )
}
