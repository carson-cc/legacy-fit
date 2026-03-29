'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BG   = '#000'
const CARD = '#0a0a0a'
const TEXT = 'rgba(255,255,255,0.9)'
const MUTED = 'rgba(255,255,255,0.38)'
const BORD = 'rgba(255,255,255,0.07)'
const BLUE  = '#2563EB'
const GREEN = '#16A34A'
const AMBER = '#CA8A04'
const FONT  = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'

// ─── Timing ───────────────────────────────────────────────────────────────────
const STAGE_MS: Record<number, number> = { 1: 4000, 2: 4500, 3: 4500, 4: 5000 }
const HOLD_MS = 2000

// ─── Content ──────────────────────────────────────────────────────────────────
const STAGE_LABELS = ['ROLE BRIEF', 'CANDIDATE RESPONSES', 'ADAPTATION GAP', 'RECOMMENDATION']

const STAKEHOLDERS = [
  { id: 'HM', role: 'Hiring Manager',  picks: ['Decisive', 'Bold'] },
  { id: 'TL', role: 'Team Lead',       picks: ['Competitive', 'Direct'] },
  { id: 'SP', role: 'Search Partner',  picks: ['Decisive', 'Competitive'] },
]
const BENCHMARK_WORDS = ['Decisive', 'Bold', 'Competitive']

const CANDIDATES = [
  { id: 'MT', name: 'M. Torres', words: ['Patient', 'Methodical'],  score: 78, scoreColor: GREEN, scoreBg: 'rgba(22,163,74,0.12)',   scoreBorder: 'rgba(22,163,74,0.2)',   gapFill: GREEN,  gapW: '28%' },
  { id: 'JC', name: 'J. Chen',   words: ['Analytical', 'Thorough'], score: 64, scoreColor: AMBER, scoreBg: 'rgba(202,138,4,0.12)',   scoreBorder: 'rgba(202,138,4,0.2)',   gapFill: AMBER,  gapW: '52%' },
  { id: 'RO', name: 'R. Okafor', words: ['Careful', 'Systematic'],  score: 51, scoreColor: 'rgba(255,255,255,0.4)', scoreBg: 'rgba(255,255,255,0.04)', scoreBorder: 'rgba(255,255,255,0.1)', gapFill: 'rgba(255,255,255,0.25)', gapW: '74%' },
] as const

const DIMS = [
  { label: 'Execution',      val: 62 },
  { label: 'Decision Speed', val: 45 },
  { label: 'Ownership',      val: 71 },
  { label: 'Collaboration',  val: 38 },
  { label: 'Adaptability',   val: 55 },
]

type Stage = 1 | 2 | 3 | 4

