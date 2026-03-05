import { NextResponse, type NextRequest } from "next/server";
import { appendAudit, readAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 25);
  const items = await readAudit(Number.isFinite(limit) ? limit : 25);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { who?: string; what?: string } | null;
  if (!body?.what) return NextResponse.json({ error: "what is required" }, { status: 400 });

  const rec = await appendAudit(body.who ?? "admin", body.what);
  return NextResponse.json({ ok: true, item: rec });
}