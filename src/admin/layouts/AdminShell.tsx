"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  description: string;
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin", description: "Main dashboard" },
  { label: "Events", href: "/admin/events", description: "Campus events" },
  { label: "Emergency", href: "/admin/emergency", description: "Emergency content" },
  { label: "Safety", href: "/admin/safety", description: "Safety information" },
  { label: "Support", href: "/admin/support", description: "Support page" },
  { label: "Security Contact", href: "/admin/security-contact", description: "Phone numbers" },
  { label: "Student Essentials", href: "/admin/student-essentials", description: "Student essentials links" },
  { label: "New to Swinburne", href: "/admin/new-to-swinburne", description: "New student onboarding page" },
  { label: "Scholarships", href: "/admin/scholarships", description: "Funding and payment links" },
  { label: "Book a Room", href: "/admin/book-a-room", description: "Room booking page content" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Swinburne Sarawak
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Admin Console
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Desktop workspace for managing the app content.
            </p>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to profile
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
          <div className="mb-4 border-b border-slate-100 pb-4">
            <div className="text-sm font-semibold text-slate-900">Navigation</div>
            <div className="mt-1 text-xs text-slate-500">
              Keep it simple and easy to scan.
            </div>
          </div>

          <nav className="space-y-2" aria-label="Admin navigation">
            {NAV.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl border px-4 py-3 transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div
                    className={`mt-1 text-xs ${
                      active ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}