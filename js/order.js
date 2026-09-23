document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const page = (site.pages && site.pages.order) || {};
    const title = document.getElementById("page-title");
    const intro = document.getElementById("page-intro");
    if (title && page.title) title.textContent = page.title;
    if (intro && page.intro) intro.textContent = page.intro;
    const menu = await B.loadMenu();
    const index = B.menuIndex(menu);
    const root = document.getElementById("order-items");
    const categories = (menu.categories || []).map((category) => {
      const items = (category.items || []).filter((item) => item.available !== false);
      if (!items.length) return "";
      return "<h3>" + B.esc(category.name) + "</h3>" + items.map((item) => {
        const existing = B.readCart().find((line) => line.id === item.id);
        const qty = existing ? existing.qty : 0;
        return [
          '<div class="item item-compact" data-id="' + B.esc(item.id) + '">',
          "<div><h3>" + B.esc(item.name) + "</h3></div>",
          '<div class="item-buy"><p class="price">' + B.esc(B.priceLabel(item)) + "</p>",
          '<div class="qty">',
          '<button type="button" data-step="-1" aria-label="Decrease ' + B.esc(item.name) + '">−</button>',
          '<input data-qty type="number" min="0" max="99" inputmode="numeric" value="' + qty + '" aria-label="Quantity for ' + B.esc(item.name) + '">',
          '<button type="button" data-step="1" aria-label="Increase ' + B.esc(item.name) + '">+</button>',
          "</div></div></div>"
        ].join("");
      }).join("");
    }).join("");
    root.innerHTML = categories;

    const form = document.getElementById("order-form");
    B.bindRemember(form);

    function commit(id, qty) {
      const item = index[id];
      if (item) B.setQty(item, qty);
      renderEstimate();
    }

    root.addEventListener("click", (clickEvent) => {
      const button = clickEvent.target.closest("[data-step]");
      if (!button) return;
      const row = button.closest("[data-id]");
      const input = row.querySelector("[data-qty]");
      const next = B.clampQty(Number(input.value || 0) + Number(button.dataset.step));
      input.value = String(next);
      commit(row.dataset.id, next);
    });
    root.addEventListener("change", (changeEvent) => {
      const input = changeEvent.target.closest("[data-qty]");
      if (!input) return;
      const row = input.closest("[data-id]");
      const next = B.clampQty(input.value);
      input.value = String(next);
      commit(row.dataset.id, next);
    });

    function currentLines() {
      return B.readCart().map((line) => {
        const item = index[line.id];
        if (!item || item.available === false) return Object.assign({}, line, { unavailable: true });
        return {
          id: item.id,
          name: item.name,
          price: B.normalizePrice(item.price),
          unit: item.unit || "",
          qty: line.qty,
          category: item.category
        };
      });
    }

    function renderEstimate() {
      const node = document.getElementById("order-estimate");
      const lines = currentLines().filter((line) => !line.unavailable && line.qty > 0);
      if (!lines.length) {
        node.textContent = "Add at least one item.";
        return;
      }
      const totals = B.totals(lines);
      const estimate = totals.complete
        ? "Estimate " + B.money(totals.sum) + "."
        : "Estimate " + B.money(totals.sum) + ", plus items priced by message.";
      node.textContent = estimate + " Confirmed by text.";
    }
    renderEstimate();

    form.addEventListener("submit", async (submitEvent) => {
      submitEvent.preventDefault();
      const status = document.getElementById("form-status");
      status.hidden = true;
      const data = new FormData(form);
      ["name", "phone", "email", "date"].forEach((name) => B.setFieldError(form.elements[name], ""));
      const errors = [];
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const email = String(data.get("email") || "").trim();
      const date = String(data.get("date") || "");
      const notes = String(data.get("notes") || "").trim();
      const fulfillment = String(data.get("fulfillment") || "pickup");
      if (name.length < 2) {
        errors.push("Add your name.");
        B.setFieldError(form.elements.name, "Add your name.");
      }
      if ((phone.match(/\d/g) || []).length < 7) {
        errors.push("Add a phone number Chana can text.");
        B.setFieldError(form.elements.phone, "Add a phone number she can text.");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Add an email address.");
        B.setFieldError(form.elements.email, "Add an email address.");
      }
      if (!date || date < B.minDate()) {
        errors.push("Choose a date at least 7 days from today.");
        B.setFieldError(form.elements.date, "Choose a date at least 7 days from today.");
      }
      const lines = currentLines().filter((line) => !line.unavailable && line.qty > 0);
      if (!lines.length) errors.push("Add at least one item, or use the custom order form.");
      if (data.get("_gotcha")) return;
      if (errors.length) {
        status.hidden = false;
        status.textContent = errors[0];
        return;
      }
      const totals = B.totals(lines);
      const text = [
        "Pre-order for Chana's Baked Goods",
        name + " · " + phone + " · " + email,
        "Date wanted: " + B.formatWhen(date),
        "Handoff: " + (fulfillment === "delivery" ? "Delivery, if available nearby" : "Pickup in Pacific Beach"),
        "",
        ...lines.map((line) => line.qty + " × " + line.name + " (" + B.priceLabel(line) + ")"),
        "",
        totals.complete ? "Estimated subtotal: " + B.money(totals.sum) : "Estimated subtotal: " + B.money(totals.sum) + " plus items priced by message",
        "No payment collected. Please confirm by text.",
        notes ? "Notes: " + notes : ""
      ].filter((line) => line !== "").join("\n");

      const button = form.querySelector("[type=submit]");
      button.disabled = true;
      const result = await B.submitPayload("order", {
        name, phone, email, date, notes, fulfillment,
        items: lines.map((line) => line.qty + " × " + line.name).join("; "),
        estimate: totals.sum,
        _subject: "Pre-order — " + name,
        _text: text,
        _gotcha: data.get("_gotcha")
      }, site);
      B.clearCart();
      form.hidden = true;
      B.fillConfirmation(document.getElementById("confirm"), {
        site,
        title: "Text this to Chana",
        message: "She'll confirm timing and price at " + B.businessOf(site).phoneDisplay + ". No payment is taken here.",
        text,
        note: B.channelNote(result),
        share: typeof navigator.share === "function"
      });
    });
  } catch (error) {
    B.bootError();
  }
});
