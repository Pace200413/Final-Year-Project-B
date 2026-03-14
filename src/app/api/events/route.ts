import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_EVENTS_PAGE_CONTENT,
  contentToEventsPageRow,
  getPublishedEvents,
  rowToEventsPageContent,
  type EventsPageContentRow,
} from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOrCreateEventsPageRow() {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("events_page_content")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load events page content: ${error.message}`);
  }

  if (data) return data as EventsPageContentRow;

  const { data: inserted, error: insertError } = await db
    .from("events_page_content")
    .insert({
      id: "default",
      ...contentToEventsPageRow(DEFAULT_EVENTS_PAGE_CONTENT),
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed events page content: ${insertError.message}`);
  }

  return inserted as EventsPageContentRow;
}

export async function GET() {
  try {
    const row = await getOrCreateEventsPageRow();
    const content = rowToEventsPageContent(row);
    const items = getPublishedEvents(content.events);

    return NextResponse.json({
      content: {
        ...content,
        events: items,
      },
      items,
    });
  } catch (error) {
    console.error("GET /api/events failed:", error);
    return NextResponse.json(
      { error: "Failed to load events content" },
      { status: 500 }
    );
  }
}