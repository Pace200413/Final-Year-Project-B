"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CampusEvent } from "@/lib/types";

/* -----------------------------
   Small helpers
----------------------------- */
type ApiList<T> = { items?: T[]; item?: T; ok?: boolean; error?: string };

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function fmtShort(dt: Date) {
  return dt.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTime(dt: Date) {
  return dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function hoursSince(iso?: string) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, ms / 36e5);
}

function Badge({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "green" | "amber" | "red" | "blue";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : tone === "red"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : tone === "blue"
      ? "bg-sky-50 text-sky-700 ring-sky-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

function Pill({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "green" | "amber" | "red" | "blue";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-600 text-white"
      : tone === "amber"
      ? "bg-amber-600 text-white"
      : tone === "red"
      ? "bg-rose-600 text-white"
      : tone === "blue"
      ? "bg-sky-600 text-white"
      : "bg-slate-900 text-white";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function Dot({ tone }: { tone: "slate" | "amber" | "red" | "green" | "blue" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-500"
      : tone === "amber"
      ? "bg-amber-500"
      : tone === "red"
      ? "bg-rose-500"
      : tone === "blue"
      ? "bg-sky-500"
      : "bg-slate-400";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} aria-hidden />;
}

function MetricCard({
  label,
  value,
  hint,
  tone,
  pill,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "slate" | "green" | "amber" | "red" | "blue";
  pill: string;
  href?: string;
}) {
  const body = (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
          {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
        </div>
        <div className="shrink-0">
          <Pill tone={tone ?? "slate"}>{pill}</Pill>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block hover:opacity-[0.98]">
      {body}
    </Link>
  ) : (
    body
  );
}

/* -----------------------------
   Dashboard hook
----------------------------- */

type Incident = {
  id: string;
  service: string;
  status: "Operational" | "Degraded" | "Outage" | "Maintenance";
  title: string;
  note?: string;
  at: string;
  severity?: "low" | "medium" | "high";
};

type Service = {
  id: string;
  name: string;
  status: "Operational" | "Degraded" | "Outage" | "Maintenance";
  incidentsOpen: number;
  updatedAt: string;
  sla?: string;
};

type Banner = {
  id: string;
  title: string;
  message?: string;
  startAt: string;
  endAt?: string | null;
  active: boolean;
};

type ActivityRow = { id: string; ts: string; who: string; what: string };

type Analytics = {
  activeUsersToday?: number;
  peakHour?: string;
  mostAccessed?: string;
  avgResolutionHrs?: number;
};

function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const [eventsRes, incidentsRes, servicesRes, bannersRes, analyticsRes, activityRes] =
        await Promise.all([
          fetchJSON<ApiList<CampusEvent>>("/api/admin/events"),
          fetchJSON<ApiList<Incident>>("/api/admin/incidents"),
          fetchJSON<ApiList<Service>>("/api/admin/services"),
          fetchJSON<ApiList<Banner>>("/api/admin/banners"),
          fetchJSON<Analytics>("/api/admin/analytics"),
          fetchJSON<ApiList<ActivityRow>>("/api/admin/activity"),
        ]);

      if (!alive) return;

      setEvents(eventsRes?.items ?? []);
      setIncidents(incidentsRes?.items ?? []);
      setServices(servicesRes?.items ?? []);
      setBanners(bannersRes?.items ?? []);
      setAnalytics(analyticsRes ?? {});
      setActivity(
        activityRes?.items ?? [
          { id: "A1092", ts: new Date().toISOString(), who: "admin", what: "Published banner “Power maintenance”" },
          { id: "A1091", ts: new Date().toISOString(), who: "j.smith", what: "Updated service “Wi-Fi / Network” (SLA 8×5)" },
          { id: "A1090", ts: new Date().toISOString(), who: "admin", what: "Closed incident “Portal login failures”" },
        ]
      );

      setLoading(false);
      setLastUpdated(new Date());
    }

    load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return { loading, events, incidents, services, banners, analytics, activity, lastUpdated };
}

/* -----------------------------
   Admin Home (WOW polish)
----------------------------- */
export function AdminHome() {
  const { loading, events, incidents, services, banners, analytics, activity, lastUpdated } = useAdminDashboard();

  // ---------- derived ----------
  const draftEvents = useMemo(() => events.filter((e: any) => e?.isPublished === false).length, [events]);

  const todaysEvents = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return events
      .filter((e: any) => e?.date)
      .filter((e: any) => {
        const d = new Date(e.date).getTime();
        return d >= start.getTime() && d < end.getTime();
      })
      .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 5);
  }, [events]);

  const activeBanners = useMemo(() => {
    const now = Date.now();
    return (banners as any[]).filter((b) => {
      const active = b.active ?? b.isPublished ?? false;
      if (!active) return false;
      const s = +new Date(b.startAt ?? b.startsAt ?? new Date().toISOString());
      const e = b.endAt || b.endsAt ? +new Date(b.endAt ?? b.endsAt) : Infinity;
      return now >= s && now <= e;
    });
  }, [banners]);

  const incidentOpen = useMemo(() => {
    return (incidents as any[]).filter((i) => String(i.status).toLowerCase() !== "operational");
  }, [incidents]);

  const servicesImpacted = useMemo(() => {
    return (services as any[]).filter((s) => String(s.status).toLowerCase() !== "operational");
  }, [services]);

  const systemTone: "green" | "amber" | "red" = useMemo(() => {
    const hasOutage = servicesImpacted.some((s) => String(s.status).toLowerCase() === "outage");
    const hasHighSev = incidentOpen.some((i) => String(i.severity).toLowerCase() === "high");
    if (hasOutage || hasHighSev) return "red";
    if (incidentOpen.length > 0 || servicesImpacted.length > 0 || activeBanners.length > 0) return "amber";
    return "green";
  }, [incidentOpen, servicesImpacted, activeBanners]);

  const systemLabel =
    systemTone === "green" ? "All systems operational" : systemTone === "red" ? "Attention required" : "Monitoring";

  // ---------- unified “Needs attention” queue ----------
  type AttentionRow = {
    kind: "Incident" | "Service" | "Banner";
    title: string;
    meta: string;
    tone: "slate" | "amber" | "red";
    href: string;
    ts: string;
  };

  const attention = useMemo<AttentionRow[]>(() => {
    const rows: AttentionRow[] = [];

    for (const i of incidentOpen as any[]) {
      const sev = String(i.severity ?? "low").toLowerCase();
      const tone: AttentionRow["tone"] = sev === "high" ? "red" : sev === "medium" ? "amber" : "slate";
      rows.push({
        kind: "Incident",
        title: i.title ?? "Untitled incident",
        meta: `${i.service ?? "Unknown service"} · ${String(i.status ?? "Degraded")}`,
        tone,
        href: "/admin/incidents",
        ts: i.at ?? new Date().toISOString(),
      });
    }

    for (const s of servicesImpacted as any[]) {
      const st = String(s.status).toLowerCase();
      const tone: AttentionRow["tone"] = st === "outage" ? "red" : "amber";
      rows.push({
        kind: "Service",
        title: s.name ?? "Unnamed service",
        meta: `${s.status}${s.sla ? ` · SLA ${s.sla}` : ""}`,
        tone,
        href: "/admin/services",
        ts: s.updatedAt ?? new Date().toISOString(),
      });
    }

    for (const b of activeBanners.slice(0, 3) as any[]) {
      rows.push({
        kind: "Banner",
        title: b.title ?? "Untitled banner",
        meta: `Live announcement`,
        tone: "slate",
        href: "/admin/banners",
        ts: b.startAt ?? b.startsAt ?? new Date().toISOString(),
      });
    }

    rows.sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
    return rows.slice(0, 10);
  }, [incidentOpen, servicesImpacted, activeBanners]);

  // ---------- KPIs (3 max) ----------
  const kpi = {
    openIncidents: incidentOpen.length,
    servicesImpacted: servicesImpacted.length,
    activeBanners: activeBanners.length,
  };

  const pillIncidents = kpi.openIncidents > 0 ? "OPEN" : "OK";
  const toneIncidents: any = kpi.openIncidents > 0 ? "amber" : "green";

  const pillServices = kpi.servicesImpacted > 0 ? "IMPACTED" : "OK";
  const toneServices: any = kpi.servicesImpacted > 0 ? "red" : "green";

  const pillBanners = kpi.activeBanners > 0 ? "LIVE" : "NONE";
  const toneBanners: any = kpi.activeBanners > 0 ? "slate" : "slate";

  return (
    <div className="space-y-5">
      {/* Command bar */}
      <div className="card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">Admin Console</h1>
              <Badge tone="blue">Swinburne Sarawak</Badge>
              <Badge tone={systemTone}>{systemLabel}</Badge>
              {draftEvents > 0 ? <Badge tone="amber">{draftEvents} draft events</Badge> : null}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Incidents, service health, urgent announcements, and today’s activity.
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {lastUpdated ? `Last updated ${fmtShort(lastUpdated)}` : "Loading…"}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link className="btn btn-ghost" href="/admin/incidents?new=1">
              + Incident
            </Link>
            <Link className="btn btn-ghost" href="/admin/banners?new=1">
              + Banner
            </Link>
            <Link className="btn btn-ghost" href="/admin/events?new=1">
              + Event
            </Link>
          </div>
        </div>
      </div>

      {/* KPI strip (3 only) */}
      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard
          label="Open incidents"
          value={loading ? "—" : kpi.openIncidents}
          hint="Safety / security / IT issues"
          tone={toneIncidents}
          pill={pillIncidents}
          href="/admin/incidents"
        />
        <MetricCard
          label="Services impacted"
          value={loading ? "—" : kpi.servicesImpacted}
          hint={analytics?.mostAccessed ? `Most accessed: ${analytics.mostAccessed}` : "Wi-Fi, Portal, Library, etc."}
          tone={toneServices}
          pill={pillServices}
          href="/admin/services"
        />
        <MetricCard
          label="Active banners"
          value={loading ? "—" : kpi.activeBanners}
          hint="Live campus announcements"
          tone={toneBanners}
          pill={pillBanners}
          href="/admin/banners"
        />
      </div>

      {/* Main 2-column */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Needs attention */}
        <div className="lg:col-span-7">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Needs attention</h2>
              <div className="text-xs text-slate-500">Sorted by most recent</div>
            </div>

            <div className="mt-3 table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "120px" }}>Type</th>
                    <th>Item</th>
                    <th style={{ width: "260px" }}>Details</th>
                    <th style={{ width: "150px" }}>Updated</th>
                    <th style={{ width: "90px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-slate-500">
                        Loading…
                      </td>
                    </tr>
                  ) : attention.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-slate-500">
                        No active issues ✅
                      </td>
                    </tr>
                  ) : (
                    attention.map((r, idx) => (
                      <tr key={`${r.kind}-${idx}`}>
                        <td>
                          <span className="inline-flex items-center gap-2">
                            <Dot tone={r.tone === "slate" ? "slate" : r.tone} />
                            <span className="text-[13px] font-semibold text-slate-800">{r.kind}</span>
                          </span>
                        </td>
                        <td className="text-slate-900 font-medium">{r.title}</td>
                        <td className="text-slate-600 text-[13px]">{r.meta}</td>
                        <td className="text-slate-500">{fmtShort(new Date(r.ts))}</td>
                        <td>
                          <Link className="text-xs underline text-slate-600" href={r.href}>
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="chip" href="/admin/incidents">
                All incidents
              </Link>
              <Link className="chip" href="/admin/services">
                All services
              </Link>
              <Link className="chip" href="/admin/banners">
                All banners
              </Link>
            </div>
          </div>
        </div>

        {/* Today panel */}
        <div className="lg:col-span-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Today</h2>
              <Badge tone="slate">{new Date().toLocaleDateString()}</Badge>
            </div>

            <div className="mt-4 space-y-5">
              {/* Events */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Events</div>
                  <Link className="text-xs underline text-slate-600" href="/admin/events">
                    Manage
                  </Link>
                </div>

                <div className="mt-2 divide-y divide-slate-200 rounded-2xl border border-slate-200/70 bg-white/60">
                  {loading ? (
                    <div className="p-3 text-sm text-slate-500">Loading…</div>
                  ) : todaysEvents.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">No events scheduled today.</div>
                  ) : (
                    todaysEvents.map((e: any) => (
                      <div key={e.id} className="flex items-start justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{e.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {e?.date ? `${fmtTime(new Date(e.date))}` : "—"}
                            {e?.venue?.building ? ` · ${e.venue.building}` : ""}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge tone="blue">{String(e.category ?? "Event")}</Badge>
                          <Link className="text-xs underline text-slate-600" href={`/admin/events?id=${e.id}`}>
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live banners */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Live banners</div>
                  <Link className="text-xs underline text-slate-600" href="/admin/banners">
                    Manage
                  </Link>
                </div>

                <div className="mt-2 divide-y divide-slate-200 rounded-2xl border border-slate-200/70 bg-white/60">
                  {loading ? (
                    <div className="p-3 text-sm text-slate-500">Loading…</div>
                  ) : activeBanners.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">No live announcements.</div>
                  ) : (
                    activeBanners.slice(0, 3).map((b: any) => (
                      <div key={b.id} className="flex items-start justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{b.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {b.endAt || b.endsAt ? `Ends ${fmtShort(new Date(b.endAt ?? b.endsAt))}` : "No end time"}
                          </div>
                        </div>
                        <Badge tone="green">LIVE</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick links as chips */}
              <div className="pt-1">
                <div className="text-sm font-semibold">Quick links</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link className="chip" href="/admin/exit-navigation">
                    Exit Navigation
                  </Link>
                  <Link className="chip" href="/admin/safety">
                    Safety
                  </Link>
                  <Link className="chip" href="/admin/support">
                    Support directory
                  </Link>
                  <Link className="chip" href="/admin/emergency">
                    Emergency
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity table */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent changes</h2>
          <Badge tone="slate">Audit log</Badge>
        </div>

        <div className="mt-3 table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "180px" }}>Time</th>
                <th style={{ width: "160px" }}>Who</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : activity.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-slate-500">
                    No recent activity.
                  </td>
                </tr>
              ) : (
                activity.slice(0, 8).map((r) => (
                  <tr key={r.id}>
                    <td className="text-slate-500">{fmtShort(new Date(r.ts))}</td>
                    <td className="text-slate-700">{r.who}</td>
                    <td className="text-slate-900">{r.what}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <Link className="text-xs underline text-slate-600" href="/admin/activity">
            View all
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Admin Sign-in Page
----------------------------- */
export function AdminSignInPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = email.trim() !== "" && pwd.trim() !== "" && !loading;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => setCaps(e.getModifierState?.("CapsLock") ?? false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErr(null);

    try {
      await new Promise((r) => setTimeout(r, 500));
      const ok = email.toLowerCase().endsWith("@example.com") && pwd === "admin123";
      if (!ok) throw new Error("Invalid admin credentials.");
      window.location.assign("/admin");
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto my-10 max-w-md px-4">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Sign in</h1>
          <Badge tone="red">ADMIN</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">Restricted to Swinburne Sarawak staff/admin accounts.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            className="input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            autoComplete="username"
          />
          <input
            className="input w-full"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between">
            <button type="button" className="text-xs underline" onClick={() => setShow((s) => !s)}>
              {show ? "Hide" : "Show"} password
            </button>
            {caps && <div className="text-xs text-amber-700">Caps Lock is on</div>}
          </div>

          {err && <div className="text-sm text-rose-700">{err}</div>}

          <button className="btn btn-primary w-full" disabled={!canSubmit}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}