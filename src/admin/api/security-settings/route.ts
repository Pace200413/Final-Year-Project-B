import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIR  = path.join(process.cwd(), "src", "data");
const FILE = path.join(DIR, "security-settings.json");

type Contact = { name: string; phone: string };
type Card = { title: string; description: string; href: string; linkText?: string };
type Settings = {
  emergencyLabel: string; emergencyTel: string;
  exitNavLabel: string;  exitNavUrl: string;
  title: string; subtitle: string; alertText: string;
  exitGuide: { locationText: string; nearestExitText: string; linkText: string; linkHref: string };
  contacts: Contact[]; bottomCards: Card[];
};

const DEFAULTS: Settings = {
  emergencyLabel: "Emergency 999",
  emergencyTel: "999",
  exitNavLabel: "Go to Exit Navigation",
  exitNavUrl: "/exit-navigation",
  title: "Security & Emergency",
  subtitle: "Campus emergency resources, contacts, and guidance.",
  alertText: "Stay calm during emergencies. Follow instructions from campus security and use the nearest safe exit.",
  exitGuide: {
    locationText: "Your location will appear here.",
    nearestExitText: "Nearest exit will be suggested automatically.",
    linkText: "Open Exit Navigation →",
    linkHref: "/exit-navigation",
  },
  contacts: [
    { name: "Campus Security", phone: "082260607" },
    { name: "Emergency Services", phone: "999" },
    { name: "Health Clinic",    phone: "082260620" },
  ],
  bottomCards: [
    { title: "Safety Protocols", description: "Know what to do in fire, medical, and personal safety situations.", href: "/safety",           linkText: "View protocols" },
    { title: "Exit Navigation",  description: "Find the nearest exit and view status in real time.",              href: "/exit-navigation", linkText: "Open navigation" },
  ],
};

async function ensure() {
  await mkdir(DIR, { recursive: true });
  try { await readFile(FILE, "utf8"); }
  catch { await writeFile(FILE, JSON.stringify(DEFAULTS, null, 2), "utf8"); }
}
async function readSettings(): Promise<Settings> {
  await ensure();
  const raw = await readFile(FILE, "utf8").catch(() => JSON.stringify(DEFAULTS));
  return JSON.parse(raw) as Settings;
}
async function writeSettings(s: Settings) {
  await ensure();
  await writeFile(FILE, JSON.stringify(s, null, 2), "utf8");
}

export async function GET() {
  return NextResponse.json({ settings: await readSettings() });
}
export async function PATCH(req: Request) {
  const patch = (await req.json()) as Partial<Settings>;
  const next = { ...(await readSettings()), ...patch } as Settings;
  await writeSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
