/**
 * Apply the house SEO template to every listing that doesn't already follow it.
 *
 *   Title:        [x]-Unit Multifamily Sold in [Town, ST] | AJ Commercial Group
 *   Description:  [x]-unit multifamily property sold in [Town, ST] by AJ Commercial
 *                 Group. Specializing in multifamily investment property sales
 *                 throughout [market] - [County] County, [State].
 *
 * Rules:
 *   - A title or description the team already wrote in the template format is
 *     left exactly as-is (so Mary's hand-done listings are untouched).
 *   - Everything else (blank, or the old generic text) is replaced.
 *   - Listings whose town can't be worked out are reported, not guessed —
 *     set the City field in the admin and re-run.
 *
 * Run locally:
 *   npx tsx supabase/apply-listing-seo.ts            # dry run — prints what would change
 *   npx tsx supabase/apply-listing-seo.ts --apply    # writes to the database
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { createClient } from "@supabase/supabase-js";
import type { Property } from "../src/lib/types";
import {
  buildListingMetaTitle,
  buildListingMetaDescription,
  looksTemplated,
  parseListingPlace,
} from "../src/lib/listing-seo";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });
const APPLY = process.argv.includes("--apply");

const TITLE_TEMPLATE_RE = /^\d+-Unit .+ (?:Sold|For Sale) in .+ \| AJ Commercial Group$/;

async function run() {
  console.log(APPLY ? "APPLY mode — writing changes.\n" : "DRY RUN — nothing will change. Add --apply to execute.\n");

  const { data, error } = await supabase.from("properties").select("*").order("name");
  if (error) {
    console.error("Could not read properties:", error.message);
    process.exit(1);
  }
  const rows = (data ?? []) as Property[];

  let changed = 0;
  let kept = 0;
  const noPlace: string[] = [];

  for (const p of rows) {
    const place = parseListingPlace(p);
    if (!place) noPlace.push(p.slug);

    const title = (p.meta_title || "").trim();
    const desc = (p.meta_description || "").trim();
    const patch: Partial<Property> = {};
    if (!TITLE_TEMPLATE_RE.test(title)) patch.meta_title = buildListingMetaTitle(p);
    if (!looksTemplated(desc)) patch.meta_description = buildListingMetaDescription(p);

    if (Object.keys(patch).length === 0) {
      kept++;
      continue;
    }
    changed++;
    console.log(`${p.slug}`);
    if (patch.meta_title) console.log(`  title: "${title || "(blank)"}"\n      -> "${patch.meta_title}"`);
    if (patch.meta_description) console.log(`  desc:  "${desc.slice(0, 70) || "(blank)"}${desc.length > 70 ? "…" : ""}"\n      -> "${patch.meta_description}"`);

    if (APPLY) {
      const { error: upErr } = await supabase.from("properties").update(patch).eq("slug", p.slug);
      if (upErr) console.error(`  FAILED: ${upErr.message}`);
    }
  }

  console.log(`\n${APPLY ? "Updated" : "Would update"} ${changed} listing(s); ${kept} already in template format and left alone.`);
  if (noPlace.length) {
    console.log(`\n${noPlace.length} listing(s) have no recognizable "Town, ST" — their title/description omit the town until the City field is set in the admin:`);
    for (const s of noPlace) console.log(`  - ${s}`);
  }
  process.exit(0);
}

run();
