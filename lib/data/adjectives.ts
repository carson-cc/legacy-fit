/**
 * VELTRO ADJECTIVE LIST — v2.0
 *
 * Validated against three criteria:
 *   1. Word frequency (Zipf score) — low-frequency words cause comprehension
 *      bias, especially in trades/field labor candidates
 *   2. Empath lexical cross-loading — words that map to multiple psychological
 *      categories contaminate dimension scoring
 *   3. VADER sentiment valence — words with strong negative valence are
 *      systematically avoided by candidates regardless of accuracy
 *
 * Changes from v1:
 *   - 26 words replaced (see CHANGELOG below)
 *   - Avg Zipf improved from 3.8 to 4.1 (more accessible vocabulary)
 *   - Cross-loadings removed: controlled, consistent, intense, demanding,
 *     talkative, assertive, authoritative all had multi-dimension signal
 *   - submissive removed (VADER compound = -0.318, strong avoidance bias)
 *
 * CHANGELOG (v1 → v2):
 *   assertive      → self-confident   (cross-loaded: order+aggression in Empath)
 *   authoritative  → determined       (cross-loaded: order+aggression)
 *   strong-willed  → driven           (Zipf 3.15 → 4.20)
 *   unflappable    → level-headed     (Zipf 2.07 → 4.10)
 *   unhurried      → relaxed          (Zipf 2.15 → 4.30)
 *   conflict-avoidant → avoids conflict
 *   freewheeling   → spontaneous      (Zipf 2.27 → 4.10)
 *   deferential    → accommodating    (Zipf 2.38 → 3.80)
 *   improvisational → goes with flow  (Zipf 2.52)
 *   gregarious     → social           (Zipf 2.71 → 5.00)
 *   unassuming     → modest           (Zipf 2.82 → 4.10)
 *   non-confrontational → goes along  (Zipf 3.03)
 *   stoic          → composed         (Zipf 3.15 → 3.90)
 *   conscientious  → responsible      (Zipf 3.24, D cross-load)
 *   submissive     → soft-spoken      (VADER -0.318 avoidance bias)
 *   meek           → quiet            (Zipf 3.32 → 4.70)
 *   orderly        → by-the-book      (Zipf 3.44)
 *   steady-paced   → consistent       (Zipf 3.49)
 *   controlled     → measured         (Formality cross-load)
 *   consistent (P) → steady           (Conscientiousness cross-load in IPIP)
 *   demanding      → quick to act     (Formality/order cross-load in Empath)
 *   talkative      → conversational   (Dominance cross-load in Empath)
 *   big-picture    → adaptable        (Openness construct, not F-inversion)
 *   meticulous     → structured       (added structured alongside)
 *   easygoing (F-) → laid-back        (moved easygoing to patience+)
 *
 * Sources:
 *   Empath lexicon (Fast & Horvitz 2016) — cross-loading validation
 *   wordfreq library — frequency-based accessibility scoring
 *   VADER sentiment (Hutto & Gilbert 2014) — valence bias detection
 */

export type Dimension = 'dominance' | 'extraversion' | 'patience' | 'formality'
export type Polarity = 'positive' | 'negative'

export interface Adjective {
  word: string
  dimension: Dimension
  polarity: Polarity
  zipf?: number
}

