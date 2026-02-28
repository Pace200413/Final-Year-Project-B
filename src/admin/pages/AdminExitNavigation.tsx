// src/app/admin/exit-navigation/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaDoorOpen, FaPhoneAlt, FaMapMarkedAlt, FaWalking, FaDirections,
  FaMapPin, FaSearch, FaCheckCircle, FaTimesCircle, FaTools,
} from "react-icons/fa";
import Link from "next/link";

/* ---- Types (local to avoid import path issues) ---- */
type ExitStatus = "Open" | "Closed" | "Under Maintenance";

type ExitRecord = {
  id: string;
  name: string;
  location: string;
  distance: string;
  estimatedTime: string;
  direction: string;
  status: ExitStatus;
  priority: number;
  lat?: number;
  lng?: number;
};

type ExitSettings = {
  emergencyNumber: string;     // "999"
  ctaLink: string;             // "/exit-navigation"
  defaultLocation: string;     // "ADM Building, Level 2"
  pickFirstOpen: boolean;      // true
  showClosed: boolean;         // true
  showSearch: boolean;         // true
};

/* ---- API Endpoints ---- */
const API = {
  exits: "/api/admin/exits",
  exit: (id: string) => `/api/admin/exits/${id}`,
  settings: "/api/admin/exit-settings",
};

