'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/app/components/Toast'

interface HiringManager {
  id: string
  name: string
  email: string | null
  profileType: string | null
  completedAt: string | null
  token: string
  dominance: number | null
  extraversion: number | null
  patience: number | null
  formality: number | null
}

const DIMENSIONS = [
  { key: 'dominance', label: 'D' },
  { key: 'extraversion', label: 'E' },
  { key: 'patience', label: 'P' },
  { key: 'formality', label: 'F' },
] as const

function MiniDimensionBars({ hm }: { hm: HiringManager }) {
  return (
    <div className="flex items-center gap-3">
      {DIMENSIONS.map(d => {
        const val = hm[d.key]
        return (
          <div key={d.key} className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#9ca3af] font-medium w-3">{d.label}</span>
            <div className="w-16 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0a0a0a] transition-all"
                style={{ width: val != null ? `${val}%` : '0%' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CopyableLink({ url }: { url: string }) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  function handleCopy() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast('Link copied to clipboard', 'success')
    }).catch(() => {
      showToast('Failed to copy link', 'error')
    })
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        value={fullUrl}
        className="flex-1 px-3 py-1.5 text-[13px] bg-white border border-black/[0.12] text-[#0a0a0a] rounded-lg truncate focus:outline-none"
      />
      <button
        onClick={handleCopy}
        className="shrink-0 px-3 h-8 text-[13px] font-medium bg-white border border-black/[0.12] text-[#0a0a0a] rounded-lg hover:bg-[#f5f5f4] transition"
      >
        Copy
      </button>
    </div>
  )
}

export default function HiringManagerPage() {
  const { id } = useParams<{ id: string }>()
  const [hms, setHms] = useState<HiringManager[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [newUrl, setNewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/clients/${id}/hiring-manager`)
      .then(r => r.json())
      .then(d => { setHms(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const completed = hms.filter(h => h.completedAt)
  const pending = hms.filter(h => !h.completedAt)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${id}/hiring-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined }),
      })
      const data = await res.json()
      if (data.data) {
        const { assessmentUrl, ...hm } = data.data
        setHms(prev => [hm, ...prev])
        setNewUrl(assessmentUrl)
        setName('')
        setEmail('')
        showToast('Hiring manager added', 'success')
      } else {
        showToast(data.error || 'Failed to add hiring manager', 'error')
      }
    } catch {
      showToast('Failed to add hiring manager', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/clients"
          className="text-[13px] text-[#6b7280] hover:text-[#0a0a0a] transition mb-3 inline-block"
        >
          &larr; Clients
        </Link>
        <h1 className="text-[24px] font-bold text-[#0a0a0a]">Hiring Manager Profiles</h1>
        <p className="text-[14px] text-[#6b7280] mt-1">
          Capture hiring manager communication styles to improve candidate-manager fit scoring.
        </p>
      </div>

      {/* Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <button
          onClick={() => { setShowForm(!showForm); setNewUrl(null) }}
          className="bg-[#0a0a0a] text-white px-4 h-9 inline-flex items-center rounded-lg text-[14px] font-medium hover:bg-[#1a1a1a] transition"
        >
          + Add Hiring Manager
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-white border border-black/[0.07] rounded-xl p-5 mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Hiring manager's full name"
                className="w-full px-3 py-2 bg-white border border-black/[0.12] text-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b7280] mb-1">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full px-3 py-2 bg-white border border-black/[0.12] text-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0a0a0a] text-white px-4 h-9 inline-flex items-center rounded-lg text-[14px] font-medium hover:bg-[#1a1a1a] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Send Assessment'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setNewUrl(null) }}
                className="text-[14px] text-[#6b7280] hover:text-[#0a0a0a] transition"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Assessment URL after creation */}
          {newUrl && (
            <div className="mt-4 pt-4 border-t border-black/[0.07]">
              <p className="text-[13px] text-[#6b7280] mb-2">Assessment link created. Share this with the hiring manager:</p>
              <CopyableLink url={newUrl} />
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-[14px] text-[#9ca3af]">Loading...</p>
      )}

      {/* Completed Profiles */}
      {!loading && completed.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest font-medium mb-3">
            Completed Profiles
          </p>
          <div className="space-y-3">
            {completed.map(hm => (
              <div
                key={hm.id}
                className="bg-white border border-black/[0.07] rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#0a0a0a] truncate">{hm.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {hm.profileType && (
                        <span className="text-[12px] text-[#6b7280]">{hm.profileType}</span>
                      )}
                      {hm.completedAt && (
                        <span className="text-[12px] text-[#9ca3af]">
                          {new Date(hm.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <MiniDimensionBars hm={hm} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Assessments */}
      {!loading && pending.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest font-medium mb-3">
            Pending Assessments
          </p>
          <div className="space-y-3">
            {pending.map(hm => (
              <div
                key={hm.id}
                className="bg-white border border-black/[0.07] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[14px] font-semibold text-[#0a0a0a]">{hm.name}</p>
                  <span className="text-[12px] text-[#9ca3af]">Awaiting completion</span>
                </div>
                <CopyableLink url={`/assess/${hm.token}?type=hm`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && hms.length === 0 && !showForm && (
        <div className="bg-white border border-black/[0.07] rounded-xl p-8 text-center">
          <p className="text-[14px] text-[#6b7280]">
            No hiring manager profiles yet. Add one to get started.
          </p>
        </div>
      )}
    </div>
  )
}
