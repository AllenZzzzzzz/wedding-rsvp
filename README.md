# Allen & Yoon — Wedding RSVP Site

Next.js + Supabase + Framer Motion. Password-gated, scroll-driven Apple-style
hero, parallax gallery, RSVP form with duplicate-name flagging, and an admin
dashboard with inline edit/delete and one-click Excel export.

## 1. Set up Supabase (the database)

1. Create a free project at supabase.com.
2. Open **SQL Editor** → New query → paste the contents of `supabase/schema.sql` → Run.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → this is `SUPABASE_URL`
   - `service_role` key (not the `anon` key) → this is `SUPABASE_SERVICE_ROLE_KEY`
   Keep the service-role key secret — it's server-only, never used in the browser.

## 2. Add your photos

Drop files into `public/photos/`:
- `hero-1.jpg` … `hero-4.jpg` — the four scroll-hero photos on the homepage
- `gallery-1.jpg` … `gallery-4.jpg` — the parallax gallery strip

Add as many `gallery-N.jpg` entries as you like — just extend the `GALLERY_PHOTOS`
array in `app/page.tsx` to match. Any image works; landscape or portrait both
look fine since the layouts crop to fill.

## 3. Set environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
WEDDING_PASSWORD=pick-your-own-guest-password
ADMIN_PASSWORD=pick-your-own-private-password
```

## 4. Run locally

```
npm install
npm run dev
```

Visit `http://localhost:3000` — you'll hit the password gate first, then the
site. Visit `http://localhost:3000/admin` for the dashboard (separate password).

## 5. Deploy to Vercel, pointed at allenonghh.com

1. Push this folder to a GitHub repo.
2. In Vercel: **New Project** → import that repo.
3. In the import screen (or after, under **Settings → Environment Variables**),
   add the same four variables from step 3.
4. Deploy.
5. **Settings → Domains** → add `allenonghh.com` (or a subdomain like
   `wedding.allenonghh.com` if you want to keep the root domain for something
   else) → follow Vercel's DNS instructions (usually one A or CNAME record at
   your domain registrar).

## How guests use it

1. Open the link → enter the shared guest password (the value of
   `WEDDING_PASSWORD`).
2. Scroll through the story hero, browse the gallery, fill in the RSVP form.
3. If their name closely matches someone already in the list, they'll see a
   "possible duplicate" notice and can confirm to submit anyway — you review
   both entries later in the admin dashboard if needed.

## How you manage it

1. Go to `/admin`, log in with `ADMIN_PASSWORD`.
2. See live counts (attending / plus ones / total pax / declined).
3. Edit any row inline (fix a typo, merge a duplicate, update meal choice)
   or delete a row.
4. Click **Export to Excel** any time for a `.xlsx` snapshot of the full list.

## Changing the password later

Update `WEDDING_PASSWORD` (or `ADMIN_PASSWORD`) in Vercel's environment
variables and redeploy — no code change needed. Guests who already entered
the old password stay logged in via their cookie until it expires (180 days)
or you change the password, whichever comes first.
