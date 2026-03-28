/**
 * Behavioral Insights Engine
 *
 * Generates template-driven behavioral descriptions, strongest behavior bullets,
 * behavioral summaries, and management strategies from dimension scores.
 *
 * All content is deterministic — same scores always produce same output.
 * No AI generation. Pure template selection based on score patterns.
 */

import type { ReferenceProfile } from './data/profiles'

interface Scores {
  dominance: number
  extraversion: number
  patience: number
  formality: number
}

// ---------------------------------------------------------------------------
//  1. STRONGEST BEHAVIORS — dimension combination templates
// ---------------------------------------------------------------------------

interface BehaviorRule {
  test: (s: Scores) => boolean
  statement: string
}

const BEHAVIOR_RULES: BehaviorRule[] = [
  // High D + Low P — action-oriented leader
  { test: s => s.dominance > 0.70 && s.patience < 0.40,
    statement: "Makes decisions and takes action quickly, even with limited information." },
  { test: s => s.dominance > 0.70 && s.patience < 0.40,
    statement: "Naturally takes charge in ambiguous situations rather than waiting for direction." },
  { test: s => s.dominance > 0.70 && s.patience < 0.35,
    statement: "Thrives under pressure and pushes through obstacles with urgency." },

  // High D + High F — structured authority
  { test: s => s.dominance > 0.70 && s.formality > 0.70,
    statement: "Combines strong leadership with attention to process — expects high standards and enforces them." },
  { test: s => s.dominance > 0.70 && s.formality > 0.70,
    statement: "Builds systems and holds people accountable to them — does not accept shortcuts." },

  // High D + High E — influential driver
  { test: s => s.dominance > 0.65 && s.extraversion > 0.70,
    statement: "Uses personal influence and energy to rally teams toward a goal." },
  { test: s => s.dominance > 0.65 && s.extraversion > 0.70,
    statement: "Communicates vision and direction naturally — people follow because they want to." },

  // High D + Low E — quiet authority
  { test: s => s.dominance > 0.65 && s.extraversion < 0.45,
    statement: "Leads through expertise and decisiveness rather than charm or persuasion." },
  { test: s => s.dominance > 0.65 && s.extraversion < 0.45,
    statement: "Prefers to direct rather than collaborate — most effective when given clear authority." },

  // High E + Low F — social, flexible
  { test: s => s.extraversion > 0.70 && s.formality < 0.50,
    statement: "Informal and outgoing — builds rapport quickly and works best in unstructured environments." },
  { test: s => s.extraversion > 0.70 && s.formality < 0.50,
    statement: "Energizes teams through conversation and enthusiasm rather than process or documentation." },
  { test: s => s.extraversion > 0.75 && s.formality < 0.40,
    statement: "Creates a positive team atmosphere — may need a detail-oriented partner to keep things on track." },

  // High E + High P — steady relationship builder
  { test: s => s.extraversion > 0.65 && s.patience > 0.60,
    statement: "Builds deep, lasting relationships through patience and genuine interest in others." },
  { test: s => s.extraversion > 0.65 && s.patience > 0.60,
    statement: "Creates team cohesion and loyalty — people feel valued and supported." },

  // High E + Low P — high energy social driver
  { test: s => s.extraversion > 0.70 && s.patience < 0.40,
    statement: "High-energy communicator who moves fast between conversations and relationships." },
  { test: s => s.extraversion > 0.70 && s.patience < 0.40,
    statement: "Creates urgency and momentum in teams through enthusiasm and fast communication." },

  // High P + High F — stable, precise
  { test: s => s.patience > 0.65 && s.formality > 0.70,
    statement: "Methodical, reliable, and consistent — delivers the same quality every time." },
  { test: s => s.patience > 0.65 && s.formality > 0.70,
    statement: "Naturally follows established processes and expects others to do the same." },
  { test: s => s.patience > 0.70 && s.formality > 0.75,
    statement: "Exceptional at maintaining standards over long periods without supervision." },

  // High P + Low D — supportive, steady
  { test: s => s.patience > 0.60 && s.dominance < 0.45,
    statement: "Steady presence on any team — supports leadership rather than seeking the spotlight." },
  { test: s => s.patience > 0.60 && s.dominance < 0.45,
    statement: "Reliable under repetitive conditions — does not need variety or novelty to stay engaged." },

  // High F + Low E — independent precision worker
  { test: s => s.formality > 0.70 && s.extraversion < 0.45,
    statement: "Works independently with exceptional attention to detail — minimal supervision needed." },
  { test: s => s.formality > 0.70 && s.extraversion < 0.45,
    statement: "Prefers written communication and documentation over verbal interaction." },

  // Low D + High E — collaborative people person
  { test: s => s.dominance < 0.45 && s.extraversion > 0.65,
    statement: "Collaborative and approachable — builds consensus before moving forward." },
  { test: s => s.dominance < 0.45 && s.extraversion > 0.65,
    statement: "Excellent listener who ensures all voices are heard in a group setting." },

  // Low P + Low F — fast, flexible
  { test: s => s.patience < 0.40 && s.formality < 0.45,
    statement: "Moves fast and adapts on the fly — thrives in fast-changing environments with minimal rules." },
  { test: s => s.patience < 0.40 && s.formality < 0.45,
    statement: "Improvises effectively when plans break down — does not get stuck waiting for instructions." },

  // Low D + Low E — independent, reserved
  { test: s => s.dominance < 0.45 && s.extraversion < 0.40,
    statement: "Works best independently with clear expectations and minimal social interaction." },
  { test: s => s.dominance < 0.45 && s.extraversion < 0.40,
    statement: "Quiet and focused — produces high-quality work when given space and time." },

  // Low D + High F — dutiful process follower
  { test: s => s.dominance < 0.45 && s.formality > 0.70,
    statement: "Conscientiously follows procedures and respects organizational hierarchy." },
  { test: s => s.dominance < 0.45 && s.formality > 0.70,
    statement: "Dependable executor who needs clear guidelines rather than open-ended direction." },

  // High D alone — standalone dominant traits
  { test: s => s.dominance > 0.75,
    statement: "Expects to influence outcomes directly — will push back on decisions they disagree with." },

  // High E alone
  { test: s => s.extraversion > 0.80,
    statement: "Naturally draws energy from people — extended isolation will impact engagement and output." },

  // High P alone
  { test: s => s.patience > 0.75,
    statement: "Calm under pressure — does not panic or make rash decisions when things go wrong." },

  // High F alone
  { test: s => s.formality > 0.80,
    statement: "Values accuracy and thoroughness — will not sign off on work they consider incomplete." },

  // Low D alone
  { test: s => s.dominance < 0.35,
    statement: "Prefers collaborative decision-making — unlikely to override others or assert authority." },

  // Low E alone
  { test: s => s.extraversion < 0.35,
    statement: "Reserved communicator — shares information on a need-to-know basis." },

  // Low P alone
  { test: s => s.patience < 0.30,
    statement: "High internal urgency — gets frustrated by delays and unnecessary waiting." },

  // Low F alone
  { test: s => s.formality < 0.35,
    statement: "Highly adaptable — prefers to figure things out on the fly rather than follow rigid processes." },
]

