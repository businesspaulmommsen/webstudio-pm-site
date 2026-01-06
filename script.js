(function () {
  "use strict";

  function get(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function setText(el, value) {
    if (value === undefined || value === null) return;
    el.textContent = String(value);
  }

  function setHref(el, value) {
    if (!value) return;
    el.setAttribute("href", value);
  }

  function setSrc(el, value) {
    if (!value) return;
    el.setAttribute("src", value);
  }

  function fillSimpleFields(data) {
    document.querySelectorAll("[data-fill]").forEach((el) => {
      const path = el.getAttribute("data-fill");
      let value = get(data, path);

      if (typeof value === "string" && value.includes("{year}")) {
        value = value.replace("{year}", String(new Date().getFullYear()));
      }
      setText(el, value);
    });

    document.querySelectorAll("[data-href]").forEach((el) => {
      const path = el.getAttribute("data-href");
      setHref(el, get(data, path));
    });

    document.querySelectorAll("[data-src]").forEach((el) => {
      const path = el.getAttribute("data-src");
      setSrc(el, get(data, path));
    });

    document.querySelectorAll("[data-iframe-src]").forEach((el) => {
      const path = el.getAttribute("data-iframe-src");
      const src = get(data, path);
      if (src) el.setAttribute("src", src);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("`", "&#96;");
  }

  function renderMenu(data) {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;
    const items = (data.menu && data.menu.items) ? data.menu.items : [];

    grid.innerHTML = items.map((it) => {
      const name = it.name || "";
      const desc = it.desc || "";
      const price = it.price || "";
      const tag = it.tag || "";
      return `
        <article class="menu-card">
          <div class="menu-name">${escapeHtml(name)}</div>
          <div class="menu-desc">${escapeHtml(desc)}</div>
          <div class="menu-meta">
            <span>${escapeHtml(tag)}</span>
            <span class="price">${escapeHtml(price)}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderGallery(data) {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;
    const imgs = (data.gallery && data.gallery.images) ? data.gallery.images : [];

    grid.innerHTML = imgs.map((src) => `
      <div class="gallery-item">
        <img src="${escapeAttr(src)}" alt="Foto" loading="lazy" />
      </div>
    `).join("");
  }

  function renderHours(data) {
    const list = document.getElementById("hoursList");
    if (!list) return;
    const weekly = (data.hours && data.hours.weekly) ? data.hours.weekly : [];

    list.innerHTML = weekly.map((h) => `
      <div class="hours-row">
        <span>${escapeHtml(h.day || "")}</span>
        <span>${escapeHtml(h.time || "")}</span>
      </div>
    `).join("");
  }

  function wireForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Demo: Formular ist nicht verbunden. Später kannst du hier z. B. Formspree / Backend anbinden.");
      form.reset();
    });
  }

  async function init() {
    // Erwartet: content.json liegt neben index.html
    const res = await fetch("content.json", { cache: "no-store" });
    if (!res.ok) throw new Error("content.json konnte nicht geladen werden: " + res.status);
    const data = await res.json();

    fillSimpleFields(data);
    renderMenu(data);
    renderGallery(data);
    renderHours(data);

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    wireForm();
  }

  init().catch((err) => {
    console.error("Template init failed:", err);
  });
})();