/**
 * Lightweight input validation + field whitelisting for the write APIs.
 *
 * The admin routes run on the Supabase service-role key (RLS bypassed), so any
 * field a caller sends would otherwise be written straight to the row
 * (mass-assignment). These allow-lists pin down exactly which columns each
 * entity accepts, dropping anything else. No external dependency — just plain
 * object picking so the surface stays obvious and auditable.
 */

/** Return a new object containing only the allowed keys that are present. */
function pick<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  allowed: readonly string[],
): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body && body[key] !== undefined) out[key] = body[key];
  }
  return out as Partial<T>;
}

// Column names below mirror supabase/schema.sql exactly. `id`, `created_at`
// and `updated_at` are intentionally excluded — they're managed by the DB.
export const PROPERTY_FIELDS = [
  "slug",
  "page_slug",
  "name",
  "location",
  "address",
  "city",
  "state",
  "zip",
  "neighborhood",
  "submarket",
  "units",
  "type",
  "status",
  "facts",
  "description",
  "body",
  "hero_image",
  "images",
  "total_sqft",
  "lot_size",
  "year_built",
  "year_renovated",
  "stories",
  "building_class",
  "parking",
  "heating",
  "sale_price",
  "sale_date",
  "cap_rate",
  "noi",
  "gross_income",
  "hide_sale_price",
  "highlights",
  "broker_slugs",
  "feature_on_homepage",
  "show_in_sold_carousel",
  "canonical_url",
  "meta_title",
  "meta_description",
] as const;

export const BROKER_FIELDS = [
  "slug",
  "page_slug",
  "name",
  "title",
  "email",
  "phone",
  "phone_raw",
  "photo_url",
  "card_photo_url",
  "bio",
  "is_partner",
  "display_order",
  "tagline",
  "license_number",
  "linkedin_url",
  "crexi_url",
  "specialties",
  "years_in_cre",
  "joined_date",
  "education",
  "certifications",
  "languages",
  "total_closed",
  "units_sold",
  "deals_closed",
  "avg_days_on_market",
  "show_on_team_page",
  "feature_on_homepage",
  "hide_phone",
  "track_record",
  "canonical_url",
  "meta_description",
] as const;

export const POST_FIELDS = [
  "slug",
  "title",
  "excerpt",
  "category",
  "tags",
  "status",
  "hero_image",
  "hero_alt",
  "hero_image_class",
  "hero_image_index",
  "blocks",
  "author",
  "author_slug",
  "date",
  "published_at",
  "views",
  "meta_title",
  "meta_description",
] as const;

/**
 * Image fields must be URLs, never inline base64 blobs. One listing saved with
 * a "data:image/..." hero made every list query on the site return 8.5 MB
 * (found 2026-10-16) — that single row was the whole "slow homepage". Inline
 * images are dropped here; the editors upload through /api/upload instead.
 */
const IMAGE_FIELDS = new Set(["hero_image", "images", "photo_url", "card_photo_url"]);
const MAX_URL_LENGTH = 2048;

function stripInlineImages<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = { ...obj };
  for (const key of IMAGE_FIELDS) {
    if (!(key in out)) continue;
    const v = out[key];
    const bad = (s: unknown) => typeof s === "string" && (s.startsWith("data:") || s.length > MAX_URL_LENGTH);
    if (Array.isArray(v)) out[key] = v.filter((s) => !bad(s));
    else if (bad(v)) delete out[key];
  }
  return out as T;
}

export function cleanPropertyInput(body: Record<string, unknown>) {
  return stripInlineImages(pick(body, PROPERTY_FIELDS));
}
export function cleanBrokerInput(body: Record<string, unknown>) {
  return stripInlineImages(pick(body, BROKER_FIELDS));
}
export function cleanPostInput(body: Record<string, unknown>) {
  return stripInlineImages(pick(body, POST_FIELDS));
}

/** Parse a JSON request body defensively; returns null on failure. */
export async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
