"use client";

import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ProviderSelect from "@/components/ProviderSelect";
import { ChatMessage } from "@/lib/api";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState("mock");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #222",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <strong>KLYNX Chat</strong>
        <ProviderSelect provider={provider} setProvider={setProvider} />
      </div>

      <ChatWindow messages={messages} />

      <ChatInput provider={provider} messages={messages} setMessages={setMessages} />
    </div>
  );
}

