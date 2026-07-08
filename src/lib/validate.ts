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

export function cleanPropertyInput(body: Record<string, unknown>) {
  return pick(body, PROPERTY_FIELDS);
}
export function cleanBrokerInput(body: Record<string, unknown>) {
  return pick(body, BROKER_FIELDS);
}
export function cleanPostInput(body: Record<string, unknown>) {
  return pick(body, POST_FIELDS);
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
