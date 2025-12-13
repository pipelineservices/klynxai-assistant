"use client";

import { useState } from "react";
import { streamChat, ChatMessage } from "@/lib/api";

export default function ChatInput({
  messages,
  setMessages,
  provider,
}: {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  provider: string;
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setSending(true);

    await streamChat(
      {
        provider,
        messages: [...messages, userMessage],
      },
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + token,
          };
          return updated;
        });
      },
      () => setSending(false),
    );
  }

  return (
    <div className="p-3 flex gap-2 bg-slate-800">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
        className="flex-1 p-2 rounded text-black"
        disabled={sending}
      />
      <button
        onClick={send}
        disabled={sending}
        className="bg-blue-600 text-white px-4 rounded"
      >
        Send
      </button>
    </div>
  );
}

