/**
 * Grounding and response-building for the campus assistant.
 * Uses interpretation + message to produce AssistantResponse (reply, actions, chips, places, sources).
 * Used by: src/app/api/assistant/route.ts
 */

import type { Action, AssistantResponse, Interpretation, StructuredEntry, Topic } from "@/lib/assistant/types";
import { FOLLOWUP_CHIPS, STOPWORDS } from "@/lib/assistant/constants";
import { normalize, findDestinationMatches } from "@/lib/assistant/interpret";
import { NAV_DESTINATIONS } from "@/data/navigation-destinations";
import type { NavDestination } from "@/data/navigation-destinations";
import settings from "@/data/support-settings.json";

import feesKnowledge from "@/data/assistant/fees.json";
import internationalKnowledge from "@/data/assistant/international.json";
import safetyKnowledge from "@/data/assistant/safety.json";
import researchKnowledge from "@/data/assistant/research.json";
import itKnowledge from "@/data/assistant/it.json";
import supportKnowledge from "@/data/assistant/support.json";

/* -----------------------------------------------------------------------------
   Knowledge and entry lookup
----------------------------------------------------------------------------- */

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

type SupportSettings = {
  alert?: { text?: string; phone?: string };
};

function getSecurityPhone(): string {
  const s = settings as SupportSettings;
  return s.alert?.phone || "082-260991";
}

function tokenize(text: string, minLength = 2): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= minLength);
}

function significantTokens(text: string): string[] {
  return tokenize(text, 3).filter((token) => !STOPWORDS.has(token));
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

/* -----------------------------------------------------------------------------
   Response builders
----------------------------------------------------------------------------- */

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

function buildNavigationCardResponse(dest: NavDestination): AssistantResponse {
  return {
    reply: `Got it — opening navigation to ${dest.title}.`,
    sources: [],
    actions: [{ type: "OPEN_NAVIGATION", label: "Open Navigation", placeId: dest.key }],
    suggestedPlaces: [{ placeId: dest.key, name: dest.title }],
    currentTopic: "navigation",
  };
}

function buildNavigationChooserResponse(places?: NavDestination[]): AssistantResponse {
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

/** Chips for unsupported / fallback — same as safety module (campus-only). */
const FALLBACK_CHIPS = [
  { label: "Find a building", targetEntryId: "navigate" },
  { label: "Visa help", targetEntryId: "visa_overview" },
  { label: "Fees", targetEntryId: "fees_overview" },
  { label: "Wi-Fi", targetEntryId: "wifi_overview" },
  { label: "Safety", targetEntryId: "campus_security_contact" },
  { label: "Student support", targetEntryId: "sic_contact" },
];

function buildFallbackResponse(topic: Topic, name?: string | null, greeting?: boolean): AssistantResponse {
  const securityPhone = getSecurityPhone();
  const reply = withGreetingPrefix(
    "I couldn't find that. I'm for campus only — directions, Wi-Fi, fees, visa, support. Pick one below or open Support.",
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
    suggestedChips: FALLBACK_CHIPS,
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

/* -----------------------------------------------------------------------------
   Main grounding
----------------------------------------------------------------------------- */

export function ground(interp: Interpretation, message: string): AssistantResponse {
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

/* -----------------------------------------------------------------------------
   Public API for route orchestration
----------------------------------------------------------------------------- */

/** Response for the "capability / empty message" case (welcome chips). */
export function capabilityResponse(): AssistantResponse {
  return buildCapabilityResponse();
}

/** Response for a direct entry ID (e.g. chip click). Returns null if entry not found. */
export function responseForEntryId(entryId: string): AssistantResponse | null {
  const entry = getEntry(entryId);
  if (!entry) return null;
  return buildEntryResponse(entry, {
    currentTopic: topicForEntry(entry),
  });
}

/** Response for low‑information / vague messages that should not hit OpenAI. */
export function lowInformationResponse(): AssistantResponse {
  // Use the generic campus‑only fallback with no topic carry‑over.
  return buildFallbackResponse("unknown", null, false);
}
