import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You could forward to a real logger here.
  await req.text(); // drain
  return new NextResponse(null, { status: 204 });
}
