# Clinic Manager

A Next.js admin/employee dashboard that uses a Google Sheet as its database.
Roles: **admin** (full access, including delete) and **employee** (create/update only, no delete, no Users page).

---

## 1. Set up the Google Sheet

Create a new Google Sheet with **three tabs**, named exactly as below. The first column on every
tab must be a header called `ID` — this is a hidden internal ID the app generates automatically;
you never need to fill it in by hand.

### Tab: `Clients`
Row 1 headers (exact spelling/case, columns can be in any order after ID):
```
ID | client name | phone | gender | language | platform | created at | status
```
`platform` records which channel the client registered through (Walk-in, Phone Call, Website,
Social Media, Referral, Other).

### Tab: `Appointments`
```
ID | appointment number | client name | treatment name | phone number | preferred date | preferred time | status | created by
```

> If you're upgrading an existing sheet: add a `platform` column to `Clients` (delete the old
> `number` column from `Clients` and `gender` from `Appointments` if you haven't already). Column
> order doesn't matter, only the header names.

### Tab: `Users`
```
ID | username | nic | password | usertype
```
Add at least one row here yourself so you can log in — set `usertype` to `admin`, e.g.:
```
ID: (leave blank, or any unique text)   username: admin   nic: 123456789V   password: admin123   usertype: admin
```
(If `ID` is blank on this first manual row, edit it to any unique text like `u1` — every other
row the app creates will get a proper unique ID automatically.)

> ⚠️ **Security note:** passwords are stored as plain text in the sheet, per the original request
> (no database). Anyone with edit access to the sheet can read them. If this matters for your use
> case, consider restricting sheet access tightly, or ask me to add password hashing later.

---

## 2. Create a Google Cloud service account (so the app can read/write the sheet)

1. Go to https://console.cloud.google.com/ and create a project (or use an existing one).
2. Enable the **Google Sheets API**: search "Google Sheets API" in the top search bar → Enable.
3. Go to **APIs & Services → Credentials → Create Credentials → Service account**.
   - Give it any name (e.g. `clinic-sheets-bot`) and finish the wizard (default permissions are fine).
4. Open the service account you just created → **Keys** tab → **Add Key → Create new key → JSON**.
   This downloads a `.json` file — keep it private, don't commit it to git.
5. Open that JSON file. You need two values from it:
   - `client_email` → this is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → this is your `GOOGLE_PRIVATE_KEY`
6. Open your Google Sheet, click **Share**, and share it with the `client_email` address
   (the one ending in `...iam.gserviceaccount.com`) as an **Editor**. Without this step the app
   cannot read or write the sheet.
7. Get your Sheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit`

---

## 3. Configure environment variables

Copy `.env.example` to `.env.local` for local development and fill in:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=...
SESSION_SECRET=any-long-random-string
```

`GOOGLE_PRIVATE_KEY` must keep its `\n` sequences and be wrapped in quotes.

---

## 4. Run locally

```bash
npm install
npm run dev
```
Visit http://localhost:3000 — you'll be redirected to `/login`. Log in with the admin row you
added to the `Users` sheet.

---

## 5. Deploy to Netlify

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build settings are already defined in `netlify.toml` (build command `npm run build`, the
   `@netlify/plugin-nextjs` plugin handles the rest) — Netlify should auto-detect Next.js too.
4. In **Site settings → Environment variables**, add the same four variables from step 3
   (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `SESSION_SECRET`).
   For `GOOGLE_PRIVATE_KEY`, paste it with real `\n` escape sequences exactly as in the JSON file.
5. Deploy. Netlify will install dependencies and build automatically.

---

## How it's structured

- **Auth**: username/password checked against the `Users` sheet; a signed JWT is set as an
  HTTP-only cookie (12h expiry). Middleware (`middleware.js`) protects all `/dashboard/*` routes
  and blocks non-admins from `/dashboard/users`.
