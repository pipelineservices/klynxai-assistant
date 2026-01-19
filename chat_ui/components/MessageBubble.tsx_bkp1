"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Reactions = { up?: boolean; down?: boolean; star?: boolean };

type Message = {
  role: "user" | "assistant";
  content: string;
  reactions?: Reactions;
};

type SourceItem = { url: string; title?: string; domain: string };

type Props = {
  m: Message;
  index: number;
  colors: any;
  sources?: SourceItem[];
  isLast: boolean;
  showStop: boolean;
  isStreaming: boolean;
  isTyping: boolean;
  onCopy: (t: string) => void;
  onRegenerate: (idx: number) => void;
  onStop: () => void;
  onToggleReaction: (idx: number, key: keyof Reactions) => void;
};

function normalizeAssistantText(text: string) {
  return (text || "").replace(/\n{3,}/g, "\n\n").trim();
}

export default function MessageBubble({
  m,
  index,
  colors,
  sources = [],
  isLast,
  showStop,
  isStreaming,
  isTyping,
  onCopy,
  onRegenerate,
  onStop,
  onToggleReaction,
}: Props) {
  const rx = m.reactions || {};

  return (
    <div
      style={{
        maxWidth: 900,
        marginBottom: 18,
        padding: 16,
        borderRadius: 14,
        background: m.role === "assistant" ? colors.cardAssistant : colors.cardUser,
        color: m.role === "assistant" ? colors.text : "#fff",
        marginLeft: m.role === "assistant" ? 0 : "auto",
        boxShadow: m.role === "assistant" ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
        border: m.role === "assistant" ? `1px solid ${colors.panelBorder}` : "none",
      }}
    >
      {m.role === "assistant" ? (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeAssistantText(m.content)}</ReactMarkdown>

          {sources.length > 0 ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: colors.muted, fontWeight: 800, marginBottom: 8 }}>Sources</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      color: colors.text,
                      border: `1px solid ${colors.panelBorder}`,
                      background: colors.sourceBg,
                      borderRadius: 12,
                      padding: "10px 12px",
                      minWidth: 220,
                      maxWidth: 320,
                      display: "block",
                    }}
                    title={s.url}
                  >
                    <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>{s.domain}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: colors.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.title ? s.title : s.url}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => onCopy(m.content)}
              style={{
                border: `1px solid ${colors.btnBorder}`,
                background: colors.btnBg,
                color: colors.text,
                borderRadius: 10,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              📋 Copy
            </button>

            <button
              type="button"
              onClick={() => onRegenerate(index)}
              style={{
                border: `1px solid ${colors.btnBorder}`,
                background: colors.btnBg,
                color: colors.text,
                borderRadius: 10,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              🔄 Regenerate
            </button>

            {showStop ? (
              <button
                type="button"
                onClick={onStop}
                style={{
                  border: `1px solid ${colors.btnBorder}`,
                  background: colors.btnBg,
                  color: colors.text,
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                🔥 Stop
              </button>
            ) : null}

            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => onToggleReaction(index, "up")}
                title="Thumbs up"
                style={{
                  border: `1px solid ${colors.btnBorder}`,
                  background: rx.up ? (colors.isDark ? "#1d4ed8" : "#dbeafe") : colors.btnBg,
                  color: colors.text,
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                👍
              </button>
              <button
                type="button"
                onClick={() => onToggleReaction(index, "down")}
                title="Thumbs down"
                style={{
                  border: `1px solid ${colors.btnBorder}`,
                  background: rx.down ? (colors.isDark ? "#7f1d1d" : "#fee2e2") : colors.btnBg,
                  color: colors.text,
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                👎
              </button>
              <button
                type="button"
                onClick={() => onToggleReaction(index, "star")}
                title="Star"
                style={{
                  border: `1px solid ${colors.btnBorder}`,
                  background: rx.star ? (colors.isDark ? "#854d0e" : "#fef9c3") : colors.btnBg,
                  color: colors.text,
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                ⭐
              </button>
            </div>
          </div>
        </>
      ) : (
        m.content
      )}
    </div>
  );
}

