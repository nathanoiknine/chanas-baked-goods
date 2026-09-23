document.addEventListener("bakery:ready", (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  const page = (site.pages && site.pages.contact) || {};
  const title = document.getElementById("page-title");
  const intro = document.getElementById("page-intro");
  if (title && page.title) title.textContent = page.title;
  if (intro && page.intro) intro.textContent = page.intro;

  const form = document.getElementById("contact-form");
  B.bindRemember(form);
  form.addEventListener("submit", async (submitEvent) => {
    submitEvent.preventDefault();
    const status = document.getElementById("form-status");
    status.hidden = true;
    const data = new FormData(form);
    ["name", "email", "phone", "message"].forEach((name) => B.setFieldError(form.elements[name], ""));
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const errors = [];
    if (name.length < 2) {
      errors.push("name");
      B.setFieldError(form.elements.name, "Add your name.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("email");
      B.setFieldError(form.elements.email, "Add an email address.");
    }
    if ((phone.match(/\d/g) || []).length < 7) {
      errors.push("phone");
      B.setFieldError(form.elements.phone, "Add a phone number she can text.");
    }
    if (message.length < 2) {
      errors.push("message");
      B.setFieldError(form.elements.message, "Write a short message.");
    }
    if (data.get("_gotcha")) return;
    if (errors.length) {
      status.hidden = false;
      status.textContent = "Check the fields above, then send it again.";
      return;
    }
    const text = [
      "Message for Chana's Baked Goods",
      name + " · " + phone + " · " + email,
      "",
      message
    ].join("\n");
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    const result = await B.submitPayload("contact", {
      name, email, phone, message,
      _subject: "Message — " + name,
      _text: text,
      _gotcha: data.get("_gotcha")
    }, site);
    form.hidden = true;
    B.fillConfirmation(document.getElementById("confirm"), {
      site,
      title: "Text this to Chana",
      message: "She replies by text at " + B.businessOf(site).phoneDisplay + ".",
      text,
      note: B.channelNote(result),
      share: typeof navigator.share === "function"
    });
  });
});
