'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ADJECTIVES } from '@/lib/data/adjectives'
import { PRODUCT_NAME } from '@/lib/brand'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

type Phase = 'loading' | 'welcome' | 'list1' | 'list2' | 'submitting' | 'complete' | 'error'

interface CompletionData {
  profileName: string
  profileGroup: string
  tagline: string
  description: string
}

export default function AssessPage() {
  const params = useParams()
  const token = params.token as string

  const [phase, setPhase] = useState<Phase>('loading')
  const [candidateName, setCandidateName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [completionData, setCompletionData] = useState<CompletionData | null>(null)

  const [list1Order, setList1Order] = useState<string[]>([])
  const [list2Order, setList2Order] = useState<string[]>([])
  const [list1Checked, setList1Checked] = useState<Set<string>>(new Set())
  const [list2Checked, setList2Checked] = useState<Set<string>>(new Set())

  const page1StartRef = useRef<number>(0)
  const page2StartRef = useRef<number>(0)
  const [timeOnPage1Ms, setTimeOnPage1Ms] = useState(0)
  const [timeOnPage2Ms, setTimeOnPage2Ms] = useState(0)

  const [showLowCountWarning, setShowLowCountWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<'finishList1' | 'submitAssessment' | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scoringVariant, setScoringVariant] = useState<'v1_stepped' | 'v2_quadratic'>('v2_quadratic')

  const storageKey = `legacy-fit-${token}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.list1Order) setList1Order(data.list1Order)
        if (data.list2Order) setList2Order(data.list2Order)
        if (data.list1Checked) setList1Checked(new Set(data.list1Checked))
        if (data.list2Checked) setList2Checked(new Set(data.list2Checked))
        if (data.phase && data.phase !== 'loading' && data.phase !== 'submitting') {
          setPhase(data.phase)
          return
        }
      }
    } catch { /* ignore */ }

    const variantKey = `lf-variant-${token}`
    const savedVariant = localStorage.getItem(variantKey)
    if (savedVariant === 'v1_stepped' || savedVariant === 'v2_quadratic') {
      setScoringVariant(savedVariant)
    } else {
      const assigned = Math.random() < 0.5 ? 'v1_stepped' : 'v2_quadratic'
      localStorage.setItem(variantKey, assigned)
      setScoringVariant(assigned)
    }

    const words = ADJECTIVES.map(a => a.word)
    setList1Order(shuffleArray(words))
    setList2Order(shuffleArray(words))
  }, [storageKey])

  useEffect(() => {
    fetch(`/api/assess/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error)
          setPhase('error')
        } else if (data.completed) {
          setCompletionData({
            profileName: data.profileName,
            profileGroup: data.profileGroup || '',
            tagline: '',
            description: data.description || '',
          })
          setPhase('complete')
        } else {
          setCandidateName(data.candidateName || '')
          if (phase === 'loading') setPhase('welcome')
        }
      })
      .catch(() => {
        setErrorMsg('Failed to load assessment. Check your link and try again.')
        setPhase('error')
      })
  }, [token, phase])

  const saveState = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        list1Order, list2Order,
        list1Checked: Array.from(list1Checked),
        list2Checked: Array.from(list2Checked),
        phase,
      }))
    } catch { /* ignore */ }
  }, [storageKey, list1Order, list2Order, list1Checked, list2Checked, phase])

  useEffect(() => { saveState() }, [saveState])

  useEffect(() => {
    if (phase !== 'list1' && phase !== 'list2') return
    function handleScroll() { setShowScrollTop(window.scrollY > 400) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [phase])

  function toggleWord(list: 1 | 2, word: string) {
    if (list === 1) {
      setList1Checked(prev => {
        const next = new Set(prev)
        if (next.has(word)) { next.delete(word) } else { next.add(word) }
        return next
      })
    } else {
      setList2Checked(prev => {
        const next = new Set(prev)
        if (next.has(word)) { next.delete(word) } else { next.add(word) }
        return next
      })
    }
  }

  function startList1() {
    setPhase('list1')
    page1StartRef.current = Date.now()
  }

  function finishList1() {
    if (list1Checked.size < 10) return
    if (list1Checked.size < 15) {
      setShowLowCountWarning(true)
      setPendingAction('finishList1')
      return
    }
    doFinishList1()
  }

  function doFinishList1() {
    setShowLowCountWarning(false)
    setPendingAction(null)
    setTimeOnPage1Ms(Date.now() - page1StartRef.current)
    setPhase('list2')
    page2StartRef.current = Date.now()
    window.scrollTo(0, 0)
  }

  async function submitAssessment() {
    if (list2Checked.size < 10) return
    if (list2Checked.size < 15) {
      setShowLowCountWarning(true)
      setPendingAction('submitAssessment')
      return
    }
    doSubmitAssessment()
  }

  async function doSubmitAssessment() {
    setShowLowCountWarning(false)
    setPendingAction(null)
    const t2 = Date.now() - page2StartRef.current
    setTimeOnPage2Ms(t2)
    setPhase('submitting')

    const payload = {
      list1Checked: Array.from(list1Checked),
      list2Checked: Array.from(list2Checked),
      list1Order, list2Order,
      timeOnPage1Ms, timeOnPage2Ms: t2,
      scoringVariant,
    }

    let retries = 0
    while (retries < 3) {
      try {
        const res = await fetch(`/api/assess/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setCompletionData(data)
          setPhase('complete')
          localStorage.removeItem(storageKey)
          return
        }
        if (data.error === 'Assessment already completed') {
          setPhase('complete')
          return
        }
        throw new Error(data.error || 'Submission failed')
      } catch {
        retries++
        if (retries < 3) await new Promise(r => setTimeout(r, 1000 * retries))
      }
    }

    setErrorMsg('Something went wrong. Your answers are saved — please try again.')
    setPhase('list2')
  }

  function handleContinueAnyway() {
    if (pendingAction === 'finishList1') doFinishList1()
    else if (pendingAction === 'submitAssessment') doSubmitAssessment()
  }

  // ─── LOADING ─────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#060B14',
      }}>
        <div style={{
          width: 20, height: 20, border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────

  if (phase === 'error') {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#060B14', padding: '24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>Unable to load assessment</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{errorMsg}</p>
        </div>
      </div>
    )
  }

  // ─── WELCOME ──────────────────────────────────────────────────────────────

  if (phase === 'welcome') {
    const firstName = candidateName ? candidateName.split(' ')[0] : ''
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#060B14', padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</span>
          </div>

          {/* Card */}
          <div style={{
            background: '#0D1421', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
          }}>
            {firstName && (
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
                Hi {firstName},
              </p>
            )}
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              You&rsquo;ve been invited to complete a brief behavioral assessment.
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 32px' }}>
              There are no right or wrong answers. Select words that feel true to you. Don&rsquo;t overthink it.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '⏱', label: 'About 6 minutes' },
                { icon: '📱', label: 'Works on any device' },
                { icon: '🔒', label: 'No login required' },
                { icon: '✓', label: 'No right or wrong answers' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                  padding: '10px 12px',
                }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Payoff callout */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.18)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 32,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 5 }}/>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                When you finish, you&rsquo;ll see your behavioral profile — what drives you, where you thrive, and how you work.
              </p>
            </div>

            <button
              onClick={startList1}
              style={{
                width: '100%', height: 52, borderRadius: 10,
                background: '#2563EB', color: '#FFFFFF',
                fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
                transition: 'all 180ms ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Begin assessment
            </button>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              Responses are confidential and used only to match you with the right role.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── SUBMITTING ───────────────────────────────────────────────────────────

  if (phase === 'submitting') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#060B14',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40, border: '2px solid rgba(255,255,255,0.06)',
          borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', marginBottom: 20,
        }} />
        <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: '0 0 6px' }}>Analyzing your responses</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>This takes just a moment</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ─── COMPLETE ─────────────────────────────────────────────────────────────

  if (phase === 'complete') {
    const firstName = candidateName ? candidateName.split(' ')[0] : ''
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#060B14', padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <style>{`
            @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
            @keyframes spin { to { transform: rotate(360deg) } }
          `}</style>

          <div style={{ animation: 'fadeUp 400ms ease-out both', animationDelay: '0ms' }}>
            {/* Checkmark */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div style={{ animation: 'fadeUp 400ms ease-out both', animationDelay: '100ms' }}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>
              {firstName ? `You're done, ${firstName}.` : "You're done."}
            </p>
            {completionData && (
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {completionData.profileName}
              </h1>
            )}
          </div>

          {completionData && (
            <div style={{ animation: 'fadeUp 400ms ease-out both', animationDelay: '250ms' }}>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginBottom: 32, fontStyle: 'italic' }}>
                {completionData.tagline || completionData.profileGroup}
              </p>
            </div>
          )}

          {completionData?.description && (
            <div style={{ animation: 'fadeUp 400ms ease-out both', animationDelay: '300ms' }}>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 28, textAlign: 'left' }}>
                {completionData.description}
              </p>
            </div>
          )}

          <div style={{ animation: 'fadeUp 400ms ease-out both', animationDelay: '450ms' }}>
            <div style={{
              background: '#0D1421', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '20px 24px',
            }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                Your results have been shared with your recruiter. They&rsquo;ll be in touch shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── WORD LISTS ───────────────────────────────────────────────────────────

  const isList1 = phase === 'list1'
  const currentOrder = isList1 ? list1Order : list2Order
  const currentChecked = isList1 ? list1Checked : list2Checked
  const selectionCount = currentChecked.size
  const canProceed = selectionCount >= 10

  const sweetSpot = selectionCount >= 15 && selectionCount <= 45
  const tooFew = selectionCount > 0 && selectionCount < 15
  const tooMany = selectionCount > 45

  // Progress: list1 = step 1/2, list2 = step 2/2
  const progressPct = isList1 ? Math.min(selectionCount / 20 * 50, 50) : 50 + Math.min(selectionCount / 20 * 50, 50)

  return (
    <div style={{ minHeight: '100svh', background: '#FFFFFF', paddingBottom: 96 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .word-chip-assess {
          display: flex; align-items: center; justify-content: center;
          padding: 10px 14px; border-radius: 8px;
          border: 1.5px solid #E5E7EB; background: #FFFFFF;
          font-size: 14px; font-weight: 500; color: #374151;
          cursor: pointer; transition: all 120ms ease;
          user-select: none; -webkit-tap-highlight-color: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
          min-height: 44px;
        }
        .word-chip-assess:hover { border-color: #2563EB; color: #1D4ED8; background: rgba(37,99,235,0.04); }
        .word-chip-assess[data-selected="true"] {
          border-color: #2563EB; background: rgba(37,99,235,0.08); color: #1D4ED8; font-weight: 600;
        }
        @media (max-width: 640px) {
          .word-grid-assess { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#F3F4F6', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <div style={{
          height: '100%', background: '#2563EB', width: `${progressPct}%`,
          transition: 'width 300ms ease',
        }} />
      </div>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 3, zIndex: 10,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #F3F4F6', padding: '14px 20px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: isList1 ? '#2563EB' : '#E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 200ms ease',
              }}>
                {isList1 ? <span style={{ fontSize: 11, fontWeight: 700, color: '#FFF' }}>1</span>
                  : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{ width: 2, height: 2, borderRadius: '50%', background: '#D1D5DB' }} />
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: !isList1 ? '#2563EB' : '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 200ms ease',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: !isList1 ? '#FFF' : '#9CA3AF' }}>2</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{PRODUCT_NAME}</div>
        </div>
      </div>

      {/* Instruction */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 16px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
          {isList1
            ? 'Select words that describe how others expect you to act at work.'
            : 'Now select words that describe you as you naturally are.'}
        </h2>
        <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>
          {isList1
            ? 'Think about expectations from your manager, team, or the environment you work in.'
            : 'Ignore the previous list. What words feel most authentically you?'}
        </p>
      </div>

      {/* Word grid */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
        <div
          className="word-grid-assess"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
        >
          {currentOrder.map(word => {
            const isSelected = currentChecked.has(word)
            return (
              <button
                key={word}
                onClick={() => toggleWord(isList1 ? 1 : 2, word)}
                className="word-chip-assess"
                data-selected={isSelected ? 'true' : 'false'}
              >
                {word}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: 88, right: 20, zIndex: 20,
            width: 40, height: 40, borderRadius: '50%',
            background: '#111827', color: '#FFF', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 150ms ease',
          }}
          aria-label="Scroll to top"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3L3 8.5H6V13H10V8.5H13L8 3Z" fill="currentColor" />
          </svg>
        </button>
      )}

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)',
        borderTop: '1px solid #F3F4F6',
        padding: '12px 20px', zIndex: 10,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Low count warning */}
          {showLowCountWarning && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 10, gap: 12,
            }}>
              <span style={{ fontSize: 13, color: '#9A3412', lineHeight: 1.4 }}>
                Fewer than 15 words selected. Results may be less accurate.
              </span>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <button onClick={handleContinueAnyway} style={{ fontSize: 13, fontWeight: 600, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Continue anyway
                </button>
                <button onClick={() => { setShowLowCountWarning(false); setPendingAction(null) }} style={{ fontSize: 13, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Go back
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            {/* Selection count feedback */}
            <div style={{ fontSize: 14 }}>
              {selectionCount === 0 && (
                <span style={{ color: '#9CA3AF' }}>Select at least 10 words to continue</span>
              )}
              {tooFew && selectionCount > 0 && (
                <span style={{ color: '#F97316' }}>{selectionCount} selected &mdash; 15+ for best results</span>
              )}
              {sweetSpot && (
                <span style={{ color: '#22C55E', fontWeight: 500 }}>{selectionCount} selected</span>
              )}
              {tooMany && (
                <span style={{ color: '#EAB308' }}>{selectionCount} selected &mdash; consider narrowing</span>
              )}
            </div>

            {/* Action button — full width on mobile */}
            {isList1 ? (
              <button
                onClick={finishList1}
                disabled={!canProceed}
                style={{
                  height: 44, padding: '0 24px', borderRadius: 8,
                  background: canProceed ? '#111827' : '#E5E7EB',
                  color: canProceed ? '#FFF' : '#9CA3AF',
                  fontSize: 14, fontWeight: 600, border: 'none',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms ease',
                  width: '100%', maxWidth: 320,
                }}
                onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = '#1F2937' }}
                onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = '#111827' }}
              >
                Continue &rarr;
              </button>
            ) : (
              <button
                onClick={submitAssessment}
                disabled={!canProceed}
                style={{
                  height: 44, padding: '0 24px', borderRadius: 8,
                  background: canProceed ? '#2563EB' : '#E5E7EB',
                  color: canProceed ? '#FFF' : '#9CA3AF',
                  fontSize: 14, fontWeight: 600, border: 'none',
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms ease',
                  width: '100%', maxWidth: 320,
                }}
                onMouseEnter={e => { if (canProceed) { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)' } }}
                onMouseLeave={e => { if (canProceed) { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.boxShadow = 'none' } }}
              >
                Submit assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
