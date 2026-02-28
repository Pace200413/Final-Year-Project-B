import { NextResponse } from "next/server";
import { ensureFile, readJSON, writeJSON, slugify } from "@/lib/db";
import type { CampusEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = "events.json";

const SEED: CampusEvent[] = [
  {
    id: "orientation-briefing",
    title: "Orientation Briefing",
    category: "Orientation" as any,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    venue: { building: "Student Centre" } as any,
    description: "Welcome session and campus tour.",
    images: { thumbnail: "", hero: "" } as any,
    isPublished: true as any,
  } as any,
];

async function readAll(): Promise<CampusEvent[]> {
  await ensureFile(FILE, SEED);
  const items = await readJSON<CampusEvent[]>(FILE, []);
  items.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return items;
}

async function writeAll(items: CampusEvent[]) {
  await writeJSON(FILE, items);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const published = url.searchParams.get("published"); // "1" or "0" or null

  let items = await readAll();
  if (published === "1") items = items.filter((e) => e.isPublished !== false);

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<CampusEvent> | null;
  if (!body?.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const items = await readAll();

  const base = slugify(String(body.id ?? body.title));
  let id = base || `event-${Math.random().toString(36).slice(2, 8)}`;
  if (items.some((e) => e.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  const nowIso = new Date().toISOString();
  const startIso = body.date ? new Date(body.date).toISOString() : nowIso;
  const endIso = body.endDate ? new Date(body.endDate).toISOString() : startIso;

  const rec: CampusEvent = {
    ...(body as any),
    id,
    title: String(body.title),
    date: startIso,
    endDate: endIso,
    venue: (body.venue as any) ?? { building: "" },
    isPublished: body.isPublished !== false,
  } as any;

  items.push(rec);
  await writeAll(items);
  return NextResponse.json({ ok: true, item: rec });
}