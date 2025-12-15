"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function send() {
    console.log("[ChatInput] Send clicked, value =", value);

    if (!value.trim()) {
      console.log("[ChatInput] Empty value, abort");
      return;
    }

    onSend(value);
    console.log("[ChatInput] onSend called");

    setValue("");
    console.log("[ChatInput] input cleared");
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => {
          console.log("[ChatInput] typing:", e.target.value);
          setValue(e.target.value);
        }}
        placeholder="Ask anything..."
        rows={4}
        style={{
          width: "100%",
          resize: "none",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <button
        type="button"
        onClick={send}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "12px 16px",
          borderRadius: 10,
          border: "none",
          background: "#2563eb",
          color: "white",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
}

