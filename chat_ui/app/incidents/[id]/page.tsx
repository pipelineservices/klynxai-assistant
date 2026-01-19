"use client";

import { useEffect, useState } from "react";

type Incident = {
  id: string;
  ts: number;
  summary: string;
  description: string;
  source: string;
  trace_id?: string | null;
  user_message: string;
  status: "open" | "applied" | "skipped" | "failed";
  last_action?: string | null;
  error?: string | null;
};

export default function IncidentPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function refresh() {
    const res = await fetch("/api/incidents", { cache: "no-store" });
    const data = await res.json();
    const found = (data.incidents || []).find((x: Incident) => x.id === id);
    setIncident(found || null);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, []);

  async function postAction(action: "apply" | "skip") {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/incidents/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setResult(data);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 44, marginBottom: 8 }}>Incident {id}</h1>

      {!incident ? (
        <p>Loading incident...</p>
      ) : (
        <>
          <div style={{ marginTop: 8 }}>
            <strong>Status:</strong>{" "}
            <span style={{ padding: "2px 10px", border: "1px solid #ccc", borderRadius: 999 }}>
              {incident.status}
            </span>
          </div>

          <div style={{ marginTop: 8 }}>
            <strong>Trace ID:</strong> {incident.trace_id || "-"}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>User message:</strong>
            <div style={{ marginTop: 4 }}>{incident.user_message}</div>
          </div>

          {incident.status === "failed" && incident.error ? (
            <div style={{ marginTop: 12, color: "#b91c1c" }}>
              <strong>Error:</strong> {incident.error}
            </div>
          ) : null}

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              disabled={loading}
              style={{
                padding: "10px 16px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={() => postAction("apply")}
            >
              {loading ? "Working..." : "Apply Auto-Fix"}
            </button>

            <button
              disabled={loading}
              style={{
                padding: "10px 16px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={() => postAction("skip")}
            >
              Skip
            </button>
          </div>

          {result ? (
            <pre
              style={{
                marginTop: 16,
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 8,
                overflow: "auto",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : null}
        </>
      )}
    </main>
  );
}

