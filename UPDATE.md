# Updating Chana's Baked Goods

This is the editing guide. The public pages read these files when someone opens the site. You do not need to change the HTML for ordinary updates.

After you change a file, commit it to the `main` branch (or merge a pull request into `main`). GitHub Actions publishes the site within a few minutes. Then refresh https://nathanoiknine.github.io/chanas-baked-goods/ — a hard refresh is sometimes needed.

The phone number used on the live pages is `business.phoneDisplay` in `content/site.json`. Keep it as **413-355-3682** unless the real number changes. `phoneSms` is the same number with a country code: `+14133553682`.

Say each fact once. Kosher, pareve, one week ahead, and no minimum belong in `facts` (the short line under the home page phone). The footer repeats only the phone, the neighborhood, and a short allergen line.

## Menu — `content/menu.json`

The menu is a list of categories. Current categories: Sourdough, Cookies, Cookie platters, Cakes, Lemon bars, Rugelach, Dessert cups, Pavlova. Add another category by copying a whole category block, or add an item inside `items`.

Category `name` is what the home page lists, as a link into that part of the menu. `summary` is one sentence under the category heading on the menu page. Keep it to one sentence.

Each item looks like this:

```json
{
  "id": "chocolate-chip",
  "name": "Chocolate chip",
  "description": "A classic chip cookie, not too sweet.",
  "price": 16,
  "unit": "dozen",
  "available": true
}
```

- `id` is a short name with hyphens. It must be unique. Do not change an id that people might already have in a cart unless you mean to retire that item.
- `description` is one short sentence on the menu. The pre-order form shows the name and price only.
- `price` is a placeholder number so checkout can show an estimate. Chana still confirms the real price by text. Set `"price": null` to show "Price by message" instead of a dollar amount. Custom work should stay priced by message.
- `unit` is the words after the price, such as `loaf` or `box of 12`.
- `"available": false` hides the item without deleting it. A category with no available items disappears from the home page and the menu.
- `note` at the top of the file is an optional extra line under the menu introduction. Leave it `""` unless you need it.
- `priceNote` is the short line under the introduction ("Estimates only. Confirmed by text.").

Keep every product pareve (non-dairy). Do not add a dairy item without rewriting `facts` and `allergen` in `content/site.json`.

JSON is picky: quotes around text, commas between lines, no comma after the last item in a list. If the menu page is blank, a comma is usually the problem. You can paste the file into https://jsonlint.com to check it.

## Announcements — `content/announcements.json`

This is a list. The sample note is "Preorders are open". Copy that block to add another.

- `id` becomes the link (`announcements.html#preorders-open`). Use a new id each time.
- `date` is `YYYY-MM-DD`.
- `title` is the heading. If the note is pinned, this title is also the only line in the banner at the top of the site.
- `body` is the full note. A blank line between sentences (in the JSON string, that is `\n\n`) starts a new paragraph. Keep it short.
- `"pinned": true` shows that title in the top banner. Only the first pinned note is used. Set it to `false` when the banner should come down. The note still stays on the Updates page.

## About — `content/about.json`

`title`, `lede`, and `paragraphs` are the About page. One short paragraph is enough. The text number on that page comes from `content/site.json`.

## Home, footer, allergen, pickup — `content/site.json`

| What you want to change | Where |
| --- | --- |
| Bakery name, Chana's name | `business.name`, `business.baker` |
| Text number | `business.phoneDisplay` and `business.phoneSms` |
| Tagline | `business.tagline` ("Small-batch baking, made from scratch.") |
| Footer sign-off | `business.footerSignoff` ("Baked with care") |
| Neighborhood line in the footer | `business.location` |
| Line above the home page name | `hero.kicker` |
| The short line under the home page phone | `facts` — a list of short labels, shown once |
| Introductions on Menu, Pre-order, Contact, Checkout, Custom, Updates | `pages` |
| Price explanation used if the menu file has no `priceNote` | `pricingNote` |
| Date field hint | `dateHelp` |
| Allergen label, footer line, and the longer notice on the menu | `allergen.heading`, `allergen.short`, `allergen.full` |
| Pickup title, opening line, and the two short paragraphs | `pickup.title`, `pickup.intro`, `pickup.paragraphs` |
| Named delivery neighborhoods | `pickup.neighborhoods` — a list of strings. Leave it `[]` until the list is real. |
| Map center | `pickup.map.lat`, `pickup.map.lng`, and `radiusMeters` (how wide the circle is, in meters). The caption should keep saying the circle is not a hard boundary. |
| Email signup heading, one-line explanation, button, and success line | `signup.title`, `signup.intro`, `signup.button`, `signup.success` |

