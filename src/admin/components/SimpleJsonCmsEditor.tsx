"use client";

import { useEffect, useState } from "react";
import {
  AdminEditorPage,
  EditorSection,
  SecondaryButton,
} from "@/admin/components/AdminEditorUI";
import type { CmsPageSlug } from "@/lib/page-cms";

type Props = {
  slug: CmsPageSlug;
  title: string;
  description: string;
};

export default function SimpleJsonCmsEditor({
  slug,
  title,
  description,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/cms/${slug}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to load content.");
      }

      if (!data?.content || typeof data.content !== "object") {
        throw new Error("No content object returned from API.");
      }

      const pretty = JSON.stringify(data.content, null, 2);
      setText(pretty);
      setOriginalText(pretty);
    } catch (error) {
      setText("");
      setOriginalText("");
      setMessage(
        error instanceof Error ? error.message : "Failed to load content."
      );
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");

    try {
      const parsed = JSON.parse(text);

      const res = await fetch(`/api/admin/cms/${slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: parsed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to save content.");
      }

      const pretty = JSON.stringify(data.content ?? parsed, null, 2);
      setText(pretty);
      setOriginalText(pretty);
      setMessage("Saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Invalid JSON or save failed."
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  return (
    <AdminEditorPage
      title={title}
      description={description}
      loading={loading}
      loadingLabel={`Loading ${title.toLowerCase()}…`}
      message={message}
    >
      <EditorSection
        title="Page content"
        subtitle="Edit the JSON content for this page. Save when ready."
      >
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="min-h-[560px] w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none"
          />

          <div className="flex flex-wrap gap-3">
            <SecondaryButton onClick={load}>Reload</SecondaryButton>
            <SecondaryButton
              onClick={() => setText(originalText)}
              disabled={saving}
            >
              Reset
            </SecondaryButton>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save content"}
            </button>
          </div>
        </div>
      </EditorSection>
    </AdminEditorPage>
  );
}