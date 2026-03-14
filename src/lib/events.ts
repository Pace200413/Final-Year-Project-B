import type {
  CampusEvent,
  EventImages,
  EventPricing,
  EventRegistration,
  EventVenue,
} from "@/lib/types";

export type EventsPageContent = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  sectionTitle: string;
  sectionSubtitle: string;
  emptyHeading: string;
  emptyDescription: string;
  events: CampusEvent[];
};

export type EventsPageContentRow = {
  id: string;
  eyebrow: string;
  hero_title: string;
  hero_description: string;
  section_title: string;
  section_subtitle: string;
  empty_heading: string;
  empty_description: string;
  events: unknown;
  updated_at?: string;
  updated_by_auth_user_id?: string | null;
  updated_by_email?: string | null;
};

export const DEFAULT_EVENTS_PAGE_CONTENT: EventsPageContent = {
  eyebrow: "Campus Events",
  heroTitle: "What’s happening on campus",
  heroDescription:
    "Discover workshops, talks, sports, orientation activities, and student life events across campus.",
  sectionTitle: "Upcoming events",
  sectionSubtitle: "Published events are shown here for students.",
  emptyHeading: "No events yet",
  emptyDescription:
    "There are no published events right now. Please check back later.",
  events: [],
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function normalizeIso(value: unknown, fallback?: string) {
  const raw = asString(value).trim();
  if (!raw) return fallback;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString();
}

function normalizeVenue(value: unknown): EventVenue {
  const src = (value ?? {}) as Partial<EventVenue>;

  return {
    building: asString(src.building).trim(),
    ...(asString(src.level).trim() ? { level: asString(src.level).trim() } : {}),
    ...(asString(src.room).trim() ? { room: asString(src.room).trim() } : {}),
  };
}

function normalizeImages(value: unknown): EventImages | undefined {
  const src = (value ?? {}) as Partial<EventImages>;
  const hero = asString(src.hero).trim();
  const thumbnail = asString(src.thumbnail).trim();

  if (!hero && !thumbnail) return undefined;

  return {
    ...(hero ? { hero } : {}),
    ...(thumbnail ? { thumbnail } : {}),
  };
}

function normalizePricing(value: unknown): EventPricing | undefined {
  const src = value as Partial<EventPricing> | undefined;
  if (!src || typeof src !== "object") return undefined;

  if (src.type === "free") {
    return {
      type: "free",
      currency: asString(src.currency).trim() || "MYR",
    };
  }

  if (src.type === "paid") {
    return {
      type: "paid",
      currency: asString(src.currency).trim() || "MYR",
      amount: asNumber(src.amount) ?? 0,
    };
  }

  return undefined;
}

function normalizeRegistration(value: unknown): EventRegistration | undefined {
  const src = value as Partial<EventRegistration> | undefined;
  if (!src || typeof src !== "object") return undefined;

  if (src.type === "link") {
    return {
      type: "link",
      url: asString((src as { url?: string }).url).trim(),
      ...(normalizeIso((src as { deadline?: string }).deadline)
        ? { deadline: normalizeIso((src as { deadline?: string }).deadline) }
        : {}),
    };
  }

  if (src.type === "form") {
    return {
      type: "form",
      ...(normalizeIso((src as { deadline?: string }).deadline)
        ? { deadline: normalizeIso((src as { deadline?: string }).deadline) }
        : {}),
    };
  }

  if (src.type === "none") {
    return { type: "none" };
  }

  return undefined;
}

export function normalizeCampusEvent(
  input?: Partial<CampusEvent> | null,
  index = 0
): CampusEvent {
  const src = input ?? {};
  const nowIso = new Date().toISOString();
  const date = normalizeIso(src.date, nowIso) ?? nowIso;
  const endDate = normalizeIso(src.endDate);

  const images = normalizeImages(src.images);
  const pricing = normalizePricing(src.pricing);
  const registration = normalizeRegistration(src.registration);
  const tags = asStringArray(src.tags);
  const accessibility = asStringArray(src.accessibility);
  const lat = asNumber(src.lat);
  const lng = asNumber(src.lng);
  const capacity = asNumber(src.capacity);
  const createdAt = normalizeIso(src.createdAt);
  const updatedAt = normalizeIso(src.updatedAt);

  return {
    id: asString(src.id).trim() || `event-${index + 1}`,
    title: asString(src.title).trim() || "Untitled event",
    category: asString(src.category).trim() || "Other",
    date,
    ...(endDate ? { endDate } : {}),
    venue: normalizeVenue(src.venue),
    ...(lat !== undefined ? { lat } : {}),
    ...(lng !== undefined ? { lng } : {}),
    ...(asString(src.organizer).trim()
      ? { organizer: asString(src.organizer).trim() }
      : {}),
    ...(asString(src.description).trim()
      ? { description: asString(src.description).trim() }
      : {}),
    ...(images ? { images } : {}),
    ...(tags.length ? { tags } : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(pricing ? { pricing } : {}),
    ...(registration ? { registration } : {}),
    ...(accessibility.length ? { accessibility } : {}),
    isPublished: src.isPublished !== false,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
}

export function normalizeEventsPageContent(
  input?: Partial<EventsPageContent> | null
): EventsPageContent {
  const src = input ?? {};

  return {
    ...DEFAULT_EVENTS_PAGE_CONTENT,
    ...src,
    events: Array.isArray(src.events)
      ? src.events.map((item, index) =>
          normalizeCampusEvent(item as Partial<CampusEvent>, index)
        )
      : DEFAULT_EVENTS_PAGE_CONTENT.events,
  };
}

export function rowToEventsPageContent(
  row?: Partial<EventsPageContentRow> | null
): EventsPageContent {
  if (!row) return DEFAULT_EVENTS_PAGE_CONTENT;

  return normalizeEventsPageContent({
    eyebrow: row.eyebrow,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    sectionTitle: row.section_title,
    sectionSubtitle: row.section_subtitle,
    emptyHeading: row.empty_heading,
    emptyDescription: row.empty_description,
    events: (row.events as CampusEvent[]) ?? undefined,
  });
}

export function contentToEventsPageRow(content: EventsPageContent) {
  return {
    eyebrow: content.eyebrow,
    hero_title: content.heroTitle,
    hero_description: content.heroDescription,
    section_title: content.sectionTitle,
    section_subtitle: content.sectionSubtitle,
    empty_heading: content.emptyHeading,
    empty_description: content.emptyDescription,
    events: content.events,
  };
}

export function diffEventsPageFields(
  before: EventsPageContent,
  after: EventsPageContent
) {
  const changed: string[] = [];

  (Object.keys(DEFAULT_EVENTS_PAGE_CONTENT) as Array<keyof EventsPageContent>).forEach(
    (key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push(String(key));
      }
    }
  );

  return changed;
}

export function sortCampusEvents(items: CampusEvent[]) {
  return [...items].sort((a, b) => {
    const byDate = +new Date(a.date) - +new Date(b.date);
    if (byDate !== 0) return byDate;
    return a.title.localeCompare(b.title);
  });
}

export function getPublishedEvents(items: CampusEvent[]) {
  return sortCampusEvents(items).filter((item) => item.isPublished !== false);
}

function stripEventTimestamps(event: CampusEvent) {
  const { createdAt, updatedAt, ...rest } = event;
  return rest;
}

export function stampEventsMetadata(
  beforeEvents: CampusEvent[],
  nextEvents: CampusEvent[],
  nowIso: string
) {
  const beforeMap = new Map(beforeEvents.map((event) => [event.id, event]));

  return nextEvents.map((event, index) => {
    const normalized = normalizeCampusEvent(event, index);
    const previous = beforeMap.get(normalized.id);

    if (!previous) {
      return {
        ...normalized,
        createdAt: normalized.createdAt || nowIso,
        updatedAt: nowIso,
      };
    }

    const changed =
      JSON.stringify(stripEventTimestamps(previous)) !==
      JSON.stringify(stripEventTimestamps(normalized));

    return {
      ...normalized,
      createdAt: previous.createdAt || normalized.createdAt || nowIso,
      updatedAt:
        changed
          ? nowIso
          : previous.updatedAt || normalized.updatedAt || previous.createdAt || nowIso,
    };
  });
}