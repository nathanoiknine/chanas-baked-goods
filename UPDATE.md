# Updating Chana's Baked Goods

This is the editing guide. The public pages read these files when someone opens the site. You do not need to change the HTML for ordinary updates.

After you change a file, commit it to the `main` branch (or merge a pull request into `main`). GitHub Actions publishes the site within a few minutes. Then refresh https://nathanoiknine.github.io/chanas-baked-goods/ — a hard refresh is sometimes needed.

The phone number used everywhere in the live pages is `business.phoneDisplay` in `content/site.json`. Keep it as **413-355-3682** unless the real number changes. `phoneSms` is the same number with a country code: `+14133553682`.

## Menu — `content/menu.json`

The menu is a list of categories. Current categories: Sourdough, Cookies, Cookie platters, Cakes, Lemon bars, Rugelach, Dessert cups, Pavlova. Add another category by copying a whole category block, or add an item inside `items`.

Each item looks like this:

```json
{
  "id": "chocolate-chip",
  "name": "Chocolate chip",
  "description": "A classic chip cookie, not too sweet.",
  "price": 16,
  "unit": "dozen",
  "featured": true,
  "available": true
}
```

- `id` is a short name with hyphens. It must be unique. Do not change an id that people might already have in a cart unless you mean to retire that item.
- `price` is a placeholder number so checkout can show an estimate. Chana still confirms the real price by text. Set `"price": null` to show "Price by message" instead of a dollar amount. Custom work should stay priced by message.
- `unit` is the words after the price, such as `loaf` or `box of 12`.
- `"featured": true` puts the item in the "From the menu" row on the home page. Leave the line off if it should not be featured.
- `"available": false` hides the item without deleting it.
- The two notes at the top of the file (`note` and `priceNote`) are the sentences at the top of the menu page. The menu is allowed to change. It is not a permanent catalog.

Keep every product pareve (non-dairy). Do not add a dairy item without rewriting the pareve lines in `content/site.json` as well.

JSON is picky: quotes around text, commas between lines, no comma after the last item in a list. If the menu page is blank, a comma is usually the problem. You can paste the file into https://jsonlint.com to check it.

## Announcements — `content/announcements.json`

This is a list. The sample note is "Preorders are open". Copy that block to add another.

- `id` becomes the link (`announcements.html#preorders-open`). Use a new id each time.
- `date` is `YYYY-MM-DD`.
- `title` is the heading.
- `excerpt` is the short line in the banner at the top of the site.
- `body` is the full note. A blank line between sentences (in the JSON string, that is `\n\n`) starts a new paragraph.
- `"pinned": true` shows that note in the top banner. Only the first pinned note is used. Set it to `false` when the banner should come down. The note still stays on the Updates page.

## About — `content/about.json`

`title`, `lede`, and `paragraphs` are the About page, written in Chana's voice as a starting point. Rewrite them freely. The baker's name, the text number, "fully kosher", and "pareve" on that page come from `content/site.json`, so the phone number does not have to be typed again here.

## Allergen notice, pickup, tagline, policies — `content/site.json`

| What you want to change | Where |
| --- | --- |
| Bakery name, Chana's name | `business.name`, `business.baker` |
| Text number | `business.phoneDisplay` and `business.phoneSms` |
| Tagline | `business.tagline` (the main line is "Small-batch baking, made from scratch.") |
| Footer sign-off | `business.footerSignoff` ("Baked with care") |
| The sentence under the name in the footer | `business.description` |
| "Custom orders / one-week notice / no minimum" | `business.policies` and the `facts` list |
| Home page opening paragraph | `hero.lede` and `hero.kicker` |
| The short list on the home page | `facts` |
| The three "How to order" steps | `steps` |
| Introductions on Menu, Order, Contact, Checkout, Custom, Updates | `pages` |
| Price explanation | `pricingNote` |
| Allergen heading, footer line, and full notice | `allergen.heading`, `allergen.short`, `allergen.full` |
| Pickup and delivery paragraphs | `pickup.intro` and `pickup.paragraphs` |
| Named delivery neighborhoods | `pickup.neighborhoods` — a list of strings. Leave it `[]` until the list is real. The page says delivery is limited and still confirmed by text. |
| Map center | `pickup.map.lat`, `pickup.map.lng`, and `radiusMeters` (how wide the circle is, in meters). The caption should keep saying the circle is not a hard boundary. |
| Email signup heading and button | `signup.title`, `signup.intro`, `signup.button`, `signup.success` |

The full allergen notice is shown on Home, Menu, the pre-order form, custom orders, and checkout review. The short version is in the footer of every page.

Home, the footer, and the order pages should keep saying what this is, what she bakes, kosher, pareve, custom orders, one-week notice, no minimum, the text number, and Pacific Beach.

## Contact, checkout, and custom-order wording

The field labels (Name, Phone, Email, and so on) live in the HTML files: `contact.html`, `checkout.html`, `custom.html`, and `order.html`. You rarely need to touch those.

The introductory sentences come from `content/site.json` under `pages`. Checkout also uses `pricingNote` and `dateHelp`.

There is no payment step. Do not add a card form here. If a payment tool is added later, it should be a separate project decision. The checkout page already says Chana confirms the total by text and that payment is not collected on the site.

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

The signup blocks are on the home page, the Updates page, and the footer. They ask for an optional name and an email (the footer asks for email only).

To store addresses in Buttondown:

1. Create a newsletter at https://buttondown.com/
2. Set `forms.buttondownUsername` to the username in your Buttondown URL.
3. Leave `formspree.signup` empty if you want signup to go to Buttondown. If `buttondownUsername` is set, the signup form sends people to Buttondown's own confirmation.

Until one of these is connected, the site tells the visitor honestly that the email was not saved, and asks them to text it to 413-355-3682. It does not pretend they joined a list.

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
