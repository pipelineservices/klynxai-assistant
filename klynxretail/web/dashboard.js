const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const applyBtn = document.getElementById("applyFilters");
const exportBtn = document.getElementById("exportCsv");

function buildQuery() {
  const qp = new URLSearchParams();
  const start = startInput.value;
  const end = endInput.value;
  if (start) qp.set("start", start);
  if (end) qp.set("end", end);
  if (token) qp.set("token", token);
  const q = qp.toString();
  return q ? `?${q}` : "";
}

async function loadDashboard() {
  const res = await fetch(`/api/analytics/summary${buildQuery()}`);
  const data = await res.json();

  document.getElementById("statViews").textContent = data.views ?? "-";
  document.getElementById("statChats").textContent = data.chats ?? "-";
  document.getElementById("statExports").textContent = data.exports ?? "-";
  document.getElementById("statConv").textContent = data.conversion ?? "-";

  const list = document.getElementById("topQueries");
  list.innerHTML = "";
  (data.top_queries || []).forEach((q) => {
    const li = document.createElement("li");
    li.textContent = `${q.query} (${q.count})`;
    list.appendChild(li);
  });

  const retailers = document.getElementById("topRetailers");
  retailers.innerHTML = "";
  (data.top_retailers || []).forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `${r.retailer} (${r.count})`;
    retailers.appendChild(li);
  });

  const funnel = document.getElementById("retailerFunnel");
  funnel.innerHTML = "";
  (data.retailer_funnel || []).forEach((r) => {
    const row = document.createElement("div");
    row.className = "event-row";
    row.textContent = `${r.retailer} • responses: ${r.responses} • exports: ${r.exports} • ${r.conversion}`;
    funnel.appendChild(row);
  });

  const events = document.getElementById("events");
  events.innerHTML = "";
  (data.events || []).forEach((e) => {
    const row = document.createElement("div");
    row.className = "event-row";
    row.textContent = `${e.ts} • ${e.event} • ${e.session_id}`;
    events.appendChild(row);
  });
}

loadDashboard();

applyBtn.addEventListener("click", loadDashboard);
exportBtn.addEventListener("click", () => {
  const url = `/api/analytics/export${buildQuery()}`;
  window.open(url, "_blank", "noopener,noreferrer");
});
