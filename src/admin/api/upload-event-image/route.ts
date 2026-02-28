import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const mime = file.type || "image/jpeg";
  const extFromMime = mime.startsWith("image/") ? `.${mime.split("/")[1]}` : "";
  const originalExt = path.extname(file.name || "");
  const ext = extFromMime || originalExt || ".jpg";

  const id = crypto.randomBytes(8).toString("hex");
  const filename = `${id}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "events");
  await mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  const url = `/uploads/events/${filename}`;
  return NextResponse.json({ url });
}
