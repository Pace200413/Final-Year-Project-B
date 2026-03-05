import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON } from "@/lib/db";
import { appendAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "Operational" | "Degraded" | "Outage" | "Maintenance";
type Service = {
  id: string;
  name: string;
  owner?: string;
  status: Status;
  dependencies: string[];
  incidentsOpen: number;
  updatedAt: string;
  sla?: string;
};

const FILE = "services.json";
async function readAll(): Promise<Service[]> {
  await ensureFile(FILE, []);
  return await readJSON<Service[]>(FILE, []);
}
async function writeAll(items: Service[]) {
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
  const patch = (await req.json().catch(() => null)) as Partial<Service> | null;
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const items = await readAll();
  const i = items.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next: Service = {
    ...items[i],
    ...patch,
    id,
    dependencies: Array.isArray(patch.dependencies)
      ? patch.dependencies.map(String)
      : items[i].dependencies,
    incidentsOpen: patch.incidentsOpen != null ? Number(patch.incidentsOpen) : items[i].incidentsOpen,
    updatedAt: new Date().toISOString(),
  };

  items[i] = next;
  await writeAll(items);
  await appendAudit(who(req), `Updated service “${next.name}”`);

  return NextResponse.json({ ok: true, item: next });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const items = await readAll();
  const item = items.find((x) => x.id === id);
  const next = items.filter((x) => x.id !== id);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeAll(next);
  await appendAudit(who(req), `Deleted service “${item.name}”`);

  return NextResponse.json({ ok: true });
}