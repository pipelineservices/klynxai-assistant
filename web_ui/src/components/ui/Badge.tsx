import { cn } from "@/lib/utils";

export default function Badge({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700",
        className
      )}
    >
      {children}
    </span>
  );
}
