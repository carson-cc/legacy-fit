'use client'

import { useState, useEffect } from 'react'

interface VariantStats {
  variant: string
  count: number
  avgFit: number
  avgAdaptation: number
  placedCount: number
  retainedAt90: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<VariantStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/ab-stats')
      .then(r => r.json())
      .then(d => { setStats(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-[24px] font-bold text-[#0a0a0a] mb-2">A/B Scoring Variants</h1>
      <p className="text-[13px] text-[#6b7280] mb-6">Comparison of scoring formulas across all completed assessments.</p>

      {loading ? (
        <div className="text-[#9ca3af]">Loading...</div>
      ) : stats.length === 0 ? (
        <div className="text-[#9ca3af]">No assessment data yet.</div>
      ) : (
        <div className="bg-white border border-black/[0.07] rounded-xl overflow-hidden">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-black/[0.05]">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-[#9ca3af] uppercase tracking-widest">Variant</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-[#9ca3af] uppercase tracking-widest">Assessments</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-[#9ca3af] uppercase tracking-widest">Avg Fit</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-[#9ca3af] uppercase tracking-widest">Avg Adapt</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-[#9ca3af] uppercase tracking-widest">Placed</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-[#9ca3af] uppercase tracking-widest">Ret 90d</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {stats.map(s => (
                <tr key={s.variant} className="hover:bg-[#f9f9f8] transition">
                  <td className="px-4 py-3 font-mono text-[12px] font-medium text-[#0a0a0a]">{s.variant}</td>
                  <td className="px-4 py-3 text-right text-[#374151]">{s.count}</td>
                  <td className="px-4 py-3 text-right text-[#374151]">{s.avgFit > 0 ? `${s.avgFit}%` : '—'}</td>
                  <td className="px-4 py-3 text-right text-[#374151]">{s.avgAdaptation.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-[#374151]">{s.placedCount}</td>
                  <td className="px-4 py-3 text-right text-[#374151]">{s.retainedAt90}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
