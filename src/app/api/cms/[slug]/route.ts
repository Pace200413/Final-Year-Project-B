import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnon, supabaseAdmin } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;

  const sb = supabaseAnon();
  const { data, error } = await sb
    .from("cms_pages")
    .select("slug, content, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;

  // Admin-only: use service role
  const sb = supabaseAdmin();
  const body = await req.json(); // expects { content: {...} }

  if (!body || typeof body.content !== "object" || body.content === null) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("cms_pages")
    .upsert({ slug, content: body.content })
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}