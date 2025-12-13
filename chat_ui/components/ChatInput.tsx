"use client";

import { useState } from "react";
import { ChatMessage, streamChat } from "@/lib/api";

type Props = {
  provider: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

export default function ChatInput({ provider, messages, setMessages }: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setInput("");
    setSending(true);

    // Add user + placeholder assistant
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);

    await streamChat({
      provider,
      messages: [...messages, userMessage],
      onToken: (token: string) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = { ...last, content: last.content + token };
          }
          return updated;
        });
      },
      onDone: () => setSending(false),
      onError: () => setSending(false),
    });
  }

  return (
    <div style={{ display: "flex", padding: "10px", gap: "8px", borderTop: "1px solid #222" }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
        style={{ flex: 1 }}
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
        disabled={sending}
      />
      <button onClick={send} disabled={sending}>
        {sending ? "..." : "Send"}
      </button>
    </div>
  );
}

