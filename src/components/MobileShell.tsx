"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { signOut } from "next-auth/react";

const AssistantChat = dynamic(() => import("./AssistantChat"), { ssr: false });

/* =============================================================================
   Home widgets + icons
============================================================================= */

export const PhoneIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2a1 1 0 011.02-.24c1.1.36 2.3.56 3.58.6a1 1 0 011 1v3.4a1 1 0 01-1 1C9.82 21 3 14.18 3 5.99a1 1 0 011-1h3.4a1 1 0 011 1c.04 1.28.24 2.48.6 3.58a1 1 0 01-.24 1.02L6.6 10.8z" />
  </svg>
);

export const ShieldIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z" />
  </svg>
);

export const CompassIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm3.9 6.1L14 14l-5.9 1.9L10 10l5.9-1.9z" />
  </svg>
);

export const MapPinIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
  </svg>
);

export const ChatIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16v12H7l-3 3V4z" />
  </svg>
);

export const CalendarIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2h2v2h6V2h2v2h3a2 2 0 012 2v13a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3V2zm13 7H4v10h16V9z" />
  </svg>
);

export const BookIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 4a3 3 0 013-3h12v18H8a3 3 0 00-3 3V4zM8 2a1 1 0 00-1 1v15a5 5 0 011-.1h11V2H8z" />
  </svg>
);

export const HealthIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 4h-3v4.5H6v3h4.5V16H13.5v-4.5H18v-3h-4.5z" />
  </svg>
);

export const SupportIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.5 6a3 3 0 103 3 3 3 0 00-3-3zm11 0a3 3 0 103 3 3 3 0 00-3-3zM4 18v2h16v-2c0-2.76-4.48-4.5-8-4.5S4 15.24 4 18z" />
  </svg>
);

export const MoneyIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 5h16v14H4z" opacity="0.4" />
    <path d="M12 8a3 3 0 00-3 3h2a1 1 0 011-1 1 1 0 010 2 3 3 0 103 3h-2a1 1 0 11-1-1 3 3 0 100-6z" />
  </svg>
);

export const WifiIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.3 8.7c5.3-5.3 14-5.3 19.4 0l-1.8 1.8c-4.4-4.4-11.3-4.4-15.7 0zm3.6 3.7c3.8-3.8 10-3.8 13.9 0l-1.8 1.8c-2.8-2.8-7.5-2.8-10.4 0zm3.7 3.7a5.7 5.7 0 018.1 0L12 17.8z" />
  </svg>
);

export const InfoIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 4a1.25 1.25 0 11-1.25 1.25A1.25 1.25 0 0112 6zm1.5 11h-3v-1.5h.75V11H10V9.5h3v6h.5z" />
  </svg>
);

export const WellbeingIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z" />
  </svg>
);

function AssistantGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function AssistantAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const small = size === "sm";

  return (
    <span
      className={[
        "flex items-center justify-center ring-1 bg-[#D42A30]/10 text-[#D42A30] ring-[#D42A30]/15",
        small
          ? "h-5 w-5 rounded-[10px] shadow-[0_6px_14px_rgba(212,42,48,.12)]"
          : "h-10 w-10 rounded-2xl shadow-[0_10px_24px_rgba(212,42,48,.14)]",
      ].join(" ")}
      aria-hidden
    >
      <AssistantGlyph className={small ? "h-2.5 w-2.5" : "h-5 w-5"} />
    </span>
  );
}

export function FeatureBanner() {
  return (
    <section className="maxw container-px mt-6">
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_20px_60px_rgba(212,42,48,.25)]"
        style={{ background: "linear-gradient(135deg,#D42A30 0%,#8E0F1B 65%)" }}
        aria-label="Orientation"
      >
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="d" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#d)" />
          </svg>
        </div>

        <h2 className="relative text-2xl font-semibold">Orientation</h2>
        <p className="relative mt-1 text-sm text-white/90">
          7 things you should do before starting at Swinburne.
        </p>
        <Link
          href="/orientation"
          className="relative mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-[#D42A30] hover:opacity-90"
        >
          Learn more →
        </Link>
      </div>
    </section>
  );
}

export type EventItem = {
  date: string;
  title: string;
  location?: string;
  href?: string;
};

