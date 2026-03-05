"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode, type ComponentType } from "react";
import dynamic from "next/dynamic";

const AssistantChat = dynamic(() => import("./AssistantChat"), { ssr: false });

/* =============================================================================
   Home widgets + icons (merged from FeatureBanner / MiniEvents / icons.tsx)
============================================================================= */

/* --- icons.tsx exports --- */
export const PhoneIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2a1 1 0 011.02-.24c1.1.36 2.3.56 3.58.6a1 1 0 011 1v3.4a1 1 0 01-1 1C9.82 21 3 14.18 3 5.99a1 1 0 011-1h3.4a1 1 0 011 1c.04 1.28.24 2.48.6 3.58a1 1 0 01-.24 1.02L6.6 10.8z" />
  </svg>
);
export const ShieldIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3z" />
  </svg>
);
export const CompassIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm3.9 6.1L14 14l-5.9 1.9L10 10l5.9-1.9z" />
  </svg>
);
export const MapPinIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
  </svg>
);
export const ChatIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16v12H7l-3 3V4z" />
  </svg>
);
export const CalendarIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2h2v2h6V2h2v2h3a2 2 0 012 2v13a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3V2zm13 7H4v10h16V9z" />
  </svg>
);
export const BookIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 4a3 3 0 013-3h12v18H8a3 3 0 00-3 3V4zM8 2a1 1 0 00-1 1v15a5 5 0 011-.1h11V2H8z" />
  </svg>
);
export const HealthIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 4h-3v4.5H6v3h4.5V16H13.5v-4.5H18v-3h-4.5z" />
  </svg>
);
export const SupportIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.5 6a3 3 0 103 3 3 3 0 00-3-3zm11 0a3 3 0 103 3 3 3 0 00-3-3zM4 18v2h16v-2c0-2.76-4.48-4.5-8-4.5S4 15.24 4 18z" />
  </svg>
);
export const MoneyIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 5h16v14H4z" opacity="0.4" />
    <path d="M12 8a3 3 0 00-3 3h2a1 1 0 011-1 1 1 0 010 2 3 3 0 103 3h-2a1 1 0 11-1-1 3 3 0 100-6z" />
  </svg>
);
export const WifiIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.3 8.7c5.3-5.3 14-5.3 19.4 0l-1.8 1.8c-4.4-4.4-11.3-4.4-15.7 0zm3.6 3.7c3.8-3.8 10-3.8 13.9 0l-1.8 1.8c-2.8-2.8-7.5-2.8-10.4 0zm3.7 3.7a5.7 5.7 0 018.1 0L12 17.8z" />
  </svg>
);
export const InfoIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 4a1.25 1.25 0 11-1.25 1.25A1.25 1.25 0 0112 6zm1.5 11h-3v-1.5h.75V11H10V9.5h3v6h.5z" />
  </svg>
);
export const WellbeingIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z" />
  </svg>
);

/* --- FeatureBanner.tsx --- */
export function FeatureBanner() {
  return (
    <section className="maxw container-px mt-6">
      <div
        className="rounded-2xl p-6 text-white shadow-[0_20px_60px_rgba(212,42,48,.25)] relative overflow-hidden"
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
        <p className="relative text-white/90 text-sm mt-1">
          7 things you should do before starting at Swinburne.
        </p>
        <Link
          href="/orientation"
          className="relative inline-flex mt-4 items-center gap-2 bg-white text-[#D42A30] font-medium px-4 py-2 rounded-xl hover:opacity-90"
        >
          Learn more →
        </Link>
      </div>
    </section>
  );
}

/* --- MiniEvents.tsx --- */
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
   ProfileMenu.tsx (merged)
============================================================================= */

function useIsAdmin() {
  return useMemo(() => {
    if (process.env.NEXT_PUBLIC_IS_ADMIN === "1") return true;
    const c = typeof document !== "undefined" ? document.cookie : "";
    const role = c.split("; ").find((x) => x.startsWith("role="))?.split("=")[1];
    return role === "admin";
  }, []);
}

type ProfileMenuProps = {
  children?: ReactNode;
  className?: string;
  srLabel?: string;
};

