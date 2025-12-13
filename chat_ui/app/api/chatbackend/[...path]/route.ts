import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://127.0.0.1:8010/api";

export async function POST(req: NextRequest, { params }: any) {
  const url = `${BACKEND}/${params.path.join("/")}`;
  const body = await req.text();
  const r = await fetch(url, { method: "POST", body });
  return new NextResponse(await r.text(), { status: r.status });
}
