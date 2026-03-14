import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_SUPPORT_PAGE_CONTENT,
  contentToSupportPageRow,
  rowToSupportPageContent,
  type SupportPageContentRow,
} from "@/lib/support-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOrCreateRow() {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("support_page_content")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load support page content: ${error.message}`);
  }

  if (data) return data as SupportPageContentRow;

  const { data: inserted, error: insertError } = await db
    .from("support_page_content")
    .insert({
      id: "default",
      ...contentToSupportPageRow(DEFAULT_SUPPORT_PAGE_CONTENT),
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed support page content: ${insertError.message}`);
  }

  return inserted as SupportPageContentRow;
}

export async function GET() {
  try {
    const row = await getOrCreateRow();
    return NextResponse.json({ content: rowToSupportPageContent(row) });
  } catch (error) {
    console.error("GET /api/support-page failed:", error);
    return NextResponse.json(
      { error: "Failed to load support page content" },
      { status: 500 }
    );
  }
}