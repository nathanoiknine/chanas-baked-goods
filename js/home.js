document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const kicker = document.getElementById("hero-kicker");
    if (kicker && site.hero && site.hero.kicker) kicker.textContent = site.hero.kicker;

    const facts = document.getElementById("facts");
    if (facts && Array.isArray(site.facts)) {
      facts.innerHTML = site.facts.map((fact) => "<li>" + B.esc(fact) + "</li>").join("");
    }

    const signupTitle = document.getElementById("signup-title");
    const signupIntro = document.getElementById("signup-intro");
    if (signupTitle && site.signup && site.signup.title) signupTitle.textContent = site.signup.title;
    if (signupIntro && site.signup && site.signup.intro) signupIntro.textContent = site.signup.intro;

    const menu = await B.loadMenu();
    const grid = document.getElementById("offering-grid");
    if (grid) {
      grid.innerHTML = (menu.categories || []).map((category) => {
        const visible = (category.items || []).some((item) => item.available !== false);
        if (!visible) return "";
        return '<li><a href="menu.html#' + B.esc(category.id) + '">' + B.esc(category.name) + "</a></li>";
      }).join("");
    }
  } catch (error) {
    B.bootError();
  }
});
