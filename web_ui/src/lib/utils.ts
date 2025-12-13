export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatTs(ts?: string) {
  if (!ts) return "—";
  // backend stores iso; some fields may be slack ts
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.toLocaleString();
  return ts;
}
