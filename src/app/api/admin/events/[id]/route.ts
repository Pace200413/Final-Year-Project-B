import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON } from "@/lib/db";
import type { CampusEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = "events.json";

async function readAll(): Promise<CampusEvent[]> {
  await ensureFile(FILE, []);
  return await readJSON<CampusEvent[]>(FILE, []);
}
async function writeAll(items: CampusEvent[]) {
  await writeJSON(FILE, items);
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const items = await readAll();
  const item = items.find((e) => e.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const patch = (await req.json().catch(() => null)) as Partial<CampusEvent> | null;
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const items = await readAll();
  const i = items.findIndex((e) => e.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next = { ...items[i], ...patch, id } as any;

  if (patch.date) next.date = new Date(patch.date).toISOString();
  if (patch.endDate) next.endDate = new Date(patch.endDate).toISOString();

  items[i] = next;
  await writeAll(items);

  return NextResponse.json({ ok: true, item: next });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const items = await readAll();
  const next = items.filter((e) => e.id !== id);

  if (next.length === items.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeAll(next);
  return NextResponse.json({ ok: true });
}