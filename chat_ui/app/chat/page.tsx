"use client";

import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import ProviderSelect from "@/components/ProviderSelect";
import { ChatMessage } from "@/lib/api";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState("openai");

  return (
    <div className="flex flex-col h-screen">
      <div className="p-3 bg-black text-white flex items-center gap-4">
        <strong>KLYNX Chat</strong>
        <ProviderSelect provider={provider} setProvider={setProvider} />
      </div>

      <ChatWindow messages={messages} />
      <ChatInput
        messages={messages}
        setMessages={setMessages}
        provider={provider}
      />
    </div>
  );
}

