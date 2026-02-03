import type { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Section({ eyebrow, title, subtitle, children }: SectionProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-500 mb-3">{eyebrow}</p>
          ) : null}
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-3">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