export function generateStrongestBehaviors(scores: Scores): string[] {
  const matched = BEHAVIOR_RULES
    .filter(rule => rule.test(scores))
    .map(rule => rule.statement)

  // Deduplicate
  const unique = [...new Set(matched)]

  // Return 5-7 most relevant (first matches are the most specific combos)
  return unique.slice(0, 7)
}

// ---------------------------------------------------------------------------
//  2. BEHAVIORAL SUMMARY — template-driven paragraph
// ---------------------------------------------------------------------------

function dominantStyle(s: Scores): string {
  // Identify top 2 dimensions
  const dims = [
    { key: 'dominance', label: 'dominance', score: s.dominance },
    { key: 'extraversion', label: 'extraversion', score: s.extraversion },
    { key: 'patience', label: 'patience', score: s.patience },
    { key: 'formality', label: 'formality', score: s.formality },
  ].sort((a, b) => b.score - a.score)

  const top = dims[0].key
  const second = dims[1].key

  if (top === 'dominance' && second === 'extraversion')
    return "This individual leads with authority and social energy, combining a drive to take charge with the ability to influence through communication."
  if (top === 'dominance' && second === 'formality')
    return "This individual leads with a combination of decisiveness and discipline, setting high standards and holding themselves and others to account."
  if (top === 'dominance' && second === 'patience')
    return "This individual leads with a steady, authoritative presence, combining decisiveness with the patience to see things through."
  if (top === 'extraversion' && second === 'dominance')
    return "This individual leads with relationships and influence, combining social energy with the confidence to drive outcomes."
  if (top === 'extraversion' && second === 'patience')
    return "This individual is relationship-focused and steady, building lasting connections through patience and genuine warmth."
  if (top === 'extraversion' && second === 'formality')
    return "This individual combines social energy with attention to detail, communicating openly while maintaining high standards of work."
  if (top === 'patience' && second === 'formality')
    return "This individual operates with consistency and precision, preferring stable environments where they can deliver reliable, high-quality work."
  if (top === 'patience' && second === 'extraversion')
    return "This individual is a steady, people-oriented contributor who builds trust through reliability and genuine connection."
  if (top === 'patience' && second === 'dominance')
    return "This individual combines stability with quiet authority, leading through reliability rather than force."
  if (top === 'formality' && second === 'patience')
    return "This individual is process-driven and methodical, delivering thorough, accurate work with consistency."
  if (top === 'formality' && second === 'dominance')
    return "This individual combines precision with assertiveness, driving quality outcomes through standards and accountability."
  if (top === 'formality' && second === 'extraversion')
    return "This individual brings structure and social awareness together, maintaining standards while communicating effectively across teams."

  return "This individual brings a balanced behavioral profile, adapting their approach based on the demands of the situation."
}

