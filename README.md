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
ID | appointment number | client name | treatment name | phone number | preferred date | preferred time | platform | status | created by
```
`platform` on an appointment records how *that particular booking* was made (Walk-in, Phone Call,
Website, Social Media, Referral, Other) — separate from the client's own `platform` on the
`Clients` tab, since a client can book differently each time.

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

## 1b. (Optional) Set up the separate Leads Google Sheet

The "Lead Form" section (FAT Contouring / Body Fillers) reads from its **own, separate** Google
Sheet file — not the one above. If you already have this sheet, it just needs two tabs with these
exact headers:

### Tab: `FAT Contouring`
Typically populated by a Facebook/Meta Lead Ads export or automation — the app only reads it, it
never writes to it. Row 1 headers, exact spelling/case:
```
created_time | ad_id | ad_name | adset_id | adset_name | campaign_id | campaign_name | form_id | form_name | is_organic | platform | Are_you_18_years_of_age_or_older? | which_area_would_you_like_to_discuss_for_body_contouring? | what_would_you_mainly_like_to_learn_more_about? | full_name | phone_number | city | lead_status | 1st Status | 2nd Status | are_you_18_years_of_age_or_older?
```
Note there are two near-identical headers differing only by the first letter's case
(`Are_you_18...` and `are_you_18...`) — both are kept as separate columns, labeled "18+? (A)" and
"18+? (B)" in the app, matching the source data exactly.

### Tab: `Body Fillers`
```
id | created_time | ad_id | ad_name | adset_id | adset_name | campaign_id | campaign_name | form_id | form_name | is_organic | platform | are_you_18_years_of_age_or_older? | which_filler_treatment_are_you_interested_in? | what_is_the_best_time_to_contact_you? | full_name | phone_number | city | lead_status | Call 01 | Call 02 | Call 03 | Note | Treatment | Staff
```

**This sheet needs to be shared with the same service account** you set up in step 2 below (its
`client_email`) — Viewer access is enough, since the app only reads this sheet. Then grab its
Sheet ID from its URL the same way as in step 1, and set it as `GOOGLE_LEADS_SHEET_ID` in step 3.

If you don't need the Lead Form feature, skip this — just leave `GOOGLE_LEADS_SHEET_ID` unset and
that section of the app will show a clear error instead of breaking anything else.

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
   cannot read or write the sheet. **If you're using the separate Leads sheet from step 1b,
   share that one with the same `client_email` too** (Viewer access is enough for it).
7. Get your Sheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit`

---

## 3. Configure environment variables

Copy `.env.example` to `.env.local` for local development and fill in:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=...
GOOGLE_LEADS_SHEET_ID=...
SESSION_SECRET=any-long-random-string
```

`GOOGLE_PRIVATE_KEY` must keep its `\n` sequences and be wrapped in quotes. `GOOGLE_LEADS_SHEET_ID`
is only needed if you're using the Lead Form section (step 1b) — otherwise leave it out entirely.

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

- **Lead Form**: an expandable nav section with two sub-pages, "FAT Contouring" and "Body
  Fillers", reading from a **separate Google Sheet file** (its own `GOOGLE_LEADS_SHEET_ID`, see
  setup section 1b) rather than the main one used everywhere else — `lib/googleSheets.js` accepts
  an optional `spreadsheetId` on every function for exactly this reason. Both admins and employees
  can view it. A single dynamic API route (`/api/leads/[table]`) serves both tables.
  - **Defaults**: FAT Contouring defaults to showing Full Name, Phone Number, City, Area of
    Interest, and Wants to Learn About; Body Fillers defaults to Full Name, Phone Number, City,
    Filler Treatment Interest, and Platform. Every other column (ad/campaign metadata, etc.) is
    still there — just hidden until turned on via the Table Settings column picker, same as
    Clients/Appointments.
  - **Editable follow-up columns**: on FAT Contouring, "1st Status" and "2nd Status" are
    editable; on Body Fillers, "Note", "Staff", "Call 01", "Call 02", and "Call 03" are editable.
    Both tables have an **Actions** column with an **Edit** button that opens a small form for
    just those fields — everything else in the row stays read-only, since that data is meant to
    arrive from an external source (e.g. a Facebook Lead Ads export or automation) and shouldn't
    be hand-edited. The editable set is enforced server-side too — the PATCH endpoint rejects any
    other field even if called directly.
  - **Date search**: type a date into the date field (or click "Today") to see just that day's
    leads — the app resolves this against the sheet's `created_time` column so no manual date
    parsing is expected in the sheet. Once a date is selected, results switch to **ascending
    order** (oldest to newest within that day) instead of the usual most-recent-first; clear the
    date to go back to normal.
  - **Today's Leads**: a dedicated stat card next to Total Leads always reflects today's count,
    independent of whatever date filter you currently have applied to the table below it.
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
- **Numbers-only phone input**: on the Add/Edit Client form, the phone field strips any
  non-numeric characters as you type (letters, spaces, dashes, symbols) and caps it at 15 digits.
  (CSV/Excel import still accepts phone numbers as free text, since that data is already
  formatted however your source file has it.)
- **Unique phone numbers**: a client's phone number must be unique. This is checked on manual
  create, manual edit, and CSV/Excel import alike — duplicates are rejected (a 409 error on the
  form, or counted into "skipped" on import, including duplicates *within* the uploaded file
  itself, not just against what's already in the sheet).
- **Modern UI**: Inter font (via `next/font`, no layout shift), a dedicated `brand` color scale,
  a dark sidebar with a gradient logo mark, and consistent rounded-2xl cards with soft shadows
  across every page.
- **Dashboard analytics**: five charts (via `recharts`, added to `package.json` — run `npm install`
  after pulling this update) driven by a single `/api/stats?type=charts` call: a 14-day appointment
  volume trend, an appointment status donut, a 6-month client growth bar chart, a "where clients
  come from" breakdown by client registration platform, and a "how appointments are booked"
  breakdown by each appointment's own booking platform.
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
- **Client ↔ Appointment relationship**: on the appointment form there's one combined lookup field —
  type either the client's mobile number *or* their name, and it auto-fills the moment it exactly
  matches a registered client (typing a name resolves it to that client's real phone number
  automatically), with a small suggestion list while you're still typing. The Client dropdown below
  it works the same way in reverse. Either way, only clients already in the `Clients` sheet can be
  used — there's no free text, so appointments can only be created for already-registered clients. This is also enforced server-side (the
  `/api/appointments` POST/PUT routes reject any client name that isn't found in `Clients`), so it
  can't be bypassed by calling the API directly either.

## Notes / things you may want to adjust
- Appointment numbers are auto-generated as `APT-<timestamp>`. Change the format in
  `app/api/appointments/route.js` if you'd prefer sequential numbers.
- "Improvement vs last month" on the Clients dashboard compares client `created at` dates month
  over month.
- If your Sheets API calls ever feel slow, it's almost always the very first "cold start" request
  to a serverless function — subsequent requests within a few seconds reuse the warm cache.
