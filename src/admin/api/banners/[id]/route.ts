import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON } from "@/lib/db";
import { appendAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Banner = {
  id: string;
  title: string;
  message: string;
  startAt: string;
  endAt?: string | null;
  campuses: string[];
  active: boolean;
};

const FILE = "banners.json";
async function readAll(): Promise<Banner[]> {
  await ensureFile(FILE, []);
  return await readJSON<Banner[]>(FILE, []);
}
async function writeAll(items: Banner[]) {
  await writeJSON(FILE, items);
}

function who(req: NextRequest) {
  return (
    req.headers.get("x-admin-user") ||
    req.cookies.get("email")?.value ||
    req.cookies.get("user")?.value ||
    "admin"
  );
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const items = await readAll();
  const item = items.find((x) => x.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const patch = (await req.json().catch(() => null)) as Partial<Banner> | null;
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const items = await readAll();
  const i = items.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next: Banner = {
    ...items[i],
    ...patch,
    id,
    startAt: patch.startAt ? new Date(patch.startAt).toISOString() : items[i].startAt,
    endAt: patch.endAt ? new Date(patch.endAt).toISOString() : items[i].endAt ?? null,
    campuses: Array.isArray(patch.campuses) ? patch.campuses.map(String) : items[i].campuses,
    active: patch.active != null ? !!patch.active : items[i].active,
  };

  items[i] = next;
  await writeAll(items);

  await appendAudit(who(req), `Updated banner “${next.title}”`);
  return NextResponse.json({ ok: true, item: next });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const items = await readAll();
  const item = items.find((x) => x.id === id);
  const next = items.filter((x) => x.id !== id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeAll(next);
  await appendAudit(who(req), `Deleted banner “${item.title}”`);

  return NextResponse.json({ ok: true });
}