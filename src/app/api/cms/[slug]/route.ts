import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import { cloneCmsContent, getCmsPageConfig } from "@/lib/page-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const config = getCmsPageConfig(slug);

  if (!config) {
    return NextResponse.json({ error: "Unknown page" }, { status: 404 });
  }

  const db = supabaseAdmin();

  const { data, error } = await db
    .from(config.contentTable)
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    slug,
    title: config.title,
    content: data?.content ?? cloneCmsContent(config.defaultContent),
    updatedAt: data?.updated_at ?? null,
  });
}