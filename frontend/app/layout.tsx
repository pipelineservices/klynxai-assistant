
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "KLYNX AI Assistant",
  description: "Enterprise AI DevOps & Chat assistant"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
