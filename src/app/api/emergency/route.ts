import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import {
  contentToRow,
  DEFAULT_EMERGENCY_CONTENT,
  rowToEmergencyContent,
  type EmergencyContentRow,
} from "@/lib/emergency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOrCreateEmergencyRow() {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("emergency_content")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load emergency content: ${error.message}`);
  }

  if (data) return data as EmergencyContentRow;

  const { data: inserted, error: insertError } = await db
    .from("emergency_content")
    .insert({
      id: "default",
      ...contentToRow(DEFAULT_EMERGENCY_CONTENT),
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed emergency content: ${insertError.message}`);
  }

  return inserted as EmergencyContentRow;
}

export async function GET() {
  try {
    const row = await getOrCreateEmergencyRow();
    return NextResponse.json({ content: rowToEmergencyContent(row) });
  } catch {
    return NextResponse.json({ content: DEFAULT_EMERGENCY_CONTENT });
  }
}