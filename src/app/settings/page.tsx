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
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[22px]">
                Settings
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  isAuthenticated
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isAuthenticated ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  aria-hidden
                />
                {isAuthenticated ? "Microsoft connected" : "Guest mode"}
              </span>
            </div>
            <p className="mt-1.5 max-w-[640px] text-sm leading-snug text-slate-600">
              Your student control centre for Microsoft sign-in, campus details,
              and how dates and times appear around the app.
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/profile" : "/"}
            className="shrink-0 self-start rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:mt-0.5"
          >
            {isAuthenticated ? "Back" : "Home"}
          </Link>
        </header>

        <ProfileSettingsForm
          initialProfile={initialProfile}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
