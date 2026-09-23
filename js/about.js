document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const about = await B.loadAbout();
    const biz = B.businessOf(site);
    const root = document.getElementById("about-root");
    const paragraphs = (about.paragraphs || []).map((paragraph) => "<p>" + B.esc(paragraph) + "</p>").join("");
    root.innerHTML = [
      "<h1>" + B.esc(about.title || "About") + "</h1>",
      '<p class="lede">' + B.esc(about.lede || "") + "</p>",
      '<div class="prose">' + paragraphs + "</div>",
      '<p class="hero-phone">Text <a href="sms:' + B.esc(biz.phoneSms) + '">' + B.esc(biz.phoneDisplay) + "</a></p>",
      '<p><a class="btn btn-primary" href="order.html">Order</a></p>'
    ].join("");
    document.title = (about.title || "About") + " · Chana's Baked Goods";
  } catch (error) {
    B.bootError();
  }
});
