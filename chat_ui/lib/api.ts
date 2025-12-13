export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type StreamPayload = {
  provider: string;
  messages: ChatMessage[];
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_CHAT_BACKEND_URL ||
  "http://127.0.0.1:8010";

export async function streamChat(
  payload: StreamPayload,
  onToken: (token: string) => void,
  onDone?: () => void,
) {
  const res = await fetch(`${BACKEND_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.body) {
    throw new Error("No response body from chat backend");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const token = line.replace("data: ", "").trim();
        if (token === "[DONE]") {
          onDone?.();
          return;
        }
        onToken(token);
      }
    }
  }

  onDone?.();
}

