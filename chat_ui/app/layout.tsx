import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klynx AI",
  description: "Klynx AI Command & Incident Center.",
  icons: {
    icon: "/klynx-logo.png",
    apple: "/klynx-logo.png",
    shortcut: "/klynx-logo.png",
  },
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
