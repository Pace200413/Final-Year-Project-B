// src/components/SupportUI.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Service } from "@/components/appTypes";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  ArrowUpRight,
  Search,
  X,
  Wifi,
  Key,
  Shield,
  Heart,
  BookOpen,
  Compass,
  Map,
  CalendarDays,
  LifeBuoy,
  AlertTriangle,
} from "lucide-react";
import { FAQS as DEFAULT_FAQS } from "@/app/data/support-faqs";

/* ============================================================================
   tiny helper
============================================================================ */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ============================================================================
   Shared: TileCard
============================================================================ */

type TileCardProps = {
  href: string;
  title: string;
  icon: ReactNode;
  tone?: "black" | "red" | "neutral";
  external?: boolean;
  iconVariant?: "default" | "image";
  variant?: "default" | "spotlight";
  subtitle?: string;
  badge?: ReactNode | string;
  status?: "open" | "closed" | "updated";
  className?: string;
};

export function TileCard({
  href,
  title,
  icon,
  tone = "neutral", // kept for API compatibility
  external,
  iconVariant = "default",
  variant = "default",
  subtitle,
  badge,
  status,
  className,
}: TileCardProps) {
  const Wrapper: any = external ? "a" : Link;
  const wrapperProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  // ── Spotlight (premium hero) — KEEP AS IS
  if (variant === "spotlight") {
  const dot =
    status === "closed"
      ? "bg-amber-500"
      : status === "updated"
        ? "bg-sky-500"
        : status
          ? "bg-emerald-500"
          : "";

  return (
    <Wrapper
      {...wrapperProps}
      className={[
        "group relative isolate overflow-hidden rounded-[28px]",
        "border border-slate-200/80 bg-white",
        "shadow-[0_16px_40px_rgba(15,23,42,.08)]",
        "transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_24px_56px_rgba(15,23,42,.12)]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200",
        className || "",
      ].join(" ")}
      aria-label={title}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[linear-gradient(to_right,rgba(15,23,42,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,.05)_1px,transparent_1px)]
                   bg-[size:26px_26px] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[42%]
                   bg-gradient-to-l from-[#D42A30]/10 via-[#D42A30]/4 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-4 h-28 w-28 rounded-full bg-[#D42A30]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px
                   bg-gradient-to-r from-transparent via-[#D42A30]/30 to-transparent"
      />

      <div className="relative z-10 grid min-h-[108px] grid-cols-[auto_1fr_auto] items-center gap-3 p-5 sm:p-6">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-white ring-1 ring-slate-900/10 shadow-[0_12px_26px_rgba(15,23,42,.16)]">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
                {badge}
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {status === "updated"
                  ? "Updated"
                  : status === "closed"
                    ? "Closed"
                    : "Open"}
              </span>
            )}
          </div>

          <div className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900 sm:text-[22px]">
            {title}
          </div>

          {subtitle && (
            <p className="mt-1 max-w-[34ch] line-clamp-2 text-[13.5px] leading-6 text-slate-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className="ml-1">
          <div
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/95 text-slate-700 ring-1 ring-slate-200 shadow-sm
                       transition-all duration-300 group-hover:translate-x-1 group-hover:bg-slate-900 group-hover:text-white"
            aria-hidden
          >
            →
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

  // ── Default (centered, no arrows)
  const tile =
    "group relative block rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-4 " +
    "shadow-[0_10px_26px_rgba(15,23,42,.06)] hover:shadow-[0_18px_44px_rgba(15,23,42,.10)] transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2";

  const avatar =
    iconVariant === "image"
      ? "grid h-12 w-12 place-items-center rounded-full bg-white ring-1 ring-slate-200/70 shadow-sm"
      : "grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white ring-1 ring-slate-900/10 shadow-sm";

  return (
    <Wrapper className={`${tile} ${className || ""}`} {...wrapperProps} aria-label={title}>
      {external ? (
        <span
          aria-hidden
          className="absolute right-3 top-3 text-[11px] font-semibold text-slate-400"
          title="Opens in new tab"
        >
          ↗
        </span>
      ) : null}

      <div className="flex min-h-[92px] flex-col items-center justify-center gap-2 text-center">
        <span className={avatar}>{icon}</span>

        <div className="w-full">
          <div className="mx-auto max-w-[14ch] text-[14px] font-semibold leading-snug text-slate-900 line-clamp-2 sm:text-[15px]">
            {title}
          </div>

          {subtitle ? (
            <div className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-slate-600">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </Wrapper>
  );
}

/* ============================================================================
   SubpageLayout
============================================================================ */

export function SubpageLayout({
  icon,
  title,
  description,
  children,
  extra,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="maxw container-px py-4">  
      {/* <div className="maxw container-px py-8">   */}
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          {icon} {title}
        </h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>

      <div className="maxw container-px grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {children}
      </div>

      {extra && <div className="maxw container-px mt-8">{extra}</div>}
    </div>
  );
}

/* ============================================================================
   SearchBar
============================================================================ */

export function SearchBar({ onSubmit }: { onSubmit?: (q: string) => void }) {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<Array<{ kind: "search" | "nav"; value: string; href?: string; ts: number }>>(
    []
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const term = q.trim();
  const has = term.length > 0;

  const RECENTS_KEY = "campus_search_recents_v1";
  const MAX_RECENTS = 6;

  // Responsive placeholder (mobile vs sm+)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Load recents
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setRecents(parsed.slice(0, MAX_RECENTS));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeholder = isDesktop ? "Search campus • facilities, events, support" : "Search campus";

  // --- helpers ---
  function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function Highlight({
    text,
    q,
    className,
  }: {
    text: string;
    q: string;
    className?: string;
  }) {
    const t = q.trim();
    if (!t) return <span className={className}>{text}</span>;

    const re = new RegExp(`(${escapeRegExp(t)})`, "ig");
    const parts = text.split(re);

    return (
      <span className={className}>
        {parts.map((p, i) => {
          const hit = p.toLowerCase() === t.toLowerCase();
          return hit ? (
            <span
              key={i}
              className="rounded-md bg-red-50 px-1 py-0.5 text-red-700 ring-1 ring-red-100"
            >
              {p}
            </span>
          ) : (
            <span key={i}>{p}</span>
          );
        })}
      </span>
    );
  }

  function saveRecents(next: typeof recents) {
    setRecents(next);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function pushRecent(item: { kind: "search" | "nav"; value: string; href?: string }) {
    const normValue = item.value.trim();
    if (!normValue) return;

    const key = item.kind === "search" ? `s:${normValue.toLowerCase()}` : `n:${(item.href || "").toLowerCase()}`;

    const now = Date.now();
    const next = [
      { kind: item.kind, value: normValue, href: item.href, ts: now },
      ...recents.filter((r) => {
        const rk = r.kind === "search" ? `s:${r.value.toLowerCase()}` : `n:${(r.href || "").toLowerCase()}`;
        return rk !== key;
      }),
    ].slice(0, MAX_RECENTS);

    saveRecents(next);
  }

  function clearRecents() {
    saveRecents([]);
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      // ignore
    }
  }

  // --- command items ---
  type CmdItem = {
    id: string;
    kind: "search" | "nav";
    group: "Recent" | "Search" | "Navigation" | "Support" | "Safety";
    label: string;
    desc: string;
    href?: string;
    icon: ReactNode;
    keywords?: string;
    badge?: "Updated" | "Open";
    meta?: { recentKind?: "search" | "nav"; recentValue?: string };
  };

  const BASE: CmdItem[] = useMemo(
    () => [
      {
        id: "nav",
        kind: "nav",
        group: "Navigation",
        label: "Navigate",
        desc: "Turn-by-turn directions and accessible routes",
        href: "/navigate",
        icon: <Compass className="h-4 w-4" />,
        keywords: "navigate directions route accessibility",
        badge: "Open",
      },
      {
        id: "maps",
        kind: "nav",
        group: "Navigation",
        label: "Maps",
        desc: "Buildings, labs, lecture halls and facilities",
        href: "/navigate/map",
        icon: <Map className="h-4 w-4" />,
        keywords: "map buildings facilities location",
        badge: "Updated",
      },
      {
        id: "support",
        kind: "nav",
        group: "Support",
        label: "Live Support",
        desc: "Find the right office / help channel",
        href: "/support",
        icon: <LifeBuoy className="h-4 w-4" />,
        keywords: "support help it wifi facilities counselling",
      },
      {
        id: "events",
        kind: "nav",
        group: "Support",
        label: "Events",
        desc: "What’s happening on campus",
        href: "/events",
        icon: <CalendarDays className="h-4 w-4" />,
        keywords: "events meetup orientation calendar",
      },
      {
        id: "security",
        kind: "nav",
        group: "Safety",
        label: "Security Contact",
        desc: "Call campus security fast",
        href: "/security-contact",
        icon: <AlertTriangle className="h-4 w-4" />,
        keywords: "security emergency safe incident theft",
      },
      {
        id: "emergency",
        kind: "nav",
        group: "Safety",
        label: "Emergency Hub",
        desc: "Emergency guidance and key contacts",
        href: "/emergency",
        icon: <Shield className="h-4 w-4" />,
        keywords: "emergency safety security guidance",
      },
    ],
    []
  );

  // For recent nav items: try to reuse the same icon/desc if it matches BASE href
  function baseByHref(href?: string) {
    if (!href) return null;
    return BASE.find((b) => b.href === href) ?? null;
  }

  const sections = useMemo(() => {
    const qLower = term.toLowerCase();

    const match = (it: CmdItem) => {
      if (!qLower) return true;
      const hay = `${it.label} ${it.desc} ${it.keywords || ""}`.toLowerCase();
      return hay.includes(qLower);
    };

    const filteredBase = BASE.filter(match);

    // Recent section only when empty + focused (feels like Spotlight)
    const recentItems: CmdItem[] =
      !term && recents.length > 0
        ? recents
            .slice(0, MAX_RECENTS)
            .map((r, idx) => {
              if (r.kind === "search") {
                return {
                  id: `recent-search-${idx}`,
                  kind: "search",
                  group: "Recent",
                  label: r.value,
                  desc: "Recent search",
                  icon: <Search className="h-4 w-4" />,
                  meta: { recentKind: "search", recentValue: r.value },
                } as CmdItem;
              }

              const b = baseByHref(r.href);
              return {
                id: `recent-nav-${idx}`,
                kind: "nav",
                group: "Recent",
                label: b?.label ?? r.value,
                desc: b?.desc ?? "Recently opened",
                href: r.href,
                icon: b?.icon ?? <ArrowUpRight className="h-4 w-4" />,
                badge: b?.badge,
                meta: { recentKind: "nav", recentValue: r.value },
              } as CmdItem;
            })
        : [];

    const withSearch: CmdItem[] = term
      ? [
          {
            id: "search-action",
            kind: "search",
            group: "Search",
            label: `Search for “${term}”`,
            desc: "Search support directory & campus info",
            icon: <Search className="h-4 w-4" />,
          },
          ...filteredBase,
        ]
      : [...recentItems, ...filteredBase];

    const order: Array<CmdItem["group"]> = term
      ? ["Search", "Navigation", "Support", "Safety"]
      : ["Recent", "Navigation", "Support", "Safety"];

    const grouped = order
      .map((g) => ({
        title: g,
        items: withSearch.filter((x) => x.group === g),
      }))
      .filter((s) => s.items.length > 0);

    const flat = grouped.flatMap((s) => s.items);

    return { grouped, flat };
  }, [BASE, term, recents]);

  const open = focused && sections.flat.length > 0;

  // Auto-preview: always keep an active item (defaults to 0)
  useEffect(() => {
    if (!open) return;
    setActiveIndex((i) => (i >= sections.flat.length ? 0 : i));
  }, [open, sections.flat.length]);

  // Keep active option visible when using arrows
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const previewItem = open ? sections.flat[activeIndex] : null;

  const runSearch = (searchTerm?: string) => {
    const t = (searchTerm ?? term).trim();
    if (!t) return;
    pushRecent({ kind: "search", value: t });

    if (onSubmit) onSubmit(t);
    else router.push(`/support?q=${encodeURIComponent(t)}`);
  };

  const goNav = (href: string, labelForRecent?: string) => {
    pushRecent({ kind: "nav", value: labelForRecent || href, href });
    router.push(href);
  };

  const closePalette = () => {
    setFocused(false);
    inputRef.current?.blur();
  };

  const selectByIndex = (idx: number) => {
    const it = sections.flat[idx];
    if (!it) return;

    if (it.group === "Recent" && it.meta?.recentKind === "search" && it.meta.recentValue) {
      // recent search selects + runs search
      setQ(it.meta.recentValue);
      runSearch(it.meta.recentValue);
      closePalette();
      return;
    }

    if (it.kind === "search") {
      // search action uses typed term OR the label if it’s a recent-search row
      if (it.group === "Recent") runSearch(it.label);
      else runSearch();
      closePalette();
      return;
    }

    if (it.href) {
      goNav(it.href, it.label);
      closePalette();
    }
  };

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        runSearch();
      }}
    >
      {/* Input shell */}
      <div
        className={[
          "relative rounded-2xl bg-white/85 backdrop-blur-xl",
          "ring-1 ring-slate-200/70 shadow-[0_12px_30px_rgba(15,23,42,.06)]",
          "focus-within:ring-2 focus-within:ring-[#D42A30]/45 focus-within:ring-offset-2 focus-within:ring-offset-white",
        ].join(" ")}
        onPointerDown={(e) => {
          const t = e.target as HTMLElement;
          if (t.tagName === "INPUT") return;
          if (t.closest("button")) return;
          e.preventDefault(); // iOS tap: avoid selection flicker
          inputRef.current?.focus();
        }}
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />

        <input
          ref={inputRef}
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Search campus"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="campus-search-suggestions"
          aria-activedescendant={open ? `campus-search-opt-${activeIndex}` : undefined}
          enterKeyHint="search"
          inputMode="search"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 90)}
          onKeyDown={(e) => {
            // ESC: clear if has text, else blur
            if (e.key === "Escape") {
              if (has) {
                e.preventDefault();
                setQ("");
                requestAnimationFrame(() => inputRef.current?.focus());
              } else {
                (e.currentTarget as HTMLInputElement).blur();
              }
              return;
            }

            if (!open) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % sections.flat.length);
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i - 1 + sections.flat.length) % sections.flat.length);
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              selectByIndex(activeIndex);
              return;
            }
          }}
          className={[
            "w-full h-12 rounded-2xl bg-transparent pl-11 outline-none",
            // iOS Safari zoom-prevention: >=16px on mobile
            "text-[16px] sm:text-[14.5px] text-slate-900 placeholder:text-slate-400",
            // dynamic right padding so placeholder never truncates
            has ? "pr-14" : "pr-4",
            // hide native webkit search UI
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          ].join(" ")}
        />

        {/* Right controls */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {!has && isDesktop && !focused ? (
            <span className="hidden sm:inline-flex items-center rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
              /
            </span>
          ) : null}

          {has ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                inputRef.current?.focus();
              }}
              className="touch-manipulation grid h-9 w-9 place-items-center rounded-xl text-slate-500 ring-1 ring-slate-200 bg-white
                         hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="campus-search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={[
              "absolute left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl",
              "bg-white/92 backdrop-blur-xl ring-1 ring-slate-200/70",
              "shadow-[0_18px_60px_rgba(15,23,42,.12)]",
            ].join(" ")}
          >
            {/* Split layout on md+: list + preview */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">
              {/* List */}
              <div className="max-h-[360px] overflow-auto overscroll-contain">
                {(() => {
                  let globalIndex = 0;

                  return sections.grouped.map((sec) => (
                    <div key={sec.title}>
                      <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {sec.title}
                        </div>

                        {sec.title === "Recent" && recents.length > 0 ? (
                          <button
                            type="button"
                            onPointerDown={(e) => e.preventDefault()}
                            onClick={clearRecents}
                            className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>

                      <div className="px-1 pb-1">
                        {sec.items.map((it) => {
                          const idx = globalIndex++;
                          const active = idx === activeIndex;

                          return (
                            <button
                              key={it.id}
                              id={`campus-search-opt-${idx}`}
                              ref={(el) => {
                                optionRefs.current[idx] = el;
                              }}
                              role="option"
                              aria-selected={active}
                              type="button"
                              onPointerDown={(e) => e.preventDefault()} // keep input from blurring on mobile
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => selectByIndex(idx)}
                              className={[
                                "w-full rounded-xl px-2.5 py-2.5 text-left",
                                "flex items-start gap-3 transition",
                                active ? "bg-slate-50" : "bg-transparent hover:bg-slate-50",
                                "focus-visible:outline-none",
                              ].join(" ")}
                            >
                              <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white ring-1 ring-slate-900/10 shadow-sm">
                                {it.icon}
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2 min-w-0">
                                  <Highlight
                                    text={it.label}
                                    q={term}
                                    className="block min-w-0 text-[14px] font-semibold text-slate-900 line-clamp-1"
                                  />

                                  {it.badge ? (
                                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
                                      {it.badge}
                                    </span>
                                  ) : null}
                                </span>

                                <Highlight
                                  text={it.desc}
                                  q={term}
                                  className="mt-0.5 block text-[12.5px] leading-snug text-slate-600 line-clamp-2"
                                />
                              </span>

                              <span className="ml-2 mt-1 text-[12px] font-semibold text-slate-400" aria-hidden>
                                ↵
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Preview (md+) */}
              <div className="hidden md:block border-l border-slate-200/70 p-3">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm p-4">
                  {previewItem ? (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white ring-1 ring-slate-900/10 shadow-sm">
                          {previewItem.icon}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0 text-[15px] font-semibold text-slate-900 line-clamp-1">
                              {previewItem.kind === "search" && previewItem.group === "Recent"
                                ? `Search “${previewItem.label}”`
                                : previewItem.kind === "search"
                                  ? `Search “${term || previewItem.label}”`
                                  : previewItem.label}
                            </div>

                            {previewItem.badge ? (
                              <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
                                {previewItem.badge}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-1 text-[13px] text-slate-600">
                            {previewItem.kind === "search" && previewItem.group === "Recent"
                              ? "Run this recent search"
                              : previewItem.kind === "search"
                                ? "Search the directory & campus pages"
                                : previewItem.desc}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            {previewItem.kind === "search" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (previewItem.group === "Recent") runSearch(previewItem.label);
                                  else runSearch();
                                  closePalette();
                                }}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white
                                           hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                              >
                                Search
                              </button>
                            ) : previewItem.href ? (
                              <button
                                type="button"
                                onClick={() => {
                                  goNav(previewItem.href!, previewItem.label);
                                  closePalette();
                                }}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white
                                           hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
                              >
                                Open
                              </button>
                            ) : null}

                            <div className="text-[11px] text-slate-500">
                              {previewItem.group === "Recent" ? "Recent" : previewItem.group}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-600">Select an item to preview.</div>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  Tip: Use <span className="font-semibold">↑ ↓</span> then <span className="font-semibold">Enter</span>.
                </div>
              </div>
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 px-3 py-2 text-[11px] text-slate-500">
              <span className="hidden sm:inline">↑ ↓ navigate · Enter open · Esc {has ? "clear" : "close"}</span>
              <span className="sm:hidden">Tap to open</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
/* ============================================================================
   QuickHelp — NEW (replaces those pills)
============================================================================ */

type QuickHelpItem = { label: string; desc: string; icon: ReactNode; cat?: string; q?: string };

const QUICKHELP_DEFAULT_ITEMS: QuickHelpItem[] = [
  { label: "Wi-Fi help", desc: "Connect / reset / internet", icon: <Wifi className="h-4 w-4" />, cat: "IT Support", q: "wifi network internet" },
  { label: "Login / Password", desc: "Canvas, portal, accounts", icon: <Key className="h-4 w-4" />, cat: "IT Support", q: "login canvas portal password" },
  { label: "Student services", desc: "Forms, IDs, admin help", icon: <BookOpen className="h-4 w-4" />, cat: "Academic", q: "student services" },
  { label: "Facilities issue", desc: "AC, classroom, projector", icon: <BookOpen className="h-4 w-4" />, cat: "Facilities", q: "projector ac classroom" },
  { label: "Wellbeing", desc: "Counselling & support", icon: <Heart className="h-4 w-4" />, cat: "Wellbeing", q: "counselling wellbeing" },
  { label: "Safety / Security", desc: "Emergency & incidents", icon: <Shield className="h-4 w-4" />, cat: "Safety", q: "emergency security" },
];

export function QuickHelp({
  items = QUICKHELP_DEFAULT_ITEMS,
  onSelect,
  className,
}: {
  items?: QuickHelpItem[];
  onSelect: (v: { cat?: string; q?: string }) => void;
  className?: string;
}) {
  return (
    <section className={className} aria-label="Quick help">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Tap one to auto-fill category + search.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <button
            key={i.label}
            type="button"
            onClick={() => onSelect({ cat: i.cat, q: i.q })}
            className={cx(
              "group rounded-2xl border border-slate-200 bg-white p-3 text-left",
              "shadow-[0_10px_26px_rgba(15,23,42,.06)] hover:shadow-[0_18px_44px_rgba(15,23,42,.10)] transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2"
            )}
          >
            <div className="flex items-start gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white ring-1 ring-slate-900/10 shadow-sm">
                {i.icon}
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-slate-900 line-clamp-1">
                  {i.label}
                </div>
                <div className="mt-0.5 text-[12px] leading-snug text-slate-600 line-clamp-2">
                  {i.desc}
                </div>
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-slate-700">
              Apply
              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   SupportFAQ
============================================================================ */

export type FAQ = { q: string; a: string; tags?: string[] };

const FAQ_GROUPS: { name: string; match: RegExp }[] = [
  { name: "IT Issues", match: /(it|wifi|login|canvas|portal)/i },
  { name: "Facilities", match: /(facility|classroom|projector|ac)/i },
  { name: "Emergencies", match: /(emergency|security|safety)/i },
  { name: "Wellbeing", match: /(wellbeing|counsel)/i },
  { name: "Library & Academic", match: /(library|reference|academic)/i },
];

function FAQSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function SupportFAQ({ items: provided }: { items?: FAQ[] }) {
  const [q, setQ] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const items = provided ?? (DEFAULT_FAQS as FAQ[]);

  const results = useMemo(() => {
    const term = q.toLowerCase();
    return items.filter(
      (f) =>
        !term ||
        f.q.toLowerCase().includes(term) ||
        f.a.toLowerCase().includes(term) ||
        (f.tags || []).some((t) => t.toLowerCase().includes(term))
    );
  }, [q, items]);

  if (!hydrated) return <FAQSkeleton />;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4"
      aria-label="Frequently asked questions"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold">FAQs</h2>
        <div className="ml-auto flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search FAQs…"
            className="h-7 w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
            aria-label="Search FAQs"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Clear FAQ search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {FAQ_GROUPS.map((g) => {
        const grouped = results.filter((f) => g.match.test((f.tags || []).join(" ") + " " + f.q));
        if (grouped.length === 0) return null;
        return (
          <div key={g.name} className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {g.name}
            </h3>
            <ul className="divide-y divide-slate-200">
              {grouped.map((f, i) => (
                <li key={`${g.name}-${i}`} className="py-2">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
                    <p className="mt-2 text-sm text-slate-700">{f.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

/* ============================================================================
   SupportRequestForm
============================================================================ */

const FORM_CATS = ["General", "IT Support", "Facilities", "Safety", "Wellbeing", "Academic"] as const;
type FormCat = (typeof FORM_CATS)[number];

function suggestCategory(msg: string): FormCat {
  const m = msg.toLowerCase();
  if (/(login|password|canvas|portal|wifi|wi-?fi)/.test(m)) return "IT Support";
  if (/(projector|air.?con|ac|classroom|maintenance|facility)/.test(m)) return "Facilities";
  if (/(emergency|security|theft|injur|harass)/.test(m)) return "Safety";
  if (/(counsel|wellbeing|mental|stress)/.test(m)) return "Wellbeing";
  if (/(library|reference|loan)/.test(m)) return "Academic";
  return "General";
}

export function SupportRequestForm() {
  const [loading, setLoading] = useState(false);
  const [okId, setOkId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const suggestion = useMemo(() => suggestCategory(msg), [msg]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setOkId(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;

    const email = (payload.email || "").trim();
    if (!/@swin\.edu\.my$/i.test(email)) {
      setLoading(false);
      setErr("Please use your @swin.edu.my email.");
      return;
    }

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await res.json().catch(() => ({} as any));
    if (!res.ok) setErr(j?.error || "Something went wrong.");
    else {
      setOkId(j.id);
      (e.target as HTMLFormElement).reset();
      setMsg("");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="mb-1 text-sm font-semibold">After-hours request</h4>
      <p className="mb-3 text-xs text-slate-500">
        We’ll respond within <strong>1 business day</strong>.
      </p>

      <div aria-live="polite" className="space-y-2">
        {okId && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
            Request received. Reference <span className="font-mono">{okId}</span>
          </div>
        )}
        {err && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm">
            {err}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-3 grid grid-cols-1 gap-3">
        <div className="grid gap-1">
          <label className="text-xs font-medium">Name *</label>
          <input name="name" required className="input" placeholder="Your name" />
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium">Email *</label>
          <input name="email" type="email" required className="input" placeholder="you@swin.edu.my" />
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium">Category</label>
          <select name="category" className="input" defaultValue={suggestion}>
            {FORM_CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Suggested: <span className="font-medium">{suggestion}</span>
          </p>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium">Message *</label>
          <textarea
            name="message"
            required
            rows={4}
            className="input"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Tell us what happened…"
          />
        </div>

        <button
          disabled={loading}
          className="mt-1 rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send request"}
        </button>
      </form>
    </div>
  );
}

/* ============================================================================
   SupportDirectory
============================================================================ */


const CAT_TONE: Record<string, string> = {
  "IT Support": "ring-sky-200 bg-sky-50",
  Facilities: "ring-amber-200 bg-amber-50",
  Safety: "ring-rose-200 bg-rose-50",
  Wellbeing: "ring-emerald-200 bg-emerald-50",
  Academic: "ring-violet-200 bg-violet-50",
};

function CatBadge({ cat }: { cat: string }) {
  const tone =
    cat === "IT Support"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : cat === "Facilities"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : cat === "Safety"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : cat === "Wellbeing"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : cat === "Academic"
              ? "border-violet-200 bg-violet-50 text-violet-700"
              : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tone,
      ].join(" ")}
    >
      {cat}
    </span>
  );
}

function DirectorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="h-20 animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]" />
        </div>
      ))}
    </div>
  );
}

export function SupportDirectory({
  services,
}: {
  services: Service[];
  preset?: { cat?: string; q?: string };
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <DirectorySkeleton />;

  function toneForCategory(category: string) {
    switch (category) {
      case "IT Support":
        return {
          bubble: "bg-sky-50 text-sky-700 ring-sky-200",
          glow: "bg-sky-200/40",
          top: "bg-gradient-to-r from-sky-500 to-sky-300",
        };
      case "Facilities":
        return {
          bubble: "bg-amber-50 text-amber-700 ring-amber-200",
          glow: "bg-amber-200/40",
          top: "bg-gradient-to-r from-amber-500 to-amber-300",
        };
      case "Safety":
        return {
          bubble: "bg-rose-50 text-rose-700 ring-rose-200",
          glow: "bg-rose-200/40",
          top: "bg-gradient-to-r from-rose-500 to-rose-300",
        };
      case "Wellbeing":
        return {
          bubble: "bg-emerald-50 text-emerald-700 ring-emerald-200",
          glow: "bg-emerald-200/40",
          top: "bg-gradient-to-r from-emerald-500 to-emerald-300",
        };
      case "Academic":
        return {
          bubble: "bg-violet-50 text-violet-700 ring-violet-200",
          glow: "bg-violet-200/40",
          top: "bg-gradient-to-r from-violet-500 to-violet-300",
        };
      default:
        return {
          bubble: "bg-slate-100 text-slate-700 ring-slate-200",
          glow: "bg-slate-200/40",
          top: "bg-gradient-to-r from-slate-500 to-slate-300",
        };
    }
  }

  function iconForCategory(category: string) {
    switch (category) {
      case "IT Support":
        return Key;
      case "Safety":
        return Shield;
      case "Wellbeing":
        return Heart;
      case "Academic":
        return BookOpen;
      case "Facilities":
        return LifeBuoy;
      default:
        return LifeBuoy;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {services.map((s) => {
          const tel = s.phone ? `tel:${s.phone.replace(/[^0-9]/g, "")}` : null;
          const mail = s.email ? `mailto:${s.email}` : null;
          const page = `/support/${s.slug}`;
          const tone = toneForCategory(s.category);
          const Icon = iconForCategory(s.category);

          return (
            <motion.div
              key={s.slug}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="h-full"
            >
              <div
                className={cx(
                  "group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5",
                  "shadow-[0_14px_36px_rgba(15,23,42,.06)] transition duration-300",
                  "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_52px_rgba(15,23,42,.10)]"
                )}
              >
                <div aria-hidden className={`absolute inset-x-0 top-0 h-1 ${tone.top}`} />
                <div
                  aria-hidden
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${tone.glow}`}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <span
                      className={[
                        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 shadow-sm",
                        "[&_svg]:h-5 [&_svg]:w-5",
                        tone.bubble,
                      ].join(" ")}
                    >
                      <Icon />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[16px] font-semibold tracking-tight text-slate-900">
                          {s.name}
                        </h3>
                        <CatBadge cat={s.category} />
                      </div>

                      <div className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {s.hours}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={page}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition group-hover:bg-[#D42A30]/8 group-hover:text-[#D42A30]"
                    aria-label={`Open ${s.name}`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="relative mt-4 text-[14px] leading-6 text-slate-600">
                  {s.desc}
                </p>

                <div className="relative mt-5 flex flex-wrap gap-2">
                  {tel ? (
                    <a
                      href={tel}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  ) : null}

                  {mail ? (
                    <a
                      href={mail}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  ) : null}

                  <Link
                    href={page}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:opacity-95"
                  >
                    Open service
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}

        {services.length === 0 && (
          <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
            <div className="font-semibold text-slate-900">No services available</div>
            <div className="mt-1">
              There are currently no support services to display.
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}