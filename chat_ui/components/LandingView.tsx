"use client";

import { ChatInput, Attachment } from "./ChatInput";

export default function LandingView({
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
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
        background: colors.pageBg,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, marginTop: 90 }}>
        <div style={{ textAlign: "center", color: colors.text, marginBottom: 18 }}>
          <img
            src="/klynxai-logo.png"
            alt="Klynx logo"
            style={{ height: 72, width: 72, margin: "0 auto", display: "block" }}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: 1.3,
              textTransform: "uppercase",
              background: "linear-gradient(115deg,#38bdf8,#22d3ee,#4ade80,#facc15,#f97316,#f472b6)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: colors.isDark ? "0 0 12px rgba(56,189,248,0.4)" : "0 0 8px rgba(14,165,233,0.3)",
            }}
          >
            Klynx Retail Assistant
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: colors.muted }}>
            Futuristic, brand-agnostic product scanning with safety and ingredient intelligence.
          </div>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              textAlign: "left",
            }}
          >
            {[
              "Safe-to-eat guidance with allergen, paraben, and chemical detection.",
              "Complete product detail summaries with transparency signals.",
              "Mobile app experience for fast barcode and shelf scans.",
              "Third-party retail integrations across global marketplaces.",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${colors.panelBorder}`,
                  background: colors.cardAssistant,
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: colors.muted }}>
            Press Enter to send • Shift+Enter for new line • Attach files with +
          </div>
        </div>

        <ChatInput
          variant="landing"
          colors={colors}
          input={input}
          setInput={setInput}
          isBusy={isBusy}
          isStreaming={isStreaming}
          isTyping={isTyping}
          onSend={onSend}
          attachments={attachments}
          openFilePicker={openFilePicker}
          removeAttachment={removeAttachment}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          composerRef={composerRef}
        />
      </div>
    </div>
  );
}
