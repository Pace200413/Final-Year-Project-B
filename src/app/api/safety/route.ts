import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_SAFETY_CONTENT,
  contentToSafetyRow,
  rowToSafetyContent,
  type SafetyContentRow,
} from "@/lib/safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOrCreateSafetyRow() {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("safety_content")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load safety content: ${error.message}`);
  }

  if (data) return data as SafetyContentRow;

  const { data: inserted, error: insertError } = await db
    .from("safety_content")
    .insert({
      id: "default",
      ...contentToSafetyRow(DEFAULT_SAFETY_CONTENT),
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed safety content: ${insertError.message}`);
  }

  return inserted as SafetyContentRow;
}

export async function GET() {
  try {
    const row = await getOrCreateSafetyRow();
    return NextResponse.json({ content: rowToSafetyContent(row) });
  } catch (error) {
    console.error("GET /api/safety failed:", error);
    return NextResponse.json(
      { error: "Failed to load safety content" },
      { status: 500 }
    );
  }
}