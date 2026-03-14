"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  GraduationCap,
  Lock,
  Shield,
  Type,
} from "lucide-react";
import {
  CAMPUSES,
  COURSES_BY_FACULTY,
  FACULTIES,
  YEAR_LABELS,
  type FacultyOption,
} from "@/app/data/profile-options";

type EditableProfile = {
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  course: string;
  yearLabel: string;
  campus: string;
};

type TextSize = "default" | "large";
type Contrast = "normal" | "high";

const TEXT_SIZE_KEY = "a11y_text";
const CONTRAST_KEY = "a11y_contrast";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function getStoredTextSize(): TextSize {
  const raw = localStorage.getItem(TEXT_SIZE_KEY);
  return raw === "large" ? "large" : "default";
}

function getStoredContrast(): Contrast {
  const raw = localStorage.getItem(CONTRAST_KEY);
  return raw === "high" ? "high" : "normal";
}

function applyAppearance(textSize: TextSize, contrast: Contrast) {
  const root = document.documentElement;

  root.classList.remove("dark");
  root.classList.toggle("a11y-text-large", textSize === "large");
  root.classList.toggle("a11y-contrast-high", contrast === "high");
  root.style.colorScheme = "light";

  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.content = "#F2F2F7";
}

export default function ProfileSettingsForm({
  initialProfile,
  isAuthenticated,
  userDisplayName,
  userEmail,
}: {
  initialProfile: EditableProfile | null;
  isAuthenticated: boolean;
  userDisplayName?: string;
  userEmail?: string;
}) {
  const router = useRouter();

  const [faculty, setFaculty] = useState(initialProfile?.faculty ?? "");
  const [course, setCourse] = useState(initialProfile?.course ?? "");
  const [yearLabel, setYearLabel] = useState(initialProfile?.yearLabel ?? "");
  const [campus, setCampus] = useState(initialProfile?.campus || "Swinburne Sarawak");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [textSize, setTextSize] = useState<TextSize>("default");
  const [contrast, setContrast] = useState<Contrast>("normal");
  const [mounted, setMounted] = useState(false);
  const [savedHint, setSavedHint] = useState("Local only");

  const availableCourses = useMemo(() => {
    if (!faculty || !FACULTIES.includes(faculty as FacultyOption)) return [];
    return [...COURSES_BY_FACULTY[faculty as FacultyOption]];
  }, [faculty]);

  useEffect(() => {
    if (!faculty) {
      setCourse("");
      return;
    }

    if (course && !availableCourses.includes(course)) {
      setCourse("");
    }
  }, [faculty, course, availableCourses]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setTextSize(getStoredTextSize());
    setContrast(getStoredContrast());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    localStorage.setItem(TEXT_SIZE_KEY, textSize);
    localStorage.setItem(CONTRAST_KEY, contrast);

    applyAppearance(textSize, contrast);
    window.dispatchEvent(new Event("app-appearance-change"));

    setSavedHint("Saved");
    const timer = window.setTimeout(() => setSavedHint("Local only"), 1200);
    return () => window.clearTimeout(timer);
  }, [textSize, contrast, mounted]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isAuthenticated) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty,
          course,
          yearLabel,
          campus,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error || "Failed to save profile");
        }

        const text = await res.text();
        throw new Error(text || "Failed to save profile");
      }

      router.replace("/profile");
      router.refresh();
    } catch (err) {
      console.error("Profile save failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <SettingsCard
        title="Display"
        subtitle="Light mode only. Adjust text size and contrast for readability."
        icon={<Type className="h-5 w-5" />}
        badge={savedHint}
      >
        <div className="space-y-4">
          <GroupCard title="Appearance">
            <div className="rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 py-3">
              <div className="text-sm font-medium text-slate-900">Theme</div>
              <div className="mt-1 text-xs text-slate-500">
                This app now uses light mode only. Dark mode has been removed.
              </div>
            </div>
          </GroupCard>

          <div className="grid gap-4 md:grid-cols-2">
            <GroupCard title="Text size">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F2F2F7]">
                <OptionRow
                  label="Standard"
                  description="Default size"
                  selected={textSize === "default"}
                  onClick={() => setTextSize("default")}
                />
                <OptionRow
                  label="Larger"
                  description="Easier to read"
                  selected={textSize === "large"}
                  onClick={() => setTextSize("large")}
                  noBorder
                />
              </div>
            </GroupCard>

            <GroupCard title="Contrast">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F2F2F7]">
                <OptionRow
                  label="Standard"
                  description="Balanced look"
                  selected={contrast === "normal"}
                  onClick={() => setContrast("normal")}
                />
                <OptionRow
                  label="High contrast"
                  description="Sharper separation"
                  selected={contrast === "high"}
                  onClick={() => setContrast("high")}
                  noBorder
                />
              </div>
            </GroupCard>
          </div>

          <GroupCard title="Preview">
            <PhonePreview textSize={textSize} contrast={contrast} />
          </GroupCard>
        </div>
      </SettingsCard>

      {!isAuthenticated ? (
        <SettingsCard
          title="Student profile"
          subtitle="Sign in with Microsoft to unlock academic details."
          icon={<Lock className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-[#F2F2F7] p-4">
              <div className="text-sm font-semibold text-slate-900">
                Display settings work without sign-in
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Sign in only when you want to save faculty, course, and year.
              </p>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                <div className="text-xs font-medium text-slate-500">Account status</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {userDisplayName || "Campus Student"}
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  {userEmail || "No Microsoft account connected"}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  Register with Microsoft
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/profile"
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  Open profile
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F2F2F7]">
              <LockedRow label="Academic school" value="Sign in to choose" />
              <LockedRow label="Course" value="Available after sign-in" />
              <LockedRow label="Year / status" value="Available after sign-in" />
              <LockedRow label="Campus" value="Swinburne Sarawak" last />
            </div>
          </div>
        </SettingsCard>
      ) : (
        <>
          <SettingsCard
            title="Account"
            subtitle="Your Microsoft identity is synced automatically."
            icon={<Shield className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <Field label="Full name">
                <input
                  value={initialProfile?.fullName ?? ""}
                  disabled
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 text-sm text-slate-500 outline-none"
                />
              </Field>

              <Field label="Email">
                <input
                  value={initialProfile?.email ?? ""}
                  disabled
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 text-sm text-slate-500 outline-none"
                />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Student details"
            subtitle="Saved to your account after Microsoft sign-in."
            icon={<GraduationCap className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <Field label="Student ID" hint="Synced automatically">
                <input
                  value={initialProfile?.studentId ?? ""}
                  disabled
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 text-sm text-slate-500 outline-none"
                />
              </Field>

              <Field label="Academic school">
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-slate-300"
                >
                  <option value="" disabled>
                    Select academic school
                  </option>
                  {FACULTIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Course"
                hint={
                  faculty
                    ? `${availableCourses.length} option${availableCourses.length === 1 ? "" : "s"} available`
                    : "Choose school first"
                }
              >
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  disabled={!faculty}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-[#F2F2F7] disabled:text-slate-400"
                >
                  <option value="" disabled>
                    {faculty ? "Select course" : "Select academic school first"}
                  </option>
                  {availableCourses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Year / status">
                <select
                  value={yearLabel}
                  onChange={(e) => setYearLabel(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                >
                  <option value="" disabled>
                    Select year / status
                  </option>
                  {YEAR_LABELS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Campus">
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                >
                  {CAMPUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
              >
                Cancel
              </button>
            </div>
          </SettingsCard>
        </>
      )}
    </form>
  );
}

function SettingsCard({
  title,
  subtitle,
  icon,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F2F2F7] text-slate-700">
              {icon}
            </span>

            <div>
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
            </div>
          </div>

          {badge ? (
            <span className="rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function GroupCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      {children}
    </div>
  );
}

function OptionRow({
  label,
  description,
  selected,
  onClick,
  noBorder,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  noBorder?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex w-full items-center justify-between px-4 py-3 text-left",
        !noBorder && "border-b border-slate-200"
      )}
    >
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="mt-0.5 text-xs text-slate-500">{description}</div>
      </div>

      <span
        className={cx(
          "grid h-5 w-5 place-items-center rounded-full border",
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-transparent"
        )}
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
    </button>
  );
}

function PhonePreview({
  textSize,
  contrast,
}: {
  textSize: TextSize;
  contrast: Contrast;
}) {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[30px] border border-black/10 bg-black p-2 shadow-lg">
      <div className="overflow-hidden rounded-[24px] bg-[#F2F2F7]">
        <div className="px-4 pb-3 pt-4">
          <div className="text-[13px] font-semibold text-slate-900">Settings</div>
          <div
            className={cx(
              "mt-1 text-slate-500",
              textSize === "large" ? "text-[15px]" : "text-[13px]"
            )}
          >
            Light appearance
          </div>
        </div>

        <div className="px-3 pb-4">
          <div
            className={cx(
              "overflow-hidden rounded-2xl bg-white",
              contrast === "high" && "ring-1 ring-black/5"
            )}
          >
            <PreviewRow title="Theme" value="Light only" textSize={textSize} />
            <PreviewRow title="Text size" value={textSize === "large" ? "Larger" : "Standard"} textSize={textSize} />
            <PreviewRow title="Contrast" value={contrast === "high" ? "High" : "Standard"} textSize={textSize} last />
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl bg-white">
            <PreviewRow title="Navigate" value="Ready" textSize={textSize} />
            <PreviewRow title="Support" value="Available" textSize={textSize} />
            <PreviewRow title="Events" value="Today" textSize={textSize} last />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  title,
  value,
  textSize,
  last,
}: {
  title: string;
  value: string;
  textSize: TextSize;
  last?: boolean;
}) {
  return (
    <div className={cx("flex items-center justify-between px-4 py-3", !last && "border-b border-slate-200")}>
      <span className={cx(textSize === "large" ? "text-[15px]" : "text-[13px]", "text-slate-900")}>
        {title}
      </span>
      <span className={cx(textSize === "large" ? "text-[14px]" : "text-[12px]", "text-slate-500")}>
        {value}
      </span>
    </div>
  );
}

function LockedRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={cx("flex items-center justify-between px-4 py-3", !last && "border-b border-slate-200")}>
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="mt-0.5 text-xs text-slate-500">{value}</div>
      </div>
      <Lock className="h-4 w-4 text-slate-400" />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}