export function ProfileMenu({ children, className = "", srLabel = "Open account menu" }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const isAdmin = useIsAdmin();
  const btnRef = useRef<HTMLButtonElement | null>(null);

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

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid h-10 w-10 place-content-center rounded-full ${className}`}
      >
        <span className="sr-only">{srLabel}</span>
        {children ?? <span aria-hidden>👤</span>}
      </button>

      {open && (
        <div
          id="profile-menu"
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="px-3 py-2 text-xs text-slate-500">Account</div>

          <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">
            Profile
          </Link>
          <Link href="/settings" className="block px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">
            Settings
          </Link>

          {isAdmin && (
            <>
              <div className="my-1 border-t border-slate-200" />
              <Link
                href="/admin"
                className="block px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                role="menuitem"
              >
                Admin Console
              </Link>
            </>
          )}

          <div className="my-1 border-t border-slate-200" />
          <button
            disabled
            className="block w-full cursor-not-allowed px-3 py-2 text-left text-sm text-slate-400"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   Header.tsx (merged)
============================================================================= */

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm">
      <div className="h-[3px] w-full bg-[#D42A30]" aria-hidden />

      <div className="maxw container-px h-16 flex items-center justify-between">
        <Brand />

        <nav aria-label="Quick links" className="hidden md:flex items-center gap-2">
          <QuickPill href="/navigate" label="Navigate" active={pathname.startsWith("/navigate")} />
          <QuickPill href="/emergency" label="Emergency" active={pathname.startsWith("/emergency")} />
          <QuickPill href="/support" label="Support" active={pathname.startsWith("/support")} />
          <QuickPill href="/events" label="Events" active={pathname.startsWith("/events")} />
          <QuickPill href="https://www.swinburne.edu.my/canvas/" label="Canvas" external />
          <QuickPill
            href="https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT"
            label="Student Portal"
            external
          />
        </nav>

        <ProfileMenu className="bg-slate-200 hover:bg-slate-300" srLabel="Open account menu">
          <span aria-hidden>👤</span>
        </ProfileMenu>
      </div>

      <div className="md:hidden border-t border-slate-200/70 dark:border-slate-700/70 bg-white/85 dark:bg-slate-900/85">
        <nav aria-label="Quick links (mobile)" className="maxw container-px py-2 overflow-x-auto no-scrollbar">
          <ul className="flex gap-2 w-max">
            <li>
              <QuickPill href="/navigate" label="Navigate" compact />
            </li>
            <li>
              <QuickPill href="/emergency" label="Emergency" compact />
            </li>
            <li>
              <QuickPill href="/support" label="Support" compact />
            </li>
            <li>
              <QuickPill href="/events" label="Events" compact />
            </li>
            <li>
              <QuickPill href="https://www.swinburne.edu.my/canvas/" label="Canvas" compact external />
            </li>
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
    <Link href="/" aria-label="Swinburne home" className="flex items-center gap-3">
      <Image
        src="/images/swinburne-logo.jpg"
        alt="Swinburne University of Technology"
        width={40}
        height={40}
        priority
        className="rounded-md ring-1 ring-black/10 shadow-sm object-cover"
      />
      <div className="leading-tight">
        <span className="font-semibold tracking-tight text-slate-900 dark:text-white">Swinburne</span>
        <span className="ml-1 text-slate-500 dark:text-slate-400 hidden sm:inline">Sarawak</span>
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
    ? "border-[#D42A30] text-[#D42A30] bg-[#D42A30]/5"
    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-[#D42A30] hover:text-[#D42A30]";

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
   QuickActions.tsx (merged)
============================================================================= */

const QUICK_ACTION_ITEMS = [
  { href: "/emergency", label: "Emergency", icon: "🚨", accent: "bg-red-50 text-red-700 border-red-200" },
  { href: "/maps", label: "Navigate", icon: "🗺️", accent: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { href: "/support", label: "Support", icon: "💬", accent: "bg-sky-50 text-sky-700 border-sky-200" },
  { href: "/events", label: "Events", icon: "📅", accent: "bg-amber-50 text-amber-700 border-amber-200" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {QUICK_ACTION_ITEMS.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 justify-center shadow ${it.accent}
                      hover:brightness-105 transition`}
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
   PinnedShortcuts.tsx (merged)
