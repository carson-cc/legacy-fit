'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BG    = '#000'
const CARD  = '#0a0a0a'
const TEXT  = 'rgba(255,255,255,0.9)'
const MUTED = 'rgba(255,255,255,0.38)'
const BORD  = 'rgba(255,255,255,0.07)'
const BLUE  = '#2563EB'
const GREEN = '#16A34A'
const AMBER = '#CA8A04'
const FONT  = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
const COND  = '"Barlow Condensed", "Arial Narrow", sans-serif'

// ─── Timing ───────────────────────────────────────────────────────────────────
const STAGE_MS: Record<number, number> = { 1: 5500, 2: 5000, 3: 5500, 4: 6000 }
const HOLD_MS = 1500

// ─── Content ──────────────────────────────────────────────────────────────────
const STAGE_LABELS = ['ROLE BRIEF', 'CANDIDATE INPUT', 'ADAPTATION GAP', 'THE VERDICT']
const BENCHMARK    = ['Decisive', 'Bold', 'Competitive']
const ARCHETYPE    = 'THE OPERATOR'

const STAKEHOLDERS = [
  { id: 'HM', role: 'Hiring Manager',  picks: ['Decisive', 'Bold'] },
  { id: 'TL', role: 'Team Lead',       picks: ['Competitive', 'Direct'] },
  { id: 'SP', role: 'Search Partner',  picks: ['Decisive', 'Competitive'] },
]

// Per-candidate word timing (ms between words)
const CAND_TIMING: Record<string, number[]> = {
  MT: [0, 120],        // decisive — fast
  JC: [0, 700],        // hesitation — long gap before second word
  RO: [0, 220],        // methodical — even
}
const CAND_DATA = [
  { id: 'MT', name: 'M. Torres', words: ['Patient', 'Methodical'],  progDur: 1800, progBurst: false },
  { id: 'JC', name: 'J. Chen',   words: ['Analytical', 'Thorough'], progDur: 800,  progBurst: true  },
  { id: 'RO', name: 'R. Okafor', words: ['Careful', 'Systematic'],  progDur: 2200, progBurst: false },
] as const

const DIMS = [
  { label: 'Execution',      val: 62 },
  { label: 'Decision Speed', val: 45 },
  { label: 'Ownership',      val: 71 },
  { label: 'Collaboration',  val: 38 },
  { label: 'Adaptability',   val: 55 },
]

type Stage = 1 | 2 | 3 | 4

// ─── Shared stage transition ──────────────────────────────────────────────────
const stageVariant = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, delay: 0.08, ease: [0.33,1,0.68,1] as [number,number,number,number] } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.2 } },
}

// ─── useScheduler ─────────────────────────────────────────────────────────────
function useScheduler() {
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearAll = useCallback(() => { ts.current.forEach(clearTimeout); ts.current = [] }, [])
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms); ts.current.push(id)
  }, [])
  useEffect(() => () => clearAll(), [clearAll])
  return { schedule, clearAll }
}

// ─── useCountUp (unchanged) ───────────────────────────────────────────────────
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

