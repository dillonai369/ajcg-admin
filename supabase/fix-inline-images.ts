/**
 * Move inline base64 ("data:image/...") images out of the database and into
 * Supabase Storage, replacing them with normal URLs.
 *
 * Why: on 2026-10-16 a timing probe showed the listings list query returning
 * 8.5 MB for 81 rows — one row carried an image pasted as a data URL. Every
 * page that lists properties (homepage, /recently-sold, broker pages, admin)
 * was downloading that blob on every request, which is where the ~1.3 s
 * server response time came from.
 *
 * Run locally:
 *   npx tsx supabase/fix-inline-images.ts            # dry run — reports
 *   npx tsx supabase/fix-inline-images.ts --apply    # uploads + rewrites rows
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

const TARGETS: Array<{ table: string; bucket: string; single: string[]; arrays: string[] }> = [
  { table: "properties", bucket: "property-photos", single: ["hero_image"], arrays: ["images"] },
  { table: "brokers", bucket: "broker-photos", single: ["photo_url", "card_photo_url"], arrays: [] },
  { table: "posts", bucket: "blog-images", single: ["hero_image"], arrays: [] },
];

const isDataUrl = (v: unknown): v is string => typeof v === "string" && v.startsWith("data:");

async function upload(dataUrl: string, bucket: string, slug: string, label: string): Promise<string> {
  const m = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!m) throw new Error("not a base64 image data URL");
  const mime = m[1].toLowerCase();
  const ext = mime.includes("jpeg") ? "jpg" : mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "bin";
  const buf = Buffer.from(m[2], "base64");
  const keyName = `migrated/${slug}/${label}-${Date.now()}.${ext}`;
  if (!APPLY) return `${url}/storage/v1/object/public/${bucket}/${keyName}`;
  const { error } = await supabase.storage.from(bucket).upload(keyName, buf, { contentType: mime, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(keyName).data.publicUrl;
}

async function run() {
  console.log(APPLY ? "APPLY mode.\n" : "DRY RUN — add --apply to execute.\n");
  let fixed = 0;
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
        if (!isDataUrl(v)) continue;
        console.log(`${t.table}/${slug}.${col}: inline image, ${(v.length / 1024).toFixed(0)} KB`);
        try {
          patch[col] = await upload(v, t.bucket, slug, col);
        } catch (e) {
          console.error(`  FAILED: ${(e as Error).message}`);
        }
      }
      for (const col of t.arrays) {
        const arr = row[col];
        if (!Array.isArray(arr) || !arr.some(isDataUrl)) continue;
        const next: string[] = [];
        for (let i = 0; i < arr.length; i++) {
          const v = arr[i];
          if (!isDataUrl(v)) {
            next.push(String(v));
            continue;
          }
          console.log(`${t.table}/${slug}.${col}[${i}]: inline image, ${(v.length / 1024).toFixed(0)} KB`);
          try {
            next.push(await upload(v, t.bucket, slug, `${col}-${i + 1}`));
          } catch (e) {
            console.error(`  FAILED: ${(e as Error).message}`);
            next.push(v);
          }
        }
        patch[col] = next;
      }
      if (Object.keys(patch).length === 0) continue;
      fixed++;
      if (APPLY) {
        const { error: upErr } = await supabase.from(t.table).update(patch).eq("slug", slug);
        if (upErr) console.error(`  DB update FAILED: ${upErr.message}`);
        else console.log(`  ${slug}: rewritten to storage URLs`);
      }
    }
  }
  console.log(`\n${APPLY ? "Fixed" : "Would fix"} ${fixed} row(s).`);
  process.exit(0);
}

run();
