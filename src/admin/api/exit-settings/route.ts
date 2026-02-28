import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/db";
import type { ExitSettings } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = "exit-settings.json";
const DEFAULTS: ExitSettings = {
  emergencyNumber: "999",
  ctaLink: "/exit-navigation",
  defaultLocation: "ADM Building, Level 2",
  pickFirstOpen: true,
  showClosed: true,
  showSearch: true,
};

export async function GET() {
  const settings = await readJSON<ExitSettings>(FILE, DEFAULTS);
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const patch = await req.json() as Partial<ExitSettings>;
  const current = await readJSON<ExitSettings>(FILE, DEFAULTS);
  const next = { ...current, ...patch };
  await writeJSON(FILE, next);
  return NextResponse.json({ ok: true, settings: next });
}
