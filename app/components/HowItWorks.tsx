'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// ─── Brand tokens ─────────────────────────────────────────────────────
const BG    = '#000'
const CARD  = '#0a0a0a'
const TEXT  = 'rgba(255,255,255,0.88)'
const MUTED = 'rgba(255,255,255,0.4)'
const DIM   = 'rgba(255,255,255,0.16)'
const BORD  = 'rgba(255,255,255,0.08)'
const BLUE  = '#2563EB'
const GREEN = '#22C55E'
const AMBER = '#EAB308'
const FONT  = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'

// ─── Stage timing (ms) ───────────────────────────────────────────────
// Adjust these to change the pacing of the animation loop
const STAGE_MS: Record<number, number> = {
  1: 2800, // Role Alignment
  2: 3000, // Candidate Input
  3: 3200, // Signal Extraction
  4: 3200, // Scoring & Ranking
  5: 3200, // Adaptation Gap
  6: 4000, // Archetype Profile
}
const HOLD_MS = 1500 // pause at end of loop before restarting

// ─── Content ─────────────────────────────────────────────────────────
const STAGE_LABELS = [
  'Role Alignment',
  'Candidate Input',
  'Signal Extraction',
  'Scoring & Ranking',
  'Adaptation Gap',
  'Archetype Profile',
]
const STAGE_TIPS = [
  'Hiring team aligns on the role benchmark',
  'Candidates complete the same structured exercise',
  'System normalizes 94 behavioral signals',
  'Candidates scored and ranked against benchmark',
  'System identifies where candidate adapts to role demands',
  'Closest archetype match with dimensional profile',
]

const STAKEHOLDERS = [
  { name: 'Hiring Manager',  picks: ['Decisive', 'Bold'] },
  { name: 'Team Lead',       picks: ['Competitive', 'Direct'] },
  { name: 'Search Partner',  picks: ['Decisive', 'Competitive'] },
]

const SEL_ROLE    = ['Decisive', 'Bold', 'Competitive']
const SEL_NATURAL = ['Patient', 'Methodical', 'Collaborative']

const CANDIDATES = [
  { id: 'MT', name: 'M. Torres',  score: 78, accent: GREEN },
  { id: 'JC', name: 'J. Chen',    score: 64, accent: AMBER },
  { id: 'RO', name: 'R. Okafor',  score: 51, accent: 'rgba(255,255,255,0.28)' },
] as const

const CANDIDATE_WORDS: Record<string, string[]> = {
  MT: ['Patient', 'Methodical'],
  JC: ['Analytical', 'Thorough'],
  RO: ['Careful', 'Systematic'],
}

const DIM_LABELS = ['Execution', 'Decision Speed', 'Ownership', 'Collaboration', 'Adaptability']

const DIMS = [
  { label: 'Execution',      val: 62 },
  { label: 'Decision Speed', val: 45 },
  { label: 'Ownership',      val: 71 },
  { label: 'Collaboration',  val: 38 },
  { label: 'Adaptability',   val: 55 },
]

type Stage = 1 | 2 | 3 | 4 | 5 | 6

// ─── Easing ──────────────────────────────────────────────────────────
const OUT3: [number, number, number, number] = [0.33, 1, 0.68, 1]

// ─── Hooks ───────────────────────────────────────────────────────────
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

// ─── Shared motion variant ───────────────────────────────────────────
const fadeOnly = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.28 } },
  exit:   { opacity: 0, transition: { duration: 0.18 } },
}

// ─── ProgressRail ─────────────────────────────────────────────────────
function ProgressRail({ stage, onJump }: { stage: Stage; onJump: (s: Stage) => void }) {
  return (
    <div style={{ padding: '14px 18px 12px', borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM }}>
          Veltro · Signal Engine
        </span>
        <span style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.18)' }}>
          {stage} / 6
        </span>
      </div>
      {/* 6-segment clickable rail */}
      <div style={{ display: 'flex', gap: 3 }}>
        {([1, 2, 3, 4, 5, 6] as Stage[]).map(s => (
          <button
            key={s}
            aria-label={STAGE_LABELS[s - 1]}
            title={STAGE_TIPS[s - 1]}
            onClick={() => onJump(s)}
            style={{
              flex: 1, height: 2, borderRadius: 1, border: 'none',
              cursor: 'pointer', padding: 0,
              background: s <= stage ? BLUE : 'rgba(255,255,255,0.07)',
              transition: 'background 350ms ease',
            }}
          />
        ))}
      </div>
      <motion.p
        key={stage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22 }}
        style={{ fontSize: 9, fontFamily: FONT, fontWeight: 500, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 8 }}
      >
        {STAGE_LABELS[stage - 1]}
      </motion.p>
    </div>
  )
}

