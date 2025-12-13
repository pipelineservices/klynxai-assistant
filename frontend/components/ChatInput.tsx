
"use client";

import { useState, KeyboardEvent } from "react";

interface Props {
  onSend: (value: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-input-bar">
      <div className="chat-input-inner">
        <textarea
          className="chat-input"
          placeholder="Ask anything. Type @ for incidents, pipelines, or Zero-Ops flows."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={disabled}
        >
          {disabled ? "…" : "➤"}
        </button>
      </div>
      <div className="chat-hints">
        <span>Examples:</span>
        <button
          type="button"
          onClick={() =>
            setValue("My GitHub Actions pipeline fails with a YAML error on line 23.")
          }
        >
          CI failure
        </button>
        <button
          type="button"
          onClick={() =>
            setValue("Design a zero-ops delivery flow for a FastAPI service on EKS.")
          }
        >
          Zero-Ops flow
        </button>
      </div>
    </div>
  );
}
