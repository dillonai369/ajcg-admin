/**
 * One-shot migration: read /data/*.json and insert into Supabase.
 *
 * Run with:
 *   npx tsx supabase/seed.ts
 *
 * Requires .env.local to have:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Idempotent: uses upsert on slug, so re-running is safe.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function load<T>(file: string): Promise<T[]> {
  const raw = await readFile(path.join(process.cwd(), "data", file), "utf-8");
  return JSON.parse(raw);
}

async function seedBrokers() {
  const brokers = await load<any>("brokers.json");
  console.log(`Seeding ${brokers.length} brokers...`);

  const rows = brokers.map((b) => ({
    slug: b.slug,
    page_slug: b.page_slug,
    name: b.name,
    title: b.title || null,
    email: b.email || null,
    phone: b.phone || null,
    phone_raw: b.phone_raw || null,
    photo_url: b.photo_url || null,
    card_photo_url: b.card_photo_url || null,
    bio: b.bio || null,
    is_partner: !!b.is_partner,
    display_order: b.display_order ?? 99,
    track_record: b.track_record || [],
    canonical_url: b.canonical_url || null,
    meta_description: b.meta_description || null,
    show_on_team_page: true,
  }));

  const { error } = await db.from("brokers").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log("  ✓ Brokers seeded");
}

async function seedProperties() {
  const properties = await load<any>("properties.json");
  console.log(`Seeding ${properties.length} properties...`);

  const rows = properties.map((p) => ({
    slug: p.slug,
    page_slug: p.page_slug,
    name: p.name,
    location: p.location || null,
    units: p.units || null,
    type: p.type || "Multifamily",
    status: p.status || "sold",
    description: p.description || null,
    body: p.body || null,
    hero_image: p.hero_image || null,
    images: p.images || [],
    canonical_url: p.canonical_url || null,
  }));

  // Batch in chunks of 25
  for (let i = 0; i < rows.length; i += 25) {
    const chunk = rows.slice(i, i + 25);
    const { error } = await db.from("properties").upsert(chunk, { onConflict: "slug" });
    if (error) throw error;
    console.log(`  ✓ ${Math.min(i + 25, rows.length)}/${rows.length}`);
  }
}

async function seedPosts() {
  const posts = await load<any>("posts.json");
  console.log(`Seeding ${posts.length} posts...`);

  const rows = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || null,
    category: p.category || "Insights",
    status: p.status || "published",
    hero_image_class: p.hero_image_class || null,
    blocks: p.blocks || [],
    published_at: p.status === "published" ? new Date().toISOString() : null,
  }));

  const { error } = await db.from("posts").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log("  ✓ Posts seeded");
}

async function main() {
  console.log("🌱 Seeding Supabase with AJCG data...\n");
  await seedBrokers();
  await seedProperties();
  await seedPosts();
  console.log("\n✅ Done.");
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e);
  process.exit(1);
});
