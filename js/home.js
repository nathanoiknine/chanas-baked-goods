document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const lede = document.getElementById("hero-lede");
    if (lede && site.hero && site.hero.lede) lede.textContent = site.hero.lede;
    const kicker = document.getElementById("hero-kicker");
    if (kicker && site.hero && site.hero.kicker) kicker.textContent = site.hero.kicker;

    const facts = document.getElementById("facts");
    if (facts && Array.isArray(site.facts)) {
      facts.innerHTML = site.facts.map((fact) => "<li>" + B.esc(fact) + "</li>").join("");
    }

    const steps = document.getElementById("steps");
    if (steps && Array.isArray(site.steps)) {
      steps.innerHTML = site.steps.map((step, index) => (
        "<li><span class=\"step-num\">" + (index + 1) + "</span><h3>" + B.esc(step.title) + "</h3><p>" + B.esc(step.text) + "</p></li>"
      )).join("");
    }

    const offeringsIntro = document.getElementById("offerings-intro");
    if (offeringsIntro) offeringsIntro.textContent = site.offeringsIntro || "";

    const allergen = document.getElementById("allergen-mount");
    if (allergen) allergen.innerHTML = B.allergenHtml(site);

    const teaser = document.getElementById("pickup-teaser");
    if (teaser && site.pickup) teaser.textContent = site.pickup.intro || "";

    const signupTitle = document.getElementById("signup-title");
    const signupIntro = document.getElementById("signup-intro");
    if (signupTitle && site.signup) signupTitle.textContent = site.signup.title || signupTitle.textContent;
    if (signupIntro && site.signup) signupIntro.textContent = site.signup.intro || "";

    const menu = await B.loadMenu();
    const grid = document.getElementById("offering-grid");
    if (grid) {
      grid.innerHTML = (menu.categories || []).map((category) => {
        const visible = (category.items || []).some((item) => item.available !== false);
        if (!visible) return "";
        return [
          '<a class="card" href="menu.html#' + B.esc(category.id) + '">',
          '<span class="card-icon">' + B.icon(category.id) + "</span>",
          "<h3>" + B.esc(category.name) + "</h3>",
          "<p>" + B.esc(category.summary || "") + "</p>",
          "</a>"
        ].join("");
      }).join("");
    }

    const featured = [];
    (menu.categories || []).forEach((category) => {
      (category.items || []).forEach((item) => {
        if (item.featured && item.available !== false) {
          featured.push(Object.assign({}, item, { category: category.name }));
        }
      });
    });
    const list = document.getElementById("featured-list");
    const featuredSection = document.getElementById("featured-section");
    if (!featured.length && featuredSection) featuredSection.hidden = true;
    if (list) {
      list.innerHTML = featured.map((item) => [
        '<article class="feature">',
        "<div><p class=\"kicker\">" + B.esc(item.category) + "</p><h3>" + B.esc(item.name) + "</h3>",
        "<p>" + B.esc(item.description || "") + "</p></div>",
        '<div class="line-side"><p class="price">' + B.esc(B.priceLabel(item)) + "</p>",
        '<button class="btn btn-ghost btn-small" type="button" data-add="' + B.esc(item.id) + '">' + (B.readCart().some((line) => line.id === item.id) ? "Add another" : "Add one") + "</button></div>",
        "</article>"
      ].join("")).join("");
      list.addEventListener("click", (clickEvent) => {
        const button = clickEvent.target.closest("[data-add]");
        if (!button) return;
        const item = featured.find((entry) => entry.id === button.dataset.add);
        if (!item) return;
        const existing = B.readCart().find((line) => line.id === item.id);
        const qty = B.setQty(item, (existing ? existing.qty : 0) + 1);
        button.textContent = qty > 0 ? "Add another" : "Add one";
      });
    }
  } catch (error) {
    B.bootError();
  }
});
