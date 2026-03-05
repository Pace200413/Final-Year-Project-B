import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON, slugify } from "@/lib/db";
import { appendAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Banner = {
  id: string;
  title: string;
  message: string;
  startAt: string;
  endAt?: string | null;
  campuses: string[]; // ["Swinburne Sarawak"]
  active: boolean;    // published / live flag
};

const FILE = "banners.json";
const SEED: Banner[] = [
  {
    id: "power-maintenance",
    title: "Power maintenance",
    message: "Scheduled power maintenance tonight 10pm–12am. Some services may be unavailable.",
    startAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    campuses: ["Swinburne Sarawak"],
    active: true,
  },
];

async function readAll(): Promise<Banner[]> {
  await ensureFile(FILE, SEED);
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const activeOnly = url.searchParams.get("active") === "1";

  const items = await readAll();
  const list = activeOnly ? items.filter((b) => b.active) : items;

  // most recent start first
  list.sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
  return NextResponse.json({ items: list });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<Banner> | null;
  if (!body?.title || !body?.message) {
    return NextResponse.json({ error: "title and message are required" }, { status: 400 });
  }

  const items = await readAll();
  const base = slugify(String(body.id ?? body.title));
  let id = base || `banner-${Math.random().toString(36).slice(2, 8)}`;
  if (items.some((x) => x.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  const rec: Banner = {
    id,
    title: String(body.title),
    message: String(body.message),
    startAt: body.startAt ? new Date(body.startAt).toISOString() : new Date().toISOString(),
    endAt: body.endAt ? new Date(body.endAt).toISOString() : null,
    campuses: Array.isArray(body.campuses) ? body.campuses.map(String) : ["Swinburne Sarawak"],
    active: body.active !== false,
  };

  items.push(rec);
  await writeAll(items);
  await appendAudit(who(req), `Published banner “${rec.title}”`);

  return NextResponse.json({ ok: true, item: rec });
}