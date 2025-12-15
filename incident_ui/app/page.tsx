import IncidentTable from "../components/IncidentTable";

export default function IncidentPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>
        Incident Dashboard
      </h1>
      <IncidentTable />
    </div>
  );
}

