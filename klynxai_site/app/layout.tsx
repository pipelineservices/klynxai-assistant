import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Klynx AI",
  description: "The control plane for governed AI and autonomous operations.",
  icons: {
    icon: "/klynx-logo.png",
    apple: "/klynx-logo.png",
    shortcut: "/klynx-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-slate-950 text-white font-[var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
