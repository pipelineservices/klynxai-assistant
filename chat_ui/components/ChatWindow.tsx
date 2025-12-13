"use client";

import { ChatMessage } from "@/lib/api";

type Props = {
  messages: ChatMessage[];
};

export default function ChatWindow({ messages }: Props) {
  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
    </div>
  );
}

