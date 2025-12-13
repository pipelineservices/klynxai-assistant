"use client";

export default function ThemeToggle() {
  function setTheme(t: string) {
    document.documentElement.setAttribute("data-theme", t);
  }

  return (
    <div style={{ padding: 8 }}>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </div>
  );
}

