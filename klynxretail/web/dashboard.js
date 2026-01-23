async function loadDashboard() {
  const res = await fetch("/api/analytics/summary");
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
