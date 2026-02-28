import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIR  = path.join(process.cwd(), "src", "data");
const FILE = path.join(DIR, "support-settings.json");

const DEFAULTS = {
  alert: { text: "Need urgent help? Call Campus Security", phone: "082-260-607", cta: "Call now" },
  status: [
    { name: "Canvas", ok: true, href: "/support/canvas-status" },
    { name: "Student Portal", ok: true, href: "/support/student-portal" },
    { name: "Wi-Fi", ok: true, href: "/support/wifi" },
  ],
  shortcuts: [
    { label: "Login issue", cat: "IT Support", q: "login canvas portal password" },
    { label: "Wi-Fi not working", cat: "IT Support", q: "wifi network internet" },
    { label: "Classroom equipment", cat: "Facilities", q: "projector ac classroom" },
    { label: "Counselling", cat: "Wellbeing", q: "counselling wellbeing" },
    { label: "Emergency", cat: "Safety", q: "emergency security" },
    { label: "Library help", cat: "Academic", q: "library referencing" },
  ],
  services: [
    { slug: "it-service-desk",     name: "IT Service Desk",    category: "IT Support", hours: "Mon–Fri 9:00–17:00", desc: "Accounts, Wi-Fi, Canvas, Student Portal issues.", email: "helpdesk@swin.edu.my" },
    { slug: "facilities-helpdesk", name: "Facilities Helpdesk", category: "Facilities", hours: "Mon–Fri 9:00–17:00", desc: "Air-con, lighting, classroom equipment, maintenance.", email: "facilities@swin.edu.my" },
    { slug: "campus-security",     name: "Campus Security",     category: "Safety",     hours: "24/7", desc: "Emergencies & safety on campus.", phone: "082-260-607" },
    { slug: "student-wellbeing",   name: "Student Wellbeing",   category: "Wellbeing",  hours: "Mon–Fri 9:00–17:00", desc: "Counselling, wellbeing support, referrals.", email: "counselling@swin.edu.my" },
    { slug: "library-help",        name: "Library Help",        category: "Academic",   hours: "Mon–Fri 9:00–17:00", desc: "Library services, research help, referencing.", href: "/support/library" },
  ],
  faqs: [
    { q: "I can't log into Canvas or the Student Portal.", a: "Reset your password via Microsoft login first. If it persists, contact IT with your student ID and a screenshot.", tags: ["it","canvas","login","password","portal"] },
    { q: "The classroom AC or projector isn't working.",   a: "Log a ticket with Facilities and include the room number and photo/video.", tags: ["facilities","classroom","ac","projector"] },
    { q: "Who do I call in an emergency?",                 a: "Dial Campus Security (082-260-607). For off-campus, use national emergency services.", tags: ["safety","emergency","security"] },
    { q: "How do I connect to campus Wi-Fi?",              a: "Connect to 'Swinburne-Student' with your student credentials. If issues, forget & reconnect or contact IT.", tags: ["wifi","internet"] },
  ],
  routing: {
    General: "default@swin.edu.my",
    "IT Support": "helpdesk@swin.edu.my",
    Facilities: "facilities@swin.edu.my",
    Safety: "security@swin.edu.my",
    Wellbeing: "counselling@swin.edu.my",
    Academic: "library@swin.edu.my"
  }
};

async function ensure() {
  await mkdir(DIR, { recursive: true });
  try { await readFile(FILE, "utf8"); }
  catch { await writeFile(FILE, JSON.stringify(DEFAULTS, null, 2), "utf8"); }
}

export async function GET() {
  await ensure();
  const raw = await readFile(FILE, "utf8");
  return NextResponse.json(JSON.parse(raw));
}

export async function PATCH(req: Request) {
  await ensure();
  const patch = await req.json().catch(() => ({}));
  const current = JSON.parse(await readFile(FILE, "utf8"));
  const next = { ...current, ...patch };
  await writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
  return NextResponse.json(next);
}
