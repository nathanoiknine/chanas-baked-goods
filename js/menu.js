document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const menu = await B.loadMenu();
    const title = document.getElementById("page-title");
    const intro = document.getElementById("page-intro");
    if (title && site.pages && site.pages.menu) title.textContent = site.pages.menu.title;
    if (intro && site.pages && site.pages.menu) intro.textContent = site.pages.menu.intro;
    const note = document.getElementById("menu-note");
    const priceNote = document.getElementById("price-note");
    if (note) note.textContent = menu.note || "";
    if (priceNote) priceNote.textContent = menu.priceNote || site.pricingNote || "";

    const allergen = document.getElementById("allergen-mount");
    if (allergen) allergen.innerHTML = B.allergenHtml(site);

    const categories = (menu.categories || []).filter((category) => (
      (category.items || []).some((item) => item.available !== false)
    ));

    const filters = document.getElementById("filters");
    filters.innerHTML = '<button class="filter-btn" type="button" data-filter="all" aria-pressed="true">All</button>' +
      categories.map((category) => (
        '<button class="filter-btn" type="button" data-filter="' + B.esc(category.id) + '" aria-pressed="false">' + B.esc(category.name) + "</button>"
      )).join("");

    const root = document.getElementById("menu-root");
    root.innerHTML = categories.map((category) => {
      const items = (category.items || []).filter((item) => item.available !== false).map((item) => itemRow(item)).join("");
      return [
        '<section class="menu-cat" id="' + B.esc(category.id) + '">',
        "<h2>" + B.esc(category.name) + "</h2>",
        "<p class=\"measure\">" + B.esc(category.summary || "") + "</p>",
        items,
        "</section>"
      ].join("");
    }).join("");

    function itemRow(item) {
      const inCart = B.readCart().find((line) => line.id === item.id);
      const qty = inCart ? inCart.qty : 0;
      return [
        '<article class="item" data-id="' + B.esc(item.id) + '">',
        "<div><h3>" + B.esc(item.name) + "</h3><p>" + B.esc(item.description || "") + "</p></div>",
        '<div class="item-buy"><p class="price">' + B.esc(B.priceLabel(item)) + "</p>",
        '<div class="qty" role="group" aria-label="Quantity for ' + B.esc(item.name) + '">',
        '<button type="button" data-step="-1" aria-label="Decrease ' + B.esc(item.name) + '">−</button>',
        '<input data-qty type="number" min="0" max="99" inputmode="numeric" value="' + qty + '" aria-label="Quantity">',
        '<button type="button" data-step="1" aria-label="Increase ' + B.esc(item.name) + '">+</button>',
        "</div></div></article>"
      ].join("");
    }

    function commit(id, qty) {
      let found = null;
      categories.forEach((category) => {
        (category.items || []).forEach((item) => {
          if (item.id === id) found = item;
        });
      });
      if (found) B.setQty(found, qty);
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

    function applyFilter(id) {
      document.querySelectorAll(".menu-cat").forEach((section) => {
        section.hidden = id !== "all" && section.id !== id;
      });
      filters.querySelectorAll(".filter-btn").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.filter === id));
      });
    }

    filters.addEventListener("click", (clickEvent) => {
      const button = clickEvent.target.closest("[data-filter]");
      if (!button) return;
      const id = button.dataset.filter;
      applyFilter(id);
      if (id !== "all") {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    const hash = location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) applyFilter(hash);
  } catch (error) {
    B.bootError();
  }
});
