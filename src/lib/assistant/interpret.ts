/**
 * Interpretation logic for the campus assistant: heuristic + optional OpenAI.
 * Used by: src/app/api/assistant/route.ts
 */

import OpenAI from "openai";

import type { Goal, HistoryItem, Interpretation, Topic } from "@/lib/assistant/types";
import { NAV_DESTINATIONS } from "@/data/navigation-destinations";
import type { NavDestination } from "@/data/navigation-destinations";

/* -----------------------------------------------------------------------------
   Text normalization (used by interpretation and exported for grounding)
----------------------------------------------------------------------------- */

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\bwi[\s-]?fi\b/g, "wifi")
    .replace(/\bsign in\b/g, "login")
    .replace(/\s+/g, " ")
    .trim();
}

/* -----------------------------------------------------------------------------
   Helpers used only by heuristic interpretation
----------------------------------------------------------------------------- */

function getNameFromMessage(message: string): string | null {
  const match = message.match(/\b(?:i am|i'm|im)\s+([a-z][a-z' -]{1,30})/i);
  if (!match) return null;

  const raw = match[1].trim();
  return raw
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function hasGreetingWord(text: string): boolean {
  const q = normalize(text);
  return /^(hi|hello|hey|hiii)\b/.test(q);
}

function isPureGreeting(text: string): boolean {
  const q = normalize(text);
  return /^(hi|hello|hey|hiii)(?:\s+(?:i am|i'm|im)\s+[a-z][a-z' -]{1,30})?$/.test(q);
}

function isCapabilityQuestion(text: string): boolean {
  const q = normalize(text);
  return (
    q === "help" ||
    q === "help me" ||
    /^what can (you|u) do(?: for me)?\??$/.test(q)
  );
}

/* -----------------------------------------------------------------------------
   Follow-up detection: avoid topic carry-over for vague/abusive/short noise.
   Valid follow-up = clear question signal + topic relevance, or explicit phrase.
----------------------------------------------------------------------------- */

/** Bare phrases that must NOT inherit the previous topic (exact or with optional ?) */
const FOLLOW_UP_BLOCKLIST = new Set([
  "what",
  "how",
  "where",
  "which",
  "why",
  "bro",
  "dude",
  "huh",
  "idk",
  "meh",
  "nothing",
  "whatever",
  "no",
  "yes",
  "ok",
  "okay",
  "and",
  "then",
  "more",
  "nah",
  "nope",
  "yep",
  "cool",
  "k",
  "kk",
  "lol",
  "haha",
]);

/** Phrases that clearly indicate a continuation (substring match on normalized message) */
const FOLLOW_UP_PHRASES = [
  "where is it",
  "where is that",
  "where's it",
  "where's that",
  "where can i find",
  "what documents",
  "what do i need",
  "what do i have to",
  "how much",
  "how do i pay",
  "when is the deadline",
  "when is it due",
  "when do i need to",
  "which one",
  "the first one",
  "the second one",
  "payment method",
  "instalment",
  "instalment plan",
  "deadline",
  "due date",
  "renewal",
  "renew visa",
  "lost passport",
  "documents needed",
  "contact for",
  "email for",
  "phone for",
  "location of",
  "address of",
  "how do i get",
  "directions to",
  "not working",
  "can't connect",
  "setup on",
  "setup for",
];

/** Topic → keywords that indicate the user is still on that topic */
const TOPIC_CONTINUATION_KEYWORDS: Record<Topic, string[]> = {
  fees: ["fee", "fees", "payment", "pay", "deadline", "due", "instalment", "cashier", "finance", "tuition", "transfer", "jompay", "flywire"],
  visa: ["visa", "passport", "renewal", "renew", "documents", "emgs", "insurance", "application", "lost", "cancellation"],
  passport: ["visa", "passport", "renewal", "renew", "documents", "emgs", "insurance", "application", "lost", "cancellation"],
  wifi: ["wifi", "eduroam", "connect", "connection", "phone", "laptop", "mobile", "not working", "password"],
  canvas: ["canvas", "login", "portal", "password"],
  student_portal: ["portal", "login", "student portal"],
  navigation: ["where", "location", "directions", "map", "navigate", "go to", "find", "place", "building"],
  safety: ["security", "emergency", "contact", "phone", "red phone", "smoke", "vaping"],
  research: ["research", "contact", "location", "office", "grant", "hdr"],
  support: ["sic", "contact", "finance", "treasury", "visa", "insurance", "student hq", "service desk"],
  unknown: [],
};

