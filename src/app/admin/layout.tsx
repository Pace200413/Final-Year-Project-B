import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "@/admin/layouts/AdminShell";
import { getProfileByAuthUserId, upsertProfile } from "@/lib/db";

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

export default async function Layout({ children }: { children: ReactNode }) {
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

  let profile = await getProfileByAuthUserId(authUserId);

  if (!profile) {
    const fullName =
      session.user.name?.trim() ||
      prettifyNameFromEmail(email) ||
      "Campus Student";

    profile = await upsertProfile({
      authUserId,
      email,
      fullName,
      avatarUrl: session.user.image ?? null,
    });
  }

  const isAdmin = (profile.role ?? "").toLowerCase() === "admin";

  if (!isAdmin) {
    redirect("/profile?unauthorized=1");
  }

  return <AdminShell>{children}</AdminShell>;
}