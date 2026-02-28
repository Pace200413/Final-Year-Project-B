import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { NAV_CARDS_SEED } from "@/app/data/navigation-cards";
import type { NavCard } from '@/lib/domain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIR = path.join(process.cwd(), 'src', 'data');
const FILE = path.join(DIR, 'navigation-cards.json');

async function ensureFile() {
  await mkdir(DIR, { recursive: true });
  try { await readFile(FILE, 'utf8'); } catch { await writeFile(FILE, '[]', 'utf8'); }
}

async function readAll(): Promise<NavCard[]> {
  await ensureFile();
  const raw = await readFile(FILE, 'utf8').catch(() => '[]');
  const list = JSON.parse(raw) as NavCard[];
  return list.sort((a,b) => a.order - b.order);
}

async function writeAll(list: NavCard[]) {
  await ensureFile();
  await writeFile(FILE, JSON.stringify(list, null, 2), 'utf8');
}

export async function GET() {
  const list = await readAll();
  return Response.json({ cards: list });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.seed === true) {
    await writeAll(NAV_CARDS_SEED);
    return Response.json({ ok: true, seeded: true });
  }
  return Response.json({ ok: false, error: 'Pass { "seed": true } to seed' }, { status: 400 });
}