/* ---- Component ---- */
export default function AdminExitNavigation() {
  const [items, setItems] = useState<ExitRecord[]>([]);
  const [settings, setSettings] = useState<ExitSettings | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<ExitRecord> & { id?: string }>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [a, b] = await Promise.all([
      fetch(API.exits, { cache: "no-store" }).then(r => r.json()).catch(()=>({ items: [] })),
      fetch(API.settings, { cache: "no-store" }).then(r => r.json()).catch(()=>({ settings: null })),
    ]);
    const list: ExitRecord[] = (a.items ?? []) as ExitRecord[];
    list.sort((x, y) => (x.priority ?? 99) - (y.priority ?? 99) || x.name.localeCompare(y.name));
    setItems(list);
    setSettings((b.settings ?? null) as ExitSettings | null);
  }
  useEffect(() => { load(); }, []);

  /* ---- Derived preview data (mirrors customer page) ---- */
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = items;
    if (!settings?.showClosed) list = list.filter(e => e.status !== "Closed");
    if (!t) return list;
    return list.filter(e => (e.name + " " + e.location).toLowerCase().includes(t));
  }, [items, q, settings?.showClosed]);

  const nearestExit = useMemo(() => {
    if (filtered.length === 0) return null;
    if (settings?.pickFirstOpen) {
      return filtered.find(e => e.status === "Open") ?? filtered[0];
    }
    return filtered[0];
  }, [filtered, settings?.pickFirstOpen]);

  /* ---- Mutations ---- */
  async function saveExit() {
    const payload = {
      ...draft,
      priority: Number(draft.priority ?? 1),
    };
    if (draft.id) {
      setBusy(draft.id);
      await fetch(API.exit(draft.id), {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setBusy(null);
    } else {
      await fetch(API.exits, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setOpen(false); setDraft({}); await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this exit?")) return;
    setBusy(id);
    await fetch(API.exit(id), { method: "DELETE" });
    setBusy(null); await load();
  }

  async function quickStatus(id: string, status: ExitStatus) {
    setBusy(id);
    await fetch(API.exit(id), {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null); await load();
  }

  async function saveSettings(patch: Partial<ExitSettings>) {
    await fetch(API.settings, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function seedDemo() {
    const demo: Partial<ExitRecord>[] = [
      { name: "East Exit - Library", location: "Library, Ground Floor", distance: "25m", estimatedTime:"1 minute", direction:"Walk straight to the corridor, turn right at the corner", status:"Open", priority:1 },
      { name: "Main Entrance - ADM Building", location: "ADM Building, Level 2", distance: "45m", estimatedTime:"1 minute", direction:"Head straight, then turn left near the stairwell", status:"Open", priority:2 },
      { name: "Stairwell B - Emergency Exit", location: "Student Centre, Level 3", distance: "30m", estimatedTime:"2 minutes", direction:"Take the stairs down, exit through the red door", status:"Under Maintenance", priority:3 },
    ];
    for (const d of demo) {
      await fetch(API.exits, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(d) });
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exit Navigation</h2>
        <div className="flex items-center gap-2">
          <Link href="/exit-navigation" className="px-3 py-2 rounded-lg border">Open customer page ↗</Link>
          <button onClick={() => { setDraft({}); setOpen(true); }} className="px-3 py-2 rounded-lg bg-slate-900 text-white">+ New Exit</button>
        </div>
      </header>

      {/* SETTINGS (maps 1:1 to customer view controls) */}
      <section className="rounded-2xl border p-4 bg-white">
        <h3 className="font-medium mb-3">Page settings</h3>
        {settings ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Emergency number (top red button)</span>
                <input className="border rounded-lg px-3 py-2"
                  value={settings.emergencyNumber}
                  onChange={e => setSettings({ ...settings, emergencyNumber: e.target.value })}
                  onBlur={() => saveSettings({ emergencyNumber: settings.emergencyNumber })}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">CTA link (second button)</span>
                <input className="border rounded-lg px-3 py-2"
                  value={settings.ctaLink}
                  onChange={e => setSettings({ ...settings, ctaLink: e.target.value })}
                  onBlur={() => saveSettings({ ctaLink: settings.ctaLink })}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Default user location</span>
                <input className="border rounded-lg px-3 py-2"
                  value={settings.defaultLocation}
                  onChange={e => setSettings({ ...settings, defaultLocation: e.target.value })}
                  onBlur={() => saveSettings({ defaultLocation: settings.defaultLocation })}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={settings.pickFirstOpen}
                  onChange={e => saveSettings({ pickFirstOpen: e.target.checked })} />
                Pick first <b>OPEN</b> exit as nearest
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={settings.showClosed}
                  onChange={e => saveSettings({ showClosed: e.target.checked })} />
                Show CLOSED exits in list
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={settings.showSearch}
                  onChange={e => saveSettings({ showSearch: e.target.checked })} />
                Show search box
              </label>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-500">Loading settings…</div>
        )}
      </section>

      {/* PREVIEW (what users see) */}
      <section className="rounded-2xl border p-4 bg-white">
        <h3 className="font-medium mb-3">Preview</h3>
        <div className="grid gap-3">
          {/* Top bar preview */}
          <div className="flex gap-3">
            <a href={`tel:${settings?.emergencyNumber ?? "999"}`} className="flex-1 inline-flex items-center justify-center rounded-lg px-3 py-2 bg-rose-600 text-white text-sm">
              <FaPhoneAlt className="mr-2" /> Emergency {settings?.emergencyNumber ?? "999"}
            </a>
            <Link href={settings?.ctaLink || "/exit-navigation"} className="flex-1 inline-flex items-center justify-center rounded-lg px-3 py-2 bg-slate-900 text-white text-sm">
              Open Exit Navigation
            </Link>
          </div>

          {/* Nearest */}
          <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium">
              <FaDoorOpen className="text-rose-600" /> Nearest Exit
            </div>
            {nearestExit ? (
              <>
                <div className="font-medium">{nearestExit.name}</div>
                <div className="text-slate-600 text-sm">Distance: {nearestExit.distance} • Est. Time: {nearestExit.estimatedTime}</div>
                <div className="text-slate-600 text-sm">Direction: {nearestExit.direction}</div>
                <StatusBadge status={nearestExit.status} />
              </>
            ) : (
              <div className="text-sm text-slate-500">No exits configured.</div>
            )}
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="flex items-center gap-2">
        {settings?.showSearch && (
          <label className="flex items-center border rounded-lg px-3 py-2 bg-white">
            <FaSearch className="text-slate-500 mr-2" />
            <input
              placeholder="Search name / location…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="outline-none bg-transparent w-72"
            />
          </label>
        )}
        <button onClick={load} className="px-3 py-2 rounded-lg border">Refresh</button>
        {items.length === 0 && (
          <button onClick={seedDemo} className="px-3 py-2 rounded-lg border">Seed demo data</button>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Distance</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right w-[220px]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">
                  <input type="number" className="border rounded px-2 py-1 w-20"
                    defaultValue={e.priority}
                    onBlur={async ev => {
                      await fetch(API.exit(e.id), { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify({ priority: Number(ev.currentTarget.value) }) });
                      await load();
                    }}
                  />
                </td>
                <td className="p-3 font-medium">{e.name}</td>
                <td className="p-3">{e.location}</td>
                <td className="p-3">{e.distance}</td>
                <td className="p-3">{e.estimatedTime}</td>
                <td className="p-3">
                  <select
                    className="border rounded px-2 py-1"
                    value={e.status}
                    onChange={(ev) => quickStatus(e.id, ev.target.value as ExitStatus)}
                  >
                    <option>Open</option>
                    <option>Closed</option>
                    <option>Under Maintenance</option>
                  </select>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button className="px-2 py-1 rounded border" onClick={() => { setDraft(e); setOpen(true); }}>Edit</button>
                  <button className="px-2 py-1 rounded border" disabled={busy === e.id} onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-slate-500">No exits</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">{draft.id ? "Edit exit" : "New exit"}</h3>
              <button onClick={() => setOpen(false)} className="px-3 py-2">✕</button>
            </div>

            <div className="grid gap-3">
              {[
                ["Name","name"],
                ["Location","location"],
                ["Distance","distance"],
                ["Estimated time","estimatedTime"],
              ].map(([label, key]) => (
                <label key={key} className="grid gap-1">
                  <span className="text-xs text-slate-600">{label}</span>
                  <input className="border rounded-lg px-3 py-2"
                    value={(draft as any)[key] || ""}
                    onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                  />
                </label>
              ))}

              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Direction</span>
                <textarea className="border rounded-lg px-3 py-2" rows={3}
                  value={draft.direction || ""}
                  onChange={e => setDraft({ ...draft, direction: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">Status</span>
                  <select className="border rounded-lg px-3 py-2"
                    value={(draft.status as ExitStatus) || "Open"}
                    onChange={e => setDraft({ ...draft, status: e.target.value as ExitStatus })}
                  >
                    <option>Open</option><option>Closed</option><option>Under Maintenance</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-slate-600">Priority</span>
                  <input type="number" className="border rounded-lg px-3 py-2"
                    value={String(draft.priority ?? 1)}
                    onChange={e => setDraft({ ...draft, priority: Number(e.target.value) })}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={saveExit} className="px-3 py-2 rounded bg-slate-900 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Small status chip for preview/table ---- */
function StatusBadge({ status }: { status: ExitStatus }) {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border";
  if (status === "Open") return <span className={`${base} bg-green-50 text-green-700 border-green-200`}><FaCheckCircle className="mr-1" />Open</span>;
  if (status === "Closed") return <span className={`${base} bg-red-50 text-rose-600 border-rose-200`}><FaTimesCircle className="mr-1" />Closed</span>;
  return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}><FaTools className="mr-1" />Under Maintenance</span>;
}
