"use client";

import { useEffect, useRef, useState } from "react";
import type { SecuritySettings, SecContact, SecBottomCard, SecExitGuide } from "@/lib/types";

const API = "/api/admin/security-settings";

export default function AdminSecurityPage() {
  const [s, setS] = useState<SecuritySettings | null>(null);

  // 🔔 channel to notify user pages
  const bcRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("security-settings");
    }
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const load = async () => {
    const r = await fetch(API, { cache: "no-store" });
    const { settings } = await r.json();
    setS(settings as SecuritySettings);
  };
  useEffect(() => { load(); }, []);

  async function save(patch: Partial<SecuritySettings>) {
    if (!s) return;
    const next = { ...s, ...patch } as SecuritySettings;
    setS(next); // optimistic

    await fetch(API, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });

    // 🔔 notify other tabs/pages right away
    try { bcRef.current?.postMessage({ type: "updated", at: Date.now() }); } catch {}
    try { localStorage.setItem("security-settings:updated", String(Date.now())); } catch {}
  }

  if (!s) return <div className="p-4">Loading…</div>;

  const setGuide = (patch: Partial<SecExitGuide>) => save({ exitGuide: { ...s.exitGuide, ...patch } });
  const setContact = (i: number, patch: Partial<SecContact>) => {
    const next = s.contacts.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    save({ contacts: next });
  };
  const addContact = () => save({ contacts: [...s.contacts, { name: "", phone: "" }] });
  const removeContact = (i: number) => save({ contacts: s.contacts.filter((_, idx)=>idx!==i) });

  const setCard = (i: number, patch: Partial<SecBottomCard>) => {
    const next = s.bottomCards.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    save({ bottomCards: next });
  };
  const addCard = () => save({ bottomCards: [...s.bottomCards, { title:"", description:"", href:"#", linkText:"Learn more" }] });
  const removeCard = (i: number) => save({ bottomCards: s.bottomCards.filter((_, idx)=>idx!==i) });

  return (
    /* ...your JSX unchanged... */


/* helpers I/T/L unchanged */

    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Security & Emergency page</h2>
        <button onClick={load} className="px-3 py-2 rounded-lg border">Refresh</button>
      </header>

      {/* Top bar */}
      <section className="rounded-2xl border p-4 bg-white">
        <h3 className="font-medium mb-3">Top bar</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <L label="Emergency label"><I value={s.emergencyLabel} onBlur={(v)=>save({ emergencyLabel: v })}/></L>
          <L label="Emergency tel"><I value={s.emergencyTel} onBlur={(v)=>save({ emergencyTel: v })}/></L>
          <L label="Exit nav label"><I value={s.exitNavLabel} onBlur={(v)=>save({ exitNavLabel: v })}/></L>
          <L label="Exit nav URL"><I value={s.exitNavUrl} onBlur={(v)=>save({ exitNavUrl: v })}/></L>
        </div>
      </section>

      {/* Header + alert */}
      <section className="rounded-2xl border p-4 bg-white">
        <h3 className="font-medium mb-3">Header & alert</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Page title"><I value={s.title} onBlur={(v)=>save({ title: v })}/></L>
          <L label="Subtitle"><I value={s.subtitle} onBlur={(v)=>save({ subtitle: v })}/></L>
          <L label="Alert / reminder text" wide><T value={s.alertText} onBlur={(v)=>save({ alertText: v })}/></L>
        </div>
      </section>

      {/* Exit guide */}
      <section className="rounded-2xl border p-4 bg-white">
        <h3 className="font-medium mb-3">Emergency Exit Guide</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Your location text"><I value={s.exitGuide.locationText} onBlur={(v)=>setGuide({ locationText: v })}/></L>
          <L label="Nearest exit text"><I value={s.exitGuide.nearestExitText} onBlur={(v)=>setGuide({ nearestExitText: v })}/></L>
          <L label="Link text"><I value={s.exitGuide.linkText} onBlur={(v)=>setGuide({ linkText: v })}/></L>
          <L label="Link URL"><I value={s.exitGuide.linkHref} onBlur={(v)=>setGuide({ linkHref: v })}/></L>
        </div>
      </section>

      {/* Contacts */}
      <section className="rounded-2xl border p-4 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Emergency contacts</h3>
          <button onClick={addContact} className="px-3 py-2 rounded-lg border">+ Add</button>
        </div>
        <div className="grid gap-3">
          {s.contacts.map((c, i) => (
            <div key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <L label="Contact name"><I value={c.name} onBlur={(v)=>setContact(i, { name: v })}/></L>
              <L label="Phone number"><I value={c.phone} onBlur={(v)=>setContact(i, { phone: v })}/></L>
              <button onClick={()=>removeContact(i)} className="h-10 rounded-lg border px-3">Remove</button>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom cards */}
      <section className="rounded-2xl border p-4 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Bottom cards</h3>
          <button onClick={addCard} className="px-3 py-2 rounded-lg border">+ Add</button>
        </div>
        <div className="grid gap-4">
          {s.bottomCards.map((c, i) => (
            <div key={i} className="rounded-xl border p-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <L label="Title"><I value={c.title} onBlur={(v)=>setCard(i, { title: v })}/></L>
              <L label="Link text (optional)"><I value={c.linkText ?? ""} onBlur={(v)=>setCard(i, { linkText: v })}/></L>
              <L label="Description" wide><T value={c.description} onBlur={(v)=>setCard(i, { description: v })}/></L>
              <L label="Link / target"><I value={c.href} onBlur={(v)=>setCard(i, { href: v })}/></L>
              <div className="sm:col-span-2 lg:col-span-4">
                <button onClick={()=>removeCard(i)} className="rounded-lg border px-3 py-2">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* helpers */
function L({ label, children, wide=false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`grid gap-1 ${wide ? "sm:col-span-2 lg:col-span-2" : ""}`}>
    <span className="text-xs text-slate-600">{label}</span>{children}
  </label>;
}
function I({ value, onBlur }: { value: string; onBlur: (v:string)=>void }) {
  return <input defaultValue={value} onBlur={e=>onBlur(e.currentTarget.value)} className="border rounded-lg px-3 py-2 w-full"/>;
}
function T({ value, onBlur }: { value: string; onBlur: (v:string)=>void }) {
  return <textarea defaultValue={value} rows={3} onBlur={e=>onBlur(e.currentTarget.value)} className="border rounded-lg px-3 py-2 w-full"/>;
}
