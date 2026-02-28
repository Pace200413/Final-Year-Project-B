"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Spark                                                               */
/* ------------------------------------------------------------------ */

export function Spark({
  data,
  label,
  w = 120,
  h = 32,
}: {
  data: number[];
  label?: string;
  w?: number;
  h?: number;
}) {
  const max = Math.max(...data, 1);
  const step = w / (data.length - 1 || 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");

  return (
    <svg
      width={w}
      height={h}
      role="img"
      aria-label={label ?? "sparkline"}
      className="overflow-visible"
    >
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MiniStat                                                            */
/* ------------------------------------------------------------------ */

export function MiniStat({
  label,
  value,
  sub,
  series,
}: {
  label: string;
  value: string | number;
  sub?: string;
  series: number[];
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-slate-500">{sub}</div>}
      </div>
      <div className="text-slate-400">
        <Spark data={series} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-tile">
      <div className="flex items-center gap-2">
        {icon && (
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-slate-200">
            {icon}
          </div>
        )}
        <div className="text-sm font-semibold text-slate-800">{label}</div>
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatusPill                                                          */
/* ------------------------------------------------------------------ */

export function StatusPill({
  s,
}: {
  s: "Operational" | "Degraded" | "Outage" | "Maintenance";
}) {
  const tone =
    s === "Operational"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : s === "Degraded"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : s === "Maintenance"
      ? "bg-sky-50 text-sky-700 ring-sky-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ring-1 ${tone}`}>
      {s}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SLAWidget                                                            */
/* ------------------------------------------------------------------ */

export function SLAWidget({
  within,
  total,
  meanHrs,
}: {
  within: number;
  total: number;
  meanHrs: number;
}) {
  const pct = total ? Math.round((within / total) * 1000) / 10 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">SLA compliance</div>
          <div className="mt-1 text-xs text-slate-600">
            {within}/{total} within SLA
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{pct}%</div>
          <div className="text-xs text-slate-500">Avg resolution {meanHrs}h</div>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                           */
/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="text-sm font-medium">{title}</div>
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HealthHeatmap                                                        */
/* ------------------------------------------------------------------ */

export function HealthHeatmap({
  rows,
  cols,
  cells,
}: {
  rows: string[];
  cols: string[];
  cells: number[][];
}) {
  const tone = ["bg-emerald-100", "bg-amber-200", "bg-rose-300", "bg-sky-200"];
  const label = ["Operational", "Degraded", "Outage", "Maintenance"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-semibold">System health (by area)</div>
      <div className="overflow-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-500">Area</th>
              {cols.map((c) => (
                <th key={c} className="p-2 text-left text-slate-500">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r}>
                <td className="p-2 pr-4 font-medium">{r}</td>
                {cells[i].map((v, j) => (
                  <td key={`${i}-${j}`} className="p-2">
                    <span
                      className={`inline-block h-4 w-4 rounded ${tone[v]}`}
                      title={label[v]}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MobileHeader                                                         */
/* ------------------------------------------------------------------ */

export function MobileHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl-K focuses the search; "/" also focuses if not typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const metaK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (metaK || slash) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur sm:hidden">
      <div className="px-3 py-2">
        {/* Search bar */}
        <input
          ref={inputRef}
          className="input w-full"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />

        {/* Quick links row */}
        <nav
          aria-label="Admin quick links"
          className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar"
        >
          <Link href="/admin" className="chip whitespace-nowrap">
            Overview
          </Link>
          <Link href="/admin/banners" className="chip whitespace-nowrap">
            Banners
          </Link>
          <Link href="/admin/services" className="chip whitespace-nowrap">
            Services
          </Link>
          <Link href="/admin/incidents" className="chip whitespace-nowrap">
            Incidents
          </Link>

          {/* Notifications button (light UI) */}
          <button
            type="button"
            aria-label="Notifications"
            className="ml-auto relative rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm active:scale-[.98]"
            onClick={() => router.push("/admin/notifications")}
          >
            <span className="pr-3">Notifications</span>
            <span
              aria-hidden
              className="absolute right-1 top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-[var(--brand)] px-1 text-[11px] font-semibold text-white"
            >
              2
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                              */
/* ------------------------------------------------------------------ */

export function Toolbar({
  onSearch,
  extra,
  placeholder = "Search…",
}: {
  onSearch: (q: string) => void;
  extra?: ReactNode;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const id = setTimeout(() => onSearch(q), 200);
    return () => clearTimeout(id);
  }, [q, onSearch]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <input
        className="input w-full sm:w-72"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search"
      />
      <div className="flex flex-wrap gap-2">{extra}</div>
    </div>
  );
}