function workWithOthers(s: Scores): string {
  if (s.extraversion > 0.65 && s.dominance > 0.65)
    return "In team settings, they naturally step into a leadership role and use communication to drive alignment."
  if (s.extraversion > 0.65 && s.dominance < 0.45)
    return "They excel in collaborative settings, focusing on building consensus and maintaining team harmony."
  if (s.extraversion < 0.45 && s.dominance > 0.65)
    return "They prefer to lead through authority and expertise rather than social influence, communicating directly and efficiently."
  if (s.extraversion < 0.45 && s.dominance < 0.45)
    return "They work best independently or in small groups, contributing through focused effort rather than group dynamics."
  if (s.extraversion > 0.55)
    return "They are comfortable in group settings and contribute actively to team discussions and collaboration."
  return "They tend to be selective about social engagement, contributing when they have something substantive to add."
}

function paceResponse(s: Scores): string {
  if (s.patience > 0.70)
    return "Under pressure, they remain calm and methodical, maintaining their standard approach rather than reacting impulsively."
  if (s.patience > 0.50)
    return "They handle pressure well, balancing urgency with thoughtfulness when conditions require it."
  if (s.patience > 0.35)
    return "They operate at a moderate-to-fast pace, capable of patience but naturally inclined toward action."
  return "They thrive under time pressure and urgency, preferring to move quickly and course-correct rather than wait for perfect information."
}

function processApproach(s: Scores): string {
  if (s.formality > 0.75)
    return "Their approach to process and rules is rigorous — they follow established procedures carefully and expect documentation to be thorough."
  if (s.formality > 0.55)
    return "They respect process and structure, following rules when they make sense while maintaining some flexibility."
  if (s.formality > 0.40)
    return "They balance process with pragmatism, following rules when they add value but improvising when they don't."
  return "They prefer flexibility over structure, adapting their approach to fit the situation rather than following rigid processes."
}

function motivation(s: Scores): string {
  if (s.dominance > 0.70 && s.patience < 0.40)
    return "They are most motivated by challenging goals, competitive environments, and visible impact."
  if (s.extraversion > 0.70 && s.dominance < 0.50)
    return "They are most motivated by team success, recognition, and opportunities to help others."
  if (s.patience > 0.65 && s.formality > 0.65)
    return "They are most motivated by stability, clear expectations, and the opportunity to do quality work."
  if (s.dominance > 0.60 && s.formality > 0.65)
    return "They are most motivated by responsibility, measurable outcomes, and the authority to improve systems."
  if (s.extraversion > 0.65)
    return "They are most motivated by collaboration, variety in their daily interactions, and positive team energy."
  if (s.formality > 0.65)
    return "They are most motivated by mastery, accuracy, and environments that value thoroughness."
  if (s.patience > 0.55)
    return "They are most motivated by consistency, team stability, and predictable working conditions."
  return "They are most motivated by new challenges, fast-paced environments, and freedom to operate independently."
}

