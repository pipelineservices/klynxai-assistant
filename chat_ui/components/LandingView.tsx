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
            alt="Klynx AI"
            style={{ height: 72, width: 72, margin: "0 auto", display: "block" }}
          />
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

