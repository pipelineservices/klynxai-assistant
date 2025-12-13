
"use client";

import type { Dispatch, SetStateAction } from "react";

interface Props {
  theme: "light" | "dark";
  onThemeChange: Dispatch<SetStateAction<"light" | "dark">>;
}

export default function Sidebar({ theme, onThemeChange }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">KX</div>
        <div className="brand">
          <span className="title">KLYNX AI</span>
          <span className="subtitle">Enterprise</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active">New chat</button>
        <button className="nav-item">Incidents</button>
        <button className="nav-item">Pipelines</button>
        <button className="nav-item">Zero-Ops Flows</button>
      </nav>

      <div className="sidebar-footer">
        <div className="theme-toggle">
          <span>Theme</span>
          <div className="theme-buttons">
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => onThemeChange("light")}
            >
              ☀️
            </button>
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => onThemeChange("dark")}
            >
              🌙
            </button>
          </div>
        </div>
        <div className="user-pill">
          <div className="avatar">K</div>
          <div className="user-meta">
            <span className="name">KrishnaMohan</span>
            <span className="plan">Enterprise</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