function watchFor(s: Scores): string {
  if (s.dominance > 0.75 && s.patience < 0.35)
    return "Watch for impatience with slower-paced colleagues and a tendency to push through decisions without sufficient input."
  if (s.extraversion > 0.75 && s.formality < 0.40)
    return "Watch for commitments made in conversation that aren't captured in writing, and a tendency to deprioritize documentation."
  if (s.patience > 0.70 && s.dominance < 0.40)
    return "Watch for difficulty speaking up when they disagree, and a reluctance to push back on unreasonable requests."
  if (s.formality > 0.80 && s.patience > 0.65)
    return "Watch for resistance to change and a tendency to over-invest in process when speed is what's needed."
  if (s.dominance > 0.65 && s.extraversion < 0.40)
    return "Watch for a communication style that others may perceive as blunt or cold, especially in team settings."
  if (s.extraversion > 0.65 && s.patience > 0.60)
    return "Watch for consensus-seeking behavior that may slow decision-making when urgency is required."
  if (s.formality < 0.40 && s.patience < 0.40)
    return "Watch for a tendency to move fast and skip steps, which can create rework and compliance gaps."
  return "Watch for stress responses that emerge when the work environment conflicts with their natural behavioral tendencies."
}

export function generateBehavioralSummary(scores: Scores, name: string): string {
  // Use first name only
  const firstName = name?.split(' ')[0] || 'This individual'
  const pronoun = 'they'
  const possessive = 'their'

  const s1 = dominantStyle(scores).replace('This individual', firstName)
  const s2 = workWithOthers(scores).replace(/^They /, `${firstName} `).replace(/^In team/, `In team`)
  const s3 = paceResponse(scores).replace(/^They /, `When it comes to pace, ${pronoun} `)
  const s4 = processApproach(scores).replace(/^Their /, `${firstName.endsWith('s') ? firstName + "'" : firstName + "'s"} `)
  const s5 = motivation(scores).replace(/^They /, `${firstName} `)
  const s6 = watchFor(scores).replace(/^Watch /, `Watch `)

  return `${s1} ${s2} ${s3} ${s4} ${s5} ${s6}`
}

// ---------------------------------------------------------------------------
//  3. MANAGEMENT STRATEGIES — derived from profile traps
// ---------------------------------------------------------------------------

