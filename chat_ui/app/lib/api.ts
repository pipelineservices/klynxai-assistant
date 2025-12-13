export async function apiListSessions() {
  const r = await fetch("/api/chatbackend/api/sessions", { cache: "no-store" });
  if (!r.ok) throw new Error("sessions failed");
  return r.json();
}

export async function apiCreateSession(title: string) {
  const r = await fetch("/api/chatbackend/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!r.ok) throw new Error("create session failed");
  return r.json();
}

export async function apiGetMessages(sessionId: string) {
  const r = await fetch(`/api/chatbackend/api/sessions/${sessionId}/messages`, { cache: "no-store" });
  if (!r.ok) throw new Error("messages failed");
  return r.json();
}

export async function apiConnectors() {
  const r = await fetch("/api/chatbackend/api/connectors", { cache: "no-store" });
  if (!r.ok) throw new Error("connectors failed");
  return r.json();
}

export async function apiStreamChat(
  payload: { session_id: string; message: string },
  onToken: (t: string) => void
) {
  const r = await fetch("/api/chatbackend/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok || !r.body) throw new Error("stream failed");

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE: data: {"t":"..."}\n\n
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const line = part.split("\n").find((x) => x.startsWith("data: "));
      if (!line) continue;
      try {
        const obj = JSON.parse(line.replace("data: ", "").trim());
        if (obj?.t) onToken(obj.t);
      } catch {}
    }
  }
}

