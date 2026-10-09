/**
 * One-off: add Argie Tamoni (Transaction Coordinator) to the public team.
 * Requested by Mary (AJCG) on 2026-10-09.
 *
 * Run locally:  npx tsx supabase/add-argie.ts
 *
 * Idempotent — upserts on slug, so running it twice just refreshes the row.
 * No photo yet: the team card shows her initials until one is uploaded in the
 * admin (Brokers → Argie Tamoni → photo). Bio is a short role placeholder the
 * team can rewrite in the admin.
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

const ARGIE = {
  slug: "argie-tamoni",
  name: "Argie Tamoni",
  title: "Transaction Coordinator",
  email: "contact@ajcommercialgroup.com",
  phone: "",
  phone_raw: "",
  hide_phone: true,
  is_partner: false,
  show_on_team_page: true,
  feature_on_homepage: false,
  bio:
    "Argie is a Transaction Coordinator at AJ Commercial Group, keeping every deal moving from signed contract to closing table — documents, deadlines, lenders, attorneys and title all on schedule so the brokers can stay focused on the market.",
  meta_description:
    "Argie Tamoni, Transaction Coordinator at AJ Commercial Group — keeping Chicagoland multifamily deals on track from contract to close.",
  specialties: ["Transaction coordination", "Closing management"],
  track_record: [],
};

async function run() {
  // Put her at the end of the current team order.
  const { data: maxRow, error: e0 } = await supabase
    .from("brokers")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (e0) {
    console.error("Could not read current display order:", e0.message);
    process.exit(1);
  }
  const display_order = ((maxRow?.display_order as number | null) ?? 0) + 1;

  const { data, error } = await supabase
    .from("brokers")
    .upsert({ ...ARGIE, display_order }, { onConflict: "slug" })
    .select("slug, name, title, display_order, show_on_team_page");
  if (error) {
    console.error("Failed to add Argie:", error.message);
    process.exit(1);
  }
  console.log("Saved:", data?.[0]);
  console.log("\nLive at: https://www.ajcommercialgroup.com/our-team and /broker/argie-tamoni (within ~60s — the public pages cache for a minute).");
  console.log("Add her photo in the admin: app.ajcommercialgroup.com/admin/brokers/argie-tamoni");
  process.exit(0);
}

run();
