import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_SUPPORT_PAGE_CONTENT,
  contentToSupportPageRow,
  diffSupportPageFields,
  normalizeSupportPageContent,
  rowToSupportPageContent,
  type SupportPageContent,
  type SupportPageContentRow,
} from "@/lib/support-page";

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

async function getAudit() {
  const { data, error } = await supabaseAdmin()
    .from("support_page_audit")
    .select("id, changed_at, changed_fields, changed_by_auth_user_id, changed_by_email")
    .eq("support_page_id", "default")
    .order("changed_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to load support page audit: ${error.message}`);
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

    const row = await getOrCreateRow();

    return NextResponse.json({
      content: rowToSupportPageContent(row),
      audit: await getAudit(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load support page admin data",
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

    const patch = (await req.json()) as Partial<SupportPageContent>;
    const currentRow = await getOrCreateRow();
    const before = rowToSupportPageContent(currentRow);

    const after = normalizeSupportPageContent({
      ...before,
      ...patch,
      status: patch.status ?? before.status,
      services: patch.services ?? before.services,
    });

    const changedFields = diffSupportPageFields(before, after);

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
      .from("support_page_content")
      .upsert({
        id: "default",
        ...contentToSupportPageRow(after),
        updated_at: now,
        updated_by_auth_user_id: actor.authUserId,
        updated_by_email: actor.email,
      });

    if (updateError) {
      throw new Error(`Failed to update support page content: ${updateError.message}`);
    }

    const { error: auditError } = await supabaseAdmin()
      .from("support_page_audit")
      .insert({
        support_page_id: "default",
        changed_at: now,
        changed_by_auth_user_id: actor.authUserId,
        changed_by_email: actor.email,
        changed_fields: changedFields,
        before_state: before,
        after_state: after,
      });

    if (auditError) {
      throw new Error(`Failed to write support page audit: ${auditError.message}`);
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
            : "Failed to update support page content",
      },
      { status: 500 }
    );
  }
}