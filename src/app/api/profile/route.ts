import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveOrCreateProfile, supabaseAdmin } from "@/lib/db";
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

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function getIdentity() {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const email = session.user.email?.trim() ?? "";
  if (!email) {
    return { error: "Missing email", status: 400 as const };
  }

  const authUserId =
    session.user.entraOid?.trim() ||
    session.user.id?.trim() ||
    email.toLowerCase();

  const fullName =
    session.user.name?.trim() || prettifyNameFromEmail(email) || "Campus Student";

  return {
    session,
    email,
    authUserId,
    fullName,
  };
}

export async function GET() {
  const identity = await getIdentity();

  if ("error" in identity) {
    return NextResponse.json(
      { error: identity.error },
      { status: identity.status }
    );
  }

  const profile: AppProfile = await resolveOrCreateProfile({
    authUserId: identity.authUserId,
    email: identity.email,
    fullName: identity.fullName,
    avatarUrl: identity.session.user.image ?? null,
  });

  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const identity = await getIdentity();

  if ("error" in identity) {
    return NextResponse.json(
      { error: identity.error },
      { status: identity.status }
    );
  }

  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const profile: AppProfile = await resolveOrCreateProfile({
    authUserId: identity.authUserId,
    email: identity.email,
    fullName: identity.fullName,
    avatarUrl: identity.session.user.image ?? null,
  });

  const payload = {
    auth_user_id: identity.authUserId,
    email: profile.email || identity.email,
    full_name: cleanText((body as Record<string, unknown>).fullName) || profile.full_name || identity.fullName,
    avatar_url: profile.avatar_url ?? identity.session.user.image ?? null,
    student_id: cleanText((body as Record<string, unknown>).studentId) || null,
    faculty: cleanText((body as Record<string, unknown>).faculty) || null,
    course: cleanText((body as Record<string, unknown>).course) || null,
    year_label: cleanText((body as Record<string, unknown>).yearLabel) || null,
    campus: cleanText((body as Record<string, unknown>).campus) || "Swinburne Sarawak",
    role: profile.role || "student",
  };

  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .update(payload)
    .eq("email", identity.email)
    .select("*")
    .single()
    .overrideTypes<AppProfile, { merge: false }>();

  if (error) {
    return NextResponse.json(
      { error: `Failed to update profile: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: data });
}