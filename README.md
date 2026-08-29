# MONARCH — Barbershop

A barbershop website with online booking, a shop and an admin panel.
Built **with no framework and no build step** — a set of static files you can
open directly, with the data living in Supabase.

**Demo:** https://barbershop0.netlify.app · **Admin:** https://barbershop0.netlify.app/admin

The site is in English by default; Ukrainian is one click away in the header.

---

## What it does

**Customer side**

- Online booking — service, barber, date, time, note; the request goes straight
  into the database
- A 12-item shop with category filters
- Cart: quantities, removal, totals, kept between sessions
- Checkout: pickup or delivery, three payment methods, phone validation for
  10 countries
- "Order" as a single item, without touching the cart
- Two languages (EN / UA), switched without a page reload
- Gallery with a lightbox, reviews, contacts, and a live open/closed indicator

**Admin panel** (`/admin`)

- Bookings — search, filter by date and status, change status, delete
- Orders — contents, delivery address, customer note, six states
- Barbers, gallery, services, products — full CRUD with photo upload
- Bilingual editing: leave the English field empty and the Ukrainian is used

---

## Stack

| | |
|---|---|
| Frontend | HTML, CSS, JavaScript (ES5-compatible, no dependencies) |
| Backend | Supabase — PostgreSQL, Auth, Storage |
| Data access | PostgREST over `fetch`; the admin adds `@supabase/supabase-js` from a CDN for Auth |
| Hosting | Netlify |
| Page generation | A Python script — no npm, no node_modules |

Why no framework: this is a shop window for a barbershop, a handful of pages.
React or Vue would have added a build, a dependency tree and a deploy step
without supplying anything the site was missing. The cost of that decision is
hand-written DOM work; it pays for itself in a site that loads as two files.

---

## Layout

```
├── index.html              home
├── about.html              ┐
├── services.html           │ generated from index.html:
├── barbers.html            │ the shared header, footer and
├── shop.html               │ overlays live in one place
├── reviews.html            ┘
├── admin.html              admin panel
│
├── script.js               all site logic (~3400 lines)
├── style.css               site styles
├── admin.js                admin logic
├── admin.css               admin styles (colours inherited from style.css)
│
├── data/stats.json         the counters on the home page
├── images/                 photos; gallery and products may also live in Storage
│
├── _headers                caching and security headers for Netlify
├── _redirects              /admin → /admin.html
├── .gitattributes          check text out with LF on every platform
│
├── docs/supabase.md        schema, RLS policies, how to create an admin
└── .claude/
    ├── build_pages.py      page generator + asset version stamp
    └── devserver.py        local server with caching disabled
```

### How `script.js` is arranged

One IIFE, split into numbered sections — from data and translations through to
the cart, checkout and navigation. The data (`SERVICES`, `BARBERS`, `GALLERY`,
`PRODUCTS`) is declared at the top as a fallback: at startup it is overwritten
by whatever Supabase returns, and if that request fails the page draws what is
in the file instead of rendering empty.

### Page generation

The five inner pages are not edited by hand. The header, footer, cart and every
modal are taken from `index.html`, so they cannot drift apart:

```bash
python .claude/build_pages.py
```

The same script hashes `style.css` and `script.js` and writes the digest into
their URLs (`script.js?v=01b361ca`). That nails caching shut: the file changed,
so the address changed, so the browser has no choice but to fetch it again.
Run it after every change to those two files.

Each page's `title`, `description`, `og:` tags and `canonical` are defined in
that script too, which is why all six are distinct. Edit them there, not in the
generated HTML.

---

## Running it

The site is static: no build, no `npm install`, no `node_modules`. Both scripts
in `.claude/` are Python 3 and use only the standard library, so there is
nothing to install after `git clone`.

```bash
git clone https://github.com/firegame2006-dot/barber-shop-2.git
cd barber-shop-2
python .claude/devserver.py 5173
```

Then open `http://localhost:5173`. The server sends `no-store` so you never
pick up a stale file while working.

Locally the admin panel is at `/admin.html`: the short `/admin` comes from
`_redirects`, which is a Netlify feature, not something the dev server does.

You can also open `index.html` straight from disk — Supabase will be
unreachable (`file://` blocks the requests) and the site will show the data
baked into `script.js`.

---

## Admin panel

It opens at `/admin`. Access is granted **by the database, not by the page**:
every table refuses reads and writes unless `auth.uid()` is present in the
`admins` table. Even someone who bypasses the check in the browser gets back no
rows at all.

To create an administrator, see [docs/supabase.md](docs/supabase.md).

### About the key in the source

`sb_publishable_…` is visible to anyone who opens the page, and that is the
design: the key **names the project**, it does not grant rights. The RLS
policies decide everything. `service_role` is not used in client code anywhere,
and no `.env` is needed.

The public key can do exactly two things: create a booking or an order, and
read what is already drawn on the site. Reading other people's bookings,
changing statuses or deleting — no.

### Order totals

Prices live in the `products` table, and a trigger recalculates every total on
insert. What the browser sent is stored separately in `client_total` and never
used — substituting a total through DevTools does not work.

---

## Database

| Table | What it holds | Public read | Public write |
|---|---|---|---|
| `appointments` | booking requests | no | insert only |
| `orders` | shop orders | no | insert only |
| `services` | services | yes | no |
| `barbers` | the team | yes | no |
| `gallery` | photos | yes | no |
| `products` | products and prices | yes | no |
| `shop_settings` | minimum order, delivery | yes | no |
| `admins` | who is an administrator | no | no |

Details, policies and SQL are in [docs/supabase.md](docs/supabase.md).

---

## A few decisions worth explaining

**Two languages through a dictionary, not through separate pages.** Every
element carrying `data-i18n` takes its text from the dictionary in `script.js`;
switching does not reload the page and does not double the number of files.

**The mobile version is not a narrowed desktop.** On a phone the long home-page
sections are replaced by a tile of sections, and those sections open as pages of
their own. Booking and contacts become popups.

**A product can be ordered without touching the cart.** "Order" opens checkout
for that one item; the cart is neither emptied nor added to.

**A request is not lost when the network fails.** If it does not go through, a
copy goes to `localStorage` and the customer sees an honest failure message
rather than a false "thank you". There is deliberately no automatic retry: a
failed request may still have reached the database, and a duplicate would cause
more trouble than it solved.

**Structured data omits what it cannot honestly assert.** The JSON-LD block
describes the business, but the address, telephone and geo fields are left out:
the contact details on this demo are masked placeholders, and publishing
invented ones would be claiming a business exists at an address it does not.

---

## Possible next steps

- Barber schedules: booked slots are not currently checked
- Notifying the administrator of a new request
- Moving reviews into the database — they are still hard-coded in `script.js`
- Online payment: the "online" method is present in the form but disabled and
  labelled "Soon"
