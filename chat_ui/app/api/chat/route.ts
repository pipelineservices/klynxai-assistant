import { NextResponse } from "next/server";

export const runtime = "nodejs";

function coreBase(): string {
  return (
    process.env.CORE_API_BASE?.trim() ||
    process.env.KLYNX_CORE_URL?.trim() ||
    "http://127.0.0.1:9000"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const res = await fetch(`${coreBase()}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    const text = await res.text();

    // Pass-through status & body
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "chat proxy failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}

