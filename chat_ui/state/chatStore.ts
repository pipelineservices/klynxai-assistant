export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

const KEY = "klynx.chats";

export function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveChats(chats: Chat[]) {
  localStorage.setItem(KEY, JSON.stringify(chats));
}

export function newChat(): Chat {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    createdAt: Date.now(),
  };
}

