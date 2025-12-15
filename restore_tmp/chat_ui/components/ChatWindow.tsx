"use client";

import type { Message } from "../lib/types";

function formatTime() {
  return "";
}

export default function ChatWindow({
  messages,
  loading,
}: {
  messages: Message[];
  loading?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        overflowY: "auto",
        background: "#f7f7f8",
      }}
    >
      {messages.map((m, i) => (
        <div
          key={i}
          style={{
            marginBottom: 14,
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: 14,
              background: m.role === "user" ? "#2563eb" : "#e5e7eb",
              color: m.role === "user" ? "white" : "#111827",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {m.content}
          </div>
        </div>
      ))}

      {loading && (
        <div style={{ color: "#6b7280", fontSize: 13 }}>Thinking…</div>
      )}
    </div>
  );
}

