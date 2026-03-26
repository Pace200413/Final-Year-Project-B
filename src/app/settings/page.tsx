import Link from "next/link";
import { auth } from "@/auth";
import { resolveOrCreateProfile } from "@/lib/db";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";
import type { AppProfile } from "@/lib/types";

function prettifyNameFromEmail(email?: string | null) {
  if (!email) return "";
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "";

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const CONTAINER = "mx-auto w-full max-w-[1280px] container-px";

type EditableProfile = {
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  course: string;
  yearLabel: string;
  campus: string;
};

export default async function SettingsPage() {
  const session = await auth();

  const email = session?.user?.email?.trim() ?? "";
  const isAuthenticated = Boolean(session?.user && email);

  const displayName =
    session?.user?.name?.trim() ||
    prettifyNameFromEmail(email) ||
    "Campus Student";

  let initialProfile: EditableProfile | null = null;

  if (isAuthenticated) {
    const authUserId =
      session?.user?.entraOid?.trim() ||
      session?.user?.id?.trim() ||
      email.toLowerCase();

    const profile: AppProfile = await resolveOrCreateProfile({
      authUserId,
      email,
      fullName: displayName,
      avatarUrl: session?.user?.image ?? null,
    });

    initialProfile = {
      fullName: profile.full_name?.trim() || displayName,
      email: profile.email || email,
      studentId: profile.student_id?.trim() || "",
      faculty: profile.faculty?.trim() || "",
      course: profile.course?.trim() || "",
      yearLabel: profile.year_label?.trim() || "",
      campus: profile.campus?.trim() || "Swinburne Sarawak",
    };
  }

  return (
    <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+84px)]">
      <div className={CONTAINER}>
        <section className="mb-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="px-4 pb-4 pt-5 sm:px-5 sm:pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F2F2F7] px-3 py-1 text-[11px] font-medium text-slate-700">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAuthenticated ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    aria-hidden
                  />
                  {isAuthenticated ? "Signed in" : "Guest mode"}
                </div>

                <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-900">
                  Settings
                </h1>

                <p className="mt-1 max-w-[720px] text-sm leading-6 text-slate-600">
                  Light mode only. Display settings are available for everyone.
                  Microsoft sign-in unlocks your student details like faculty,
                  course, and year.
                </p>
              </div>

              <Link
                href={isAuthenticated ? "/profile" : "/"}
                className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {isAuthenticated ? "Back" : "Home"}
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <TopStat
                label="Access"
                value={isAuthenticated ? "Microsoft connected" : "Not connected"}
              />
              <TopStat label="Appearance" value="Light mode only" />
              <TopStat
                label="Profile"
                value={isAuthenticated ? "Can be updated" : "Sign in to unlock"}
              />
            </div>
          </div>
        </section>

        <ProfileSettingsForm
          initialProfile={initialProfile}
          isAuthenticated={isAuthenticated}
          userDisplayName={displayName}
          userEmail={email}
        />
      </div>
    </div>
  );
}

function TopStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}