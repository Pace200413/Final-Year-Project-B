"use client";

import type { ReactNode } from "react";

export type AdminAuditItem = {
  id: number | string;
  changedAt: string;
  changedFields: string[];
  changedByAuthUserId?: string | null;
  changedByEmail?: string | null;
};

export function AdminEditorPage({
  title,
  description,
  saving = false,
  onSave,
  message,
  loading = false,
  loadingLabel = "Loading…",
  children,
}: {
  title: string;
  description: string;
  saving?: boolean;
  onSave?: () => void;
  message?: string;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-600">
        {loadingLabel}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Editor
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </div>

          {onSave ? (
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          ) : null}
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function EditorSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function TextField({
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
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
      />
    </label>
  );
}

export function TextAreaField({
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
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
      />
    </label>
  );
}

export function SecondaryButton({
  children,
  onClick,
  danger = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export function AuditTable({
  items,
}: {
  items: AdminAuditItem[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-slate-600">
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Who</th>
            <th className="px-4 py-3 font-medium">Changed fields</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-5 text-slate-500">
                No changes logged yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 align-top">
                <td className="px-4 py-4 text-slate-700">
                  {new Date(item.changedAt).toLocaleString()}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {item.changedByEmail || item.changedByAuthUserId || "Unknown"}
                </td>
                <td className="px-4 py-4 text-slate-700">
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
  );
}