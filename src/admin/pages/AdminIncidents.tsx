"use client";

import { useMemo, useState } from "react";
import { formatAt } from "@/lib/utils";

type Service = "Canvas" | "Wi-Fi" | "Portal";
type Status = "Operational" | "Degraded" | "Outage" | "Maintenance";
const TONE: Record<Status, string> = {
  Operational: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Degraded: "bg-amber-50 text-amber-800 ring-amber-200",
  Outage: "bg-rose-50 text-rose-700 ring-rose-200",
  Maintenance: "bg-sky-50 text-sky-700 ring-sky-200",
};
type Incident = { id: string; service: Service; status: Status; title: string; note?: string; at: string };

function uid() {
  // URL-safe, sortable enough for UI list
  return `i_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function IncidentsPage() {
  const [service, setService] = useState<Service>("Canvas");
  const [status, setStatus] = useState<Status>("Operational");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<Incident[]>([
    { id: "i1", service: "Wi-Fi", status: "Degraded", title: "High latency in B-Block", at: "2025-10-07 09:40" },
    { id: "i2", service: "Portal", status: "Outage", title: "Login failures", at: "2025-10-06 21:15" },
  ]);

  const filtered = useMemo(() => {
    const byStatus = filter === "All" ? history : history.filter((h) => h.status === filter);
    const ql = q.trim().toLowerCase();
    return ql ? byStatus.filter((h) => (h.title + " " + (h.note ?? "")).toLowerCase().includes(ql)) : byStatus;
  }, [history, filter, q]);

  function publish() {
    if (!title.trim()) return;
    const next: Incident = {
      id: uid(),
      service,
      status,
      title: title.trim(),
      note: note.trim() || undefined,
      at: new Date().toISOString(),
    };
    setHistory((h) => [next, ...h]);
    setTitle("");
    setNote("");
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">Status & Incidents</h2>

      {/* Editor */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Service</span>
            <select className="input" value={service} onChange={(e) => setService(e.target.value as Service)}>
              <option>Canvas</option>
              <option>Wi-Fi</option>
              <option>Portal</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Status</span>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              <option>Operational</option>
              <option>Degraded</option>
              <option>Outage</option>
              <option>Maintenance</option>
            </select>
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Title</span>
            <input
              className="input"
              placeholder="Short summary (visible to users)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Public note (optional)</span>
            <textarea
              className="input min-h-[96px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Impact, scope, next update…"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs ring-1 ${TONE[status]}`}
            aria-label={`Current ${service} status is ${status}`}
            title={`${service} · ${status}`}
          >
            Current: {service} · {status}
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setService("Canvas");
                setStatus("Operational");
                setTitle("");
                setNote("");
              }}
            >
              Reset
            </button>
            <button className="btn btn-primary" onClick={publish}>
              Publish update
            </button>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["All", "Operational", "Degraded", "Outage", "Maintenance"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl border px-3 py-1 text-sm ${
                filter === s ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          className="input w-full sm:w-64"
          placeholder="Search incidents…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search incidents"
        />
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">No incidents match your filter.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((i) => (
              <div key={i.id} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="text-sm font-medium">{i.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className={`rounded-md px-2 py-0.5 ring-1 ${TONE[i.status]}`}>{i.status}</span>
                    <span className="rounded-md bg-slate-50 px-2 py-0.5 ring-1 ring-slate-200">{i.service}</span>
                    <span>{formatAt(i.at)}</span>
                  </div>
                  {i.note && <p className="mt-2 text-sm text-slate-700">{i.note}</p>}
                </div>
                <div className="text-right text-xs text-slate-500">#{i.id.slice(0, 6)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
