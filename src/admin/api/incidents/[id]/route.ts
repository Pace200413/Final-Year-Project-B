import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON } from "@/lib/db";
import { appendAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "Operational" | "Degraded" | "Outage" | "Maintenance";
type Incident = {
  id: string;
  service: string;
  status: Status;
  title: string;
  note?: string;
  at: string;
  severity?: "low" | "medium" | "high";
};

const FILE = "incidents.json";
async function readAll(): Promise<Incident[]> {
  await ensureFile(FILE, []);
  return await readJSON<Incident[]>(FILE, []);
}
async function writeAll(items: Incident[]) {
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
  const patch = (await req.json().catch(() => null)) as Partial<Incident> | null;
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const items = await readAll();
  const i = items.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next: Incident = {
    ...items[i],
    ...patch,
    id,
    at: new Date().toISOString(),
  };

  items[i] = next;
  await writeAll(items);
  await appendAudit(who(req), `Updated incident “${next.title}”`);

  return NextResponse.json({ ok: true, item: next });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const items = await readAll();
  const item = items.find((x) => x.id === id);
  const next = items.filter((x) => x.id !== id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeAll(next);
  await appendAudit(who(req), `Deleted incident “${item.title}”`);

  return NextResponse.json({ ok: true });
}