// ─── BenchmarkStrip ──────────────────────────────────────────────────
// Persists across all 6 stages — prominent in stage 1, compact thereafter
function BenchmarkStrip({ stage }: { stage: Stage }) {
  const compact = stage > 1
  return (
    <div style={{
      padding: compact ? '7px 18px' : '11px 18px',
      borderBottom: `1px solid ${BORD}`,
      display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      transition: 'padding 300ms ease',
    }}>
      <span style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>
        Role
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
        {SEL_ROLE.map(chip => (
          <span key={chip} style={{
            padding: compact ? '2px 8px' : '4px 10px',
            borderRadius: 100,
            fontSize: compact ? 10 : 11,
            fontFamily: FONT,
            fontWeight: 600,
            background: 'rgba(255,255,255,0.92)',
            color: '#000',
            letterSpacing: '-0.01em',
            display: 'inline-block',
            transition: 'padding 300ms ease, font-size 300ms ease',
          }}>
            {chip}
          </span>
        ))}
      </div>
      {compact && (
        <span style={{ fontSize: 8, fontFamily: FONT, color: 'rgba(255,255,255,0.16)', marginLeft: 'auto', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          locked
        </span>
      )}
    </div>
  )
}

// ─── Pill ─────────────────────────────────────────────────────────────
function Pill({ label, selected = false, small = false }: {
  label: string; selected?: boolean; small?: boolean
}) {
  return (
    <span style={{
      padding: small ? '2px 8px' : '4px 11px',
      borderRadius: 100,
      fontSize: small ? 10 : 11,
      fontFamily: FONT,
      fontWeight: selected ? 600 : 400,
      background: selected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.04)',
      color: selected ? '#000' : 'rgba(255,255,255,0.4)',
      border: `1px solid ${selected ? 'transparent' : 'rgba(255,255,255,0.09)'}`,
      letterSpacing: '-0.01em',
      display: 'inline-block',
    }}>
      {label}
    </span>
  )
}

// ─── Stage 1: Role Alignment ──────────────────────────────────────────
function RoleAlignmentStage() {
  const [visIdx, setVisIdx] = useState(-1)
  const [locked, setLocked] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.push(setTimeout(() => setVisIdx(0), 100))
    ts.current.push(setTimeout(() => setVisIdx(1), 360))
    ts.current.push(setTimeout(() => setVisIdx(2), 620))
    ts.current.push(setTimeout(() => setLocked(true), 1050))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div variants={fadeOnly} initial="hidden" animate="show" exit="exit"
      style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {STAKEHOLDERS.map((s, i) => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, x: -6 }}
          animate={{
            opacity: visIdx >= i ? (locked ? 0.25 : 1) : 0,
            x: visIdx >= i ? 0 : -6,
          }}
          transition={{ duration: 0.26, ease: OUT3 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <span style={{ fontSize: 9, fontFamily: FONT, color: DIM, letterSpacing: '0.06em', width: 106, flexShrink: 0 }}>
            {s.name}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {s.picks.map(c => <Pill key={c} label={c} selected small />)}
          </div>
        </motion.div>
      ))}

      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: OUT3 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 6, paddingTop: 10,
            borderTop: `1px solid ${BORD}`,
          }}
        >
          <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Consolidated
          </span>
          <span style={{ fontSize: 9, fontFamily: FONT, color: DIM }}>→</span>
          {SEL_ROLE.map(c => <Pill key={c} label={c} selected small />)}
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: locked ? 1 : 0 }}
        transition={{ duration: 0.28, delay: 0.22 }}
        style={{ fontSize: 9, fontFamily: FONT, color: DIM, letterSpacing: '0.04em', marginTop: 2 }}
      >
        3 stakeholders · alignment complete
      </motion.p>
    </motion.div>
  )
}

