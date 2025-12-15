import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://127.0.0.1:8010";

export async function POST(
  req: NextRequest,
  ctx: { params: { path?: string[] } }
) {
  try {
    const body = await req.json();

    const tail = (ctx.params.path ?? []).join("/"); // e.g. "chat"
    const target = `${BACKEND}/api/${tail}`;        // -> http://127.0.0.1:8010/api/chat

    const r = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[chatbackend proxy] error:", e);
    return NextResponse.json({ error: "proxy_failed" }, { status: 500 });
  }
}

