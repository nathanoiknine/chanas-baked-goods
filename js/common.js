/* Shared behavior for Chana's Baked Goods.
   Edit words, menu, and announcements in content/*.json — see UPDATE.md. */

(function () {
  const CART_KEY = "chanas-baked-goods-cart";
  const DETAILS_KEY = "chanas-baked-goods-details";

  const NAV = [
    { href: "index.html", id: "home", label: "Home" },
    { href: "menu.html", id: "menu", label: "Menu" },
    { href: "about.html", id: "about", label: "About" },
    { href: "announcements.html", id: "updates", label: "Updates" },
    { href: "pickup.html", id: "pickup", label: "Pickup" },
    { href: "custom.html", id: "custom", label: "Custom" },
    { href: "contact.html", id: "contact", label: "Contact" }
  ];

  const cache = {};

  function loadJson(path) {
    if (!cache[path]) {
      cache[path] = fetch(path, { cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error(path);
        return response.json();
      });
    }
    return cache[path];
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function businessOf(site) {
    return Object.assign({
      name: "Chana's Baked Goods",
      baker: "Chana Oiknine",
      phoneDisplay: "413-355-3682",
      phoneSms: "+14133553682",
      location: "Pacific Beach, San Diego",
      tagline: "Small-batch baking, made from scratch.",
      footerSignoff: "Baked with care"
    }, (site && site.business) || {});
  }

  function money(value) {
    const cents = Math.round(Number(value) * 100) % 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0
    }).format(value);
  }

  function normalizePrice(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function priceLabel(item) {
    const price = normalizePrice(item.price);
    if (price === null) return "Price by message";
    const formatted = money(price);
    return item.unit ? formatted + " / " + item.unit : formatted;
  }

  function minDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function formatWhen(iso) {
    if (!iso) return "";
    const date = new Date(iso + "T00:00:00");
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((line) => line && line.id)
        .map((line) => ({
          id: String(line.id),
          name: String(line.name || "Item"),
          price: normalizePrice(line.price),
          unit: line.unit || "",
          qty: clampQty(line.qty)
        }))
        .filter((line) => line.qty > 0);
    } catch (error) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("bakery:cart"));
  }

  function clampQty(value) {
    const number = Math.floor(Number(value));
    if (!Number.isFinite(number) || number < 0) return 0;
    return Math.min(99, number);
  }

  function setQty(item, qty) {
    const nextQty = clampQty(qty);
    const cart = readCart().filter((line) => line.id !== item.id);
    if (nextQty > 0) {
      cart.push({
        id: item.id,
        name: item.name,
        price: normalizePrice(item.price),
        unit: item.unit || "",
        qty: nextQty
      });
    }
    writeCart(cart);
    const status = document.getElementById("cart-status");
    if (status) {
      status.textContent = nextQty > 0
        ? item.name + ", quantity " + nextQty + ", in checkout."
        : item.name + " removed from checkout.";
    }
    return nextQty;
  }

  function clearCart() {
    writeCart([]);
  }

  function cartCount(items) {
    return (items || readCart()).reduce((sum, line) => sum + line.qty, 0);
  }

  function totals(lines) {
    let sum = 0;
    let priced = true;
    lines.forEach((line) => {
      const price = normalizePrice(line.price);
      if (price === null) priced = false;
      else sum += price * line.qty;
    });
    return { sum, complete: priced, count: cartCount(lines) };
  }

  function readDetails() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(DETAILS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeDetails(details) {
    sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details));
  }

  function menuIndex(menu) {
    const map = {};
    (menu.categories || []).forEach((category) => {
      (category.items || []).forEach((item) => {
        map[item.id] = Object.assign({}, item, { category: category.name, categoryId: category.id });
      });
    });
    return map;
  }

  function icon(name) {
    const paths = {
      sourdough: '<path d="M12 30c0-8 5-14 12-14s12 6 12 14v6H12v-6z"/><path d="M20 24c1.5 3 6.5 3 8 0"/>',
      cookies: '<circle cx="18" cy="20" r="7"/><circle cx="30" cy="27" r="8"/>',
      "cookie-platters": '<ellipse cx="24" cy="30" rx="14" ry="5"/><ellipse cx="24" cy="24" rx="9" ry="3.5"/>',
      cakes: '<path d="M16 36h16M17 36v-7h14v7M20 29v-6h8v6M24 16v7"/>',
      "lemon-bars": '<rect x="13" y="14" width="22" height="20" rx="1.5"/><path d="M24 14v20M13 24h22"/>',
      rugelach: '<path d="M14 32c6-14 18-14 22-2-8-1-14 0-22 2z"/>',
      "dessert-cups": '<path d="M16 16h16l-1.6 14a8 8 0 0 1-12.8 0z"/><path d="M18 16c1-3 11-3 12 0"/>',
      pavlova: '<path d="M11 32c4-12 22-12 26 0"/><path d="M18 32c2-6 10-6 12 0"/>'
    };
    const body = paths[name] || '<circle cx="24" cy="24" r="8"/>';
    return '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + body + "</svg>";
  }

  function allergenHtml(site) {
    const allergen = (site && site.allergen) || {};
    return '<aside class="notice" id="allergen"><p class="notice-label">' + esc(allergen.heading || "Allergens") + "</p><p>" + esc(allergen.full || "") + "</p></aside>";
  }

  function smsHref(site, text) {
    const biz = businessOf(site);
    const body = text.length > 1400 ? text.slice(0, 1400) + "..." : text;
    return "sms:" + biz.phoneSms + "?body=" + encodeURIComponent(body);
  }

  function safeHttps(url) {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      button.textContent = "Copied";
    }
  }

  function fillConfirmation(element, options) {
    const site = options.site;
    const biz = businessOf(site);
    const sms = smsHref(site, options.text);
    element.innerHTML = [
      "<h2>" + esc(options.title) + "</h2>",
      "<p>" + esc(options.message) + "</p>",
      '<p><a class="btn btn-primary" href="' + esc(sms) + '">Text ' + esc(biz.phoneDisplay) + "</a></p>",
      '<pre class="summary"></pre>',
      '<div class="form-actions">',
      '<button type="button" class="btn btn-ghost" data-copy>Copy summary</button>',
      options.share ? '<button type="button" class="btn btn-ghost" data-share>Share</button>' : "",
      '<button type="button" class="linkish" data-print>Print</button>',
      "</div>",
      options.note ? '<p class="hint">' + esc(options.note) + "</p>" : ""
    ].join("");
    element.querySelector(".summary").textContent = options.text;
    element.querySelector("[data-copy]").addEventListener("click", (event) => {
      copyText(options.text, event.currentTarget);
    });
    const share = element.querySelector("[data-share]");
    if (share) {
      share.addEventListener("click", async () => {
        try {
          await navigator.share({ title: biz.name, text: options.text });
        } catch (error) {
          /* The visitor dismissed the share sheet. */
        }
      });
    }
    element.querySelector("[data-print]").addEventListener("click", () => window.print());
    element.hidden = false;
    element.focus();
  }

  async function submitPayload(kind, fields, site) {
    if (fields._gotcha) return { channel: "dropped", ok: true };
    const forms = (site && site.forms) || {};
    const username = String(forms.buttondownUsername || "").trim();
    if (kind === "signup" && username && /^[A-Za-z0-9_-]+$/.test(username)) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://buttondown.com/api/emails/embed-subscribe/" + username;
      const email = document.createElement("input");
      email.name = "email";
      email.value = fields.email || "";
      form.appendChild(email);
      if (fields.name) {
        const name = document.createElement("input");
        name.name = "name";
        name.value = fields.name;
        form.appendChild(name);
      }
      document.body.appendChild(form);
      form.submit();
      return { channel: "buttondown", ok: true };
    }

    const endpoint = safeHttps(forms.formspree && forms.formspree[kind]);
    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(fields)
        });
        if (!response.ok) throw new Error("The form service did not accept this.");
        return { channel: "formspree", ok: true };
      } catch (error) {
        return { channel: "formspree", ok: false, error: error.message };
      }
    }

    const email = String(forms.notifyEmail || "").trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const link = document.createElement("a");
      const subject = encodeURIComponent(fields._subject || "Chana's Baked Goods");
      const body = encodeURIComponent(fields._text || "");
      link.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { channel: "mailto", ok: true };
    }

    return { channel: "text", ok: true };
  }

  function channelNote(result) {
    if (result.channel === "formspree" && result.ok) {
      return "This was also sent through the connected form. Chana still confirms by text.";
    }
    if (result.channel === "formspree" && !result.ok) {
      return "The automatic send did not go through. Please text the summary so the request is not lost.";
    }
    if (result.channel === "mailto") {
      return "Your email app should open with this note. If it does not, text the summary instead.";
    }
    if (result.channel === "buttondown") {
      return "";
    }
    return "Text the summary to Chana. This site does not store it.";
  }

  function signupFormHtml(site, variant) {
    const button = (site.signup && site.signup.button) || "Send";
    const inline = variant === "inline" || variant === "compact";
    const name = inline
      ? ""
      : '<label class="field"><span>Name <span class="optional">(optional)</span></span><input name="name" autocomplete="name" data-remember></label>';
    const emailLabel = inline ? '<span class="sr-only">Email</span>' : "<span>Email</span>";
    return [
      '<form class="signup-form' + (inline ? " signup-inline" : "") + '" novalidate>',
      '<input class="hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">',
      name,
      '<label class="field">' + emailLabel + '<input name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email" required></label>',
      '<button class="btn btn-primary" type="submit">' + esc(button) + "</button>",
      '<p class="form-status" role="alert" hidden></p>',
      "</form>",
      '<div class="confirm" hidden tabindex="-1"></div>'
    ].join("");
  }

  function bindSignup(mount, site) {
    const form = mount.querySelector("form");
    if (!form) return;
    bindRemember(form);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      status.hidden = true;
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const name = String(data.get("name") || "").trim();
      if (data.get("_gotcha")) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.hidden = false;
        status.textContent = "Enter an email address so Chana knows where to write.";
        return;
      }
      const text = [
        "Please add me to updates for Chana's Baked Goods.",
        name ? "Name: " + name : "",
        "Email: " + email
      ].filter(Boolean).join("\n");
      const result = await submitPayload("signup", {
        name,
        email,
        _subject: "Updates list — Chana's Baked Goods",
        _text: text,
        _gotcha: data.get("_gotcha")
      }, site);
      if (result.channel === "buttondown") return;
      const connected = result.channel === "formspree" || result.channel === "mailto";
      const message = connected
        ? ((site.signup && site.signup.success) || "Thank you.")
        : "Not saved yet — a mailing list is not connected. Text " + businessOf(site).phoneDisplay + " with your email.";
      form.hidden = true;
      fillConfirmation(mount.querySelector(".confirm"), {
        site,
        title: connected ? "You're on the list" : "Text your email to Chana",
        message,
        text,
        note: channelNote(result),
        share: typeof navigator.share === "function"
      });
    });
  }

  function mountSignups(site) {
    document.querySelectorAll("[data-signup]").forEach((mount) => {
      if (mount.dataset.ready === "true") return;
      mount.dataset.ready = "true";
      mount.innerHTML = signupFormHtml(site, mount.dataset.variant || "full");
      bindSignup(mount, site);
    });
  }

  function updateCartUi() {
    const count = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.hidden = count === 0;
      node.textContent = String(count);
    });
    const bar = document.getElementById("cart-bar");
    const page = document.body.dataset.page;
    if (bar) {
      const hide = count === 0 || page === "checkout" || page === "order";
      bar.hidden = hide;
      bar.textContent = "Checkout · " + count + (count === 1 ? " item" : " items");
      document.body.classList.toggle("has-cart", !hide);
    }
  }

  function bindNav() {
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".nav-panel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", () => {
      const open = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("nav-open", open);
    });
    panel.addEventListener("click", (event) => {
      if (event.target.closest("a") && window.matchMedia("(max-width: 1039px)").matches) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        document.body.classList.remove("nav-open");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
    });
  }

  function headerHtml(site, news) {
    const biz = businessOf(site);
    const page = document.body.dataset.page || "";
    const pinned = (news || []).find((item) => item && item.pinned);
    const banner = pinned
      ? '<div class="banner"><p><a href="announcements.html#' + esc(pinned.id) + '">' + esc(pinned.title) + "</a></p></div>"
      : "";
    const links = NAV.map((item) => {
      const current = item.id === page ? ' aria-current="page"' : "";
      return '<a href="' + item.href + '"' + current + ">" + esc(item.label) + "</a>";
    }).join("");
    return [
      banner,
      '<header class="site-nav"><div class="wrap nav-row">',
      '<a class="wordmark" href="index.html"><span class="wordmark-name">Chana\'s</span><span class="wordmark-sub">Baked Goods</span></a>',
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>',
      '<nav class="nav-panel" id="site-nav" aria-label="Primary">',
      '<div class="nav-links">' + links + "</div>",
      '<div class="nav-actions">',
      '<a class="btn btn-primary btn-small" href="order.html">Order</a>',
      '<a class="cart-link" href="checkout.html">Checkout<span class="cart-count" data-cart-count hidden></span></a>',
      '<a class="nav-phone" href="sms:' + esc(biz.phoneSms) + '">Text ' + esc(biz.phoneDisplay) + "</a>",
      "</div></nav></div></header>"
    ].join("");
  }

  function footerHtml(site) {
    const biz = businessOf(site);
    const allergen = (site && site.allergen) || {};
    const links = NAV.concat([
      { href: "order.html", label: "Order" },
      { href: "checkout.html", label: "Checkout" }
    ]).map((item) => '<a href="' + item.href + '">' + esc(item.label) + "</a>").join("");
    return [
      '<footer class="footer"><div class="wrap footer-inner">',
      '<p class="footer-signoff">' + esc(biz.footerSignoff) + "</p>",
      '<p><a class="footer-phone" href="sms:' + esc(biz.phoneSms) + '">Text ' + esc(biz.phoneDisplay) + "</a></p>",
      '<p class="hint">' + esc(biz.location) + "</p>",
      '<nav class="footer-nav" aria-label="Footer">' + links + "</nav>",
      '<p class="allergen-short"><span class="notice-label">' + esc(allergen.heading || "Allergens") + ".</span> " + esc(allergen.short || "") + "</p>",
      "</div></footer>"
    ].join("");
  }

  function hydrate(site) {
    const biz = businessOf(site);
    document.querySelectorAll(".js-phone").forEach((node) => {
      if (node.tagName === "A") {
        node.textContent = biz.phoneDisplay;
        node.href = "sms:" + biz.phoneSms;
      } else {
        node.textContent = biz.phoneDisplay;
      }
    });
    document.querySelectorAll(".js-min-date").forEach((input) => {
      input.min = minDate();
    });
    const help = (site && site.dateHelp) || "Choose a day at least 7 days from today.";
    document.querySelectorAll(".js-date-help").forEach((node) => {
      node.textContent = help;
    });
  }

  function bindRemember(form) {
    const saved = readDetails();
    form.querySelectorAll("[data-remember]").forEach((field) => {
      if (field.type === "radio") {
        if (saved[field.name] && field.value === saved[field.name]) field.checked = true;
      } else if (!field.value && saved[field.name]) {
        field.value = saved[field.name];
      }
      field.addEventListener("change", () => {
        const next = readDetails();
        next[field.name] = field.type === "radio" ? form.elements[field.name].value : field.value;
        writeDetails(next);
      });
    });
  }

  function setFieldError(input, message) {
    if (!input) return;
    const holder = input.closest(".field") || input.parentElement;
    let hint = holder.querySelector(".field-error");
    if (!message) {
      input.removeAttribute("aria-invalid");
      if (hint) hint.remove();
      return;
    }
    input.setAttribute("aria-invalid", "true");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "field-error";
      holder.appendChild(hint);
    }
    hint.textContent = message;
  }

  function bootError() {
    const main = document.getElementById("main");
    if (!main || document.getElementById("boot-error")) return;
    const note = document.createElement("p");
    note.id = "boot-error";
    note.className = "callout";
    note.textContent = "Some of this page did not load. You can still text Chana at 413-355-3682.";
    main.prepend(note);
  }

  function renderShell(site, news) {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    if (header) header.innerHTML = headerHtml(site, news);
    if (footer) footer.innerHTML = footerHtml(site);
    bindNav();
    hydrate(site);
    mountSignups(site);
    updateCartUi();
    if (!document.getElementById("cart-bar")) {
      const bar = document.createElement("a");
      bar.id = "cart-bar";
      bar.className = "cart-bar";
      bar.href = "checkout.html";
      bar.hidden = true;
      document.body.appendChild(bar);
    }
    if (!document.getElementById("cart-status")) {
      const status = document.createElement("p");
      status.id = "cart-status";
      status.className = "sr-only";
      status.setAttribute("aria-live", "polite");
      document.body.appendChild(status);
    }
    updateCartUi();
  }

  async function boot() {
    let site = { business: {} };
    try {
      site = await loadJson("content/site.json");
    } catch (error) {
      bootError();
    }
    let news = [];
    try {
      news = await loadJson("content/announcements.json");
    } catch (error) {
      news = [];
    }
    renderShell(site, Array.isArray(news) ? news : []);
    document.dispatchEvent(new CustomEvent("bakery:ready", { detail: { site } }));
  }

  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("bakery:cart", updateCartUi);
  window.addEventListener("storage", (event) => {
    if (event.key === CART_KEY) updateCartUi();
  });
  window.addEventListener("pageshow", updateCartUi);

  window.Bakery = {
    loadSite: () => loadJson("content/site.json"),
    loadMenu: () => loadJson("content/menu.json"),
    loadAbout: () => loadJson("content/about.json"),
    loadAnnouncements: () => loadJson("content/announcements.json"),
    esc,
    money,
    priceLabel,
    normalizePrice,
    minDate,
    formatWhen,
    readCart,
    writeCart,
    setQty,
    clearCart,
    cartCount,
    totals,
    clampQty,
    readDetails,
    writeDetails,
    menuIndex,
    icon,
    allergenHtml,
    fillConfirmation,
    submitPayload,
    channelNote,
    bindRemember,
    setFieldError,
    bootError,
    businessOf,
    smsHref
  };
})();
