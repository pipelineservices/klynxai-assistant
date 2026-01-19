"use client";

import React from "react";

export type TabKey =
  | "new"
  | "search"
  | "images"
  | "social"
  | "apps"
  | "codex"
  | "gpts"
  | "projects"
  | "cloud";

export type TabItem = {
  key: TabKey;
  label: string;
  icon: string; // emoji
  color: string; // text color
};

export const DEFAULT_TABS: TabItem[] = [
  { key: "new", label: "New Chat", icon: "📝", color: "#2563eb" },
  { key: "search", label: "Search Chats", icon: "🔍", color: "#22c55e" },
  { key: "images", label: "Images", icon: "🖼", color: "#a855f7" },
  { key: "social", label: "Social", icon: "🌐", color: "#06b6d4" },
  { key: "apps", label: "Apps", icon: "🧩", color: "#f97316" },
  { key: "codex", label: "Codex", icon: "💻", color: "#eab308" },
  { key: "gpts", label: "GPTs", icon: "🤖", color: "#10b981" },
  { key: "projects", label: "Projects", icon: "📁", color: "#ef4444" },
  { key: "cloud", label: "Cloud", icon: "☁️", color: "#3b82f6" },
];

export default function Tabs({
  active,
  onSelect,
  colors,
  items = DEFAULT_TABS,
}: {
  active: TabKey;
  onSelect: (k: TabKey) => void;
  colors: any;
  items?: TabItem[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(t.key)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 10px",
              borderRadius: 12,
              border: `1px solid ${colors.panelBorder}`,
              background: isActive ? (colors.isDark ? "rgba(37,99,235,0.18)" : "#dbeafe") : colors.btnBg,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 18, color: t.color }}>{t.icon}</span>
            <span
              style={{
                fontWeight: 900,
                color: colors.text,
                fontSize: 13,
                letterSpacing: 0.2,
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

