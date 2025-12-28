import { NextResponse } from "next/server";

export const runtime = "nodejs";

function coreBaseUrl() {
  // Prefer env. Fallback to localhost core.
  return process.env.CORE_BASE_URL || "http://127.0.0.1:9000";
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const url = `${coreBaseUrl()}/api/chat`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();

    // Pass-through with status code
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    const msg = (e?.message || "Proxy error").toString();
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

