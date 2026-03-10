import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

import settings from "@/data/support-settings.json";
import { NAV_DESTINATIONS } from "@/data/navigation-destinations";

import feesKnowledge from "@/data/assistant/fees.json";
import internationalKnowledge from "@/data/assistant/international.json";
import safetyKnowledge from "@/data/assistant/safety.json";
import researchKnowledge from "@/data/assistant/research.json";
import itKnowledge from "@/data/assistant/it.json";
import supportKnowledge from "@/data/assistant/support.json";

type Action =
  | { type: "OPEN_SUPPORT"; label: string }
  | { type: "OPEN_NAVIGATION"; label: string; placeId?: string }
  | { type: "OPEN_ROUTE"; label: string; value: string }
  | { type: "OPEN_LINK"; label: string; value: string }
  | { type: "CALL_PHONE"; label: string; value: string }
  | { type: "COPY_CONTACT"; label: string; value: string };

type StructuredEntry = {
  id: string;
  title: string;
  aliases?: string[];
  category: string;
  answer: string;
  actions?: Action[];
  sourceLabel?: string;
};

type Topic =
  | "navigation"
  | "wifi"
  | "canvas"
  | "student_portal"
  | "fees"
  | "visa"
  | "passport"
  | "safety"
  | "research"
  | "support"
  | "unknown";

type Goal =
  | "overview"
  | "setup"
  | "not_working"
  | "login"
  | "deadline"
  | "payment_method"
  | "instalment"
  | "renewal"
  | "new_application"
  | "lost_document"
  | "cancellation"
  | "contact"
  | "location"
  | "navigate"
  | "clarify"
  | null;

type Interpretation = {
  topic: Topic;
  goal: Goal;
  greeting: boolean;
  followUp: boolean;
  needsClarification: boolean;
  name?: string | null;
  place?: string | null;
  department?: string | null;
  device?: "mobile" | "laptop" | null;
  dateISO?: string | null;
};

type HistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type AssistantResponse = {
  reply: string;
  sources: string[];
  actions: Action[];
  suggestedPlaces?: { placeId: string; name: string }[];
  suggestedChips?: { label: string; targetEntryId: string }[];
  currentTopic: Topic | null;
  debug?: unknown;
};

const BodySchema = z.object({
  message: z.string().optional(),
  targetEntryId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  currentTopic: z.string().nullable().optional(),
});

const ALL_ENTRIES: StructuredEntry[] = [
  ...(feesKnowledge as StructuredEntry[]),
  ...(internationalKnowledge as StructuredEntry[]),
  ...(safetyKnowledge as StructuredEntry[]),
  ...(researchKnowledge as StructuredEntry[]),
  ...(itKnowledge as StructuredEntry[]),
  ...(supportKnowledge as StructuredEntry[]),
];

const ENTRY_BY_ID = new Map<string, StructuredEntry>(
  ALL_ENTRIES.map((entry) => [entry.id, entry])
);

const FOLLOWUP_CHIPS: Record<string, { label: string; targetEntryId: string }[]> = {
  fees: [
    { label: "Fee deadline", targetEntryId: "tuition_fee_due_date" },
    { label: "How to pay", targetEntryId: "pay_fees_malaysian" },
    { label: "Instalment plan", targetEntryId: "instalment_payment_plan" },
  ],
  visa: [
    { label: "Visa overview", targetEntryId: "visa_overview" },
    { label: "Renew visa", targetEntryId: "renew_student_visa" },
    { label: "Lost passport", targetEntryId: "lost_passport" },
  ],
  safety: [
    { label: "Campus security", targetEntryId: "campus_security_contact" },
    { label: "Red phone numbers", targetEntryId: "red_phone_numbers" },
    { label: "Smoke-free campus", targetEntryId: "smoke_free_campus" },
  ],
  research: [
    { label: "Research contacts", targetEntryId: "research_general_contacts" },
    { label: "Research location", targetEntryId: "research_office_location" },
  ],
  it: [
    { label: "Wi-Fi on phone", targetEntryId: "wifi_eduroam_mobile" },
    { label: "Wi-Fi on laptop", targetEntryId: "wifi_eduroam_laptop" },
    { label: "Wi-Fi not working", targetEntryId: "wifi_not_working" },
  ],
  support: [
    { label: "SIC", targetEntryId: "sic_contact" },
    { label: "Finance", targetEntryId: "finance_treasury_contact" },
    { label: "Visa & Insurance", targetEntryId: "visa_insurance_contact" },
  ],
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "am",
  "as",
  "at",
  "be",
  "can",
  "do",
  "for",
  "from",
  "go",
  "hello",
  "help",
  "hey",
  "hi",
  "hiii",
  "how",
  "i",
  "im",
  "i'm",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "please",
  "the",
  "to",
  "u",
  "you",
  "what",
  "where",
  "when",
]);

