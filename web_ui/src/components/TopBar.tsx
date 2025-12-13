import Badge from "@/components/ui/Badge";
import { API_BASE } from "@/lib/api";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">
          K
        </div>
        <div>
          <div className="text-sm font-semibold">KLYNX AI</div>
          <div className="text-xs text-slate-500">Incident Assistant</div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <Badge>API: {API_BASE}</Badge>
      </div>
    </div>
  );
}
