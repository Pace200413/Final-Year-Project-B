"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CampusEvent } from "@/lib/types";
import EventActionBar from "@/app/events/EventActionBar";
import {
  DEFAULT_EVENTS_PAGE_CONTENT,
  type EventsPageContent,
} from "@/lib/events";
import { formatTime, formatDate, gmSearchUrl } from "@/lib/utils";
import { useLocale } from "@/lib/client";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [ev, setEv] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { settings, isLoaded } = useLocale();

  useEffect(() => {
    if (!id) return;

    let alive = true;
    setLoading(true);

    fetch("/api/events", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((j) => {
        if (!alive) return;

        const content = (j?.content ?? DEFAULT_EVENTS_PAGE_CONTENT) as EventsPageContent;
        const item =
          content.events.find((event) => event.id === id && event.isPublished !== false) ??
          null;

        setEv(item);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setEv(null);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/40 pb-24">
        <section className="maxw container-px pt-2">
          <div className="relative h-40 w-full animate-pulse rounded-3xl bg-slate-200 sm:h-52" />
        </section>
        <section className="maxw container-px mt-4 pb-4">
          <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="h-3 w-20 rounded-full bg-slate-200" />
            <div className="h-5 w-3/4 rounded-md bg-slate-200" />
            <div className="h-16 w-full rounded-xl bg-slate-100" />
            <div className="h-4 w-2/3 rounded-md bg-slate-100" />
          </div>
        </section>
      </main>
    );
  }

  if (!ev) {
    return (
      <main className="maxw container-px py-10">
        <p className="mb-3 text-sm text-slate-600">Event not found.</p>
        <Link
          href="/events"
          className="text-sm text-[var(--brand-red,#D42A30)] hover:underline"
        >
          ← Back to Events
        </Link>
      </main>
    );
  }

  const heroSrc =
    ev.images?.hero || ev.images?.thumbnail || "/images/swinburne-logo.jpg";

  const venueStr = `${ev.venue.building}${ev.venue.level ? `, ${ev.venue.level}` : ""}${
    ev.venue.room ? `, ${ev.venue.room}` : ""
  }`;

  const mapHref = gmSearchUrl({ lat: ev.lat, lng: ev.lng, address: venueStr });

  const dateLabel = isLoaded
    ? formatDate(new Date(ev.date), settings.dateFormat)
    : new Date(ev.date).toLocaleDateString();

  const timeStartLabel = isLoaded
    ? formatTime(new Date(ev.date), settings.timeFormat)
    : new Date(ev.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  const timeEndLabel =
    ev.endDate &&
    (isLoaded
      ? formatTime(new Date(ev.endDate), settings.timeFormat)
      : new Date(ev.endDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }));

  const handleAddToCalendar = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const startDate = new Date(ev.date);
    const endDate = new Date(ev.endDate || ev.date);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      ev.title
    )}&dates=${startDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]}Z/${endDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]}Z&details=${encodeURIComponent(
      ev.description || ""
    )}&location=${encodeURIComponent(venueStr)}`;

    try {
      const w = window.open(calendarUrl, "_blank");
      if (!w || w.closed || typeof w.closed === "undefined") {
        throw new Error("popup blocked");
      }
      setToast("✓ Opened in Google Calendar");
    } catch {
      const d = (x: Date) =>
        x.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Swinburne//Events//EN",
        "BEGIN:VEVENT",
        `UID:${ev.id}@swin-app`,
        `DTSTAMP:${d(startDate)}`,
        `DTSTART:${d(startDate)}`,
        `DTEND:${d(endDate)}`,
        `SUMMARY:${ev.title}`,
        `LOCATION:${venueStr}`,
        `DESCRIPTION:${(ev.description || "").replace(/\n/g, "\\n")}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([ics], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ev.title.replace(/\s+/g, "_")}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("Downloaded .ics file");
    }

    setTimeout(() => setToast(null), 2000);
  };

  const handleShare = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://swin-app/events/${ev.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: ev.title,
          text: ev.description || "Check out this campus event",
          url,
        });
        return;
      } catch {
        // ignore
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch {
      setToast("Copy this link: " + url);
    }

    setTimeout(() => setToast(null), 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50/40 pb-[96px]">
      <section className="maxw container-px pt-2">
        <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-slate-900 shadow-sm sm:h-52">
          <img
            src={heroSrc}
            alt={ev.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-sm backdrop-blur-sm transition active:scale-95"
            >
              <span>←</span>
              <span>Events</span>
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-4 space-y-1.5 px-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-sm">
              {ev.category}
              {ev.organizer ? (
                <span className="text-[10px] text-slate-200/80">· {ev.organizer}</span>
              ) : null}
            </span>
            <h1 className="line-clamp-2 text-xl font-semibold leading-snug text-white drop-shadow-sm sm:text-2xl">
              {ev.title}
            </h1>
          </div>
        </div>
      </section>

      <div id="event-hero-end" />

      <section className="maxw container-px mt-4 space-y-4">
        {ev.description ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800 px-4 py-4 text-slate-50 shadow-lg sm:px-5 sm:py-5">
            <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(212,42,48,0.35),transparent_60%)]" />
            <div className="relative space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-200/90">
                <span className="text-lg">“</span>
                <span>About this event</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-50/95">
                {ev.description}
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Event details
            </h2>

            <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3.5 text-[13px] text-slate-700">
              <div className="flex items-start gap-2">
                <div className="mt-[1px] text-base">📅</div>
                <div className="space-y-0.5">
                  <div className="font-medium">{dateLabel}</div>
                  <div className="text-[13px] text-slate-600">
                    {timeStartLabel}
                    {timeEndLabel ? ` — ${timeEndLabel}` : ""}
                  </div>
                </div>
              </div>

              <div className="mx-1 h-px bg-slate-200/80" />

              <div className="flex items-start gap-2">
                <div className="mt-[1px] text-base">📍</div>
                <div className="text-[13px] leading-snug text-slate-700">
                  {venueStr}
                  {mapHref ? (
                    <>
                      {" · "}
                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--brand-red,#D42A30)] underline"
                      >
                        Open in Maps
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {ev.tags && ev.tags.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {ev.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {ev.pricing || ev.registration ? (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Attendance
              </h2>

              <div className="space-y-1 text-sm text-slate-700">
                {ev.pricing ? (
                  <div className="flex items-center gap-2">
                    <span>💲</span>
                    <span>
                      {ev.pricing.type === "free"
                        ? "Free"
                        : `${ev.pricing.amount.toFixed(2)} ${ev.pricing.currency || "MYR"}`}
                    </span>
                  </div>
                ) : null}

                {ev.registration && ev.registration.type !== "none" ? (
                  <div className="flex items-start gap-2">
                    <span className="mt-[1px]">📝</span>
                    <div>
                      {ev.registration.type === "link" ? (
                        <>
                          <span>Registration required: </span>
                          <a
                            href={ev.registration.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--brand-red,#D42A30)] underline"
                          >
                            open form
                          </a>
                          {ev.registration.deadline ? (
                            <>
                              {" · closes "}
                              {formatDate(new Date(ev.registration.deadline), settings.dateFormat)}
                            </>
                          ) : null}
                        </>
                      ) : (
                        "Registration required"
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {ev.accessibility && ev.accessibility.length > 0 ? (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Accessibility
              </h2>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-700">
                {ev.accessibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCalendar}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-sm font-medium text-white shadow-sm transition active:scale-95"
              >
                <span>🗓</span>
                <span>Add to calendar</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm transition active:scale-95"
                aria-label="Share event"
              >
                ↗
              </button>
            </div>
          </section>
        </div>
      </section>

      <EventActionBar ev={ev} />

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
          {toast}
        </div>
      ) : null}
    </main>
  );
}