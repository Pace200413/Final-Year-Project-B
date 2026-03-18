/**
 * Deterministic safety/scope guard for the campus assistant.
 * Runs before interpretation, retrieval, grounding, or OpenAI.
 * Used by: src/app/api/assistant/route.ts
 */

import type { AssistantResponse } from "@/lib/assistant/types";

export type SafetyCategory =
  | "SAFE_IN_DOMAIN"
  | "SAFE_OUT_OF_SCOPE"
  | "ABUSIVE"
  | "SPAM"
  | "PROMPT_ATTACK";

function normalizeForSafety(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/* -----------------------------------------------------------------------------
   Prompt injection / jailbreak phrases (substring match on normalized message)
----------------------------------------------------------------------------- */
const PROMPT_ATTACK_PHRASES = [
  "ignore previous instructions",
  "ignore all previous",
  "disregard previous",
  "forget everything",
  "reveal system prompt",
  "show system prompt",
  "show your instructions",
  "developer mode",
  "jailbreak",
  "act as system",
  "you are now",
  "pretend you are",
  "new instructions:",
  "override",
  "bypass your",
  "ignore your guidelines",
  "from now on you",
];

/* -----------------------------------------------------------------------------
   Abusive / profanity (whole-word or standalone, normalized)
----------------------------------------------------------------------------- */
const ABUSIVE_WORDS = new Set([
  "stupid",
  "idiot",
  "dumb",
  "moron",
  "shut up",
  "shutup",
  "hate you",
  "kill yourself",
  "kys",
  "die",
  "worst",
  "useless",
  "pathetic",
  "trash",
  "suck",
  "sucks",
  "fuck",
  "fucking",
  "fck",
  "fcking",
  "shit",
  "bullshit",
  "damn",
  "ass",
  "bastard",
  "bitch",
  "crap",
]);

/* -----------------------------------------------------------------------------
   Out-of-scope topic signals (message is about these, not campus)
----------------------------------------------------------------------------- */
const OUT_OF_SCOPE_SIGNALS = [
  /\b(recipe|recipes|cooking|baking|ingredients)\b/,
  /\b(football|soccer|nba|premier league|match score)\b/,
  /\b(movie|film|netflix|actor|actress)\b/,
  /\b(video game|gaming|playstation|xbox|nintendo)\b/,
  /\b(political|election|vote|president|minister)\b/,
  /\b(medical advice|diagnose|prescription|medicine for)\b/,
  /\b(legal advice|sue|lawsuit|lawyer)\b/,
  /\b(relationship advice|dating|breakup)\b/,
  /\b(weather forecast|tomorrow rain)\b/,
  /\b(stock market|invest|crypto|bitcoin)\b/,
  /\b(joke|tell me a joke|funny)\b/,
  /\b(poem|write a poem|song lyrics)\b/,
];

/**
 * Classify message into a safety category. Rule-based only.
 * Order: PROMPT_ATTACK → ABUSIVE → SPAM → SAFE_OUT_OF_SCOPE → SAFE_IN_DOMAIN.
 */
export function classifyMessage(message: string): SafetyCategory {
  const raw = (message || "").trim();
  if (!raw) return "SAFE_IN_DOMAIN";

  const q = normalizeForSafety(raw);

  // 1. Prompt injection / jailbreak
  for (const phrase of PROMPT_ATTACK_PHRASES) {
    if (q.includes(phrase)) return "PROMPT_ATTACK";
  }

  // 2. Abusive / profanity (word boundary or as whole phrase)
  const words = q.split(/\s+/);
  for (const word of words) {
    const w = word.replace(/[^a-z]/g, "");
    if (ABUSIVE_WORDS.has(w) || ABUSIVE_WORDS.has(word)) return "ABUSIVE";
  }
  if (ABUSIVE_WORDS.has(q)) return "ABUSIVE";

  // 3. Spam: repeated character, repeated word, or long run of non-space
  if (raw.length >= 4 && /^(.)\1{4,}$/.test(q.replace(/\s/g, ""))) return "SPAM";
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length >= 3) {
    const first = tokens[0];
    if (tokens.slice(0, 5).every((t) => t === first)) return "SPAM";
  }
  if (raw.length > 80 && !/\s/.test(raw)) return "SPAM";

  // 4. Clearly out-of-scope (strong non-campus topic signal)
  for (const re of OUT_OF_SCOPE_SIGNALS) {
    if (re.test(q)) return "SAFE_OUT_OF_SCOPE";
  }

  return "SAFE_IN_DOMAIN";
}

/** Chips offered when the assistant can't help or user goes off-topic — campus-only. */
const HELPFUL_CAMPUS_CHIPS = [
  { label: "Find a building", targetEntryId: "navigate" },
  { label: "Visa help", targetEntryId: "visa_overview" },
  { label: "Fees", targetEntryId: "fees_overview" },
  { label: "Wi-Fi", targetEntryId: "wifi_overview" },
  { label: "Safety", targetEntryId: "campus_security_contact" },
  { label: "Student support", targetEntryId: "sic_contact" },
];

/**
 * Build the AssistantResponse for a safety early-exit.
 * currentTopic is always null (no topic inheritance).
 */
export function getSafetyResponse(category: SafetyCategory): AssistantResponse {
  switch (category) {
    case "ABUSIVE":
      return {
        reply: "I’m here for campus help only: finding places, Wi-Fi, fees, visa, and support. Ask me something on those and I'll help.",
        sources: [],
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
        suggestedChips: HELPFUL_CAMPUS_CHIPS,
        currentTopic: null,
      };

    case "SPAM":
      return {
        reply: "I didn’t get that. I can help with campus navigation, Wi-Fi, fees, visa, and support — pick one below.",
        sources: [],
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
        suggestedChips: HELPFUL_CAMPUS_CHIPS,
        currentTopic: null,
      };

    case "PROMPT_ATTACK":
      return {
        reply: "I only answer campus questions: finding places, Wi‑Fi, fees, visa, safety, and support. What do you need?",
        sources: [],
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
        suggestedChips: HELPFUL_CAMPUS_CHIPS,
        currentTopic: null,
      };

    case "SAFE_OUT_OF_SCOPE":
      return {
        reply: "That's outside what I cover. I'm for campus only: directions, Wi-Fi, fees, visa, and support. Pick a topic below.",
        sources: [],
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
        suggestedChips: HELPFUL_CAMPUS_CHIPS,
        currentTopic: null,
      };

    default:
      // SAFE_IN_DOMAIN: caller should not use getSafetyResponse; continue to interpret/ground
      return {
        reply: "",
        sources: [],
        actions: [],
        currentTopic: null,
      };
  }
}
