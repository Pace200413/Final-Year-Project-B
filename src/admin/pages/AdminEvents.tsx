"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import type { CampusEvent, EventPricing, EventRegistration } from "@/lib/types";
import {
  DEFAULT_EVENTS_PAGE_CONTENT,
  type EventsPageContent,
} from "@/lib/events";

const CATEGORY_OPTIONS = [
  "Orientation",
  "Workshop",
  "Club",
  "Talk",
  "Sports",
  "Careers",
  "Student Life",
  "Other",
];

function Card({
  title,
  subtitle,
  children,
  className = "",
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-slate-700">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SmallButton({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        danger
          ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        published
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function isoToLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function formatEventDate(iso?: string) {
  if (!iso) return "No date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleString();
}

function formatVenue(event: CampusEvent) {
  return [event.venue?.building, event.venue?.level, event.venue?.room]
    .filter(Boolean)
    .join(", ");
}

function normalizeExternalUrl(url: string) {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function createEventId() {
  return `event-${Math.random().toString(36).slice(2, 8)}`;
}

function parseListText(value: string) {
  return value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToText(items?: string[]) {
  return Array.isArray(items) ? items.join(", ") : "";
}

function makeNewEvent(input: {
  title: string;
  category: string;
  startIso?: string;
}): CampusEvent {
  const now = input.startIso ? new Date(input.startIso) : new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  const nowIso = new Date().toISOString();

  return {
    id: createEventId(),
    title: input.title.trim() || "Untitled draft",
    category: input.category || "Other",
    date: now.toISOString(),
    endDate: end.toISOString(),
    venue: { building: "" },
    organizer: "",
    description: "",
    images: {},
    tags: [],
    accessibility: [],
    isPublished: false,
    registration: { type: "none" },
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export default function AdminEventsPage() {
  const [form, setForm] = useState<EventsPageContent>(DEFAULT_EVENTS_PAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedEventId, setSelectedEventId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Other");
  const [newEventStart, setNewEventStart] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load events content");
      }

      const nextContent = json.content ?? DEFAULT_EVENTS_PAGE_CONTENT;
      setForm(nextContent);
      setSelectedEventId((prev) => prev || nextContent.events?.[0]?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredEvents = useMemo(() => {
    return [...form.events]
      .filter((event) => {
        const q = search.trim().toLowerCase();
        const text = [
          event.title,
          String(event.category ?? ""),
          event.organizer ?? "",
          event.venue?.building ?? "",
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = !q || text.includes(q);
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "published"
            ? event.isPublished !== false
            : event.isPublished === false;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [form.events, search, statusFilter]);

  const selectedIndex = useMemo(
    () => form.events.findIndex((event) => event.id === selectedEventId),
    [form.events, selectedEventId]
  );

  const selectedEvent = selectedIndex >= 0 ? form.events[selectedIndex] : null;

  const updateEvent = (index: number, patch: Partial<CampusEvent>) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) =>
        i === index ? { ...event, ...patch } : event
      ),
    }));
  };

  const updateVenue = (
    index: number,
    key: "building" | "level" | "room",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) =>
        i === index
          ? {
              ...event,
              venue: {
                ...(event.venue ?? { building: "" }),
                [key]: value,
              },
            }
          : event
      ),
    }));
  };

  const updateImages = (
    index: number,
    patch: { hero?: string; thumbnail?: string }
  ) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) =>
        i === index
          ? {
              ...event,
              images: {
                ...(event.images ?? {}),
                ...patch,
              },
            }
          : event
      ),
    }));
  };

  const onPickImage = async (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/events/upload-image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to upload image");
      }

      updateImages(index, {
        hero: json.url,
        thumbnail: json.url,
      });

      setMessage("Image uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    updateImages(index, { hero: "", thumbnail: "" });
  };

  const updatePricingType = (
    index: number,
    type: "none" | "free" | "paid"
  ) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) => {
        if (i !== index) return event;

        if (type === "none") {
          const { pricing, ...rest } = event;
          return rest;
        }

        if (type === "free") {
          return {
            ...event,
            pricing: { type: "free" } as EventPricing,
          };
        }

        return {
          ...event,
          pricing: {
            type: "paid",
            currency:
              event.pricing && "currency" in event.pricing
                ? event.pricing.currency || "MYR"
                : "MYR",
            amount:
              event.pricing?.type === "paid"
                ? Number(event.pricing.amount || 0)
                : 0,
          } as EventPricing,
        };
      }),
    }));
  };

  const updatePricingField = (
    index: number,
    patch: Partial<Extract<EventPricing, { type: "paid" }>>
  ) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) => {
        if (i !== index || event.pricing?.type !== "paid") return event;

        return {
          ...event,
          pricing: {
            ...event.pricing,
            ...patch,
          } as EventPricing,
        };
      }),
    }));
  };

  const updateRegistrationType = (
    index: number,
    type: "none" | "link" | "form"
  ) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) => {
        if (i !== index) return event;

        if (type === "none") {
          return {
            ...event,
            registration: { type: "none" } as EventRegistration,
          };
        }

        if (type === "link") {
          return {
            ...event,
            registration: {
              type: "link",
              url:
                event.registration?.type === "link"
                  ? event.registration.url
                  : "",
              deadline:
                event.registration?.type === "link"
                  ? event.registration.deadline
                  : undefined,
            },
          };
        }

        return {
          ...event,
          registration: {
            type: "form",
            deadline:
              event.registration?.type === "form"
                ? event.registration.deadline
                : undefined,
          },
        };
      }),
    }));
  };

  const updateRegistrationField = (
    index: number,
    patch: Partial<Extract<EventRegistration, { type: "link" | "form" }>>
  ) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, i) => {
        if (i !== index || !event.registration) return event;

        return {
          ...event,
          registration: {
            ...event.registration,
            ...patch,
          } as EventRegistration,
        };
      }),
    }));
  };

  const addEvent = () => {
    const next = makeNewEvent({
      title: newEventTitle,
      category: newEventCategory,
      startIso: localInputToIso(newEventStart) || undefined,
    });

    setForm((prev) => ({
      ...prev,
      events: [next, ...prev.events],
    }));

    setSelectedEventId(next.id);
    setNewEventTitle("");
    setNewEventCategory("Other");
    setNewEventStart("");
    setMessage("Draft created.");
  };

  const removeEvent = (id: string) => {
    setForm((prev) => {
      const nextEvents = prev.events.filter((event) => event.id !== id);
      if (selectedEventId === id) {
        setSelectedEventId(nextEvents[0]?.id || "");
      }
      return {
        ...prev,
        events: nextEvents,
      };
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save events content");
      }

      setForm(json.content ?? form);
      setMessage(
        json.changedFields?.length
          ? `Saved. Changed: ${json.changedFields.join(", ")}`
          : "Saved successfully."
      );

      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("events-content");
          bc.postMessage({ type: "updated" });
          bc.close();
        }
        localStorage.setItem("events:updated", String(Date.now()));
      } catch {}
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading events content…</div>;
  }

  const pricingType = selectedEvent?.pricing?.type ?? "none";
  const registrationType = selectedEvent?.registration?.type ?? "none";
  const registrationUrl =
    selectedEvent?.registration?.type === "link"
      ? selectedEvent.registration.url ?? ""
      : "";
  const registrationDeadline =
    selectedEvent?.registration?.type === "link" ||
    selectedEvent?.registration?.type === "form"
      ? selectedEvent.registration.deadline
      : undefined;

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Editor
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Events
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Create drafts, update details, then publish when ready.
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card title="Add event" subtitle="New events start as draft.">
            <div className="grid gap-4">
              <Field
                label="Event title"
                value={newEventTitle}
                onChange={setNewEventTitle}
                placeholder="Example: Career Fair 2026"
              />

              <SelectField
                label="Category"
                value={newEventCategory}
                onChange={setNewEventCategory}
                options={CATEGORY_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />

              <Field
                label="Start date & time"
                type="datetime-local"
                value={newEventStart}
                onChange={setNewEventStart}
              />

              <button
                type="button"
                onClick={addEvent}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create draft
              </button>
            </div>
          </Card>

          <Card title="Events list">
            <div className="grid gap-4">
              <Field
                label="Search"
                value={search}
                onChange={setSearch}
                placeholder="Search title, organizer, building..."
              />

              <SelectField
                label="Status"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as "all" | "published" | "draft")}
                options={[
                  { value: "all", label: "All" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />
            </div>

            <div className="mt-4 max-h-[760px] space-y-3 overflow-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  No matching events.
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const selected = event.id === selectedEventId;
                  const image = event.images?.thumbnail || event.images?.hero || "";

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEventId(event.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {image ? (
                          <img
                            src={image}
                            alt={event.title || "Event"}
                            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl ${
                              selected ? "bg-white/10" : "bg-slate-100"
                            }`}
                          >
                            📅
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-sm font-semibold ${selected ? "text-white" : "text-slate-900"}`}>
                            {event.title || "Untitled event"}
                          </div>

                          <div className="mt-1 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                selected
                                  ? "bg-white/10 text-slate-100"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {event.category || "Other"}
                            </span>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                event.isPublished !== false
                                  ? selected
                                    ? "bg-emerald-400/20 text-emerald-100"
                                    : "bg-emerald-50 text-emerald-700"
                                  : selected
                                  ? "bg-amber-400/20 text-amber-100"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {event.isPublished !== false ? "Published" : "Draft"}
                            </span>
                          </div>

                          <div className={`mt-2 text-xs ${selected ? "text-slate-300" : "text-slate-500"}`}>
                            {formatEventDate(event.date)}
                          </div>
                          <div className={`mt-1 truncate text-xs ${selected ? "text-slate-300" : "text-slate-500"}`}>
                            {formatVenue(event) || "No location"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </aside>

        <div className="space-y-6">
          {!selectedEvent || selectedIndex < 0 ? (
            <Card title="Event details">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-600">
                Select an event from the left to edit it.
              </div>
            </Card>
          ) : (
            <>
              <Card
                title={selectedEvent.title || "Untitled event"}
                subtitle={`ID: ${selectedEvent.id}`}
                actions={<StatusBadge published={selectedEvent.isPublished !== false} />}
              >
                <div className="flex flex-wrap gap-3">
                  <SmallButton
                    onClick={() =>
                      updateEvent(selectedIndex, {
                        isPublished: selectedEvent.isPublished === false,
                      })
                    }
                  >
                    {selectedEvent.isPublished !== false ? "Move to draft" : "Publish"}
                  </SmallButton>

                  <SmallButton danger onClick={() => removeEvent(selectedEvent.id)}>
                    Remove event
                  </SmallButton>
                </div>
              </Card>

              <Card title="Basic details">
                <div className="grid gap-4 2xl:grid-cols-2">
                  <Field
                    label="Event ID"
                    value={selectedEvent.id}
                    onChange={(v) => updateEvent(selectedIndex, { id: v })}
                  />
                  <Field
                    label="Title"
                    value={selectedEvent.title}
                    onChange={(v) => updateEvent(selectedIndex, { title: v })}
                  />
                  <SelectField
                    label="Category"
                    value={String(selectedEvent.category ?? "Other")}
                    onChange={(v) => updateEvent(selectedIndex, { category: v })}
                    options={CATEGORY_OPTIONS.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                  />
                  <Field
                    label="Organizer"
                    value={selectedEvent.organizer ?? ""}
                    onChange={(v) => updateEvent(selectedIndex, { organizer: v })}
                  />
                </div>

                <div className="mt-4">
                  <Area
                    label="Description"
                    value={selectedEvent.description ?? ""}
                    onChange={(v) => updateEvent(selectedIndex, { description: v })}
                    rows={5}
                  />
                </div>

                <div className="mt-4">
                  <Area
                    label="Tags"
                    value={listToText(selectedEvent.tags)}
                    onChange={(v) => updateEvent(selectedIndex, { tags: parseListText(v) })}
                    rows={2}
                    hint="Separate with commas or new lines"
                    placeholder="career, networking, students"
                  />
                </div>
              </Card>

              <Card title="Schedule & location">
                <div className="grid gap-4 2xl:grid-cols-2">
                  <Field
                    label="Start date & time"
                    type="datetime-local"
                    value={isoToLocalInput(selectedEvent.date)}
                    onChange={(v) =>
                      updateEvent(selectedIndex, {
                        date: localInputToIso(v) || selectedEvent.date,
                      })
                    }
                  />
                  <Field
                    label="End date & time"
                    type="datetime-local"
                    value={isoToLocalInput(selectedEvent.endDate)}
                    onChange={(v) =>
                      updateEvent(selectedIndex, {
                        endDate: localInputToIso(v) || undefined,
                      })
                    }
                  />
                </div>

                <div className="mt-4 grid gap-4 2xl:grid-cols-3">
                  <Field
                    label="Building"
                    value={selectedEvent.venue?.building ?? ""}
                    onChange={(v) => updateVenue(selectedIndex, "building", v)}
                  />
                  <Field
                    label="Level"
                    value={selectedEvent.venue?.level ?? ""}
                    onChange={(v) => updateVenue(selectedIndex, "level", v)}
                  />
                  <Field
                    label="Room"
                    value={selectedEvent.venue?.room ?? ""}
                    onChange={(v) => updateVenue(selectedIndex, "room", v)}
                  />
                </div>
              </Card>

              <Card title="Image">
                <div className="grid gap-5 2xl:grid-cols-[300px_minmax(0,1fr)] 2xl:items-start">
                  <div>
                    {selectedEvent.images?.hero || selectedEvent.images?.thumbnail ? (
                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                        <img
                          src={selectedEvent.images?.hero || selectedEvent.images?.thumbnail}
                          alt={selectedEvent.title || "Event image"}
                          className="h-60 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-60 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                        No image yet
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      {uploadingImage ? "Uploading..." : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onPickImage(selectedIndex, e)}
                        disabled={uploadingImage}
                      />
                    </label>

                    <p className="text-sm text-slate-600">
                      One image is enough for both list and details.
                    </p>

                    {(selectedEvent.images?.hero || selectedEvent.images?.thumbnail) ? (
                      <SmallButton onClick={() => removeImage(selectedIndex)}>
                        Remove image
                      </SmallButton>
                    ) : null}
                  </div>
                </div>
              </Card>

              <Card title="Attendance & registration">
                <div className="grid gap-6 2xl:grid-cols-2">
                  <div className="space-y-4">
                    <Field
                      label="Capacity"
                      type="number"
                      value={selectedEvent.capacity !== undefined ? String(selectedEvent.capacity) : ""}
                      onChange={(v) =>
                        updateEvent(selectedIndex, {
                          capacity: v.trim() ? Number(v) : undefined,
                        })
                      }
                    />

                    <SelectField
                      label="Pricing type"
                      value={pricingType}
                      onChange={(v) =>
                        updatePricingType(selectedIndex, v as "none" | "free" | "paid")
                      }
                      options={[
                        { value: "none", label: "None" },
                        { value: "free", label: "Free" },
                        { value: "paid", label: "Paid" },
                      ]}
                    />

                    {selectedEvent.pricing?.type === "paid" ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Currency"
                          value={selectedEvent.pricing.currency ?? "MYR"}
                          onChange={(v) =>
                            updatePricingField(selectedIndex, { currency: v })
                          }
                        />
                        <Field
                          label="Amount"
                          type="number"
                          value={String(selectedEvent.pricing.amount ?? 0)}
                          onChange={(v) =>
                            updatePricingField(selectedIndex, {
                              amount: Number(v || 0),
                            })
                          }
                        />
                      </div>
                    ) : null}

                    <Area
                      label="Accessibility notes"
                      value={listToText(selectedEvent.accessibility)}
                      onChange={(v) =>
                        updateEvent(selectedIndex, {
                          accessibility: parseListText(v),
                        })
                      }
                      rows={3}
                      hint="Separate with commas or new lines"
                      placeholder="Wheelchair accessible, Lift nearby"
                    />
                  </div>

                  <div className="space-y-4">
                    <SelectField
                      label="Registration type"
                      value={registrationType}
                      onChange={(v) =>
                        updateRegistrationType(
                          selectedIndex,
                          v as "none" | "link" | "form"
                        )
                      }
                      options={[
                        { value: "none", label: "None" },
                        { value: "link", label: "External link" },
                        { value: "form", label: "Internal / form" },
                      ]}
                    />

                    {registrationType === "link" ? (
                      <>
                        <Field
                          label="Registration URL"
                          value={registrationUrl}
                          onChange={(v) =>
                            updateRegistrationField(selectedIndex, { url: v })
                          }
                          placeholder="https://..."
                        />

                        {registrationUrl ? (
                          <a
                            href={normalizeExternalUrl(registrationUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Open registration link
                          </a>
                        ) : null}
                      </>
                    ) : null}

                    {(registrationType === "link" || registrationType === "form") ? (
                      <Field
                        label="Registration deadline"
                        type="datetime-local"
                        value={isoToLocalInput(registrationDeadline)}
                        onChange={(v) =>
                          updateRegistrationField(selectedIndex, {
                            deadline: localInputToIso(v) || undefined,
                          })
                        }
                      />
                    ) : null}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}