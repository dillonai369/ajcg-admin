/**
 * One-off: remove Katie Nunez from the public team page.
 *
 * Run locally:  npx tsx supabase/hide-katie.ts
 *
 * Sets show_on_team_page = false (reversible — she stays in the admin, just
 * hidden from the public /our-team page and her /broker/katie-nunez page 404s),
 * and removes her slug from any listing's broker_slugs so no property card is
 * left pointing at a hidden broker.
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

const SLUG = "katie-nunez";

async function run() {
  // 1) Hide from the team page.
  const { data: hidden, error: e1 } = await supabase
    .from("brokers")
    .update({ show_on_team_page: false })
    .eq("slug", SLUG)
    .select("slug, name");
  if (e1) {
    console.error("Failed to hide broker:", e1.message);
    process.exit(1);
  }
  if (!hidden || hidden.length === 0) {
    console.log(`No broker found with slug "${SLUG}" — nothing to hide (already removed?).`);
  } else {
    console.log(`Hidden from team page: ${hidden.map((b) => b.name || b.slug).join(", ")}`);
  }

  // 2) Remove her from any listing's broker_slugs (avoid dangling links).
  const { data: props, error: e2 } = await supabase
    .from("properties")
    .select("slug, broker_slugs")
    .contains("broker_slugs", [SLUG]);
  if (e2) {
    console.error("Could not scan properties (skipping cleanup):", e2.message);
  } else if (props && props.length) {
    for (const p of props) {
      const next = (p.broker_slugs || []).filter((s: string) => s !== SLUG);
      const { error: e3 } = await supabase
        .from("properties")
        .update({ broker_slugs: next })
        .eq("slug", p.slug);
      if (e3) console.error(`  failed to update ${p.slug}:`, e3.message);
      else console.log(`  removed ${SLUG} from listing: ${p.slug}`);
    }
  } else {
    console.log("No listings reference her as a co-broker — nothing to clean up.");
  }

  console.log("\nDone.");
  process.exit(0);
}

run();
