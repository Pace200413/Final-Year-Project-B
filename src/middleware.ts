import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_ROLES = ["admin", "superadmin"];

export default auth(async (req) => {
  const session = req.auth;

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE ??
    "";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const authUserId = session.user.id ?? null;
  const email = session.user.email?.toLowerCase() ?? null;

  const byAuth = authUserId
    ? await db
        .from("profiles")
        .select("role")
        .eq("auth_user_id", authUserId)
        .maybeSingle()
    : null;

  const byEmail =
    !byAuth?.data && email
      ? await db
          .from("profiles")
          .select("role")
          .eq("email", email)
          .maybeSingle()
      : null;

  const role = String(
    (byAuth?.data ?? byEmail?.data)?.role ?? ""
  ).toLowerCase();

  if (!ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
