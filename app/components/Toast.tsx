'use client'
import { useState, useEffect } from 'react'

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' }
const toasts: Toast[] = []
const listeners: Set<() => void> = new Set()

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = Math.random().toString(36).slice(2)
  toasts.push({ id, message, type })
  listeners.forEach(fn => fn())
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx > -1) { toasts.splice(idx, 1); listeners.forEach(fn => fn()) }
  }, 3000)
}

export function ToastContainer() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1)
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`
          px-4 py-3 rounded-lg text-sm font-medium shadow-lg pointer-events-auto animate-fade-slide-up
          ${t.type === 'success' ? 'bg-navy text-white' :
            t.type === 'error' ? 'bg-fit-red text-white' :
            'bg-white text-navy border border-navy/15'}
        `}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
