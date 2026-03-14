"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { CampusEvent, EventPricing, EventRegistration } from "@/lib/types";
import {
  DEFAULT_EVENTS_PAGE_CONTENT,
  type EventsPageContent,
} from "@/lib/events";

type AuditItem = {
  id: number;
  changedAt: string;
  changedFields: string[];
  changedByAuthUserId?: string | null;
  changedByEmail?: string | null;
};

type EditorTab = "basic" | "schedule" | "image" | "registration";

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
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
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
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
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
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
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
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
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

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
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

function makeNewEvent(category = "Other"): CampusEvent {
  const now = new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    id: `event-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    category,
    date: now.toISOString(),
    endDate: end.toISOString(),
    venue: { building: "" },
    organizer: "",
    description: "",
    images: {},
    tags: [],
    isPublished: true,
    registration: { type: "none" },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function normalizeExternalUrl(url: string) {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export default function AdminEventsPage() {
  const [form, setForm] = useState<EventsPageContent>(DEFAULT_EVENTS_PAGE_CONTENT);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [newEventCategory, setNewEventCategory] = useState<string>("Other");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all"
  );
  const [activeTab, setActiveTab] = useState<EditorTab>("basic");
  const [tagDraft, setTagDraft] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Failed to load events content");

      const nextContent = json.content ?? DEFAULT_EVENTS_PAGE_CONTENT;
      setForm(nextContent);
      setAudit(json.audit ?? []);
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

  useEffect(() => {
    setTagDraft("");
  }, [selectedEventId]);

  const publishedCount = useMemo(
    () => form.events.filter((event) => event.isPublished !== false).length,
    [form.events]
  );

  const draftCount = useMemo(
    () => form.events.filter((event) => event.isPublished === false).length,
    [form.events]
  );

  const filteredEvents = useMemo(() => {
    return form.events.filter((event) => {
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
    });
  }, [form.events, search, statusFilter]);

  const selectedIndex = useMemo(
    () => form.events.findIndex((event) => event.id === selectedEventId),
    [form.events, selectedEventId]
  );

  const selectedEvent = selectedIndex >= 0 ? form.events[selectedIndex] : null;

  const registration = selectedEvent?.registration;

  const registrationType: "none" | "link" | "form" =
    registration?.type ?? "none";

  const registrationUrl =
    registration?.type === "link" ? registration.url ?? "" : "";

  const registrationDeadline =
    registration?.type === "link" || registration?.type === "form"
      ? registration.deadline
      : undefined;

  const updateField = <K extends keyof EventsPageContent>(
    key: K,
    value: EventsPageContent[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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
                ...event.venue,
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
              event.pricing?.type === "paid" ? Number(event.pricing.amount || 0) : 0,
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
    const next = makeNewEvent(newEventCategory);

    setForm((prev) => ({
      ...prev,
      events: [next, ...prev.events],
    }));

    setSelectedEventId(next.id);
    setActiveTab("basic");
    setMessage("");
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

  const addTag = () => {
    if (!selectedEvent || selectedIndex < 0) return;
    const nextTag = tagDraft.trim();
    if (!nextTag) return;

    const current = selectedEvent.tags ?? [];
    if (current.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
      setTagDraft("");
      return;
    }

    updateEvent(selectedIndex, { tags: [...current, nextTag] });
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    if (!selectedEvent || selectedIndex < 0) return;
    updateEvent(selectedIndex, {
      tags: (selectedEvent.tags ?? []).filter((item) => item !== tag),
    });
  };

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
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
      setAudit(json.audit ?? []);
      setMessage(
        json.changedFields?.length
          ? `Saved. Changed: ${json.changedFields.join(", ")}`
          : "Saved. No changes detected."
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

  return (
    <div className="mx-auto max-w-[1520px] space-y-6 p-6">
      <div className="sticky top-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Events Page Editor</h1>
            <p className="mt-1 text-sm text-slate-600">
              Cleaner desktop editor for managing events, images, and registration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedEvent ? (
              <Link
                href={`/events/${selectedEvent.id}`}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Preview public page
              </Link>
            ) : null}

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Page content">
            <div className="grid gap-4">
              <Field
                label="Eyebrow"
                value={form.eyebrow}
                onChange={(v) => updateField("eyebrow", v)}
              />
              <Field
                label="Hero title"
                value={form.heroTitle}
                onChange={(v) => updateField("heroTitle", v)}
              />
              <Field
                label="Section title"
                value={form.sectionTitle}
                onChange={(v) => updateField("sectionTitle", v)}
              />
              <Field
                label="Section subtitle"
                value={form.sectionSubtitle}
                onChange={(v) => updateField("sectionSubtitle", v)}
              />
              <Field
                label="Empty heading"
                value={form.emptyHeading}
                onChange={(v) => updateField("emptyHeading", v)}
              />
              <Area
                label="Hero description"
                value={form.heroDescription}
                onChange={(v) => updateField("heroDescription", v)}
                rows={3}
              />
              <Area
                label="Empty description"
                value={form.emptyDescription}
                onChange={(v) => updateField("emptyDescription", v)}
                rows={3}
              />
            </div>
          </Card>

          <Card title="Overview">
            <div className="grid grid-cols-3 gap-3">
              <StatPill label="Total" value={form.events.length} />
              <StatPill label="Published" value={publishedCount} />
              <StatPill label="Drafts" value={draftCount} />
            </div>
          </Card>

          <Card title="Add event">
            <div className="grid gap-4">
              <SelectField
                label="Category"
                value={newEventCategory}
                onChange={setNewEventCategory}
                options={CATEGORY_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
              <button
                type="button"
                onClick={addEvent}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add new event
              </button>
            </div>
          </Card>

          <Card title="Events list" subtitle={`${filteredEvents.length} shown`}>
            <div className="grid gap-3">
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

              <div className="max-h-[720px] space-y-3 overflow-auto pr-1">
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
                            ? "border-red-300 bg-red-50 shadow-sm"
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
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                              📅
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {event.title || "Untitled event"}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                {event.category || "Other"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  event.isPublished !== false
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {event.isPublished !== false ? "Published" : "Draft"}
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-slate-500">
                              {formatEventDate(event.date)}
                            </div>
                            <div className="mt-1 truncate text-xs text-slate-500">
                              {event.venue?.building || "No location"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {!selectedEvent || selectedIndex < 0 ? (
            <Card title="Event editor">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-600">
                Select an event from the left to edit it.
              </div>
            </Card>
          ) : (
            <>
              <Card
                title={selectedEvent.title || "Untitled event"}
                subtitle={`ID: ${selectedEvent.id}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {selectedEvent.category || "Other"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      selectedEvent.isPublished !== false
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedEvent.isPublished !== false ? "Published" : "Draft"}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeEvent(selectedEvent.id)}
                    className="ml-auto rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove event
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <TabButton
                    active={activeTab === "basic"}
                    label="Basic"
                    onClick={() => setActiveTab("basic")}
                  />
                  <TabButton
                    active={activeTab === "schedule"}
                    label="Schedule"
                    onClick={() => setActiveTab("schedule")}
                  />
                  <TabButton
                    active={activeTab === "image"}
                    label="Image"
                    onClick={() => setActiveTab("image")}
                  />
                  <TabButton
                    active={activeTab === "registration"}
                    label="Registration"
                    onClick={() => setActiveTab("registration")}
                  />
                </div>
              </Card>

              {activeTab === "basic" ? (
                <Card title="Basic details">
                  <div className="grid gap-4 xl:grid-cols-2">
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
                    <SelectField
                      label="Visibility"
                      value={selectedEvent.isPublished !== false ? "published" : "draft"}
                      onChange={(v) =>
                        updateEvent(selectedIndex, { isPublished: v === "published" })
                      }
                      options={[
                        { value: "published", label: "Published" },
                        { value: "draft", label: "Draft / hidden" },
                      ]}
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

                  <div className="mt-6">
                    <div className="mb-2 text-sm font-medium text-slate-700">Tags</div>

                    <div className="flex flex-wrap gap-2">
                      {(selectedEvent.tags ?? []).length === 0 ? (
                        <span className="text-sm text-slate-500">No tags yet.</span>
                      ) : (
                        (selectedEvent.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-slate-500 hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="mt-3 flex gap-3">
                      <input
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        onKeyDown={onTagKeyDown}
                        placeholder="Add a tag"
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-400"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Add tag
                      </button>
                    </div>
                  </div>
                </Card>
              ) : null}

              {activeTab === "schedule" ? (
                <Card title="Schedule & location">
                  <div className="grid gap-4 xl:grid-cols-2">
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

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
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
              ) : null}

              {activeTab === "image" ? (
                <Card title="Image">
                  <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
                    <div>
                      {selectedEvent.images?.hero || selectedEvent.images?.thumbnail ? (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          <img
                            src={selectedEvent.images?.hero || selectedEvent.images?.thumbnail}
                            alt={selectedEvent.title || "Event image"}
                            className="h-56 w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
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
                        Stored in Supabase Storage and used for both list and detail view.
                      </p>

                      {(selectedEvent.images?.hero || selectedEvent.images?.thumbnail) ? (
                        <button
                          type="button"
                          onClick={() => removeImage(selectedIndex)}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ) : null}

              {activeTab === "registration" ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card title="Pricing">
                    <div className="grid gap-4">
                      <SelectField
                        label="Pricing type"
                        value={selectedEvent.pricing?.type ?? "none"}
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
                        <>
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
                        </>
                      ) : null}
                    </div>
                  </Card>

                  <Card title="Registration">
                    <div className="grid gap-4">
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
                          { value: "form", label: "Form / internal" },
                        ]}
                      />

                      {registrationType === "link" ? (
                        <>
                          <Field
                            label="Registration URL"
                            value={registrationUrl}
                            onChange={(v) =>
                              updateRegistrationField(selectedIndex, {
                                url: v,
                              })
                            }
                            placeholder="https://..."
                          />

                          {registrationUrl ? (
                            <a
                              href={normalizeExternalUrl(registrationUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                              Open registration link
                            </a>
                          ) : null}
                        </>
                      ) : null}

                      {(registrationType === "link" || registrationType === "form") ? (
                        <Field
                          label="Deadline"
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
                  </Card>
                </div>
              ) : null}
            </>
          )}

          <Card
            title="Audit history"
            subtitle="Shows when the Events page changed and which top-level fields changed."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Who</th>
                    <th className="px-3 py-2 font-medium">Changed fields</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-slate-500">
                        No changes logged yet.
                      </td>
                    </tr>
                  ) : (
                    audit.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 align-top">
                        <td className="px-3 py-3 text-slate-700">
                          {new Date(item.changedAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {item.changedByEmail || item.changedByAuthUserId || "Unknown"}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {item.changedFields.length > 0
                            ? item.changedFields.join(", ")
                            : "No field list"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 