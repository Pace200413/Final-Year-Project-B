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

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);

    const row = await getOrCreateEventsPageRow();
    const content = rowToEventsPageContent(row);
    const item = getPublishedEvents(content.events).find((event) => event.id === id);

    if (!item) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("GET /api/events/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 }
    );
  }
}