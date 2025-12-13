"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { listIncidents } from "@/lib/api";
import type { IncidentItem } from "@/lib/types";
import { cn, formatTs } from "@/lib/utils";

export default function IncidentList({
  selectedThreadTs,
  onSelect
}: {
  selectedThreadTs: string | null;
  onSelect: (threadTs: string) => void;
}) {
  const [items, setItems] = useState<IncidentItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setErr(null);
      const data = await listIncidents(80);
      setItems(data);
      if (!selectedThreadTs && data[0]?.thread_ts) onSelect(data[0].thread_ts);
    } catch (e: any) {
      setErr(e?.message || "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => {
      return (
        (x.id || "").toLowerCase().includes(s) ||
        (x.summary || "").toLowerCase().includes(s) ||
        (x.severity || "").toLowerCase().includes(s) ||
        (x.cloud || "").toLowerCase().includes(s) ||
        (x.region || "").toLowerCase().includes(s) ||
        (x.status || "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search incidents..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button onClick={refresh} title="Refresh">
            ↻
          </Button>
        </div>
        {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}
      </div>

      <div className="flex-1 overflow-auto bg-slate-50">
        {loading ? (
          <div className="p-4 flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading incidents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">No incidents found.</div>
        ) : (
          <div className="p-2 space-y-2">
            {filtered.map((it) => {
              const active = it.thread_ts && it.thread_ts === selectedThreadTs;
              return (
                <button
                  key={it.thread_ts || it.id}
                  onClick={() => it.thread_ts && onSelect(it.thread_ts)}
                  className={cn(
                    "w-full text-left rounded-2xl border bg-white shadow-sm p-3 hover:bg-slate-50 transition",
                    active ? "border-slate-900 ring-2 ring-slate-200" : "border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold truncate">
                      {it.id || "INC-—"}{" "}
                      <span className="text-slate-500 font-normal">
                        {it.severity || "SEV-—"}
                      </span>
                    </div>
                    <Badge className="shrink-0">{it.status || "unknown"}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {it.summary || "(no summary)"}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{(it.cloud || "unknown").toUpperCase()}</span>
                    <span>•</span>
                    <span>{it.region || "unknown"}</span>
                    <span className="ml-auto">{formatTs(it.created_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
