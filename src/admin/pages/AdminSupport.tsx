"use client";

import { useEffect, useState } from "react";

type StatusItem = { name: string; ok: boolean; href?: string };
type Shortcut   = { label: string; cat?: string; q?: string };
type Service    = { slug: string; name: string; category: string; hours: string; desc: string; email?: string; phone?: string; href?: string };
type FAQ        = { q: string; a: string; tags?: string[] };

type Settings = {
  alert: { text: string; phone: string; cta: string };
  status: StatusItem[];
  shortcuts: Shortcut[];
  services: Service[];
  faqs: FAQ[];
  routing: Record<string,string>;
};

const API = "/api/support/settings";

export default function AdminSupportPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    const r = await fetch(API, { cache: "no-store" });
    const j = await r.json();
    setS(j);
  })(); }, []);

  async function save(patch: Partial<Settings>) {
    setSaving(true);
    const r = await fetch(API, {
      method: "PATCH",
      headers: { "content-type":"application/json" },
      body: JSON.stringify(patch),
    });
    setS(await r.json());
    setSaving(false);
  }

  if (!s) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Support</h1>

      {/* Alert bar */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <h2 className="text-sm font-semibold mb-2">Top alert bar</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="grid gap-1 text-xs">
            <span className="font-medium">Text</span>
            <input className="input" value={s.alert.text} onChange={e => setS({ ...s, alert: { ...s.alert, text: e.target.value } })}/>
          </label>
          <label className="grid gap-1 text-xs">
            <span className="font-medium">Phone (shown & dialled)</span>
            <input className="input" value={s.alert.phone} onChange={e => setS({ ...s, alert: { ...s.alert, phone: e.target.value } })}/>
          </label>
          <label className="grid gap-1 text-xs">
            <span className="font-medium">CTA label</span>
            <input className="input" value={s.alert.cta} onChange={e => setS({ ...s, alert: { ...s.alert, cta: e.target.value } })}/>
          </label>
        </div>
        <div className="mt-3">
          <button onClick={() => save({ alert: s.alert })} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={saving}>
            {saving ? "Saving…" : "Save alert"}
          </button>
        </div>
      </section>

      {/* Status chips */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <h2 className="text-sm font-semibold mb-2">Status chips</h2>
        <div className="space-y-2">
          {s.status.map((it, i) => (
            <div key={i} className="grid sm:grid-cols-4 gap-2 items-center">
              <input className="input" value={it.name}
                onChange={e => { const next=[...s.status]; next[i]={...it,name:e.target.value}; setS({...s,status:next}); }}/>
              <input className="input sm:col-span-2" placeholder="Link (optional)" value={it.href || ""}
                onChange={e => { const next=[...s.status]; next[i]={...it,href:e.target.value || undefined}; setS({...s,status:next}); }}/>
              <label className="inline-flex items-center gap-2 text-xs">
                <input type="checkbox" checked={it.ok}
                  onChange={e => { const next=[...s.status]; next[i]={...it,ok:e.target.checked}; setS({...s,status:next}); }}/>
                Operational
              </label>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => save({ status: s.status })} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={saving}>
            {saving ? "Saving…" : "Save status"}
          </button>
          <button onClick={() => setS({ ...s, status: [...s.status, { name: "New service", ok: true }] })} className="rounded-xl ring-1 ring-slate-300 px-4 py-2">
            Add chip
          </button>
        </div>
      </section>

      {/* Shortcuts */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Topic shortcuts ({s.shortcuts.length})</h2>
          <button onClick={() => setS({ ...s, shortcuts: [...s.shortcuts, { label: "New", cat: "General" }] })} className="rounded-xl ring-1 ring-slate-300 px-3 py-1.5 text-sm">Add</button>
        </div>
        <div className="mt-3 space-y-2">
          {s.shortcuts.map((c, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-2">
              <input className="input" value={c.label} onChange={e => { const next=[...s.shortcuts]; next[i]={...c,label:e.target.value}; setS({...s,shortcuts:next}); }}/>
              <input className="input" value={c.cat || ""} placeholder="Category" onChange={e => { const next=[...s.shortcuts]; next[i]={...c,cat:e.target.value || undefined}; setS({...s,shortcuts:next}); }}/>
              <input className="input" value={c.q || ""} placeholder="Search terms" onChange={e => { const next=[...s.shortcuts]; next[i]={...c,q:e.target.value || undefined}; setS({...s,shortcuts:next}); }}/>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button onClick={() => save({ shortcuts: s.shortcuts })} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={saving}>
            {saving ? "Saving…" : "Save shortcuts"}
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Services ({s.services.length})</h2>
          <button onClick={() => setS({ ...s, services: [...s.services, { slug:"new-service", name:"New service", category:"IT Support", hours:"Mon–Fri 9:00–17:00", desc:"Edit me…" }] })}
            className="rounded-xl ring-1 ring-slate-300 px-3 py-1.5 text-sm">Add service</button>
        </div>
        <div className="mt-3 space-y-3">
          {s.services.map((sv, idx) => (
            <div key={sv.slug+idx} className="rounded-xl ring-1 ring-slate-200 p-3">
              <div className="grid sm:grid-cols-6 gap-2">
                <input className="input" value={sv.slug} onChange={e => { const ns=[...s.services]; ns[idx]={...sv,slug:e.target.value}; setS({...s,services:ns}); }}/>
                <input className="input sm:col-span-2" value={sv.name} onChange={e => { const ns=[...s.services]; ns[idx]={...sv,name:e.target.value}; setS({...s,services:ns}); }}/>
                <input className="input" value={sv.category} onChange={e => { const ns=[...s.services]; ns[idx]={...sv,category:e.target.value}; setS({...s,services:ns}); }}/>
                <input className="input" value={sv.hours} onChange={e => { const ns=[...s.services]; ns[idx]={...sv,hours:e.target.value}; setS({...s,services:ns}); }}/>
                <input className="input" placeholder="tel/email/url (optional)" value={sv.phone || sv.email || sv.href || ""} onChange={e => {
                  const v = e.target.value; const ns=[...s.services]; const patch: Partial<Service> = {};
                  if (v.startsWith("http")) { patch.href = v; patch.email = undefined; patch.phone = undefined; }
                  else if (v.includes("@")) { patch.email = v; patch.href = undefined; patch.phone = undefined; }
                  else { patch.phone = v; patch.href = undefined; patch.email = undefined; }
                  ns[idx] = { ...sv, ...patch }; setS({ ...s, services: ns });
                }}/>
                <textarea className="input sm:col-span-6" rows={2} value={sv.desc}
                  onChange={e => { const ns=[...s.services]; ns[idx]={...sv,desc:e.target.value}; setS({...s,services:ns}); }}/>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => save({ services: s.services })} className="rounded-xl bg-slate-900 px-3 py-1.5 text-white disabled:opacity-50" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { const ns=[...s.services]; ns.splice(idx,1); save({ services: ns }); }} className="rounded-xl ring-1 ring-slate-300 px-3 py-1.5">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">FAQs ({s.faqs.length})</h2>
          <button onClick={() => setS({ ...s, faqs:[...s.faqs, { q: "New question", a: "Answer…" }] })} className="rounded-xl ring-1 ring-slate-300 px-3 py-1.5 text-sm">Add FAQ</button>
        </div>
        <div className="mt-3 space-y-3">
          {s.faqs.map((f, i) => (
            <div key={i} className="rounded-xl ring-1 ring-slate-200 p-3">
              <input className="input mb-2" value={f.q} onChange={e => { const nf=[...s.faqs]; nf[i]={...f,q:e.target.value}; setS({...s,faqs:nf}); }}/>
              <textarea className="input" rows={2} value={f.a} onChange={e => { const nf=[...s.faqs]; nf[i]={...f,a:e.target.value}; setS({...s,faqs:nf}); }}/>
              <div className="mt-2 flex gap-2">
                <button onClick={() => save({ faqs: s.faqs })} className="rounded-xl bg-slate-900 px-3 py-1.5 text-white disabled:opacity-50" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => { const nf=[...s.faqs]; nf.splice(i,1); save({ faqs: nf }); }} className="rounded-xl ring-1 ring-slate-300 px-3 py-1.5">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Routing */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <h2 className="text-sm font-semibold mb-2">After-hours routing</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          {Object.entries(s.routing).map(([cat, email]) => (
            <label key={cat} className="grid gap-1 text-xs">
              <span className="font-medium">{cat}</span>
              <input className="input" value={email} onChange={e => setS({ ...s, routing: { ...s.routing, [cat]: e.target.value } })}/>
            </label>
          ))}
        </div>
        <div className="mt-3">
          <button onClick={() => save({ routing: s.routing })} className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={saving}>
            {saving ? "Saving…" : "Save routing"}
          </button>
        </div>
      </section>
    </div>
  );
}
