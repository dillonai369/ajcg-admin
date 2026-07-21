/**
 * Dynamic sitemap.xml
 *
 * The old static site shipped a hand-maintained sitemap.xml, but it was never
 * ported when the site moved to Next.js — https://www.ajcommercialgroup.com/sitemap.xml
 * was returning 404, meaning Google had no map of the site and had to discover
 * ~80 pages purely by following links. This rebuilds it from live Supabase data
 * so it can never go stale again.
 *
 * Only public, indexable content is listed: published posts, visible brokers,
 * and non-draft listings. Admin routes are excluded (see robots.ts).
 */
import type { MetadataRoute } from "next";
import { getProperties, getBrokers, getPosts } from "@/lib/data";

const BASE = "https://www.ajcommercialgroup.com";

// Re-generate at most once an hour rather than pinning to build time.
export const revalidate = 3600;

/** Listing statuses that are publicly visible (mirrors the Supabase RLS policy). */
const PUBLIC_PROPERTY_STATUSES = new Set([
  "sold",
  "for sale",
  "under contract",
  "coming soon",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/selling`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/buying`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/recently-sold`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/our-team`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/exchange-1031`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // A data outage must never 500 the sitemap — fall back to the static list.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [properties, brokers, posts] = await Promise.all([
      getProperties(),
      getBrokers(),
      getPosts(),
    ]);

    const propertyEntries: MetadataRoute.Sitemap = properties
      .filter((p) => p.slug && PUBLIC_PROPERTY_STATUSES.has((p.status || "").toLowerCase()))
      .map((p) => ({
        url: `${BASE}/property/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    const brokerEntries: MetadataRoute.Sitemap = brokers
      .filter((b) => b.slug && b.show_on_team_page !== false)
      .map((b) => ({
        url: `${BASE}/broker/${b.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));

    const postEntries: MetadataRoute.Sitemap = posts
      .filter((p) => p.slug && (p.status || "").toLowerCase() === "published")
      .map((p) => ({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));

    dynamicEntries = [...propertyEntries, ...brokerEntries, ...postEntries];
  } catch (err) {
    console.error("sitemap: failed to load dynamic entries", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
