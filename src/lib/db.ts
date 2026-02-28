// lib/db.ts
import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { CampusEvent, EventCategory, SupportRequest } from "@/lib/types";
export type { SupportRequest } from "@/lib/types"; // ✅ so `type SupportRequest` can be imported from "@/lib/db"

/* ------------------------------------------------------------------ */
/* Supabase (server-safe)                                              */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// support both names you used across files:
const SUPABASE_SERVICE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

let _anonClient: SupabaseClient | null = null;
export function supabaseAnon() {
  if (_anonClient) return _anonClient;

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", SUPABASE_ANON);

  _anonClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _anonClient;
}

let _adminClient: SupabaseClient | null = null;
export function supabaseAdmin() {
  if (_adminClient) return _adminClient;

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
  const service = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE)",
    SUPABASE_SERVICE
  );

  _adminClient = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _adminClient;
}

/* ------------------------------------------------------------------ */
/* File JSON DB (fsdb.ts)                                              */
/* ------------------------------------------------------------------ */

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

function fullPath(file: string) {
  const safe = file.replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(DATA_DIR, safe);
}

export async function readJSON<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await readFile(fullPath(file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON(file: string, data: unknown) {
  await ensureDir();
  await writeFile(fullPath(file), JSON.stringify(data, null, 2), "utf8");
}

export async function ensureFile(file: string, seed: unknown) {
  await ensureDir();
  const fp = fullPath(file);
  try {
    await readFile(fp, "utf8");
  } catch {
    await writeFile(fp, JSON.stringify(seed, null, 2), "utf8");
  }
}

/* ------------------------------------------------------------------ */
/* Events DB mapping (events-db.ts)                                    */
/* ------------------------------------------------------------------ */

export type DbEvent = {
  id: string;
  title: string;
  category: string | null;
  date: string;
  end_date: string | null;
  venue: unknown | null;
  lat: number | null;
  lng: number | null;
  organizer: string | null;
  description: string | null;
  images: unknown | null;
  tags: string[] | null;
  capacity: number | null;
  pricing: unknown | null;
  registration: unknown | null;
  accessibility: string[] | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
};

export function rowToEvent(r: DbEvent): CampusEvent {
  return {
    id: r.id,
    title: r.title,
    category: (r.category ?? "Other") as EventCategory,
    date: r.date,
    endDate: r.end_date ?? undefined,
    venue: (r.venue as CampusEvent["venue"]) ?? { building: "" },
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    organizer: r.organizer ?? undefined,
    description: r.description ?? undefined,
    images: (r.images as CampusEvent["images"]) ?? undefined,
    tags: r.tags ?? undefined,
    capacity: r.capacity ?? undefined,
    pricing: (r.pricing as CampusEvent["pricing"]) ?? undefined,
    registration: (r.registration as CampusEvent["registration"]) ?? undefined,
    accessibility: r.accessibility ?? undefined,
    isPublished: r.is_published ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function eventToRow(e: Partial<CampusEvent>) {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    date: e.date,
    end_date: e.endDate ?? null,
    venue: e.venue ?? { building: "" },
    lat: e.lat ?? null,
    lng: e.lng ?? null,
    organizer: e.organizer ?? null,
    description: e.description ?? null,
    images: e.images ?? null,
    tags: e.tags ?? null,
    capacity: e.capacity ?? null,
    pricing: e.pricing ?? null,
    registration: e.registration ?? null,
    accessibility: e.accessibility ?? null,
    is_published: e.isPublished ?? true,
  };
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ------------------------------------------------------------------ */
/* In-memory server store (store.ts)                                   */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line no-var
  var __APP_STORE__: { requests: SupportRequest[] } | undefined;
}

export const store = (globalThis.__APP_STORE__ ??= { requests: [] as SupportRequest[] });