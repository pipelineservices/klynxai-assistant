import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = "http://127.0.0.1:8010";

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const targetPath = params.path.join("/");
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_BASE}/${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.text();

    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[chatbackend proxy error]", err);
    return NextResponse.json(
      { error: "Backend proxy failed" },
      { status: 500 }
    );
  }
}

