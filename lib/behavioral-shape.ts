interface Coords {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

export function generateBehavioralShape(coords: Coords): string[] {
  const lines: string[] = []

  // Execution signal
  if (coords.dominance > 0.75) {
    lines.push('Elevated execution signal indicates strong outcome orientation and direct accountability patterns.')
  } else if (coords.dominance > 0.60) {
    lines.push('Moderate-to-elevated execution signal supports situational leadership with collaborative flexibility.')
  } else if (coords.dominance < 0.40) {
    lines.push('Below-benchmark execution signal indicates influence through consistency and support rather than directive authority.')
  }

  // Collaboration signal
  if (coords.extraversion > 0.75) {
    lines.push('Above-benchmark collaboration signal with high interpersonal energy and relationship-building capacity.')
  } else if (coords.extraversion < 0.40) {
    lines.push('Below-benchmark collaboration signal indicates independent operating preference with precision-oriented communication.')
  }

  // Adaptability signal
  if (coords.patience < 0.35) {
    lines.push('Elevated adaptability signal with high internal urgency — signal pattern aligns with high-velocity operational roles.')
  } else if (coords.patience > 0.65) {
    lines.push('Steady adaptability signal indicates consistent output under variable conditions with low reactivity to pressure.')
  }

  // Ownership signal
  if (coords.formality > 0.75) {
    lines.push('Elevated ownership signal with strong process adherence and documentation orientation.')
  } else if (coords.formality < 0.35) {
    lines.push('Below-benchmark ownership signal indicates preference for outcome-driven improvisation over structured process.')
  }

  // Signal combinations
  if (coords.dominance > 0.70 && coords.patience < 0.35) {
    lines.push('Elevated execution combined with high-velocity adaptability signal aligns with high-stakes decision environments.')
  }
  if (coords.extraversion > 0.70 && coords.formality < 0.40) {
    lines.push('Above-benchmark collaboration with low ownership signal aligns with relationship-driven, unstructured operating environments.')
  }
  if (coords.patience > 0.65 && coords.formality > 0.70) {
    lines.push('Steady adaptability combined with elevated ownership signal produces the highest reliability pattern in the calibration set.')
  }
  if (coords.dominance > 0.70 && coords.formality > 0.70) {
    lines.push('Elevated execution paired with elevated ownership signal aligns with senior operational leadership requiring both drive and system-building.')
  }

  return lines.slice(0, 4)
}