============================================================================= */

type PinnedItem = { href: string; label: string; external?: boolean; icon: string };

const PINNED_ITEMS: PinnedItem[] = [
  { href: "/navigate", label: "Navigate", icon: "🧭" },
  { href: "/maps", label: "Maps", icon: "🗺️" },
  { href: "/support", label: "IT Support", icon: "🛠️" },
  { href: "https://www.swinburne.edu.my/canvas/", label: "Canvas", external: true, icon: "🎓" },
  {
    href: "https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT",
    label: "Student Portal",
    external: true,
    icon: "🪪",
  },
];

function accentFor(label: string) {
  if (/navigate|maps/i.test(label)) return "red";
  return "slate";
}

export function PinnedShortcuts() {
  return (
    <div className="maxw container-px mt-3">
      <div className="relative overflow-hidden rounded-2xl bg-white/75 backdrop-blur-xl ring-1 ring-slate-200/70 shadow-[0_10px_26px_rgba(15,23,42,.06)]">
        {/* subtle red accent wash */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.55]
                     [background:radial-gradient(circle_at_15%_20%,rgba(212,42,48,.10),transparent_45%)]"
        />

        <div className="relative px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold text-slate-700">Quick shortcuts</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D42A30]" aria-hidden />
              Start with Navigate
            </div>
          </div>

          {/* prettier pills + snap scrolling */}
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-6 snap-x snap-mandatory">
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

                        <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">
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

            {/* right fade (looks premium + hints scroll) */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-full w-10
                         bg-gradient-to-l from-white/90 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   ChatLauncher.tsx (merged) — AssistantChat stays separate
============================================================================= */

export function ChatLauncher() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-[60] group rounded-full shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-3 backdrop-blur-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-2xl"
        aria-label="Open Campus Assistant"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 5rem)",
          right: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-medium hidden sm:block">Assistant</span>
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse" />
      </button>

      {open && <AssistantChat onClose={handleClose} />}
    </>
  );
}

/* =============================================================================
   BottomNav.tsx (merged)
============================================================================= */

/* === tiny inline icons, no deps === */

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
const IconStar = (p: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m12 17.3-5.5 3 1.1-6.3L3 9.7l6.3-.9L12 3l2.7 5.8 6.3.9-4.6 4.3 1.1 6.3z" />
  </svg>
);
const IconMenu = (p: any) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconApps = (p: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
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
};

