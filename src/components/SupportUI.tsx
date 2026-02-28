"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Service } from "@/components/appTypes";
import Fuse, { type IFuseOptions } from "fuse.js";
import { track } from "@/lib/client";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, ArrowUpRight } from "lucide-react";
import { FAQS as DEFAULT_FAQS } from "@/app/data/support-faqs";

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
  tone = "neutral", // currently unused (kept for API compatibility)
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

  // ── Spotlight (premium hero)
  if (variant === "spotlight") {
    const dot =
      status === "closed" ? "bg-amber-500" :
      status === "updated" ? "bg-sky-500" :
      status ? "bg-emerald-500" : "";

    return (
      <Wrapper
        {...wrapperProps}
        className={[
          "group relative isolate overflow-hidden rounded-2xl",
          "ring-1 ring-slate-200/70 shadow-sm",
          "bg-gradient-to-br from-white to-slate-50",
          "transition hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200",
          className || "",
        ].join(" ")}
        aria-label={title}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl p-[1px]
                     [background:conic-gradient(from_140deg,#D42A30_0%,#ea6a6a_15%,#fecaca_35%,transparent_40%)]
                     opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[calc(theme(borderRadius.2xl)-1px)]
                     bg-gradient-to-br from-white to-slate-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl
                     bg-[linear-gradient(to_right,rgba(2,6,23,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,.06)_1px,transparent_1px)]
                     bg-[size:20px_20px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D42A30]/15 blur-2xl"
        />

        <div className="relative z-10 grid min-h-[116px] grid-cols-[auto_1fr_auto] items-center gap-4 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-white ring-1 ring-slate-900/10 shadow-sm">
            <span className="text-xl" aria-hidden>{icon}</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {badge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-red-100">
                  {badge}
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {status === "updated" ? "Updated" : status === "closed" ? "Closed" : "Open"}
                </span>
              )}
            </div>
            <div className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">
              {title}
            </div>
            {subtitle && <p className="mt-0.5 text-[13.5px] text-slate-600 line-clamp-2">{subtitle}</p>}
          </div>

          <div className="ml-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm
                         transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              <span className="text-slate-700">→</span>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  // ── Default
  const tile =
    "group block rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,.10)] transition";
  const darkAvatar =
    "inline-grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white";
  const imageBadge =
    "inline-grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-slate-200/70 shadow-sm";

  return (
    <Wrapper className={`${tile} ${className || ""}`} {...wrapperProps}>
      <div className="flex items-center gap-3">
        <span className={iconVariant === "image" ? imageBadge : darkAvatar}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-slate-900 truncate">{title}</div>
          {subtitle && <div className="mt-0.5 text-[13.5px] text-slate-600 line-clamp-2">{subtitle}</div>}
        </div>
        <span className="ml-auto text-slate-300 transition group-hover:text-slate-400">→</span>
      </div>
    </Wrapper>
  );
}

/* ============================================================================
   SubpageLayout (NOTE: becomes client component in this merged file)
============================================================================ */

export function SubpageLayout({
  icon, title, description, children, extra,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="maxw container-px py-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {icon} {title}
        </h1>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>

      <div className="maxw container-px grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(q.trim()); }}
    >
      <input
        ref={ref}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search campus • facilities, events, support"
        aria-label="Search campus"
        enterKeyHint="search"
        autoComplete="off"
        className="w-full h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-9 outline-none focus:ring-2 focus:ring-[#D42A30]/60"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>🔎</span>
      {q && (
        <button
          type="button"
          onClick={() => { setQ(""); ref.current?.focus(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-slate-500 hover:text-slate-700"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </form>
  );
}

/* ============================================================================
   QuickHelp
============================================================================ */

const QUICKHELP_DEFAULT_ITEMS: { label: string; cat?: string; q?: string }[] = [
  { label: "Login issue", cat: "IT Support", q: "login canvas portal password" },
  { label: "Wi-Fi not working", cat: "IT Support", q: "wifi network internet" },
  { label: "Classroom equipment", cat: "Facilities", q: "projector ac classroom" },
  { label: "Counselling", cat: "Wellbeing", q: "counselling wellbeing" },
  { label: "Emergency", cat: "Safety", q: "emergency security" },
  { label: "Library help", cat: "Academic", q: "library referencing" },
];

export function QuickHelp({
  items = QUICKHELP_DEFAULT_ITEMS,
  onSelect,
  className,
}: {
  items?: { label: string; cat?: string; q?: string }[];
  onSelect: (v: { cat?: string; q?: string }) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold">What do you need help with?</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button
            key={i.label}
            onClick={() => onSelect({ cat: i.cat, q: i.q })}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50"
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
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
    return items.filter((f) =>
      !term ||
      f.q.toLowerCase().includes(term) ||
      f.a.toLowerCase().includes(term) ||
      (f.tags || []).some((t) => t.toLowerCase().includes(term))
    );
  }, [q, items]);

  if (!hydrated) return <FAQSkeleton />;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-label="Frequently asked questions">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold">FAQs</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search FAQs…"
          className="ml-auto input !h-8 w-48"
          aria-label="Search FAQs"
        />
      </div>

      {FAQ_GROUPS.map((g) => {
        const grouped = results.filter((f) => g.match.test((f.tags || []).join(" ") + " " + f.q));
        if (grouped.length === 0) return null;
        return (
          <div key={g.name} className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{g.name}</h3>
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
type FormCat = typeof FORM_CATS[number];

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
            {FORM_CATS.map((c) => <option key={c}>{c}</option>)}
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

const DIRECTORY_CATS = ["All", "IT Support", "Facilities", "Safety", "Wellbeing", "Academic"] as const;

const CAT_TONE: Record<string, string> = {
  "IT Support": "ring-sky-200 bg-sky-50",
  Facilities: "ring-amber-200 bg-amber-50",
  Safety: "ring-rose-200 bg-rose-50",
  Wellbeing: "ring-emerald-200 bg-emerald-50",
  Academic: "ring-violet-200 bg-violet-50",
};

function CatBadge({ cat }: { cat: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1",
        CAT_TONE[cat] ?? "ring-slate-200 bg-slate-50",
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

const FUSE_OPTS: IFuseOptions<Service> = {
  keys: [
    { name: "name", weight: 0.6 },
    { name: "desc", weight: 0.3 },
    { name: "category", weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

export function SupportDirectory({
  services,
  preset,
}: {
  services: Service[];
  preset?: { cat?: string; q?: string };
}) {
  const [cat, setCat] = useState<(typeof DIRECTORY_CATS)[number]>(
    (preset?.cat as (typeof DIRECTORY_CATS)[number]) ?? "All"
  );
  const [q, setQ] = useState(preset?.q ?? "");
  const [hydrated, setHydrated] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      if (q.trim()) track("support_search", { q, cat });
    }, 160);
    return () => clearTimeout(t);
  }, [q, cat]);

  const counts = useMemo(() => {
    const base: Record<(typeof DIRECTORY_CATS)[number], number> = {
      All: services.length,
      "IT Support": 0,
      Facilities: 0,
      Safety: 0,
      Wellbeing: 0,
      Academic: 0,
    };
    services.forEach((s) => (base[s.category as keyof typeof base] as number)++);
    return base;
  }, [services]);

  const filtered = useMemo(() => {
    const subset = cat === "All" ? services : services.filter((s) => s.category === cat);
    if (!debouncedQ.trim()) return subset;
    const idx = new Fuse<Service>(subset, FUSE_OPTS);
    return idx.search(debouncedQ).map((r) => r.item);
  }, [services, cat, debouncedQ]);

  if (!hydrated) return <DirectorySkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {DIRECTORY_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="rounded-full px-3 py-1.5 text-xs bg-white ring-1 ring-slate-200 data-[active=true]:bg-slate-900 data-[active=true]:text-white transition"
            data-active={cat === c}
            aria-pressed={cat === c}
            title={`Show ${c} services`}
          >
            {c} ({c === "All" ? counts.All : counts[c]})
          </button>
        ))}
        <input
          placeholder="Search services…"
          className="ml-auto input !h-9 w-56"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search support services"
        />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((s) => {
            const tel = s.phone ? `tel:${s.phone.replace(/[^0-9]/g, "")}` : null;
            const mail = s.email ? `mailto:${s.email}` : null;
            const page = `/support/${s.slug}`;
            const href = tel ?? mail ?? page;
            const isExternal = /^(mailto:|tel:|https?:)/.test(href);

            const CardInner = (
              <motion.div
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 hover:shadow-md hover:ring-slate-300 transition will-change-transform focus-within:ring-2 focus-within:ring-rose-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold text-slate-900">{s.name}</h3>
                      <CatBadge cat={s.category} />
                    </div>
                    <div className="text-xs text-slate-500">{s.hours}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-700">{s.desc}</p>

                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-700 underline">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      View details
                    </span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                    {tel && (
                      <a
                        href={tel}
                        className="rounded-lg px-2 py-1 text-[12px] ring-1 ring-slate-200 hover:bg-slate-50"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {mail && (
                      <a
                        href={mail}
                        className="rounded-lg px-2 py-1 text-[12px] ring-1 ring-slate-200 hover:bg-slate-50"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );

            return isExternal ? (
              <a key={s.slug} href={href} onClick={() => track("support_card_click", { slug: s.slug })}>
                {CardInner}
              </a>
            ) : (
              <Link key={s.slug} href={href} onClick={() => track("support_card_click", { slug: s.slug })}>
                {CardInner}
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
              No matching services. Try a different search or category.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}