// ─── useCountUp ───────────────────────────────────────────────────────────────
function useCountUp(target: number, dur: number, active: boolean) {
  const [val, setVal] = useState(0)
  const ran = useRef(false)
  useEffect(() => {
    if (!active || ran.current) return
    ran.current = true
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - t0) / dur, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, dur])
  return val
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
function Pill({ label, filled = false, compact = false }: {
  label: string; filled?: boolean; compact?: boolean
}) {
  return (
    <span style={{
      padding: compact ? '2px 8px' : '3px 10px',
      borderRadius: 100,
      fontSize: compact ? 10 : 11,
      fontFamily: FONT,
      fontWeight: filled ? 600 : 400,
      background: filled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
      color: filled ? '#000' : 'rgba(255,255,255,0.55)',
      border: `1px solid ${filled ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
      letterSpacing: '-0.01em',
      display: 'inline-block',
      whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </span>
  )
}

// ─── BenchmarkStrip (Stages 2–4) ─────────────────────────────────────────────
function BenchmarkStrip() {
  return (
    <div style={{
      padding: '8px 20px',
      borderBottom: `1px solid ${BORD}`,
      display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
    }}>
      <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>
        Benchmark
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {BENCHMARK_WORDS.map(w => <Pill key={w} label={w} filled compact />)}
      </div>
      <span style={{ fontSize: 8, fontFamily: FONT, color: 'rgba(255,255,255,0.18)', marginLeft: 'auto', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Locked
      </span>
    </div>
  )
}

// ─── Stage 1: The Benchmark ───────────────────────────────────────────────────
function BenchmarkStage() {
  const [rowVis, setRowVis] = useState(-1)
  const [pillVis, setPillVis] = useState<Record<number, number>>({})
  const [locked, setLocked] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // Staggered row reveal
    STAKEHOLDERS.forEach((s, i) => {
      ts.current.push(setTimeout(() => {
        setRowVis(i)
        // Stagger pills within each row
        s.picks.forEach((_, pi) => {
          ts.current.push(setTimeout(() => {
            setPillVis(prev => ({ ...prev, [i * 10 + pi]: 1 }))
          }, 200 + pi * 200))
        })
      }, 200 + i * 500))
    })
    // Lock moment
    ts.current.push(setTimeout(() => setLocked(true), 2800))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {STAKEHOLDERS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: rowVis >= i ? 1 : 0, x: rowVis >= i ? 0 : -8 }}
            transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}
          >
            {/* Initials */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{s.id}</span>
            </div>
            {/* Role */}
            <span style={{ fontSize: 11, fontFamily: FONT, color: 'rgba(255,255,255,0.4)', minWidth: 100, flexShrink: 0 }}>
              {s.role}
            </span>
            {/* Pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {s.picks.map((p, pi) => (
                <motion.span
                  key={p}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: pillVis[i * 10 + pi] ? 1 : 0, scale: pillVis[i * 10 + pi] ? 1 : 0.85 }}
                  transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                  style={{
                    padding: '3px 10px', borderRadius: 100, fontSize: 11, fontFamily: FONT,
                    fontWeight: 600, background: 'rgba(255,255,255,0.9)', color: '#000',
                    letterSpacing: '-0.01em', display: 'inline-block',
                  }}
                >
                  {p}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lock row */}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            style={{
              marginTop: 8,
              background: 'rgba(37,99,235,0.08)',
              borderTop: '1px solid rgba(37,99,235,0.15)',
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: 8,
              marginLeft: -20, marginRight: -20,
            }}
          >
            <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>
              Benchmark
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {BENCHMARK_WORDS.map(w => <Pill key={w} label={w} filled compact />)}
            </div>
            <span style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Locked
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Stage 2: The Candidates ──────────────────────────────────────────────────
function CandidatesStage() {
  const [wordVis, setWordVis] = useState<Record<string, boolean>>({})
  const [progVis, setProgVis] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // Words appear: each candidate starts 150ms after previous, 300ms per word
    CANDIDATES.forEach((c, ci) => {
      c.words.forEach((w, wi) => {
        const delay = ci * 150 + wi * 300 + 300
        ts.current.push(setTimeout(() => {
          setWordVis(prev => ({ ...prev, [`${c.id}-${wi}`]: true }))
        }, delay))
      })
    })
    // Progress bar
    ts.current.push(setTimeout(() => setProgVis(true), 200))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <BenchmarkStrip />
      <div style={{ display: 'flex', flex: 1 }}>
        {CANDIDATES.map((c, ci) => (
          <div
            key={c.id}
            style={{
              flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
              borderRight: ci < CANDIDATES.length - 1 ? `1px solid ${BORD}` : 'none',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{c.id}</span>
              </div>
              <span style={{ fontSize: 12, fontFamily: FONT, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em' }}>
                {c.name}
              </span>
            </div>

            {/* Words */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {c.words.map((w, wi) => (
                <motion.span
                  key={w}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: wordVis[`${c.id}-${wi}`] ? 1 : 0, y: wordVis[`${c.id}-${wi}`] ? 0 : 4 }}
                  transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                  style={{
                    padding: '3px 9px', borderRadius: 100, fontSize: 10, fontFamily: FONT,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.55)', display: 'inline-block', width: 'fit-content',
                  }}
                >
                  {w}
                </motion.span>
              ))}
            </div>

            {/* Progress line */}
            <div style={{ marginTop: 'auto', height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progVis ? '100%' : 0 }}
                transition={{ duration: 1.2, ease: 'linear', delay: ci * 0.1 + 0.3 }}
                style={{ height: '100%', background: BLUE }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Stage 3: The Gap ─────────────────────────────────────────────────────────
function GapStage() {
  const [gapVis, setGapVis] = useState(false)
  const [barVis, setBarVis] = useState(false)
  const [insightVis, setInsightVis] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.push(setTimeout(() => setGapVis(true), 600))
    ts.current.push(setTimeout(() => setBarVis(true), 800))
    ts.current.push(setTimeout(() => setInsightVis(true), 2400))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      <BenchmarkStrip />

      {/* Three candidate panels */}
      <div style={{ display: 'flex', flex: 1 }}>
        {CANDIDATES.map((c, ci) => (
          <div
            key={c.id}
            style={{
              flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
              borderRight: ci < CANDIDATES.length - 1 ? `1px solid ${BORD}` : 'none',
            }}
          >
            {/* Header: name + score */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontFamily: FONT, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
                {c.name}
              </span>
              <span style={{
                fontSize: 9, fontFamily: FONT, fontWeight: 600,
                background: c.scoreBg, color: c.scoreColor,
                border: `1px solid ${c.scoreBorder}`, borderRadius: 4,
                padding: '2px 7px', letterSpacing: '0.04em',
              }}>
                {c.score}
              </span>
            </div>

            {/* Role row */}
            <div>
              <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Role
              </span>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {BENCHMARK_WORDS.slice(0, 2).map(w => <Pill key={w} label={w} filled compact />)}
              </div>
            </div>

            {/* Gap divider */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: gapVis ? 1 : 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  fontSize: 7, fontFamily: FONT, fontWeight: 600,
                  color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em',
                  textTransform: 'uppercase', padding: '0 5px', background: CARD,
                  position: 'relative',
                }}
              >
                GAP
              </motion.span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Natural row */}
            <div>
              <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Natural
              </span>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {c.words.map(w => <Pill key={w} label={w} compact />)}
              </div>
            </div>

            {/* Gap severity bar */}
            <div style={{ marginTop: 'auto', height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: barVis ? c.gapW : 0 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: ci * 0.08 }}
                style={{ height: '100%', background: c.gapFill, borderRadius: 1 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insight line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: insightVis ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          textAlign: 'center', fontSize: 12, fontFamily: FONT,
          fontWeight: 300, fontStyle: 'italic',
          color: 'rgba(255,255,255,0.35)',
          padding: '10px 20px',
          borderTop: `1px solid ${BORD}`,
        }}
      >
        The gap is where the signal lives.
      </motion.p>
    </motion.div>
  )
}

// ─── Stage 4: The Verdict ─────────────────────────────────────────────────────
function VerdictStage() {
  const [archetypeVis, setArchetypeVis] = useState(false)
  const [subtitleVis, setSubtitleVis] = useState(false)
  const [barsVis, setBarsVis] = useState(false)
  const [footnoteVis, setFootnoteVis] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.push(setTimeout(() => setArchetypeVis(true), 200))
    ts.current.push(setTimeout(() => setSubtitleVis(true), 400))
    ts.current.push(setTimeout(() => setBarsVis(true), 600))
    ts.current.push(setTimeout(() => setFootnoteVis(true), 1800))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
    >
      {/* Left: score zone */}
      <div style={{
        width: '40%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        borderRight: `1px solid ${BORD}`, padding: '20px 16px', gap: 6,
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 'clamp(48px, 6vw, 64px)', fontFamily: FONT, fontWeight: 700,
          color: '#fff', letterSpacing: '-0.04em', lineHeight: 1,
        }}>
          78
        </span>
        <span style={{ fontSize: 11, fontFamily: FONT, fontWeight: 500, color: GREEN }}>
          Strong match
        </span>
        <span style={{ fontSize: 11, fontFamily: FONT, color: 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: '-0.01em' }}>
          M. Torres<br />VP Operations
        </span>
      </div>

      {/* Right: archetype + bars */}
      <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        {/* Archetype name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: archetypeVis ? 1 : 0, scale: archetypeVis ? 1 : 0.96 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        >
          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)', fontFamily: FONT, fontWeight: 700,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em', lineHeight: 1.05,
          }}>
            THE OPERATOR
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: subtitleVis ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          style={{ fontSize: 11, fontFamily: FONT, color: MUTED, letterSpacing: '-0.01em', marginTop: -6 }}
        >
          Deliberate · Output-focused
        </motion.p>

        {/* Dimension bars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: barsVis ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {DIMS.map((d, i) => (
            <div key={d.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.28)' }}>
                  {d.val}
                </span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: barsVis ? `${d.val}%` : 0 }}
                  transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1], delay: i * 0.08 }}
                  style={{ height: '100%', background: BLUE, borderRadius: 2 }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: footnoteVis ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 'auto', letterSpacing: '0.03em' }}
        >
          From 20 reference profiles · 94 signals
        </motion.p>
      </div>
    </motion.div>
  )
}

// ─── CardHeader ───────────────────────────────────────────────────────────────
function CardHeader({ stage, onJump }: { stage: Stage; onJump: (s: Stage) => void }) {
  return (
    <div style={{
      height: 40, padding: '0 20px', borderBottom: `1px solid ${BORD}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Veltro Signal Engine
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {([1, 2, 3, 4] as Stage[]).map(s => (
            <button
              key={s}
              onClick={() => onJump(s)}
              aria-label={STAGE_LABELS[s - 1]}
              style={{
                width: 6, height: 6, borderRadius: '50%', border: 'none',
                cursor: 'pointer', padding: 0, display: 'block',
                background: s <= stage ? BLUE : 'rgba(255,255,255,0.1)',
                transition: 'background 300ms ease',
              }}
            />
          ))}
        </div>
        <motion.span
          key={stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 8, fontFamily: FONT, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {STAGE_LABELS[stage - 1]}
        </motion.span>
      </div>
    </div>
  )
}

// ─── SystemCard ───────────────────────────────────────────────────────────────
function SystemCard({ active }: { active: boolean }) {
  const [stage, setStage] = useState<Stage>(1)
  const stageRef = useRef<Stage>(1)
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([])
  const started  = useRef(false)

  const clearTs = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const startFrom = useCallback((s: Stage) => {
    clearTs()
    stageRef.current = s
    setStage(s)
    const advance = (cur: Stage) => {
      const dur = STAGE_MS[cur] + (cur === 4 ? HOLD_MS : 0)
      timers.current.push(setTimeout(() => {
        const next = cur === 4 ? 1 : ((cur + 1) as Stage)
        stageRef.current = next
        setStage(next)
        advance(next)
      }, dur))
    }
    advance(s)
  }, [clearTs])

  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    startFrom(1)
    return clearTs
  }, [active, startFrom, clearTs])

  const handleMouseEnter = useCallback(() => clearTs(), [clearTs])
  const handleMouseLeave = useCallback(() => startFrom(stageRef.current), [startFrom])

  return (
    <div
      style={{
        background: CARD, border: `1px solid ${BORD}`, borderRadius: 14,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '100%', minHeight: 460,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader stage={stage} onJump={startFrom} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {stage === 1 && <BenchmarkStage key="s1" />}
          {stage === 2 && <CandidatesStage key="s2" />}
          {stage === 3 && <GapStage key="s3" />}
          {stage === 4 && <VerdictStage key="s4" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Metric ───────────────────────────────────────────────────────────────────
function Metric({ val, label, active }: { val: number; label: string; active: boolean }) {
  const count = useCountUp(val, 750, active)
  return (
    <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontFamily: FONT, fontWeight: 700, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {count}
      </span>
      <span style={{ fontSize: 11, fontFamily: FONT, fontWeight: 300, color: MUTED, lineHeight: 1.4 }}>
        {label}
      </span>
    </div>
  )
}

// ─── HowItWorksSection ────────────────────────────────────────────────────────
export function HowItWorksSection() {
  const [active, setActive] = useState(false)

  useEffect(() => { setActive(true) }, [])

  return (
    <section
      style={{
        height: '100vh', flexShrink: 0, scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 64px', background: BG, overflowY: 'auto',
        borderTop: `1px solid ${BORD}`,
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: 'min(1120px, calc(100vw - clamp(40px, 8vw, 160px)))',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 80, alignItems: 'center',
      }}>
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 600, fontFamily: FONT,
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: 'clamp(32px, 4.5vw, 56px)',
            fontWeight: 700, fontFamily: FONT, color: TEXT,
            letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 20,
          }}>
            Six minutes.<br />Ninety-four signals.
          </h2>
          <p style={{
            fontSize: 15, fontFamily: FONT, fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.75, marginBottom: 40, maxWidth: 360,
          }}>
            The hiring team defines what the role demands. Every candidate completes
            the same six-minute exercise. Veltro measures the distance between the two.
          </p>

          {/* 2×2 metrics grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            border: `1px solid ${BORD}`, borderRadius: 12, overflow: 'hidden',
          }}>
            {[
              { val: 80, label: 'Adjective choices' },
              { val: 94, label: 'Behavioral signals' },
              { val: 5,  label: 'Dimensions scored' },
              { val: 1,  label: 'Fit score vs benchmark' },
            ].map((m, i) => (
              <div key={i} style={{
                borderRight: i % 2 === 0 ? `1px solid ${BORD}` : 'none',
                borderBottom: i < 2 ? `1px solid ${BORD}` : 'none',
              }}>
                <Metric val={m.val} label={m.label} active={active} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: system card ─────────────────────────────── */}
        <div style={{ height: 460 }}>
          <SystemCard active={active} />
        </div>
      </div>
    </section>
  )
}
