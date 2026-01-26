const messages = document.getElementById("messages");
const cards = document.getElementById("cards");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const embedBar = document.getElementById("embedBar");
const embedLogo = document.getElementById("embedLogo");
const embedTitle = document.getElementById("embedTitle");
const exportCartBtn = document.getElementById("exportCart");
const checkoutLink = document.getElementById("checkoutLink");
const sendToGovBtn = document.getElementById("sendToGov");
const governanceBanner = document.getElementById("governanceBanner");
const policyRisk = document.getElementById("policyRisk");
const policyDetails = document.getElementById("policyDetails");
const decisionQueue = document.getElementById("decisionQueue");
let lastItems = [];
let lastDecisions = [];

const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") {
  document.body.classList.add("embed");
}
const brandName = params.get("brandName");
const brandLogo = params.get("brandLogo");
if (document.body.classList.contains("embed")) {
  embedBar.classList.remove("hidden");
  if (brandName) embedTitle.textContent = brandName;
  if (brandLogo) {
    embedLogo.src = brandLogo;
    embedLogo.alt = brandName || "Brand";
  } else {
    embedLogo.classList.add("hidden");
  }
}

const sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
function track(event, metadata = {}) {
  const payload = JSON.stringify({ event, session_id: sessionId, metadata });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", payload);
  } else {
    fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
  }
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}


function addComparison(items) {
  if (!items || !items.length) return;
  const wrap = document.createElement("div");
  wrap.className = "msg assistant";
  const title = document.createElement("div");
  title.className = "cmp-title";
  title.textContent = "Comparison";
  const list = document.createElement("ul");
  list.className = "cmp-list";
  items.slice(0,5).forEach((p) => {
    const li = document.createElement("li");
    const rating = (p.rating != null) ? p.rating.toFixed(1) : "-";
    li.textContent = `${p.title} | ${p.currency || "USD"} ${p.price} | ${rating} | ${p.retailer}`;
    list.appendChild(li);
  });
  wrap.appendChild(title);
  wrap.appendChild(list);
  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
}

function renderCards(items) {
  cards.innerHTML = "";
  lastItems = items || [];
  exportCartBtn.disabled = !(lastItems && lastItems.length);
  checkoutLink.classList.add("hidden");
  checkoutLink.textContent = "";
  items.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    const img = document.createElement("img");
    img.src = (p.images && p.images[0]) || "https://placehold.co/600x400?text=Product";
    img.alt = p.title;
    const body = document.createElement("div");
    body.className = "card-body";
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = p.title;
    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = `${p.retailer} | ${p.brand} | ${p.availability || "in_stock"}`;
    const price = document.createElement("div");
    price.className = "price";
    price.textContent = `${p.currency || "USD"} ${p.price}`;
    const link = document.createElement("a");
    link.className = "link";
    link.href = p.url || "#";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = p.url ? "View" : "No link";

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(price);
    body.appendChild(link);
    card.appendChild(img);
    card.appendChild(body);
    cards.appendChild(card);
  });
}

function renderGovernance(decisions, banner) {
  lastDecisions = decisions || [];
  if (!decisions || !decisions.length) {
    governanceBanner.classList.add("hidden");
    decisionQueue.innerHTML = "";
    sendToGovBtn.disabled = true;
    return;
  }
  governanceBanner.classList.remove("hidden");
  policyRisk.textContent = `Risk level: ${banner.risk_level} | Max score: ${banner.max_risk_score}`;
  policyDetails.textContent = `Policy: ${banner.policy} · Approvals required: ${banner.approval_required} · Blocked: ${banner.blocked}`;
  sendToGovBtn.disabled = false;

  decisionQueue.innerHTML = "";
  decisions.forEach((d) => {
    const card = document.createElement("div");
    card.className = "queue-card";
    const title = document.createElement("div");
    title.className = "queue-title";
    title.textContent = `${d.decision_type.replace(/_/g, " ")} — ${d.item_title}`;
    const meta = document.createElement("div");
    meta.className = "queue-meta";
    const status = document.createElement("span");
    const statusClass = d.status === "pending_approval" ? "pending" : (d.status === "blocked_by_policy" ? "blocked" : "ready");
    status.className = `queue-status ${statusClass}`;
    status.textContent = d.status.replace(/_/g, " ");
    const impact = document.createElement("span");
    impact.textContent = `Impact: ${d.currency} ${d.impact_value}`;
    const policy = document.createElement("span");
    policy.textContent = `Policy: ${d.policy_decision} (${d.policy_reason})`;
    const risk = document.createElement("span");
    risk.textContent = `Risk score: ${d.risk_score}`;
    meta.appendChild(status);
    meta.appendChild(impact);
    meta.appendChild(policy);
    meta.appendChild(risk);
    card.appendChild(title);
    card.appendChild(meta);
    decisionQueue.appendChild(card);
  });
}

async function send() {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  track("chat.submit", { text });

  const payload = {
    messages: [
      { role: "user", content: text }
    ]
  };

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  addMessage("assistant", data.reply || "Pending Approval: recommendations sent to governance queue.");
  renderCards(data.items || []);
  addComparison(data.items || []);
  if (data.governance) {
    renderGovernance(data.governance.decisions || [], data.governance.banner || { risk_level: "LOW", max_risk_score: 0, policy: "retail_governance", approval_required: 0, blocked: 0 });
  } else {
    renderGovernance([], {});
  }
  const retailers = Array.from(new Set((data.items || []).map((i) => i.retailer).filter(Boolean)));
  track("chat.response", { items: (data.items || []).length, retailers });
}

async function exportCart() {
  if (!lastItems || !lastItems.length) return;
  exportCartBtn.disabled = true;
  const retailers = Array.from(new Set(lastItems.map((i) => i.retailer).filter(Boolean)));
  track("cart.export", { items: lastItems.length, retailers });
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: lastItems })
  });
  const data = await res.json();
  if (data.checkout_url) {
    checkoutLink.textContent = `Checkout link: ${data.checkout_url}`;
    checkoutLink.classList.remove("hidden");
    window.open(data.checkout_url, "_blank", "noopener,noreferrer");
  }
  exportCartBtn.disabled = false;
}

sendBtn.addEventListener("click", send);
exportCartBtn.addEventListener("click", exportCart);
sendToGovBtn.addEventListener("click", async () => {
  if (!lastDecisions.length) return;
  const res = await fetch("/api/governance/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision_ids: lastDecisions.map((d) => d.id) })
  });
  const data = await res.json();
  addMessage("assistant", `Governance queue updated. Submitted ${data.submitted?.length || 0} decisions.`);
  track("governance.submit", { submitted: data.submitted?.length || 0 });
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

track("page.view", { embed: document.body.classList.contains("embed") });
