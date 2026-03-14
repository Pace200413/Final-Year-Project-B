"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_EMERGENCY_CONTENT,
  type EmergencyContent,
  type EmergencyHowToStep,
  type EmergencyMoreHelpCard,
  type EmergencyQuickTile,
} from "@/lib/emergency";

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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-red-400"
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
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-red-400"
      />
    </label>
  );
}

export default function AdminEmergencyPage() {
  const [form, setForm] = useState<EmergencyContent>(DEFAULT_EMERGENCY_CONTENT);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/emergency", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load emergency content");
      }

      setForm(json.content ?? DEFAULT_EMERGENCY_CONTENT);
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

  const updateField = <K extends keyof EmergencyContent>(
    key: K,
    value: EmergencyContent[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuickTile = (
    index: number,
    key: keyof EmergencyQuickTile,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      quickTiles: prev.quickTiles.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addQuickTile = () => {
    setForm((prev) => ({
      ...prev,
      quickTiles: [
        ...prev.quickTiles,
        {
          icon: "comments",
          title: "",
          subtitle: "",
          href: "/support",
        },
      ],
    }));
  };

  const removeQuickTile = (index: number) => {
    setForm((prev) => ({
      ...prev,
      quickTiles: prev.quickTiles.filter((_, i) => i !== index),
    }));
  };

  const updateMoreHelpCard = (
    index: number,
    key: keyof EmergencyMoreHelpCard,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      moreHelpCards: prev.moreHelpCards.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addMoreHelpCard = () => {
    setForm((prev) => ({
      ...prev,
      moreHelpCards: [
        ...prev.moreHelpCards,
        {
          icon: "shield",
          title: "",
          description: "",
          href: "/security-contact",
        },
      ],
    }));
  };

  const removeMoreHelpCard = (index: number) => {
    setForm((prev) => ({
      ...prev,
      moreHelpCards: prev.moreHelpCards.filter((_, i) => i !== index),
    }));
  };

  const updateHowToStep = (
    index: number,
    key: keyof EmergencyHowToStep,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      howToSteps: prev.howToSteps.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addHowToStep = () => {
    setForm((prev) => ({
      ...prev,
      howToSteps: [...prev.howToSteps, { title: "", text: "" }],
    }));
  };

  const removeHowToStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      howToSteps: prev.howToSteps.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/emergency", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save emergency content");
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
          const bc = new BroadcastChannel("emergency-content");
          bc.postMessage({ type: "updated" });
          bc.close();
        }
        localStorage.setItem("emergency:updated", String(Date.now()));
      } catch {}
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading emergency content…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Emergency Page Editor</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit everything shown on the user emergency page.
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

      <Card title="Hero">
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        <div className="mt-4">
          <Area
            label="Hero description"
            value={form.heroDescription}
            onChange={(v) => updateField("heroDescription", v)}
          />
        </div>
      </Card>

      <Card title="Top strip labels">
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
      </Card>

      <Card title="Primary action cards">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Emergency card title"
            value={form.emergencyLabel}
            onChange={(v) => updateField("emergencyLabel", v)}
          />
          <Field
            label="Emergency telephone"
            value={form.emergencyTel}
            onChange={(v) => updateField("emergencyTel", v)}
          />
          <Field
            label="Emergency card subtitle"
            value={form.emergencySubtitle}
            onChange={(v) => updateField("emergencySubtitle", v)}
          />
          <div />
          <Field
            label="Exit card title"
            value={form.exitNavLabel}
            onChange={(v) => updateField("exitNavLabel", v)}
          />
          <Field
            label="Exit URL"
            value={form.exitNavUrl}
            onChange={(v) => updateField("exitNavUrl", v)}
          />
          <Field
            label="Exit card subtitle"
            value={form.exitNavSubtitle}
            onChange={(v) => updateField("exitNavSubtitle", v)}
          />
        </div>
      </Card>

      <Card title="Secondary link + alert">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Secondary link label"
            value={form.secondaryLinkLabel}
            onChange={(v) => updateField("secondaryLinkLabel", v)}
          />
          <Field
            label="Secondary link href"
            value={form.secondaryLinkHref}
            onChange={(v) => updateField("secondaryLinkHref", v)}
          />
        </div>

        <div className="mt-4">
          <Area
            label="Alert text"
            value={form.alertText}
            onChange={(v) => updateField("alertText", v)}
          />
        </div>
      </Card>

      <Card title="Quick tiles section">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Section title"
            value={form.quickSectionTitle}
            onChange={(v) => updateField("quickSectionTitle", v)}
          />
          <Field
            label="Section subtitle"
            value={form.quickSectionSubtitle}
            onChange={(v) => updateField("quickSectionSubtitle", v)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.quickTiles.map((tile, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Quick tile {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeQuickTile(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Title"
                  value={tile.title}
                  onChange={(v) => updateQuickTile(index, "title", v)}
                />
                <Field
                  label="Href"
                  value={tile.href}
                  onChange={(v) => updateQuickTile(index, "href", v)}
                />
              </div>

              <div className="mt-4">
                <Area
                  label="Subtitle"
                  value={tile.subtitle}
                  onChange={(v) => updateQuickTile(index, "subtitle", v)}
                  rows={3}
                />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Icon is kept from existing data and is not editable here.
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuickTile}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add quick tile
        </button>
      </Card>

      <Card title="More help section">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Section title"
            value={form.moreHelpTitle}
            onChange={(v) => updateField("moreHelpTitle", v)}
          />
          <Field
            label="Section subtitle"
            value={form.moreHelpSubtitle}
            onChange={(v) => updateField("moreHelpSubtitle", v)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.moreHelpCards.map((card, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  More help card {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeMoreHelpCard(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Title"
                  value={card.title}
                  onChange={(v) => updateMoreHelpCard(index, "title", v)}
                />
                <Field
                  label="Href"
                  value={card.href}
                  onChange={(v) => updateMoreHelpCard(index, "href", v)}
                />
              </div>

              <div className="mt-4">
                <Area
                  label="Description"
                  value={card.description}
                  onChange={(v) => updateMoreHelpCard(index, "description", v)}
                  rows={3}
                />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Icon is kept from existing data and is not editable here.
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addMoreHelpCard}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add more help card
        </button>
      </Card>

      <Card title="How to use section">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Section title"
            value={form.howToTitle}
            onChange={(v) => updateField("howToTitle", v)}
          />
          <Field
            label="Section subtitle"
            value={form.howToSubtitle}
            onChange={(v) => updateField("howToSubtitle", v)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.howToSteps.map((step, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Step {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeHowToStep(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Title"
                  value={step.title}
                  onChange={(v) => updateHowToStep(index, "title", v)}
                />
              </div>

              <div className="mt-4">
                <Area
                  label="Text"
                  value={step.text}
                  onChange={(v) => updateHowToStep(index, "text", v)}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addHowToStep}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add step
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