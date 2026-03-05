import { NextResponse, type NextRequest } from "next/server";
import { ensureFile, readJSON, writeJSON } from "@/lib/db";
import { appendAudit } from "@/admin/api/_audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Analytics = {
  activeUsersToday: number;
  peakHour: string;
  mostAccessed: string;
  avgResolutionHrs: number;
};

const FILE = "analytics.json";
const SEED: Analytics = {
  activeUsersToday: 0,
  peakHour: "11:00",
  mostAccessed: "Wi-Fi / Network",
  avgResolutionHrs: 3.2,
};

async function readOne(): Promise<Analytics> {
  await ensureFile(FILE, SEED);
  return await readJSON<Analytics>(FILE, SEED);
}
async function writeOne(x: Analytics) {
  await writeJSON(FILE, x);
}

function who(req: NextRequest) {
  return (
    req.headers.get("x-admin-user") ||
    req.cookies.get("email")?.value ||
    req.cookies.get("user")?.value ||
    "admin"
  );
}

export async function GET() {
  const item = await readOne();
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const patch = (await req.json().catch(() => null)) as Partial<Analytics> | null;
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const cur = await readOne();
  const next: Analytics = {
    ...cur,
    ...patch,
    activeUsersToday: patch.activeUsersToday != null ? Number(patch.activeUsersToday) : cur.activeUsersToday,
    avgResolutionHrs: patch.avgResolutionHrs != null ? Number(patch.avgResolutionHrs) : cur.avgResolutionHrs,
  };

  await writeOne(next);
  await appendAudit(who(req), "Updated analytics snapshot");
  return NextResponse.json({ ok: true, item: next });
}

export async function POST(req: NextRequest) {
  // allow POST as alias of PATCH
  return PATCH(req);
}