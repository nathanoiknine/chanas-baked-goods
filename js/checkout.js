document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  const page = (site.pages && site.pages.checkout) || {};
  const title = document.getElementById("page-title");
  const intro = document.getElementById("page-intro");
  if (title && page.title) title.textContent = page.title;
  if (intro && page.intro) intro.textContent = page.intro;
  let menu = { categories: [] };
  try {
    menu = await B.loadMenu();
  } catch (error) {
    B.bootError();
  }
  const index = B.menuIndex(menu);
  const form = document.getElementById("details-form");
  B.bindRemember(form);

  let step = "cart";

  function lines() {
    return B.readCart().map((line) => {
      const item = index[line.id];
      if (!item || item.available === false) return Object.assign({}, line, { unavailable: true });
      return {
        id: item.id,
        name: item.name,
        price: B.normalizePrice(item.price),
        unit: item.unit || "",
        qty: line.qty
      };
    });
  }

  function activeLines() {
    return lines().filter((line) => !line.unavailable && line.qty > 0);
  }

  function show(next) {
    step = next;
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== next;
    });
    document.querySelectorAll("[data-goto]").forEach((button) => {
      if (button.dataset.goto === next) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    if (next === "cart") renderCart();
    if (next === "review") renderReview();
  }

  function renderCart() {
    const root = document.getElementById("cart-lines");
    const current = lines();
    if (!current.length) {
      root.innerHTML = '<div class="empty"><p>Nothing here yet.</p><div class="form-actions"><a class="btn btn-primary" href="menu.html">Menu</a><a class="btn btn-ghost" href="custom.html">Custom order</a></div></div>';
      document.getElementById("cart-total").hidden = true;
      document.getElementById("to-details").hidden = true;
      return;
    }
    document.getElementById("to-details").hidden = false;
    document.getElementById("to-details").disabled = current.some((line) => line.unavailable);
    document.getElementById("cart-total").hidden = false;
    root.innerHTML = current.map((line) => [
      '<article class="line" data-id="' + B.esc(line.id) + '">',
      "<div><h3>" + B.esc(line.name) + "</h3>",
      line.unavailable ? '<p class="field-error">This is no longer on the menu. Remove it to continue.</p>' : '<p class="hint">' + B.esc(B.priceLabel(line)) + "</p>",
      "</div>",
      '<div class="line-side">',
      '<div class="qty">',
      '<button type="button" data-step="-1" aria-label="Decrease ' + B.esc(line.name) + '">−</button>',
      '<input data-qty type="number" min="0" max="99" inputmode="numeric" value="' + line.qty + '" aria-label="Quantity for ' + B.esc(line.name) + '">',
      '<button type="button" data-step="1" aria-label="Increase ' + B.esc(line.name) + '">+</button>',
      "</div>",
      '<button type="button" class="linkish" data-remove>Remove</button>',
      "</div></article>"
    ].join("")).join("");
    const usable = activeLines();
    const totals = B.totals(usable);
    const total = document.getElementById("cart-total");
    const estimate = usable.length
      ? (totals.complete ? B.money(totals.sum) : B.money(totals.sum) + " +")
      : B.money(0);
    total.innerHTML = '<div><span>Estimate</span><p class="hint">Confirmed by text. No payment now.</p></div><strong>' + B.esc(estimate) + "</strong>";
  }

  function setLineQty(id, qty) {
    const current = lines().find((line) => line.id === id);
    const item = index[id] || current;
    if (!item) return;
    B.setQty({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit || ""
    }, qty);
    renderCart();
  }

  document.getElementById("cart-lines").addEventListener("click", (clickEvent) => {
    const row = clickEvent.target.closest("[data-id]");
    if (!row) return;
    if (clickEvent.target.closest("[data-remove]")) {
      setLineQty(row.dataset.id, 0);
      return;
    }
    const button = clickEvent.target.closest("[data-step]");
    if (!button) return;
    const input = row.querySelector("[data-qty]");
    const next = B.clampQty(Number(input.value || 0) + Number(button.dataset.step));
    setLineQty(row.dataset.id, next);
  });
  document.getElementById("cart-lines").addEventListener("change", (changeEvent) => {
    const input = changeEvent.target.closest("[data-qty]");
    if (!input) return;
    const row = input.closest("[data-id]");
    setLineQty(row.dataset.id, B.clampQty(input.value));
  });

  function validateDetails() {
    const data = new FormData(form);
    ["name", "phone", "email", "date"].forEach((name) => B.setFieldError(form.elements[name], ""));
    let ok = true;
    if (String(data.get("name") || "").trim().length < 2) {
      ok = false;
      B.setFieldError(form.elements.name, "Add your name.");
    }
    if ((String(data.get("phone") || "").match(/\d/g) || []).length < 7) {
      ok = false;
      B.setFieldError(form.elements.phone, "Add a phone number she can text.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email") || "").trim())) {
      ok = false;
      B.setFieldError(form.elements.email, "Add an email address.");
    }
    if (!data.get("date") || String(data.get("date")) < B.minDate()) {
      ok = false;
      B.setFieldError(form.elements.date, "Choose a date at least 7 days from today.");
    }
    return ok;
  }

  function renderReview() {
    const data = new FormData(form);
    const usable = activeLines();
    const totals = B.totals(usable);
    const fulfillment = data.get("fulfillment") === "delivery" ? "Delivery, if available nearby" : "Pickup in Pacific Beach";
    const root = document.getElementById("review-body");
    root.innerHTML = [
      "<h2>Review</h2>",
      '<ul class="review-list">' + usable.map((line) => (
        "<li><span>" + line.qty + " × " + B.esc(line.name) + "</span><span>" + B.esc(B.priceLabel(line)) + "</span></li>"
      )).join("") + "</ul>",
      '<p class="subtotal"><span>Estimate</span><span>' + B.esc(totals.complete ? B.money(totals.sum) : B.money(totals.sum) + " +") + "</span></p>",
      '<p class="hint">Estimate only. Confirmed by text. No payment now.</p>',
      "<h3>For Chana</h3>",
      "<p>" + B.esc(String(data.get("name") || "").trim()) + "<br>" + B.esc(String(data.get("phone") || "").trim()) + "<br>" + B.esc(String(data.get("email") || "").trim()) + "</p>",
      "<p>Date wanted: " + B.esc(B.formatWhen(String(data.get("date") || ""))) + "<br>" + B.esc(fulfillment) + "</p>",
      String(data.get("notes") || "").trim() ? "<p>Notes: " + B.esc(String(data.get("notes") || "").trim()) + "</p>" : "",
      '<div class="form-actions"><button class="btn btn-primary" type="button" id="place-order">Place pre-order</button><button class="btn btn-ghost" type="button" data-goto="details">Edit details</button></div>',
      '<p class="form-status" id="review-status" role="alert" hidden></p>'
    ].join("");
    document.getElementById("place-order").addEventListener("click", placeOrder);
  }

  async function placeOrder() {
    if (lines().some((line) => line.unavailable)) {
      show("cart");
      return;
    }
    if (!validateDetails()) {
      show("details");
      return;
    }
    const usable = activeLines();
    if (!usable.length) {
      show("cart");
      return;
    }
    const data = new FormData(form);
    if (data.get("_gotcha")) return;
    const totals = B.totals(usable);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const date = String(data.get("date") || "");
    const notes = String(data.get("notes") || "").trim();
    const fulfillment = String(data.get("fulfillment") || "pickup");
    const text = [
      "Pre-order for Chana's Baked Goods",
      name + " · " + phone + " · " + email,
      "Date wanted: " + B.formatWhen(date),
      "Handoff: " + (fulfillment === "delivery" ? "Delivery, if available nearby" : "Pickup in Pacific Beach"),
      "",
      ...usable.map((line) => line.qty + " × " + line.name + " (" + B.priceLabel(line) + ")"),
      "",
      totals.complete ? "Estimated subtotal: " + B.money(totals.sum) : "Estimated subtotal: " + B.money(totals.sum) + " plus items priced by message",
      "No payment collected. Please confirm by text.",
      notes ? "Notes: " + notes : ""
    ].filter((line) => line !== "").join("\n");
    document.getElementById("place-order").disabled = true;
    const result = await B.submitPayload("checkout", {
      name, phone, email, date, notes, fulfillment,
      items: usable.map((line) => line.qty + " × " + line.name).join("; "),
      estimate: totals.sum,
      _subject: "Pre-order — " + name,
      _text: text,
      _gotcha: data.get("_gotcha")
    }, site);
    B.clearCart();
    document.getElementById("progress").hidden = true;
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = true;
    });
    B.fillConfirmation(document.getElementById("confirm"), {
      site,
      title: "Text this to Chana",
      message: "She'll confirm timing and price at " + B.businessOf(site).phoneDisplay + ". No payment is taken here.",
      text,
      note: B.channelNote(result),
      share: typeof navigator.share === "function"
    });
  }

  document.getElementById("checkout-root").addEventListener("click", (clickEvent) => {
    const button = clickEvent.target.closest("[data-goto]");
    if (!button) return;
    const target = button.dataset.goto;
    if (target === "details" || target === "review") {
      if (lines().some((line) => line.unavailable) || !activeLines().length) {
        show("cart");
        return;
      }
    }
    if (target === "review" && !validateDetails()) {
      show("details");
      return;
    }
    show(target);
  });

  document.getElementById("to-details").addEventListener("click", () => {
    if (lines().some((line) => line.unavailable)) return;
    if (!activeLines().length) return;
    show("details");
  });
  form.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    if (!validateDetails()) return;
    show("review");
  });

  document.addEventListener("bakery:cart", () => {
    if (step === "cart") renderCart();
  });

  show("cart");
});
