import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(req: NextRequest) {
  const roles = (req.cookies.get("roles")?.value ?? "")
    .split(",")
    .map((r) => r.trim().toLowerCase());
  const role = (req.cookies.get("role")?.value ?? "").toLowerCase();
  const isAdmin = roles.includes("admin") || role === "admin";
  if (!isAdmin) {
    const url = new URL("/profile?unauthorized=1", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