function isBareBlocklisted(q: string): boolean {
  const words = q.replace(/\?+$/, "").trim().split(/\s+/).filter(Boolean);
  if (words.length !== 1) return false;
  return FOLLOW_UP_BLOCKLIST.has(words[0]);
}

function hasFollowUpPhrase(q: string): boolean {
  return FOLLOW_UP_PHRASES.some((phrase) => q.includes(phrase));
}

function hasTopicRelevantKeyword(q: string, topicHint: Topic): string | null {
  const keywords = TOPIC_CONTINUATION_KEYWORDS[topicHint];
  if (!keywords) return null;
  const lower = q.toLowerCase();
  for (const kw of keywords) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

/**
 * True only when the message is a valid continuation of the given topic.
 * Prevents "what", "bro", "you're stupid", etc. from inheriting topic.
 */
function isValidTopicContinuation(message: string, topicHint: Topic): boolean {
  const q = normalize(message);
  if (!q) return false;

  if (isBareBlocklisted(q)) return false;

  if (hasFollowUpPhrase(q)) return true;

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && hasTopicRelevantKeyword(q, topicHint)) return true;

  if (words.length === 1) {
    const w = words[0].replace(/\?+$/, "");
    if (TOPIC_CONTINUATION_KEYWORDS[topicHint]?.some((kw) => w === kw || w.includes(kw))) return true;
  }

  return false;
}

function isFollowUpMessage(text: string): boolean {
  const q = normalize(text);
  if (isBareBlocklisted(q)) return false;
  if (hasFollowUpPhrase(q)) return true;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 6) {
    const questionWord = /^(what|where|when|how|which|why|who|can|do|does|is|are)\b/.test(q);
    if (questionWord) return true;
  }
  return false;
}

