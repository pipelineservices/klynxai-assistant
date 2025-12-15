export async function sendMessage(content: string) {
  const res = await fetch("/api/chatbackend/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content }],
    }),
  });
  const data = await res.json();
  return data.reply;
}
