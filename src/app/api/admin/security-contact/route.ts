import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_SECURITY_CONTACT_CONTENT,
  contentToSecurityContactRow,
  diffSecurityContactFields,
  normalizeSecurityContactContent,
  rowToSecurityContactContent,
  type SecurityContactContent,
  type SecurityContactContentRow,
} from "@/lib/security-contact";

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

async function getAudit() {
  const { data, error } = await supabaseAdmin()
    .from("security_contact_audit")
    .select("id, changed_at, changed_fields, changed_by_auth_user_id, changed_by_email")
    .eq("security_contact_id", "default")
    .order("changed_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to load security contact audit: ${error.message}`);
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
      content: rowToSecurityContactContent(row),
      audit: await getAudit(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load security contact admin data",
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

    const patch = (await req.json()) as Partial<SecurityContactContent>;
    const currentRow = await getOrCreateRow();
    const before = rowToSecurityContactContent(currentRow);

    const after = normalizeSecurityContactContent({
      ...before,
      ...patch,
      steps: patch.steps ?? before.steps,
      contacts: patch.contacts ?? before.contacts,
      bottomCards: patch.bottomCards ?? before.bottomCards,
    });

    const changedFields = diffSecurityContactFields(before, after);

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
      .from("security_contact_content")
      .upsert({
        id: "default",
        ...contentToSecurityContactRow(after),
        updated_at: now,
        updated_by_auth_user_id: actor.authUserId,
        updated_by_email: actor.email,
      });

    if (updateError) {
      throw new Error(`Failed to update security contact content: ${updateError.message}`);
    }

    const { error: auditError } = await supabaseAdmin()
      .from("security_contact_audit")
      .insert({
        security_contact_id: "default",
        changed_at: now,
        changed_by_auth_user_id: actor.authUserId,
        changed_by_email: actor.email,
        changed_fields: changedFields,
        before_state: before,
        after_state: after,
      });

    if (auditError) {
      throw new Error(`Failed to write security contact audit: ${auditError.message}`);
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
            : "Failed to update security contact content",
      },
      { status: 500 }
    );
  }
}