# AJ Commercial Group — Admin

The admin app for [ajcommercialgroup.com](https://www.ajcommercialgroup.com). Built with Next.js 15 (App Router), TypeScript, and Tailwind. Designed to deploy at `app.ajcommercialgroup.com`.

## What this is

A working admin dashboard for AJ Commercial Group's two founders — Joey Batliner and Anthony Munoz — to manage:

- **Listings** — all 64 properties (sold inventory + active listings)
- **Brokers** — the 9-person team page (photos, bios, contact info, track records)
- **Blog** — 6 published posts plus future drafts (block-based editor)
- **SEO** — keyword rankings, backlinks (placeholder data; wired to DataForSEO later)
- **Settings** — team, integrations, notifications
- **Overview** — site visitors, form submissions, recent activity (placeholder analytics for now)

## Running it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

The first page is the Overview. The sidebar navigates to Listings, Blog, Brokers, SEO, and Settings. Clicking any listing or broker card opens a full editor — edits Save back to the JSON files in `data/`.

## Where the data lives

All data is stored as JSON in `data/`:

- `data/brokers.json` — 9 brokers
- `data/properties.json` — 64 properties
- `data/posts.json` — 6 blog posts

These files are read and written by `src/lib/data.ts` via Node's `fs/promises`, with atomic-rename writes and a per-file in-process mutex. Good enough until we migrate to Supabase.

## What's NOT done yet (needs your input)

1. **Clerk auth** — currently the app is wide open. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env`, install `@clerk/nextjs`, wrap `app/layout.tsx` in `<ClerkProvider>`, and wrap pages with `<SignedIn>`. See `// TODO: wrap with Clerk's <SignedIn>` comments in `layout.tsx`.
2. **Supabase migration** — once you're ready to move off JSON files, swap the functions in `src/lib/data.ts` for Supabase calls. The API routes won't need to change.
3. **Anthropic API key (AI-assist features)** — the "Generate with Claude" / "Polish selection" buttons in the listing and blog editors are wired into the UI but don't call the API yet. Add `ANTHROPIC_API_KEY` and create `src/app/api/ai/route.ts` that calls Claude.
4. **Image upload** — the broker photo uploader saves base64 data URLs into `brokers.json` for now. Once Supabase Storage is wired up, replace `PhotoUpload` and the broker-photo input with calls to `/api/upload` that return CDN URLs.
5. **Sync to live site** — the admin currently writes to JSON only. The next phase needs to either push to GHL (via API) or rebuild the public site to read the same Supabase tables.
6. **Logo file** — drop `logo.png` into `public/` (referenced by Sidebar fallback in the design). The current sidebar shows the gold "AJ" mark.

## Next steps to deploy

1. Add a `logo.png` (40×40) to `public/`.
2. Set up Clerk: `npm install @clerk/nextjs`, wrap layout, add env vars, deploy.
3. Provision Supabase: create `brokers`, `properties`, `posts`, `inquiries` tables matching the JSON shapes. Migrate data with a one-shot script.
4. Buy `app.ajcommercialgroup.com` DNS record → point at Vercel.
5. Wire DataForSEO + Plausible into the Overview & SEO pages.
6. Wire Anthropic API into AI-assist endpoints.

## Tech stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS 3 (with CSS variables for brand colors)
- Lucide icons
- Chart.js + react-chartjs-2 (overview traffic chart)
- Inter (sans) + Cormorant Garamond (serif) from Google Fonts

## Folder map

```
src/
  app/
    layout.tsx       root layout + Sidebar
    globals.css      brand CSS vars + utility classes
    page.tsx         /  Overview
    listings/        list + [slug] editor
    blog/            list + [slug] editor
    brokers/         list + [slug] editor
    seo/page.tsx     static SEO page
    settings/page.tsx static settings page
    api/             route handlers (GET/PUT/POST/DELETE)
  components/        Sidebar, cards, editors, AI panels, BlockEditor, PhotoUpload
  lib/               types, data (JSON read/write), utils
data/                source-of-truth JSON files
public/              static assets (add logo.png here)
```