type SupportSettings = {
  alert?: {
    text?: string;
    phone?: string;
  };
};

type NavigationDestination = (typeof NAV_DESTINATIONS)[number];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\bwi[\s-]?fi\b/g, "wifi")
    .replace(/\bsign in\b/g, "login")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string, minLength = 2): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= minLength);
}

function significantTokens(text: string): string[] {
  return tokenize(text, 3).filter((token) => !STOPWORDS.has(token));
}

function getSecurityPhone(): string {
  const s = settings as SupportSettings;
  return s.alert?.phone || "082-260991";
}

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

function isFollowUpMessage(text: string): boolean {
  const q = normalize(text);
  return (
    /^(and|then|okay|ok|more|what|how|where|which|why)\??$/.test(q) ||
    q.split(/\s+/).length <= 4
  );
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

function findDestinationMatches(message: string): {
  confident: NavigationDestination | null;
  partial: NavigationDestination[];
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

function heuristicInterpret(
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

  if (topicHint && followUp) {
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

function getEntry(entryId: string): StructuredEntry | null {
  return ENTRY_BY_ID.get(entryId) ?? null;
}

function pickFirstExisting(entryIds: string[]): StructuredEntry | null {
  for (const id of entryIds) {
    const entry = getEntry(id);
    if (entry) return entry;
  }
  return null;
}

function topicForEntry(entry: StructuredEntry, override?: Topic | null): Topic {
  if (override) return override;

  if (entry.id === "canvas_login") return "canvas";
  if (entry.id === "student_portal_login") return "student_portal";
  if (entry.category === "it") return "wifi";
  if (entry.category === "fees") return "fees";
  if (entry.category === "visa") return "visa";
  if (entry.category === "safety") return "safety";
  if (entry.category === "research") return "research";
  if (entry.category === "support") return "support";

  return "unknown";
}

function withGreetingPrefix(reply: string, name?: string | null, greeting?: boolean): string {
  if (!greeting || !name) return reply;
  return `Hi ${name} — ${reply}`;
}

function buildEntryResponse(
  entry: StructuredEntry,
  options?: {
    greeting?: boolean;
    name?: string | null;
    currentTopic?: Topic | null;
    dateISO?: string | null;
  }
): AssistantResponse {
  let reply = entry.answer.trim();

  if (entry.id === "renew_student_visa" && options?.dateISO) {
    const sourceDate = new Date(options.dateISO);
    if (!Number.isNaN(sourceDate.getTime())) {
      const start = new Date(sourceDate);
      start.setMonth(start.getMonth() - 3);
      const target = start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      reply = `You should start visa renewal around 3 months before expiry. For that date, aim to begin by ${target}.`;
    }
  }

  reply = withGreetingPrefix(reply, options?.name, options?.greeting);

  const nextTopic = topicForEntry(entry, options?.currentTopic ?? undefined);
  const chips = FOLLOWUP_CHIPS[entry.category]?.slice(0, 3);

  return {
    reply,
    sources: [entry.sourceLabel || entry.title],
    actions: entry.actions || [],
    suggestedChips: chips,
    currentTopic: nextTopic,
  };
}

function buildCapabilityResponse(name?: string | null): AssistantResponse {
  return {
    reply: name
      ? `Hi ${name} — I can help with navigation, Wi-Fi, Canvas, fees, visa, and support contacts. Pick a topic below or ask me a question.`
      : "I can help with navigation, Wi-Fi, Canvas, fees, visa, and support contacts. Pick a topic below or ask me a question.",
    sources: [],
    actions: [],
    suggestedChips: [
      { label: "Wi-Fi", targetEntryId: "wifi_overview" },
      { label: "Fees", targetEntryId: "fees_overview" },
      { label: "Visa", targetEntryId: "visa_overview" },
    ],
    currentTopic: null,
  };
}

function buildNavigationCardResponse(dest: NavigationDestination): AssistantResponse {
  return {
    reply: `Got it — opening navigation to ${dest.title}.`,
    sources: [],
    actions: [{ type: "OPEN_NAVIGATION", label: "Open Navigation", placeId: dest.key }],
    suggestedPlaces: [{ placeId: dest.key, name: dest.title }],
    currentTopic: "navigation",
  };
}

function buildNavigationChooserResponse(places?: NavigationDestination[]): AssistantResponse {
  const list = (places || NAV_DESTINATIONS).slice(0, 9);

  return {
    reply: "Which place would you like to go to?",
    sources: [],
    actions: [],
    suggestedPlaces: list.map((place) => ({
      placeId: place.key,
      name: place.title,
    })),
    currentTopic: "navigation",
  };
}

function buildExitNavigationResponse(
  name?: string | null,
  greeting?: boolean
): AssistantResponse {
  const reply = withGreetingPrefix(
    "open exit navigation and follow the route to the nearest exit.",
    name,
    greeting
  );

  return {
    reply,
    sources: [],
    actions: [
      {
        type: "OPEN_ROUTE",
        label: "Open Exit Navigation",
        value: "/exit-navigation",
      },
    ],
    currentTopic: "navigation",
  };
}

function buildClarificationResponse(topic: Topic): AssistantResponse {
  if (topic === "fees") {
    return {
      reply: "I can help with fees. Do you need the deadline, payment methods, or an instalment plan?",
      sources: [],
      actions: [],
      suggestedChips: FOLLOWUP_CHIPS.fees.slice(0, 3),
      currentTopic: "fees",
    };
  }

  if (topic === "visa" || topic === "passport") {
    return {
      reply: "Do you need help with a new visa, renewal, lost passport, or cancellation?",
      sources: [],
      actions: [],
      suggestedChips: FOLLOWUP_CHIPS.visa.slice(0, 3),
      currentTopic: "visa",
    };
  }

  if (topic === "wifi" || topic === "canvas" || topic === "student_portal") {
    return {
      reply: "Is this about Wi-Fi setup, Wi-Fi not working, Canvas, or the Student Portal?",
      sources: [],
      actions: [],
      suggestedChips: [
        { label: "Wi-Fi on phone", targetEntryId: "wifi_eduroam_mobile" },
        { label: "Wi-Fi on laptop", targetEntryId: "wifi_eduroam_laptop" },
        { label: "Canvas login", targetEntryId: "canvas_login" },
      ],
      currentTopic: "wifi",
    };
  }

  return {
    reply: "Could you be a bit more specific?",
    sources: [],
    actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
    currentTopic: topic === "unknown" ? null : topic,
  };
}

function buildFallbackResponse(topic: Topic, name?: string | null, greeting?: boolean): AssistantResponse {
  const securityPhone = getSecurityPhone();
  const reply = withGreetingPrefix(
    "I don't have a reliable answer for that yet. Open Support for the right service.",
    name,
    greeting
  );

  const actions: Action[] = [{ type: "OPEN_SUPPORT", label: "Open Support" }];
  if (topic === "safety") {
    actions.unshift({
      type: "CALL_PHONE",
      label: "Call Campus Security",
      value: securityPhone,
    });
  }

  return {
    reply,
    sources: [],
    actions,
    currentTopic: topic === "unknown" ? null : topic,
  };
}

function semanticFallback(message: string, categories?: string[]): StructuredEntry | null {
  const queryTokens = significantTokens(message);
  if (queryTokens.length < 2) return null;

  let best: { entry: StructuredEntry; score: number } | null = null;

  for (const entry of ALL_ENTRIES) {
    if (categories && !categories.includes(entry.category)) continue;

    const haystackTokens = significantTokens(
      [entry.title, ...(entry.aliases || [])].join(" ")
    );
    if (haystackTokens.length === 0) continue;

    let score = 0;
    for (const token of haystackTokens) {
      if (queryTokens.includes(token)) score += 1;
    }

    if (score >= 2 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best?.entry ?? null;
}

function ground(interp: Interpretation, message: string): AssistantResponse {
  const q = normalize(message);

  if (interp.greeting && interp.topic === "support" && interp.goal === "overview") {
    return buildCapabilityResponse(interp.name);
  }

  if (interp.needsClarification) {
    return buildClarificationResponse(interp.topic);
  }

  if (/\b(exit|way out|nearest exit|emergency exit)\b/.test(q)) {
    return buildExitNavigationResponse(interp.name, interp.greeting);
  }

  if (interp.topic === "navigation") {
    const matches = findDestinationMatches(interp.place || message);

    if (matches.confident) {
      return buildNavigationCardResponse(matches.confident);
    }

    if (matches.partial.length > 0) {
      return buildNavigationChooserResponse(matches.partial);
    }

    return buildNavigationChooserResponse();
  }

  if (interp.topic === "wifi") {
    if (interp.goal === "not_working") {
      const entry = pickFirstExisting([
        "wifi_not_working",
        "student_engagement_servicedesk",
        "wifi_overview",
      ]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "wifi",
        });
      }
    }

    if (interp.device === "mobile") {
      const entry = pickFirstExisting(["wifi_eduroam_mobile", "wifi_overview"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "wifi",
        });
      }
    }

    if (interp.device === "laptop") {
      const entry = pickFirstExisting(["wifi_eduroam_laptop", "wifi_overview"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "wifi",
        });
      }
    }

    const entry = pickFirstExisting(["wifi_overview", "wifi_not_working"]);
    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "wifi",
      });
    }
  }

  if (interp.topic === "canvas") {
    const entry = pickFirstExisting(["canvas_login"]);
    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "canvas",
      });
    }
  }

  if (interp.topic === "student_portal") {
    const entry = pickFirstExisting(["student_portal_login"]);
    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "student_portal",
      });
    }
  }

  if (interp.topic === "fees") {
    if (interp.goal === "contact" || /\b(finance treasury|treasury services|finance email|fee help email)\b/.test(q)) {
      const entry = pickFirstExisting(["finance_treasury_contact"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "fees",
        });
      }
    }

    if (interp.goal === "location" || /\b(cashier|counter|finance counter)\b/.test(q)) {
      const entry = pickFirstExisting(["finance_cashier_counter", "student_hq_overview"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "fees",
        });
      }
    }

    if (interp.goal === "deadline") {
      const entry = pickFirstExisting(["tuition_fee_due_date"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "fees",
        });
      }
    }

    if (interp.goal === "payment_method") {
      const internationalContext = /\b(international|overseas|flywire|telegraphic|wire|swift|remittance)\b/.test(q);
      const entry = internationalContext
        ? pickFirstExisting(["pay_fees_international", "pay_fees_malaysian"])
        : pickFirstExisting(["pay_fees_malaysian", "pay_fees_international"]);

      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "fees",
        });
      }
    }

    if (interp.goal === "instalment") {
      const entry = pickFirstExisting(["instalment_payment_plan"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "fees",
        });
      }
    }

    if (/\b(late|penalty|deregister|withheld|unpaid)\b/.test(q)) {
      const entry = pickFirstExisting(["late_payment_consequences"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "fees",
        });
      }
    }

    const entry = pickFirstExisting(["fees_overview"]);
    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "fees",
      });
    }
  }

  if (interp.topic === "visa" || interp.topic === "passport") {
    if (interp.goal === "contact" && /\binsurance\b/.test(q)) {
      const entry = pickFirstExisting(["visa_insurance_contact", "insurance_unit_contact"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "visa",
        });
      }
    }

    if (interp.goal === "lost_document") {
      const entry = pickFirstExisting(["lost_passport"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "visa",
        });
      }
    }

    if (interp.goal === "renewal") {
      const entry = pickFirstExisting(["renew_student_visa"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "visa",
          dateISO: interp.dateISO,
        });
      }
    }

    if (interp.goal === "cancellation") {
      const entry = pickFirstExisting(["visa_cancellation"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "visa",
        });
      }
    }

    if (interp.goal === "new_application") {
      const entry = pickFirstExisting(["new_student_visa", "new_student_visa_documents"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "visa",
        });
      }
    }

    if (/\b(document|documents|required)\b/.test(q)) {
      const entry = pickFirstExisting(["new_student_visa_documents"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "visa",
        });
      }
    }

    const entry = pickFirstExisting(["visa_overview"]);
    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "visa",
      });
    }
  }

  if (interp.topic === "safety") {
    if (/\b(smoke|smoking|vape|vaping|e-cigarette|electronic cigarette)\b/.test(q)) {
      const entry = pickFirstExisting(["smoke_free_campus"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "safety",
        });
      }
    }

    if (/\b(red phone|3991|5001|5007)\b/.test(q)) {
      const entry = pickFirstExisting(["red_phone_numbers"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "safety",
        });
      }
    }

    const entry = pickFirstExisting(["campus_security_contact", "safety_tips"]);
    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "safety",
      });
    }
  }

  if (interp.topic === "research") {
    const entry =
      interp.goal === "location"
        ? pickFirstExisting(["research_office_location", "research_general_contacts"])
        : pickFirstExisting(["research_general_contacts", "research_office_location"]);

    if (entry) {
      return buildEntryResponse(entry, {
        greeting: interp.greeting,
        name: interp.name,
        currentTopic: "research",
      });
    }
  }

  if (interp.topic === "support") {
    if (
      /\b(sic|student information centre|student information center|transcript|registration|letter|general enquiry|general inquiry)\b/.test(
        q
      )
    ) {
      const entry = pickFirstExisting(["sic_contact"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "support",
        });
      }
    }

    if (/\b(finance treasury|treasury services|finance email|fee help)\b/.test(q)) {
      const entry = pickFirstExisting(["finance_treasury_contact"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "support",
        });
      }
    }

    if (/\b(visa and insurance|visa insurance|insurance unit)\b/.test(q)) {
      const entry = pickFirstExisting(["visa_insurance_contact", "insurance_unit_contact"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "support",
        });
      }
    }

    if (/\b(student hq|student headquarters|hq)\b/.test(q)) {
      const entry = pickFirstExisting(["student_hq_overview"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "support",
        });
      }
    }

    if (/\b(service desk|servicedesk|g block|student id|lab access|device issue)\b/.test(q)) {
      const entry = pickFirstExisting(["student_engagement_servicedesk"]);
      if (entry) {
        return buildEntryResponse(entry, {
          greeting: interp.greeting,
          name: interp.name,
          currentTopic: "support",
        });
      }
    }
  }

  const fallbackEntry = semanticFallback(message, [
    "it",
    "support",
    "fees",
    "visa",
    "safety",
    "research",
  ]);

  if (fallbackEntry) {
    return buildEntryResponse(fallbackEntry, {
      greeting: interp.greeting,
      name: interp.name,
      currentTopic: topicForEntry(fallbackEntry),
      dateISO: interp.dateISO,
    });
  }

  return buildFallbackResponse(interp.topic, interp.name, interp.greeting);
}

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;

  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({
        reply: "I couldn't read that request properly.",
        sources: [],
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
        currentTopic: null,
      } satisfies AssistantResponse);
    }

    body = parsed.data;
  } catch {
    return NextResponse.json({
      reply: "I couldn't read that request properly.",
      sources: [],
      actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
      currentTopic: null,
    } satisfies AssistantResponse);
  }

  const message = (body.message || "").trim();
  const history: HistoryItem[] = body.history || [];
  const isDebug = process.env.ASSISTANT_DEBUG === "1";

  if (body.targetEntryId) {
    const entry = getEntry(body.targetEntryId);
    if (entry) {
      const response = buildEntryResponse(entry, {
        currentTopic: topicForEntry(entry),
      });

      if (isDebug) {
        response.debug = {
          mode: "targetEntryId",
          targetEntryId: body.targetEntryId,
        };
      }

      return NextResponse.json(response);
    }
  }

  if (!message) {
    const response = buildCapabilityResponse();
    if (isDebug) {
      response.debug = { mode: "empty_message" };
    }
    return NextResponse.json(response);
  }

  const heuristic = heuristicInterpret(message, body.currentTopic, history);

  let ai: Interpretation | null = null;
  let interpretation = heuristic;

  const apiKey = process.env.OPENAI_API_KEY;
  const shouldUseAI =
    !!apiKey &&
    !isPureGreeting(message) &&
    (heuristic.topic === "unknown" ||
      heuristic.topic === "support" ||
      heuristic.goal === null ||
      heuristic.goal === "overview");

  if (shouldUseAI) {
    try {
      const openai = new OpenAI({ apiKey });
      ai = await aiInterpret(openai, message, history, body.currentTopic);
      interpretation = mergeInterpretations(heuristic, ai);
    } catch {
      interpretation = heuristic;
    }
  }

  const response = ground(interpretation, message);

  if (isDebug) {
    response.debug = {
      normalizedMessage: normalize(message),
      heuristic,
      ai,
      final: interpretation,
    };
  }

  return NextResponse.json(response);
}