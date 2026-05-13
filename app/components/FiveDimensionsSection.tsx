'use client'
import { useRef, useEffect, useState } from 'react'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const FONT    = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
const TEXT    = 'rgba(255,255,255,0.88)'
const MUTED   = 'rgba(255,255,255,0.4)'
const DIM_CLR = 'rgba(255,255,255,0.18)'
const BORD    = 'rgba(255,255,255,0.07)'

// ─── Pentagon constants ────────────────────────────────────────────────────────
const CX = 80, CY = 80, MAX_R = 68

// Dimension order: Execution(0), Ownership(1), Adaptability(2), Collaboration(3), Decision Speed(4)
const DIM_NAMES = ['Execution', 'Ownership', 'Adaptability', 'Collaboration', 'Decision Speed']

// Target shapes per dimension (values 0–100, axis lengths as % of max radius)
const TARGET_SHAPES: number[][] = [
  [88, 72, 48, 42, 82], // Execution hover
  [70, 88, 55, 58, 60], // Ownership hover
  [55, 58, 88, 72, 50], // Adaptability hover
  [48, 55, 72, 88, 45], // Collaboration hover
  [75, 62, 58, 45, 88], // Decision Speed hover
]

const DIM_DESCS = [
  'How you move when things break.',
  'Whether you take responsibility — or wait for it.',
  'How you operate when the path disappears.',
  'How you work through others — or around them.',
  'How quickly you commit when stakes are real.',
]

const DIM_DETAILS = [
  "Moves before consensus forms. Doesn't wait for the right moment — creates one.",
  "Raises their hand before they're asked. Doesn't need authority to feel accountable.",
  "Stays effective when structure breaks. Recalibrates without losing execution.",
  "Pulls people in when they need to move together. Operates alone when speed is the priority.",
  "Acts on incomplete information. Decides before certainty arrives.",
]

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function polyPts(
  vals: number[], cx: number, cy: number, maxR: number,
  jitter: { x: number; y: number }[]
): string {
  return vals.map((v, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI / 5) * i
    const r = (v / 100) * maxR
    return `${cx + r * Math.cos(a) + jitter[i].x},${cy + r * Math.sin(a) + jitter[i].y}`
  }).join(' ')
}

function ringPts(pct: number, cx: number, cy: number, maxR: number): string {
  const r = (pct / 100) * maxR
  return Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI / 5) * i
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
}

const ZERO_JITTER = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }))

