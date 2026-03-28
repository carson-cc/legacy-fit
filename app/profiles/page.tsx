'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FitModel } from '@/app/components/FitModel'
import SignalTrace from '@/app/components/SignalTrace'
import SearchProcessTimeline from '@/app/components/SearchProcessTimeline'
import { PRODUCT_NAME } from '@/lib/brand'

/* ─────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', h, { passive: true })
    h()
    return () => window.removeEventListener('scroll', h)
  }, [])
  return p
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function lerpScores(
  a: { dominance: number; extraversion: number; patience: number; formality: number },
  b: { dominance: number; extraversion: number; patience: number; formality: number },
  t: number
) {
  return {
    dominance: lerp(a.dominance, b.dominance, t),
    extraversion: lerp(a.extraversion, b.extraversion, t),
    patience: lerp(a.patience, b.patience, t),
    formality: lerp(a.formality, b.formality, t),
  }
}

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const T = {
  bg: '#060B14',
  card: '#0D1421',
  b: 'rgba(255,255,255,0.07)',
  b2: 'rgba(255,255,255,0.04)',
  t0: '#FFFFFF',
  t1: 'rgba(255,255,255,0.72)',
  t2: 'rgba(255,255,255,0.48)',
  t3: 'rgba(255,255,255,0.28)',
  t4: 'rgba(255,255,255,0.16)',
  accent: '#2563EB',
  green: '#22C55E',
  yellow: '#EAB308',
}

const STATES = {
  generic:   { dominance: 0.50, extraversion: 0.50, patience: 0.50, formality: 0.50 },
  benchmark: { dominance: 0.74, extraversion: 0.54, patience: 0.46, formality: 0.56 },
  candidate: { dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 },
}

const DIMS = [
  {
    name: 'Execution',
    body: 'Ability to drive forward progress, resolve blockers, and maintain team momentum under pressure.',
    note: 'Evaluated against role pace and accountability demands.',
    key: 'dominance' as const,
  },
  {
    name: 'Ownership',
    body: 'Tendency to assume responsibility, act without excessive escalation, and carry outcomes all the way through.',
    note: 'Weighted heavily in high-accountability operating roles.',
    key: 'formality' as const,
  },
  {
    name: 'Adaptability',
    body: 'Capacity to adjust pace, judgment, and operating style as context shifts.',
    note: 'Critical where conditions change quickly or ambiguity is persistent.',
    key: 'patience' as const,
  },
  {
    name: 'Collaboration',
    body: 'Ability to align others, work through stakeholders, and maintain coordination without losing clarity.',
    note: 'Most predictive in cross-functional and client-facing roles.',
    key: 'extraversion' as const,
  },
  {
    name: 'Decision Speed',
    body: 'Comfort making calls with imperfect information while preserving sound judgment.',
    note: 'Benchmarked relative to role urgency and tolerance for error.',
    key: 'patience' as const,
  },
]

const STRENGTHS = [
  'Takes immediate ownership without being asked',
  'Makes clear decisions under pressure with incomplete information',
  'Drives teams forward when momentum stalls',
]

const RISKS = [
  'May outrun process and steamroll important input',
  'Can create tension by deciding before full team alignment',
  'Lower tolerance for structured, process-heavy environments',
]

/* ─────────────────────────────────────────────────────────────
   METHOD PAGE
───────────────────────────────────────────────────────────── */

