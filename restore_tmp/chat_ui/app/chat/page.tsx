"use client";

import { useState } from "react";
import ChatWindow from "../../components/ChatWindow";
import ChatInput from "../../components/ChatInput";
import type { Message } from "../../lib/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbackend/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          conversation_id: "chat1",
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ Failed to get response from LLM",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: 260,
          background: "linear-gradient(180deg, #0b1220, #0a1020)",
          color: "white",
          padding: 18,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>
          KLYNXAI
        </div>

        <div style={{ padding: "10px 12px", borderRadius: 8 }}>
          Chat 1 (AI)
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 8 }}>
          Chat 2 (Mock)
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 8 }}>
          Chat 3 (Mock)
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ChatWindow messages={messages} loading={loading} />
      </div>

      {/* INPUT */}
      <div
        style={{
          width: 380,
          padding: 16,
          borderLeft: "1px solid #e5e7eb",
        }}
      >
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

