"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ProfileSettingsForm({
  initialProfile,
}: {
  initialProfile: EditableProfile;
}) {
  const router = useRouter();

  const [studentId, setStudentId] = useState(initialProfile.studentId);
  const [faculty, setFaculty] = useState(initialProfile.faculty);
  const [course, setCourse] = useState(initialProfile.course);
  const [yearLabel, setYearLabel] = useState(initialProfile.yearLabel);
  const [campus, setCampus] = useState(initialProfile.campus || "Swinburne Sarawak");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
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
      return;
    } catch (err) {
      console.error("Profile save failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Account</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your Microsoft-connected identity is synced automatically.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <input
              value={initialProfile.fullName}
              disabled
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            />
          </Field>

          <Field label="Email">
            <input
              value={initialProfile.email}
              disabled
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Student details</h2>
          <p className="mt-1 text-sm text-slate-600">
            Select your academic school first, then choose from the matching course list.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Student ID">
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 102777885"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-red-100"
            />
          </Field>

          <Field label="Academic school">
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-red-100"
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
                : "Choose academic school first"
            }
          >
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={!faculty}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-red-100"
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
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-red-100"
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
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-red-100"
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
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
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