"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { getIncidentByThread } from "@/lib/api";
import type { IncidentItem } from "@/lib/types";
import { formatTs } from "@/lib/utils";

export default function IncidentDetail({ threadTs }: { threadTs: string | null }) {
  const [item, setItem] = useState<IncidentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!threadTs) return;
    try {
      setLoading(true);
      setErr(null);
      const data = await getIncidentByThread(threadTs);
      setItem(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load incident");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadTs]);

  if (!threadTs) {
    return (
      <div className="h-full grid place-items-center text-sm text-slate-600">
        Select an incident
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full p-6 flex items-center gap-2 text-sm text-slate-600">
        <Spinner /> Loading incident...
      </div>
    );
  }

  if (err) {
    return (
      <div className="h-full p-6">
        <Card className="p-4">
          <div className="text-sm font-semibold">Error</div>
          <div className="mt-1 text-sm text-red-600">{err}</div>
          <div className="mt-3">
            <Button onClick={load} variant="primary">Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="h-full p-6 text-sm text-slate-600">
        Incident not found.
      </div>
    );
  }

  const plan = item.plan || {};
  const meta = plan.meta || {};
  const steps = plan.steps || [];
  const exec = plan.execution?.results || [];

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="p-4 md:p-6 space-y-4">
        <Card className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">
                {item.id || "INC-—"}{" "}
                <span className="text-slate-500 text-sm font-normal">
                  {item.severity || meta.severity || "SEV-—"}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {item.summary || meta.summary || "(no summary)"}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <Badge>{(item.cloud || meta.cloud || "unknown").toString().toUpperCase()}</Badge>
                <Badge>{item.region || meta.region || "unknown"}</Badge>
                <Badge>{item.status || "unknown"}</Badge>
                <span className="ml-1">Created: {formatTs(item.created_at)}</span>
                <span className="ml-1">Updated: {formatTs(item.last_updated_at)}</span>
              </div>
            </div>

            <Button onClick={load} title="Refresh" className="shrink-0">
              ↻
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm font-semibold">Probable Cause</div>
            <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
              {item.probable_cause || plan.probable_cause || "—"}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold">Analysis</div>
            <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
              {item.analysis_text || plan.analysis_text || "—"}
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Auto-Fix Plan</div>
            <Badge>dry-run default: {String(meta.dry_run_default ?? true)}</Badge>
          </div>

          <div className="mt-3 space-y-3">
            {steps.length === 0 ? (
              <div className="text-sm text-slate-600">No plan steps stored.</div>
            ) : (
              steps.map((s, idx) => (
                <div key={s.id || idx} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">
                      {idx + 1}. {s.title || "Untitled step"}
                    </div>
                    <Badge>risk: {s.risk || "unknown"}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                    <div className="font-semibold text-slate-700">Dry-run:</div>
                    {s.dry_run_cmd || "—"}
                  </div>
                  <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                    <div className="font-semibold text-slate-700">Apply:</div>
                    {s.apply_cmd || "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">Execution Logs</div>
          <div className="mt-3 space-y-2">
            {exec.length === 0 ? (
              <div className="text-sm text-slate-600">
                No execution results recorded yet. (Click Apply Auto-Fix in Slack to store dry-run output.)
              </div>
            ) : (
              exec.map((r, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{r.title || r.step_id || "Step"}</div>
                    <div className="flex items-center gap-2">
                      <Badge>{r.mode || "—"}</Badge>
                      <Badge>{r.status || "—"}</Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                    <div className="font-semibold text-slate-700">Command:</div>
                    {r.command || "—"}
                  </div>
                  <div className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                    <div className="font-semibold text-slate-700">Output:</div>
                    {r.output || "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
