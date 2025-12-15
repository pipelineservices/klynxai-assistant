"use client";

type Incident = {
  id: string;
  service: string;
  status: string;
  severity: string;
  time: string;
};

const incidents: Incident[] = [
  {
    id: "INC-101",
    service: "Chat Backend",
    status: "Open",
    severity: "High",
    time: "2025-12-13 16:40 UTC",
  },
  {
    id: "INC-102",
    service: "Chat UI",
    status: "Resolved",
    severity: "Medium",
    time: "2025-12-12 10:15 UTC",
  },
];

export default function IncidentTable() {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Service</th>
          <th>Status</th>
          <th>Severity</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((i) => (
          <tr key={i.id}>
            <td>{i.id}</td>
            <td>{i.service}</td>
            <td>{i.status}</td>
            <td style={{
              color:
                i.severity === "High"
                  ? "red"
                  : i.severity === "Medium"
                  ? "orange"
                  : "green",
            }}>
              {i.severity}
            </td>
            <td>{i.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

