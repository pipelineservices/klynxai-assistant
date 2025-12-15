import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KLYNX Chat",
  description: "Multi-LLM AI Chat Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
