import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";
import {
  contentToRow,
  DEFAULT_EMERGENCY_CONTENT,
  diffEmergencyFields,
  normalizeEmergencyContent,
  rowToEmergencyContent,
  type EmergencyContent,
  type EmergencyContentRow,
} from "@/lib/emergency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["admin", "superadmin"];

async function requireAdmin() {
  const session = await auth();
  const authUserId = session?.user?.id ?? null;
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (!authUserId && !email) return null;

  const db = supabaseAdmin();

  const byAuth =
    authUserId
      ? await db
          .from("profiles")
          .select("auth_user_id, email, role")
          .eq("auth_user_id", authUserId)
          .maybeSingle()
      : null;

  if (byAuth?.error) {
    throw new Error(`Failed to verify admin profile: ${byAuth.error.message}`);
  }

  const profile =
    byAuth?.data ??
    (email
      ? (
          await db
            .from("profiles")
            .select("auth_user_id, email, role")
            .eq("email", email)
            .maybeSingle()
        ).data
      : null);

  const role = String(profile?.role ?? "").toLowerCase();

  if (!ADMIN_ROLES.includes(role)) return null;

  return {
    authUserId: String(profile?.auth_user_id ?? authUserId ?? ""),
    email: String(profile?.email ?? email ?? ""),
    role,
  };
}

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

async function getAudit() {
  const { data, error } = await supabaseAdmin()
    .from("emergency_audit")
    .select("id, changed_at, changed_fields, changed_by_auth_user_id, changed_by_email")
    .eq("emergency_id", "default")
    .order("changed_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to load emergency audit: ${error.message}`);
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

    const row = await getOrCreateEmergencyRow();
    const audit = await getAudit();

    return NextResponse.json({
      content: rowToEmergencyContent(row),
      audit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load emergency admin data" },
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

    const patch = (await req.json()) as Partial<EmergencyContent>;
    const currentRow = await getOrCreateEmergencyRow();
    const before = rowToEmergencyContent(currentRow);

    const after = normalizeEmergencyContent({
      ...before,
      ...patch,
      quickTiles: patch.quickTiles ?? before.quickTiles,
      moreHelpCards: patch.moreHelpCards ?? before.moreHelpCards,
      howToSteps: patch.howToSteps ?? before.howToSteps,
    });

    const changedFields = diffEmergencyFields(before, after);

    if (changedFields.length === 0) {
      return NextResponse.json({
        ok: true,
        content: after,
        changedFields: [],
        audit: await getAudit(),
      });
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin()
      .from("emergency_content")
      .upsert({
        id: "default",
        ...contentToRow(after),
        updated_at: now,
        updated_by_auth_user_id: actor.authUserId,
        updated_by_email: actor.email,
      });

    if (updateError) {
      throw new Error(`Failed to update emergency content: ${updateError.message}`);
    }

    const { error: auditError } = await supabaseAdmin()
      .from("emergency_audit")
      .insert({
        emergency_id: "default",
        changed_at: now,
        changed_by_auth_user_id: actor.authUserId,
        changed_by_email: actor.email,
        changed_fields: changedFields,
        before_state: before,
        after_state: after,
      });

    if (auditError) {
      throw new Error(`Failed to write emergency audit: ${auditError.message}`);
    }

    return NextResponse.json({
      ok: true,
      content: after,
      changedFields,
      audit: await getAudit(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update emergency content" },
      { status: 500 }
    );
  }
}