"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  GraduationCap,
  Lock,
  RotateCcw,
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

type EditableProfile = {
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  course: string;
  yearLabel: string;
  campus: string;
};

type ReminderTime = "10m" | "30m" | "1h" | "1d";
type EventCategory = "Academic" | "Campus" | "Club" | "Workshop" | "Sports";
type HomeSection = "home" | "events" | "essentials" | "support" | "profile";

const EVENTS_ENABLED_KEY = "pref_events_enabled";
const EVENT_REMINDER_KEY = "pref_event_reminder";
const EVENT_CATEGORIES_KEY = "pref_event_categories";
const DEFAULT_HOME_SECTION_KEY = "pref_default_home_section";
const SHOW_TIPS_KEY = "pref_show_tips";
const EXTERNAL_NEW_TAB_KEY = "pref_external_new_tab";

const EVENT_CATEGORY_OPTIONS: EventCategory[] = [
  "Academic",
  "Campus",
  "Club",
  "Workshop",
  "Sports",
];

const HOME_SECTION_OPTIONS: Array<{ value: HomeSection; label: string }> = [
  { value: "home", label: "Home" },
  { value: "events", label: "Events" },
  { value: "essentials", label: "Student Essentials" },
  { value: "support", label: "Support" },
  { value: "profile", label: "Profile" },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function parseStoredCategories(value: string | null): EventCategory[] {
  if (!value) return [...EVENT_CATEGORY_OPTIONS];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [...EVENT_CATEGORY_OPTIONS];

    return parsed.filter((item): item is EventCategory =>
      EVENT_CATEGORY_OPTIONS.includes(item as EventCategory)
    );
  } catch {
    return [...EVENT_CATEGORY_OPTIONS];
  }
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
  const [campus, setCampus] = useState(
    initialProfile?.campus || "Swinburne Sarawak"
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [eventNotifications, setEventNotifications] = useState(false);
  const [eventReminder, setEventReminder] = useState<ReminderTime>("30m");
  const [eventCategories, setEventCategories] = useState<EventCategory[]>(
    [...EVENT_CATEGORY_OPTIONS]
  );
  const [defaultHomeSection, setDefaultHomeSection] =
    useState<HomeSection>("home");
  const [showOnboardingTips, setShowOnboardingTips] = useState(true);
  const [externalLinksNewTab, setExternalLinksNewTab] = useState(true);
  const [prefsMounted, setPrefsMounted] = useState(false);
  const [prefsSavedHint, setPrefsSavedHint] = useState("Local only");

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

    setEventNotifications(localStorage.getItem(EVENTS_ENABLED_KEY) === "true");

    const storedReminder = localStorage.getItem(EVENT_REMINDER_KEY);
    setEventReminder(
      storedReminder === "10m" ||
        storedReminder === "30m" ||
        storedReminder === "1h" ||
        storedReminder === "1d"
        ? storedReminder
        : "30m"
    );

    setEventCategories(
      parseStoredCategories(localStorage.getItem(EVENT_CATEGORIES_KEY))
    );

    const storedHome = localStorage.getItem(DEFAULT_HOME_SECTION_KEY);
    setDefaultHomeSection(
      storedHome === "home" ||
        storedHome === "events" ||
        storedHome === "essentials" ||
        storedHome === "support" ||
        storedHome === "profile"
        ? storedHome
        : "home"
    );

    const storedShowTips = localStorage.getItem(SHOW_TIPS_KEY);
    setShowOnboardingTips(storedShowTips !== "false");

    const storedExternalLinks = localStorage.getItem(EXTERNAL_NEW_TAB_KEY);
    setExternalLinksNewTab(storedExternalLinks !== "false");

    setPrefsMounted(true);
  }, []);

  useEffect(() => {
    if (!prefsMounted || typeof window === "undefined") return;

    localStorage.setItem(EVENTS_ENABLED_KEY, String(eventNotifications));
    localStorage.setItem(EVENT_REMINDER_KEY, eventReminder);
    localStorage.setItem(EVENT_CATEGORIES_KEY, JSON.stringify(eventCategories));
    localStorage.setItem(DEFAULT_HOME_SECTION_KEY, defaultHomeSection);
    localStorage.setItem(SHOW_TIPS_KEY, String(showOnboardingTips));
    localStorage.setItem(EXTERNAL_NEW_TAB_KEY, String(externalLinksNewTab));
    window.dispatchEvent(new Event("app-settings-change"));

    setPrefsSavedHint("Saved");
    const timer = window.setTimeout(() => setPrefsSavedHint("Local only"), 1200);
    return () => window.clearTimeout(timer);
  }, [
    eventNotifications,
    eventReminder,
    eventCategories,
    defaultHomeSection,
    showOnboardingTips,
    externalLinksNewTab,
    prefsMounted,
  ]);

  function toggleEventCategory(category: EventCategory) {
    setEventCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function resetLocalPreferences() {
    setEventNotifications(false);
    setEventReminder("30m");
    setEventCategories([...EVENT_CATEGORY_OPTIONS]);
    setDefaultHomeSection("home");
    setShowOnboardingTips(true);
    setExternalLinksNewTab(true);

    if (typeof window !== "undefined") {
      localStorage.removeItem(EVENTS_ENABLED_KEY);
      localStorage.removeItem(EVENT_REMINDER_KEY);
      localStorage.removeItem(EVENT_CATEGORIES_KEY);
      localStorage.removeItem(DEFAULT_HOME_SECTION_KEY);
      localStorage.removeItem(SHOW_TIPS_KEY);
      localStorage.removeItem(EXTERNAL_NEW_TAB_KEY);
      window.dispatchEvent(new Event("app-settings-change"));
    }

    setPrefsSavedHint("Reset");
    window.setTimeout(() => setPrefsSavedHint("Local only"), 1200);
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
        title="Events"
        subtitle="Choose whether event reminders are enabled and what matters to you."
        icon={<Bell className="h-5 w-5" />}
        badge={prefsSavedHint}
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F2F2F7]">
            <ToggleRow
              label="Event notifications"
              description="Turn reminders for campus events on or off."
              enabled={eventNotifications}
              onToggle={() => setEventNotifications((value) => !value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Reminder time">
              <select
                value={eventReminder}
                onChange={(e) => setEventReminder(e.target.value as ReminderTime)}
                disabled={!eventNotifications}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-[#F2F2F7] disabled:text-slate-400"
              >
                <option value="10m">10 minutes before</option>
                <option value="30m">30 minutes before</option>
                <option value="1h">1 hour before</option>
                <option value="1d">1 day before</option>
              </select>
            </Field>

            <Field
              label="Preferred categories"
              hint={
                eventCategories.length === 0
                  ? "No categories selected"
                  : `${eventCategories.length} selected`
              }
            >
              <div
                className={cx(
                  "flex min-h-12 flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3",
                  !eventNotifications && "pointer-events-none opacity-60"
                )}
              >
                {EVENT_CATEGORY_OPTIONS.map((category) => (
                  <ChoiceChip
                    key={category}
                    label={category}
                    selected={eventCategories.includes(category)}
                    onClick={() => toggleEventCategory(category)}
                  />
                ))}
              </div>
            </Field>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="App preferences"
        subtitle="Small behaviour settings that keep the app simple and useful."
        icon={<SlidersHorizontal className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <Field label="Default home section">
            <select
              value={defaultHomeSection}
              onChange={(e) =>
                setDefaultHomeSection(e.target.value as HomeSection)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            >
              {HOME_SECTION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F2F2F7]">
            <ToggleRow
              label="Show onboarding tips"
              description="Keep quick tips and first-use guidance visible."
              enabled={showOnboardingTips}
              onToggle={() => setShowOnboardingTips((value) => !value)}
            />
            <ToggleRow
              label="Open external links in new tab"
              description="Useful for Student Portal, Canvas, Skedda, and other external pages."
              enabled={externalLinksNewTab}
              onToggle={() => setExternalLinksNewTab((value) => !value)}
              noBorder
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Reset"
        subtitle="Clear local preferences and return this device to the default app behaviour."
        icon={<RotateCcw className="h-5 w-5" />}
      >
        <div className="rounded-2xl border border-slate-200 bg-[#F2F2F7] p-4">
          <div className="text-sm font-semibold text-slate-900">
            Reset local settings
          </div>
          <p className="mt-1 text-sm text-slate-600">
            This removes event and app preference choices saved on this device.
          </p>

          <button
            type="button"
            onClick={resetLocalPreferences}
            className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Reset preferences
          </button>
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
                App settings work without sign-in
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Sign in only when you want to save faculty, course, and year.
              </p>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                <div className="text-xs font-medium text-slate-500">
                  Account status
                </div>
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
                  className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  Register with Microsoft
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
              <LockedRow
                label="Year / status"
                value="Available after sign-in"
              />
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
                    {faculty
                      ? "Select course"
                      : "Select academic school first"}
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
  icon: ReactNode;
  badge?: string;
  children: ReactNode;
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
              <h2 className="text-base font-semibold text-slate-900">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              ) : null}
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

function ChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
        selected
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-[#F2F2F7] text-slate-700"
      )}
    >
      {label}
    </button>
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
    <div
      className={cx(
        "flex items-center justify-between px-4 py-3",
        !last && "border-b border-slate-200"
      )}
    >
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