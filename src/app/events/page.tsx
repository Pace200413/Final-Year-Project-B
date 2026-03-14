"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_EVENTS_PAGE_CONTENT,
  type EventsPageContent,
} from "@/lib/events";
import type { CampusEvent } from "@/lib/types";
import {
  Eyebrow,
  InlineAlert,
  PageTitleBlock,
  SafetyCard,
  SafetyPageShell,
  SectionTitle,
} from "@/components/safety/SafetyUI";

const API = "/api/events";

function dayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupByDay(items: CampusEvent[]) {
  return items.reduce<Record<string, CampusEvent[]>>((acc, item) => {
    const key = dayKey(item.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function formatDayLabel(key: string) {
  const d = new Date(`${key}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

function formatTimeRange(startIso: string, endIso?: string) {
  const start = new Date(startIso);
  const startLabel = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!endIso) return startLabel;

  const end = new Date(endIso);
  const endLabel = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startLabel} — ${endLabel}`;
}

function formatVenue(event: CampusEvent) {
  return [event.venue?.building, event.venue?.level, event.venue?.room]
    .filter(Boolean)
    .join(", ");
}

function EventCard({ event }: { event: CampusEvent }) {
  const image = event.images?.thumbnail || event.images?.hero || "";
  const venue = formatVenue(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition active:scale-[0.99]"
    >
      <div className="relative">
        {image ? (
          <div
            className="h-40 w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${image}")` }}
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-red-50 via-white to-slate-100 text-4xl">
            📅
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
            {event.category || "Other"}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent p-4">
          <div className="inline-flex rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
            {formatTimeRange(event.date, event.endDate)}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
          {event.title}
        </h3>

        {venue ? (
          <p className="mt-2 text-sm text-slate-600">
            📍 {venue}
          </p>
        ) : null}

        {event.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {event.description}
          </p>
        ) : null}

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700">
          <span>Open event</span>
          <span className="transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [content, setContent] = useState<EventsPageContent>(
    DEFAULT_EVENTS_PAGE_CONTENT
  );
  const [error, setError] = useState("");
  const bcRef = useRef<BroadcastChannel | null>(null);

  const load = async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      setContent(json.content ?? DEFAULT_EVENTS_PAGE_CONTENT);
      setError("");
    } catch (err) {
      setContent(DEFAULT_EVENTS_PAGE_CONTENT);
      setError(err instanceof Error ? err.message : "Failed to load events");
    }
  };

  useEffect(() => {
    load();

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("events-content");
      bcRef.current.onmessage = (message) => {
        if (message?.data?.type === "updated") load();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "events:updated") load();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      try {
        bcRef.current?.close();
      } catch {}
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const grouped = useMemo(
    () => Object.entries(groupByDay(content.events)),
    [content.events]
  );

  return (
    <SafetyPageShell>
      <SafetyCard className="overflow-hidden bg-white p-0">
        <div className="bg-gradient-to-br from-red-50 via-white to-slate-50 px-5 py-6">
          <PageTitleBlock
            eyebrow={<Eyebrow>{content.eyebrow}</Eyebrow>}
            title={content.heroTitle}
            description={content.heroDescription}
          />
        </div>
      </SafetyCard>

      {error ? (
        <div className="mt-5">
          <InlineAlert tone="amber">
            Could not refresh events right now.
          </InlineAlert>
        </div>
      ) : null}

      <div className="mt-5">
        <SectionTitle
          title={content.sectionTitle}
          subtitle={content.sectionSubtitle}
        />
      </div>

      {content.events.length === 0 ? (
        <SafetyCard className="mt-4">
          <SectionTitle
            title={content.emptyHeading}
            subtitle={content.emptyDescription}
          />
        </SafetyCard>
      ) : (
        <div className="mt-4 space-y-6">
          {grouped.map(([group, items]) => (
            <section key={group}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  {formatDayLabel(group)}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {items.length} event{items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </SafetyPageShell>
  );
}