Where each fact shows up:

- Home: name, tagline, Order and Menu, the phone, `facts`, category names, and a short email signup.
- Footer (every page): "Baked with care", the phone, the neighborhood, page links, and `allergen.short`.
- Menu: category summaries, items, and `allergen.full` (the block with `id="allergen"`).
- Pre-order, checkout, and custom: a link to that allergen block, not the full paragraph again.

## Contact, checkout, and custom-order wording

The field labels (Name, Phone, Email, and so on) live in the HTML files: `contact.html`, `checkout.html`, `custom.html`, and `order.html`. You rarely need to touch those.

The introductory sentences come from `content/site.json` under `pages`. Checkout and the pre-order form also use `dateHelp`. The menu price line uses `priceNote` in `content/menu.json`.

There is no payment step. Do not add a card form here. The checkout page says Chana confirms the total by text and that payment is not collected on the site.

## Connecting the forms

Visitors can always text **413-355-3682**. The forms also try to send a copy if you fill in `forms` inside `content/site.json`.

Leave a value as `""` if you are not using it.

### Option A — email (mailto)

Put Chana's email in `forms.notifyEmail`:

```json
"notifyEmail": "chana@example.com"
```

Use the real address, not example.com. When someone submits, their email app opens with the order written out. This works for order, checkout, contact, custom, and the email signup. It does not work well on phones that have no mail app, which is why the text button is always there too.

### Option B — Formspree

1. Create a free form at https://formspree.io/ for each purpose you care about (one form can be reused if you prefer a single inbox).
2. Copy the endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into the matching key:

```json
"formspree": {
  "order": "https://formspree.io/f/your-id",
  "checkout": "https://formspree.io/f/your-id",
  "contact": "https://formspree.io/f/your-id",
  "custom": "https://formspree.io/f/your-id",
  "signup": "https://formspree.io/f/your-id"
}
```

If a Formspree URL is present, that form is sent there and the mailto address is not used for that form. Check Formspree's spam filter and confirm the first test email.

### Option C — Buttondown for the email list

Signup is in two places:

- Home: email only, under the category names.
- Updates: optional name and email, under the notes.

There is no signup in the footer.

To store addresses in Buttondown:

1. Create a newsletter at https://buttondown.com/
2. Set `forms.buttondownUsername` to the username in your Buttondown URL.
3. Leave `formspree.signup` empty if you want signup to go to Buttondown. If `buttondownUsername` is set, the signup form sends people to Buttondown's own confirmation.

Until one of these is connected, the site says the email was not saved and asks the visitor to text it to 413-355-3682. It does not pretend they joined a list.

## What you should not have to edit

- `css/styles.css` — colors and layout. The cream / beige / brown tokens are at the top of that file if a color ever needs a small change.
- `js/` — cart, forms, header, footer.
- Page files — only if you are adding a new page.

## Deploy, in short

1. Edit the JSON (or this file).
2. Commit and push to `main`, or merge a pull request.
3. GitHub runs **Publish to GitHub Pages**.
4. The site updates at https://nathanoiknine.github.io/chanas-baked-goods/

The first time, a person with admin access on the GitHub repo must set **Settings → Pages → Source** to **GitHub Actions**. Steps are in [README.md](README.md).

## Preview before you publish

```bash
python3 -m http.server 4173
```

Open http://localhost:4173/ and click through Home, Menu, an add-to-cart, Checkout, the pre-order form, Custom order, Contact, Updates, and Pickup.