type MiniEventsProps = {
  items?: EventItem[];
  limit?: number;
  showHeading?: boolean;
  showSeeAll?: boolean;
  className?: string;
};

export function MiniEvents({
  items,
  limit = 3,
  showHeading = true,
  showSeeAll = false,
  className = "",
}: MiniEventsProps) {
  const list = (items ?? []).slice(0, limit);

  return (
    <div className={className}>
      {showHeading && (
        <div className="mb-3 flex items-baseline justify-between">
          <h4 className="text-sm font-semibold">Upcoming events</h4>
          {showSeeAll && (
            <Link href="/events" prefetch={false} className="text-sm text-slate-500 hover:text-slate-700">
              See all →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {list.map((ev, i) =>
          ev.href ? (
            <Link
              key={i}
              href={ev.href}
              prefetch={false}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,.06)] transition hover:shadow-[0_16px_40px_rgba(0,0,0,.10)]"
            >
              <div className="text-sm text-slate-500">{ev.date}</div>
              <div className="mt-1 font-semibold text-slate-900">{ev.title}</div>
              {ev.location && <div className="mt-1 text-sm text-slate-500">{ev.location}</div>}
            </Link>
          ) : (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,.06)]"
            >
              <div className="text-sm text-slate-500">{ev.date}</div>
              <div className="mt-1 font-semibold text-slate-900">{ev.title}</div>
              {ev.location && <div className="mt-1 text-sm text-slate-500">{ev.location}</div>}
            </div>
          )
        )}

        {list.length === 0 && <div className="text-sm text-slate-500">No events to show.</div>}
      </div>
    </div>
  );
}

/* =============================================================================
   ProfileMenu
============================================================================= */

function getInitials(name?: string | null) {
  const clean = (name ?? "").trim();
  if (!clean) return "S";

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function UserGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

type ProfileMenuProps = {
  children?: ReactNode;
  className?: string;
  srLabel?: string;
};

type MeResponse = {
  authenticated: boolean;
  isAdmin: boolean;
  name: string | null;
  email: string | null;
};

export function ProfileMenu({
  children,
  className = "",
  srLabel = "Open account menu",
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as MeResponse;
        if (!cancelled) {
          setIsAdmin(Boolean(data.isAdmin));
          setName(data.name ?? null);
          setEmail(data.email ?? null);
        }
      } catch {
        // ignore
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(t)) {
        const m = document.getElementById("profile-menu");
        if (m && !m.contains(t)) setOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const displayName = (name ?? "").trim() || "Student";
  const initials = getInitials(displayName);

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "group relative grid h-10 w-10 shrink-0 place-content-center rounded-full",
          "border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.08)]",
          "ring-1 ring-white/70 transition",
          "hover:border-[#D42A30]/25 hover:shadow-[0_10px_26px_rgba(212,42,48,.14)]",
          "active:scale-[0.98]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/35",
          className,
        ].join(" ")}
      >
        <span className="sr-only">{srLabel}</span>

        <span
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-[#fff7f7] to-white text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/80"
        >
          {name ? initials : <UserGlyph />}
        </span>

        <span
          aria-hidden
          className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 shadow-sm"
        />
      </button>

      {open && (
        <div
          id="profile-menu"
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#D42A30] to-[#a11e23] text-sm font-semibold text-white shadow-sm">
              {name ? initials : <UserGlyph />}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{displayName}</div>
              <div className="truncate text-xs text-slate-500">
                {email?.trim() ? email : "Swinburne account"}
              </div>
            </div>
          </div>

          <Link
            href="/profile"
            className="block px-3 py-2.5 text-sm hover:bg-slate-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <Link
            href="/settings"
            className="block px-3 py-2.5 text-sm hover:bg-slate-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          {isAdmin ? (
            <>
              <div className="my-1 border-t border-slate-200" />
              <Link
                href="/admin"
                className="block px-3 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Admin Console
              </Link>
            </>
          ) : null}

          <div className="my-1 border-t border-slate-200" />

          <button
            type="button"
            className="block w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut({ callbackUrl: "/login" });
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   Header
============================================================================= */

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="h-[3px] w-full bg-[#D42A30]" aria-hidden />

      <div className="maxw container-px flex h-16 items-center justify-between gap-2">
        <Brand />

        <nav aria-label="Quick links" className="hidden items-center gap-2 md:flex">
          <QuickPill href="/navigate" label="Navigate" active={pathname.startsWith("/navigate")} />
          <QuickPill href="/emergency" label="Emergency" active={pathname.startsWith("/emergency")} />
          <QuickPill href="/support" label="Support" active={pathname.startsWith("/support")} />
          <QuickPill href="/events" label="Events" active={pathname.startsWith("/events")} />
          <QuickPill href="/study-break" label="Study Break" active={pathname.startsWith("/study-break")} />
          <QuickPill href="https://www.swinburne.edu.my/canvas/" label="Canvas" external />
          <QuickPill
            href="https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT"
            label="Student Portal"
            external
          />
        </nav>

        <ProfileMenu srLabel="Open account menu" />
      </div>

      <div className="border-t border-slate-200/70 bg-white/85 md:hidden">
        <nav aria-label="Quick links (mobile)" className="maxw container-px overflow-x-auto py-2 no-scrollbar">
          <ul className="flex w-max gap-2">
            <li><QuickPill href="/navigate" label="Navigate" compact /></li>
            <li><QuickPill href="/emergency" label="Emergency" compact /></li>
            <li><QuickPill href="/support" label="Support" compact /></li>
            <li><QuickPill href="/events" label="Events" compact /></li>
            <li><QuickPill href="/study-break" label="Study Break" compact /></li>
            <li><QuickPill href="https://www.swinburne.edu.my/canvas/" label="Canvas" compact external /></li>
            <li>
              <QuickPill
                href="https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT"
                label="Student Portal"
                compact
                external
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Swinburne home"
      className="flex min-w-0 flex-1 items-center gap-3 pr-2"
    >
      <Image
        src="/images/swinburne-logo.jpg"
        alt="Swinburne University of Technology"
        width={40}
        height={40}
        priority
        className="shrink-0 rounded-md object-cover shadow-sm ring-1 ring-black/10"
      />

      <div className="min-w-0 leading-tight">
        <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline">
          <span className="truncate text-[17px] font-semibold tracking-tight text-slate-900 sm:text-[18px]">
            Swinburne
          </span>
          <span className="text-[12px] font-medium text-slate-500 sm:ml-1 sm:text-[17px] sm:font-normal">
            Sarawak
          </span>
        </div>

        <span className="block text-[11px] text-slate-400 sm:hidden">
          University of Technology
        </span>
      </div>
    </Link>
  );
}