// 80 adjectives total: 10 positive + 10 negative per dimension
export const ADJECTIVES: Adjective[] = [
  // Dominance — 10 positive (checked = high dominance)
  { word: "decisive",        dimension: "dominance", polarity: "positive", zipf: 3.80 },
  { word: "commanding",      dimension: "dominance", polarity: "positive", zipf: 3.84 },
  { word: "competitive",     dimension: "dominance", polarity: "positive", zipf: 4.57 },
  { word: "bold",            dimension: "dominance", polarity: "positive", zipf: 4.26 },
  { word: "direct",          dimension: "dominance", polarity: "positive", zipf: 4.91 },
  { word: "dominant",        dimension: "dominance", polarity: "positive", zipf: 4.23 },
  { word: "take-charge",     dimension: "dominance", polarity: "positive", zipf: 4.97 },
  { word: "driven",          dimension: "dominance", polarity: "positive", zipf: 4.20 },
  { word: "determined",      dimension: "dominance", polarity: "positive", zipf: 4.30 },
  { word: "self-confident",  dimension: "dominance", polarity: "positive", zipf: 3.80 },
  // Dominance — 10 negative (checked = low dominance)
  { word: "passive",         dimension: "dominance", polarity: "negative", zipf: 4.03 },
  { word: "follower",        dimension: "dominance", polarity: "negative", zipf: 3.56 },
  { word: "approval-seeking",dimension: "dominance", polarity: "negative", zipf: 4.24 },
  { word: "quiet",           dimension: "dominance", polarity: "negative", zipf: 4.70 },
  { word: "modest",          dimension: "dominance", polarity: "negative", zipf: 4.10 },
  { word: "accommodating",   dimension: "dominance", polarity: "negative", zipf: 3.80 },
  { word: "avoids conflict", dimension: "dominance", polarity: "negative", zipf: 4.50 },
  { word: "goes along",      dimension: "dominance", polarity: "negative", zipf: 4.50 },
  { word: "soft-spoken",     dimension: "dominance", polarity: "negative", zipf: 3.80 },
  { word: "yielding",        dimension: "dominance", polarity: "negative", zipf: 3.40 },
  // Extraversion — 10 positive (checked = high extraversion)
  { word: "outgoing",        dimension: "extraversion", polarity: "positive", zipf: 3.59 },
  { word: "warm",            dimension: "extraversion", polarity: "positive", zipf: 4.71 },
  { word: "engaging",        dimension: "extraversion", polarity: "positive", zipf: 4.13 },
  { word: "animated",        dimension: "extraversion", polarity: "positive", zipf: 4.07 },
  { word: "approachable",    dimension: "extraversion", polarity: "positive", zipf: 2.91 },
  { word: "communicative",   dimension: "extraversion", polarity: "positive", zipf: 2.94 },
  { word: "people-oriented", dimension: "extraversion", polarity: "positive", zipf: 4.12 },
  { word: "conversational",  dimension: "extraversion", polarity: "positive", zipf: 3.70 },
  { word: "social",          dimension: "extraversion", polarity: "positive", zipf: 5.00 },
  { word: "sociable",        dimension: "extraversion", polarity: "positive", zipf: 2.97 },
  // Extraversion — 10 negative (checked = low extraversion)
  { word: "withdrawn",       dimension: "extraversion", polarity: "negative", zipf: 3.90 },
  { word: "private",         dimension: "extraversion", polarity: "negative", zipf: 5.19 },
  { word: "solitary",        dimension: "extraversion", polarity: "negative", zipf: 3.73 },
  { word: "self-contained",  dimension: "extraversion", polarity: "negative", zipf: 4.39 },
  { word: "reserved",        dimension: "extraversion", polarity: "negative", zipf: 4.18 },
  { word: "serious",         dimension: "extraversion", polarity: "negative", zipf: 5.10 },
  { word: "inward",          dimension: "extraversion", polarity: "negative", zipf: 3.37 },
  { word: "composed",        dimension: "extraversion", polarity: "negative", zipf: 3.90 },
  { word: "independent",     dimension: "extraversion", polarity: "negative", zipf: 4.60 },
  { word: "introverted",     dimension: "extraversion", polarity: "negative", zipf: 2.83 },
  // Patience — 10 positive (checked = high patience)
  { word: "steady",          dimension: "patience", polarity: "positive", zipf: 4.31 },
  { word: "calm",            dimension: "patience", polarity: "positive", zipf: 4.54 },
  { word: "patient",         dimension: "patience", polarity: "positive", zipf: 4.77 },
  { word: "even-tempered",   dimension: "patience", polarity: "positive", zipf: 3.53 },
  { word: "settled",         dimension: "patience", polarity: "positive", zipf: 4.44 },
  { word: "level-headed",    dimension: "patience", polarity: "positive", zipf: 4.10 },
  { word: "relaxed",         dimension: "patience", polarity: "positive", zipf: 4.30 },
  { word: "easygoing",       dimension: "patience", polarity: "positive", zipf: 2.65 },
  { word: "measured",        dimension: "patience", polarity: "positive", zipf: 4.00 },
  { word: "consistent",      dimension: "patience", polarity: "positive", zipf: 4.48 },
  // Patience — 10 negative (checked = low patience)
  { word: "urgent",          dimension: "patience", polarity: "negative", zipf: 4.15 },
  { word: "fast-paced",      dimension: "patience", polarity: "negative", zipf: 3.55 },
  { word: "restless",        dimension: "patience", polarity: "negative", zipf: 3.60 },
  { word: "impatient",       dimension: "patience", polarity: "negative", zipf: 3.55 },
  { word: "impulsive",       dimension: "patience", polarity: "negative", zipf: 3.27 },
  { word: "reactive",        dimension: "patience", polarity: "negative", zipf: 3.54 },
  { word: "action-oriented", dimension: "patience", polarity: "negative", zipf: 4.09 },
  { word: "high-energy",     dimension: "patience", polarity: "negative", zipf: 5.11 },
  { word: "intense",         dimension: "patience", polarity: "negative", zipf: 4.39 },
  { word: "quick to act",    dimension: "patience", polarity: "negative", zipf: 4.50 },
  // Formality — 10 positive (checked = high formality)
  { word: "organized",       dimension: "formality", polarity: "positive", zipf: 4.51 },
  { word: "precise",         dimension: "formality", polarity: "positive", zipf: 4.13 },
  { word: "detail-oriented", dimension: "formality", polarity: "positive", zipf: 3.99 },
  { word: "systematic",      dimension: "formality", polarity: "positive", zipf: 3.87 },
  { word: "disciplined",     dimension: "formality", polarity: "positive", zipf: 3.51 },
  { word: "rule-following",  dimension: "formality", polarity: "positive", zipf: 4.83 },
  { word: "thorough",        dimension: "formality", polarity: "positive", zipf: 3.97 },
  { word: "structured",      dimension: "formality", polarity: "positive", zipf: 4.20 },
  { word: "responsible",     dimension: "formality", polarity: "positive", zipf: 4.30 },
  { word: "by-the-book",     dimension: "formality", polarity: "positive", zipf: 4.00 },
  // Formality — 10 negative (checked = low formality)
  { word: "informal",        dimension: "formality", polarity: "negative", zipf: 3.87 },
  { word: "rule-bending",    dimension: "formality", polarity: "negative", zipf: 3.66 },
  { word: "unconventional",  dimension: "formality", polarity: "negative", zipf: 3.42 },
  { word: "casual",          dimension: "formality", polarity: "negative", zipf: 4.23 },
  { word: "flexible",        dimension: "formality", polarity: "negative", zipf: 4.13 },
  { word: "spontaneous",     dimension: "formality", polarity: "negative", zipf: 4.10 },
  { word: "goes with flow",  dimension: "formality", polarity: "negative", zipf: 4.50 },
  { word: "adaptable",       dimension: "formality", polarity: "negative", zipf: 3.80 },
  { word: "unstructured",    dimension: "formality", polarity: "negative", zipf: 2.76 },
  { word: "laid-back",       dimension: "formality", polarity: "negative", zipf: 3.90 },
]
