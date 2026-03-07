import { redirect } from "next/navigation";
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

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const email = session.user.email?.trim() ?? "";
  if (!email) {
    redirect("/login");
  }

  const authUserId =
    session.user.entraOid?.trim() ||
    session.user.id?.trim() ||
    email.toLowerCase();

    const profile: AppProfile = await resolveOrCreateProfile({
    authUserId,
    email,
    fullName:
        session.user.name?.trim() || prettifyNameFromEmail(email) || "Campus Student",
    avatarUrl: session.user.image ?? null,
    });

  return (
    <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+84px)]">
      <div className={CONTAINER}>
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Settings
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your student profile details.
              </p>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Back to profile
            </Link>
          </div>
        </div>

        <ProfileSettingsForm
          initialProfile={{
            fullName: profile.full_name?.trim() || session.user.name?.trim() || "",
            email: profile.email || email,
            studentId: profile.student_id?.trim() || "",
            faculty: profile.faculty?.trim() || "",
            course: profile.course?.trim() || "",
            yearLabel: profile.year_label?.trim() || "",
            campus: profile.campus?.trim() || "Swinburne Sarawak",
          }}
        />
      </div>
    </div>
  );
}