const API_BASE = "/api/backend";

export async function getIncidents() {
  const res = await fetch(`${API_BASE}/api/incidents`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function getIncident(id: string) {
  const res = await fetch(`${API_BASE}/api/incidents/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch incident");
  return res.json();
}
