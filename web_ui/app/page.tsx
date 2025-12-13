"use client";

import { useEffect, useState } from "react";
import { getIncidents } from "./lib/api";

type Incident = {
  id?: string;
  incident_id?: string;
  summary?: string;
  severity?: string;
  status?: string;
  cloud?: string;
  region?: string;
  created_at?: string;
};

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getIncidents()
      .then((data) => {
        // ✅ FIX: backend returns { items: [...] }
        if (Array.isArray(data?.items)) {
          setIncidents(data.items);
        } else {
          setIncidents([]);
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load incidents");
      });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>KLYNX AI</h1>
      <p style={{ color: "#4b5563" }}>Incident Monitoring</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table
        style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={th}>ID</th>
            <th style={th}>Summary</th>
            <th style={th}>Severity</th>
            <th style={th}>Cloud</th>
            <th style={th}>Region</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {incidents.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 16 }}>
                No incidents found
              </td>
            </tr>
          ) : (
            incidents.map((i, idx) => (
              <tr key={idx} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={td}>{i.id || i.incident_id || "-"}</td>
                <td style={td}>{i.summary || "-"}</td>
                <td style={td}>{i.severity || "-"}</td>
                <td style={td}>{i.cloud || "-"}</td>
                <td style={td}>{i.region || "-"}</td>
                <td style={td}>{i.status || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  fontSize: 14,
};

const td: React.CSSProperties = {
  padding: 12,
  fontSize: 14,
};

