"use client";

export default function Sidebar({
  chats,
  active,
  onSelect,
}: {
  chats: string[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: 240,
        background: "#0f172a",
        color: "#fff",
        padding: 16,
      }}
    >
      <h3 style={{ marginBottom: 16 }}>KLYNX</h3>

      {chats.map((id) => (
        <div
          key={id}
          onClick={() => onSelect(id)}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            cursor: "pointer",
            background: active === id ? "#1e293b" : "transparent",
            marginBottom: 6,
            fontSize: 14,
          }}
        >
          Chat {id}
        </div>
      ))}
    </div>
  );
}

