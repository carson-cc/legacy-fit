'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  industry: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => { setClients(d.data || []); setLoading(false); document.title = 'Veltro — Clients' })
      .catch(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry: industry || null }),
      })
      const data = await res.json()
      if (data.data) {
        setClients(prev => [...prev, data.data])
        setName('')
        setIndustry('')
        setShowForm(false)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0a0a0a] text-white px-4 h-9 inline-flex items-center rounded-lg text-[14px] font-medium hover:bg-[#1a1a1a] transition"
        >
          + New Client
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-black/[0.07] rounded-xl p-5 mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Company Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-black/[0.12] text-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1">Industry (optional)</label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-black/[0.12] text-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0a0a0a] text-white px-4 h-9 inline-flex items-center rounded-lg text-[14px] font-medium hover:bg-[#1a1a1a] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Client'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-[#9ca3af]">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="text-[#9ca3af]">No clients yet.</div>
      ) : (
        <div className="bg-white border border-black/[0.07] rounded-xl divide-y divide-black/[0.05]">
          {clients.map(c => (
            <div key={c.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0a0a0a]">{c.name}</p>
                {c.industry && <p className="text-sm text-[#6b7280]">{c.industry}</p>}
              </div>
              <Link href={`/dashboard/clients/${c.id}/hiring-manager`} className="text-[12px] text-[#9ca3af] hover:text-[#6b7280] transition">
                Hiring Manager Profiles &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
