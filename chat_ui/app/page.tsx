// sudo vi /opt/klynxaiagent/chat_ui/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ---------------- Types ---------------- */

type Role = "user" | "assistant";

type Reactions = {
  up?: boolean;
  down?: boolean;
  star?: boolean;
};

type Message = {
  role: Role;
  content: string;
  reactions?: Reactions; // backward compatible
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
};

/** UI-only attachments (NO backend payload changes in this file) */
type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string; // image dataURL for preview
};

type SourceItem = {
  url: string;
  title?: string;
  domain: string;
};

const STORAGE_KEY = "klynx_chat_sessions";
const THEME_KEY = "klynx_theme"; // "light" | "dark"

/* ---------------- Utils ---------------- */

function safeId() {
  return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function normalizeAssistantText(text: string) {
  return (text || "").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * ✅ FIX: Copy must work on http:// (clipboard API can fail).
 * Try navigator.clipboard first; fallback to execCommand copy.
 */
function copyText(text: string) {
  const value = text || "";
  if (!value) return;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).catch(() => fallbackCopy(value));
    return;
  }
  fallbackCopy(value);

  function fallbackCopy(val: string) {
    try {
      const ta = document.createElement("textarea");
      ta.value = val;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      // ignore
    }
  }
}

function buildRequestMessages(history: Message[], newUserText: string): Message[] {
  const cleaned = history.filter((m) => (m.content || "").trim().length > 0);
  return [...cleaned, { role: "user", content: newUserText }];
}

function buildSuggestions(raw: string): string[] {
  const q = (raw || "").trim();
  if (!q) return [];
  const base = q.replace(/\?+$/g, "");
  return [
    q,
    `${base} instance`,
    `${base} used for`,
    `${base} pricing`,
    `${base} examples`,
    `${base} vs alternatives`,
  ];
}

/**
 * Streaming responses may come as:
 *  - raw text chunks
 *  - SSE lines: "data: ...\n\n"
 * This normalizes both.
 */
function extractStreamingText(chunk: string): string {
  if (!chunk) return "";
  // If it looks like SSE, parse lines.
  if (chunk.includes("data:")) {
    const lines = chunk.split("\n");
    const parts: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      // Some servers JSON-wrap {token:""} — try parse, else use raw
      try {
        const obj = JSON.parse(payload);
        if (typeof obj === "string") parts.push(obj);
        else if (obj && typeof obj.token === "string") parts.push(obj.token);
        else if (obj && typeof obj.text === "string") parts.push(obj.text);
        else parts.push(payload);
      } catch {
        parts.push(payload);
      }
    }
    return parts.join("");
  }
  return chunk;
}

/* ✅ helper: build attachments payload for backend */
function buildAttachmentPayload(attachments: Attachment[]) {
  return attachments.map((a) => ({
    name: a.name,
    type: a.type,
    size: a.size,
    data: a.preview && a.type.startsWith("image/") ? a.preview.split(",")[1] : undefined,
  }));
}

/* ✅ "Perplexity style" sources: extract links/urls from assistant content */
function extractSourcesFromText(text: string, max = 4): SourceItem[] {
  const raw = text || "";
  const found: { url: string; title?: string }[] = [];

  // Markdown links: [title](url)
  const mdLink = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdLink.exec(raw)) !== null) {
    found.push({ title: m[1], url: m[2] });
  }

  // Raw URLs
  const urlRe = /(https?:\/\/[^\s<>()\]]+)/g;
  const rawUrls = raw.match(urlRe) || [];
  for (const u of rawUrls) found.push({ url: u });

  const uniq = new Map<string, { url: string; title?: string }>();
  for (const item of found) {
    const url = item.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) continue;
    if (!uniq.has(url)) uniq.set(url, item);
  }

  const out: SourceItem[] = [];
  for (const v of uniq.values()) {
    try {
      const domain = new URL(v.url).hostname.replace(/^www\./, "");
      out.push({ url: v.url, title: v.title, domain });
    } catch {
      // ignore invalid
    }
    if (out.length >= max) break;
  }
  return out;
}

/* ---------------- Composer (kept outside Page to avoid remount/focus issues) ---------------- */