function extractExplicitDateISO(message: string): string | null {
  const iso = message.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  const dmy = message.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  const lower = message.toLowerCase();
  const monthNames =
    "(january|february|march|april|may|june|july|august|september|october|november|december)";
  const monthMap: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const first = lower.match(new RegExp(`\\b(\\d{1,2})\\s+${monthNames}\\s+(\\d{4})\\b`));
  if (first) {
    const d = new Date(Number(first[3]), monthMap[first[2]], Number(first[1]));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  const second = lower.match(new RegExp(`\\b${monthNames}\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`));
  if (second) {
    const d = new Date(Number(second[3]), monthMap[second[1]], Number(second[2]));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  return null;
}

function normalizeCurrentTopic(value?: string | null): Topic | null {
  const topic = normalize(value || "");
  if (!topic) return null;

  if (topic === "it") return "wifi";
  if (topic === "wifi") return "wifi";
  if (topic === "canvas") return "canvas";
  if (topic === "student_portal" || topic === "student portal") return "student_portal";
  if (topic === "fees") return "fees";
  if (topic === "visa") return "visa";
  if (topic === "passport") return "passport";
  if (topic === "safety") return "safety";
  if (topic === "research") return "research";
  if (topic === "support") return "support";
  if (topic === "navigation") return "navigation";

  return null;
}

function inferTopicFromHistory(history: HistoryItem[] = []): Topic | null {
  const lastUser = [...history].reverse().find((item) => item.role === "user")?.content || "";
  const q = normalize(lastUser);

  if (/\b(wifi|eduroam|canvas|portal|login|password)\b/.test(q)) return "wifi";
  if (/\b(fee|fees|payment|tuition|finance|instalment)\b/.test(q)) return "fees";
  if (/\b(visa|passport|emgs|eval|val)\b/.test(q)) return "visa";
  if (/\b(security|emergency|safe|exit)\b/.test(q)) return "safety";
  if (/\b(research|grant|hdr)\b/.test(q)) return "research";
  if (/\b(navigate|navigation|map|directions|go to|find a place)\b/.test(q)) return "navigation";

  return null;
}

/* -----------------------------------------------------------------------------
   Low‑information / vague message detection
   Used to short‑circuit OpenAI for fragments like "bro", "what", "ok", "idk".
----------------------------------------------------------------------------- */

function hasCampusKeyword(q: string): boolean {
  return /\b(wifi|eduroam|canvas|portal|login|fee|fees|payment|tuition|visa|passport|security|emergency|safe|research|navigate|navigation|map|building|block|student hq|sic|support|finance|treasury|insurance|event|orientation)\b/.test(
    q
  );
}

export function isLowInformationMessage(
  message: string,
  _history: HistoryItem[] = [],
  _currentTopic?: string | null
): boolean {
  const q = normalize(message);
  if (!q) return true;

  // Single bare words on the blocklist are always low‑information.
  if (isBareBlocklisted(q)) return true;

  const words = q.split(/\s+/).filter(Boolean);

  // Preserve clearly valid follow‑ups like "where is it?", "how much?", etc.
  if (hasFollowUpPhrase(q)) return false;

  // If there is any obvious campus keyword, treat it as meaningful.
  if (hasCampusKeyword(q)) return false;

  // Very short, non‑campus fragments (1–2 tokens, small character count, no digits)
  // are treated as vague noise and should not hit OpenAI.
  if (words.length <= 2 && q.length <= 8 && !/[0-9]/.test(q)) {
    return true;
  }

  return false;
}

/* -----------------------------------------------------------------------------
   Navigation destination matching (used by heuristic and by grounding)
----------------------------------------------------------------------------- */

export function findDestinationMatches(message: string): {
  confident: NavDestination | null;
  partial: NavDestination[];
} {
  const q = normalize(message);

  const matches = NAV_DESTINATIONS.filter((dest) => {
    const values = [dest.key, dest.title, dest.href, ...(dest.aliases || [])].map(normalize);
    return values.some((value) => q === value || q.includes(value) || value.includes(q));
  });

  if (matches.length === 1) {
    return { confident: matches[0], partial: [] };
  }

  if (matches.length > 1) {
    return { confident: null, partial: matches.slice(0, 4) };
  }

  return { confident: null, partial: [] };
}

function hasNavigationSignal(message: string): boolean {
  const q = normalize(message);
  return /\b(navigate|navigation|directions|direction|go to|find a place|campus map|map|where is)\b/.test(q);
}

/* -----------------------------------------------------------------------------
   Heuristic interpretation
----------------------------------------------------------------------------- */

export function heuristicInterpret(
  message: string,
  currentTopic?: string | null,
  history: HistoryItem[] = []
): Interpretation {
  const q = normalize(message);
  const name = getNameFromMessage(message);
  const topicHint = normalizeCurrentTopic(currentTopic) ?? inferTopicFromHistory(history);
  const greeting = hasGreetingWord(message) || isCapabilityQuestion(message);
  const pureGreeting = isPureGreeting(message) || isCapabilityQuestion(message);
  const followUp = isFollowUpMessage(message);

  const hasTopicWords =
    /\b(wifi|eduroam|canvas|portal|login|fees|payment|tuition|visa|passport|security|research|navigate|navigation|map|student hq|sic|finance|insurance)\b/.test(
      q
    );

  const device: "mobile" | "laptop" | null =
    /\b(phone|mobile|iphone|android)\b/.test(q)
      ? "mobile"
      : /\b(laptop|macbook|windows)\b/.test(q)
        ? "laptop"
        : null;

  const dateISO = extractExplicitDateISO(message);

  if (pureGreeting && !hasTopicWords) {
    return {
      topic: "support",
      goal: "overview",
      greeting: true,
      followUp: false,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device: null,
      dateISO: null,
    };
  }

  if (/\b(exit|way out|emergency exit|nearest exit)\b/.test(q)) {
    return {
      topic: "navigation",
      goal: "navigate",
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: "exit",
      department: null,
      device,
      dateISO,
    };
  }

  const destinationMatch = findDestinationMatches(message);
  if (destinationMatch.confident || destinationMatch.partial.length > 0 || hasNavigationSignal(message)) {
    return {
      topic: "navigation",
      goal: "navigate",
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: message,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(wifi|eduroam|internet|network)\b/.test(q)) {
    const goal: Goal = /\b(not working|doesn't work|doesnt work|can't connect|cannot connect|problem|issue|down)\b/.test(q)
      ? "not_working"
      : "setup";

    return {
      topic: "wifi",
      goal,
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(canvas|lms)\b/.test(q)) {
    return {
      topic: "canvas",
      goal: "login",
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(student portal|portal)\b/.test(q)) {
    return {
      topic: "student_portal",
      goal: "login",
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(fee|fees|payment|tuition|finance|instalment|installment|cashier)\b/.test(q)) {
    let goal: Goal = "overview";

    if (/\b(due|deadline|when)\b/.test(q)) goal = "deadline";
    else if (/\b(how do i pay|pay fees|payment method|flywire|jompay|transfer|wire|remittance)\b/.test(q)) goal = "payment_method";
    else if (/\b(instalment|installment|payment plan)\b/.test(q)) goal = "instalment";
    else if (/\b(cashier|counter|where is cashier|where is finance)\b/.test(q)) goal = "location";
    else if (/\b(email|contact|mail)\b/.test(q)) goal = "contact";

    return {
      topic: "fees",
      goal,
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(visa|passport|emgs|eval|val|insurance)\b/.test(q)) {
    let goal: Goal = "overview";

    if (/\b(renew|renewal|expire|expiring|expires)\b/.test(q)) goal = "renewal";
    else if (/\b(new|apply|application|student pass)\b/.test(q)) goal = "new_application";
    else if (/\b(lost|missing|stolen)\b/.test(q)) goal = "lost_document";
    else if (/\b(cancel|cancellation|withdraw)\b/.test(q)) goal = "cancellation";
    else if (/\b(email|contact|mail)\b/.test(q)) goal = "contact";

    return {
      topic: /\bpassport\b/.test(q) ? "passport" : "visa",
      goal,
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(security|emergency|999|red phone|safe|smoking|vaping|vape|smoke)\b/.test(q)) {
    return {
      topic: "safety",
      goal: "contact",
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (/\b(research|grant|hdr|school of research)\b/.test(q)) {
    const goal: Goal = /\b(where|address|location)\b/.test(q) ? "location" : "contact";
    return {
      topic: "research",
      goal,
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (
    /\b(sic|student information centre|student information center|transcript|registration|letter|general enquiry|general inquiry|student hq|finance treasury|treasury services|service desk|servicedesk|g block)\b/.test(
      q
    )
  ) {
    return {
      topic: "support",
      goal: /\b(email|contact|mail|where)\b/.test(q) ? "contact" : "overview",
      greeting,
      followUp,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  if (topicHint && isValidTopicContinuation(message, topicHint)) {
    return {
      topic: topicHint,
      goal:
        topicHint === "fees" && /\b(due|deadline|when)\b/.test(q)
          ? "deadline"
          : topicHint === "fees" && /\b(pay|payment|transfer|jompay|flywire)\b/.test(q)
            ? "payment_method"
            : topicHint === "fees" && /\b(instalment|installment)\b/.test(q)
              ? "instalment"
              : topicHint === "visa" && /\b(renew|expire)\b/.test(q)
                ? "renewal"
                : topicHint === "visa" && /\b(lost|missing|stolen)\b/.test(q)
                  ? "lost_document"
                  : topicHint === "wifi" && /\b(not working|issue|problem|can't connect|cannot connect)\b/.test(q)
                    ? "not_working"
                    : topicHint === "wifi" && /\b(phone|mobile|iphone|android|laptop|macbook|windows)\b/.test(q)
                      ? "setup"
                      : "overview",
      greeting,
      followUp: true,
      needsClarification: false,
      name,
      place: null,
      department: null,
      device,
      dateISO,
    };
  }

  return {
    topic: "unknown",
    goal: null,
    greeting,
    followUp,
    needsClarification: false,
    name,
    place: null,
    department: null,
    device,
    dateISO,
  };
}

/* -----------------------------------------------------------------------------
   OpenAI interpretation and merge
----------------------------------------------------------------------------- */

async function aiInterpret(
  openai: OpenAI,
  message: string,
  history: HistoryItem[] = [],
  currentTopic?: string | null
): Promise<Interpretation | null> {
  const recent = history.slice(-4).map((item) => `${item.role}: ${item.content}`).join("\n");

  const prompt = `You are only an interpreter for a campus assistant. Do not answer the user. Return strict JSON.

User message: "${message}"
${recent ? `Recent conversation:\n${recent}\n` : ""}
Current topic hint: ${currentTopic ?? "none"}

Return:
{
  "topic": "navigation|wifi|canvas|student_portal|fees|visa|passport|safety|research|support|unknown",
  "goal": "overview|setup|not_working|login|deadline|payment_method|instalment|renewal|new_application|lost_document|cancellation|contact|location|navigate|clarify|null",
  "greeting": boolean,
  "followUp": boolean,
  "needsClarification": boolean,
  "name": string|null,
  "place": string|null,
  "department": string|null,
  "device": "mobile"|"laptop"|null,
  "dateISO": "YYYY-MM-DD"|null
}

Rules:
- Understand messy student phrasing naturally.
- Do not invent facts.
- If the message is only a greeting like "hi, i am ilyas", topic should be "support" and goal "overview".
- If the user mentions wifi/eduroam/canvas/portal/login, do not classify as navigation.
- If the user asks for a building/place/directions, classify as navigation.
- If the user mentions visa expiry or renewal timing, topic should be visa and goal renewal.
- needsClarification should be true only when two distinct topics are mixed in one message.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 240,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Interpretation>;

    const allowedTopics = new Set<Topic>([
      "navigation",
      "wifi",
      "canvas",
      "student_portal",
      "fees",
      "visa",
      "passport",
      "safety",
      "research",
      "support",
      "unknown",
    ]);

    const allowedGoals = new Set<Exclude<Goal, null>>([
      "overview",
      "setup",
      "not_working",
      "login",
      "deadline",
      "payment_method",
      "instalment",
      "renewal",
      "new_application",
      "lost_document",
      "cancellation",
      "contact",
      "location",
      "navigate",
      "clarify",
    ]);

    const topic: Topic = allowedTopics.has(parsed.topic as Topic)
      ? (parsed.topic as Topic)
      : "unknown";

    const goal: Goal =
      parsed.goal && allowedGoals.has(parsed.goal as Exclude<Goal, null>)
        ? (parsed.goal as Goal)
        : null;

    return {
      topic,
      goal,
      greeting: !!parsed.greeting,
      followUp: !!parsed.followUp,
      needsClarification: !!parsed.needsClarification,
      name: parsed.name ?? null,
      place: parsed.place ?? null,
      department: parsed.department ?? null,
      device:
        parsed.device === "mobile" || parsed.device === "laptop"
          ? parsed.device
          : null,
      dateISO: parsed.dateISO ?? null,
    };
  } catch {
    return null;
  }
}

function mergeInterpretations(base: Interpretation, ai: Interpretation | null): Interpretation {
  if (!ai) return base;

  const merged: Interpretation = { ...base };

  merged.greeting = base.greeting || ai.greeting;
  merged.followUp = base.followUp || ai.followUp;
  merged.needsClarification = base.needsClarification || ai.needsClarification;

  if (!merged.name && ai.name) merged.name = ai.name;
  if (!merged.place && ai.place) merged.place = ai.place;
  if (!merged.department && ai.department) merged.department = ai.department;
  if (!merged.device && ai.device) merged.device = ai.device;
  if (!merged.dateISO && ai.dateISO) merged.dateISO = ai.dateISO;

  if ((base.topic === "unknown" || base.topic === "support") && ai.topic !== "unknown") {
    merged.topic = ai.topic;
  } else if (ai.topic === base.topic) {
    merged.topic = ai.topic;
  }

  if ((base.goal === null || base.goal === "overview") && ai.goal) {
    merged.goal = ai.goal;
  }

  return merged;
}

/* -----------------------------------------------------------------------------
   Public API
----------------------------------------------------------------------------- */

export type InterpretResult = {
  interpretation: Interpretation;
  heuristic: Interpretation;
  ai: Interpretation | null;
};

/**
 * Run heuristic interpretation and optionally merge with OpenAI interpretation.
 * Returns the final interpretation plus heuristic and ai (for debugging).
 */
export async function interpretAssistantMessage(
  message: string,
  currentTopic: string | null | undefined,
  history: HistoryItem[],
  options?: { openaiApiKey?: string }
): Promise<InterpretResult> {
  const heuristic = heuristicInterpret(message, currentTopic, history);
  let ai: Interpretation | null = null;
  let interpretation: Interpretation = heuristic;

  const shouldUseAI =
    !!options?.openaiApiKey &&
    !isPureGreeting(message) &&
    (heuristic.topic === "unknown" ||
      heuristic.topic === "support" ||
      heuristic.goal === null ||
      heuristic.goal === "overview");

  if (shouldUseAI) {
    try {
      const openai = new OpenAI({ apiKey: options.openaiApiKey });
      ai = await aiInterpret(openai, message, history, currentTopic);
      interpretation = mergeInterpretations(heuristic, ai);
    } catch {
      interpretation = heuristic;
    }
  }

  return { interpretation, heuristic, ai };
}
