import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

// metadataBase lets every page declare a relative canonical (alternates.canonical)
// and have Next resolve it to the full https://www.ajcommercialgroup.com/... URL.
// Without it, pages ship no canonical at all, which left Google guessing which
// URL was authoritative after the GHL → static → Next.js migrations.
const SITE_TITLE = "AJ Commercial Group — Chicagoland Multifamily Advisors";
const SITE_DESCRIPTION =
  "Chicago multifamily real estate brokers specializing in apartment sales, 1031 exchanges, and investment property advisory across Cook, DuPage, and Will County.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ajcommercialgroup.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // Google Search Console verification. This tag existed on the old static site
  // but was never ported to Next.js — losing it can invalidate ownership
  // verification, which blocks sitemap submission and re-index requests.
  verification: { google: "Uai2B5wW-Tn0bz0rZKDobw9Mw0n-VcYaFcqSyuP4VeA" },

  // Open Graph / Twitter cards were also lost in the migration, so shared links
  // (LinkedIn, Facebook, iMessage) rendered as bare URLs with no image or title.
  openGraph: {
    type: "website",
    siteName: "AJ Commercial Group",
    locale: "en_US",
    url: "https://www.ajcommercialgroup.com",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1500,
        height: 1000,
        alt: "AJ Commercial Group — Chicago multifamily team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/assets/og-image.jpg"],
  },
};

// Root layout is intentionally minimal — only html/body/font links.
// Each route group ((public) and (admin)) wires up its own real layout
// (with stylesheet, nav/sidebar, footer) so the admin and the public
// website can use completely different design systems.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap"
          />
          <link rel="icon" type="image/png" href="/assets/logo/aj-logo-black.png" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
