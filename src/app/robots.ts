/**
 * robots.txt
 *
 * Was returning 404 on the live site — the old static site's robots.txt was
 * never ported to Next.js. Crawlers default to "allow" without it, but this
 * restores the explicit rules and, importantly, points crawlers at the sitemap.
 *
 * Admin and API routes are disallowed so they don't get crawled or indexed
 * (they're also auth-gated server-side; this just keeps them out of results).
 */
import type { MetadataRoute } from "next";

const BASE = "https://www.ajcommercialgroup.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/sign-in", "/pending-approval"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
