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
const scanTools = document.getElementById("scanTools");
const scanModal = document.getElementById("scanModal");
const scanVideo = document.getElementById("scanVideo");
const scanModalClose = document.getElementById("scanModalClose");
const scanModalTitle = document.getElementById("scanModalTitle");
const scanHint = document.getElementById("scanHint");
const scanImageInput = document.getElementById("scanImageInput");
const scanNote = scanTools ? scanTools.querySelector(".scan-note") : null;
const intelFields = document.getElementById("intelFields");
const intelBadges = document.getElementById("intelBadges");
const integrationGrid = document.getElementById("integrationGrid");
let lastItems = [];
let lastDecisions = [];
let scanMode = "typed";
let scanStream = null;
let scanDetector = null;
let scanActive = false;

const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") {
  document.body.classList.add("embed");
}
const isFuturistic = params.get("ui") === "futuristic";
if (isFuturistic) {
  document.body.dataset.theme = "futuristic";
}
const brandName = params.get("brandName");
const brandLogo = params.get("brandLogo");
const showEmbedBar = params.get("embedBar") === "1";
if (document.body.classList.contains("embed") && showEmbedBar && embedBar && embedTitle && embedLogo) {
  embedBar.classList.remove("hidden");
  if (brandName) embedTitle.textContent = brandName;
  if (brandLogo) {
    embedLogo.src = brandLogo;
    embedLogo.alt = brandName || "Brand";
  } else {
    embedLogo.classList.add("hidden");
  }
}

const mockIntel = {
  safety: { label: "Safe", tone: "safe" },
  ingredients: "Water, natural flavors, citrus extract, vitamin C",
  chemicals: "No parabens detected",
  allergens: "May contain traces of soy",
  sustainability: "82/100 (recyclable packaging)",
  compliance: "FDA: compliant · EU: compliant · CA Prop 65: low risk",
};
const mockIntegrations = [
  { name: "Amazon", status: "Connected via Partner API (Demo Mode)" },
  { name: "Best Buy", status: "Connected via Partner API (Demo Mode)" },
  { name: "Walmart", status: "Connected via Partner API (Demo Mode)" },
  { name: "Global Retailers", status: "Connected via Partner API (Demo Mode)" },
];

function renderProductIntel(contextLabel) {
  if (!intelFields) return;
  if (intelBadges) {
    intelBadges.innerHTML = "";
    const badge = document.createElement("span");
    badge.className = `badge ${mockIntel.safety.tone}`;
    badge.textContent = `Safety: ${mockIntel.safety.label}`;
    intelBadges.appendChild(badge);
    const infoBadge = document.createElement("span");
    infoBadge.className = "badge info";
    infoBadge.textContent = "Mock data";
    intelBadges.appendChild(infoBadge);
  }
  const rows = [
    ["Ingredients / Materials", mockIntel.ingredients],
    ["Chemicals / Parabens", mockIntel.chemicals],
    ["Allergens", mockIntel.allergens],
    ["Sustainability", mockIntel.sustainability],
    ["Compliance", mockIntel.compliance],
  ];
  intelFields.innerHTML = "";
  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "intel-row";
    row.innerHTML = `<span>${label}</span><span>${value}</span>`;
    intelFields.appendChild(row);
  });
  if (contextLabel) {
    const row = document.createElement("div");
    row.className = "intel-row";
    row.innerHTML = `<span>Source</span><span>${contextLabel}</span>`;
    intelFields.appendChild(row);
  }
}

