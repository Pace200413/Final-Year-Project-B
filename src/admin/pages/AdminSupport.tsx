"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SUPPORT_PAGE_CONTENT,
  type SupportPageContent,
  type SupportStatusItem,
} from "@/lib/support-page";

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

export default function AdminSupportPage() {
  const [form, setForm] = useState<SupportPageContent>(DEFAULT_SUPPORT_PAGE_CONTENT);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [servicesJson, setServicesJson] = useState("[]");

  const prettyServices = useMemo(
    () => JSON.stringify(form.services ?? [], null, 2),
    [form.services]
  );

  const load = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/support-page", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load support page content");
      }

      const content = json.content ?? DEFAULT_SUPPORT_PAGE_CONTENT;
      setForm(content);
      setServicesJson(JSON.stringify(content.services ?? [], null, 2));
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

  useEffect(() => {
    setServicesJson(prettyServices);
  }, [prettyServices]);

  const updateField = <K extends keyof SupportPageContent>(
    key: K,
    value: SupportPageContent[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateStatus = (
    index: number,
    key: keyof SupportStatusItem,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      status: prev.status.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addStatus = () => {
    setForm((prev) => ({
      ...prev,
      status: [...prev.status, { name: "", ok: true, href: "" }],
    }));
  };

  const removeStatus = (index: number) => {
    setForm((prev) => ({
      ...prev,
      status: prev.status.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      let parsedServices: unknown[] = [];
      try {
        const parsed = JSON.parse(servicesJson);
        if (!Array.isArray(parsed)) throw new Error("Services JSON must be an array.");
        parsedServices = parsed;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Invalid services JSON"
        );
      }

      const payload: SupportPageContent = {
        ...form,
        services: parsedServices,
      };

      const res = await fetch("/api/admin/support-page", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to save support page content");
      }

      setForm(json.content ?? payload);
      setServicesJson(JSON.stringify((json.content ?? payload).services ?? [], null, 2));
      setAudit(json.audit ?? []);
      setMessage(
        json.changedFields?.length
          ? `Saved. Changed: ${json.changedFields.join(", ")}`
          : "Saved. No changes detected."
      );

      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("support-page-content");
          bc.postMessage({ type: "updated" });
          bc.close();
        }
        localStorage.setItem("support-page:updated", String(Date.now()));
      } catch {}
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading support page content…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Support Page Editor</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit everything shown on the user support page.
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
          <Area
            label="Description"
            value={form.description}
            onChange={(v) => updateField("description", v)}
          />
        </div>
      </Card>

      <Card title="Emergency strip + alerts">
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

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Security phone"
            value={form.alertPhone}
            onChange={(v) => updateField("alertPhone", v)}
          />
          <Field
            label="Exit navigation URL"
            value={form.exitNavUrl}
            onChange={(v) => updateField("exitNavUrl", v)}
          />
        </div>

        <div className="mt-4">
          <Area
            label="Inline alert text"
            value={form.inlineAlertText}
            onChange={(v) => updateField("inlineAlertText", v)}
          />
        </div>
      </Card>

      <Card title="Buttons + sections">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Drawer button label"
            value={form.drawerButtonLabel}
            onChange={(v) => updateField("drawerButtonLabel", v)}
          />
          <Field
            label="Browse button label"
            value={form.browseButtonLabel}
            onChange={(v) => updateField("browseButtonLabel", v)}
          />
          <Field
            label="Browse title"
            value={form.browseTitle}
            onChange={(v) => updateField("browseTitle", v)}
          />
          <Field
            label="Drawer title"
            value={form.drawerTitle}
            onChange={(v) => updateField("drawerTitle", v)}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Area
            label="Browse description"
            value={form.browseDescription}
            onChange={(v) => updateField("browseDescription", v)}
          />
          <Area
            label="Drawer description"
            value={form.drawerDescription}
            onChange={(v) => updateField("drawerDescription", v)}
          />
        </div>
      </Card>

      <Card title="Status items">
        <div className="space-y-4">
          {form.status.map((item, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Status item {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeStatus(index)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Name"
                  value={item.name}
                  onChange={(v) => updateStatus(index, "name", v)}
                />
                <Field
                  label="Href"
                  value={item.href ?? ""}
                  onChange={(v) => updateStatus(index, "href", v)}
                />
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!item.ok}
                  onChange={(e) => updateStatus(index, "ok", e.target.checked)}
                />
                Service is operational
              </label>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStatus}
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Add status item
        </button>
      </Card>

      <Card
        title="Services data"
        subtitle="Paste the services array used by SupportDirectory as valid JSON."
      >
        <Area
          label="Services JSON"
          value={servicesJson}
          onChange={setServicesJson}
          rows={18}
        />
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