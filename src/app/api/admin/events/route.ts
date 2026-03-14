import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_EVENTS_PAGE_CONTENT,
  contentToEventsPageRow,
  diffEventsPageFields,
  normalizeEventsPageContent,
  rowToEventsPageContent,
  sortCampusEvents,
  stampEventsMetadata,
  type EventsPageContent,
  type EventsPageContentRow,
} from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["admin", "superadmin"];

async function requireAdmin() {
  const session = await auth();
  const authUserId = session?.user?.id ?? null;
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (!authUserId && !email) return null;

  const db = supabaseAdmin();

  const byAuth = authUserId
    ? await db
        .from("profiles")
        .select("auth_user_id, email, role")
        .eq("auth_user_id", authUserId)
        .maybeSingle()
    : null;

  if (byAuth?.error) {
    throw new Error(`Failed to verify admin profile: ${byAuth.error.message}`);
  }

  const byEmail =
    !byAuth?.data && email
      ? await db
          .from("profiles")
          .select("auth_user_id, email, role")
          .eq("email", email)
          .maybeSingle()
      : null;

  if (byEmail?.error) {
    throw new Error(`Failed to verify admin profile: ${byEmail.error.message}`);
  }

  const profile = byAuth?.data ?? byEmail?.data ?? null;
  const role = String(profile?.role ?? "").toLowerCase();

  if (!ADMIN_ROLES.includes(role)) return null;

  return {
    authUserId: String(profile?.auth_user_id ?? authUserId ?? ""),
    email: String(profile?.email ?? email ?? ""),
  };
}

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

async function getAudit() {
  const { data, error } = await supabaseAdmin()
    .from("events_page_audit")
    .select(
      "id, changed_at, changed_fields, changed_by_auth_user_id, changed_by_email"
    )
    .eq("events_page_id", "default")
    .order("changed_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to load events audit: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    changedAt: row.changed_at,
    changedFields: row.changed_fields ?? [],
    changedByAuthUserId: row.changed_by_auth_user_id,
    changedByEmail: row.changed_by_email,
  }));
}

export async function GET() {
  try {
    const actor = await requireAdmin();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await getOrCreateEventsPageRow();

    return NextResponse.json({
      content: rowToEventsPageContent(row),
      audit: await getAudit(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load events admin data",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireAdmin();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patch = (await req.json()) as Partial<EventsPageContent>;
    const currentRow = await getOrCreateEventsPageRow();
    const before = rowToEventsPageContent(currentRow);

    const afterDraft = normalizeEventsPageContent({
      ...before,
      ...patch,
      events: patch.events ?? before.events,
    });

    const sortedDraft: EventsPageContent = {
      ...afterDraft,
      events: sortCampusEvents(afterDraft.events),
    };

    const changedFields = diffEventsPageFields(before, sortedDraft);

    if (changedFields.length === 0) {
      return NextResponse.json({
        ok: true,
        content: sortedDraft,
        changedFields: [],
        audit: await getAudit(),
      });
    }

    const now = new Date().toISOString();

    const after: EventsPageContent = {
      ...sortedDraft,
      events: stampEventsMetadata(before.events, sortedDraft.events, now),
    };

    const { error: updateError } = await supabaseAdmin()
      .from("events_page_content")
      .upsert({
        id: "default",
        ...contentToEventsPageRow(after),
        updated_at: now,
        updated_by_auth_user_id: actor.authUserId,
        updated_by_email: actor.email,
      });

    if (updateError) {
      throw new Error(`Failed to update events page content: ${updateError.message}`);
    }

    const { error: auditError } = await supabaseAdmin()
      .from("events_page_audit")
      .insert({
        events_page_id: "default",
        changed_at: now,
        changed_by_auth_user_id: actor.authUserId,
        changed_by_email: actor.email,
        changed_fields: changedFields,
        before_state: before,
        after_state: after,
      });

    if (auditError) {
      throw new Error(`Failed to write events audit: ${auditError.message}`);
    }

    return NextResponse.json({
      ok: true,
      content: after,
      changedFields,
      audit: await getAudit(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update events page content",
      },
      { status: 500 }
    );
  }
}