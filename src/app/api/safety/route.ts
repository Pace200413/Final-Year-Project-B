// src/app/api/safety/route.ts
import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "src", "data");
const FILE = path.join(DIR, "safety.json");

const DEFAULTS = {
  emergencyNumber: "999",
  securityNumber: "082260607",
  itHelpEmail: "helpdesk@swin.edu.my",
  reportUrl: "/support",
  sections: [
    { id:"fire-safety", group:"General", title:"Fire Safety", text:"Remain calm and evacuate. Use stairs, not lifts. Follow exit signs and assist others if safe.", link:"/exit-navigation", linkLabel:"Open Exit Navigation" },
    { id:"personal-safety", group:"General", title:"Personal Safety", text:"Stay alert; avoid isolated areas late at night. If you feel unsafe, call Campus Security immediately.", link:"tel:082260607", linkLabel:"Call Security" },
    { id:"medical", group:"General", title:"Medical Emergencies", text:"For urgent help call 999 or Campus Security (082-260-607). Provide your location and stay on the line.", link:"tel:999", linkLabel:"Call 999" },
    { id:"labs", group:"Labs & Environment", title:"Laboratory Safety", text:"Wear PPE and follow instructions. Report spills or incidents at once. Do not work alone." },
    { id:"weather", group:"Labs & Environment", title:"Weather & Environmental Hazards", text:"During severe weather, stay indoors and follow campus alerts. Avoid flooded areas." },
    { id:"info-counter", group:"Visitor & Student Help", title:"Information Counter", text:"ADM Building lobby, weekdays 8:30–17:00. Get directions, passes, and assistance." },
    { id:"student-support", group:"Visitor & Student Help", title:"Student Support Centre", text:"Need help with housing or wellbeing? Call 082-260-610." },
    { id:"lost-found", group:"Lost & Found", title:"Report Lost Items", text:"Visit Campus Security Office or call 082-260-607. Items are held up to 30 days.", link:"tel:082260607", linkLabel:"Call Security" },
    { id:"clinic", group:"Health & Wellness", title:"On-Campus Clinic", text:"Open Mon–Fri, 9:00–16:00. Next to the Student Centre." },
    { id:"counselling", group:"Health & Wellness", title:"Counselling", text:"Confidential support via counselling@swin.edu.my or 082-260-620.", link:"mailto:counselling@swin.edu.my", linkLabel:"Email Counselling" },
    { id:"shuttle", group:"Transport & Night Escort", title:"Campus Shuttle", text:"Free shuttle runs 8:00–18:00 between main buildings." },
    { id:"parking", group:"Transport & Night Escort", title:"Visitor Parking", text:"Parking near ADM Building; permits at the Information Counter." },
    { id:"escort", group:"Transport & Night Escort", title:"Security Escort (Night)", text:"Security escorts are available after dark between buildings.", link:"tel:082260607", linkLabel:"Request Escort" },
  ],
};

async function ensure() {
  await mkdir(DIR, { recursive: true });
  try { await readFile(FILE, "utf8"); }
  catch { await writeFile(FILE, JSON.stringify(DEFAULTS, null, 2), "utf8"); }
}
async function readOne() {
  await ensure();
  const raw = await readFile(FILE, "utf8").catch(() => JSON.stringify(DEFAULTS));
  return JSON.parse(raw);
}
async function writeOne(v: any) {
  await ensure();
  await writeFile(FILE, JSON.stringify(v, null, 2), "utf8");
}

export async function GET() {
  return NextResponse.json(await readOne());
}

export async function PATCH(req: Request) {
  const patch = await req.json();
  const current = await readOne();
  const next = { ...current, ...patch };
  if (!("sections" in patch)) next.sections = current.sections;
  await writeOne(next);
  return NextResponse.json(next);
}
