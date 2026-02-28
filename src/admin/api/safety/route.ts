import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "src", "data");
const FILE = path.join(DIR, "safety.json");

type SafetySection = {
  id: string;
  group: string;
  title: string;
  text: string;
  link?: string;
  linkLabel?: string;
};
type SafetyData = {
  emergencyNumber: string;
  securityNumber: string;
  itHelpEmail: string;
  reportUrl: string;
  sections: SafetySection[];
};

const DEFAULTS: SafetyData = {
  emergencyNumber: "999",
  securityNumber: "082260607",
  itHelpEmail: "helpdesk@swin.edu.my",
  reportUrl: "/support",
  sections: [],
};

async function ensure() {
  await mkdir(DIR, { recursive: true });
  try {
    await readFile(FILE, "utf8");
  } catch {
    await writeFile(FILE, JSON.stringify(DEFAULTS, null, 2), "utf8");
  }
}
async function readOne(): Promise<SafetyData> {
  await ensure();
  const raw = await readFile(FILE, "utf8").catch(() => JSON.stringify(DEFAULTS));
  return { ...DEFAULTS, ...(JSON.parse(raw) as SafetyData) };
}
async function writeOne(v: SafetyData) {
  await ensure();
  await writeFile(FILE, JSON.stringify(v, null, 2), "utf8");
}

export async function GET() {
  return NextResponse.json(await readOne());
}

export async function PATCH(req: Request) {
  const patch = (await req.json()) as Partial<SafetyData>;
  const merged = { ...(await readOne()), ...patch };
  await writeOne(merged);
  return NextResponse.json(merged);
}
