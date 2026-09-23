document.addEventListener("bakery:ready", async (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  try {
    const about = await B.loadAbout();
    const biz = B.businessOf(site);
    const root = document.getElementById("about-root");
    const paragraphs = (about.paragraphs || []).map((paragraph) => "<p>" + B.esc(paragraph) + "</p>").join("");
    const details = [
      { label: "Baker", value: biz.baker },
      { label: "Where", value: "Home kitchen in " + biz.location },
      { label: "Kitchen", value: "Fully kosher. All products pareve (non-dairy)." },
      { label: "Orders", value: "Text " + biz.phoneDisplay + ". One-week notice. No minimum order." }
    ];
    root.innerHTML = [
      '<p class="kicker">' + B.esc(about.kicker || "About") + "</p>",
      "<h1>" + B.esc(about.title || "About") + "</h1>",
      '<p class="lede">' + B.esc(about.lede || "") + "</p>",
      '<div class="prose">' + paragraphs + "</div>",
      '<ul class="detail-list">' + details.map((detail) => (
        "<li><span>" + B.esc(detail.label) + "</span>" + B.esc(detail.value) + "</li>"
      )).join("") + "</ul>",
      '<p class="phone-block"><a class="js-phone" href="sms:' + B.esc(biz.phoneSms) + '">' + B.esc(biz.phoneDisplay) + "</a></p>",
      '<p><a class="btn btn-primary" href="order.html">Place a pre-order</a></p>'
    ].join("");
    document.title = (about.title || "About") + " · Chana's Baked Goods";
  } catch (error) {
    B.bootError();
  }
});
