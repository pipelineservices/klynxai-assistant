import { NextResponse } from "next/server";

const CORE_API = process.env.CORE_API_BASE || "http://127.0.0.1:9000";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const res = await fetch(`${CORE_API}/api/incidents/${params.id}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