// Map of trap patterns → management strategies
const TRAP_STRATEGIES: { pattern: RegExp; strategy: string }[] = [
  { pattern: /steamroll|dominating|override/i,
    strategy: "Create structured touchpoints where team input is explicitly solicited before decisions are made." },
  { pattern: /too fast|moving too fast|tension/i,
    strategy: "Set clear milestones and check-in points to balance their drive with team readiness." },
  { pattern: /process|documentation|undervalues/i,
    strategy: "Pair them with a detail-oriented team member and make documentation a shared responsibility, not a solo burden." },
  { pattern: /overpromise|overcommit/i,
    strategy: "Review commitments together weekly — help them manage scope by asking 'what are you saying no to?'" },
  { pattern: /bored|repetitive/i,
    strategy: "Build variety into their role and give them new problems to solve regularly." },
  { pattern: /harsh|cold|blunt/i,
    strategy: "Coach on delivery: schedule brief prep before difficult conversations so tone matches intent." },
  { pattern: /burnout|expectations/i,
    strategy: "Monitor their direct reports' morale — their high standards can create invisible pressure on the team." },
  { pattern: /many directions|pulled/i,
    strategy: "Help them prioritize by defining their top 3 responsibilities clearly and protecting their time." },
  { pattern: /avoid.*conflict|conflict.*avoid/i,
    strategy: "Give explicit permission and frameworks for escalating issues — make it safe to surface problems early." },
  { pattern: /delegate/i,
    strategy: "Start with small delegation wins — assign one task per week they'd normally own, and debrief outcomes." },
  { pattern: /difficult conversations|unpopular decisions/i,
    strategy: "Role-play tough conversations in advance so they build confidence delivering direct feedback." },
  { pattern: /consensus|slow.*down/i,
    strategy: "Set decision deadlines — 'we need a call by Thursday' — to prevent endless consensus-building." },
  { pattern: /over-communicate/i,
    strategy: "Channel their communication energy into structured updates (weekly report, daily standup) rather than ad-hoc messages." },
  { pattern: /prioritize ruthlessly/i,
    strategy: "Use a simple priority framework (urgent/important matrix) and review it together weekly." },
  { pattern: /chaos|structure/i,
    strategy: "Assign a process-oriented partner from day one — they bring the energy, the partner brings the system." },
  { pattern: /follow-through|launch/i,
    strategy: "After the kickoff phase, transition project ownership to a steady operator and move them to the next initiative." },
  { pattern: /resist.*change|slow to adapt|new approaches/i,
    strategy: "Introduce changes gradually with clear rationale — give them time to process before expecting adoption." },
  { pattern: /need.*direction/i,
    strategy: "Provide detailed written expectations for the first 30 days — they thrive with clarity, not ambiguity." },
  { pattern: /rigid|inflexible|inefficiency/i,
    strategy: "Frame process exceptions as temporary, documented deviations — this satisfies their need for rules while allowing flexibility." },
  { pattern: /frustrate.*fast.*moving|fast.*teams/i,
    strategy: "Set expectations with the team about their pace and communication style — reframe precision as an asset, not a bottleneck." },
  { pattern: /analysis paralysis/i,
    strategy: "Set time-boxed decision windows — 'give me your best recommendation by end of day with what you know now.'" },
  { pattern: /perceive.*inflexible/i,
    strategy: "Help them separate negotiable from non-negotiable requirements, and communicate flexibility on the former." },
  { pattern: /overlooked|low visibility|self-promotion/i,
    strategy: "Proactively highlight their contributions in team meetings — they won't advocate for themselves." },
  { pattern: /push back|should push/i,
    strategy: "Create a standing 1:1 where they can raise concerns privately before they become problems." },
  { pattern: /redirect|resist collaboration/i,
    strategy: "Respect their expertise but set clear expectations about when collaboration is required vs. optional." },
  { pattern: /taken advantage/i,
    strategy: "Watch for scope creep in their workload — others may default difficult tasks to them because they won't say no." },
  { pattern: /hide problems|defer/i,
    strategy: "Ask direct questions in 1:1s: 'What's one thing that's not working right now?' — they won't volunteer it." },
  { pattern: /change feels threatening/i,
    strategy: "When changes are coming, give them advance notice and explain the 'why' thoroughly before the 'what.'" },
  { pattern: /people signals|miss.*people/i,
    strategy: "Schedule monthly skip-level check-ins with their team to catch engagement issues they may not notice." },
  { pattern: /strong ops support/i,
    strategy: "Invest in a strong operations partner who can translate their vision into executable plans." },
  { pattern: /communication.*cold|reads as cold/i,
    strategy: "Encourage periodic informal check-ins with team members — a brief 'how are things going?' goes a long way." },
]

export function generateManagementStrategies(profile: ReferenceProfile): string[] {
  const strategies: string[] = []

  for (const trap of profile.traps) {
    for (const { pattern, strategy } of TRAP_STRATEGIES) {
      if (pattern.test(trap) && !strategies.includes(strategy)) {
        strategies.push(strategy)
        break // One strategy per trap
      }
    }
  }

  // If we got fewer than 3, add generic strategies based on profile group
  if (strategies.length < 3) {
    const generic: Record<string, string[]> = {
      field_command: [
        "Give them ownership of outcomes early — they perform best when they have clear authority.",
        "Establish regular but brief check-ins to maintain alignment without micromanaging.",
      ],
      people_influence: [
        "Create social connections in the first week — introduce them to key stakeholders personally.",
        "Give them opportunities to present and communicate early to build confidence in the new role.",
      ],
      process_structure: [
        "Provide detailed onboarding documentation and clear standard operating procedures.",
        "Introduce changes gradually and explain the reasoning behind each one.",
      ],
      strategic_drive: [
        "Clearly define success metrics and give them a 90-day plan with measurable milestones.",
        "Provide access to data and systems quickly — they want to understand how things work.",
      ],
    }

    const groupStrategies = generic[profile.group] || []
    for (const s of groupStrategies) {
      if (!strategies.includes(s) && strategies.length < 5) {
        strategies.push(s)
      }
    }
  }

  return strategies.slice(0, 5)
}

// ---------------------------------------------------------------------------
//  4. RESPONSE LEVEL descriptor
// ---------------------------------------------------------------------------

export function responseCountDescriptor(count: number): string {
  if (count < 15) return 'Low — reserved, precise thinker'
  if (count <= 35) return 'Moderate — typical range'
  return 'High — expressive, verbal communicator'
}