function QuickPill({
  href,
  label,
  external,
  active = false,
  compact = false,
}: {
  href: string;
  label: string;
  external?: boolean;
  active?: boolean;
  compact?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full border transition whitespace-nowrap " +
    (compact ? "text-xs px-2.5 py-1" : "text-sm px-3.5 py-1.5");

  const style = active
    ? "border-[#D42A30]/20 text-[#D42A30] bg-[#D42A30]/6 shadow-[0_6px_14px_rgba(212,42,48,.08)]"
    : "border-slate-300 text-slate-700 hover:border-[#D42A30] hover:text-[#D42A30]";

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={base + " " + style}
    >
      {label}
      {external && (
        <span className="ml-1" aria-hidden>
          ↗
        </span>
      )}
    </Link>
  );
}

/* =============================================================================
   QuickActions
============================================================================= */

const QUICK_ACTION_ITEMS = [
  { href: "/emergency", label: "Emergency", icon: "🚨", accent: "bg-red-50 text-red-700 border-red-200" },
  { href: "/navigate", label: "Navigate", icon: "🧭", accent: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { href: "/support", label: "Support", icon: "💬", accent: "bg-sky-50 text-sky-700 border-sky-200" },
  { href: "/events", label: "Events", icon: "📅", accent: "bg-amber-50 text-amber-700 border-amber-200" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_ACTION_ITEMS.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow transition hover:brightness-105 ${it.accent}`}
        >
          <span aria-hidden className="text-base">
            {it.icon}
          </span>
          <span>{it.label}</span>
        </Link>
      ))}
    </div>
  );
}

/* =============================================================================
   PinnedShortcuts
============================================================================= */

type PinnedItem = { href: string; label: string; external?: boolean; icon: string };

const PINNED_ITEMS: PinnedItem[] = [
  { href: "/navigate", label: "Navigate", icon: "🧭" },
  { href: "/support", label: "IT Support", icon: "🛠️" },
  { href: "/study-break", label: "Study Break", icon: "🎮" },
  { href: "https://www.swinburne.edu.my/canvas/", label: "Canvas", external: true, icon: "🎓" },
  {
    href: "https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT",
    label: "Student Portal",
    external: true,
    icon: "🪪",
  },
];

function accentFor(label: string) {
  if (/navigate|study break/i.test(label)) return "red";
  return "slate";
}

export function PinnedShortcuts() {
  return (
    <div className="maxw container-px mt-3">
      <div className="relative overflow-hidden rounded-2xl bg-white/75 shadow-[0_10px_26px_rgba(15,23,42,.06)] ring-1 ring-slate-200/70 backdrop-blur-xl">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.55] [background:radial-gradient(circle_at_15%_20%,rgba(212,42,48,.10),transparent_45%)]"
        />

        <div className="relative px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold text-slate-700">Quick shortcuts</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D42A30]" aria-hidden />
              Start with Navigate
            </div>
          </div>

          <div className="relative">
            <div className="no-scrollbar flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pr-6">
              {PINNED_ITEMS.map((it) => {
                const accent = accentFor(it.label);
                const external = !!it.external;

                const outer =
                  accent === "red"
                    ? "bg-gradient-to-r from-[#D42A30]/35 via-[#ffd0d0]/35 to-[#D42A30]/20"
                    : "bg-gradient-to-r from-slate-200 to-slate-100";

                const iconBubble =
                  accent === "red"
                    ? "bg-gradient-to-br from-[#D42A30]/18 to-white ring-1 ring-[#D42A30]/18 text-[#B0171E]"
                    : "bg-gradient-to-br from-slate-100 to-white ring-1 ring-slate-200 text-slate-700";

                return (
                  <Link
                    key={it.label}
                    href={it.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="shrink-0 snap-start"
                    aria-label={it.label}
                  >
                    <div className={`rounded-full p-[1px] ${outer}`}>
                      <div
                        className={[
                          "group inline-flex items-center gap-2 rounded-full px-3.5 py-2",
                          "bg-white/90 hover:bg-white",
                          "ring-1 ring-slate-200/60 shadow-sm",
                          "hover:shadow-[0_10px_24px_rgba(15,23,42,.10)] hover:ring-slate-300/70",
                          "active:scale-[0.99] transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2",
                        ].join(" ")}
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-2xl ${iconBubble}`} aria-hidden>
                          <span className="text-[15px]">{it.icon}</span>
                        </span>

                        <span className="whitespace-nowrap text-[13px] font-semibold text-slate-900">
                          {it.label}
                        </span>

                        {external ? (
                          <span
                            aria-hidden
                            className="ml-0.5 text-[11px] font-semibold text-slate-400"
                            title="Opens in new tab"
                          >
                            ↗
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white/90 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   ChatLauncher
============================================================================= */

const AssistantLauncherIcon = ({
  className = "h-[18px] w-[18px]",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

export function ChatLauncher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Campus Assistant"
        className={[
          "fixed z-[60] group",
          "inline-flex items-center justify-center",
          "rounded-full border border-slate-200/90 bg-white/96 ring-1 ring-white/80",
          "shadow-[0_16px_36px_rgba(15,23,42,.14)] backdrop-blur-xl",
          "transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(15,23,42,.18)] active:scale-[0.99]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          "h-14 w-14 p-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-2.5 sm:py-2",
        ].join(" ")}
        style={{
          right: "max(0.9rem, env(safe-area-inset-right))",
          bottom: "calc(env(safe-area-inset-bottom) + 5.1rem)",
        }}
      >
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D42A30]/10 text-[#D42A30] ring-1 ring-[#D42A30]/15 shadow-[0_8px_18px_rgba(212,42,48,.12)] transition group-hover:scale-[1.02]">
          <AssistantLauncherIcon />
        </span>

        <span className="hidden pr-1 text-[12.5px] font-semibold tracking-[0.01em] text-slate-900 sm:inline">
          Assistant
        </span>
      </button>

      {open && <AssistantChat onClose={() => setOpen(false)} />}
    </>
  );
}

/* =============================================================================
   BottomNav
============================================================================= */

const C = "currentColor";

const IconHome = (p: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const IconMsg = (p: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

const IconEssentials = (p: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="5" y="4" width="12" height="16" rx="2.5" />
    <path d="M9 8h4" />
    <path d="M9 12h5" />
    <path d="M9 16h3" />
    <path d="M17 7h1.5A1.5 1.5 0 0 1 20 8.5V19" />
  </svg>
);

const IconMenu = (p: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconBreak = (p: any) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke={C}
    strokeWidth="1.95"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="4.5" y="9" width="15" height="8.5" rx="4.25" />
    <path d="M8 13.25h3" />
    <path d="M9.5 11.75v3" />
    <circle cx="15.8" cy="12.8" r="0.8" fill={C} stroke="none" />
    <circle cx="17.6" cy="14.6" r="0.8" fill={C} stroke="none" />
  </svg>
);

const IconApps = (p: any) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconX = (p: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const IconSearch = (p: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const IconMic = (p: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
  </svg>
);

const IconScan = (p: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
);

const IconPhone = (p: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.4c.8.3 1.7.6 2.6.7A2 2 0 0 1 22 16.9z" />
  </svg>
);

const IconExit = (p: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M10 3v18" />
    <path d="M14 7h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5" />
    <path d="M13 12H3" />
    <path d="m10 9-3 3 3 3" />
  </svg>
);

type Action = {
  key: string;
  label: string;
  icon: ComponentType<any>;
  href?: string;
  run?: () => void | Promise<void>;
  description?: string;
  featured?: boolean;
  tone?: "red" | "blue" | "emerald" | "amber" | "slate";
};

const EMERGENCY = "082-260-607";
const EXIT_NAV = "/exit-navigation";

function ActionDockBtn({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Open quick actions"
      aria-expanded={open}
      onClick={onClick}
      className="group flex min-h-[62px] w-full flex-col items-center justify-center gap-1 rounded-2xl px-1"
    >
      <span
        className={[
          "relative grid h-10 w-10 place-items-center rounded-full text-white transition-all",
          "bg-gradient-to-b from-[#D42A30] to-[#a11e23]",
          "shadow-[0_10px_20px_rgba(212,42,48,.22)] ring-[3px] ring-white",
          "group-hover:scale-[1.03] group-active:scale-[0.98]",
          open ? "shadow-[0_14px_28px_rgba(212,42,48,.30)]" : "",
        ].join(" ")}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.32),transparent_45%)]"
        />
        <IconApps />
      </span>

      <span className="text-[10px] leading-none font-medium text-slate-600">Actions</span>
    </button>
  );
}

function toneClasses(tone: Action["tone"] = "slate") {
  switch (tone) {
    case "red":
      return {
        bubble: "bg-[#fff1f2] text-[#D42A30] ring-[#fecdd3]",
        soft: "from-[#fff7f7] to-white",
      };
    case "blue":
      return {
        bubble: "bg-sky-50 text-sky-700 ring-sky-200",
        soft: "from-sky-50 to-white",
      };
    case "emerald":
      return {
        bubble: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        soft: "from-emerald-50 to-white",
      };
    case "amber":
      return {
        bubble: "bg-amber-50 text-amber-700 ring-amber-200",
        soft: "from-amber-50 to-white",
      };
    default:
      return {
        bubble: "bg-slate-100 text-slate-700 ring-slate-200",
        soft: "from-slate-50 to-white",
      };
  }
}

function QuickActionCard({
  action,
  onClick,
}: {
  action: Action;
  onClick: () => void;
}) {
  const tone = toneClasses(action.tone);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b p-4 text-left",
        tone.soft,
        "shadow-[0_10px_24px_rgba(15,23,42,.06)] transition",
        "hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(15,23,42,.10)] hover:border-slate-300",
        "active:scale-[0.99]",
      ].join(" ")}
      aria-label={action.label}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/40 blur-2xl transition duration-300 group-hover:scale-110"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={[
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 shadow-sm",
            "[&_svg]:h-[20px] [&_svg]:w-[20px]",
            tone.bubble,
          ].join(" ")}
        >
          <action.icon />
        </span>

        <span className="mt-1 text-slate-300 transition group-hover:text-slate-400" aria-hidden>
          →
        </span>
      </div>

      <div className="relative mt-4">
        <div className="text-[14px] font-semibold text-slate-900">{action.label}</div>
        <div className="mt-1 text-[12px] leading-snug text-slate-500">
          {action.description ?? "Open this section"}
        </div>
      </div>
    </button>
  );
}