// ─── Icon ─────────────────────────────────────────────────────────────────────
function DimIcon({ dim, hovered }: { dim: string; hovered: boolean }) {
  const paths: Record<string, React.ReactNode> = {
    Execution:        <path d="M5 12h14M14 7l5 5-5 5" />,
    Ownership:        <><path d="M6 4v16" /><path d="M6 4l11 4.5L6 13" /></>,
    Adaptability:     <><path d="M19 9A7 7 0 0 0 5.5 7" /><path d="M5 15a7 7 0 0 0 13.5-2" /><path d="M19 9l1.5-2.5M19 9l-2.5.5" /><path d="M5 15l-1.5 2.5M5 15l2.5-.5" /></>,
    Collaboration:    <><circle cx="9" cy="8" r="3" /><circle cx="15" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" /></>,
    'Decision Speed': <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  }
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={hovered ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.22)'}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'stroke 200ms', flexShrink: 0, display: 'block' }}
    >
      {paths[dim]}
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FiveDimensionsSection({ inView }: { inView: boolean }) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)
  const [breatheActive, setBreatheActive] = useState(false)

  const polyRef      = useRef<SVGPolygonElement>(null)
  const ghostRef     = useRef<SVGPolygonElement>(null)
  const pulseWrapRef = useRef<HTMLDivElement>(null)
  const iconWrapRefs = useRef<(HTMLDivElement | null)[]>(Array(5).fill(null))

  // All animation state lives in a ref to avoid re-renders from rAF
  const st = useRef({
    cur:  [65, 65, 65, 65, 65] as number[],
    tgt:  [65, 65, 65, 65, 65] as number[],
    bias: [65, 65, 65, 65, 65] as number[],
    hovIdx: -1,
    jitter: Array.from({ length: 5 }, () => ({ x: 0, y: 0 })) as { x: number; y: number }[],
    jp: Array.from({ length: 5 }, () => ({
      px: 3000 + Math.random() * 4000,
      py: 3000 + Math.random() * 4000,
      fx: Math.random() * Math.PI * 2,
      fy: Math.random() * Math.PI * 2,
    })),
    raf:        0,
    ghostOp:    0,
    firstFired: false,
    biasDecayT: 0,
    entryPhase: 0, // 0=waiting, 1=drawing in, 2=done
    entryT0:    0,
    jitterOn:   false,
    inView:     false,
  })

  // Trigger entry sequence on inView
  useEffect(() => {
    if (!inView) return
    st.current.inView = true
    // Pentagon draw-in starts 400ms after section enters
    const t1 = setTimeout(() => { st.current.entryPhase = 1 }, 400)
    // Breathing + jitter start after draw-in completes (400 + 700 = 1100ms)
    const t2 = setTimeout(() => {
      st.current.jitterOn = true
      setBreatheActive(true)
    }, 1100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [inView])

  // rAF loop — runs for lifetime of component
  useEffect(() => {
    const s = st.current

    const tick = (now: number) => {
      // ── Entry draw-in ──────────────────────────────────────────────────
      if (s.entryPhase === 1) {
        if (s.entryT0 === 0) s.entryT0 = now
        const t      = Math.min((now - s.entryT0) / 700, 1)
        const eased  = 1 - Math.pow(1 - t, 3)
        const offset = 300 * (1 - eased)
        const el     = polyRef.current
        if (el) {
          el.style.opacity          = '1'
          el.style.strokeDasharray  = '300'
          el.style.strokeDashoffset = `${offset}`
        }
        if (t >= 1) {
          s.entryPhase = 2
          if (el) { el.style.strokeDasharray = ''; el.style.strokeDashoffset = '' }
        }
      }

      // ── Vertex jitter ──────────────────────────────────────────────────
      if (s.jitterOn) {
        for (let i = 0; i < 5; i++) {
          s.jitter[i] = {
            x: Math.sin(now / s.jp[i].px + s.jp[i].fx) * 1.5,
            y: Math.sin(now / s.jp[i].py + s.jp[i].fy) * 1.5,
          }
        }
      }

      // ── Bias decay when idle ───────────────────────────────────────────
      if (s.hovIdx === -1) {
        if (s.biasDecayT === 0) {
          s.biasDecayT = now
        } else {
          const sec = (now - s.biasDecayT) / 1000
          if (sec >= 0.016) {
            // bias deviation from 65 decays by factor 0.995 per second
            const decay = Math.pow(0.995, sec * 60)
            for (let i = 0; i < 5; i++) {
              s.bias[i] = 65 + (s.bias[i] - 65) * decay
            }
            s.biasDecayT = now
          }
        }
      } else {
        s.biasDecayT = 0
      }

      // ── Interpolate current → target ───────────────────────────────────
      // 20% per frame ≈ 350ms to reach target; slightly slower on leave ≈ 400ms
      const speed = s.hovIdx !== -1 ? 0.20 : 0.15
      for (let i = 0; i < 5; i++) {
        s.cur[i] += (s.tgt[i] - s.cur[i]) * speed
      }

      // ── Update candidate polygon ───────────────────────────────────────
      if (s.entryPhase >= 1 && polyRef.current) {
        polyRef.current.setAttribute(
          'points',
          polyPts(s.cur, CX, CY, MAX_R, s.jitterOn ? s.jitter : ZERO_JITTER)
        )
      }

      // ── Ghost polygon opacity ──────────────────────────────────────────
      const ghostTarget = s.hovIdx !== -1 ? 1 : 0
      s.ghostOp += (ghostTarget - s.ghostOp) * 0.1
      if (ghostRef.current) {
        ghostRef.current.style.opacity = `${s.ghostOp}`
      }

      s.raf = requestAnimationFrame(tick)
    }

    s.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(s.raf)
  }, [])

  // ── Hover handlers ─────────────────────────────────────────────────────────
  const handleEnter = (i: number) => {
    const s   = st.current
    s.hovIdx  = i
    s.tgt     = [...TARGET_SHAPES[i]]

    // Update bias state: hovered axis moves 15% toward target, others move 3% toward 65
    for (let j = 0; j < 5; j++) {
      s.bias[j] += j === i
        ? (TARGET_SHAPES[i][j] - s.bias[j]) * 0.15
        : (65 - s.bias[j]) * 0.03
    }

    // First-hover surprise — fires once per page load
    if (!s.firstFired) {
      s.firstFired = true

      // Quick scale pulse on the SVG wrapper
      const pw = pulseWrapRef.current
      if (pw) {
        pw.style.transition = 'transform 120ms ease-out'
        pw.style.transform  = 'scale(1.05)'
        setTimeout(() => {
          pw.style.transition = 'transform 200ms ease-out'
          pw.style.transform  = 'scale(1)'
        }, 120)
      }

      // Icon brightness flare
      const iw = iconWrapRefs.current[i]
      if (iw) {
        iw.style.opacity = '0.9'
        setTimeout(() => { iw.style.opacity = '' }, 200)
      }
    }

    setHoveredCol(i)
  }

  const handleLeave = () => {
    const s  = st.current
    s.hovIdx = -1
    s.tgt    = [...s.bias] // return to biased baseline, not perfect 65
    setHoveredCol(null)
  }

  // ── Fade-in helper (local, uses translateY(10px) per spec) ────────────────
  const fi = (delay = 0): React.CSSProperties => ({
    opacity:    inView ? 1 : 0,
    transform:  inView ? 'none' : 'translateY(10px)',
    transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
  })

  // Precompute static ring points
  const ring33 = ringPts(33, CX, CY, MAX_R)
  const ring66 = ringPts(66, CX, CY, MAX_R)
  const ghost0 = ringPts(65, CX, CY, MAX_R)
  const poly0  = polyPts([65, 65, 65, 65, 65], CX, CY, MAX_R, ZERO_JITTER)

  return (
    <div style={{ width: '100%', maxWidth: 'min(1120px, calc(100vw - clamp(40px, 8vw, 160px)))' }}>
      <style>{`
        @keyframes fd-breathe {
          0%, 100% { transform: scale(0.97); }
          50%       { transform: scale(1); }
        }
        .fd-breathing { animation: fd-breathe 4s ease-in-out infinite; }
      `}</style>

      {/* ── Headline ──────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{
          ...fi(0),
          fontSize: 11, fontWeight: 600, color: DIM_CLR, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 20, display: 'block', fontFamily: FONT,
        }}>
          What we measure
        </p>
        <h2 style={{
          ...fi(0),
          fontSize: 'clamp(36px,5vw,64px)',
          fontWeight: 700, color: TEXT, letterSpacing: '-0.03em',
          lineHeight: 1.05, marginBottom: 16, fontFamily: FONT,
        }}>
          Five dimensions.<br />Infinite signal.
        </h2>
        <p style={{
          ...fi(150),
          fontSize: 15, fontFamily: FONT, fontWeight: 300, color: MUTED,
          maxWidth: 480, margin: '0 auto',
        }}>
          Not personality labels. Distance from what the role actually demands.
        </p>
      </div>

      {/* ── Pentagon ──────────────────────────────────────────────────── */}
      <div ref={pulseWrapRef} style={{ width: 160, height: 160, margin: '28px auto 36px' }}>
        <svg
          width="160" height="160" viewBox="0 0 160 160"
          className={breatheActive ? 'fd-breathing' : ''}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Background rings at 33% and 66% */}
          <polygon points={ring33} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <polygon points={ring66} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

          {/* Ghost baseline polygon — appears on hover to show comparison */}
          <polygon
            ref={ghostRef}
            points={ghost0}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            strokeDasharray="3 4"
            style={{ opacity: 0 }}
          />

          {/* Candidate polygon — drawn in on entry, morphs on hover */}
          <polygon
            ref={polyRef}
            points={poly0}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            style={{ opacity: 0 }}
          />
        </svg>
      </div>

      {/* ── Five columns ──────────────────────────────────────────────── */}
      <div
        className="dimensions-five-col"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}
      >
        {DIM_NAMES.map((dim, i) => {
          const hov = hoveredCol === i
          return (
            <div
              key={dim}
              style={{
                opacity:         inView ? 1 : 0,
                transform:       inView ? 'none' : 'translateY(10px)',
                transition:      `opacity 400ms ease ${500 + i * 70}ms, transform 400ms ease ${500 + i * 70}ms, background 200ms, border-left-color 200ms`,
                padding:         '20px 18px',
                borderLeftWidth: i > 0 ? '1px' : '0',
                borderLeftStyle: 'solid',
                borderLeftColor: hov && i > 0 ? 'rgba(37,99,235,0.35)' : BORD,
                background:      hov ? 'rgba(255,255,255,0.02)' : 'transparent',
                cursor:          'pointer',
                display:         'flex',
                flexDirection:   'column',
              }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
            >
              {/* Icon */}
              <div
                ref={el => { iconWrapRefs.current[i] = el }}
                style={{ marginBottom: 10 }}
              >
                <DimIcon dim={dim} hovered={hov} />
              </div>

              {/* Dimension name */}
              <p style={{
                fontFamily:    FONT,
                fontSize:      11,
                fontWeight:    600,
                color:         hov ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                lineHeight:    1.1,
                marginBottom:  8,
                transition:    'color 200ms',
              }}>
                {dim}
              </p>

              {/* Main description */}
              <p style={{
                fontSize:   13,
                fontFamily: FONT,
                fontWeight: 400,
                color:      'rgba(255,255,255,0.7)',
                lineHeight: 1.55,
              }}>
                {DIM_DESCS[i]}
              </p>

              {/* Hover detail — revealed on column hover */}
              <p style={{
                fontSize:   12,
                fontFamily: FONT,
                fontWeight: 300,
                fontStyle:  'italic',
                color:      'rgba(255,255,255,0.45)',
                lineHeight: 1.5,
                maxHeight:  hov ? '60px' : '0',
                opacity:    hov ? 1 : 0,
                overflow:   'hidden',
                marginTop:  hov ? 8 : 0,
                transition: 'max-height 220ms ease, opacity 220ms ease, margin-top 220ms ease',
              }}>
                {DIM_DETAILS[i]}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Closing line ──────────────────────────────────────────────── */}
      <p style={{
        ...fi(700),
        fontSize:   12,
        fontFamily: FONT,
        fontWeight: 300,
        fontStyle:  'italic',
        color:      'rgba(255,255,255,0.28)',
        textAlign:  'center',
        maxWidth:   480,
        margin:     '28px auto 0',
      }}>
        There is no high or low. Only fit — or distance from it.
      </p>
    </div>
  )
}
