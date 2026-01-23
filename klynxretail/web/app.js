const messages = document.getElementById("messages");
const cards = document.getElementById("cards");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

const params = new URLSearchParams(window.location.search);
if (params.get("embed") === "1") {
  document.body.classList.add("embed");
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

async function send() {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";

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
  addMessage("assistant", data.reply || "Here are results.");
  renderCards(data.items || []);
  addComparison(data.items || []);
}

sendBtn.addEventListener("click", send);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
