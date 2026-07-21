/**
 * Public-visibility rules for content served on the marketing site.
 *
 * The public detail pages read through the Supabase service-role key, which
 * bypasses row-level security. These helpers re-apply, in the app layer, the
 * exact same rules the DB's public-read RLS policies enforce (see
 * supabase/schema.sql) so that draft / hidden / unpublished records are never
 * exposed at /property/[slug], /broker/[slug], or /blog/[slug].
 *
 * Keep this in lockstep with the RLS policies in schema.sql.
 */
import type { Broker, Property, Post } from "./types";

/** Property statuses that are visible to the public (mirrors RLS). */
export const PUBLIC_PROPERTY_STATUSES = new Set([
  "sold",
  "for sale",
  "under contract",
  "coming soon",
]);

export function isPubliclyVisibleProperty(p: Pick<Property, "status">): boolean {
  return PUBLIC_PROPERTY_STATUSES.has((p.status || "").toLowerCase());
}

export function isPubliclyVisibleBroker(b: Pick<Broker, "show_on_team_page">): boolean {
  // Column defaults to true; only an explicit false hides the broker.
  return b.show_on_team_page !== false;
}

export function isPubliclyVisiblePost(p: Pick<Post, "status">): boolean {
  return (p.status || "").toLowerCase() === "published";
}
