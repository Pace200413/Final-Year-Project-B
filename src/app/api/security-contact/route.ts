import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_SECURITY_CONTACT_CONTENT,
  contentToSecurityContactRow,
  rowToSecurityContactContent,
  type SecurityContactContentRow,
} from "@/lib/security-contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOrCreateRow() {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("security_contact_content")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load security contact content: ${error.message}`);
  }

  if (data) return data as SecurityContactContentRow;

  const { data: inserted, error: insertError } = await db
    .from("security_contact_content")
    .insert({
      id: "default",
      ...contentToSecurityContactRow(DEFAULT_SECURITY_CONTACT_CONTENT),
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed security contact content: ${insertError.message}`);
  }

  return inserted as SecurityContactContentRow;
}

export async function GET() {
  try {
    const row = await getOrCreateRow();
    return NextResponse.json({ content: rowToSecurityContactContent(row) });
  } catch (error) {
    console.error("GET /api/security-contact failed:", error);
    return NextResponse.json(
      { error: "Failed to load security contact content" },
      { status: 500 }
    );
  }
}