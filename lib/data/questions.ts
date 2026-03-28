import type { Dimension } from './adjectives'

export const INTERVIEW_QUESTIONS: Record<Dimension, { too_low: string[]; too_high: string[] }> = {
  dominance: {
    too_low: [
      "Tell me about a time you had to take control of a situation no one else was managing.",
      "Describe a moment where you pushed back on a decision you disagreed with.",
      "How do you handle it when your team isn't following your direction?",
      "Walk me through a time you had to make a call that others disagreed with.",
    ],
    too_high: [
      "Tell me about a time you had to follow someone else's lead even when you disagreed.",
      "How do you make sure you're getting input from your team before making decisions?",
      "Describe a situation where slowing down and listening changed your approach.",
      "How do you respond when a client overrides your recommendation?",
    ],
  },
  extraversion: {
    too_low: [
      "How do you build relationships with new clients or team members you've never met?",
      "Walk me through how you communicate project updates to a large group.",
      "Tell me about a time you had to rally a team that was disengaged.",
      "How do you handle situations that require a lot of back-and-forth with multiple stakeholders?",
    ],
    too_high: [
      "How do you approach work that requires deep focus with minimal interaction?",
      "Tell me about a time you had to hold back and let others drive a conversation.",
      "How do you handle long stretches of independent work without a team around?",
      "Describe a time when working alone led to a better outcome than working with a group.",
    ],
  },
  patience: {
    too_low: [
      "Tell me about a project that took much longer than expected. How did you handle it?",
      "Describe a time you had to deal with repeated setbacks on the same issue.",
      "How do you stay composed when a client or subcontractor keeps changing direction?",
      "Walk me through a situation where you had to slow down to get it right.",
    ],
    too_high: [
      "Tell me about a time you had to make a fast decision with incomplete information.",
      "How do you respond when a project suddenly shifts priority and you need to move immediately?",
      "Describe a situation where urgency required you to cut a process short.",
      "How do you push yourself and your team when the pace needs to pick up?",
    ],
  },
  formality: {
    too_low: [
      "Walk me through how you document work on an active project.",
      "Tell me about a time a lack of process caused a problem. What did you do?",
      "How do you make sure compliance or safety requirements don't get missed on a busy site?",
      "Describe your approach to keeping records and reports current under pressure.",
    ],
    too_high: [
      "Tell me about a time you had to improvise because the plan fell apart.",
      "How do you handle situations where the rules don't quite fit the reality on the ground?",
      "Describe a time you made a fast call that bypassed your normal process.",
      "How do you adapt when a client wants to move faster than your standard workflow allows?",
    ],
  },
}
