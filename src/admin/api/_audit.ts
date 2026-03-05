import "server-only";
import { ensureFile, readJSON, writeJSON } from "@/lib/db";

export type AuditLog = { id: string; ts: string; who: string; what: string };

const FILE = "admin_activity.json";

function makeId() {
  return `A${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function readAudit(limit = 25): Promise<AuditLog[]> {
  await ensureFile(FILE, []);
  const items = await readJSON<AuditLog[]>(FILE, []);
  // newest first
  items.sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
  return items.slice(0, Math.max(1, limit));
}

export async function appendAudit(who: string, what: string) {
  await ensureFile(FILE, []);
  const items = await readJSON<AuditLog[]>(FILE, []);
  const rec: AuditLog = { id: makeId(), ts: new Date().toISOString(), who: who || "admin", what };
  items.push(rec);
  await writeJSON(FILE, items);
  return rec;
}