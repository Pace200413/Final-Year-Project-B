"use client";

import { useMemo, useState } from "react";
import {StatusPill} from "@/components/AdminWidgets";
import {Toolbar} from "@/components/AdminWidgets";
import { EmptyState } from "@/components/AdminWidgets";
import type { Service, Status } from "@/lib/types";

function uid(){ return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}` }

export default function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([
    { id:"svc1", name:"Wi-Fi / Network", owner:"netops@campus.edu", status:"Degraded", dependencies:[], incidentsOpen:1 },
    { id:"svc2", name:"Canvas", owner:"lms@campus.edu", status:"Operational", dependencies:["Wi-Fi / Network"], incidentsOpen:0 },
  ]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");

  const data = useMemo(() => {
    let d = rows;
    if (filter !== "All") d = d.filter(r => r.status === filter);
    const query = q.trim().toLowerCase();
    return query ? d.filter(r => (r.name + " " + (r.owner ?? "")).toLowerCase().includes(query)) : d;
  }, [rows, q, filter]);

  function addQuick() {
    setRows(r => [{ id: uid(), name:"New service", status:"Operational", dependencies:[], incidentsOpen:0 }, ...r]);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Services</h1>
        <button className="btn btn-primary" onClick={addQuick}>Add service</button>
      </div>

      <Toolbar
        onSearch={setQ}
        placeholder="Search services…"
        extra={
          <>
            {(["All","Operational","Degraded","Outage","Maintenance"] as const).map(s => (
              <button key={s} onClick={()=>setFilter(s)}
                className={`rounded-xl border px-3 py-1 text-sm ${filter===s ? "border-slate-900 bg-slate-900 text-white":"border-slate-200 hover:bg-slate-50"}`}>
                {s}
              </button>
            ))}
          </>
        }
      />

      {data.length === 0 ? (
        <EmptyState title="No services found" hint="Try clearing filters or create your first service." action={<button className="btn btn-primary" onClick={addQuick}>Create service</button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Dependencies</th>
                <th>Open incidents</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td className="text-xs">{s.owner ?? "Unassigned"}</td>
                  <td><StatusPill s={s.status} /></td>
                  <td className="text-xs">{s.dependencies.length ? s.dependencies.join(", ") : "—"}</td>
                  <td className="text-xs">{s.incidentsOpen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
