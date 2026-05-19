import "../styles.css";
import SiteNav from "@/components/public/SiteNav";
import SiteFooter from "@/components/public/SiteFooter";
import Script from "next/script";

/**
 * Public-website layout. Imports the static-site stylesheet exactly as-is
 * so every page in the (public) route group renders pixel-identical to the
 * original index.html / our-team.html / etc.
 *
 * SiteNav is rendered here (with `hasHero` controlled per-page via the
 * `has-hero` body class). The footer is identical on every page.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
      <Script src="/assets/scroll-reveal.js" strategy="afterInteractive" />
    </>
  );
}
