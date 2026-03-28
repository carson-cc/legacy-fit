'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FitModel } from '@/app/components/FitModel'
import { REFERENCE_PROFILES, type ReferenceProfile } from '@/lib/data/profiles'
import { PRODUCT_NAME } from '@/lib/brand'

/* ─────────────────────────────────────────────────────────────
   LAYOUT CONSTANTS
───────────────────────────────────────────────────────────── */

const M = { top: 56, right: 80, bottom: 60, left: 80 }
const MIN_H = 520

/* ─────────────────────────────────────────────────────────────
   QUADRANT GROUPS — filter pill labels mapped to data groups
───────────────────────────────────────────────────────────── */

const QUADRANT_GROUPS = [
  { label: 'All',         group: null },
  { label: 'Drivers',     group: 'field_command' },
  { label: 'Catalysts',   group: 'people_influence' },
  { label: 'Operators',   group: 'process_structure' },
  { label: 'Stabilizers', group: 'strategic_drive' },
] as const

/* ─────────────────────────────────────────────────────────────
   AXIS NORMALIZATION — spread dots across full plot area
───────────────────────────────────────────────────────────── */

function rawCoords(p: ReferenceProfile) {
  return {
    execution:     p.coords.dominance * 0.58 + p.coords.formality * 0.42,
    collaboration: p.coords.extraversion * 0.68 + p.coords.patience * 0.32,
  }
}

const allRaw    = REFERENCE_PROFILES.map(rawCoords)
const minExec   = Math.min(...allRaw.map(c => c.execution))
const maxExec   = Math.max(...allRaw.map(c => c.execution))
const minCollab = Math.min(...allRaw.map(c => c.collaboration))
const maxCollab = Math.max(...allRaw.map(c => c.collaboration))

const NORM_PAD = 0.08
function normalize(val: number, min: number, max: number) {
  return NORM_PAD + ((val - min) / (max - min)) * (1 - NORM_PAD * 2)
}

function profileBaseCoords(p: ReferenceProfile, pw: number, ph: number) {
  const raw = rawCoords(p)
  const nx = normalize(raw.execution,     minExec,  maxExec)
  const ny = normalize(raw.collaboration, minCollab, maxCollab)
  return {
    x: M.left + nx * pw,
    y: M.top  + (1 - ny) * ph,
  }
}

/* ─────────────────────────────────────────────────────────────
   COLLISION RESOLUTION
───────────────────────────────────────────────────────────── */

function resolveCollisions(
  dots: { x: number; y: number }[],
  minDist = 24,
  iterations = 50,
): { x: number; y: number }[] {
  const d = dots.map(p => ({ ...p }))
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false
    for (let i = 0; i < d.length; i++) {
      for (let j = i + 1; j < d.length; j++) {
        const dx = d[j].x - d[i].x
        const dy = d[j].y - d[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist && dist > 0) {
          const push = (minDist - dist) / 2
          const nx = dx / dist
          const ny = dy / dist
          d[i].x -= nx * push
          d[i].y -= ny * push
          d[j].x += nx * push
          d[j].y += ny * push
          moved = true
        }
      }
    }
    if (!moved) break
  }
  return d
}

/* ─────────────────────────────────────────────────────────────
   HOVER CARD
───────────────────────────────────────────────────────────── */

const CARD_W = 200
const CARD_H = 110
const CARD_PAD = 16

function HoverCard({ profile }: { profile: ReferenceProfile }) {
  const B = '#2563EB'
  return (
    <div style={{
      background: '#0D1421',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '14px 16px',
      width: CARD_W,
      boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      pointerEvents: 'none',
    }}>
      <span style={{
        display: 'inline-block', marginBottom: 8,
        fontSize: 9, color: B, fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', background: 'rgba(37,99,235,0.12)',
        border: '1px solid rgba(37,99,235,0.2)', borderRadius: 4, padding: '2px 7px',
      }}>{profile.groupLabel}</span>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#FFF', marginBottom: 4, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
        {profile.name}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, margin: 0, overflow: 'hidden' }}>
        {profile.tagline}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FULL PROFILE OVERLAY
