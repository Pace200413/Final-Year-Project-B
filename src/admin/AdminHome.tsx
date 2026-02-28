// src/admin/admin.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* -----------------------------------------
   Mock data (you can move to src/admin/mock.ts later)
----------------------------------------- */
export const metrics = {
  activeUsersToday: 312,
  peakHour: "11:00",
  openIncidents7d: [2, 2, 1, 3, 2, 1, 1],
  servicesDown7d: [0, 1, 0, 0, 1, 0, 0],
  mostAccessed: "Wi-Fi / Network",
  sla: { within: 18, total: 20 },
  avgResolutionHrs: 3.2,
};

const cols = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const rows = ["Admissions","Library","Engineering","Student Centre","IT Helpdesk","Security","Cafeteria"];
const cells: number[][] = rows.map((_, r) =>
  cols.map((_, c) => {
    const middayBoost = c >= 10 && c <= 15 ? 2 : 0;
    const v = (r + c) % 3;
    return Math.min(3, v + middayBoost); // 0..3 (matches tone array below)
  })
);

export const heatmap = { rows, cols, cells };

/* -----------------------------------------
   Admin Shell (your sidebar/topbar)
----------------------------------------- */
type NavItem = { label: string; href: string; emoji: string };

const NAV: NavItem[] = [
  { label: "Overview",        href: "/admin",                 emoji: "🏠" },
  { label: "Exit Navigation", href: "/admin/exit-navigation", emoji: "🚪" },
  { label: "Safety",          href: "/admin/safety",          emoji: "🛡️" },
  { label: "Security",        href: "/admin/security",        emoji: "🚨" },
  { label: "Support",         href: "/admin/support",         emoji: "🛟" },
  { label: "Events",          href: "/admin/events",          emoji: "📅" },
  { label: "Banners",         href: "/admin/banners",         emoji: "📣" },
  { label: "Services",        href: "/admin/services",        emoji: "🗂️" },
  { label: "Incidents",       href: "/admin/incidents",       emoji: "🚦" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container-px maxw flex h-14 items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="mr-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50 md:hidden"
            aria-label="Open admin menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
              ADMIN
            </span>
            <h1 className="text-sm font-semibold">Console</h1>
          </div>
          <Link href="/profile" className="text-sm underline">Profile</Link>
        </div>
      </header>

      <div className="container-px maxw grid grid-cols-1 gap-4 py-4 md:grid-cols-[16rem_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white p-4 transition-transform md:static md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Admin navigation"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Admin</div>
            <button
              className="rounded-lg px-2 py-1 text-sm hover:bg-slate-50 md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="grid gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  isActive(n.href)
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <span className="mr-2">{n.emoji}</span>
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}

/* -----------------------------------------
   Widgets (keep yours in src/components if you want)
   I’m keeping placeholders here to keep the example minimal.
   You can import your existing AdminWidgets instead.
----------------------------------------- */

// If you want to keep using your existing file:
// import { MobileHeader, StatCard, MiniStat, SLAWidget, HealthHeatmap } from "@/components/AdminWidgets";

// Minimal placeholders (remove if you import the real ones)
function MobileHeader() { return null; }
function StatCard(_: any) { return null; }
function MiniStat(_: any) { return null; }
function SLAWidget(_: any) { return null; }
function HealthHeatmap(_: any) { return null; }

/* -----------------------------------------
   Pages
----------------------------------------- */
export function AdminHome() {
  const recent = [
    { id:"A1092", at:"10:42", who:"admin",   what:"Published banner “Power maintenance”" },
    { id:"A1091", at:"09:18", who:"j.smith", what:"Updated service “Wi-Fi / Network” (SLA 8×5)" },
    { id:"A1090", at:"08:55", who:"admin",   what:"Closed incident “Portal login failures”" },
  ];

  return (
    <>
      <MobileHeader />
      {/* keep your full dashboard JSX here (same as your current AdminHome) */}
      <div className="p-3">Admin dashboard here…</div>
      <div className="divide-y divide-slate-200 p-3">
        {recent.map(r=>(
          <div key={r.id} className="py-3 text-sm">
            <div className="text-slate-500">#{r.id} · {r.at} · {r.who}</div>
            <div className="mt-1">{r.what}</div>
          </div>
        ))}
      </div>
    </>
  );
}

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
    <main className="mx-auto my-8 max-w-md px-4">
      {/* keep your full sign-in JSX here */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="input w-full" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
        <input className="input w-full" value={pwd} onChange={(e)=>setPwd(e.target.value)} placeholder="password" type={show ? "text" : "password"} />
        <button type="button" className="text-xs underline" onClick={()=>setShow(s=>!s)}>{show ? "Hide" : "Show"}</button>
        {caps && <div className="text-xs text-amber-700">Caps Lock is on</div>}
        {err && <div className="text-sm text-rose-700">{err}</div>}
        <button className="btn btn-primary w-full" disabled={!canSubmit}>{loading ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}

/* -----------------------------------------
   Sections routing (single component per section)
----------------------------------------- */
export function AdminSection({ section }: { section: string }) {
  // Replace these placeholders with your real pages as you migrate them
  const map: Record<string, ReactNode> = {
    "exit-navigation": <div className="p-3">Exit Navigation page…</div>,
    "safety": <div className="p-3">Safety page…</div>,
    "security": <div className="p-3">Security page…</div>,
    "support": <div className="p-3">Support page…</div>,
    "events": <div className="p-3">Events page…</div>,
    "banners": <div className="p-3">Banners page…</div>,
    "services": <div className="p-3">Services page…</div>,
    "incidents": <div className="p-3">Incidents page…</div>,
  };

  return map[section] ?? <div className="p-3">Unknown section: {section}</div>;
}