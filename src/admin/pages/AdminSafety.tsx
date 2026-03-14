"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SAFETY_CONTENT,
  type SafetyContent,
  type SafetyContentSection,
} from "@/lib/safety";

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

export default function AdminSafetyPage() {
  const [form, setForm] = useState<SafetyContent>(DEFAULT_SAFETY_CONTENT);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/safety", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Failed to load safety content");

      setForm(json.content ?? DEFAULT_SAFETY_CONTENT);
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

  const updateField = <K extends keyof SafetyContent>(
    key: K,
    value: SafetyContent[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSection = (
    index: number,
    key: keyof SafetyContentSection,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `section-${Math.random().toString(36).slice(2, 8)}`,
          group: "General",
          title: "",
          text: "",
          link: "",
          linkLabel: "",
        },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/safety", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save safety content");
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
          const bc = new BroadcastChannel("safety-content");
          bc.postMessage({ type: "updated" });
          bc.close();
        }
        localStorage.setItem("safety:updated", String(Date.now()));
      } catch {}
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading safety content…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Safety Page Editor</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit everything shown on the user safety page.
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

      <Card title="Top strip + actions">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Emergency label"
            value={form.stripEmergencyLabel}
            onChange={(v) => updateField("stripEmergencyLabel", v)}
          />
          <Field
            label="Security label"
            value={form.stripSecurityLabel}
            onChange={(v) => updateField("stripSecurityLabel", v)}
          />
          <Field
            label="Report label"
            value={form.stripReportLabel}
            onChange={(v) => updateField("stripReportLabel", v)}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Emergency number"
            value={form.emergencyNumber}
            onChange={(v) => updateField("emergencyNumber", v)}
          />
          <Field
            label="Security number"
            value={form.securityNumber}
            onChange={(v) => updateField("securityNumber", v)}
          />
          <Field
            label="Report URL"
            value={form.reportUrl}
            onChange={(v) => updateField("reportUrl", v)}
          />
          <Field
            label="Report button label"
            value={form.reportLabel}
            onChange={(v) => updateField("reportLabel", v)}
          />
          <Field
            label="IT help email"
            value={form.itHelpEmail}
            onChange={(v) => updateField("itHelpEmail", v)}
          />
          <Field
            label="IT help label"
            value={form.itHelpLabel}
            onChange={(v) => updateField("itHelpLabel", v)}
          />
        </div>

        <div className="mt-4">
          <Area
            label="Important note"
            value={form.quickNote}
            onChange={(v) => updateField("quickNote", v)}
          />
        </div>
      </Card>

      <Card title="Guidance sections">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Section title"
            value={form.sectionsTitle}
            onChange={(v) => updateField("sectionsTitle", v)}
          />
          <Field
            label="Section subtitle"
            value={form.sectionsSubtitle}
            onChange={(v) => updateField("sectionsSubtitle", v)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.sections.map((section, index) => (
            <div key={section.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Section {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Group"
                  value={section.group}
                  onChange={(v) => updateSection(index, "group", v)}
                />
                <Field
                  label="Title"
                  value={section.title}
                  onChange={(v) => updateSection(index, "title", v)}
                />
                <Field
                  label="Link label"
                  value={section.linkLabel ?? ""}
                  onChange={(v) => updateSection(index, "linkLabel", v)}
                />
                <Field
                  label="Link URL"
                  value={section.link ?? ""}
                  onChange={(v) => updateSection(index, "link", v)}
                />
              </div>

              <div className="mt-4">
                <Area
                  label="Text"
                  value={section.text}
                  onChange={(v) => updateSection(index, "text", v)}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSection}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add section
        </button>
      </Card>

      <Card title="Feedback block">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Heading"
            value={form.feedbackHeading}
            onChange={(v) => updateField("feedbackHeading", v)}
          />
          <Field
            label="Button text"
            value={form.feedbackButtonText}
            onChange={(v) => updateField("feedbackButtonText", v)}
          />
          <Field
            label="Button href"
            value={form.feedbackButtonHref}
            onChange={(v) => updateField("feedbackButtonHref", v)}
          />
        </div>

        <div className="mt-4">
          <Area
            label="Description"
            value={form.feedbackDescription}
            onChange={(v) => updateField("feedbackDescription", v)}
          />
        </div>
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