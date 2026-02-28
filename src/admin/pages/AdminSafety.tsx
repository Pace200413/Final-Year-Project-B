// src/app/admin/(console)/safety/page.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";

type SafetySection = {
  id: string; group: string; title: string; text: string;
  link?: string; linkLabel?: string;
};
type SafetyData = {
  emergencyNumber: string;
  securityNumber: string;
  itHelpEmail: string;
  reportUrl: string;
  sections: SafetySection[];
};

const API = "/api/safety";

export default function AdminSafetyPage() {
  const [data, setData] = useState<SafetyData | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const json: SafetyData = await fetch(API, { cache: "no-store" }).then(r => r.json());
    setData(json);
  }
  useEffect(() => { load(); }, []);

  async function patch(p: Partial<SafetyData>) {
    setBusy(true);
    const json: SafetyData = await fetch(API, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    }).then(r => r.json());
    setData(json);
    setBusy(false);
  }

  function updateSection(i: number, s: Partial<SafetySection>) {
    if (!data) return;
    const next = [...data.sections];
    next[i] = { ...next[i], ...s };
    patch({ sections: next });
  }
  function addSection() {
    if (!data) return;
    const id = `item-${Math.random().toString(36).slice(2, 8)}`;
    patch({
      sections: [
        ...data.sections,
        { id, group: "General", title: "New item", text: "Edit...", link: "", linkLabel: "" },
      ],
    });
  }
  function removeSection(i: number) {
    if (!data) return;
    patch({ sections: data.sections.filter((_, idx) => idx !== i) });
  }

  if (!data) return <div className="p-4">Loading settings…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Safety</h2>
        <div className="flex gap-2">
          <Link href="/safety" target="_blank" className="btn-outlined">Open customer page ↗</Link>
        </div>
      </header>

      {/* Page settings */}
      <Card title="Page settings" footer={busy && <Saving />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Emergency number" value={data.emergencyNumber} onBlur={(v) => patch({ emergencyNumber: v })}/>
          <TextField label="Security number"  value={data.securityNumber}  onBlur={(v) => patch({ securityNumber: v })}/>
          <TextField label="IT help email"    value={data.itHelpEmail}    onBlur={(v) => patch({ itHelpEmail: v })}/>
          <TextField label="Report URL"       value={data.reportUrl}      onBlur={(v) => patch({ reportUrl: v })}/>
        </div>
      </Card>

      {/* Quick preview */}
      <Card title="Preview">
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={`tel:${data.emergencyNumber}`} className="btn-primary">📞 Emergency {data.emergencyNumber}</a>
          <Link href="/exit-navigation" className="btn-dark">Open Exit Navigation</Link>
        </div>
      </Card>

      {/* Sections */}
      <Card
        title="Sections"
        action={<button onClick={addSection} className="btn-dark">+ Add section</button>}
      >
        {data.sections.length === 0 && (
          <div className="p-4 text-sm text-slate-500">No sections yet.</div>
        )}

        <div className="space-y-3">
          {data.sections.map((s, i) => (
            <details key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="truncate">
                  <span className="font-medium">{s.title || "Untitled"}</span>
                  <span className="text-slate-500"> · {s.group || "General"}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {s.linkLabel || s.link || "No link"}
                </div>
              </summary>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-6">
                <TextField className="sm:col-span-2" label="Group" value={s.group} onBlur={(v) => updateSection(i, { group: v })}/>
                <TextField className="sm:col-span-2" label="Title" value={s.title} onBlur={(v) => updateSection(i, { title: v })}/>
                <TextField className="sm:col-span-2" label="Link label" value={s.linkLabel ?? ""} onBlur={(v) => updateSection(i, { linkLabel: v })}/>
                <TextArea  className="sm:col-span-4" label="Text" value={s.text} onBlur={(v) => updateSection(i, { text: v })}/>
                <TextField className="sm:col-span-2" label="Link URL" value={s.link ?? ""} onBlur={(v) => updateSection(i, { link: v })}/>

                <div className="sm:col-span-6 flex justify-end">
                  <button onClick={() => removeSection(i)} className="btn-outlined">Delete</button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- UI primitives ---------- */
function Card({ title, children, action, footer }:{
  title: string; children: ReactNode; action?: ReactNode; footer?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        {action}
      </div>
      {children}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </section>
  );
}
function Saving() {
  return <div className="text-xs text-slate-500">Saving…</div>;
}

function TextField({
  label, value, onBlur, className,
}: { label: string; value: string; onBlur: (val: string)=>void; className?: string }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <label className={`grid gap-1 ${className ?? ""}`}>
      <span className="text-xs text-slate-600">{label}</span>
      <input
        className="h-10 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onBlur(v)}
      />
    </label>
  );
}
function TextArea({
  label, value, onBlur, className,
}: { label: string; value: string; onBlur: (val: string)=>void; className?: string }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <label className={`grid gap-1 ${className ?? ""}`}>
      <span className="text-xs text-slate-600">{label}</span>
      <textarea
        rows={3}
        className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onBlur(v)}
      />
    </label>
  );
}

/* Buttons (utility classes) – place these in globals if you prefer */
 // TS happy in .tsx
