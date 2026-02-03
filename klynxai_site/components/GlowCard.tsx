import type { ReactNode } from "react";

type GlowCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  accent?: string;
};

export default function GlowCard({ title, description, icon, accent }: GlowCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/40 bg-white/70 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-slate-900/50">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="h-full w-full"
          style={{
            background: accent ?? "radial-gradient(circle at top left, rgba(56,189,248,0.2), transparent 55%)",
          }}
        />
      </div>
      <div className="relative">
        {icon ? <div className="text-2xl mb-4">{icon}</div> : null}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}
