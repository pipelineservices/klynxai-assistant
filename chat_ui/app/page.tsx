"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";

type ChatMessage = {
  role: Role;
  content: string;
};

type ChatResponse = {
  reply: string;
  actions?: any[];
  request_id?: string;
};

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const STORAGE_KEY = "klynx_chat_threads_v1";
const ACTIVE_KEY = "klynx_chat_active_thread_v1";

type Thread = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const listRef = useRef<HTMLDivElement | null>(null);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeId) || null;
  }, [threads, activeId]);

  // -------------------------
  // Load / persist
  // -------------------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const rawActive = localStorage.getItem(ACTIVE_KEY);
      const parsed: Thread[] = raw ? JSON.parse(raw) : [];
      setThreads(Array.isArray(parsed) ? parsed : []);
      if (rawActive) setActiveId(rawActive);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // ignore
    }
  }, [threads]);

  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    } catch {
      // ignore
    }
  }, [activeId]);

  useEffect(() => {
    // autoscroll
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [activeThread?.messages?.length, isSending]);

  // -------------------------
  // Helpers
  // -------------------------
  function ensureThread(): string {
    if (activeId && activeThread) return activeId;

    const id = nowId();
    const t: Thread = {
      id,
      title: "New chat",
      createdAt: Date.now(),
      messages: [
        {
          role: "assistant",
          content: "Hi Krishna — how can I help today?",
        },
      ],
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(id);
    return id;
  }

  function updateThread(id: string, updater: (t: Thread) => Thread) {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return updater(t);
      })
    );
  }

  function setThreadTitleIfNeeded(id: string, userText: string) {
    // title only when "New chat"
    updateThread(id, (t) => {
      if (t.title !== "New chat") return t;
      const trimmed = userText.trim().replace(/\s+/g, " ");
      const title = trimmed.length > 42 ? trimmed.slice(0, 42) + "…" : trimmed;
      return { ...t, title: title || "New chat" };
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;

    setError("");
    setIsSending(true);

    const id = ensureThread();

    // append user message
    updateThread(id, (t) => ({
      ...t,
      messages: [...t.messages, { role: "user", content: text }],
    }));
    setThreadTitleIfNeeded(id, text);
    setInput("");

    // build payload: send full conversation (excluding system)
    const msgs =
      (threads.find((t) => t.id === id)?.messages || activeThread?.messages || [])
        .filter((m) => m.role !== "system")
        .concat({ role: "user", content: text });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });

      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(bodyText || `HTTP ${res.status}`);
      }

      let data: ChatResponse;
      try {
        data = JSON.parse(bodyText);
      } catch {
        data = { reply: bodyText || "" };
      }

      const reply = (data?.reply ?? "").toString().trim();
      updateThread(id, (t) => ({
        ...t,
        messages: [...t.messages, { role: "assistant", content: reply || "(no response)" }],
      }));
    } catch (e: any) {
      const msg = (e?.message || "Error talking to Core API").toString();
      setError(msg);
      updateThread(id, (t) => ({
        ...t,
        messages: [
          ...t.messages,
          { role: "assistant", content: "⚠️ Error talking to Core API. Please try again." },
        ],
      }));
    } finally {
      setIsSending(false);
    }
  }

  function newChat() {
    const id = nowId();
    const t: Thread = {
      id,
      title: "New chat",
      createdAt: Date.now(),
      messages: [{ role: "assistant", content: "Hi Krishna — how can I help today?" }],
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(id);
    setInput("");
    setError("");
  }

  function deleteThread(id: string) {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      setActiveId("");
      setInput("");
      setError("");
    }
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 280,
          borderRight: "1px solid #e5e7eb",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#ffffff",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>KLYNX AI</div>

        <button
          onClick={newChat}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + New chat
        </button>

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Chats</div>

        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {threads.length === 0 ? (
            <div style={{ fontSize: 13, color: "#6b7280", padding: 8 }}>No chats yet.</div>
          ) : (
            threads
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: t.id === activeId ? "1px solid #2563eb" : "1px solid #e5e7eb",
                    background: t.id === activeId ? "#eff6ff" : "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveId(t.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(t.id);
                      }}
                      title="Delete"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#6b7280",
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10, fontSize: 12, color: "#6b7280" }}>
          Core API: <span style={{ color: "#111827" }}>/api/chat</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f9fafb" }}>
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>Enterprise Assistant</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {activeThread ? `Thread: ${activeThread.title}` : "Start a new chat"}
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {(activeThread?.messages || []).map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
                <div
                  style={{
                    maxWidth: 820,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    background: isUser ? "#2563eb" : "#ffffff",
                    color: isUser ? "#ffffff" : "#111827",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.45,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div
                style={{
                  maxWidth: 820,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#111827",
                  opacity: 0.8,
                }}
              >
                Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "0 18px 10px 18px", color: "#b91c1c", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Composer */}
        <div style={{ padding: 18, borderTop: "1px solid #e5e7eb", background: "#ffffff" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Message KLYNX…"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: 14,
              }}
            />
            <button
              onClick={send}
              disabled={isSending}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                cursor: isSending ? "not-allowed" : "pointer",
                opacity: isSending ? 0.7 : 1,
              }}
            >
              Send
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            Tip: Press <b>Enter</b> to send.
          </div>
        </div>
      </div>
    </div>
  );
}

