import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON, slugify } from "@/lib/db";
import { appendAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "Operational" | "Degraded" | "Outage" | "Maintenance";
type Incident = {
  id: string;
  service: string;     // e.g. "Wi-Fi / Network"
  status: Status;      // Degraded / Outage / Maintenance
  title: string;       // short summary
  note?: string;       // longer detail
  at: string;          // ISO timestamp
  severity?: "low" | "medium" | "high";
};

const FILE = "incidents.json";
const SEED: Incident[] = [
  {
    id: "portal-login-failures",
    service: "Student Portal",
    status: "Degraded",
    title: "Portal login failures",
    note: "Intermittent authentication errors affecting some students.",
    at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: "medium",
  },
];

async function readAll(): Promise<Incident[]> {
  await ensureFile(FILE, SEED);
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const openOnly = url.searchParams.get("open") === "1";
  const items = await readAll();

  // Simple heuristic: treat Operational as "closed/ok"
  const filtered = openOnly ? items.filter((i) => i.status !== "Operational") : items;

  // newest first
  filtered.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return NextResponse.json({ items: filtered });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<Incident> | null;
  if (!body?.title || !body?.service) {
    return NextResponse.json({ error: "title and service are required" }, { status: 400 });
  }

  const items = await readAll();
  const base = slugify(String(body.id ?? body.title));
  let id = base || `incident-${Math.random().toString(36).slice(2, 8)}`;
  if (items.some((x) => x.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  const rec: Incident = {
    id,
    title: String(body.title),
    service: String(body.service),
    status: (body.status as Status) ?? "Degraded",
    note: body.note ? String(body.note) : undefined,
    at: new Date().toISOString(),
    severity: (body.severity as any) ?? "low",
  };

  items.push(rec);
  await writeAll(items);
  await appendAudit(who(req), `Created incident “${rec.title}” (${rec.service})`);

  return NextResponse.json({ ok: true, item: rec });
}