"use client";

export default function ThemeToggle({
  isDark,
  onToggle,
  colors,
}: {
  isDark: boolean;
  onToggle: () => void;
  colors: any;
}) {
  return (
    <button
      onClick={onToggle}
      title="Toggle dark/light"
      style={{
        width: 44,
        padding: "10px 0",
        borderRadius: 10,
        border: `1px solid ${colors.btnBorder}`,
        background: colors.btnBg,
        color: colors.text,
        cursor: "pointer",
        fontWeight: 900,
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

