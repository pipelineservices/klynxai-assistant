export const dynamic = "force-dynamic";

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

async function getIncidents(): Promise<Incident[]> {
  const res = await fetch("http://localhost:3000/api/incidents", {
    cache: "no-store",
  });
  const data = await res.json();
  return data.incidents || [];
}

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 40, marginBottom: 16 }}>🚨 Incidents</h1>

      {incidents.length === 0 ? (
        <p>No incidents found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {incidents.map((i) => (
            <a
              key={i.id}
              href={`/incidents/${i.id}`}
              style={{
                display: "block",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 14,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{i.summary}</strong>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                >
                  {i.status}
                </span>
              </div>

              <div style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}>
                <div>
                  <strong>ID:</strong> {i.id} &nbsp; | &nbsp;
                  <strong>Source:</strong> {i.source} &nbsp; | &nbsp;
                  <strong>Trace:</strong> {i.trace_id || "-"}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>User:</strong> {i.user_message}
                </div>
                {i.status === "failed" && i.error ? (
                  <div style={{ marginTop: 6, color: "#b91c1c" }}>
                    <strong>Error:</strong> {i.error}
                  </div>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

