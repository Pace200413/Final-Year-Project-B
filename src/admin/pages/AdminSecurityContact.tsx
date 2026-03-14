"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SECURITY_CONTACT_CONTENT,
  type SecurityContactBottomCard,
  type SecurityContactContent,
  type SecurityContactItem,
  type SecurityContactStep,
} from "@/lib/security-contact";

type AuditItem = {
  id: number;
  changedAt: string;
  changedFields: string[];
  changedByAuthUserId?: string | null;
  changedByEmail?: string | null;
};

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400"
      />
    </label>
  );
}

export default function AdminSecurityContactPage() {
  const [form, setForm] = useState<SecurityContactContent>(DEFAULT_SECURITY_CONTACT_CONTENT);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/security-contact", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load security contact content");
      }

      setForm(json.content ?? DEFAULT_SECURITY_CONTACT_CONTENT);
      setAudit(json.audit ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = <K extends keyof SecurityContactContent>(
    key: K,
    value: SecurityContactContent[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateStep = (
    index: number,
    key: keyof SecurityContactStep,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { number: "", title: "", text: "" }],
    }));
  };

  const removeStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateContact = (
    index: number,
    key: keyof SecurityContactItem,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const setPrimaryContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.map((item, i) => ({
        ...item,
        isPrimary: i === index,
      })),
    }));
  };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", phone: "", isPrimary: false }],
    }));
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const updateBottomCard = (
    index: number,
    key: keyof SecurityContactBottomCard,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      bottomCards: prev.bottomCards.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addBottomCard = () => {
    setForm((prev) => ({
      ...prev,
      bottomCards: [...prev.bottomCards, { title: "", description: "", href: "" }],
    }));
  };

  const removeBottomCard = (index: number) => {
    setForm((prev) => ({
      ...prev,
      bottomCards: prev.bottomCards.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/security-contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save security contact content");
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
          const bc = new BroadcastChannel("security-contact-content");
          bc.postMessage({ type: "updated" });
          bc.close();
        }
        localStorage.setItem("security-contact:updated", String(Date.now()));
      } catch {}
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading security contact content…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Security Contact Page Editor</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit everything shown on the user security contact page.
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <Card title="Header">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={form.eyebrow} onChange={(v) => updateField("eyebrow", v)} />
          <Field label="Title" value={form.title} onChange={(v) => updateField("title", v)} />
          <Field
            label="Back button label"
            value={form.backToHubLabel}
            onChange={(v) => updateField("backToHubLabel", v)}
          />
          <Field
            label="Back button href"
            value={form.backToHubHref}
            onChange={(v) => updateField("backToHubHref", v)}
          />
        </div>

        <div className="mt-4">
          <Area label="Subtitle" value={form.subtitle} onChange={(v) => updateField("subtitle", v)} />
        </div>

        <div className="mt-4">
          <Area label="Alert text" value={form.alertText} onChange={(v) => updateField("alertText", v)} />
        </div>
      </Card>

      <Card title="Top strip">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Call security label"
            value={form.stripCallSecurityLabel}
            onChange={(v) => updateField("stripCallSecurityLabel", v)}
          />
          <Field
            label="Call 999 label"
            value={form.stripCall999Label}
            onChange={(v) => updateField("stripCall999Label", v)}
          />
          <Field
            label="Find exit label"
            value={form.stripFindExitLabel}
            onChange={(v) => updateField("stripFindExitLabel", v)}
          />
        </div>

        <div className="mt-4">
          <Field
            label="Exit navigation URL"
            value={form.exitNavUrl}
            onChange={(v) => updateField("exitNavUrl", v)}
          />
        </div>
      </Card>

      <Card title="Emergency steps">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Steps title"
            value={form.stepsTitle}
            onChange={(v) => updateField("stepsTitle", v)}
          />
          <Field
            label="Steps subtitle"
            value={form.stepsSubtitle}
            onChange={(v) => updateField("stepsSubtitle", v)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.steps.map((step, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Step {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Number"
                  value={step.number}
                  onChange={(v) => updateStep(index, "number", v)}
                />
                <Field
                  label="Title"
                  value={step.title}
                  onChange={(v) => updateStep(index, "title", v)}
                />
              </div>

              <div className="mt-4">
                <Area
                  label="Text"
                  value={step.text}
                  onChange={(v) => updateStep(index, "text", v)}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add step
        </button>
      </Card>

      <Card title="Exit guide">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" value={form.exitTitle} onChange={(v) => updateField("exitTitle", v)} />
          <Field
            label="Subtitle"
            value={form.exitSubtitle}
            onChange={(v) => updateField("exitSubtitle", v)}
          />
          <Field
            label="Location text"
            value={form.exitLocationText}
            onChange={(v) => updateField("exitLocationText", v)}
          />
          <Field
            label="Nearest exit text"
            value={form.exitNearestText}
            onChange={(v) => updateField("exitNearestText", v)}
          />
          <Field
            label="Button text"
            value={form.exitLinkText}
            onChange={(v) => updateField("exitLinkText", v)}
          />
          <Field
            label="Button href"
            value={form.exitLinkHref}
            onChange={(v) => updateField("exitLinkHref", v)}
          />
        </div>
      </Card>

      <Card title="Contacts">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Contacts title"
            value={form.contactsTitle}
            onChange={(v) => updateField("contactsTitle", v)}
          />
          <Field
            label="Contacts subtitle"
            value={form.contactsSubtitle}
            onChange={(v) => updateField("contactsSubtitle", v)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.contacts.map((contact, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Contact {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Name"
                  value={contact.name}
                  onChange={(v) => updateContact(index, "name", v)}
                />
                <Field
                  label="Phone"
                  value={contact.phone}
                  onChange={(v) => updateContact(index, "phone", v)}
                />
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={!!contact.isPrimary}
                  onChange={() => setPrimaryContact(index)}
                />
                Set as primary security contact
              </label>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addContact}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add contact
        </button>
      </Card>

      <Card title="Bottom cards">
        <div className="mt-5 space-y-4">
          {form.bottomCards.map((card, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Card {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeBottomCard(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Title"
                  value={card.title}
                  onChange={(v) => updateBottomCard(index, "title", v)}
                />
                <Field
                  label="Href"
                  value={card.href}
                  onChange={(v) => updateBottomCard(index, "href", v)}
                />
              </div>

              <div className="mt-4">
                <Area
                  label="Description"
                  value={card.description}
                  onChange={(v) => updateBottomCard(index, "description", v)}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addBottomCard}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add bottom card
        </button>
      </Card>

      <Card
        title="Audit history"
        subtitle="Shows when the page changed and which fields were changed."
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
  );
}