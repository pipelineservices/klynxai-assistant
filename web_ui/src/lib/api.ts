import type { IncidentItem } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8000";

async function http<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listIncidents(limit = 50): Promise<IncidentItem[]> {
  const data = await http<{ items: IncidentItem[] }>(`/api/incidents?limit=${limit}`);
  return data.items || [];
}

export async function getIncidentByThread(threadTs: string): Promise<IncidentItem | null> {
  const data = await http<{ item: IncidentItem | null }>(
    `/api/incidents/by-thread/${encodeURIComponent(threadTs)}`
  );
  return data.item || null;
}

export { API_BASE };
