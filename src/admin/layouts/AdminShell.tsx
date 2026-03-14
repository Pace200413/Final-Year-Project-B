"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  emoji: string;
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin", emoji: "🏠" },
  { label: "Exit Navigation", href: "/admin/exit-navigation", emoji: "🚪" },
  { label: "Safety", href: "/admin/safety", emoji: "🛡️" },
  { label: "Emergency", href: "/admin/emergency", emoji: "🚨" },
  { label: "Support", href: "/admin/support", emoji: "🛟" },
  { label: "Security Contact", href: "/admin/security-contact", emoji: "📞" },
  { label: "Events", href: "/admin/events", emoji: "📅" },
  { label: "Banners", href: "/admin/banners", emoji: "📣" },
  { label: "Services", href: "/admin/services", emoji: "🗂️" },
  { label: "Incidents", href: "/admin/incidents", emoji: "🚦" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen">
      {/* Topbar */}
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

          <Link href="/profile" className="text-sm underline">
            Profile
          </Link>
        </div>
      </header>

      <div className="container-px maxw grid grid-cols-1 gap-4 py-4 md:grid-cols-[16rem_1fr]">
        {/* Sidebar */}
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
                    : "border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="mr-2">{n.emoji}</span>
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}