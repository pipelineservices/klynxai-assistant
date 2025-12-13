import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ className, variant = "secondary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition shadow-sm";
  const variants: Record<string, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 hover:bg-slate-100 border border-slate-200",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100"
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
