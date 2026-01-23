(function () {
  const cfg = window.KlynxRetailWidget || {};
  const baseUrl = (cfg.baseUrl || "https://retail.klynxai.com").replace(/\/$/, "");
  const label = cfg.label || "Rufus";
  const accent = cfg.accent || "#2563eb";
  const position = cfg.position || "right";

  const style = document.createElement("style");
  style.textContent = `
    .klynx-retail-launcher {
      position: fixed;
      ${position}: 16px;
      bottom: 16px;
      z-index: 2147483647;
      background: ${accent};
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 10px 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: Arial, sans-serif;
    }
    .klynx-retail-drawer {
      position: fixed;
      top: 0;
      ${position}: 0;
      width: min(420px, 96vw);
      height: 100vh;
      background: #fff;
      box-shadow: -12px 0 30px rgba(15, 23, 42, 0.2);
      transform: translateX(${position === "right" ? "100%" : "-100%"});
      transition: transform 0.25s ease;
      z-index: 2147483646;
      display: flex;
      flex-direction: column;
      border-left: 1px solid #e2e8f0;
    }
    .klynx-retail-drawer.open {
      transform: translateX(0);
    }
    .klynx-retail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-family: Arial, sans-serif;
      font-weight: 700;
    }
    .klynx-retail-close {
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
    .klynx-retail-iframe {
      border: none;
      width: 100%;
      height: 100%;
      flex: 1;
    }
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.className = "klynx-retail-launcher";
  button.type = "button";
  button.textContent = label;

  const drawer = document.createElement("div");
  drawer.className = "klynx-retail-drawer";

  const header = document.createElement("div");
  header.className = "klynx-retail-header";
  header.textContent = cfg.title || "Klynx Retail Assistant";

  const close = document.createElement("button");
  close.className = "klynx-retail-close";
  close.type = "button";
  close.textContent = "×";

  const iframe = document.createElement("iframe");
  iframe.className = "klynx-retail-iframe";
  iframe.src = `${baseUrl}/?embed=1`;
  iframe.title = "Klynx Retail Assistant";

  header.appendChild(close);
  drawer.appendChild(header);
  drawer.appendChild(iframe);

  function openDrawer() {
    drawer.classList.add("open");
  }

  function closeDrawer() {
    drawer.classList.remove("open");
  }

  button.addEventListener("click", () => {
    if (drawer.classList.contains("open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });
  close.addEventListener("click", closeDrawer);

  document.body.appendChild(button);
  document.body.appendChild(drawer);
})();