// ─── STAGE 1 — ROLE BRIEF ─────────────────────────────────────────────────────
function RoleBriefStage() {
  const { schedule } = useScheduler()

  // Cursor: x,y relative to stage container, visible flag
  const [cur, setCur]       = useState({ x: -20, y: -20, vis: false })
  const [rowVis, setRowVis] = useState(-1)
  // selected pills: "si-wi" strings
  const [sel, setSel]       = useState<Set<string>>(new Set())
  const [lockVis, setLock]  = useState(false)
  const [editVis, setEdit]  = useState(false)

  // Layout constants (px within stage container, padding-left 20)
  // Row y centers: 20px top-pad + 8px row-pad + 14px (half of 28px circle)
  const ROW_Y  = [42, 86, 130]
  // Pills start x: 20 (pad) + 28 (circle) + 10 (gap) + 112 (role) + 10 (gap) = 180
  const PILL_X = 195

  const addSel = useCallback((key: string) => setSel(prev => new Set([...prev, key])), [])

  useEffect(() => {
    // ── Row 0: HM ──────────────────────────────────────────── t=200
    schedule(() => setRowVis(0), 200)
    // cursor hesitates toward "Methodical" then backtracks to "Decisive"
    schedule(() => setCur({ x: PILL_X + 65, y: ROW_Y[0], vis: true }), 320)
    schedule(() => setCur({ x: PILL_X,      y: ROW_Y[0], vis: true }), 490) // move back
    schedule(() => addSel('0-0'), 680)            // Decisive selects
    schedule(() => setCur({ x: PILL_X + 68, y: ROW_Y[0], vis: true }), 750) // to Bold
    schedule(() => addSel('0-1'), 920)            // Bold selects
    schedule(() => setCur(c => ({ ...c, vis: false })), 1000)

    // ── Row 1: TL ──────────────────────────────────────────── t=700
    schedule(() => setRowVis(1), 700)
    schedule(() => setCur({ x: PILL_X,      y: ROW_Y[1], vis: true }), 820)
    schedule(() => addSel('1-0'), 980)            // Competitive
    schedule(() => setCur({ x: PILL_X + 80, y: ROW_Y[1], vis: true }), 1040)
    schedule(() => addSel('1-1'), 1200)           // Direct
    schedule(() => setCur(c => ({ ...c, vis: false })), 1270)

    // ── Row 2: SP ──────────────────────────────────────────── t=1200
    schedule(() => setRowVis(2), 1200)
    schedule(() => setCur({ x: PILL_X,      y: ROW_Y[2], vis: true }), 1320)
    schedule(() => addSel('2-0'), 1480)           // Decisive
    schedule(() => setCur({ x: PILL_X + 72, y: ROW_Y[2], vis: true }), 1540)
    schedule(() => addSel('2-1'), 1700)           // Competitive
    schedule(() => setCur(c => ({ ...c, vis: false })), 1770)

    // ── Lock ───────────────────────────────────────────────── t=2800
    schedule(() => setLock(true), 2800)
    // ── Editorial ──────────────────────────────────────────── t=3800
    schedule(() => setEdit(true), 3800)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div variants={stageVariant} initial="hidden" animate="show" exit="exit"
      style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Cursor dot */}
      <div style={{
        position: 'absolute', width: 8, height: 8, borderRadius: '50%',
        background: 'rgba(255,255,255,0.75)', border: '1.5px solid white',
        pointerEvents: 'none', zIndex: 10,
        opacity: cur.vis ? 1 : 0,
        left: cur.x - 4, top: cur.y - 4,
        transition: 'left 220ms cubic-bezier(0.25,0.1,0.25,1), top 220ms cubic-bezier(0.25,0.1,0.25,1), opacity 180ms ease',
      }} />

      {/* Stakeholder rows */}
      {STAKEHOLDERS.map((s, si) => (
        <motion.div key={s.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: rowVis >= si ? 1 : 0, x: rowVis >= si ? 0 : -6 }}
          transition={{ duration: 0.28, ease: [0.33,1,0.68,1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          {/* Initials */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{s.id}</span>
          </div>
          {/* Role */}
          <span style={{ fontSize: 11, fontFamily: FONT, color: 'rgba(255,255,255,0.38)', minWidth: 112, flexShrink: 0 }}>
            {s.role}
          </span>
          {/* Pills */}
          <div style={{ display: 'flex', gap: 5 }}>
            {s.picks.map((w, wi) => (
              <motion.span key={w}
                initial={{ opacity: 0, scale: 0.88, y: 3 }}
                animate={{ opacity: sel.has(`${si}-${wi}`) ? 1 : 0, scale: sel.has(`${si}-${wi}`) ? 1 : 0.88, y: sel.has(`${si}-${wi}`) ? 0 : 3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  padding: '3px 10px', borderRadius: 100, fontSize: 11, fontFamily: FONT,
                  fontWeight: 600, background: 'rgba(255,255,255,0.92)', color: '#000',
                  letterSpacing: '-0.01em', display: 'inline-block',
                }}>
                {w}
              </motion.span>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Lock row */}
      <AnimatePresence>
        {lockVis && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.33,1,0.68,1] }}
            style={{
              background: 'rgba(37,99,235,0.08)', borderTop: '1px solid rgba(37,99,235,0.18)',
              padding: '10px 20px', marginLeft: -20, marginRight: -20,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>
              Benchmark
            </span>
            {BENCHMARK.map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.07, duration: 0.18 }}
                style={{
                  padding: '2px 9px', borderRadius: 100, fontSize: 10, fontFamily: FONT,
                  fontWeight: 600, background: 'rgba(255,255,255,0.92)', color: '#000',
                  letterSpacing: '-0.01em', display: 'inline-block',
                }}>
                {w}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22, duration: 0.18 }}
              style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.22)', marginLeft: 'auto', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Locked
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: editVis ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          marginTop: 'auto', paddingTop: 12,
          textAlign: 'center', fontSize: 11, fontFamily: FONT,
          fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)',
        }}>
        Three stakeholders. One benchmark. Every candidate measures against this.
      </motion.p>
    </motion.div>
  )
}

// ─── Chen Progress Bar (two-burst) ───────────────────────────────────────────
function ChenProgress({ go }: { go: boolean }) {
  const [phase, setPhase]   = useState(0)   // 0=idle 1=first-burst 2=pause 3=second-burst
  const { schedule }        = useScheduler()

  useEffect(() => {
    if (!go) return
    schedule(() => setPhase(1), 50)
    schedule(() => setPhase(2), 850)   // pause after 40%
    schedule(() => setPhase(3), 1250)  // second burst to 100%
  }, [go, schedule])

  const width      = phase === 0 ? '0%' : phase === 1 ? '40%' : phase === 2 ? '40%' : '100%'
  const transition = phase === 1 ? 'width 800ms ease-in-out' : phase === 3 ? 'width 800ms ease-in-out' : 'none'

  return (
    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', marginTop: 'auto' }}>
      <div style={{ height: '100%', background: BLUE, width, transition }} />
    </div>
  )
}

// ─── STAGE 2 — CANDIDATE INPUT ────────────────────────────────────────────────
function CandidateInputStage() {
  const { schedule } = useScheduler()
  const [panelVis, setPanelVis]   = useState([false, false, false])
  const [wordVis, setWordVis]     = useState<Record<string, boolean>>({})
  const [progGo, setProgGo]       = useState([false, false, false])
  const [editVis, setEditVis]     = useState(false)

  useEffect(() => {
    // Staggered panel entry
    CAND_DATA.forEach((c, ci) => {
      const panelDelay = ci * 150

      schedule(() => setPanelVis(p => { const n=[...p]; n[ci]=true; return n }), panelDelay)
      schedule(() => setProgGo(p => { const n=[...p]; n[ci]=true; return n }), panelDelay + 300)

      // Words with per-candidate timing
      const offsets = CAND_TIMING[c.id]
      let base = panelDelay + 400
      c.words.forEach((_, wi) => {
        base += offsets[wi] ?? 200
        schedule(() => setWordVis(prev => ({ ...prev, [`${ci}-${wi}`]: true })), base)
        base += 180 // minimum between words
      })
    })

    // Editorial: silence after last word (≈ last candidate + ~1600ms for words + 600ms silence)
    schedule(() => setEditVis(true), 4000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div variants={stageVariant} initial="hidden" animate="show" exit="exit"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Three panels */}
      <div style={{ display: 'flex', flex: 1 }}>
        {CAND_DATA.map((c, ci) => (
          <motion.div key={c.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: panelVis[ci] ? 1 : 0, x: panelVis[ci] ? 0 : -6 }}
            transition={{ duration: 0.28, ease: [0.33,1,0.68,1] }}
            style={{
              flex: 1, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 9,
              borderRight: ci < 2 ? `1px solid ${BORD}` : 'none',
            }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{c.id}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: FONT, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em' }}>{c.name}</span>
            </div>
            {/* Words */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {c.words.map((w, wi) => (
                <motion.span key={w}
                  initial={{ opacity: 0, scale: 0.88, y: 3 }}
                  animate={{ opacity: wordVis[`${ci}-${wi}`] ? 1 : 0, scale: wordVis[`${ci}-${wi}`] ? 1 : 0.88, y: wordVis[`${ci}-${wi}`] ? 0 : 3 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{
                    padding: '3px 9px', borderRadius: 100, fontSize: 10, fontFamily: FONT,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.55)', display: 'inline-block', width: 'fit-content',
                  }}>
                  {w}
                </motion.span>
              ))}
            </div>
            {/* Progress line */}
            {c.id === 'JC'
              ? <ChenProgress go={progGo[ci]} />
              : (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', marginTop: 'auto' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: progGo[ci] ? '100%' : 0 }}
                    transition={{ duration: c.progDur / 1000, ease: c.id === 'RO' ? 'linear' : 'easeInOut', delay: 0.05 }}
                    style={{ height: '100%', background: BLUE }}
                  />
                </div>
              )
            }
          </motion.div>
        ))}
      </div>

      {/* Editorial */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: editVis ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          textAlign: 'center', fontSize: 11, fontFamily: FONT,
          fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)',
          padding: '10px 20px', borderTop: `1px solid ${BORD}`,
        }}>
        Same exercise. Different answers.
      </motion.p>
    </motion.div>
  )
}

// ─── STAGE 3 — ADAPTATION GAP ─────────────────────────────────────────────────
// Arc paths: SVG absolute over the full stage width.
// Left pills at x≈60, right pills at x≈280, y≈ 60/100/140 from content top.
// Quadratic bezier control point: midX=170, midY = pill_y - 22
const ARC_PATHS = [
  'M 60 60  Q 170 38  280 60',
  'M 60 100 Q 170 78  280 100',
  'M 60 140 Q 170 118 280 140',
]
const ARC_DRAW_MS  = [350, 280, 420]
const ARC_DELAY_MS = [0,   250, 500]  // stagger start times (relative to arc phase)

function AdaptationGapStage() {
  const { schedule } = useScheduler()
  const [leftVis,   setLeftVis]   = useState(-1)
  const [rightVis,  setRightVis]  = useState(-1)
  const [arcIdx,    setArcIdx]    = useState(-1)   // how many arcs drawing
  const [gapCount,  setGapCount]  = useState(0)
  const [gapVis,    setGapVis]    = useState(false)
  const [editVis,   setEditVis]   = useState(false)

  useEffect(() => {
    // 500ms silence, then left pills stagger in
    schedule(() => setLeftVis(0), 620)
    schedule(() => setLeftVis(1), 740)
    schedule(() => setLeftVis(2), 860)
    // 800ms pause, right pills appear
    schedule(() => setRightVis(0), 1660)
    schedule(() => setRightVis(1), 1780)
    schedule(() => setRightVis(2), 1900)
    // Arcs draw at 2400ms
    schedule(() => setArcIdx(0), 2400)
    schedule(() => setArcIdx(1), 2650)
    schedule(() => setArcIdx(2), 2900)
    // Gap indicator at 3400ms
    schedule(() => {
      setGapVis(true)
      const t0 = Date.now()
      const countUp = () => {
        const elapsed = Date.now() - t0
        const t = Math.min(elapsed / 600, 1)
        setGapCount(Math.round(34 * (1 - Math.pow(1 - t, 3))))
        if (t < 1) setTimeout(countUp, 16)
      }
      countUp()
    }, 3400)
    // Editorial at 4200ms
    schedule(() => setEditVis(true), 4200)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const leftWords  = BENCHMARK
  const rightWords = ['Patient', 'Methodical', 'Collaborative']

  return (
    <motion.div variants={stageVariant} initial="hidden" animate="show" exit="exit"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 0 0', overflow: 'hidden', position: 'relative' }}>

      {/* Two-column layout with SVG overlay */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', paddingBottom: 8 }}>

        {/* Left column */}
        <div style={{ width: '42%', padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
            In this role
          </span>
          {leftWords.map((w, i) => (
            <motion.span key={w}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: leftVis >= i ? 1 : 0, x: leftVis >= i ? 0 : -8 }}
              transition={{ duration: 0.2, ease: [0.33,1,0.68,1] }}
              style={{
                padding: '3px 10px', borderRadius: 100, fontSize: 11, fontFamily: FONT,
                fontWeight: 600, background: 'rgba(255,255,255,0.9)', color: '#000',
                letterSpacing: '-0.01em', display: 'inline-block', width: 'fit-content',
              }}>
              {w}
            </motion.span>
          ))}
        </div>

        {/* Center: gap indicator */}
        <div style={{
          width: '16%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: gapVis ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 7, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Gap
            </span>
            <span style={{ fontSize: 22, fontFamily: COND, fontWeight: 700, color: AMBER, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {gapCount}
            </span>
            <span style={{ fontSize: 7, fontFamily: FONT, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              pts
            </span>
          </motion.div>
        </div>

        {/* Right column */}
        <div style={{ width: '42%', padding: '0 20px 0 0', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
            Naturally
          </span>
          {rightWords.map((w, i) => (
            <motion.span key={w}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: rightVis >= i ? 1 : 0, x: rightVis >= i ? 0 : 8 }}
              transition={{ duration: 0.2, ease: [0.33,1,0.68,1] }}
              style={{
                padding: '3px 10px', borderRadius: 100, fontSize: 11, fontFamily: FONT,
                fontWeight: 400, background: 'transparent',
                border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.65)',
                letterSpacing: '-0.01em', display: 'inline-block', width: 'fit-content',
              }}>
              {w}
            </motion.span>
          ))}
        </div>

        {/* SVG arc overlay */}
        <svg
          viewBox="0 0 340 180"
          style={{
            position: 'absolute', top: 30, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', overflow: 'visible',
          }}
        >
          {ARC_PATHS.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="rgba(37,99,235,0.4)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: arcIdx >= i ? 1 : 0,
                opacity: arcIdx >= i ? 1 : 0,
              }}
              transition={{
                pathLength: { duration: ARC_DRAW_MS[i] / 1000, ease: [0.33,1,0.68,1], delay: ARC_DELAY_MS[i] / 1000 },
                opacity:    { duration: 0.1 },
              }}
            />
          ))}
        </svg>
      </div>

      {/* Editorial */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: editVis ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          textAlign: 'center', fontSize: 11, fontFamily: FONT,
          fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.25)',
          padding: '10px 20px', borderTop: `1px solid ${BORD}`,
        }}>
        The gap is where the signal lives.
      </motion.p>
    </motion.div>
  )
}

// ─── Decision Speed bar with overshoot ────────────────────────────────────────
function DSBar({ go }: { go: boolean }) {
  const [width, setWidth]     = useState('0%')
  const [trans, setTrans]     = useState('none')
  const { schedule }          = useScheduler()

  useEffect(() => {
    if (!go) return
    schedule(() => { setTrans('width 350ms ease-out');   setWidth('52%') }, 50)
    schedule(() => { setTrans('width 200ms ease-in-out'); setWidth('45%') }, 420)
  }, [go, schedule])

  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', background: BLUE, width, transition: trans }} />
    </div>
  )
}

// ─── STAGE 4 — THE VERDICT ────────────────────────────────────────────────────
function VerdictStage() {
  const { schedule } = useScheduler()
  const [scoreVis,     setScoreVis]     = useState(false)
  const [ringProgress, setRingProgress] = useState(0)
  const [matchVis,     setMatchVis]     = useState(false)
  const [nameVis,      setNameVis]      = useState(false)
  const [chars,        setChars]        = useState(0)
  const [subtitleVis,  setSubtitleVis]  = useState(false)
  const [barsVis,      setBarsVis]      = useState(false)
  const [footnoteVis,  setFootnoteVis]  = useState(false)
  const [editVis,      setEditVis]      = useState(false)

  const CIRC = 2 * Math.PI * 34  // r=34, circumference ≈ 213.6

  useEffect(() => {
    // 400ms silence then score snaps in
    schedule(() => setScoreVis(true), 400)
    // Ring at 450ms
    schedule(() => {
      const t0 = Date.now()
      const dur = 1000
      const tick = () => {
        const t = Math.min((Date.now() - t0) / dur, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        setRingProgress(ease * 0.78)
        if (t < 1) setTimeout(tick, 16)
      }
      tick()
    }, 450)
    // "Strong match"
    schedule(() => setMatchVis(true), 700)
    // "M. Torres · VP Operations"
    schedule(() => setNameVis(true), 900)
    // Typewriter: "THE OPERATOR" = 12 chars × 40ms
    ARCHETYPE.split('').forEach((_, i) => {
      schedule(() => setChars(i + 1), 1100 + i * 40)
    })
    // Subtitle
    schedule(() => setSubtitleVis(true), 1700)
    // Bars
    schedule(() => setBarsVis(true), 2000)
    // Footnote
    schedule(() => setFootnoteVis(true), 4500)
    // Editorial
    schedule(() => setEditVis(true), 5000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dashOffset = CIRC * (1 - ringProgress)

  return (
    <motion.div variants={stageVariant} initial="hidden" animate="show" exit="exit"
      style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* Left: score zone */}
      <div style={{
        width: '40%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        borderRight: `1px solid ${BORD}`, padding: '20px 12px', gap: 5, flexShrink: 0,
        position: 'relative',
      }}>
        {/* Ring + number */}
        <div style={{ position: 'relative', width: 76, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="76" height="76" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Track */}
            <circle cx="38" cy="38" r="34" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
            {/* Progress */}
            <circle
              cx="38" cy="38" r="34" fill="none"
              stroke={BLUE} strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 38 38)"
              style={{ transition: 'stroke-dashoffset 16ms linear' }}
            />
          </svg>
          {scoreVis && (
            <span style={{
              fontSize: 'clamp(28px, 4vw, 36px)', fontFamily: COND, fontWeight: 900,
              color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, position: 'relative', zIndex: 1,
            }}>
              78
            </span>
          )}
        </div>

        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: matchVis ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 11, fontFamily: FONT, fontWeight: 500, color: GREEN }}>
          Strong match
        </motion.span>

        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: nameVis ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 10, fontFamily: FONT, color: 'rgba(255,255,255,0.38)', textAlign: 'center', letterSpacing: '-0.01em', lineHeight: 1.4 }}>
          M. Torres<br />VP Operations
        </motion.span>
      </div>

      {/* Right: archetype + bars */}
      <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', minWidth: 0 }}>
        {/* Archetype name — typewriter */}
        <div>
          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 22px)', fontFamily: COND, fontWeight: 700,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em', lineHeight: 1.05,
            minHeight: '1.4em',
          }}>
            {ARCHETYPE.slice(0, chars)}
            {chars < ARCHETYPE.length && chars > 0 && (
              <span style={{ opacity: 0.4 }}>|</span>
            )}
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: subtitleVis ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 11, fontFamily: FONT, color: MUTED, letterSpacing: '-0.01em', marginTop: -2 }}>
          Deliberate · Output-focused
        </motion.p>

        {/* Dimension bars */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: barsVis ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {DIMS.map((d, i) => (
            <div key={d.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 8, fontFamily: FONT, color: 'rgba(255,255,255,0.28)' }}>{d.val}</span>
              </div>
              {d.label === 'Decision Speed'
                ? <DSBar go={barsVis} />
                : (
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: barsVis ? `${d.val}%` : 0 }}
                      transition={{ duration: 0.45, ease: [0.33,1,0.68,1], delay: i * 0.12 }}
                      style={{ height: '100%', background: BLUE, borderRadius: 2 }}
                    />
                  </div>
                )
              }
            </div>
          ))}
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: footnoteVis ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.18)', marginTop: 'auto', letterSpacing: '0.02em' }}>
          From 20 reference profiles · 94 signals
        </motion.p>

        {/* Editorial close */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: editVis ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 11, fontFamily: FONT, fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.22)', textAlign: 'center' }}>
          One score. One call.
        </motion.p>
      </div>
    </motion.div>
  )
}

