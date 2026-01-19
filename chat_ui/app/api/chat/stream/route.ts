export const runtime = "nodejs";

function coreBase(): string {
  return (
    process.env.CORE_API_BASE?.trim() ||
    process.env.KLYNX_CORE_URL?.trim() ||
    "http://127.0.0.1:9000"
  );
}

export async function POST(req: Request) {
  const controller = new AbortController();

  try {
    const body = await req.text();

    const upstream = await fetch(`${coreBase()}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Important for SSE
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    // If core returns error, pass it back as text (UI will show Stream failed: <status>)
    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      return new Response(errText || `Upstream error: ${upstream.status}`, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") || "text/plain",
          "Cache-Control": "no-store",
        },
      });
    }

    // True stream pass-through
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    // Return SSE formatted error so your UI can display it cleanly
    const msg = e?.message || String(e);
    const payload = `data: [ERROR] ${msg}\n\ndata: [DONE]\n\n`;
    return new Response(payload, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } finally {
    // If client disconnects, Next will abort automatically; this is harmless.
    controller.abort();
  }
}

