import { NextResponse } from "next/server";
import { z } from "zod";
import { store, type SupportRequest } from "@/lib/db";

// --- very small in-memory sliding-window limiter (dev-friendly) ---
const WINDOW_MS = 60_000; // 1 min
const MAX_REQS = 8;
const hits: Map<string, number[]> = new Map();

function getIp(req: Request) {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  // fallback (not always available in serverless)
  return h.get("x-real-ip") || "anon";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(ts => now - ts < WINDOW_MS);
  if (arr.length >= MAX_REQS) return false;
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

// --- schema & helpers ---
const Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  category: z.string().default("General"),
  message: z.string().min(1, "Message is required"),
  // honeypot (must be empty)
  company: z.string().optional(),
});

export async function GET() {
  return NextResponse.json({ items: store.requests });
}

export async function POST(req: Request) {
  const ip = getIp(req);
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const ct = (req.headers.get("content-type") || "").toLowerCase();

  let raw: Record<string, unknown> = {};
  try {
    if (ct.includes("application/json")) {
      raw = await req.json();
    } else if (ct.startsWith("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      raw = Object.fromEntries((await req.formData()).entries());
    } else {
      // try both, be lenient
      try { raw = await req.json(); }
      catch { raw = Object.fromEntries((await req.formData()).entries()); }
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Invalid data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // honeypot trip?
  if (parsed.data.company) {
    return NextResponse.json({ ok: true }, { status: 204 });
  }

  const { name, email, category, message } = parsed.data;

  const item: SupportRequest = {
    id: crypto.randomUUID(),
    name,
    email,
    category,
    message,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  store.requests.unshift(item);
  return NextResponse.json({ id: item.id }, { status: 201 });
}
