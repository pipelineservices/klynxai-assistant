export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type StreamChatArgs = {
  provider: string;
  messages: ChatMessage[];
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (err: any) => void;
};

export async function streamChat(args: StreamChatArgs): Promise<void> {
  const { provider, messages, onToken, onDone, onError } = args;

  try {
    const res = await fetch("/api/chatbackend/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, messages }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`streamChat failed: ${res.status} ${txt}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body reader");

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE chunks separated by \n\n
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line) continue;

        // Expected: "data: ..."
        const dataLine = line
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.startsWith("data:"));

        if (!dataLine) continue;

        const token = dataLine.replace(/^data:\s?/, "");

        if (token === "[DONE]") {
          onDone?.();
          return;
        }

        // allow server error tokens to show in UI
        onToken(token);
      }
    }

    onDone?.();
  } catch (err) {
    onError?.(err);
    onDone?.();
  }
}