// ─── CandidateCard ────────────────────────────────────────────────────
function CandidateCard({
  cand, stage, rank, isTop,
}: {
  cand: typeof CANDIDATES[number]
  stage: Stage
  rank: number
  isTop: boolean
}) {
  const [scoreVal, setScoreVal] = useState(0)
  const [scoreVis, setScoreVis] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.forEach(clearTimeout)
    ts.current = []
    setScoreVis(false)
    setScoreVal(0)
    if (stage !== 4) return

    ts.current.push(setTimeout(() => {
      setScoreVis(true)
      const t0 = Date.now()
      const dur = 800
      const tick = () => {
        const t = Math.min((Date.now() - t0) / dur, 1)
        setScoreVal(Math.round(cand.score * (1 - Math.pow(1 - t, 3))))
        if (t < 1) setTimeout(tick, 16)
      }
      tick()
    }, rank * 130 + 200))

    return () => ts.current.forEach(clearTimeout)
  }, [stage, cand.score, rank])

  const showWords = stage === 2 || stage === 3
  const showScan  = stage === 3
  const emphasized = isTop && stage === 4

  return (
    <motion.div
      layout
      layoutId={`cand-${cand.id}`}
      transition={{ duration: 0.44, ease: [0.65, 0, 0.35, 1] }}
      style={{
        padding: '10px 11px',
        borderRadius: 10,
        background: emphasized ? '#0c1220' : '#0d0d0d',
        border: `1px solid ${emphasized ? 'rgba(37,99,235,0.28)' : BORD}`,
        display: 'flex', flexDirection: 'column', gap: 6,
        opacity: stage === 5 && !isTop ? 0.15 : 1,
        flex: 1, minWidth: 0,
        transition: 'opacity 500ms ease, background 400ms ease, border-color 400ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 7, fontFamily: FONT, fontWeight: 700, color: TEXT }}>{cand.id}</span>
          </div>
          <span style={{ fontSize: 10, fontFamily: FONT, color: MUTED, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            {cand.name}
          </span>
        </div>
        {stage >= 4 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: scoreVis ? 1 : 0, scale: scoreVis ? 1 : 0.8 }}
            transition={{ duration: 0.22, ease: OUT3 }}
            style={{ fontSize: 15, fontFamily: FONT, fontWeight: 700, color: cand.accent, letterSpacing: '-0.03em' }}
          >
            {scoreVal}
          </motion.span>
        )}
      </div>

      {showWords && (
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {(CANDIDATE_WORDS[cand.id] ?? []).map(w => (
            <Pill key={w} label={w} small />
          ))}
        </div>
      )}

      {showScan && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.55, ease: OUT3, delay: rank * 0.12 }}
          style={{ height: 1.5, background: 'rgba(37,99,235,0.5)', borderRadius: 1, transformOrigin: 'left' }}
        />
      )}
    </motion.div>
  )
}

// ─── Stages 2 / 3 / 4: Candidate Flow ────────────────────────────────
// Key is shared ("s234") so candidate cards persist and reorder
function CandidateFlowStage({ stage }: { stage: Stage }) {
  const [dimVis, setDimVis] = useState(-1)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.forEach(clearTimeout)
    ts.current = []
    setDimVis(-1)
    if (stage !== 3) return
    DIM_LABELS.forEach((_, i) => {
      ts.current.push(setTimeout(() => setDimVis(i), i * 210 + 460))
    })
    return () => ts.current.forEach(clearTimeout)
  }, [stage])

  const sorted = stage === 4
    ? [...CANDIDATES].sort((a, b) => b.score - a.score)
    : CANDIDATES

  return (
    <motion.div variants={fadeOnly} initial="hidden" animate="show" exit="exit"
      style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <motion.div layout style={{ display: 'flex', gap: 7 }}>
        {sorted.map((c, i) => (
          <CandidateCard
            key={c.id}
            cand={c}
            stage={stage}
            rank={i}
            isTop={c.id === 'MT'}
          />
        ))}
      </motion.div>

      {stage === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }}>
          <p style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7 }}>
            Extracting — 5 dimensions
          </p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {DIM_LABELS.map((d, i) => (
              <motion.span
                key={d}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: dimVis >= i ? 1 : 0, y: dimVis >= i ? 0 : 4 }}
                transition={{ duration: 0.2, ease: OUT3 }}
                style={{
                  fontSize: 9, fontFamily: FONT, color: TEXT,
                  background: 'rgba(37,99,235,0.09)', border: '1px solid rgba(37,99,235,0.2)',
                  borderRadius: 4, padding: '3px 7px', letterSpacing: '0.03em',
                }}
              >
                {d}
              </motion.span>
            ))}
          </div>
          {dimVis >= 4 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, delay: 0.15 }}
              style={{ fontSize: 9, fontFamily: FONT, color: DIM, marginTop: 7, letterSpacing: '0.04em' }}
            >
              94 signals normalized across 5 dimensions
            </motion.p>
          )}
        </motion.div>
      )}

      {stage === 4 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.65 }}
          style={{ fontSize: 9, fontFamily: FONT, color: DIM, letterSpacing: '0.04em' }}
        >
          Ranked by behavioral fit · role benchmark
        </motion.p>
      )}
    </motion.div>
  )
}

