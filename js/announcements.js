document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const page = (site.pages && site.pages.announcements) || {};
    const title = document.getElementById("page-title");
    const intro = document.getElementById("page-intro");
    if (title && page.title) title.textContent = page.title;
    if (intro && page.intro) intro.textContent = page.intro;
    const signupIntro = document.getElementById("signup-intro");
    if (signupIntro && site.signup) signupIntro.textContent = site.signup.intro;

    const list = await B.loadAnnouncements();
    const root = document.getElementById("news-root");
    const items = (Array.isArray(list) ? list : []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!items.length) {
      root.innerHTML = '<p class="empty">No notes yet. When Chana has an update, it will show up here.</p>';
      return;
    }
    root.innerHTML = items.map((item) => {
      const paragraphs = String(item.body || "").split(/\n\n+/).filter(Boolean).map((paragraph) => "<p>" + B.esc(paragraph) + "</p>").join("");
      return [
        '<article class="update" id="' + B.esc(item.id) + '">',
        "<time datetime=\"" + B.esc(item.date || "") + "\">" + B.esc(B.formatWhen(item.date)) + "</time>",
        "<h2>" + B.esc(item.title || "Update") + "</h2>",
        '<div class="prose">' + paragraphs + "</div>",
        "</article>"
      ].join("");
    }).join("");
  } catch (error) {
    B.bootError();
  }
});
