"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExitRecord, ExitSettings, ExitStatus } from "@/lib/types";

// IMPORTANT: App Router API lives at /api/admin/* (not /admin/api/*)
const API = {
  exits: "/api/admin/exits",
  exit: (id: string) => `/api/admin/exits/${id}`,
  settings: "/api/admin/exit-settings",
};

type Draft = Partial<ExitRecord> & { id?: string };

function emptyDraft(): Draft {
  return {
    name: "",
    location: "",
    distance: "",
    estimatedTime: "",
    direction: "",
    status: "Open",
    priority: 1,
  };
}

export default function AdminExitsPage() {
  const [items, setItems] = useState<ExitRecord[]>([]);
  const [settings, setSettings] = useState<ExitSettings | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [a, b] = await Promise.all([
      fetch(API.exits, { cache: "no-store" }).then(r => r.json()),
      fetch(API.settings, { cache: "no-store" }).then(r => r.json()),
    ]);
    setItems((a.items as ExitRecord[]) ?? []);
    setSettings((b.settings as ExitSettings) ?? null);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(e =>
      (e.name + " " + e.location).toLowerCase().includes(t)
    );
  }, [items, q]);

  async function saveExit() {
    const payload: Draft = { ...draft, priority: Number(draft.priority ?? 1) };
    if (draft.id) {
      setBusy(draft.id);
      await fetch(API.exit(draft.id), {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(API.exits, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setBusy(null); setOpen(false); setDraft(emptyDraft()); await load();
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
    const body = JSON.stringify(patch);
    await fetch(API.settings, { method: "PATCH", headers: { "content-type": "application/json" }, body });
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exit Navigation</h2>
        <button onClick={() => { setDraft(emptyDraft()); setOpen(true); }} className="px-3 py-2 rounded-lg bg-slate-900 text-white">+ New Exit</button>
      </header>

      {settings && (
        <section className="rounded-2xl border p-4 bg-white">
          <h3 className="font-medium mb-3">Page settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Emergency number</span>
              <input className="border rounded-lg px-3 py-2"
                value={settings.emergencyNumber}
                onChange={e => setSettings({ ...settings, emergencyNumber: e.target.value })}
                onBlur={() => saveSettings({ emergencyNumber: settings.emergencyNumber })}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-slate-600">CTA link</span>
              <input className="border rounded-lg px-3 py-2"
                value={settings.ctaLink}
                onChange={e => setSettings({ ...settings, ctaLink: e.target.value })}
                onBlur={() => saveSettings({ ctaLink: settings.ctaLink })}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Default location</span>
              <input className="border rounded-lg px-3 py-2"
                value={settings.defaultLocation}
                onChange={e => setSettings({ ...settings, defaultLocation: e.target.value })}
                onBlur={() => saveSettings({ defaultLocation: settings.defaultLocation })}
              />
            </label>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={settings.pickFirstOpen}
                onChange={e => saveSettings({ pickFirstOpen: e.target.checked })} />
              Pick first OPEN as nearest
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={settings.showClosed}
                onChange={e => saveSettings({ showClosed: e.target.checked })} />
              Show closed exits
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={settings.showSearch}
                onChange={e => saveSettings({ showSearch: e.target.checked })} />
              Show search box
            </label>
          </div>
        </section>
      )}

      <div className="flex items-center gap-2">
        <input placeholder="Search name / location…" value={q} onChange={e => setQ(e.target.value)}
          className="border rounded-lg px-3 py-2 w-72" />
        <button onClick={load} className="px-3 py-2 rounded-lg border">Refresh</button>
      </div>

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
                    onChange={(ev) => quickStatus(e.id, ev.target.value as ExitRecord["status"])}
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
                    value={draft.status as ExitStatus}
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
