"use client";

import { useEffect, useMemo, useState } from "react";

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string; // image dataURL
};

function startDictation(onText: (t: string) => void) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Dictation not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e: any) => {
    const transcript = e?.results?.[0]?.[0]?.transcript;
    if (typeof transcript === "string" && transcript.trim().length) {
      onText(transcript.trim());
    }
  };

  recognition.start();
}

export function ChatInput({
  variant,
  colors,
  input,
  setInput,
  isBusy,
  isStreaming,
  isTyping,
  onSend,
  attachments,
  openFilePicker,
  removeAttachment,
  fileInputRef,
  handleFileChange,
  composerRef,
}: {
  variant: "landing" | "bottom";
  colors: any;
  input: string;
  setInput: (v: string) => void;
  isBusy: boolean;
  isStreaming: boolean;
  isTyping: boolean;
  onSend: () => void;
  attachments: Attachment[];
  openFilePicker: () => void;
  removeAttachment: (id: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  composerRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const isBig = variant === "landing";
  const canSend = input.trim().length > 0 || attachments.length > 0;
  const [isFocused, setIsFocused] = useState(false);

  // Perplexity-like narrower composer
  const maxWidth = variant === "landing" ? 760 : 820;

  const placeholderParts = useMemo(
    () => [
      { t: "Ask ", c: colors.brandA || "#2563eb" },
      { t: "klynx", c: colors.brandB || "#8b5cf6" },
      { t: "ai", c: colors.brandC || "#10b981" },
      { t: " anything…", c: colors.muted },
    ],
    [colors]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      style={{ width: "100%" }}
    >
      <div style={{ width: "100%", maxWidth, margin: "0 auto", position: "relative" }}>
        {/* Hidden file input (single source of truth) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.log,.json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Attachments chips */}
        {attachments.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {attachments.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1px solid ${colors.chipBorder}`,
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: colors.chipBg,
                  color: colors.text,
                  fontSize: 13,
                }}
              >
                {a.preview ? (
                  <img
                    src={a.preview}
                    alt={a.name}
                    style={{ width: 26, height: 26, objectFit: "cover", borderRadius: 999 }}
                  />
                ) : (
                  <span>📎</span>
                )}
                <span
                  style={{
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  title="Remove"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: colors.text,
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 16,
                    lineHeight: "16px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input container */}
        <div
          style={{
            border: `1px solid ${colors.panelBorder}`,
            background: colors.inputBg,
            borderRadius: 16,
            boxShadow: colors.isDark ? "none" : "0 10px 30px rgba(0,0,0,0.06)",
            padding: isBig ? 12 : 10,
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          {/* Attach */}
          <button
            type="button"
            onClick={openFilePicker}
            title="Attach"
            style={{
              border: `1px solid ${colors.btnBorder}`,
              background: colors.btnBg,
              color: colors.text,
              borderRadius: 12,
              padding: isBig ? "10px 12px" : "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            +
          </button>

          {/* Dictate */}
          <button
            type="button"
            title="Dictate"
            onClick={() =>
              startDictation((spoken) => setInput(input ? `${input} ${spoken}` : spoken))
            }
            style={{
              border: `1px solid ${colors.btnBorder}`,
              background: colors.btnBg,
              color: colors.text,
              borderRadius: 12,
              padding: isBig ? "10px 12px" : "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            🎤
          </button>

          <div style={{ flex: 1, position: "relative" }}>
            {/* Multicolor placeholder overlay (placeholders can't be multicolor) */}
            {input.length === 0 && !isFocused ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 6,
                  pointerEvents: "none",
                  userSelect: "none",
                  fontSize: isBig ? 16 : 15,
                  lineHeight: "1.4",
                  opacity: 0.9,
                }}
              >
                {placeholderParts.map((p, idx) => (
                  <span key={idx} style={{ color: p.c, fontWeight: p.t.trim() ? 800 : 700 }}>
                    {p.t}
                  </span>
                ))}
              </div>
            ) : null}

            <textarea
              ref={composerRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={isBig ? 3 : 2}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                color: colors.text,
                outline: "none",
                resize: "none",
                fontSize: isBig ? 16 : 15,
                lineHeight: "1.4",
                paddingTop: 4,
              }}
              aria-label="Chat input"
              placeholder=""
              disabled={isBusy || isStreaming || isTyping}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />

            {variant === "landing" ? (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {["Latest News", "Troubleshoot", "Summarize", "Local"].map((label) => (
                  <div
                    key={label}
                    style={{
                      border: `1px solid ${colors.chipBorder}`,
                      background: colors.chipBg,
                      color: colors.text,
                      borderRadius: 999,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      opacity: 0.9,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isBusy || isStreaming || isTyping || !canSend}
            style={{
              border: "none",
              background:
                isBusy || isStreaming || isTyping || !canSend
                  ? colors.isDark
                    ? "#334155"
                    : "#e5e7eb"
                  : colors.brandA || "#2563eb",
              color: "#fff",
              borderRadius: 12,
              padding: isBig ? "10px 14px" : "8px 12px",
              cursor: isBusy || isStreaming || isTyping || !canSend ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
}

