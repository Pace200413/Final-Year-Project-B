import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileUI, type ProfileViewModel } from "@/components/profile/ProfileUI";
import { resolveOrCreateProfile } from "@/lib/db";
import type { AppProfile } from "@/lib/types";

type ProfilePageProps = {
  searchParams?: Promise<{ unauthorized?: string | string[] }>;
};

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

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = (await searchParams) ?? {};
  const unauthorizedRaw = Array.isArray(params.unauthorized)
    ? params.unauthorized[0]
    : params.unauthorized;

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

  const fullName =
    session.user.name?.trim() || prettifyNameFromEmail(email) || "Campus Student";

  const dbProfile: AppProfile = await resolveOrCreateProfile({
    authUserId,
    email,
    fullName,
    avatarUrl: session.user.image ?? null,
  });

  const isAdmin = (dbProfile.role ?? "").toLowerCase() === "admin";

  const profile: ProfileViewModel = {
    fullName: dbProfile.full_name?.trim() || fullName,
    email: dbProfile.email || email,
    studentId: dbProfile.student_id?.trim() || "Not synced yet",
    faculty: dbProfile.faculty?.trim() || "Will appear after account sync",
    course: dbProfile.course?.trim() || "Will appear after account sync",
    yearLabel: dbProfile.year_label?.trim() || "Current student",
    campus: dbProfile.campus?.trim() || "Swinburne Sarawak",
    roleLabel: isAdmin ? "Student account · Admin access" : "Student account",
    microsoftConnected: true,
    isAdmin,
    unauthorized: unauthorizedRaw === "1",
  };

  return <ProfileUI profile={profile} />;
}