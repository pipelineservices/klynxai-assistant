import type { Message } from "./types";

const API_BASE = "/api/chatbackend";

export async function sendChat(
  provider: "openai" | "mock",
  conversationId: string,
  messages: Message[]
) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      conversation_id: conversationId,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error("Chat request failed");
  }

  return res.json();
}

