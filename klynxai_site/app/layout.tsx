import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Klynx AI",
  description: "The control plane for governed AI and autonomous operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-white text-slate-900 font-[var(--font-sora)]">
        {children}
      </body>
    </html>
  );
}
