"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CampusEvent } from "@/lib/types";

export default function EventsPage() {
  const [items, setItems] = useState<CampusEvent[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/events?published=1", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setItems(((j.items as CampusEvent[]) ?? []).sort((a, b) => +new Date(a.date) - +new Date(b.date)));
        setErr(null);
      } catch (e: any) {
        setItems([]);
        setErr(e?.message ?? "Failed to load");
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const key = (iso: string) => {
      const d = new Date(iso);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    };
    const m = new Map<string, CampusEvent[]>();
    for (const e of items) {
      const k = key(e.date);
      (m.get(k) ?? m.set(k, []).get(k)!).push(e);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <div className="min-h-screen maxw container-px pb-20 pt-6">
      <h1 className="text-lg font-semibold">Events</h1>

      {err && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div>}

      {groups.length === 0 ? (
        <div className="mt-10 text-sm text-slate-600">No events.</div>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(([day, list]) => (
            <section key={day}>
              <div className="text-sm font-semibold text-slate-700 mb-2">{day}</div>
              <div className="space-y-2">
                {list.map((ev) => (
                  <Link key={ev.id} href={`/events/${ev.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
                    <div className="font-medium">{ev.title}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {new Date(ev.date).toLocaleString()} • {(ev as any).category ?? "Other"} • {(ev as any).venue?.building ?? ""}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}