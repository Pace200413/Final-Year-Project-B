import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db";
import { cloneCmsContent, getCmsPageConfig } from "@/lib/page-cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const ADMIN_ROLES = ["admin", "superadmin"];

function diffTopLevelKeys(prev: any, next: any): string[] {
  const keys = new Set([
    ...Object.keys(prev ?? {}),
    ...Object.keys(next ?? {}),
  ]);

  return [...keys].filter(
    (key) => JSON.stringify(prev?.[key]) !== JSON.stringify(next?.[key])
  );
}

async function requireAdmin() {
  const session = await auth().catch(() => null);
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

async function getOrCreatePageRow(
  slug: string,
  actor?: { authUserId: string; email: string } | null
) {
  const config = getCmsPageConfig(slug);
  if (!config) return null;

  const db = supabaseAdmin();

  const { data, error } = await db
    .from(config.contentTable)
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load ${slug}: ${error.message}`);
  }

  if (data) return { config, row: data };

  const { data: inserted, error: insertError } = await db
    .from(config.contentTable)
    .insert({
      id: "default",
      content: cloneCmsContent(config.defaultContent),
      updated_by_auth_user_id: actor?.authUserId ?? null,
      updated_by_email: actor?.email ?? null,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to seed ${slug}: ${insertError.message}`);
  }

  return { config, row: inserted };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAdmin();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const result = await getOrCreatePageRow(slug, actor);

    if (!result) {
      return NextResponse.json({ error: "Unknown page" }, { status: 404 });
    }

    return NextResponse.json({
      slug,
      title: result.config.title,
      content: result.row.content,
      updatedAt: result.row.updated_at ?? null,
      updatedByEmail: result.row.updated_by_email ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load CMS page",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await requireAdmin();
    if (!actor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const result = await getOrCreatePageRow(slug, actor);

    if (!result) {
      return NextResponse.json({ error: "Unknown page" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const nextContent = body?.content;

    if (!nextContent || typeof nextContent !== "object") {
      return NextResponse.json(
        { error: "content object required" },
        { status: 400 }
      );
    }

    const prevContent = result.row.content ?? {};
    const changedFields = diffTopLevelKeys(prevContent, nextContent);

    const db = supabaseAdmin();

    const { data: updated, error: updateError } = await db
      .from(result.config.contentTable)
      .update({
        content: nextContent,
        updated_at: new Date().toISOString(),
        updated_by_auth_user_id: actor.authUserId,
        updated_by_email: actor.email,
      })
      .eq("id", "default")
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: auditError } = await db
      .from(result.config.auditTable)
      .insert({
        changed_by_auth_user_id: actor.authUserId,
        changed_by_email: actor.email,
        changed_fields: changedFields,
        previous_content: prevContent,
        next_content: nextContent,
      });

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      slug,
      content: updated.content,
      updatedAt: updated.updated_at ?? null,
      changedFields,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update CMS page",
      },
      { status: 500 }
    );
  }
}