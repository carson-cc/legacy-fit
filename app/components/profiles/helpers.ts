export function getGroupColor(group: string): string {
  switch (group) {
    case 'field_command': case 'Drivers': return 'var(--p-fc)'
    case 'people_influence': case 'Catalysts': return 'var(--p-pc)'
    case 'process_structure': case 'Operators': return 'var(--p-sc)'
    case 'strategic_drive': case 'Stabilizers': return 'var(--p-dc)'
    default: return 'var(--p-t2)'
  }
}

export function getGroupHex(group: string): string {
  switch (group) {
    case 'field_command': case 'Drivers': return '#b83838'
    case 'people_influence': case 'Catalysts': return '#9a7418'
    case 'process_structure': case 'Operators': return '#2d7248'
    case 'strategic_drive': case 'Stabilizers': return '#2458b8'
    default: return '#888888'
  }
}

export function getDimensionLevel(value: number): string {
  if (value > 0.80) return 'Very High'
  if (value > 0.65) return 'High'
  if (value >= 0.45) return 'Mid'
  if (value > 0.30) return 'Low'
  return 'Very Low'
}

export function getDimensionLevelAbbr(value: number): string {
  const level = getDimensionLevel(value)
  if (level === 'Very High') return 'H'
  if (level === 'High') return 'H'
  if (level === 'Mid') return 'M'
  if (level === 'Low') return 'L'
  return 'L'
}

export function getBarFillOpacity(value: number): string {
  if (value > 0.65) return '#ffffff'
  if (value >= 0.45) return 'rgba(255,255,255,0.4)'
  if (value >= 0.30) return 'rgba(255,255,255,0.2)'
  return 'rgba(255,255,255,0.12)'
}

export function getLevelColor(value: number): string {
  if (value > 0.65) return 'rgba(255,255,255,0.7)'
  if (value >= 0.45) return 'rgba(255,255,255,0.35)'
  return 'rgba(255,255,255,0.2)'
}

export function getLevelHeadingColor(value: number): string {
  if (value > 0.65) return 'var(--p-t0)'
  if (value >= 0.45) return 'var(--p-t1)'
  return 'var(--p-t2)'
}

export function getDimensionDescription(dimension: string, value: number): string {
  const level = value > 0.65 ? 'high' : value >= 0.45 ? 'mid' : 'low'
  const descriptions: Record<string, Record<string, string>> = {
    dominance: {
      high: "Takes charge naturally, sets direction, and holds others accountable without hesitation. Not interested in consensus for its own sake.",
      mid: "Can lead when needed but is equally comfortable contributing within someone else's direction. Situation-dependent.",
      low: "Prefers to work within established direction rather than setting it. Collaborative, deferential, avoids conflict.",
    },
    extraversion: {
      high: "Builds relationships effortlessly and draws energy from interaction. Communication is how they think and process.",
      mid: "Comfortable in both social and independent contexts. Selectively outgoing — engaged when it matters.",
      low: "Reserved and independent. Prefers focused solo work. Selective about communication and social investment.",
    },
    patience: {
      high: "Thrives in steady, methodical environments. Handles repetition and long timelines without degradation. Rarely rushed.",
      mid: "Adapts to both urgent and steady pacing. Neither urgency-driven nor anchored to routine.",
      low: "Moves fast by instinct. Gets frustrated by delay, bureaucracy, or slow-moving processes. Urgency is their default.",
    },
    formality: {
      high: "Follows process, values documentation, and holds to standards without exception. Rules exist for a reason.",
      mid: "Respects structure when it serves the work. Will follow process but won't fight for it.",
      low: "Improvises over following process. Reads situations rather than rules. Works best in informal environments.",
    },
  }
  return descriptions[dimension]?.[level] || ''
}
