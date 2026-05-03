import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProfileByAuthUserId } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({
      authenticated: false,
      isAdmin: false,
      name: null,
      email: null,
    });
  }

  const email = session.user.email?.trim() ?? "";
  const authUserId =
    session.user.entraOid?.trim() ||
    session.user.id?.trim() ||
    email.toLowerCase();

  if (!authUserId) {
    return NextResponse.json({
      authenticated: false,
      isAdmin: false,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    });
  }

  try {
    const profile = await getProfileByAuthUserId(authUserId);
    const isAdmin = (profile?.role ?? "").toLowerCase() === "admin";

    return NextResponse.json({
      authenticated: true,
      isAdmin,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    });
  } catch (error) {
    console.error("Profile API GET failed:", error);

    return NextResponse.json({
      authenticated: true,
      isAdmin: false,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
    });
  }
}