function Composer({
  variant,
  colors,
  input,
  setInput,
  isBusy,
  isStreaming,
  isTyping,
  onSend,
  suggestionSeed,
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
  suggestionSeed: string;
  attachments: Attachment[];
  openFilePicker: () => void;
  removeAttachment: (id: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  composerRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const isBig = variant === "landing";
  const maxWidth = isBig ? 860 : 900;
  const canSend = input.trim().length > 0 || attachments.length > 0;
  const showPlaceholder = !input && !isBusy && !isStreaming && !isTyping;
  const actionRowBg = colors.isDark ? "#0b1220" : "#f3f4f6";
  const suggestionQuery = input.trim() || suggestionSeed.trim();
  const suggestions = buildSuggestions(suggestionQuery);
  const showSuggestions = isBig && suggestions.length > 0 && !isStreaming && !isTyping;
  const [isListening, setIsListening] = useState(false);
  const speechRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  useEffect(() => {
    if (isBusy || isStreaming || isTyping) stopListening();
  }, [isBusy, isStreaming, isTyping]);

  useEffect(() => {
    return () => stopListening();
  }, []);

  function stopListening() {
    try {
      if (speechRef.current) {
        speechRef.current.stop();
      }
    } catch {}
    setIsListening(false);
    speechRef.current = null;
    finalTranscriptRef.current = "";
  }

  function toggleListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    finalTranscriptRef.current = "";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${piece}`.trim();
        } else {
          interim += piece;
        }
      }
      const next = `${finalTranscriptRef.current} ${interim}`.trim();
      setInput(next);
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    speechRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

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
                <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

        {/* Perplexity-style input container */}
        <div
          style={{
            border: `1px solid ${colors.panelBorder}`,
            background: colors.inputBg,
            borderRadius: 18,
            boxShadow: colors.isDark ? "none" : "0 10px 30px rgba(0,0,0,0.06)",
            padding: isBig ? 16 : 12,
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            minHeight: isBig ? 110 : 72,
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={composerRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={isBig ? 2 : 2}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                color: colors.text,
                outline: "none",
                resize: "none",
                fontSize: isBig ? 17 : 15,
                lineHeight: "1.5",
                paddingTop: 4,
                minHeight: isBig ? 58 : 46,
              }}
              placeholder=""
              disabled={isBusy || isStreaming || isTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />

            {showPlaceholder ? (
              <div
                style={{
                  position: "absolute",
                  left: 2,
                  top: 8,
                  pointerEvents: "none",
                  fontSize: isBig ? 17 : 15,
                  fontWeight: 600,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: colors.muted }}>Ask</span>
                <span
                  style={{
                    background: "linear-gradient(90deg,#38bdf8,#22c55e,#f59e0b,#ef4444)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    fontWeight: 700,
                  }}
                >
                  klynxai
                </span>
                <span
                  style={{
                    background: "linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    fontWeight: 700,
                  }}
                >
                  anything
                </span>
              </div>
            ) : null}

            {isBig ? (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                {["🌐", "🧪", "✏️", "🎙️"].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title="Action"
                    onClick={() => {
                      if (icon === "🎙️") toggleListening();
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: icon === "🎙️" && isListening ? "#ef4444" : colors.text,
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            ) : null}

            {variant === "landing" ? null : null}
          </div>

          {/* ✅ FIX: allow send when attachments exist even if input empty */}
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
                  : isBig
                  ? "#0ea5e9"
                  : "#2563eb",
              color: "#fff",
              borderRadius: 999,
              width: isBig ? 46 : 40,
              height: isBig ? 46 : 40,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isBusy || isStreaming || isTyping || !canSend ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            {isBig ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="9" width="2" height="6" fill="currentColor" />
                <rect x="9" y="6" width="2" height="12" fill="currentColor" />
                <rect x="14" y="4" width="2" height="16" fill="currentColor" />
                <rect x="19" y="8" width="2" height="8" fill="currentColor" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M13 6l5 6-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {showSuggestions ? (
          <div
            style={{
              marginTop: 10,
              borderRadius: 14,
              border: `1px solid ${colors.panelBorder}`,
              background: colors.isDark ? "#0f172a" : "#ffffff",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setInput(s);
                  composerRef.current?.focus();
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  padding: "6px 8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: colors.text,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>🔍</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </form>
  );
}

/* ---------------- Page ---------------- */

export default function Page() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");

  const [isBusy, setIsBusy] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Avoid stale state bugs
  const sessionsRef = useRef<ChatSession[]>([]);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Cancel streaming/typing
  const streamAbortRef = useRef<AbortController | null>(null);
  const typingAbortRef = useRef<{ aborted: boolean } | null>(null);

  /* ---------- NEW: Theme (dark/light) ---------- */
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(THEME_KEY)) || "";
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  }

  const colors = useMemo(() => {
    const isDark = theme === "dark";
    return {
      isDark,
      pageBg: isDark ? "#0b1220" : "#ffffff",
      sidebarBg: isDark ? "#0f172a" : "#f9fafb",
      panelBorder: isDark ? "#1f2937" : "#e5e7eb",
      text: isDark ? "#e5e7eb" : "#111827",
      muted: isDark ? "#94a3b8" : "#6b7280",
      accentBlue: isDark ? "#38bdf8" : "#0ea5e9",
      accentGreen: isDark ? "#22c55e" : "#16a34a",
      accentGold: isDark ? "#fbbf24" : "#f59e0b",
      cardUser: "#2563eb",
      cardAssistant: isDark ? "#111827" : "#e5e7eb",
      inputBg: isDark ? "#0b1220" : "#ffffff",
      chipBg: isDark ? "#0b1220" : "#f9fafb",
      chipBorder: isDark ? "#334155" : "#d1d5db",
      btnBg: isDark ? "#111827" : "#ffffff",
      btnBorder: isDark ? "#334155" : "#d1d5db",
      headerBg: isDark ? "#0b1220" : "#ffffff",
      sidebarHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      sourceBg: isDark ? "#0b1220" : "#ffffff",
    };
  }, [theme]);

  const sidebarItems = [
    {
      id: "more",
      label: "More",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="6" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="18" cy="12" r="1.6" fill="currentColor" />
        </svg>
      ),
    },
  ];

  const moreMenuItems = [
    { id: "images", label: "Images", emoji: "🖼", action: "open-attachments" },
    { id: "social", label: "Social", emoji: "🌐", action: "placeholder" },
    { id: "apps", label: "Apps", emoji: "🧩", action: "placeholder" },
    { id: "codex", label: "Codex", emoji: "💻", action: "placeholder" },
    { id: "gpts", label: "GPTs", emoji: "🤖", action: "placeholder" },
    { id: "projects", label: "Projects", emoji: "📁", action: "placeholder" },
  ];

  const sidebarFooterItems = [
    {
      id: "account",
      label: "Account",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 20c1.8-3.2 11.2-3.2 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "upgrade",
      label: "Upgrade",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 6l4 5h-3v7h-2v-7H8l4-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "install",
      label: "Install",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  /* ---------- Attachments UI-only ---------- */
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const morePanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [openChatMenuId, setOpenChatMenuId] = useState<string>("");

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const f of files) {
      const id = safeId();

      if (f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            { id, name: f.name, type: f.type, size: f.size, preview: String(reader.result || "") },
          ]);
        };
        reader.readAsDataURL(f);
      } else {
        setAttachments((prev) => [
          ...prev,
          {
            id,
            name: f.name,
            type: f.type || "application/octet-stream",
            size: f.size,
          },
        ]);
      }
    }

    // allow selecting same file again
    e.target.value = "";
  }

  /* ---------- FIX: Cursor/focus stability ---------- */
  const composerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // Keep focus when switching chats / after updates (prevents “click for every letter”)
    // Don’t steal focus while streaming/typing.
    if (isStreaming || isTyping) return;
    composerRef.current?.focus();
  }, [activeId, isStreaming, isTyping]);

  /* ---------- NEW: Sidebar search + rename ---------- */
  const [chatSearch, setChatSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string>("");
  const [renameDraft, setRenameDraft] = useState<string>("");
  const [openMsgMenuId, setOpenMsgMenuId] = useState<string>("");

  function startRename(id: string, currentTitle: string) {
    setRenamingId(id);
    setRenameDraft(currentTitle || "New chat");
  }

  function commitRename() {
    const id = renamingId;
    if (!id) return;
    const nextTitle = (renameDraft || "").trim() || "New chat";
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: nextTitle } : s)));
    setRenamingId("");
    setRenameDraft("");
  }

  function cancelRename() {
    setRenamingId("");
    setRenameDraft("");
  }

  /* ---------- Init ---------- */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setSessions(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      } catch {}
    }
    const first: ChatSession = { id: safeId(), title: "New chat", messages: [] };
    setSessions([first]);
    setActiveId(first.id);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (sidebarRef.current && target && sidebarRef.current.contains(target)) return;
      if (morePanelRef.current && target && morePanelRef.current.contains(target)) return;
      setOpenChatMenuId("");
      setIsMoreOpen(false);
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [sessions, isStreaming, isTyping]);

  const active = useMemo(() => sessions.find((s) => s.id === activeId), [sessions, activeId]);
  const activeMessages = active?.messages ?? [];
  const isLanding = activeMessages.length === 0;
  const lastUserText = useMemo(() => {
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      if (activeMessages[i]?.role === "user") return activeMessages[i]?.content || "";
    }
    return "";
  }, [activeMessages]);

  const filteredSessions = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    const base = sessions.filter((s) => s.messages.length > 0);
    if (!q) return base;
    return base.filter((s) => (s.title || "New chat").toLowerCase().includes(q));
  }, [sessions, chatSearch]);

  /* ---------- Session actions ---------- */

  function newChat() {
    const id = safeId();
    setSessions((p) => [{ id, title: "New chat", messages: [] }, ...p]);
    setActiveId(id);
    setAttachments([]);
    setInput("");
    cancelRename();
    setChatSearch("");
    setOpenChatMenuId("");
    setIsMoreOpen(false);
    setTimeout(() => composerRef.current?.focus(), 0);
  }

  function deleteChat(id: string) {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      const next = remaining.length > 0 ? remaining : [{ id: safeId(), title: "New chat", messages: [] }];

      if (id === activeId) {
        setActiveId(next[0].id);
        setAttachments([]);
        setInput("");
      }
      return next;
    });
    if (renamingId === id) cancelRename();
  }

  function stop() {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    if (typingAbortRef.current) typingAbortRef.current.aborted = true;
    typingAbortRef.current = null;

    setIsStreaming(false);
    setIsTyping(false);
  }

  function branchFrom(index: number) {
    const current = sessionsRef.current.find((s) => s.id === activeId);
    if (!current) return;
    const userMsg = current.messages[index - 1]?.role === "user" ? current.messages[index - 1] : null;
    const assistantMsg = current.messages[index];
    if (!userMsg || assistantMsg?.role !== "assistant") return;
    const id = safeId();
    setSessions((prev) => [{ id, title: userMsg.content.slice(0, 40), messages: [userMsg, assistantMsg] }, ...prev]);
    setActiveId(id);
    setOpenMsgMenuId("");
  }

  function readAloud(text: string) {
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore
    }
  }

  async function shareMessage(text: string) {
    if (!text) return;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      // ignore
    }
    copyText(text);
  }

  function regenerate(index: number) {
    const current = sessionsRef.current.find((s) => s.id === activeId);
    if (!current) return;

    for (let i = index - 1; i >= 0; i--) {
      if (current.messages[i]?.role === "user") {
        stop();
        setTimeout(() => {
          void send(current.messages[i].content);
        }, 0);
        return;
      }
    }
  }

  function toggleReaction(messageIndex: number, key: keyof Reactions) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeId) return s;
        const msgs = [...s.messages];
        const m = msgs[messageIndex];
        if (!m || m.role !== "assistant") return s;

        const current = m.reactions || {};
        if (key === "up") {
          const nextUp = !current.up;
          msgs[messageIndex] = {
            ...m,
            reactions: { ...current, up: nextUp, down: nextUp ? false : current.down },
          };
        } else if (key === "down") {
          const nextDown = !current.down;
          msgs[messageIndex] = {
            ...m,
            reactions: { ...current, down: nextDown, up: nextDown ? false : current.up },
          };
        } else {
          msgs[messageIndex] = { ...m, reactions: { ...current, star: !current.star } };
        }
        return { ...s, messages: msgs };
      })
    );
  }

  /* ---------- Fallback typing (used only if /api/chat/stream fails) ---------- */

  async function typeAssistantReply(fullText: string) {
    stop();
    setIsTyping(true);

    const abortFlag = { aborted: false };
    typingAbortRef.current = abortFlag;

    const parts = fullText.split(/(\s+)/).filter((x) => x.length > 0);
    let built = "";

    for (let i = 0; i < parts.length; i++) {
      if (abortFlag.aborted) break;
      built += parts[i];

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeId) return s;
          const msgs = [...s.messages];
          if (msgs.length === 0) return s;
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], role: "assistant", content: built };
          return { ...s, messages: msgs };
        })
      );

      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 12));
    }

    setIsTyping(false);
    typingAbortRef.current = null;
  }

  /* ---------- Send ---------- */

  async function send(forced?: string) {
    const text = (forced ?? input).trim();
    const hasAttachments = attachments.length > 0;

    // ✅ allow attachment-only send
    if ((!text && !hasAttachments) || isBusy || isStreaming || isTyping) return;

    const current = sessionsRef.current.find((s) => s.id === activeId);
    if (!current) return;

    setInput("");
    setIsBusy(true);

    const attachmentNote = attachments.length
      ? `Attachments: ${attachments.map((a) => a.name).join(", ")}`
      : "";
    const userContent = text
      ? attachmentNote
        ? `${text}\n\n${attachmentNote}`
        : text
      : attachmentNote || "(attachment)";
    const requestMessages = buildRequestMessages(current.messages, userContent);

    // Add user + placeholder assistant
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? {
              ...s,
              title: s.messages.length === 0 ? userContent.slice(0, 40) : s.title,
              messages: [...s.messages, { role: "user", content: userContent }, { role: "assistant", content: "" }],
            }
          : s
      )
    );

    // 1) Try streaming first
    try {
      stop();
      setIsStreaming(true);

      const ac = new AbortController();
      streamAbortRef.current = ac;

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages,
          attachments: buildAttachmentPayload(attachments),
        }),
        signal: ac.signal,
      });

      if (!res.ok) throw new Error(`/api/chat/stream HTTP ${res.status}`);
      if (!res.body) throw new Error("/api/chat/stream empty body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let built = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const textChunk = extractStreamingText(rawChunk);
        if (!textChunk) continue;

        built += textChunk;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeId) return s;
            const msgs = [...s.messages];
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], role: "assistant", content: built };
            return { ...s, messages: msgs };
          })
        );
      }

      if (!built.trim()) {
        throw new Error("Empty stream");
      }

      setIsStreaming(false);
      streamAbortRef.current = null;
      setIsBusy(false);

      // clear attachments ONLY after successful send
      setAttachments([]);

      // keep cursor ready
      setTimeout(() => composerRef.current?.focus(), 0);
      return;
    } catch {
      setIsStreaming(false);
      streamAbortRef.current = null;
      // fall through
    }

    // 2) Fallback: normal /api/chat
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages,
          attachments: buildAttachmentPayload(attachments),
        }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const detail = (data && (data.detail || data.error)) || raw || `HTTP ${res.status}`;
        throw new Error(detail);
      }

      const reply = data && data.reply ? String(data.reply) : "⚠️ Empty reply from server";
      await typeAssistantReply(reply);

      setAttachments([]);
    } catch (e: any) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeId) return s;
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            role: "assistant",
            content: `⚠️ Failed to fetch: ${e?.message || String(e)}`,
          };
          return { ...s, messages: msgs };
        })
      );
    } finally {
      setIsBusy(false);
      setTimeout(() => composerRef.current?.focus(), 0);
    }
  }

  /* ---------- UI ---------- */

  return (
    <div style={{ display: "flex", height: "100vh", background: colors.pageBg, position: "relative" }}>
      {/* Sidebar (Perplexity-style: feature nav + chat history) */}
      <aside
        ref={sidebarRef}
        style={{
          width: 170,
          padding: 8,
          borderRight: `1px solid ${colors.panelBorder}`,
          background: colors.sidebarBg,
          color: colors.text,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: 0,
          overflow: "visible",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <img src="/klynx-logo.png" alt="Klynx AI" style={{ height: 32, width: 32, objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={newChat}
              title="New chat"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: `1px solid ${colors.panelBorder}`,
                background: colors.isDark ? "#0f172a" : "#f3f4f6",
                color: colors.text,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "stretch" }}>
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                if (item.id === "more") {
                  setIsMoreOpen((prev) => !prev);
                  return;
                }
                setIsMoreOpen(false);
                if (item.id === "history") {
                  searchInputRef.current?.focus();
                  return;
                }
                if (item.id === "discover" || item.id === "spaces" || item.id === "finance") {
                  newChat();
                  setTimeout(() => {
                    setInput(item.label);
                    composerRef.current?.focus();
                  }, 0);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "2px 4px",
                borderRadius: 12,
                cursor: "pointer",
                userSelect: "none",
                border: "none",
                background: "transparent",
                fontWeight: 600,
                fontSize: 11,
                color: colors.text,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  border: `1px solid ${colors.panelBorder}`,
                  background: item.id === "more" && isMoreOpen ? colors.sidebarHover : "transparent",
                }}
              >
                {item.icon}
              </span>
              <span style={{ letterSpacing: 0.1 }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 4, borderTop: `1px solid ${colors.panelBorder}`, paddingTop: 8 }}>
          <input
            ref={searchInputRef}
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 10,
              border: `1px solid ${colors.panelBorder}`,
              background: colors.btnBg,
              color: colors.text,
              outline: "none",
              fontSize: 12,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            fontWeight: 800,
            background: "linear-gradient(90deg,#38bdf8,#22c55e,#f59e0b,#ef4444)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Your chats
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 2, flex: 1, minHeight: 70 }}>
          {filteredSessions.map((s) => {
            const isActive = s.id === activeId;
            const isRenaming = renamingId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => {
                  if (!isRenaming) setActiveId(s.id);
                }}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  background: isActive ? "#2563eb" : colors.btnBg,
                  color: isActive ? "#fff" : colors.text,
                  border: `1px solid ${colors.panelBorder}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  position: "relative",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isRenaming ? (
                    <input
                      value={renameDraft}
                      autoFocus
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelRename();
                        }
                      }}
                      onBlur={() => commitRename()}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `1px solid ${colors.btnBorder}`,
                        background: colors.isDark ? "#0b1220" : "#ffffff",
                        color: colors.isDark ? "#e5e7eb" : "#111827",
                        outline: "none",
                      }}
                    />
                  ) : (
                    <span
                      title={s.title || "New chat"}
                      style={{
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        fontWeight: 800,
                      }}
                    >
                      {s.title || "New chat"}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenChatMenuId((prev) => (prev === s.id ? "" : s.id));
                    }}
                    title="More"
                    style={{
                      border: "1px solid rgba(255,255,255,0.35)",
                      background: isActive ? "rgba(255,255,255,0.15)" : colors.isDark ? "#0b1220" : "#f3f4f6",
                      color: isActive ? "#fff" : colors.text,
                      borderRadius: 10,
                      padding: "6px 8px",
                      cursor: "pointer",
                      fontWeight: 900,
                      lineHeight: "12px",
                    }}
                  >
                    ...
                  </button>

                  {openChatMenuId === s.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        left: "100%",
                        top: 6,
                        marginLeft: 8,
                        minWidth: 200,
                        borderRadius: 12,
                        background: colors.isDark ? "#0b1220" : "#ffffff",
                        border: `1px solid ${colors.panelBorder}`,
                        boxShadow: colors.isDark ? "none" : "0 10px 30px rgba(0,0,0,0.12)",
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        color: colors.text,
                        zIndex: 20,
                      }}
                    >
                      {[
                        { label: "Share" },
                        { label: "Start a group chat" },
                        { label: "Rename" },
                        { label: "Move to project" },
                        { label: "Pin chat" },
                        { label: "Archive" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            if (item.label === "Rename") startRename(s.id, s.title || "New chat");
                            setOpenChatMenuId("");
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            textAlign: "left",
                            padding: "8px 10px",
                            borderRadius: 8,
                            color: colors.text,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          deleteChat(s.id);
                          setOpenChatMenuId("");
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          padding: "8px 10px",
                          borderRadius: 8,
                          color: "#ef4444",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {sidebarFooterItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 10,
                cursor: "pointer",
                userSelect: "none",
                border: `1px solid ${colors.panelBorder}`,
                background: colors.btnBg,
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              <span style={{ width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </span>
              <span style={{ letterSpacing: 0.1 }}>{item.label}</span>
            </div>
          ))}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              border: `1px solid ${colors.btnBorder}`,
              background: colors.btnBg,
              color: colors.text,
              cursor: "pointer",
              padding: "6px 8px",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {colors.isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top header (hidden on New Chat / landing) */}
        {!isLanding ? (
          <header
            style={{
              height: 60,
              borderBottom: `1px solid ${colors.panelBorder}`,
              background: colors.headerBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.text,
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: 0.5,
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg,#38bdf8,#22c55e,#f59e0b,#ef4444)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              klynxai
            </span>
          </header>
        ) : null}

        {/* Landing mode */}
        {isLanding ? (
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
                <div style={{ marginBottom: 10 }}>
                  <img
                    src="/klynx-logo.png"
                    alt="Klynx AI"
                    style={{ height: 96, width: 96, objectFit: "contain", margin: "0 auto" }}
                  />
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: colors.muted }}>
                  Press Enter to send. Shift+Enter for new line. Attach files with +.
                </div>
              </div>

                <Composer
                  variant="landing"
                  colors={colors}
                  input={input}
                  setInput={setInput}
                  isBusy={isBusy}
                  isStreaming={isStreaming}
                  isTyping={isTyping}
                  onSend={() => void send()}
                  suggestionSeed={lastUserText}
                  attachments={attachments}
                  openFilePicker={openFilePicker}
                  removeAttachment={removeAttachment}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  composerRef={composerRef}
                />
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 24,
                background: colors.pageBg,
                color: colors.text,
              }}
            >
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {activeMessages.map((m, i) => {
                  const isLast = i === activeMessages.length - 1;
                  const showStop = isLast && m.role === "assistant" && (isStreaming || isTyping);
                  const rx = m.reactions || {};

                  const sources = m.role === "assistant" ? extractSourcesFromText(m.content, 4) : [];

                  return (
                    <div
                      key={i}
                      style={{
                        maxWidth: 900,
                        marginBottom: 18,
                        padding: 16,
                        borderRadius: 14,
                        background: m.role === "assistant" ? colors.cardAssistant : colors.cardUser,
                        color: m.role === "assistant" ? colors.text : "#fff",
                        marginLeft: m.role === "assistant" ? 0 : "auto",
                        boxShadow: m.role === "assistant" ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
                        border: m.role === "assistant" ? `1px solid ${colors.panelBorder}` : "none",
                      }}
                    >
                      {m.role === "assistant" ? (
                        <>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {normalizeAssistantText(m.content)}
                          </ReactMarkdown>
                          {showStop ? (
                            <span
                              style={{
                                display: "inline-block",
                                marginLeft: 4,
                                width: 6,
                                height: 16,
                                background: colors.isDark ? "#e5e7eb" : "#111827",
                                animation: "blink 1s step-end infinite",
                                verticalAlign: "text-bottom",
                              }}
                            />
                          ) : null}

                          {/* Perplexity-style sources */}
                          {sources.length > 0 ? (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 12, color: colors.muted, fontWeight: 800, marginBottom: 8 }}>
                                Sources
                              </div>
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {sources.map((s) => (
                                  <a
                                    key={s.url}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      textDecoration: "none",
                                      color: colors.text,
                                      border: `1px solid ${colors.panelBorder}`,
                                      background: colors.sourceBg,
                                      borderRadius: 12,
                                      padding: "10px 12px",
                                      minWidth: 220,
                                      maxWidth: 320,
                                      display: "block",
                                    }}
                                    title={s.url}
                                  >
                                    <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>
                                      {s.domain}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: colors.muted,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {s.title ? s.title : s.url}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 6, position: "relative" }}>
                              <button
                                onClick={() => copyText(m.content)}
                                title="Copy"
                                style={{
                                  border: `1px solid ${colors.btnBorder}`,
                                  background: colors.btnBg,
                                  color: colors.text,
                                  borderRadius: 10,
                                  width: 36,
                                  height: 32,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                  <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                              </button>
                              <button
                                onClick={() => toggleReaction(i, "up")}
                                title="Thumbs up"
                                style={{
                                  border: `1px solid ${colors.btnBorder}`,
                                  background: rx.up ? (colors.isDark ? "#1d4ed8" : "#dbeafe") : colors.btnBg,
                                  color: colors.text,
                                  borderRadius: 10,
                                  width: 36,
                                  height: 32,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M9 11V5l3-2 1 1-1 4h5a2 2 0 0 1 2 2l-2 6a2 2 0 0 1-2 1H9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                  <rect x="3" y="11" width="4" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                              </button>
                              <button
                                onClick={() => toggleReaction(i, "down")}
                                title="Thumbs down"
                                style={{
                                  border: `1px solid ${colors.btnBorder}`,
                                  background: rx.down ? (colors.isDark ? "#7f1d1d" : "#fee2e2") : colors.btnBg,
                                  color: colors.text,
                                  borderRadius: 10,
                                  width: 36,
                                  height: 32,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M15 13v6l-3 2-1-1 1-4H7a2 2 0 0 1-2-2l2-6a2 2 0 0 1 2-1h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                  <rect x="17" y="4" width="4" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                              </button>
                              <button
                                onClick={() => shareMessage(m.content)}
                                title="Share"
                                style={{
                                  border: `1px solid ${colors.btnBorder}`,
                                  background: colors.btnBg,
                                  color: colors.text,
                                  borderRadius: 10,
                                  width: 36,
                                  height: 32,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M12 5v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                  <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                  <rect x="5" y="13" width="14" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                              </button>
                              <button
                                onClick={() => regenerate(i)}
                                title="Regenerate"
                                style={{
                                  border: `1px solid ${colors.btnBorder}`,
                                  background: colors.btnBg,
                                  color: colors.text,
                                  borderRadius: 10,
                                  width: 36,
                                  height: 32,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                  <path d="M20 5v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setOpenMsgMenuId((prev) => (prev === String(i) ? "" : String(i)))}
                                title="More"
                                style={{
                                  border: `1px solid ${colors.btnBorder}`,
                                  background: colors.btnBg,
                                  color: colors.text,
                                  borderRadius: 10,
                                  width: 36,
                                  height: 32,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ...
                              </button>
                              {openMsgMenuId === String(i) ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: 36,
                                    minWidth: 180,
                                    borderRadius: 12,
                                    background: colors.isDark ? "#0b1220" : "#ffffff",
                                    border: `1px solid ${colors.panelBorder}`,
                                    boxShadow: colors.isDark ? "none" : "0 10px 30px rgba(0,0,0,0.12)",
                                    padding: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    zIndex: 20,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => branchFrom(i)}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      textAlign: "left",
                                      padding: "8px 10px",
                                      borderRadius: 8,
                                      color: colors.text,
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      fontSize: 13,
                                    }}
                                  >
                                    Branch in new chat
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      readAloud(m.content);
                                      setOpenMsgMenuId("");
                                    }}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      textAlign: "left",
                                      padding: "8px 10px",
                                      borderRadius: 8,
                                      color: colors.text,
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      fontSize: 13,
                                    }}
                                  >
                                    Read aloud
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </>
                      ) : (
                        m.content
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom composer */}
            <div
              style={{
                padding: 16,
                borderTop: `1px solid ${colors.panelBorder}`,
                background: colors.pageBg,
              }}
            >
                <Composer
                  variant="bottom"
                  colors={colors}
                  input={input}
                  setInput={setInput}
                  isBusy={isBusy}
                  isStreaming={isStreaming}
                  isTyping={isTyping}
                  onSend={() => void send()}
                  suggestionSeed={lastUserText}
                  attachments={attachments}
                  openFilePicker={openFilePicker}
                  removeAttachment={removeAttachment}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  composerRef={composerRef}
                />
            </div>
          </>
        )}
      </main>

      {isMoreOpen ? (
        <div
          ref={morePanelRef}
          style={{
            position: "fixed",
            left: 190,
            top: 140,
            zIndex: 20,
            width: 220,
            maxHeight: "70vh",
            overflowY: "auto",
            borderRadius: 14,
            border: `1px solid ${colors.panelBorder}`,
            background: colors.btnBg,
            padding: 8,
            boxShadow: colors.isDark ? "none" : "0 12px 30px rgba(0,0,0,0.14)",
          }}
        >
          {moreMenuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.action === "focus-search") {
                  searchInputRef.current?.focus();
                } else if (item.action === "open-attachments") {
                  openFilePicker();
                } else {
                  setInput(item.label);
                  setTimeout(() => composerRef.current?.focus(), 0);
                }
                setIsMoreOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                cursor: "pointer",
                userSelect: "none",
                color: colors.text,
                background: "transparent",
              }}
            >
              <span style={{ width: 20, textAlign: "center" }}>{item.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      <style>{`
        @keyframes blink {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

