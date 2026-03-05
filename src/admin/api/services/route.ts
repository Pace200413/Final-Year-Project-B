import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON, slugify } from "@/lib/db";
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
  sla?: string; // optional nice-to-have for dashboard
};

const FILE = "services.json";
const SEED: Service[] = [
  { id: "wifi-network", name: "Wi-Fi / Network", owner: "IT Helpdesk", status: "Operational", dependencies: [], incidentsOpen: 0, updatedAt: new Date().toISOString(), sla: "8×5" },
  { id: "student-portal", name: "Student Portal", owner: "IT Helpdesk", status: "Degraded", dependencies: [], incidentsOpen: 1, updatedAt: new Date().toISOString(), sla: "24×7" },
];

async function readAll(): Promise<Service[]> {
  await ensureFile(FILE, SEED);
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const degradedOnly = url.searchParams.get("degraded") === "1";

  const items = await readAll();
  const list = degradedOnly
    ? items.filter((s) => s.status === "Degraded" || s.status === "Outage")
    : items;

  list.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ items: list });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<Service> | null;
  if (!body?.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const items = await readAll();
  const base = slugify(String(body.id ?? body.name));
  let id = base || `service-${Math.random().toString(36).slice(2, 8)}`;
  if (items.some((x) => x.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  const rec: Service = {
    id,
    name: String(body.name),
    owner: body.owner ? String(body.owner) : undefined,
    status: (body.status as any) ?? "Operational",
    dependencies: Array.isArray(body.dependencies) ? body.dependencies.map(String) : [],
    incidentsOpen: Number(body.incidentsOpen ?? 0),
    updatedAt: new Date().toISOString(),
    sla: body.sla ? String(body.sla) : undefined,
  };

  items.push(rec);
  await writeAll(items);
  await appendAudit(who(req), `Created service “${rec.name}”`);

  return NextResponse.json({ ok: true, item: rec });
}