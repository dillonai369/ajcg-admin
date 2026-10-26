/**
 * Compress oversized photos already sitting in Supabase Storage.
 *
 * Why: before 2026-10-26 the upload route stored files exactly as uploaded, so
 * the buckets hold raw phone PNGs of 3–4 MB. The public site now serves them
 * through the image optimizer (fast for visitors), but the originals still
 * cost bandwidth on every optimizer cache miss, in the admin UI, and on
 * Open Graph share cards. New uploads are normalised in /api/upload; this
 * script does the same for what's already there.
 *
 * For every image URL referenced by properties / brokers / posts that lives in
 * our Supabase Storage and is over THRESHOLD_KB:
 *   1. download → processImage() (EXIF-rotate, ≤2000px, JPEG/WebP q82)
 *   2. upload the result under a new key next to the original
 *   3. rewrite the DB row to point at the new URL
 * Originals are NOT deleted (nothing else is known to link them; delete by
 * hand from Storage later if you want the space back).
 *
 * Run locally (needs .env.local with the service-role key):
 *   npm run compress:images              # dry run — lists what would change
 *   npm run compress:images -- --apply   # does it
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { createClient } from "@supabase/supabase-js";
import { processImage } from "../src/lib/image-process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });
const APPLY = process.argv.includes("--apply");
const THRESHOLD_KB = 400;

const TARGETS: Array<{ table: string; single: string[]; arrays: string[] }> = [
  { table: "properties", single: ["hero_image"], arrays: ["images"] },
  { table: "brokers", single: ["photo_url", "card_photo_url"], arrays: [] },
  { table: "posts", single: ["hero_image"], arrays: [] },
];

const STORAGE_RE = new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/storage/v1/object/public/([^/]+)/(.+)$`);

const cache = new Map<string, string>(); // original URL → replacement URL (or same)
let savedBytes = 0;
let changed = 0;

async function compressOne(src: string): Promise<string> {
  if (cache.has(src)) return cache.get(src)!;
  const m = src.match(STORAGE_RE);
  if (!m) {
    cache.set(src, src);
    return src; // not in our storage (old CDN, /assets) — leave alone
  }
  const [, bucket, objectPath] = m;
  const res = await fetch(src);
  if (!res.ok) {
    console.warn(`  skip (HTTP ${res.status}): ${src}`);
    cache.set(src, src);
    return src;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (buf.length < THRESHOLD_KB * 1024) {
    cache.set(src, src);
    return src;
  }
  const out = await processImage(buf, mime);
  if (!out || out.unchanged || out.buffer.length >= buf.length * 0.9) {
    console.log(`  keep  ${(buf.length / 1024).toFixed(0)} KB  ${objectPath} (no worthwhile gain)`);
    cache.set(src, src);
    return src;
  }
  const newPath = decodeURIComponent(objectPath).replace(/\.[a-zA-Z0-9]+$/, "") + `-c.${out.ext}`;
  console.log(
    `  ${(buf.length / 1024).toFixed(0)} KB → ${(out.buffer.length / 1024).toFixed(0)} KB  ${objectPath} → ${newPath}  (${out.width}x${out.height})`,
  );
  savedBytes += buf.length - out.buffer.length;
  changed++;
  if (!APPLY) {
    const fake = `${url}/storage/v1/object/public/${bucket}/${newPath}`;
    cache.set(src, fake);
    return fake;
  }
  const { error } = await supabase.storage.from(bucket).upload(newPath, out.buffer, {
    contentType: out.contentType,
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) {
    console.error(`  upload FAILED: ${error.message}`);
    cache.set(src, src);
    return src;
  }
  const pub = supabase.storage.from(bucket).getPublicUrl(newPath).data.publicUrl;
  cache.set(src, pub);
  return pub;
}

async function run() {
  console.log(APPLY ? "APPLY mode.\n" : "DRY RUN — add --apply to execute.\n");
  for (const t of TARGETS) {
    const { data, error } = await supabase.from(t.table).select(["slug", ...t.single, ...t.arrays].join(","));
    if (error) {
      console.error(`${t.table}: ${error.message}`);
      continue;
    }
    for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
      const slug = String(row.slug);
      const patch: Record<string, unknown> = {};
      for (const col of t.single) {
        const v = row[col];
        if (typeof v !== "string" || !v) continue;
        const next = await compressOne(v);
        if (next !== v) patch[col] = next;
      }
      for (const col of t.arrays) {
        const arr = row[col];
        if (!Array.isArray(arr)) continue;
        const next: string[] = [];
        let dirty = false;
        for (const v of arr) {
          if (typeof v !== "string" || !v) {
            next.push(String(v ?? ""));
            continue;
          }
          const n = await compressOne(v);
          if (n !== v) dirty = true;
          next.push(n);
        }
        if (dirty) patch[col] = next;
      }
      if (Object.keys(patch).length === 0) continue;
      console.log(`${t.table}/${slug}: ${Object.keys(patch).join(", ")}`);
      if (APPLY) {
        const { error: upErr } = await supabase.from(t.table).update(patch).eq("slug", slug);
        if (upErr) console.error(`  DB update FAILED: ${upErr.message}`);
      }
    }
  }
  console.log(`\n${APPLY ? "Compressed" : "Would compress"} ${changed} file(s), saving ${(savedBytes / 1024 / 1024).toFixed(1)} MB.`);
  process.exit(0);
}

run();