function renderIntegrations() {
  if (!integrationGrid) return;
  integrationGrid.innerHTML = "";
  mockIntegrations.forEach((item) => {
    const card = document.createElement("div");
    card.className = "integration-card";
    card.innerHTML = `<div class="integration-title">${item.name}</div><div class="integration-sub">${item.status}</div>`;
    integrationGrid.appendChild(card);
  });
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

function setScanNote(text) {
  if (scanNote) scanNote.textContent = text;
}

function setScanActiveButton(mode) {
  if (!scanTools) return;
  const buttons = scanTools.querySelectorAll(".scan-btn");
  buttons.forEach((btn) => {
    if (!(btn instanceof HTMLElement)) return;
    const btnMode = btn.getAttribute("data-scan");
    if (btnMode === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function stopCameraScan() {
  scanActive = false;
  if (scanVideo) {
    scanVideo.pause();
    scanVideo.srcObject = null;
  }
  if (scanStream) {
    scanStream.getTracks().forEach((track) => track.stop());
    scanStream = null;
  }
  if (scanModal) scanModal.classList.add("hidden");
}

function handleScanValue(value, mode) {
  if (!value) return;
  input.value = value;
  addMessage("user", `${mode.toUpperCase()} scan: ${value}`);
  send();
  track("scan.complete", { mode, value });
}

async function startCameraScan(mode) {
  if (!scanVideo || !scanModal || !scanModalTitle || !scanHint) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    addMessage("assistant", "Camera access is not supported in this browser.");
    return;
  }
  if (!("BarcodeDetector" in window)) {
    addMessage("assistant", "Barcode scanning is not supported in this browser. Try Image instead.");
    return;
  }

  const formats = mode === "qr"
    ? ["qr_code"]
    : ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "qr_code", "pdf417", "data_matrix", "aztec"];

  scanDetector = new BarcodeDetector({ formats });
  scanModalTitle.textContent = mode === "qr" ? "QR Scan" : "Barcode Scan";
  scanHint.textContent = "Align the code inside the frame.";
  scanModal.classList.remove("hidden");

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    scanVideo.srcObject = scanStream;
    await scanVideo.play();
    scanActive = true;
  } catch (error) {
    addMessage("assistant", "Camera permission denied or unavailable.");
    stopCameraScan();
    return;
  }

  const scanLoop = async () => {
    if (!scanActive || !scanDetector || !scanVideo) return;
    try {
      const results = await scanDetector.detect(scanVideo);
      if (results && results.length) {
        const value = results[0].rawValue || results[0].data || "";
        handleScanValue(value, mode);
        stopCameraScan();
        return;
      }
    } catch (error) {
      // ignore and keep scanning
    }
    requestAnimationFrame(scanLoop);
  };
  requestAnimationFrame(scanLoop);
}

async function handleImageScan(file) {
  if (!file) return;
  if ("BarcodeDetector" in window) {
    try {
      const detector = new BarcodeDetector({
        formats: ["qr_code", "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "pdf417", "data_matrix", "aztec"],
      });
      const bitmap = await createImageBitmap(file);
      const results = await detector.detect(bitmap);
      if (results && results.length) {
        const value = results[0].rawValue || results[0].data || file.name;
        handleScanValue(value, "image");
        return;
      }
    } catch (error) {
      // fall through
    }
  }
  addMessage("assistant", `Image received: ${file.name}`);
  track("scan.image.upload", { name: file.name, size: file.size });
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
  if (isFuturistic) {
    renderProductIntel("Typed query");
  }
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

if (isFuturistic) {
  renderProductIntel("Demo data");
  renderIntegrations();
}

if (scanTools) {
  setScanActiveButton("typed");
  setScanNote("Type mode ready.");

  scanTools.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const scanType = target.getAttribute("data-scan");
    if (!scanType) return;
    scanMode = scanType;
    setScanActiveButton(scanType);
    stopCameraScan();

    if (scanType === "typed") {
      setScanNote("Type mode ready.");
      input.focus();
      return;
    }

    if (scanType === "image") {
      setScanNote("Select an image to analyze.");
      if (scanImageInput) scanImageInput.click();
      return;
    }

    if (scanType === "barcode" || scanType === "qr") {
      setScanNote("Requesting camera access...");
      startCameraScan(scanType);
      return;
    }
  });
}

if (scanModalClose) {
  scanModalClose.addEventListener("click", () => {
    stopCameraScan();
  });
}

if (scanImageInput) {
  scanImageInput.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const file = target.files && target.files[0];
    if (file) handleImageScan(file);
    target.value = "";
  });
}