function QuickActionRow({
  action,
  onClick,
}: {
  action: Action;
  onClick: () => void;
}) {
  const tone = toneClasses(action.tone);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.995]"
      aria-label={action.label}
    >
      <span
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1",
          "[&_svg]:h-[18px] [&_svg]:w-[18px]",
          tone.bubble,
        ].join(" ")}
      >
        <action.icon />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-slate-900">
          {action.label}
        </span>
        <span className="block truncate text-[11.5px] text-slate-500">
          {action.description ?? "Open this section"}
        </span>
      </span>

      <span className="text-slate-300 transition group-hover:text-slate-400" aria-hidden>
        →
      </span>
    </button>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navDim, setNavDim] = useState(false);

  useEffect(() => {
    if (!isAdminRoute) return;
    setOpen(false);
    setScanOpen(false);
    setQuery("");
    setNavDim(false);
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;

    const body = document.body as HTMLElement;
    const html = document.documentElement as HTMLElement;
    const scrollY = window.scrollY;

    if (open || scanOpen) {
      (body as any).dataset.scrollLock = "1";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      html.style.overscrollBehaviorY = "contain";
    }

    return () => {
      if ((body as any).dataset.scrollLock) {
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        html.style.overscrollBehaviorY = "";
        delete (body as any).dataset.scrollLock;
        window.scrollTo(0, scrollY);
      }
    };
  }, [open, scanOpen, isAdminRoute]);

  useEffect(() => {
    if (open || scanOpen) {
      setNavDim(false);
      return;
    }

    let last = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (y < 8) setNavDim(false);
          else if (y > last + 6) setNavDim(true);
          else if (y < last - 6) setNavDim(false);
          last = y;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, scanOpen]);

  const tabs = [
    { label: "Home", href: "/", icon: <IconHome /> },
    { label: "Messages", href: "/messages", icon: <IconMsg /> },
    { label: "Essentials", href: "/student-essentials", icon: <IconEssentials /> },
    { label: "Break", href: "/study-break", icon: <IconBreak /> },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const actions: Action[] = useMemo(
    () => [
      {
        key: "navigate",
        label: "Navigate",
        icon: IconHome,
        href: "/navigate",
        description: "Turn-by-turn campus directions",
        featured: true,
        tone: "red",
      },
      {
        key: "support",
        label: "Support",
        icon: IconMenu,
        href: "/support",
        description: "Get help and campus assistance",
        featured: true,
        tone: "blue",
      },
      {
        key: "events",
        label: "Events",
        icon: CalendarIcon,
        href: "/events",
        description: "What’s happening on campus",
        featured: true,
        tone: "amber",
      },
      {
        key: "call",
        label: "Call Security",
        icon: IconPhone,
        description: `Immediate help · ${EMERGENCY}`,
        featured: true,
        tone: "emerald",
        run: () => {
          window.location.href = `tel:${EMERGENCY}`;
        },
      },
      {
        key: "messages",
        label: "Messages",
        icon: IconMsg,
        href: "/messages",
        description: "Open your conversations",
        tone: "slate",
      },
      {
        key: "student-essentials",
        label: "Student Essentials",
        icon: IconEssentials,
        href: "/student-essentials",
        description: "Student info, fees, exams and graduation",
        tone: "slate",
      },
      {
        key: "settings",
        label: "Settings",
        icon: IconMenu,
        href: "/settings",
        description: "Profile, accessibility and app options",
        tone: "slate",
      },
      {
        key: "exit",
        label: "Exit Navigation",
        icon: IconExit,
        href: EXIT_NAV,
        description: "Emergency way out guidance",
        tone: "red",
      },
      {
        key: "break",
        label: "Study Break",
        icon: IconBreak,
        href: "/study-break",
        description: "Quick browser games for a short reset",
        tone: "amber",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.key.includes(q));
  }, [actions, query]);

  const featuredActions = filtered.filter((a) => a.featured);
  const regularActions = filtered.filter((a) => !a.featured);

  const run = (a: Action) => {
    setOpen(false);
    if (a.run) return a.run();
    if (a.href) router.push(a.href);
  };

  const recRef = useRef<any>(null);

  const onMic = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported");
      return;
    }
    if (recRef.current) recRef.current.stop();
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => setQuery(e.results[0][0].transcript || "");
    rec.onerror = () => {};
    recRef.current = rec;
    rec.start();
  };

  if (isAdminRoute) return null;

  return (
    <>
      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50"
        data-dim={navDim}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <div className="mx-auto w-full max-w-[760px] px-2 pb-1 sm:px-3">
          <div
            className={[
              "nav-chrome pointer-events-auto relative overflow-visible rounded-[24px]",
              "border border-white/80 bg-white/94 ring-1 ring-slate-200",
              "shadow-[0_12px_28px_rgba(15,23,42,.10)] supports-[backdrop-filter]:backdrop-blur-xl",
              "before:pointer-events-none before:absolute before:inset-x-12 before:top-0 before:h-px",
              "before:bg-gradient-to-r before:from-transparent before:via-[#D42A30]/25 before:to-transparent",
            ].join(" ")}
          >
            <ul className="grid grid-cols-5 items-center px-1.5 py-1.5">
              {tabs.slice(0, 2).map((t) => (
                <li key={t.href} className="col-span-1">
                  <NavBtn href={t.href} label={t.label} active={isActive(t.href)}>
                    {t.icon}
                  </NavBtn>
                </li>
              ))}

              <li className="col-span-1">
                <ActionDockBtn open={open} onClick={() => setOpen(true)} />
              </li>

              {tabs.slice(2).map((t) => (
                <li key={t.href} className="col-span-1">
                  <NavBtn href={t.href} label={t.label} active={isActive(t.href)}>
                    {t.icon}
                  </NavBtn>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Quick actions">
          <button
            className="absolute inset-0 animate-backdrop bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[760px] px-3 sm:px-4">
            <div className="boomerang-sheet relative mb-[max(env(safe-area-inset-bottom),8px)] overflow-hidden rounded-t-[30px] border border-slate-200 bg-[#fcfcfd] shadow-[0_-20px_60px_rgba(2,6,23,.22)]">
              <div className="border-b border-slate-200/80 px-4 pb-3 pt-3 sm:px-5">
                <div className="mb-3 flex items-center justify-center">
                  <span aria-hidden className="block h-1 w-14 rounded-full bg-slate-300/80" />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[17px] font-semibold tracking-tight text-slate-900">
                      Quick actions
                    </div>
                    <div className="mt-1 text-[12.5px] text-slate-500">
                      Jump anywhere faster with cleaner shortcuts.
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                    aria-label="Close quick actions"
                  >
                    <IconX />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                    <span className="text-slate-400">
                      <IconSearch />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search quick actions"
                      className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    onClick={onMic}
                    aria-label="Voice input"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
                  >
                    <IconMic />
                  </button>

                  <button
                    onClick={() => setScanOpen(true)}
                    aria-label="Open scanner"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
                  >
                    <IconScan />
                  </button>
                </div>
              </div>

              <div
                className="sheet-scroll max-h-[72svh] overflow-y-auto overscroll-contain px-4 pb-5 pt-4 sm:px-5"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {filtered.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-[13px] text-slate-500">
                    No quick actions found.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {featuredActions.length > 0 && (
                      <section>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {query ? "Best matches" : "Essentials"}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {featuredActions.map((a) => (
                            <QuickActionCard key={a.key} action={a} onClick={() => run(a)} />
                          ))}
                        </div>
                      </section>
                    )}

                    {regularActions.length > 0 && (
                      <section>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          More actions
                        </div>

                        <div className="space-y-2">
                          {regularActions.map((a) => (
                            <QuickActionRow key={a.key} action={a} onClick={() => run(a)} />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {scanOpen && (
        <Scanner
          onClose={() => setScanOpen(false)}
          onResult={(txt) => {
            setScanOpen(false);
            setOpen(false);
            try {
              const u = new URL(txt);
              window.location.href = u.toString();
            } catch {
              navigator.clipboard?.writeText(txt);
              alert(`Scanned: ${txt}`);
            }
          }}
        />
      )}

      <style jsx global>{`
        @keyframes backdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-backdrop {
          animation: backdropIn 0.18s ease-out both;
        }

        @keyframes boomerangSheetIn {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.99);
            border-radius: 38px;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            border-radius: 30px;
          }
        }

        .boomerang-sheet {
          animation: boomerangSheetIn 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transform-origin: bottom center;
          will-change: transform, opacity;
        }

        .overscroll-contain {
          overscroll-behavior: contain;
        }

        .sheet-scroll {
          -webkit-overflow-scrolling: touch;
        }

        nav[data-dim="true"] .nav-chrome {
          transform: translateY(4px);
          opacity: 0.94;
        }

        nav .nav-chrome {
          transition: transform 0.22s ease, opacity 0.22s ease, box-shadow 0.22s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-backdrop,
          .boomerang-sheet {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

function NavBtn({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl px-1"
    >
      <div
        className={[
          "grid h-8.5 w-8.5 place-items-center rounded-[18px] transition-all",
          "[&_svg]:block [&_svg]:h-[20px] [&_svg]:w-[20px] [&_svg]:shrink-0",
          active
            ? "bg-gradient-to-b from-[#fff7f7] to-[#fff1f1] text-[#D42A30] ring-1 ring-[#D42A30]/12 shadow-[0_6px_14px_rgba(212,42,48,.08)]"
            : "text-slate-500 group-hover:bg-slate-100/80 group-hover:text-slate-800",
        ].join(" ")}
      >
        {children}
      </div>

      <span
        className={[
          "text-[10px] leading-none transition-colors",
          active
            ? "font-semibold text-slate-900"
            : "font-medium text-slate-500 group-hover:text-slate-700",
        ].join(" ")}
      >
        {label}
      </span>
    </Link>
  );
}

function Scanner({ onClose, onResult }: { onClose: () => void; onResult: (txt: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const raf = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    const has = typeof window !== "undefined" && (window as any).BarcodeDetector;
    setSupported(!!has);
    let running = true;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) {
          (videoRef.current as any).srcObject = stream;
          await videoRef.current.play();
        }
        if (!has) return;

        const det = new (window as any).BarcodeDetector({
          formats: ["qr_code", "aztec", "pdf417", "data_matrix", "code_128"],
        });

        const tick = async () => {
          if (!running || !videoRef.current) return;
          const codes = await det.detect(videoRef.current).catch(() => []);
          if (codes && codes[0]?.rawValue) {
            running = false;
            onResult(codes[0].rawValue);
            return;
          }
          raf.current = requestAnimationFrame(tick);
        };

        tick();
      } catch {
        // camera blocked
      }
    })();

    return () => {
      running = false;
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const has = (window as any).BarcodeDetector;
      if (!has) {
        alert("No scanner available here");
        return;
      }
      const det = new (window as any).BarcodeDetector();
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const codes = await det.detect(canvas);
      if (codes && codes[0]?.rawValue) onResult(codes[0].rawValue);
      else alert("No code found in image");
    } catch {
      alert("Could not scan image");
    }
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Scanner">
      <button className="absolute inset-0 animate-backdrop bg-slate-900/60" onClick={onClose} />
      <div className="absolute inset-x-0 top-[10%] mx-auto w-full max-w-[520px] px-4 sm:px-6">
        <div className="boomerang-sheet overflow-hidden rounded-2xl bg-black/90 shadow-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between px-3 py-2 text-white/90">
            <span className="text-[13px]">Scan a QR / barcode</span>
            <button onClick={onClose} className="rounded-md px-2 py-1 hover:bg-white/10">
              <IconX />
            </button>
          </div>

          <div className="relative aspect-[16/10] bg-black">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-6 rounded-2xl ring-2 ring-white/70" />
          </div>

          {!supported && (
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-3">
              <span className="text-[13px] text-slate-700">Camera scanning not supported — pick a photo</span>
              <label className="cursor-pointer rounded-md px-2 py-1 text-[13px] ring-1 ring-slate-300 hover:bg-slate-50">
                Choose image
                <input type="file" accept="image/*" capture="environment" hidden onChange={onPickFile} />
              </label>
            </div>
          )}

          {supported && (
            <div className="bg-white px-3 py-2 text-[12.5px] text-slate-600">
              Tip: center the code in the frame. We’ll auto-open URLs, copy other text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}