
"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import MessageList, { ChatMessage } from "../components/MessageList";

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm KLYNXAIAssistant. I can help with DevOps, CI/CD, cloud incidents, and Zero-Ops delivery flows.\n\nTry asking: 'My GitHub Actions pipeline fails with a YAML error' or 'Design a zero-ops delivery flow for a FastAPI service on EKS.'"
    }
  ]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isSending, setIsSending] = useState(false);

  async function handleSend(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const newUser: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: trimmed
    };
    const history = [...messages, newUser];
    setMessages(history);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err.detail || "Request failed");
      }
      const data = await res.json();
      const assistant: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.assistant_reply
      };
      setMessages([...history, assistant]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: `⚠️ Error: ${e.message || "Unknown error"}`
      };
      setMessages([...history, errMsg]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={`app-root theme-${theme}`}>
      <Sidebar theme={theme} onThemeChange={setTheme} />
      <main className="chat-main">
        <header className="chat-header">
          <div>
            <h1>KLYNX AI Assistant</h1>
            <p>AI-Driven DevOps Orchestrator · Zero-Ops Delivery</p>
          </div>
        </header>
        <MessageList messages={messages} />
        <ChatInput onSend={handleSend} disabled={isSending} />
      </main>
    </div>
  );
}
