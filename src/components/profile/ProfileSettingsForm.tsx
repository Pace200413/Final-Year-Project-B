"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Lock,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import {
  CAMPUSES,
  COURSES_BY_FACULTY,
  FACULTIES,
  YEAR_LABELS,
  type FacultyOption,
} from "@/app/data/profile-options";
import { useDevicePrefs } from "@/lib/device-prefs";

type EditableProfile = {
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  course: string;
  yearLabel: string;
  campus: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function ProfileSettingsForm({
  initialProfile,
  isAuthenticated,
}: {
  initialProfile: EditableProfile | null;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const {
    prefs: devicePrefs,
    setPrefs: setDevicePrefs,
  } = useDevicePrefs();

  const [faculty, setFaculty] = useState(initialProfile?.faculty ?? "");
  const [course, setCourse] = useState(initialProfile?.course ?? "");
  const [yearLabel, setYearLabel] = useState(initialProfile?.yearLabel ?? "");
  const [campus, setCampus] = useState(
    initialProfile?.campus || "Swinburne Sarawak"
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const availableCourses = useMemo(() => {
    if (!faculty || !FACULTIES.includes(faculty as FacultyOption)) return [];
    return [...COURSES_BY_FACULTY[faculty as FacultyOption]];
  }, [faculty]);

  const baselineCampus = initialProfile?.campus || "Swinburne Sarawak";

  const isAcademicDirty =
    Boolean(initialProfile) &&
    (faculty !== (initialProfile?.faculty ?? "") ||
      course !== (initialProfile?.course ?? "") ||
      yearLabel !== (initialProfile?.yearLabel ?? "") ||
      campus !== baselineCampus);

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
    if (!isAuthenticated || !initialProfile) return;
    setFaculty(initialProfile.faculty);
    setCourse(initialProfile.course);
    setYearLabel(initialProfile.yearLabel);
    setCampus(initialProfile.campus || "Swinburne Sarawak");
  }, [
    isAuthenticated,
    initialProfile?.faculty,
    initialProfile?.course,
    initialProfile?.yearLabel,
    initialProfile?.campus,
  ]);

  useEffect(() => {
    if (!initialProfile || !isAuthenticated) return;
    const currentBaselineCampus = initialProfile.campus || "Swinburne Sarawak";
    const matchesBaseline =
      faculty === initialProfile.faculty &&
      course === initialProfile.course &&
      yearLabel === initialProfile.yearLabel &&
      campus === currentBaselineCampus;

    if (!matchesBaseline) setSaveSuccess(false);
  }, [
    faculty,
    course,
    yearLabel,
    campus,
    initialProfile?.faculty,
    initialProfile?.course,
    initialProfile?.yearLabel,
    initialProfile?.campus,
    isAuthenticated,
  ]);

  function revertAcademicForm() {
    if (!initialProfile) return;
    setFaculty(initialProfile.faculty);
    setCourse(initialProfile.course);
    setYearLabel(initialProfile.yearLabel);
    setCampus(initialProfile.campus || "Swinburne Sarawak");
    setError("");
    setSaveSuccess(false);
  }


  async function onSubmit(e: FormEvent<HTMLFormElement>) {
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

      setSaveSuccess(true);
      router.refresh();
    } catch (err) {
      console.error("Profile save failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Account & Sync"
        subtitle="Identity from your institution account. Read-only on this screen."
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 px-4 py-1 sm:px-5">
          {isAuthenticated && initialProfile ? (
            <>
              <InfoRow label="Full name" value={initialProfile.fullName} />
              <InfoRow label="Email" value={initialProfile.email} mono />
              <InfoRow
                label="Student ID"
                value={initialProfile.studentId || "Not on file yet"}
              />
              <InfoRow
                label="Connection"
                value="Microsoft 365 connected"
                valueClassName="text-emerald-800"
                last
              />
              <p className="border-t border-slate-100 py-4 text-xs leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-600">
                  Managed by Microsoft sign-in.
                </span>{" "}
                Your name, email, and student ID stay aligned with your Microsoft
                work or school account. Updates you make in Microsoft may appear
                here after you refresh or sign in again.
              </p>
            </>
          ) : (
            <>
              <InfoRow label="Full name" value="—" mutedValue />
              <InfoRow label="Email" value="—" mutedValue />
              <InfoRow label="Student ID" value="—" mutedValue />
              <InfoRow
                label="Connection"
                value="Guest — not signed in"
                valueClassName="text-amber-800"
                last
              />
              <p className="border-t border-slate-100 py-4 text-xs leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-600">
                  Managed by Microsoft sign-in.
                </span>{" "}
                Connect your Microsoft 365 account to load your official name,
                email, and student identifier. Use Student Details below to sign in.
              </p>
            </>
          )}
        </div>
      </SettingsCard>

      <PrimarySettingsCard
        title="Student Details"
        subtitle={
          isAuthenticated
            ? "Update your academic profile. Changes are saved to your campus record."
            : "Sign in with Microsoft to edit school, course, year, and campus."
        }
        icon={<GraduationCap className="h-5 w-5" />}
      >
        {!isAuthenticated ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <Lock className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <p className="mt-4 max-w-sm text-sm font-medium text-slate-900">
              Academic profile is locked
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
              Sign in with your Swinburne Microsoft account to choose your school,
              course, year, and campus.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Sign in with Microsoft
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" data-settings-form>
            {saveSuccess ? (
              <div
                className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950"
                role="status"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <div>
                  <p className="font-semibold text-emerald-900">Profile saved</p>
                  <p className="mt-0.5 text-emerald-800/90">
                    Your academic details are updated. You can keep editing or
                    leave this page anytime.
                  </p>
                </div>
              </div>
            ) : null}

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
                  ? `${availableCourses.length} option${
                      availableCourses.length === 1 ? "" : "s"
                    } available`
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

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="border-t border-slate-100 pt-4">
              {isAcademicDirty ? (
                <div className="compact-actions flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={revertAcademicForm}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="compact-status inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Student details are saved
                </div>
              )}
            </div>
          </form>
        )}
      </PrimarySettingsCard>

      <SettingsCard
        title="Home"
        subtitle="Useful display preferences for this browser."
        icon={<SlidersHorizontal className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F2F2F7]">

          <ToggleRow
            label="Compact mode"
            description="Use tighter spacing across the app on this device."
            enabled={devicePrefs.compactMode}
            onToggle={() =>
              setDevicePrefs({
                compactMode: !devicePrefs.compactMode,
              })
            }
            noBorder
          />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="About & Support"
        subtitle="Version info and key student help routes."
        icon={<HelpCircle className="h-5 w-5" />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                App version
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Campus app web build
              </div>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              v0.1.0
            </span>
          </div>

          <Link
            href="/new-to-swinburne"
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Help &amp; getting started
            <span className="text-slate-400" aria-hidden>
              →
            </span>
          </Link>

          <Link
            href="/navigate"
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Campus map &amp; service points
            <span className="text-slate-400" aria-hidden>
              →
            </span>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 py-3 text-xs leading-5 text-slate-600">
            Privacy policy is intentionally not linked here yet because no
            confirmed in-app route or official URL was provided in the current
            code context.
          </div>
        </div>
      </SettingsCard>


    </div>
  );
}

function SettingsCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      data-settings-card
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F2F2F7] text-slate-700">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function PrimarySettingsCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      data-settings-card
      className="overflow-hidden rounded-[28px] border-2 border-slate-300 bg-white shadow-md ring-1 ring-slate-900/[0.04]"
    >
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-snug text-slate-600">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
  mutedValue,
  mono,
  last,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  mutedValue?: boolean;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8",
        !last && "border-b border-slate-100"
      )}
    >
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
        {label}
      </span>
      <span
        className={cx(
          "min-w-0 text-left text-[15px] font-medium leading-snug sm:max-w-[min(100%,24rem)] sm:text-right",
          mono && "font-mono text-[13px] tracking-tight text-slate-800",
          mutedValue ? "text-slate-400" : "text-slate-900",
          valueClassName
        )}
      >
        {value}
      </span>
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
  children: ReactNode;
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

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  noBorder,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  noBorder?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cx(
        "flex w-full items-center justify-between gap-4 px-4 py-3 text-left",
        !noBorder && "border-b border-slate-200"
      )}
    >
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="mt-0.5 text-xs text-slate-500">{description}</div>
      </div>

      <span
        className={cx(
          "relative inline-flex h-7 w-12 shrink-0 rounded-full transition",
          enabled ? "bg-slate-900" : "bg-slate-300"
        )}
      >
        <span
          className={cx(
            "absolute top-1 h-5 w-5 rounded-full bg-white transition",
            enabled ? "left-6" : "left-1"
          )}
        />
      </span>
    </button>
  );
}