"use client";

import { useEffect, useState, type MouseEvent } from "react";
import type { CampusEvent } from "@/lib/types";
import EventActionBar from "@/app/events/EventActionBar";
import Link from "next/link";
import Image from "next/image";
import { formatTime, formatDate, gmSearchUrl } from "@/lib/utils";
import { useLocale } from "@/lib/client";
import { useParams } from "next/navigation";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [ev, setEv] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { settings, isLoaded } = useLocale();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`/api/events/${id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((j) => {
        setEv(j.item as CampusEvent);
        setLoading(false);
      })
      .catch(() => {
        setEv(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="bg-slate-50/40 min-h-screen pb-24">
        <section className="maxw container-px pt-2">
          <div className="relative h-40 sm:h-52 w-full bg-slate-200 animate-pulse rounded-3xl" />
        </section>
        <section className="maxw container-px mt-4 pb-4">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200/70 p-4 space-y-4">
            <div className="h-3 w-20 bg-slate-200 rounded-full" />
            <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-16 w-full bg-slate-100 rounded-xl" />
            <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
          </div>
        </section>
      </main>
    );
  }

  if (!ev) {
    return (
      <main className="maxw container-px py-10">
        <p className="text-sm text-slate-600 mb-3">Event not found.</p>
        <Link href="/events" className="text-[var(--brand-red,#D42A30)] hover:underline text-sm">
          ← Back to Events
        </Link>
      </main>
    );
  }

  const heroSrc = ev.images?.hero || ev.images?.thumbnail || "/images/swinburne-logo.jpg";
  const venueStr = `${ev.venue.building}${ev.venue.level ? `, ${ev.venue.level}` : ""}${ev.venue.room ? `, ${ev.venue.room}` : ""}`;

  const mapHref = gmSearchUrl({ lat: ev.lat, lng: ev.lng, address: venueStr });

  const dateLabel = isLoaded ? formatDate(new Date(ev.date), settings.dateFormat) : new Date(ev.date).toLocaleDateString();

  const timeStartLabel = isLoaded
    ? formatTime(new Date(ev.date), settings.timeFormat)
    : new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const timeEndLabel =
    ev.endDate &&
    (isLoaded
      ? formatTime(new Date(ev.endDate), settings.timeFormat)
      : new Date(ev.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  const handleAddToCalendar = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const startDate = new Date(ev.date);
    const endDate = new Date(ev.endDate || ev.date);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${startDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z&details=${encodeURIComponent(
      ev.description || ""
    )}&location=${encodeURIComponent(venueStr)}`;

    try {
      const w = window.open(calendarUrl, "_blank");
      if (!w || w.closed || typeof w.closed === "undefined") throw new Error("popup blocked");
      setToast("✓ Opened in Google Calendar");
    } catch {
      const d = (x: Date) => x.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
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

      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
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
    const url = typeof window !== "undefined" ? window.location.href : `https://swin-app/events/${ev.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: ev.title, text: ev.description || "Check out this campus event", url });
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
    <main className="bg-slate-50/40 min-h-screen pb-[96px]">
      <section className="maxw container-px pt-2">
        <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-slate-900 rounded-3xl shadow-sm">
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
              className="inline-flex items-center gap-1 rounded-full bg-slate-900/75 px-3 py-1.5 text-[11px] font-medium text-slate-100 backdrop-blur-sm shadow-sm active:scale-95 transition"
            >
              <span>←</span>
              <span>Events</span>
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-4 px-4 space-y-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-sm">
              {ev.category}
              {ev.organizer && <span className="text-[10px] text-slate-200/80">· {ev.organizer}</span>}
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold leading-snug text-white drop-shadow-sm line-clamp-2">{ev.title}</h1>
          </div>
        </div>
      </section>

      <div id="event-hero-end" />

      <section className="maxw container-px mt-4 space-y-4">
        {ev.description && (
          <div className="relative overflow-hidden rounded-2xl bg-slate-800 text-slate-50 shadow-lg border border-slate-700/60 px-4 py-4 sm:px-5 sm:py-5">
            <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(212,42,48,0.35),transparent_60%)]" />
            <div className="relative space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-200/90">
                <span className="text-lg">“</span>
                <span>About this event</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-50/95">{ev.description}</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white shadow-md border border-slate-200/80 p-4 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Event details</h2>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3.5 text-[13px] text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <div className="mt-[1px] text-base">📅</div>
                <div className="space-y-0.5">
                  <div className="font-medium">{dateLabel}</div>
                  <div className="text-slate-600 text-[13px]">
                    {timeStartLabel}
                    {timeEndLabel ? ` — ${timeEndLabel}` : ""}
                  </div>
                </div>
              </div>
              <div className="h-px bg-slate-200/80 mx-1" />
              <div className="flex items-start gap-2">
                <div className="mt-[1px] text-base">📍</div>
                <div className="text-slate-700 text-[13px] leading-snug">
                  {venueStr}
                  {mapHref && (
                    <>
                      {" · "}
                      <a href={mapHref} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-red,#D42A30)] underline font-medium">
                        Open in Maps
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {ev.tags && ev.tags.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {ev.tags.map((tag) => (
                  <span key={tag} className="text-[11px] rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(ev.pricing || ev.registration) && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Attendance</h2>
              <div className="text-sm text-slate-700 space-y-1">
                {ev.pricing && (
                  <div className="flex items-center gap-2">
                    <span>💲</span>
                    <span>{ev.pricing.type === "free" ? "Free" : `${ev.pricing.amount.toFixed(2)} ${ev.pricing.currency || "MYR"}`}</span>
                  </div>
                )}

                {ev.registration && ev.registration.type !== "none" && (
                  <div className="flex items-start gap-2">
                    <span className="mt-[1px]">📝</span>
                    <div>
                      {ev.registration.type === "link" ? (
                        <>
                          <span>Registration required: </span>
                          <a href={ev.registration.url} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-red,#D42A30)] underline font-medium">
                            open form
                          </a>
                          {ev.registration.deadline && (
                            <>
                              {" · closes "}
                              {formatDate(new Date(ev.registration.deadline), settings.dateFormat)}
                            </>
                          )}
                        </>
                      ) : (
                        "Registration required"
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {ev.accessibility && ev.accessibility.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Accessibility</h2>
              <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                {ev.accessibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Actions</h2>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCalendar}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white text-sm font-medium py-2.5 shadow-sm active:scale-95 transition"
              >
                <span>🗓</span>
                <span>Add to calendar</span>
              </button>
              <button
                onClick={handleShare}
                className="w-11 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-sm shadow-sm active:scale-95 transition"
                aria-label="Share event"
              >
                ↗
              </button>
            </div>
          </section>
        </div>
      </section>

      <EventActionBar ev={ev} />

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[9999] text-xs px-4 py-2 rounded-full bg-slate-900 text-white shadow-lg backdrop-blur-sm">
          {toast}
        </div>
      )}
    </main>
  );
}