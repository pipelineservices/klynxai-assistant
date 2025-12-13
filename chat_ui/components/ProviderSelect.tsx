"use client";

type Props = {
  provider: string;
  setProvider: (p: string) => void;
};

export default function ProviderSelect({ provider, setProvider }: Props) {
  return (
    <select
      value={provider}
      onChange={(e) => setProvider(e.target.value)}
      style={{ marginLeft: "12px" }}
    >
      <option value="mock">Mock (Streaming)</option>
      <option value="openai">OpenAI</option>
      <option value="gemini">Gemini (coming soon)</option>
      <option value="deepseek">DeepSeek (coming soon)</option>
    </select>
  );
}