// ─── Stage 5: Adaptation Gap ──────────────────────────────────────────
function AdaptationGapStage() {
  const [connVis, setConnVis] = useState(0)
  const [calloutVis, setCalloutVis] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.push(setTimeout(() => setConnVis(1), 360))
    ts.current.push(setTimeout(() => setConnVis(2), 620))
    ts.current.push(setTimeout(() => setConnVis(3), 880))
    ts.current.push(setTimeout(() => setCalloutVis(true), 1260))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div variants={fadeOnly} initial="hidden" animate="show" exit="exit"
      style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 42px 1fr' }}>
        {/* Left: role demands */}
        <div>
          <p style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 9 }}>
            Role demands
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
            {SEL_ROLE.map(w => <Pill key={w} label={w} selected />)}
          </div>
        </div>

        {/* Connector lines */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 21, paddingTop: 26 }}>
          {SEL_ROLE.map((_, i) => (
            <div key={i} style={{
              height: 1.5, width: 42, borderRadius: 1,
              background: 'rgba(37,99,235,0.55)',
              opacity: connVis > i ? 1 : 0,
              transform: `scaleX(${connVis > i ? 1 : 0})`,
              transformOrigin: 'left',
              transition: `opacity 260ms ease ${i * 160}ms, transform 260ms ease ${i * 160}ms`,
            }} />
          ))}
        </div>

        {/* Right: natural style */}
        <div>
          <p style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 9 }}>
            Natural style
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
            {SEL_NATURAL.map(w => (
              <span key={w} style={{
                padding: '4px 11px', borderRadius: 100, fontSize: 11, fontFamily: FONT,
                border: `1px solid rgba(255,255,255,0.12)`, color: 'rgba(255,255,255,0.42)',
                display: 'inline-block', letterSpacing: '-0.01em',
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gap callout — the payoff of this stage */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: calloutVis ? 1 : 0, y: calloutVis ? 0 : 5 }}
        transition={{ duration: 0.32, ease: OUT3 }}
        style={{
          padding: '10px 13px', borderRadius: 8,
          background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.17)',
        }}
      >
        <p style={{ fontSize: 11, fontFamily: FONT, color: 'rgba(255,255,255,0.54)', lineHeight: 1.55, letterSpacing: '-0.01em' }}>
          Role demands urgency and assertion.<br />
          This candidate defaults to deliberation.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Stage 6: Archetype Profile ───────────────────────────────────────
function ArchetypeStage() {
  const [titleIn, setTitleIn] = useState(false)
  const [barsGo, setBarsGo] = useState(false)
  const ts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    ts.current.push(setTimeout(() => setTitleIn(true), 140))
    ts.current.push(setTimeout(() => setBarsGo(true), 560))
    return () => ts.current.forEach(clearTimeout)
  }, [])

  return (
    <motion.div variants={fadeOnly} initial="hidden" animate="show" exit="exit"
      style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <motion.div
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: titleIn ? 1 : 0, y: titleIn ? 0 : 7 }}
        transition={{ duration: 0.35, ease: OUT3 }}
      >
        <p style={{ fontSize: 8, fontFamily: FONT, fontWeight: 600, color: DIM, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
          Closest archetype
        </p>
        <p style={{ fontSize: 26, fontFamily: FONT, fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 4 }}>
          The Operator
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontFamily: FONT, color: MUTED, letterSpacing: '-0.01em' }}>
            Deliberate · Output-focused
          </span>
          <span style={{
            fontSize: 8, fontFamily: FONT, fontWeight: 600,
            background: 'rgba(34,197,94,0.1)', color: '#22C55E',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4,
            padding: '2px 7px', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Top match
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: titleIn ? 1 : 0 }}
        transition={{ duration: 0.28, delay: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 7 }}
      >
        {DIMS.map((d, i) => (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 9, fontFamily: FONT, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {d.label}
              </span>
              <motion.span
                animate={{ opacity: barsGo ? 1 : 0 }}
                transition={{ delay: i * 0.08 + 0.38, duration: 0.2 }}
                style={{ fontSize: 9, fontFamily: FONT, color: 'rgba(255,255,255,0.28)' }}
              >
                {d.val}
              </motion.span>
            </div>
            <div style={{ height: 2.5, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: barsGo ? `${d.val}%` : 0 }}
                transition={{ duration: 0.48, ease: OUT3, delay: i * 0.08 }}
                style={{ height: '100%', background: BLUE, borderRadius: 2 }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── SystemCard ───────────────────────────────────────────────────────
// Orchestrates the 6-stage loop. Pauses on hover.
function SystemCard({ active }: { active: boolean }) {
  const [stage, setStage] = useState<Stage>(1)
  const stageRef = useRef<Stage>(1)
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([])
  const started  = useRef(false)

  const clearTs = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // Build the auto-advance chain starting from stage `s`
  const startFrom = useCallback((s: Stage) => {
    clearTs()
    stageRef.current = s
    setStage(s)

    const advance = (cur: Stage) => {
      const dur = STAGE_MS[cur] + (cur === 6 ? HOLD_MS : 0)
      timers.current.push(setTimeout(() => {
        const next = cur === 6 ? 1 : ((cur + 1) as Stage)
        stageRef.current = next
        setStage(next)
        advance(next)
      }, dur))
    }
    advance(s)
  }, [clearTs])

  // Start when section enters viewport
  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    startFrom(1)
    return clearTs
  }, [active, startFrom, clearTs])

  // Hover to pause; leave to resume from current stage
  const handleMouseEnter = useCallback(() => clearTs(), [clearTs])
  const handleMouseLeave = useCallback(() => startFrom(stageRef.current), [startFrom])

  // Stage key: stages 2-4 share the same mounted instance so candidate cards persist
  const stageKey = stage >= 2 && stage <= 4 ? 's234' : `s${stage}`

  return (
    <div
      style={{
        background: CARD, border: `1px solid ${BORD}`, borderRadius: 16,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '100%', minHeight: 480,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ProgressRail stage={stage} onJump={startFrom} />
      <BenchmarkStrip stage={stage} />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <RoleAlignmentStage key="s1" />
          )}
          {stage >= 2 && stage <= 4 && (
            <CandidateFlowStage key="s234" stage={stage} />
          )}
          {stage === 5 && (
            <AdaptationGapStage key="s5" />
          )}
          {stage === 6 && (
            <ArchetypeStage key="s6" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Metric ───────────────────────────────────────────────────────────
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

// ─── HowItWorksSection ────────────────────────────────────────────────
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
        {/* ── Left column ────────────────────────────────────────── */}
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
            fontSize: 15, fontFamily: FONT, fontWeight: 300, color: MUTED,
            lineHeight: 1.8, marginBottom: 40, maxWidth: 380,
          }}>
            Hiring teams define what success looks like in the role. Candidates
            complete the same structured word-picking exercise. Veltro turns those
            responses into standardized behavioral signals, scores fit against the
            role, and surfaces the clearest match.
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

        {/* ── Right column: system card ───────────────────────── */}
        <div style={{ height: 480 }}>
          <SystemCard active={active} />
        </div>
      </div>
    </section>
  )
}
