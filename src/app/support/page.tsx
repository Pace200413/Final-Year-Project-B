"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {ServiceStatusBar} from "@/components/SystemLayer";
import {SupportRequestForm} from "@/components/SupportUI";
import {SupportDirectory} from "@/components/SupportUI";
import {SupportFAQ} from "@/components/SupportUI";
import {EmergencyBanner} from "@/components/SystemLayer";
import {QuickHelp} from "@/components/SupportUI";
import {EmergencyFAB} from "@/components/SystemLayer";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Mail, Phone, Search, X } from "lucide-react";
import type { Service } from "@/components/appTypes";

/* ---------- LiveChip (pulse) ---------- */
function LiveChip({ label = "Security: 24/7", tone = "green", pulse = true }:{
  label?: string; tone?: "green"|"amber"|"red"; pulse?: boolean;
}) {
  const color = { green:"bg-emerald-500/90", amber:"bg-amber-500/90", red:"bg-rose-500/90" }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 ring-1 ring-slate-200 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-md">
      {pulse && <span className={`relative inline-block size-1.5 rounded-full ${color}`}>
        <span className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`} />
      </span>}
      {label}
    </span>
  );
}

type Settings = {
  alert: { text: string; phone: string; cta: string };
  status: { name: string; ok: boolean; href?: string }[];
  shortcuts: { label: string; cat?: string; q?: string }[];
  services: Service[];
  faqs: { q: string; a: string; tags?: string[] }[];
};

export default function SupportPage() {
  const [filter, setFilter] = useState<{ cat?: string; q?: string }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const router = useRouter();

  useEffect(() => { fetch("/api/support/settings", { cache: "no-store" })
    .then(r => r.json()).then(setSettings); }, []);

  // Command palette items
  const searchItems = useMemo(() => {
    if (!settings) return [];
    const svc = settings.services.map((s) => ({
      title: s.name, hint: s.category,
      href: s.phone ? `tel:${s.phone.replace(/[^0-9]/g,"")}` : s.email ? `mailto:${s.email}` : `/support/${s.slug}`,
      icon: s.phone ? <Phone className="h-4 w-4"/> : s.email ? <Mail className="h-4 w-4"/> : <Search className="h-4 w-4"/>,
    }));
    const faqs = settings.faqs.map((f) => ({ title: f.q, hint: "FAQ", href: "#faqs", icon: <Search className="h-4 w-4" /> }));
    return [...svc, ...faqs];
  }, [settings]);

  // ⌘K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(v => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!settings) return <main className="min-h-screen bg-[#F7F8FA]"><div className="maxw container-px py-10">Loading…</div></main>;

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[13.5px] text-slate-800" aria-labelledby="support-title">
      {/* Smart bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 ring-1 ring-black/5">
        <div className="maxw container-px py-3 flex items-center gap-3">
          <h1 id="support-title" className="text-[22px] font-semibold">Support Services</h1>
          <div className="ml-auto flex items-center gap-2">
            <LiveChip label="Security: 24/7" tone="green" pulse />
            <button onClick={() => setPaletteOpen(true)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 bg-white ring-1 ring-slate-200/70 shadow-sm hover:bg-slate-50 transition" title="Search (⌘K)">
              <Command className="h-4 w-4" /><span className="hidden sm:inline">Search</span>
            </button>
            <button onClick={() => setDrawerOpen(true)} className="lg:hidden inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white bg-gradient-to-b from-rose-500 to-rose-600 shadow-sm ring-1 ring-rose-600/20 hover:from-rose-500 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition">
              <Mail className="h-4 w-4" /> Send request
            </button>
          </div>
        </div>
      </div>

      {/* Callout + status */}
      <div className="maxw container-px my-4 space-y-4">
        <EmergencyBanner variant="smart" phone={settings.alert.phone} showContext={false} />
        <ServiceStatusBar items={settings.status} />
      </div>

      {/* Shortcuts */}
      <div className="maxw container-px">
        <QuickHelp items={settings.shortcuts} onSelect={(v) => setFilter(v)} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5" />
      </div>

      {/* Main grid */}
      <section className="maxw container-px my-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-2 text-[15px] font-semibold">Find a service</h2>
            <SupportDirectory services={settings.services} preset={filter} />
          </div>
          <div id="faqs">
            <SupportFAQ items={settings.faqs} />
          </div>
        </div>

        {/* Right rail */}
        <aside className="hidden lg:block space-y-4" aria-label="Contact and after-hours">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-2 text-[15px] font-semibold">Emergency</h3>
            <p>On-campus emergencies: <a href={`tel:${settings.alert.phone.replace(/[^0-9]/g,"")}`} className="underline font-medium">{settings.alert.phone}</a> (Security, 24/7).</p>
          </div>
          <SupportRequestForm />
        </aside>
      </section>

      <EmergencyFAB phone={settings.alert.phone} />

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white shadow-xl ring-1 ring-black/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold">After-hours request</h3>
                <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-3"><SupportRequestForm /></div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command palette */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setPaletteOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="mx-auto mt-24 w-[92%] max-w-xl rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <Search className="h-4 w-4 text-slate-500" />
                <input autoFocus placeholder="Search services, FAQs, phone numbers…" className="flex-1 bg-transparent outline-none text-sm"
                  onChange={(e) => {
                    const val = e.currentTarget.value.toLowerCase();
                    const elts = Array.from(document.querySelectorAll<HTMLLIElement>("[data-cmd-item]"));
                    elts.forEach((li) => { const hay = li.dataset.hay || ""; li.style.display = hay.includes(val) ? "" : "none"; });
                  }}/>
                <kbd className="hidden sm:inline rounded bg-white px-1.5 py-0.5 text-[11px] ring-1 ring-slate-200">⌘K</kbd>
              </div>
              <ul className="mt-2 max-h-[50vh] overflow-auto">
                {searchItems.map((it, i) => (
                  <li key={i} data-cmd-item data-hay={(it.title + " " + it.hint).toLowerCase()}>
                    <button onClick={() => { setPaletteOpen(false); if (it.href.startsWith("/")) router.push(it.href); else window.location.href = it.href; }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 focus:bg-slate-50">
                      <span className="text-slate-600">{it.icon}</span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{it.title}</div>
                        <div className="text-xs text-slate-500">{it.hint}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