- **Data access**: `lib/googleSheets.js` reads a whole sheet tab in one API call (fast, avoids
  per-row requests), with a few seconds of in-memory caching to reduce duplicate reads. Writes
  invalidate the cache immediately.
- **Pagination**: 15 rows per page for Clients and Appointments, computed server-side.
- **Search**: Clients has a single global search box; Appointments has global search + date
  filter + status filter, all combinable.
- **Table settings**: column visibility is saved per-browser in `localStorage`, with a reset
  button to restore all columns.
- **Export**: the "Export" button fetches the full filtered dataset (bypassing pagination) and
  builds an `.xlsx` file client-side.
- **Roles**: Employees see everything admins see except the Delete button (Clients &
  Appointments) and the Users page entirely; this is enforced both in the UI and again in every
  API route, so it can't be bypassed by calling the API directly.
- **Import**: the "Import" button (next to Export) lets you bulk-upload clients or appointments
  from an `.xlsx`/`.xls`/`.csv` file in one request (fast — one Sheets API call, not one per row).
  Click the small download icon next to it first to get a blank template with the correct column
  headers. Rows missing required fields, or appointment rows whose client name doesn't match an
  existing client, are skipped and reported in a summary rather than failing the whole import.
- **Unique phone numbers**: a client's phone number must be unique. This is checked on manual
  create, manual edit, and CSV/Excel import alike — duplicates are rejected (a 409 error on the
  form, or counted into "skipped" on import, including duplicates *within* the uploaded file
  itself, not just against what's already in the sheet).
- **Modern UI**: Inter font (via `next/font`, no layout shift), a dedicated `brand` color scale,
  a dark sidebar with a gradient logo mark, and consistent rounded-2xl cards with soft shadows
  across every page.
- **Dashboard analytics**: four charts (via `recharts`, added to `package.json` — run `npm install`
  after pulling this update) driven by a single `/api/stats?type=charts` call: a 14-day appointment
  volume trend, an appointment status donut, a 6-month client growth bar chart, and a "where clients
  come from" breakdown by registration platform.
- **Automatic client inactivity**: a client is automatically marked `Inactive` if they haven't had
  an appointment (by preferred date) in the last 2 months — or, for a client who's never booked at
  all, if it's been 2+ months since they were registered. This runs two ways:
  1. **Daily automatically** via a Netlify Scheduled Function (`netlify/functions/deactivate-stale-clients.mjs`,
     runs at 02:00 UTC). This only works once deployed to Netlify — it does nothing in local `npm run dev`.
  2. **On demand** via a "Run inactivity check now" button on the Dashboard page, visible to admins
     only — useful as a backup if scheduled functions aren't enabled on your Netlify plan, or if you
     just want to check right now.
  Booking a new appointment for a client instantly flips them back to `Active` (both for single
  bookings and bulk imports) — you never need to manually reactivate someone who's just booked.
  Manually setting a client to `Inactive` yourself is respected and left alone by the automatic
  check; it only ever demotes clients that are currently `Active`, never promotes anyone.
- **Client ↔ Appointment relationship**: on the appointment form you can find a client either way —
  type their mobile number and the client name auto-fills once it matches (with a small suggestion
  list while you type), or pick them by name from the dropdown, which fills the phone number in turn.
  Either way, only phone numbers/names already in the `Clients` sheet can be used — there's no free
  text, so appointments can only be created for already-registered clients. This is also enforced server-side (the
  `/api/appointments` POST/PUT routes reject any client name that isn't found in `Clients`), so it
  can't be bypassed by calling the API directly either.

## Notes / things you may want to adjust
- Appointment numbers are auto-generated as `APT-<timestamp>`. Change the format in
  `app/api/appointments/route.js` if you'd prefer sequential numbers.
- "Improvement vs last month" on the Clients dashboard compares client `created at` dates month
  over month.
- If your Sheets API calls ever feel slow, it's almost always the very first "cold start" request
  to a serverless function — subsequent requests within a few seconds reuse the warm cache.