───────────────────────────────────────────────────────────── */

function ProfileOverlay({ profile, onClose }: { profile: ReferenceProfile; onClose: () => void }) {
  const B = '#2563EB', G = '#22C55E', Y = '#EAB308'
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(6,11,20,0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 200, overflow: 'auto',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0D1421',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: 40,
          maxWidth: 720, width: '100%',
          boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <span style={{
              fontSize: 9, color: B, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.2)', borderRadius: 4, padding: '3px 8px',
              display: 'inline-block', marginBottom: 12,
            }}>{profile.groupLabel}</span>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#FFF', marginBottom: 6, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {profile.name}
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{profile.tagline}</p>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.5)', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 4,
          }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 40 }}>
          <div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 28 }}>
              {profile.description}
            </p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Strengths</p>
            {profile.strengths.map(s => (
              <div key={s} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: G, flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, marginTop: 20 }}>Traps</p>
            {profile.traps.map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: Y, flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, marginTop: 20 }}>Best Roles</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.bestRoles.map(r => (
                <span key={r} style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.55)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, padding: '4px 10px',
                }}>{r}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FitModel scores={profile.coords} size={240} variant="dark" animated />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */

export default function ArchetypesPage() {
  const [animated, setAnimated]       = useState(false)
  const [hovered, setHovered]         = useState<{ profile: ReferenceProfile; svgX: number; svgY: number } | null>(null)
  const [selected, setSelected]       = useState<ReferenceProfile | null>(null)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [scrolled, setScrolled]       = useState(false)
  const [dims, setDims]               = useState({ width: 860, height: 620 })
  const [justFiltered, setJustFiltered] = useState(false)
  const containerRef  = useRef<HTMLDivElement>(null)
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setAnimated(true), 120)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDims({ width, height: Math.max(height, MIN_H) })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Canvas dimensions derived from observed container
  const svgW    = dims.width
  const svgH    = Math.max(dims.height, MIN_H)
  const pw      = svgW - M.left - M.right
  const ph      = svgH - M.top - M.bottom
  const centerX = M.left + pw / 2
  const centerY = M.top  + ph / 2

  // Base positions → collision resolution → clamp to canvas
  const CLAMP_PAD = 16
  const basePos    = REFERENCE_PROFILES.map(p => profileBaseCoords(p, pw, ph))
  const resolvedPos = resolveCollisions(basePos).map(pos => ({
    x: Math.max(M.left + CLAMP_PAD, Math.min(svgW - M.right - CLAMP_PAD, pos.x)),
    y: Math.max(M.top  + CLAMP_PAD, Math.min(svgH - M.bottom - CLAMP_PAD, pos.y)),
  }))

  const enriched = REFERENCE_PROFILES.map((p, idx) => ({
    ...p,
    svgX:        resolvedPos[idx].x,
    svgY:        resolvedPos[idx].y,
    filtered:    activeGroup !== null && p.group !== activeGroup,
    highlighted: activeGroup !== null && p.group === activeGroup,
  }))

  function handleFilterClick(group: string | null) {
    setActiveGroup(group)
    setJustFiltered(true)
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current)
    filterTimerRef.current = setTimeout(() => setJustFiltered(false), 350)
  }

  const BG = '#060B14'
  const B  = '#2563EB'
  const MAX = 1280

  return (
    <main style={{
      background: BG, color: '#FFF', minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      overflowX: 'hidden',
    }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        background: scrolled ? 'rgba(6,11,20,0.95)' : 'rgba(6,11,20,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 240ms ease',
      }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textDecoration: 'none', letterSpacing: '-0.02em' }}>{PRODUCT_NAME}</Link>
          <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {[
              { label: 'Product', href: '/#how-it-works' },
              { label: 'Method', href: '/profiles' },
              { label: 'Archetypes', href: '/archetypes' },
              { label: 'Sample Report', href: '/sample-report' },
            ].map(l => (
              <Link key={l.label} href={l.href}
                style={{
                  fontSize: 13, fontWeight: l.href === '/archetypes' ? 600 : 500,
                  color: l.href === '/archetypes' ? '#FFF' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none', transition: 'color 160ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
                onMouseLeave={e => (e.currentTarget.style.color = l.href === '/archetypes' ? '#FFF' : 'rgba(255,255,255,0.45)')}
              >{l.label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 160ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >Sign in</Link>
            <a href="mailto:team@veltro.ai" style={{
              height: 34, padding: '0 16px', borderRadius: 8, background: '#FFF', color: BG,
              fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', letterSpacing: '-0.01em',
            }}>Talk to us</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '88px 40px 56px', textAlign: 'center', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(600px circle at 50% 80%, rgba(37,99,235,0.06), transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 11, color: B, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>Behavioral Archetypes</p>
          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.06, color: '#FFF', marginBottom: 20 }}>
            Every pattern your candidates<br />fall into. Mapped.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            20+ behavioral archetypes calibrated against 2.2 million people. Every candidate evaluation maps to one.
          </p>
        </div>
      </section>

      {/* RADAR */}
      <section style={{ padding: '48px 40px 64px' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto' }}>

          {/* Group filter pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {QUADRANT_GROUPS.map(q => {
              const active = q.group === activeGroup || (q.group === null && activeGroup === null)
              return (
                <button
                  key={q.label}
                  onClick={() => handleFilterClick(q.group ?? null)}
                  style={{
                    height: 32, padding: '0 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#060B14' : 'rgba(255,255,255,0.55)',
                    background: active ? '#FFF' : 'transparent',
                    border: `1px solid ${active ? '#FFF' : 'rgba(255,255,255,0.14)'}`,
                    transition: 'all 200ms ease',
                  }}
                >{q.label}</button>
              )
            })}
          </div>

          {/* Radar container — observed for responsive sizing */}
          <div style={{ overflowX: 'auto' }}>
            <div ref={containerRef} style={{ width: '100%', minHeight: MIN_H, margin: '0 auto', position: 'relative' }}>
              <svg
                width={svgW}
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                style={{ display: 'block', overflow: 'visible', minHeight: MIN_H }}
              >
                {/* Radial glow */}
                <defs>
                  <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(37,99,235,0.07)" />
                    <stop offset="100%" stopColor="rgba(37,99,235,0)" />
                  </radialGradient>
                </defs>
                <ellipse
                  cx={centerX} cy={centerY}
                  rx={pw * 0.52} ry={ph * 0.52}
                  fill="url(#radarGlow)"
                />

                {/* Grid lines at 25%, 50%, 75% */}
                {[0.25, 0.5, 0.75].map(v => (
                  <g key={v}>
                    <line
                      x1={M.left + v * pw} y1={M.top}
                      x2={M.left + v * pw} y2={M.top + ph}
                      stroke="rgba(255,255,255,0.04)" strokeWidth={1}
                    />
                    <line
                      x1={M.left} y1={M.top + (1 - v) * ph}
                      x2={M.left + pw} y2={M.top + (1 - v) * ph}
                      stroke="rgba(255,255,255,0.04)" strokeWidth={1}
                    />
                  </g>
                ))}

                {/* Center crosshairs */}
                <line x1={centerX} y1={M.top} x2={centerX} y2={M.top + ph} stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} strokeDasharray="4 4" />
                <line x1={M.left} y1={centerY} x2={M.left + pw} y2={centerY} stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} strokeDasharray="4 4" />

                {/* Axis labels */}
                <text x={M.left + pw + 12} y={centerY} dominantBaseline="middle"
                  fill="rgba(255,255,255,0.22)" fontSize={9} fontWeight={600} letterSpacing="0.1em"
                >Pace →</text>
                <text x={centerX} y={M.top - 16} textAnchor="middle"
                  fill="rgba(255,255,255,0.22)" fontSize={9} fontWeight={600} letterSpacing="0.1em"
                >↑ People</text>

                {/* Profile dots */}
                {enriched.map((p, i) => {
                  const dotX  = animated ? p.svgX : centerX
                  const dotY  = animated ? p.svgY : centerY
                  const isHov = hovered?.profile.name === p.name
                  const delay = `${i * 20}ms`
                  const moveTr = `cx 600ms cubic-bezier(0.16,1,0.3,1) ${delay}, cy 600ms cubic-bezier(0.16,1,0.3,1) ${delay}`

                  return (
                    <g
                      key={p.name}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHovered({ profile: p, svgX: dotX, svgY: dotY })}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(p)}
                    >
                      {/* 20px transparent hit target — same motion transition as visible dot */}
                      <circle
                        cx={dotX} cy={dotY} r={20}
                        fill="transparent"
                        style={{ transition: moveTr }}
                      />

                      {/* Pulse ring on hover */}
                      {isHov && (
                        <circle
                          cx={dotX} cy={dotY} r={16}
                          fill="none" stroke={B} strokeWidth={1} opacity={0.2}
                          style={{ pointerEvents: 'none', transition: moveTr }}
                        />
                      )}

                      {/* Highlight ring for active group */}
                      {p.highlighted && !isHov && (
                        <circle
                          cx={dotX} cy={dotY} r={10}
                          fill={B} opacity={0.12}
                          style={{ pointerEvents: 'none', animation: 'dotPulse 2s ease-in-out infinite', transition: moveTr }}
                        />
                      )}

                      {/* Main dot — filter scale pulse + opacity */}
                      <circle
                        cx={dotX}
                        cy={dotY}
                        r={activeGroup === null ? 5 : 6}
                        fill={p.highlighted ? B : 'rgba(255,255,255,0.7)'}
                        style={{
                          pointerEvents: 'none',
                          transformOrigin: `${dotX}px ${dotY}px`,
                          transform: justFiltered && p.highlighted ? 'scale(1.5)' : 'scale(1)',
                          opacity: activeGroup === null ? 1 : p.highlighted ? 1 : 0.08,
                          transition: `transform 0.3s ease-out, opacity 0.2s ease-out, ${moveTr}`,
                        }}
                      />

                      {/* Name label — only when a filter is active */}
                      {activeGroup !== null && p.highlighted && (
                        <text
                          x={dotX > svgW * 0.75 ? dotX - 10 : dotX + 10}
                          y={dotY + 4}
                          textAnchor={dotX > svgW * 0.75 ? 'end' : 'start'}
                          fontSize={11}
                          fill="rgba(255,255,255,0.75)"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >{p.name}</text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Hover card — anchored to avoid canvas overflow */}
              {hovered && (() => {
                const cardX = hovered.svgX + CARD_W + CARD_PAD > svgW
                  ? hovered.svgX - CARD_W - CARD_PAD
                  : hovered.svgX + CARD_PAD
                const cardY = hovered.svgY + CARD_H + CARD_PAD > svgH
                  ? hovered.svgY - CARD_H - CARD_PAD
                  : hovered.svgY + CARD_PAD
                return (
                  <div style={{ position: 'absolute', left: cardX, top: cardY, zIndex: 20 }}>
                    <HoverCard profile={hovered.profile} />
                  </div>
                )
              })()}
            </div>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: '64px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 12, lineHeight: 1.7 }}>
          Not sure which archetype fits your role?<br />Veltro suggests the benchmark automatically.
        </p>
        <Link href="/sample-report" style={{
          fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
          textDecoration: 'none', transition: 'color 160ms ease',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        >See what a report looks like →</Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>{PRODUCT_NAME} by Legacy Workforce · © 2026</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>team@veltro.ai</span>
      </footer>

      {/* Full profile overlay */}
      {selected && (
        <ProfileOverlay profile={selected} onClose={() => setSelected(null)} />
      )}

      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(1.3); }
        }
        @media (max-width: 768px) {
          h1 { font-size: 36px !important; }
          nav { padding: 0 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </main>
  )
}
