/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // Long-term cache for static assets in /public/assets — same as the old
  // vercel.json header rule. Other security headers (X-Frame-Options etc)
  // are also re-applied here so we keep the production behavior identical.
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Permanent redirects ported from the previous deploy's vercel.json so all
  // existing inbound links / search results / printed materials still land on
  // the right page. The admin's own routes live under /admin/* and don't
  // conflict with these public-side aliases.
  async redirects() {
    return [
      // Homepage aliases
      { source: "/home", destination: "/", permanent: true },
      { source: "/home-page", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },

      // Team
      { source: "/about", destination: "/our-team", permanent: true },
      { source: "/about-us", destination: "/our-team", permanent: true },
      { source: "/team", destination: "/our-team", permanent: true },
      { source: "/agents", destination: "/our-team", permanent: true },
      { source: "/our-agents", destination: "/our-team", permanent: true },
      { source: "/real-estate-agents", destination: "/our-team", permanent: true },
      { source: "/real-estate-experts", destination: "/our-team", permanent: true },
      { source: "/brokers", destination: "/our-team", permanent: true },

      // Contact
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/get-in-touch", destination: "/contact", permanent: true },

      // Selling / valuation
      { source: "/sell", destination: "/selling", permanent: true },
      { source: "/sell-multifamily", destination: "/selling", permanent: true },
      { source: "/valuation", destination: "/selling", permanent: true },
      { source: "/property-valuation", destination: "/selling", permanent: true },
      { source: "/free-valuation", destination: "/selling", permanent: true },
      { source: "/multifamily-valuation", destination: "/selling", permanent: true },

      // Buying
      { source: "/buy", destination: "/buying", permanent: true },
      { source: "/buy-multifamily", destination: "/buying", permanent: true },
      { source: "/acquisitions", destination: "/buying", permanent: true },

      // 1031
      { source: "/1031", destination: "/exchange-1031", permanent: true },
      { source: "/1031-exchange", destination: "/exchange-1031", permanent: true },
      { source: "/exchange", destination: "/exchange-1031", permanent: true },
      { source: "/tax-deferred-exchange", destination: "/exchange-1031", permanent: true },

      // Careers
      { source: "/jobs", destination: "/careers", permanent: true },
      { source: "/real-estate-careers", destination: "/careers", permanent: true },
      { source: "/join-us", destination: "/careers", permanent: true },

      // Blog
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/insights", destination: "/blog", permanent: true },
      { source: "/articles", destination: "/blog", permanent: true },

      // Recently sold
      { source: "/properties", destination: "/recently-sold", permanent: true },
      { source: "/listings", destination: "/recently-sold", permanent: true },
      { source: "/sold", destination: "/recently-sold", permanent: true },
      { source: "/closed-deals", destination: "/recently-sold", permanent: true },
      { source: "/track-record", destination: "/recently-sold", permanent: true },

      // Legacy .html paths from the original static site so old bookmarks /
      // shared links keep working (cleanUrls used to handle these on Vercel).
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/our-team.html", destination: "/our-team", permanent: true },
      { source: "/recently-sold.html", destination: "/recently-sold", permanent: true },
      { source: "/blog.html", destination: "/blog", permanent: true },
      { source: "/buying.html", destination: "/buying", permanent: true },
      { source: "/selling.html", destination: "/selling", permanent: true },
      { source: "/exchange-1031.html", destination: "/exchange-1031", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/careers.html", destination: "/careers", permanent: true },
      // Legacy property-*.html and broker-*.html slugs map onto the new
      // dynamic /property/[slug] and /broker/[slug] routes.
      { source: "/property-:slug.html", destination: "/property/:slug", permanent: true },
      { source: "/property-:slug", destination: "/property/:slug", permanent: true },
      { source: "/broker-:slug.html", destination: "/broker/:slug", permanent: true },
      { source: "/broker-:slug", destination: "/broker/:slug", permanent: true },
    ];
  },
};

module.exports = nextConfig;
