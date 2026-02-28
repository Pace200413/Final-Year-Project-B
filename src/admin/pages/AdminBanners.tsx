"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/AdminWidgets";
import {Toolbar} from "@/components/AdminWidgets";
import type { Banner } from "@/lib/types";

function uid(){ return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}` }

export default function BannersPage() {
  const [rows, setRows] = useState<Banner[]>([
    { id:"b1", title:"Power maintenance", message:"B-Block outage tonight", startAt:"2025-10-09T22:00", endAt:"2025-10-09T23:30", campuses:["Main"], active:true },
  ]);
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query ? rows.filter(r => (r.title + " " + r.message).toLowerCase().includes(query)) : rows;
  }, [q, rows]);

  function addQuick() {
    setRows(r => [
      { id: uid(), title:"New banner", message:"Short message", startAt:new Date().toISOString(), campuses:["Main"], active:false },
      ...r
    ]);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Banners</h1>
        <button className="btn btn-primary" onClick={addQuick}>New banner</button>
      </div>

      <Toolbar onSearch={setQ} placeholder="Search banners…" />

      {data.length === 0 ? (
        <EmptyState title="No banners yet" hint="Create a banner to notify students about planned work, outages, or announcements." action={<button className="btn btn-primary" onClick={addQuick}>Create banner</button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Window</th>
                <th>Campuses</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map(b => (
                <tr key={b.id}>
                  <td className="font-medium">{b.title}</td>
                  <td className="text-xs text-slate-600">
                    {new Date(b.startAt).toLocaleString()}
                    {b.endAt ? ` → ${new Date(b.endAt).toLocaleString()}` : ""}
                  </td>
                  <td className="text-xs">{b.campuses.join(", ") || "—"}</td>
                  <td>
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] ring-1 ${b.active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-700 ring-slate-200"}`}>
                      {b.active ? "Active" : "Scheduled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
