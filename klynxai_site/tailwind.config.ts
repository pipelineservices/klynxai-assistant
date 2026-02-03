import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0f1f",
        night: "#0f172a",
        steel: "#1f2937",
        mist: "#e2e8f0",
        cyan: "#38bdf8",
        aurora: "#22d3ee",
        ember: "#f97316",
        gold: "#f59e0b",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,0.15), 0 30px 80px rgba(15,23,42,0.35)",
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.1) 1px, transparent 1px)",
        "hero-radial": "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.2), transparent 40%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