// ─── CardHeader ───────────────────────────────────────────────────────────────
function CardHeader({ stage, onJump }: { stage: Stage; onJump: (s: Stage) => void }) {
  return (
    <div style={{
      height: 44, padding: '0 18px', borderBottom: `1px solid ${BORD}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Veltro Signal Engine
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {/* Dots + connectors */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {([1,2,3,4] as Stage[]).map((s, i) => (
            <React.Fragment key={s}>
              <div
                onClick={() => onJump(s)}
                style={{
                  width: 7, height: 7, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  background: s <= stage ? BLUE : 'rgba(255,255,255,0.1)',
                  border: s <= stage ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  transition: 'background 400ms ease',
                }}
              />
              {i < 3 && (
                <div style={{
                  width: 16, height: 1, flexShrink: 0,
                  background: s < stage ? BLUE : 'rgba(255,255,255,0.1)',
                  transition: 'background 400ms ease',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Stage label */}
        <motion.span
          key={stage}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{ fontSize: 8, fontFamily: FONT, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
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

  const clearTs = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = [] }, [])

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

  const pause  = useCallback(() => clearTs(), [clearTs])
  const resume = useCallback(() => startFrom(stageRef.current), [startFrom])

  return (
    <div
      style={{
        background: CARD,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        height: '100%', minHeight: 480,
      }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <CardHeader stage={stage} onJump={startFrom} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {stage === 1 && <RoleBriefStage     key="s1" />}
          {stage === 2 && <CandidateInputStage key="s2" />}
          {stage === 3 && <AdaptationGapStage  key="s3" />}
          {stage === 4 && <VerdictStage         key="s4" />}
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

  // Load Barlow Condensed for Stage 4 score and archetype
  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&display=swap'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

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
        <div style={{ height: 480 }}>
          <SystemCard active={active} />
        </div>
      </div>
    </section>
  )
}