const EMERGENCY = "082-260-607";
const EXIT_NAV = "/exit-navigation";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Hide bottom nav for admin only; user pages unaffected.
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navDim, setNavDim] = useState(false);

  // ✅ If entering admin while sheet is open, close everything.
  useEffect(() => {
    if (!isAdminRoute) return;
    setOpen(false);
    setScanOpen(false);
    setQuery("");
    setNavDim(false);
  }, [isAdminRoute]);

  // Scroll lock (disabled on admin)
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

  // Nav dim on scroll (disabled on admin)
  useEffect(() => {
    if (isAdminRoute) return;

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
          else if (y > last + 4) setNavDim(true);
          else if (y < last - 4) setNavDim(false);
          last = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, scanOpen, isAdminRoute]);

  const tabs = [
    { label: "Home", href: "/", icon: <IconHome /> },
    { label: "Messages", href: "/messages", icon: <IconMsg /> },
    { label: "Favourites", href: "/favourites", icon: <IconStar /> },
    { label: "Menu", href: "/menu", icon: <IconMenu /> },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const actions: Action[] = useMemo(
    () => [
      { key: "navigate", label: "Navigate", icon: IconHome, href: "/navigate" },
      { key: "support", label: "Support", icon: IconMenu, href: "/support" },
      { key: "events", label: "Events", icon: IconStar, href: "/events" },
      { key: "messages", label: "Messages", icon: IconMsg, href: "/messages" },
      { key: "favourites", label: "Favourites", icon: IconStar, href: "/favourites" },
      { key: "settings", label: "Settings", icon: IconMenu, href: "/settings" },
      { key: "exit", label: "Exit Navigation", icon: IconExit, href: EXIT_NAV },
      { key: "call", label: `Call Security (${EMERGENCY})`, icon: IconPhone, run: () => { window.location.href = `tel:${EMERGENCY}`; } },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.key.includes(q));
  }, [actions, query]);

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

  // ✅ admin gets no bottom nav at all
  if (isAdminRoute) return null;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50"
        data-dim={navDim}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
        aria-label="Primary"
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 pb-3">
          <div className="nav-chrome relative rounded-[20px] bg-white/85 backdrop-blur-xl ring-1 ring-slate-200/70 shadow-[0_10px_30px_rgba(0,0,0,.10)]">
            <ul className="relative grid grid-cols-5 items-end">
              {tabs.slice(0, 2).map((t) => (
                <li key={t.href} className="col-span-1">
                  <NavBtn href={t.href} label={t.label} active={isActive(t.href)}>
                    {t.icon}
                  </NavBtn>
                </li>
              ))}

              <li className="col-span-1">
                <div className="relative flex items-center justify-center">
                  <button
                    aria-label="Open quick actions"
                    onClick={() => setOpen(true)}
                    className="fab3d relative -translate-y-6 h-14 w-14 rounded-full hover:scale-[1.04] active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/70"
                  >
                    <span className="pointer-events-none absolute inset-0 rounded-full fab3d-halo" />
                    <span className="absolute inset-0 rounded-full ring-4 ring-white" aria-hidden />
                    <span className="absolute inset-[-4px] rounded-full ring-1 ring-[#cbd5e1]/70" aria-hidden />
                    <span className="relative z-10 grid h-full w-full place-items-center rounded-full bg-gradient-to-b from-[#D42A30] to-[#a11e23] shadow-[0_12px_24px_rgba(212,42,48,.35)]">
                      <IconApps />
                    </span>
                  </button>
                </div>
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
          <button className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[720px] px-4 sm:px-6">
            <div className="boomerang-sheet relative mb-[max(env(safe-area-inset-bottom),8px)] overflow-hidden rounded-t-[28px] bg-white ring-1 ring-slate-200/70 shadow-[0_-16px_60px_rgba(2,6,23,.24)]">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-3 pb-2">
                <span aria-hidden className="block" />
                <span aria-hidden className="justify-self-center h-1 w-14 rounded-full bg-slate-300/80" />
                <button
                  onClick={() => setOpen(false)}
                  className="justify-self-end inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] text-slate-600 hover:bg-slate-100"
                  aria-label="Close quick actions"
                >
                  <IconX />
                  Close
                </button>
              </div>

              <div
                className="sheet-scroll max-h-[72vh] overflow-y-auto overscroll-contain px-4 pb-5 pt-1 sm:px-5 space-y-4 controls-row"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="flex items-center gap-3 sm:gap-4 pr-2 sm:pr-3">
                  <div className="flex-1 min-w-0 flex items-center gap-2 rounded-xl ring-1 ring-slate-200 px-3 py-2 bg-white">
                    <IconSearch />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type, speak, or scan…"
                      className="w-full bg-transparent outline-none text-[14px] placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-4 ml-1 sm:ml-2 mr-1 sm:mr-2">
                    <button
                      onClick={onMic}
                      aria-label="Voice input"
                      className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-transform shrink-0"
                    >
                      <IconMic />
                    </button>

                    <button
                      onClick={() => setScanOpen(true)}
                      aria-label="Open scanner"
                      className="grid h-11 w-11 place-items-center rounded-xl ring-1 ring-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-transform shrink-0"
                    >
                      <IconScan />
                    </button>
                  </div>
                </div>

                <ul className="grid grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {filtered.slice(0, 20).map((a, i) => (
                    <li key={a.key} className="boomerang-tile" style={{ animationDelay: `${i * 55}ms` }}>
                      <button
                        onClick={() => run(a)}
                        className="group w-full rounded-2xl bg-white ring-1 ring-slate-200/70 hover:ring-slate-300 shadow-sm hover:shadow transition"
                        aria-label={a.label}
                      >
                        <div className="flex flex-col items-center gap-2.5 p-3">
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff5f5] ring-1 ring-[#fecaca] text-[#D42A30] shadow-[0_1px_0_rgba(0,0,0,.03)]">
                            <a.icon />
                          </span>
                          <span className="tile-label text-[12.5px] leading-tight text-slate-700 group-hover:text-slate-900 text-center">
                            {a.label}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
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
        @keyframes backdropIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-backdrop { animation: backdropIn .18s ease-out both; }

        @keyframes boomerangSheetIn {
          0%   { opacity: 0; transform: translateY(28px) scale(.985) rotateZ(.2deg); border-radius: 40px; }
          55%  { opacity: 1; transform: translateY(-6px) scale(1.01) rotateZ(-.15deg); }
          85%  { transform: translateY(2px)  scale(.998) rotateZ(.05deg); }
          100% { transform: translateY(0)    scale(1)    rotateZ(0); border-radius: 28px; }
        }
        .boomerang-sheet {
          animation: boomerangSheetIn .42s cubic-bezier(.18,.88,.22,1.05) both;
          transform-origin: bottom center;
          will-change: transform, opacity;
        }

        @keyframes boomerangItemIn {
          0%   { opacity: 0; transform: translateY(14px) scale(.97) rotateZ(1.5deg); }
          60%  { opacity: 1; transform: translateY(-3px) scale(1.02) rotateZ(-.6deg); }
          100% { transform: translateY(0)    scale(1)    rotateZ(0); }
        }
        .boomerang-tile {
          animation: boomerangItemIn .34s cubic-bezier(.2,.8,.2,1) both;
          will-change: transform, opacity;
        }

        .tile-label {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .overscroll-contain { overscroll-behavior: contain; }
        .sheet-scroll { -webkit-overflow-scrolling: touch; }
        .controls-row { padding-right: calc(env(safe-area-inset-right) + 12px); }

        .fab3d { box-shadow: 0 12px 24px rgba(0,0,0,.18), inset 0 2px 4px rgba(255,255,255,.35); }
        .fab3d-halo { box-shadow: 0 0 0 12px rgba(212,42,48,.08), 0 0 0 22px rgba(212,42,48,.04); }

        nav[data-dim="true"] .nav-chrome { opacity: .10; filter: saturate(.85) blur(.3px); pointer-events: none; }
        nav .nav-chrome { transition: opacity .22s ease, filter .22s ease; }

        @media (prefers-reduced-motion: reduce) {
          .animate-backdrop, .boomerang-sheet, .boomerang-tile { animation: none !important; }
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
      className="group relative flex h-16 flex-col items-center justify-center gap-1"
    >
      <div
        className={[
          "grid h-9 w-9 place-items-center rounded-xl transition-all",
          active
            ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10"
            : "bg-white text-slate-700 ring-1 ring-slate-200 group-hover:ring-slate-300",
        ].join(" ")}
      >
        {children}
      </div>
      <span
        className={[
          "text-[11.5px] transition-colors",
          active ? "text-slate-900 font-medium" : "text-slate-600 group-hover:text-slate-800",
        ].join(" ")}
      >
        {label}
      </span>
      {active && <span aria-hidden className="absolute top-0 mt-1 h-1.5 w-1.5 rounded-full bg-[#D42A30]" />}
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
        /* camera blocked */
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
      <button className="absolute inset-0 bg-slate-900/60 animate-backdrop" onClick={onClose} />
      <div className="absolute inset-x-0 top-[10%] mx-auto w-full max-w-[520px] px-4 sm:px-6">
        <div className="boomerang-sheet overflow-hidden rounded-2xl bg-black/90 ring-1 ring-white/10 shadow-xl">
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
            <div className="flex items-center justify-between gap-2 px-3 py-3 bg-white">
              <span className="text-[13px] text-slate-700">Camera scanning not supported — pick a photo</span>
              <label className="rounded-md px-2 py-1 text-[13px] ring-1 ring-slate-300 cursor-pointer hover:bg-slate-50">
                Choose image
                <input type="file" accept="image/*" capture="environment" hidden onChange={onPickFile} />
              </label>
            </div>
          )}

          {supported && (
            <div className="px-3 py-2 bg-white text-[12.5px] text-slate-600">
              Tip: center the code in the frame. We’ll auto-open URLs, copy other text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}