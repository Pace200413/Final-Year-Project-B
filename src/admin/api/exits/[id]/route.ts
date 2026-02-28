import { NextResponse, type NextRequest } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";
import type { ExitRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const FILE = "exits.json";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const items = await readJSON<ExitRecord[]>(FILE, []);
  const item = items.find((e) => e.id === id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const patch = (await req.json()) as Partial<ExitRecord>;
  const items = await readJSON<ExitRecord[]>(FILE, []);
  const i = items.findIndex((e) => e.id === id);

  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextPriority =
    typeof patch.priority === "number" && Number.isFinite(patch.priority)
      ? patch.priority
      : items[i].priority;

  items[i] = { ...items[i], ...patch, id, priority: nextPriority };

  await writeJSON(FILE, items);
  return NextResponse.json({ ok: true, item: items[i] });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const items = await readJSON<ExitRecord[]>(FILE, []);
  const next = items.filter((e) => e.id !== id);

  if (next.length === items.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeJSON(FILE, next);
  return NextResponse.json({ ok: true });
}