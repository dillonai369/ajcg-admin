# Setup checklist — 4 things on your side

I've already pre-filled `.env.local` with your public Supabase + Clerk keys. You just need to add the two **secret** keys and run a few commands.

---

## ✅ Already done (by me)

- `.env.local` created with your public keys pre-filled
- Supabase schema written (`supabase/schema.sql`)
- Seed script written (`supabase/seed.ts`) — copies all 9 brokers + 64 properties + 6 posts into Supabase
- `data.ts` refactored: auto-switches to Supabase the moment keys are present
- Anthropic AI endpoint created (`/api/ai`) — backs the "Generate with Claude" buttons
- `package.json` updated with `@supabase/supabase-js`, `@clerk/nextjs`, `@anthropic-ai/sdk`, `dotenv`, `tsx`

---

## 🟡 4 steps for you (15 minutes total)

### Step 1 — Grab the two secret keys

Open `.env.local` in this folder and you'll see two empty lines marked `⚠️ YOU NEED TO ADD THIS ONE ⚠️`.

**Supabase service_role secret:**
1. Go to https://supabase.com/dashboard/project/lqsafhnvbzdzxxpdttkd/settings/api
2. Scroll to "Project API keys"
3. Find `service_role` (with the "secret" badge)
4. Click "Reveal" → copy the long `eyJ...` string
5. Paste after `SUPABASE_SERVICE_ROLE_KEY=` in `.env.local`

**Clerk secret key:**
1. Go to https://dashboard.clerk.com → your "AJ Commercial Admin" app
2. Left sidebar: **API Keys**
3. Copy the **Secret key** (starts with `sk_test_`)
4. Paste after `CLERK_SECRET_KEY=` in `.env.local`

Save the file.

### Step 2 — Install new dependencies

```bash
cd /Users/dillai/Documents/Claude/Projects/AJcommercial/ajcg-admin
npm install
```

### Step 3 — Run the schema in Supabase

1. Go to https://supabase.com/dashboard/project/lqsafhnvbzdzxxpdttkd/sql/new
2. Open `supabase/schema.sql` from this folder, copy the entire contents
3. Paste into the SQL editor
4. Click **Run** (or Cmd+Enter)
5. You should see "Success. No rows returned." Tables created: `brokers`, `properties`, `posts`, `inquiries`, `activity`

Then create three Storage buckets:
1. Left sidebar: **Storage**
2. Click "New bucket" three times, creating: `broker-photos`, `property-photos`, `blog-images`
3. For each, toggle **Public bucket** ON

### Step 4 — Seed the database

```bash
npm run seed
```

You should see:
```
🌱 Seeding Supabase with AJCG data...
Seeding 9 brokers...
  ✓ Brokers seeded
Seeding 64 properties...
  ✓ 25/64
  ✓ 50/64
  ✓ 64/64
Seeding 6 posts...
  ✓ Posts seeded
✅ Done.
```

Then verify in Supabase: **Table Editor → brokers** → you should see all 9 rows with Joey first.

---

## 🚀 Run the app — now backed by Supabase

```bash
npm run dev
```

Open http://localhost:3000. Everything works exactly as before, but now reads and writes from Supabase. Edit Joey's bio → check Supabase **Table Editor → brokers** → you should see `updated_at` change.

---

## What's next (next session)

Once you've done the 4 steps above and confirmed Supabase has your data, ping me. I'll:

1. **Migrate the public website** — convert all 11 main pages + dynamic broker/property/blog routes into Next.js components in the same project, reading from Supabase. Pixel-identical to today's design.
2. **Wire Clerk auth** — protect `/admin/*` routes, add login/sign-up pages, configure subdomain routing so `app.ajcommercialgroup.com` lands on the admin
3. **Wire image uploads** — broker photos and listing photos upload directly to Supabase Storage
4. **Wire the inquiry form** — public site contact forms POST to `/api/inquiries`, show up in the admin Overview
5. **Deploy to Vercel + connect domain** — final step before launch

---

## Troubleshooting

**`npm install` fails:** Make sure you're in `/Users/dillai/Documents/Claude/Projects/AJcommercial/ajcg-admin` and Node 18+ is installed (`node -v`).

**`npm run seed` fails with "Missing NEXT_PUBLIC_SUPABASE_URL":** `.env.local` isn't being read. Make sure the file is in the project root (not inside `src/` or `supabase/`).

**Seed runs but Supabase tables are empty:** Make sure you ran the schema SQL first (Step 3).

**Admin shows old data after seeding:** Stop the dev server (`Ctrl+C`) and re-run `npm run dev` so it picks up the new env vars.
