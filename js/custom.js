document.addEventListener("bakery:ready", (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  const page = (site.pages && site.pages.custom) || {};
  const title = document.getElementById("page-title");
  const intro = document.getElementById("page-intro");
  if (title && page.title) title.textContent = page.title;
  if (intro && page.intro) intro.textContent = page.intro;
  const allergen = document.getElementById("allergen-mount");
  if (allergen) allergen.innerHTML = B.allergenHtml(site);
  const pricing = document.getElementById("pricing-note");
  if (pricing) pricing.textContent = "Custom pricing is shared by text. This form does not calculate a price. " + (site.pricingNote || "");

  const form = document.getElementById("custom-form");
  B.bindRemember(form);
  form.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    const status = document.getElementById("form-status");
    status.hidden = true;
    const data = new FormData(form);
    ["name", "phone", "email", "occasion", "date", "description"].forEach((name) => {
      if (form.elements[name]) B.setFieldError(form.elements[name], "");
    });
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const occasion = String(data.get("occasion") || "").trim();
    const date = String(data.get("date") || "");
    const description = String(data.get("description") || "").trim();
    const inspiration = String(data.get("inspiration") || "").trim();
    const contactMethod = String(data.get("contactMethod") || "text");
    let invalid = false;
    if (name.length < 2) {
      invalid = true;
      B.setFieldError(form.elements.name, "Add your name.");
    }
    if ((phone.match(/\d/g) || []).length < 7) {
      invalid = true;
      B.setFieldError(form.elements.phone, "Add a phone number she can text.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      invalid = true;
      B.setFieldError(form.elements.email, "Add an email address.");
    }
    if (occasion.length < 2) {
      invalid = true;
      B.setFieldError(form.elements.occasion, "Add the occasion, even if it is just \"Tuesday\".");
    }
    if (!date || date < B.minDate()) {
      invalid = true;
      B.setFieldError(form.elements.date, "Choose a date at least 7 days from today.");
    }
    if (description.length < 8) {
      invalid = true;
      B.setFieldError(form.elements.description, "Describe the bake — type, flavors, servings, or dietary notes.");
    }
    if (data.get("_gotcha")) return;
    if (invalid) {
      status.hidden = false;
      status.textContent = "A few details are missing. The notes above each field say what to add.";
      return;
    }
    const methodLabel = { text: "Text", phone: "Phone call", email: "Email" }[contactMethod] || "Text";
    const text = [
      "Custom bake request for Chana's Baked Goods",
      name + " · " + phone + " · " + email,
      "Preferred reply: " + methodLabel,
      "Occasion: " + occasion,
      "Date needed: " + B.formatWhen(date),
      "",
      description,
      inspiration ? "Inspiration: " + inspiration : "",
      "",
      "Reminder: pareve / non-dairy, kosher ingredients. Price by message. No payment collected."
    ].filter((line) => line !== "").join("\n");
    form.querySelector("[type=submit]").disabled = true;
    const result = await B.submitPayload("custom", {
      name, phone, email, occasion, date, description, inspiration, contactMethod,
      _subject: "Custom order — " + name,
      _text: text,
      _gotcha: data.get("_gotcha")
    }, site);
    form.hidden = true;
    B.fillConfirmation(document.getElementById("confirm"), {
      site,
      title: "Chana will follow up by text",
      message: "Text her at " + B.businessOf(site).phoneDisplay + " with this request. She will follow up by text" + (contactMethod === "text" ? "." : ", and she will see that you prefer a " + methodLabel.toLowerCase() + "."),
      text,
      note: B.channelNote(result),
      share: typeof navigator.share === "function"
    });
  });
});
