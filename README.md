# Chana's Baked Goods

Marketing and pre-order site for Chana Oiknine's home bakery in Pacific Beach, San Diego.

**Live site (after GitHub Pages is enabled and this is on `main`):**  
https://nathanoiknine.github.io/chanas-baked-goods/

The site is a static set of HTML pages. There is no app server and no payment processor. Orders are requests. Chana confirms timing and price by text at **413-355-3682**.

## Pages

| Page | File | What it is |
| --- | --- | --- |
| Home | `index.html` | What the bakery is, offerings, how to order, allergen notice, email signup |
| Menu | `menu.html` | Editable menu with categories and placeholder prices |
| About | `about.html` | Short personal page |
| Updates | `announcements.html` | Announcements, plus email signup |
| Pre-order | `order.html` | Name, phone, email, items and quantities, date, notes |
| Checkout | `checkout.html` | Cart, details, review, then a pre-order request |
| Custom order | `custom.html` | Special bakes that are not on the menu |
| Contact | `contact.html` | Name, email, phone, message |
| Pickup | `pickup.html` | Pacific Beach pickup, limited nearby delivery, map |

Footer on every page: kosher, pareve, custom orders, one-week notice, no minimum, the text number, Pacific Beach, a short allergen notice, and "Baked with care".

## How Chana updates the words

Day-to-day edits live in the `content/` folder, not in the page layout. See **[UPDATE.md](UPDATE.md)** for the exact steps (menu, announcements, about, allergen text, pickup area, phone number, and connecting a form).

## Look

Cream, beige, and warm paper backgrounds. Dark brown is for text and small buttons, not big dark panels. Headings are a serif, body text is a plain sans, and "Baked with care" is the only script line.

There is no logo file and no product-photo library. The pages are meant to look finished with type, spacing, and a few simple line icons. Optional images can be added later under `public/assets/`. The site does not require them, and it does not pretend to have a finished photo set.

## Run it on your computer

From this folder:

```bash
python3 -m http.server 4173
```

Open http://localhost:4173/

Opening the HTML files directly (`file://`) will not load the menu, because the browser blocks those requests. Use the local server above.

## Publish on GitHub Pages

The site is ready for this address:

https://nathanoiknine.github.io/chanas-baked-goods/

Merging to `main` runs `.github/workflows/pages.yml`, which publishes the site with GitHub Actions.

**One setting has to be flipped in GitHub before the first deploy** (this repository change cannot flip it):

1. Open **Settings → Pages** for `nathanoiknine/chanas-baked-goods`  
   https://github.com/nathanoiknine/chanas-baked-goods/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not "Deploy from a branch").
3. Merge the site to `main`.
4. Open the **Actions** tab and wait for **Publish to GitHub Pages** to finish.
5. Visit https://nathanoiknine.github.io/chanas-baked-goods/

If Actions is disabled, turn it on under **Settings → Actions → General**.

A `.nojekyll` file is included so GitHub does not run Jekyll over the HTML.

## Forms

Nothing is stored in a database. Until an email address or Formspree form is added in `content/site.json`, submitting a form shows a summary and a button that texts **413-355-3682**. That text is the working inbox.

How to connect Formspree, a mailto address, or Buttondown is in [UPDATE.md](UPDATE.md).

The cart lives in the visitor's browser (`localStorage`) on that phone or computer only.

## Payment

There is no card checkout. The checkout page is a pre-order review. Copy on that page says payment can be added later and that Chana confirms the real total by text.
