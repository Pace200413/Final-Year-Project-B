"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CampusEvent } from "@/lib/types";

const API = "/api/admin/events";
type FormState = Partial<CampusEvent> & { id?: string };

const CATEGORIES: CampusEvent["category"][] = [
  "Orientation",
  "Workshop",
  "Club",
  "Talk",
  "Sports",
  "Careers",
  "Student Life",
  "Other",
];

function emptyForm(): FormState {
  const now = new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: "",
    category: "Workshop",
    date: now.toISOString(),
    endDate: end.toISOString(),
    venue: { building: "" },
    description: "",
    images: { thumbnail: "", hero: "" },
    isPublished: true,
  };
}

export default function AdminEventsSimple() {
  const [items, setItems] = useState<CampusEvent[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FormState>(emptyForm());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"thumbnail" | "hero" | null>(null);

  async function load() {
    const r = await fetch(`${API}?published=0`, { cache: "no-store" });
    const j = await r.json();
    setItems((j.items ?? []) as CampusEvent[]);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((e) =>
      (
        e.title +
        " " +
        e.category +
        " " +
        (e.venue?.building ?? "") +
        " " +
        (e.organizer ?? "")
      )
        .toLowerCase()
        .includes(t)
    );
  }, [items, q]);

  function edit(ev?: CampusEvent) {
    setDraft(ev ? { ...ev } : emptyForm());
    setOpen(true);
  }

  async function save() {
    if (!draft.title?.trim()) return alert("Title is required");
    if (!draft.date) return alert("Start time is required");

    const payload: FormState = {
      ...draft,
      date: new Date(draft.date).toISOString(),
      endDate: draft.endDate
        ? new Date(draft.endDate).toISOString()
        : draft.date,
      venue: { building: draft.venue?.building ?? "" },
    };

    setBusyId(draft.id ?? "new");
    const res = await fetch(draft.id ? `${API}/${draft.id}` : API, {
      method: draft.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusyId(null);

    if (!res.ok) {
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }
      alert(data?.error ?? `Save failed (HTTP ${res.status})`);
      return;
    }

    setOpen(false);
    await load();
  }

  async function togglePublish(ev: CampusEvent) {
    setBusyId(ev.id);
    const r = await fetch(`${API}/${ev.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isPublished: !ev.isPublished }),
    });
    setBusyId(null);
    if (!r.ok) alert(`Failed (HTTP ${r.status})`);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    setBusyId(id);
    const r = await fetch(`${API}/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!r.ok) alert(`Failed (HTTP ${r.status})`);
    await load();
  }

  async function handleFileChange(
    e: ChangeEvent<HTMLInputElement>,
    kind: "thumbnail" | "hero"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(kind);
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/admin/upload-event-image", {
      method: "POST",
      body: form,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }

    setUploading(null);

    if (!res.ok || !data?.url) {
      alert(data?.error ?? "Upload failed");
      return;
    }

    const url = data.url as string;

    setDraft((prev) => ({
      ...prev,
      images: { ...(prev.images ?? {}), [kind]: url },
    }));
  }

  return (
    <main className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Events</h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={() => edit()}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
          >
            + New
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        className="w-full max-w-sm rounded-xl border border-slate-200 px-3 py-2 text-sm"
        placeholder="Search title, category, venue…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Venue</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev) => (
              <tr key={ev.id} className="border-t border-slate-200">
                <td className="px-3 py-2">
                  {ev.images?.thumbnail && (
                    <img
                      src={ev.images.thumbnail}
                      alt={ev.title}
                      className="h-10 w-16 rounded-md object-cover"
                    />
                  )}
                </td>
                <td className="px-3 py-2" suppressHydrationWarning>
                  {new Date(ev.date).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-medium">{ev.title}</td>
                <td className="px-3 py-2">{ev.category}</td>
                <td className="px-3 py-2">{ev.venue?.building}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                      ev.isPublished
                        ? "bg-green-50 text-green-700 ring-green-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}
                  >
                    {ev.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-1.5">
                  <button
                    onClick={() => togglePublish(ev)}
                    disabled={busyId === ev.id}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
                  >
                    {ev.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => edit(ev)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(ev.id)}
                    disabled={busyId === ev.id}
                    className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-slate-500"
                >
                  No events
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form */}
      {open && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {draft.id ? "Edit event" : "New event"}
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm hover:bg-slate-50"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-xs text-slate-600">Title</span>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={draft.title ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, title: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Category</span>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={(draft.category as string) ?? "Other"}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category: e.target.value as CampusEvent["category"],
                  })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Venue (building)</span>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={draft.venue?.building ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    venue: { building: e.target.value },
                  })
                }
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Start</span>
              <input
                type="datetime-local"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={(draft.date ?? "").slice(0, 16)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    date: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">End</span>
              <input
                type="datetime-local"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={(draft.endDate ?? "").slice(0, 16)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    endDate: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </label>

            <label className="grid gap-1 sm:col-span-2">
              <span className="text-xs text-slate-600">Description</span>
              <textarea
                className="min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>

            {/* Thumbnail picker */}
            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Thumbnail image</span>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "thumbnail")}
                />
                {uploading === "thumbnail" && (
                  <span className="text-slate-500">Uploading…</span>
                )}
              </div>
              {draft.images?.thumbnail && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={draft.images.thumbnail}
                    alt="Thumbnail preview"
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <span className="text-[11px] text-slate-500 break-all">
                    {draft.images.thumbnail}
                  </span>
                </div>
              )}
            </label>

            {/* Hero picker */}
            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Hero image</span>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "hero")}
                />
                {uploading === "hero" && (
                  <span className="text-slate-500">Uploading…</span>
                )}
              </div>
              {draft.images?.hero && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={draft.images.hero}
                    alt="Hero preview"
                    className="h-12 w-20 rounded-md object-cover"
                  />
                  <span className="text-[11px] text-slate-500 break-all">
                    {draft.images.hero}
                  </span>
                </div>
              )}
            </label>

            <label className="mt-1 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!draft.isPublished}
                onChange={(e) =>
                  setDraft({ ...draft, isPublished: e.target.checked })
                }
              />
              <span className="text-sm">Published</span>
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!!busyId}
              className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
            >
              {busyId ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
