# MONARCH — Supabase

Project: `mvnmnhtcgbgpbocjafqz` · region eu-west-1

The site stays a set of static files with no build step. The public pages talk
to the database with a plain `fetch`; the admin panel additionally loads the
official `@supabase/supabase-js` from a CDN, purely for Auth — sessions and
token refresh are not worth hand-rolling.

---

## ⚠️ What you have to do, once

The admin panel will not work until an account exists. The password is not set
by me and not visible to me.

**1.** Supabase → **Authentication → Users → Add user**
Enter your email and password, and turn on **Auto Confirm User**.

**2.** Supabase → **SQL Editor**, using that same email:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'your@email.com'
on conflict (user_id) do nothing;

select * from public.admins;
```

**3.** Open `/admin` and sign in.

Having an account is not enough on its own: access comes only from a row in
`admins`. Verified — a user outside that list sees neither bookings nor orders.

---

## Tables

| Table | What it holds | Public read | Public write |
|---|---|---|---|
| `appointments` | booking requests | **no** | insert only |
| `orders` | shop orders | **no** | insert only |
| `services` | services (9) | yes | no |
| `barbers` | the team (4) | yes | no |
| `gallery` | photos (9) | yes | no |
| `products` | product prices (12) | yes | no |
| `shop_settings` | shop rules | yes | no |
| `admins` | who is an administrator | no | no |

Anything in the right-hand column can only be changed by an administrator.

### Why the key in the source is fine

`sb_publishable_…` is visible to anyone who opens the page. That is the intent:
it **names the project**, it does not grant rights. RLS decides everything. The
secret key (`service_role`) is not used in client code anywhere.

---

## Protecting order totals

Prices live in `products`, and the `orders_enforce_totals` trigger
**recalculates** every total on insert. What the browser sent is stored
separately in `client_total` — and never used.

Verified by attempting to substitute one:

| Sent by the browser | Stored by the server |
|---|---|
| 1 ₴ | **1650 ₴** |

Also rejected: a product that does not exist (400), a total below the minimum
(400), and an attempt to set the status straight to `confirmed` (401).

---

## Storage

Bucket **`media`**, public for reading, up to 5 MB per file, images only
(JPEG, PNG, WebP, AVIF). Two folders: `barbers/` and `gallery/`.
Only an administrator can upload, replace or delete.

The site's existing photos were **not migrated** — they remain files in
`images/`, and the database stores those same paths. New uploads go to Storage
and keep their full URL. The page renders whatever it finds in the field, so
both forms coexist.

---

## What now reads from the database

At startup `script.js` reads `services`, `barbers`, `gallery`, `shop_settings`
and `products`. If a request fails, the site draws the same arrays that used to
be hard-coded. There is never an empty page.

So a change made in the admin panel appears on the site after a reload.

---

## Admin panel

`/admin` (the file `admin.html`, redirected in `_redirects`).

| Section | What it can do |
|---|---|
| **Bookings** | list, search by name/phone/service, filter by date and status, change status, delete |
| **Orders** | contents, delivery address, customer note, six states, delete |
| **Barbers** | add, edit, upload a photo, delete |
| **Gallery** | upload (several files at once), edit captions and cell size, replace a photo, delete |
| **Services** | add, edit, delete — name, description, price, duration in minutes |
| **Products** | add, edit, delete — name, description, price, category, badge, availability |

Bilingual throughout: the English field can be left empty and the site will
fall back to the Ukrainian one.

Prices set in **Products** are the prices the server charges — the trigger
above reads them from this same table.

Responsive: on a phone the bookings table becomes cards and the tabs scroll
horizontally.

---

## When a request fails

A booking or an order is not lost — a copy, with the error text, goes to
`localStorage` (`monarch_bookings_failed`, `monarch_orders_failed`). The
customer sees an honest failure message rather than a false confirmation, and
the cart is kept so they can try again.

There is deliberately no automatic retry: a failed request may still have
reached the database, and retrying would create a duplicate.
