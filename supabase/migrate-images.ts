/**
 * Move listing/broker/post images that live on a third-party CDN into
 * Supabase Storage, and point the database at the new copies.
 *
 * Why: an audit on 2026-09-09 found 53 of 76 public listings loading their
 * photos from lirp.cdn-website.com — the CDN of the website builder the old
 * site was built on. AJCG doesn't control that account; if it lapses, 70% of
 * the listings go blank with no warning. After this runs, every image the site
 * shows is in storage we own.
 *
 * Run locally (needs .env.local with the service-role key):
 *   npx tsx supabase/migrate-images.ts            # dry run — reports, changes nothing
 *   npx tsx supabase/migrate-images.ts --apply    # downloads, uploads, updates rows
 *
 * Safe to re-run: images already on Supabase are skipped. Each row is updated
 * only after every one of its images uploaded successfully, and the original
 * URL is kept in a `migrated_from` note in the console output.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });
const APPLY = process.argv.includes("--apply");

type Target = {
  table: "properties" | "brokers" | "posts";
  bucket: "property-photos" | "broker-photos" | "blog-images";
  /** Columns holding a single image URL. */
  single: string[];
  /** Columns holding an array of image URLs. */
  arrays: string[];
};

const TARGETS: Target[] = [
  { table: "properties", bucket: "property-photos", single: ["hero_image"], arrays: ["images"] },
  { table: "brokers", bucket: "broker-photos", single: ["photo_url", "card_photo_url"], arrays: [] },
  { table: "posts", bucket: "blog-images", single: ["hero_image"], arrays: [] },
];

function needsMigration(u: unknown): u is string {
  if (typeof u !== "string" || !u) return false;
  if (!/^https?:\/\//i.test(u)) return false; // local /assets/... stays as-is
  if (/\.supabase\.(co|in)\//i.test(u)) return false; // already ours
  return true;
}

function extFromContentType(ct: string | null, fallbackUrl: string): string {
  if (ct?.includes("jpeg")) return "jpg";
  if (ct?.includes("png")) return "png";
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("gif")) return "gif";
  const m = fallbackUrl.match(/\.(jpe?g|png|webp|gif)(?:[?#]|$)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

const cache = new Map<string, string>(); // source URL → new public URL (dedupes shared images)

async function migrateOne(src: string, bucket: string, slug: string, label: string): Promise<string> {
  const hit = cache.get(src);
  if (hit) return hit;

  const res = await fetch(src, { redirect: "follow" });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const ct = res.headers.get("content-type");
  if (!ct || !ct.startsWith("image/")) throw new Error(`not an image (${ct})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) throw new Error(`suspiciously small (${buf.length} bytes)`);

  const ext = extFromContentType(ct, src);
  const base = src.split("/").pop()?.split(/[?#]/)[0]?.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60) || label;
  const keyName = `migrated/${slug}/${label}-${base}.${ext}`;

  if (!APPLY) {
    const fake = `${url}/storage/v1/object/public/${bucket}/${keyName}`;
    cache.set(src, fake);
    return fake;
  }

  const { error } = await supabase.storage.from(bucket).upload(keyName, buf, { contentType: ct, upsert: true });
  if (error) throw new Error(`upload: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(keyName);
  cache.set(src, data.publicUrl);
  return data.publicUrl;
}

async function run() {
  console.log(APPLY ? "APPLY mode — writing to storage and database.\n" : "DRY RUN — nothing will change. Add --apply to execute.\n");
  let rowsTouched = 0;
  let imagesMoved = 0;
  let failures = 0;

  for (const t of TARGETS) {
    const cols = ["slug", ...t.single, ...t.arrays].join(", ");
    const { data: rows, error } = await supabase.from(t.table).select(cols);
    if (error) {
      console.error(`Could not read ${t.table}: ${error.message}`);
      continue;
    }

    for (const row of (rows ?? []) as unknown as Array<Record<string, unknown>>) {
      const slug = String(row.slug);
      const patch: Record<string, unknown> = {};
      let rowFailed = false;

      for (const col of t.single) {
        const v = row[col];
        if (!needsMigration(v)) continue;
        try {
          patch[col] = await migrateOne(v, t.bucket, slug, col);
          imagesMoved++;
          // Full before → after pair, so this log is the rollback record.
          console.log(`  ${t.table}/${slug}.${col}:\n    from ${v}\n    to   ${patch[col]}`);
        } catch (e) {
          rowFailed = true;
          failures++;
          console.error(`  ${t.table}/${slug}.${col}: FAILED — ${(e as Error).message}`);
        }
      }

      for (const col of t.arrays) {
        const arr = row[col];
        if (!Array.isArray(arr) || !arr.some(needsMigration)) continue;
        const next: string[] = [];
        for (let i = 0; i < arr.length; i++) {
          const v = arr[i];
          if (!needsMigration(v)) {
            next.push(String(v));
            continue;
          }
          try {
            const moved = await migrateOne(v, t.bucket, slug, `${col}-${i + 1}`);
            next.push(moved);
            imagesMoved++;
            console.log(`  ${t.table}/${slug}.${col}[${i}]:\n    from ${v}\n    to   ${moved}`);
          } catch (e) {
            rowFailed = true;
            failures++;
            console.error(`  ${t.table}/${slug}.${col}[${i}]: FAILED — ${(e as Error).message}`);
            next.push(String(v)); // keep the original so nothing goes blank
          }
        }
        patch[col] = next;
      }

      if (Object.keys(patch).length === 0) continue;
      if (rowFailed) {
        console.error(`  ${t.table}/${slug}: skipped DB update — one or more images failed; row unchanged.`);
        continue;
      }
      rowsTouched++;
      if (APPLY) {
        const { error: upErr } = await supabase.from(t.table).update(patch).eq("slug", slug);
        if (upErr) {
          failures++;
          console.error(`  ${t.table}/${slug}: DB update FAILED — ${upErr.message}`);
        }
      }
    }
  }

  console.log(`\n${APPLY ? "Done" : "Dry run complete"}: ${imagesMoved} image(s) across ${rowsTouched} row(s); ${failures} failure(s).`);
  if (!APPLY) console.log("Re-run with --apply to perform the migration.");
  process.exit(failures ? 1 : 0);
}

run();
