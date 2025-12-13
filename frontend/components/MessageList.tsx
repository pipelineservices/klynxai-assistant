
"use client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: Props) {
  return (
    <section className="messages">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`message message-${m.role}`}
        >
          <div className="message-avatar">
            {m.role === "user" ? "U" : "KX"}
          </div>
          <div className="message-body">
            <div className="message-role">
              {m.role === "user" ? "You" : "KLYNXAIAssistant"}
            </div>
            <div className="message-content">
              {m.content}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
