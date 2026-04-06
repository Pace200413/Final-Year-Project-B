"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CampusEvent } from "@/lib/types";

type ApiList<T> = {
  items?: T[];
  item?: T;
  ok?: boolean;
  error?: string;
};

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

type SectionCard = {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
};

const SECTIONS: SectionCard[] = [
  {
    title: "Events",
    description: "Create, edit, and publish campus events.",
    href: "/admin/events",
    eyebrow: "Content",
  },
  {
    title: "Emergency",
    description: "Update urgent actions and emergency page details.",
    href: "/admin/emergency",
    eyebrow: "Safety",
  },
  {
    title: "Safety",
    description: "Maintain safety guidance shown to students.",
    href: "/admin/safety",
    eyebrow: "Safety",
  },
  {
    title: "Support",
    description: "Edit support content and service information.",
    href: "/admin/support",
    eyebrow: "Help",
  },
  {
    title: "Security Contact",
    description: "Manage phone numbers and emergency contact details.",
    href: "/admin/security-contact",
    eyebrow: "Contacts",
  },
  {
    title: "Student Essentials",
    description: "Manage official student resource links.",
    href: "/admin/student-essentials",
    eyebrow: "Student",
  },
  {
    title: "New to Swinburne",
    description: "Manage onboarding cards and starting steps.",
    href: "/admin/new-to-swinburne",
    eyebrow: "Onboarding",
  },
  {
    title: "Scholarships",
    description: "Update funding and payment plan content.",
    href: "/admin/scholarships",
    eyebrow: "Funding",
  },
  {
    title: "Book a Room",
    description: "Manage discussion room booking instructions.",
    href: "/admin/book-a-room",
    eyebrow: "Services",
  },
];

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-500">{hint}</div>
    </div>
  );
}

function SectionLinkCard({
  title,
  description,
  href,
  eyebrow,
}: SectionCard) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </div>
      <div className="mt-3 text-lg font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 text-sm font-semibold text-slate-900">
        Open section{" "}
        <span className="inline-block transition group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CampusEvent[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      const res = await fetchJSON<ApiList<CampusEvent>>("/api/admin/events");

      if (!alive) return;

      setEvents(res?.items ?? []);
      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const totalEvents = events.length;

  const draftEvents = useMemo(
    () => events.filter((event: any) => event?.isPublished === false).length,
    [events]
  );

  const todaysEvents = useMemo(
    () => events.filter((event: any) => isToday(event?.date)).length,
    [events]
  );

  const upcomingEvents = useMemo(() => {
    const now = Date.now();

    return events
      .filter((event: any) => event?.date)
      .filter((event: any) => new Date(event.date).getTime() >= now)
      .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 5);
  }, [events]);

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-7">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Overview
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Admin overview
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Keep this page simple. Open the section you need, make changes quickly,
            and avoid clutter on the landing screen.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/events"
              className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Manage events
            </Link>
            <Link
              href="/admin/student-essentials"
              className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Open student essentials
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total events"
          value={loading ? "—" : totalEvents}
          hint="All event records"
        />
        <StatCard
          label="Today"
          value={loading ? "—" : todaysEvents}
          hint="Events scheduled today"
        />
        <StatCard
          label="Drafts"
          value={loading ? "—" : draftEvents}
          hint="Unpublished event items"
        />
        <StatCard
          label="Main sections"
          value={SECTIONS.length}
          hint="Core admin areas"
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick navigation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Open the part you want without reading through tables first.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SECTIONS.map((section) => (
            <SectionLinkCard key={section.href} {...section} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming events
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              A small preview only. Full editing stays inside the Events section.
            </p>
          </div>

          <Link
            href="/admin/events"
            className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Open events
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            Loading events…
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No upcoming events yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="divide-y divide-slate-200">
              {upcomingEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {event.title || "Untitled event"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatDateTime(event?.date)}
                      {event?.venue?.building ? ` · ${event.venue.building}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {String(event?.category ?? "Event")}
                    </span>
                    <Link
                      href={`/admin/events?id=${event.id}`}
                      className="text-sm font-semibold text-slate-900 underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}