"use client";

import { ChatMessage } from "@/lib/api";

export default function ChatWindow({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-2 bg-slate-900 text-white">
      {messages.length === 0 && (
        <div className="text-gray-400">Start a conversation…</div>
      )}

      {messages.map((m, i) => (
        <div
          key={i}
          className={`p-2 rounded max-w-xl ${
            m.role === "user"
              ? "ml-auto bg-blue-600 text-right"
              : "mr-auto bg-gray-700"
          }`}
        >
          {m.content}
        </div>
      ))}
    </div>
  );
}