export default function MethodPage() {
  const scroll = useScrollProgress()

  // Scroll-driven model morphing
  // 0-0.25: generic → benchmark (visitor sees the target first)
  // 0.25-0.55: benchmark → candidate (candidate profile emerges)
  // 0.55+: candidate with benchmark overlay
  const modelScores = scroll < 0.25
    ? lerpScores(STATES.benchmark, STATES.generic, 1 - scroll / 0.25)
    : scroll < 0.55
      ? lerpScores(STATES.benchmark, STATES.candidate, (scroll - 0.25) / 0.30)
      : STATES.candidate

  // Show benchmark overlay once candidate shape has mostly formed
  const showBenchmark = scroll >= 0.45

  const hero = useInView(0.1)
  const dims = useInView(0.12)
  const science = useInView(0.12)
  const pipeline = useInView(0.1)
  const reco = useInView(0.1)
  const closing = useInView(0.15)

  // FitModel: animate once on first visibility, then lock to avoid restart on scroll
  const hasFitAnimated = useRef(false)
  const [fitAnim, setFitAnim] = useState(false)
  useEffect(() => {
    if (hero.visible && !hasFitAnimated.current) {
      hasFitAnimated.current = true
      setFitAnim(true)
      setTimeout(() => setFitAnim(false), 500)
    }
  }, [hero.visible])

  // SignalTrace: animate once on first visibility
  const hasSigAnimated = useRef(false)
  const [sigAnim, setSigAnim] = useState(false)
  useEffect(() => {
    if (science.visible && !hasSigAnimated.current) {
      hasSigAnimated.current = true
      setSigAnim(true)
    }
  }, [science.visible])

  return (
    <main style={{
      background: T.bg, minHeight: '100vh', color: T.t0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      overflowX: 'hidden',
    }}>

      {/* Cursor-reactive bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(600px circle at 30% 40%, rgba(37,99,235,0.05), transparent 50%)',
      }} />

      {/* Grid texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* ══════════════════════════════════════════════
          NAV — matches homepage
      ══════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(6,11,20,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.b}`,
      }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: T.t0, textDecoration: 'none', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {[
            { label: 'Product', href: '/#how-it-works' },
            { label: 'Method', href: '/profiles' },
            { label: 'Archetypes', href: '/archetypes' },
            { label: 'Sample Report', href: '/dashboard/candidates/invite-marcus' },
          ].map(l => (
            <Link key={l.label} href={l.href}
              style={{
                fontSize: 13, fontWeight: l.href === '/profiles' ? 600 : 500,
                color: l.href === '/profiles' ? T.t0 : T.t3,
                textDecoration: 'none', transition: 'color 160ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = T.t0)}
              onMouseLeave={e => (e.currentTarget.style.color = l.href === '/profiles' ? T.t0 : T.t3)}
            >{l.label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{ fontSize: 13, color: T.t3, textDecoration: 'none', transition: 'color 160ms ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = T.t0)}
            onMouseLeave={e => (e.currentTarget.style.color = T.t3)}
          >Sign in</Link>
          <a href="mailto:team@veltro.ai" style={{
            height: 34, padding: '0 16px', borderRadius: 8, background: T.t0, color: T.bg,
            fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
            textDecoration: 'none', letterSpacing: '-0.01em',
          }}>Talk to us</a>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        ref={hero.ref as React.RefObject<HTMLElement>}
        style={{
          position: 'relative', borderBottom: `1px solid ${T.b}`,
          minHeight: '88vh', display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 500px', gap: 72, alignItems: 'center' }}>

          {/* Left */}
          <div style={{
            opacity: hero.visible ? 1 : 0,
            transform: hero.visible ? 'none' : 'translateY(20px)',
            transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <p style={{ fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 20 }}>Method</p>

            <h1 style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.04, color: T.t0, marginBottom: 24 }}>
              Why the recommendation<br />holds up.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.8, color: T.t1, maxWidth: 520, marginBottom: 16 }}>
              The purpose of the model is not to label people. It is to help recruiting firms make sharper candidate recommendations — with clearer reasoning, stronger evidence, and more consistent role alignment.
            </p>

            <p style={{ fontSize: 14, color: T.t4, marginBottom: 40 }}>
              Model v2.0.1 &middot; Calibrated Mar 2026 &middot; Norm dataset: 2,245,096 respondents
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Link href="/dashboard/candidates/invite-marcus" style={{
                height: 46, padding: '0 24px', borderRadius: 10,
                background: T.t0, color: T.bg,
                fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', transition: 'all 200ms ease', letterSpacing: '-0.01em',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >See a full recommendation</Link>
              <a href="#dimensions" style={{ fontSize: 14, color: T.t2, textDecoration: 'none' }}>See the dimensions &darr;</a>
            </div>
          </div>

          {/* Right — live FitModel that morphs on scroll */}
          <div style={{
            position: 'relative',
            background: T.card,
            border: `1px solid ${T.b}`,
            borderRadius: 20, padding: 32, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            opacity: hero.visible ? 1 : 0,
            transform: hero.visible ? 'none' : 'translateY(30px) scale(0.97)',
            transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
          }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 15%, rgba(37,99,235,0.12), transparent 55%)', pointerEvents: 'none' }} />

            {/* Scroll state indicator */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: T.t4, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                {scroll < 0.25 ? 'Role Benchmark' : scroll < 0.55 ? 'Candidate Signal Emerging' : 'Candidate vs. Benchmark'}
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 0.25, 0.55].map((threshold, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: scroll >= threshold ? T.accent : 'rgba(255,255,255,0.12)',
                    transition: 'background 300ms ease',
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <FitModel
                scores={modelScores}
                target={showBenchmark ? STATES.benchmark : undefined}
                size={300}
                animated={fitAnim}
                variant="dark"
              />
            </div>

            {/* Dimension status rows */}
            <div style={{ borderTop: `1px solid ${T.b}`, paddingTop: 16 }}>
              {DIMS.map((d, i) => {
                const rawVal = scroll >= 0.55
                  ? [STATES.candidate.dominance, STATES.candidate.formality, 1 - STATES.candidate.patience, STATES.candidate.extraversion, 1 - STATES.candidate.patience][i]
                  : null
                const pct = rawVal ? Math.round(rawVal * 100) : null
                return (
                  <div key={d.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0',
                    borderBottom: i < DIMS.length - 1 ? `1px solid ${T.b2}` : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: T.t1, fontWeight: 500 }}>{d.name}</span>
                    <span style={{
                      fontSize: 12,
                      color: scroll >= 0.55
                        ? (pct && pct > 65 ? T.green : pct && pct < 35 ? T.yellow : T.t2)
                        : 'rgba(37,99,235,0.5)',
                      fontWeight: 600,
                      transition: 'all 400ms ease',
                    }}>
                      {scroll >= 0.55 ? (pct ? `${pct}` : 'active') : 'benchmark'}
                    </span>
                  </div>
                )
              })}
            </div>

            <p style={{ fontSize: 11, color: T.t4, marginTop: 14, textAlign: 'center' }}>
              Scroll to see the candidate signal emerge against the benchmark
            </p>
          </div>
        </div>
      </section>

      {/* Trust rail */}
      <div style={{ borderBottom: `1px solid ${T.b}`, padding: '14px 40px', background: T.card }}>
        <p style={{ fontSize: 12, color: T.t3, textAlign: 'center', letterSpacing: '0.02em' }}>
          Based on 94 behavioral signals &middot; IPIP-NEO &amp; 16PF validated &middot; 2,245,096-person norm dataset &middot; Role-specific benchmark comparison &middot; Model confidence included
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          DIMENSIONS — what gets measured
      ══════════════════════════════════════════════ */}
      <section
        id="dimensions"
        ref={dims.ref as React.RefObject<HTMLElement>}
        style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 40px' }}
      >
        <p style={{ fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 16 }}>Core Dimensions</p>
        <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: T.t0, marginBottom: 12 }}>
          Five dimensions.<br />Each one role-relevant.
        </h2>
        <p style={{ fontSize: 16, color: T.t2, maxWidth: 560, marginBottom: 48, lineHeight: 1.7 }}>
          The model doesn&rsquo;t measure general personality traits. It measures the five dimensions most predictive of performance variation across the role types recruiting firms actually place.
        </p>

        <div style={{
          borderTop: `1px solid ${T.b}`,
          opacity: dims.visible ? 1 : 0,
          transform: dims.visible ? 'none' : 'translateY(12px)',
          transition: 'all 500ms ease',
        }}>
          {DIMS.map((d, i) => (
            <div key={d.name} style={{
              display: 'grid', gridTemplateColumns: '200px 1fr',
              gap: 32, padding: '22px 8px',
              borderBottom: `1px solid ${T.b2}`,
              transition: 'background 180ms ease',
              cursor: 'default',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 2, height: 28, borderRadius: 1, background: T.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: T.t0, letterSpacing: '-0.01em' }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.75, color: T.t1 }}>{d.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SCIENCE — the credibility section
      ══════════════════════════════════════════════ */}
      <section
        ref={science.ref as React.RefObject<HTMLElement>}
        style={{ background: '#080E1A', borderTop: `1px solid ${T.b}`, borderBottom: `1px solid ${T.b}`, padding: '96px 40px' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

            {/* Left — norm dataset */}
            <div style={{
              opacity: science.visible ? 1 : 0,
              transform: science.visible ? 'none' : 'translateY(16px)',
              transition: 'all 400ms ease-out',
            }}>
              <p style={{ fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 20 }}>The Science</p>
              <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: T.t0, marginBottom: 20 }}>
                Benchmarks calibrated against 2.2 million people.
              </h2>
              <p style={{ fontSize: 15, color: T.t2, lineHeight: 1.8, marginBottom: 20 }}>
                Percentile rankings and role benchmarks are computed from a combined 2,245,096-person dataset drawn from eight independent validated psychometric studies, including the IPIP-NEO 120-item instrument and the 16PF Questionnaire.
              </p>
              <p style={{ fontSize: 15, color: T.t2, lineHeight: 1.8, marginBottom: 32 }}>
                This means when Veltro says a candidate is in the &ldquo;Top 12%&rdquo; on Execution, that percentile is drawn from a real population distribution — not a proprietary black box.
              </p>

              {/* Dataset breakdown */}
              <div style={{ borderTop: `1px solid ${T.b}` }}>
                {[
                  { label: 'IPIP-NEO 120-item (Johnson, 2014)', n: '307,313', primary: true },
                  { label: 'IPIP-FFM 50-item (OSPP, 2018)', n: '922,541', primary: true },
                  { label: '16PF Factor E / IPIP equivalent (OSPP, 2014)', n: '49,159', primary: false },
                  { label: 'Cross-validation datasets (4 studies)', n: '658,770', primary: false },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < 3 ? `1px solid ${T.b2}` : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: item.primary ? T.t1 : T.t3 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.primary ? T.t0 : T.t3, minWidth: 80, textAlign: 'right' }}>
                      n={parseInt(item.n.replace(',', '')).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${T.b}`, marginTop: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.t0 }}>Total respondents</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>2,245,096</span>
                </div>
              </div>
            </div>

            {/* Right — signal trace visual */}
            <div style={{
              opacity: science.visible ? 1 : 0,
              transform: science.visible ? 'none' : 'translateY(16px)',
              transition: 'all 500ms ease-out 150ms',
            }}>
              <div style={{ background: T.card, border: `1px solid ${T.b}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: T.t3, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Signal Pattern vs. Benchmark</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 2, background: T.green }} />
                      <span style={{ fontSize: 10, color: T.t3 }}>Candidate</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.2)', borderTop: '1px dashed rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: 10, color: T.t3 }}>Benchmark</span>
                    </div>
                  </div>
                </div>
                <SignalTrace
                  candidateScores={{ dominance: 0.88, extraversion: 0.62, patience: 0.18, formality: 0.45 }}
                  benchmarkScores={{ dominance: 0.74, extraversion: 0.54, patience: 0.46, formality: 0.56 }}
                  width={420}
                  variant="dark"
                  animated={sigAnim}
                />
                <p style={{ fontSize: 11, color: T.t4, marginTop: 16, lineHeight: 1.6 }}>
                  Green area: above benchmark. Red area: below benchmark. Each lane represents one of the five evaluation dimensions.
                </p>
              </div>

              {/* Benchmark note */}
              <div style={{ marginTop: 16, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 10, padding: '14px 18px' }}>
                <p style={{ fontSize: 13, color: T.t2, lineHeight: 1.6 }}>
                  <strong style={{ color: T.t0 }}>Role benchmarks are not generic.</strong> The target profile is calibrated per role type — field leadership, executive, technical, sales — and adjusted when the recruiter confirms the active benchmark for a specific search.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SEARCH PROCESS — where Veltro fits
      ══════════════════════════════════════════════ */}
      <section
        id="pipeline"
        ref={pipeline.ref as React.RefObject<HTMLElement>}
        style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 40px' }}
      >
        <p style={{ fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 16 }}>The Search Process</p>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: T.t0, marginBottom: 12 }}>
          Where Veltro fits.
        </h2>
        <p style={{ fontSize: 16, color: T.t2, maxWidth: 520, marginBottom: 56, lineHeight: 1.7 }}>
          Veltro doesn&rsquo;t change how you run searches. It adds a layer of evidence at the moments that determine whether you win the placement.
        </p>

        <div style={{
          opacity: pipeline.visible ? 1 : 0,
          transform: pipeline.visible ? 'none' : 'translateY(16px)',
          transition: 'all 500ms ease-out',
        }}>
          <SearchProcessTimeline />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          RECOMMENDATION REVEAL — sample output
      ══════════════════════════════════════════════ */}
      <section
        ref={reco.ref as React.RefObject<HTMLElement>}
        style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px 96px' }}
      >
        <div style={{
          display: 'grid', gridTemplateColumns: '1.15fr 1fr',
          overflow: 'hidden', borderRadius: 20,
          border: `1px solid ${T.b}`, background: T.card,
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          opacity: reco.visible ? 1 : 0,
          transform: reco.visible ? 'none' : 'translateY(24px)',
          transition: 'all 600ms ease',
        }}>
          {/* Left: sample recommendation */}
          <div style={{ padding: 40 }}>
            <p style={{ fontSize: 10, color: T.t3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 28 }}>Sample Recommendation Output</p>

            {/* Candidate + Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: T.t0, letterSpacing: '-0.02em', marginBottom: 4 }}>Marcus Thompson</p>
                <p style={{ fontSize: 13, color: T.t2, marginBottom: 0 }}>Superintendent · Chicago · Gilbane Construction</p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  border: `3px solid ${T.green}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px rgba(34,197,94,0.15)`,
                  opacity: reco.visible ? 1 : 0,
                  transform: reco.visible ? 'none' : 'scale(0.7)',
                  transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1) 300ms',
                }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: T.green }}>93</span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.green, marginTop: 8, letterSpacing: '-0.01em' }}>Strong Hire</p>
              </div>
            </div>

            {/* Confidence + Percentile pills */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 24,
              opacity: reco.visible ? 1 : 0,
              transition: 'opacity 400ms ease 500ms',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.green, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '5px 12px', borderRadius: 999 }}>High confidence</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.t0, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.b}`, padding: '5px 12px', borderRadius: 999 }}>Top 12%</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.t2, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.b}`, padding: '5px 12px', borderRadius: 999 }}>Role benchmark active</span>
            </div>

            {/* Benchmark comparison */}
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: T.t1, lineHeight: 1.6, fontStyle: 'italic' }}>
                Aligned with high-performing candidates in comparable field leadership roles. Strong execution and ownership signal with fast decision pace.
              </p>
            </div>

            {/* Strengths + Risks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 9, color: T.t3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Top Strengths</p>
                {STRENGTHS.map((s, i) => (
                  <div key={s} style={{
                    display: 'flex', gap: 8, marginBottom: 8,
                    opacity: reco.visible ? 1 : 0,
                    transform: reco.visible ? 'none' : 'translateX(-8px)',
                    transition: `all 400ms ease ${700 + i * 80}ms`,
                  }}>
                    <span style={{ color: T.green, fontWeight: 700, flexShrink: 0 }}>+</span>
                    <span style={{ fontSize: 13, color: T.t1, lineHeight: 1.45 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 9, color: T.t3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Primary Risks</p>
                {RISKS.slice(0, 2).map((r, i) => (
                  <div key={r} style={{
                    display: 'flex', gap: 8, marginBottom: 8,
                    opacity: reco.visible ? 1 : 0,
                    transform: reco.visible ? 'none' : 'translateX(-8px)',
                    transition: `all 400ms ease ${900 + i * 80}ms`,
                  }}>
                    <span style={{ color: T.yellow, fontWeight: 700, flexShrink: 0 }}>!</span>
                    <span style={{ fontSize: 13, color: T.t1, lineHeight: 1.45 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontSize: 11, color: T.t4, borderTop: `1px solid ${T.b}`, paddingTop: 16 }}>
              Based on 94 behavioral signals &middot; Role benchmark active &middot; Scoring v2.0.0 &middot; IPIP-NEO validated
            </p>
          </div>

          {/* Right: defensibility copy */}
          <div style={{ padding: 40, borderLeft: `1px solid ${T.b}`, background: 'linear-gradient(180deg, rgba(10,17,32,0.5), transparent)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', color: T.t0, marginBottom: 16, lineHeight: 1.25 }}>
              Why this recommendation holds up in the room.
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: T.t1, marginBottom: 28 }}>
              Veltro doesn&rsquo;t rely on a single trait score or a personality label. The recommendation is built from observed signal patterns, compared against a role-calibrated benchmark, with every input visible in the report.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: T.t1, marginBottom: 32 }}>
              When a client asks &ldquo;why Marcus over the other two&rdquo; — the answer isn&rsquo;t your gut. It&rsquo;s the benchmark comparison. It&rsquo;s the fit score. It&rsquo;s the three specific strengths and the one risk condition worth watching.
            </p>
            <div style={{ borderTop: `1px solid ${T.b}` }}>
              {[
                'Fit score derived from role-calibrated benchmark',
                'Confidence level flags low-signal evaluations',
                'Strengths and risks surfaced from signal pattern',
                'AI interpretation is secondary to structured evidence',
                'Full signal data retained — nothing is a black box',
              ].map((item, i) => (
                <div key={item} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 0',
                  borderBottom: i < 4 ? `1px solid ${T.b2}` : 'none',
                  transition: 'background 180ms ease', cursor: 'default',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 13, color: T.t1 }}>{item}</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, boxShadow: `0 0 6px ${T.accent}44`, flexShrink: 0 }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <Link href="/dashboard/candidates/invite-marcus" style={{
                fontSize: 13, fontWeight: 600, color: T.t2,
                textDecoration: 'none', transition: 'color 160ms ease',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
                onMouseEnter={e => (e.currentTarget.style.color = T.t0)}
                onMouseLeave={e => (e.currentTarget.style.color = T.t2)}
              >See the full Marcus Thompson report &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLOSING
      ══════════════════════════════════════════════ */}
      <section
        ref={closing.ref as React.RefObject<HTMLElement>}
        style={{
          position: 'relative', borderTop: `1px solid ${T.b}`,
          padding: '96px 40px', textAlign: 'center',
        }}
      >
        <div style={{
          maxWidth: 600, margin: '0 auto',
          opacity: closing.visible ? 1 : 0,
          transform: closing.visible ? 'none' : 'translateY(16px)',
          transition: 'all 500ms ease',
        }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: T.t0, marginBottom: 20 }}>
            Built for the moment<br />the client gets cold feet.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: T.t2, marginBottom: 36 }}>
            Every piece of the model exists to support that conversation. The score. The benchmark. The rationale. The structured evidence. It&rsquo;s not a personality profile. It&rsquo;s a recommendation with evidence behind it.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/dashboard/candidates/invite-marcus" style={{
              height: 44, padding: '0 22px', borderRadius: 10,
              background: T.t0, color: T.bg,
              fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 180ms ease',
            }}>See a full recommendation</Link>
            <a href="mailto:team@veltro.ai" style={{
              height: 44, padding: '0 22px', borderRadius: 10,
              border: `1px solid ${T.b}`,
              color: T.t2,
              fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', transition: 'all 180ms ease',
            }}>Talk to us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.b}`, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: T.t4 }}>{PRODUCT_NAME} by Legacy Workforce &middot; &copy; 2026</span>
        <span style={{ fontSize: 11, color: T.t4 }}>team@veltro.ai</span>
      </footer>

      <style>{`
        @media (max-width: 1100px) {
          div[style*="1fr 500px"] { grid-template-columns: 1fr !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="200px 1fr 260px"] { grid-template-columns: 1fr !important; }
          div[style*="1.15fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          nav { padding: 0 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
          h1 { font-size: 38px !important; }
          h2 { font-size: 28px !important; }
        }
      `}</style>
    </main>
  )
}
