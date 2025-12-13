import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

function targetUrl(req: NextRequest, pathParts: string[]) {
  const incoming = new URL(req.url);
  const base = BACKEND_URL.replace(/\/$/, "");
  const target = new URL(`${base}/${pathParts.join("/")}`);
  target.search = incoming.search;
  return target;
}

async function forward(req: NextRequest, ctx: { params: { path: string[] } }) {
  const url = targetUrl(req, ctx.params.path || []);
  const method = req.method;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const resp = await fetch(url.toString(), {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const respHeaders = new Headers(resp.headers);
  respHeaders.set("access-control-allow-origin", "*");
  respHeaders.set("access-control-allow-headers", "*");
  respHeaders.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  return new NextResponse(resp.body, {
    status: resp.status,
    headers: respHeaders,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
  });
}

export async function GET(req: NextRequest, ctx: any) { return forward(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return forward(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return forward(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return forward(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return forward(req, ctx); }
