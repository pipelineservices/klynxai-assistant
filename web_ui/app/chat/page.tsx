"use client";

import { useState } from "react";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;

    const userMsg: Msg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/backend/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = await res.json();

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "No response" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Chat backend error" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
        <h2>KLYNX AI Chat</h2>
      </header>

      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 8,
                background:
                  m.role === "user" ? "#2563eb" : "#e5e7eb",
                color: m.role === "user" ? "#fff" : "#000",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p>Thinking…</p>}
      </div>

      <footer style={{ padding: 16, borderTop: "1px solid #e5e7eb" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about an incident, outage, or fix…"
          style={{ width: "100%", padding: 12 }}
        />
      </footer>
    </main>
  );
}

