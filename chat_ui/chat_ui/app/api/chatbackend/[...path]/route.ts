import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.CHAT_BACKEND_URL || "http://127.0.0.1:8010";

export async function GET(req: NextRequest, ctx: any) {
  const url = `${BACKEND}/${ctx.params.path.join("/")}`;
  const res = await fetch(url);
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest, ctx: any) {
  const url = `${BACKEND}/${ctx.params.path.join("/")}`;
  const body = await req.json();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json());
}

