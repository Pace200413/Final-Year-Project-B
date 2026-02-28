import { NextResponse } from "next/server";
import { ensureFile, readJSON, writeJSON, slugify } from "@/lib/db";
import type { ExitRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = "exits.json";

const SEED: ExitRecord[] = [
  {
    id: "adm-main",
    name: "Main Entrance - ADM Building",
    location: "ADM Building, Level 2",
    distance: "45m",
    estimatedTime: "1 minute",
    direction: "Head straight, then turn left near the stairwell",
    status: "Open",
    priority: 1,
  },
];

async function readAll(): Promise<ExitRecord[]> {
  await ensureFile(FILE, SEED);
  const list = await readJSON<ExitRecord[]>(FILE, []);
  return list.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
}

async function writeAll(list: ExitRecord[]) {
  await writeJSON(FILE, list);
}

export async function GET() {
  const items = await readAll();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<ExitRecord> | null;
  if (!body || !body.name || !body.location) {
    return NextResponse.json({ error: "name and location required" }, { status: 400 });
  }

  const items = await readAll();

  const id = slugify(String(body.id || body.name || "exit"));
  if (items.some((e) => e.id === id)) {
    return NextResponse.json({ error: "id exists" }, { status: 409 });
  }

  const rec: ExitRecord = {
    id,
    name: body.name,
    location: body.location,
    distance: body.distance ?? "",
    estimatedTime: body.estimatedTime ?? "",
    direction: body.direction ?? "",
    status: (body.status as ExitRecord["status"]) ?? "Open",
    priority: Number.isFinite(body.priority as number) ? Number(body.priority) : 1,
    lat: body.lat,
    lng: body.lng,
  };

  items.push(rec);
  await writeAll(items);
  return NextResponse.json({ ok: true, item: rec });
}