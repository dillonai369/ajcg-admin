import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AJ Commercial Group",
  description:
    "Chicago multifamily real estate brokers specializing in apartment sales, 1031 exchanges, and investment property advisory across Cook, DuPage, and Will County.",
};

// Root layout is intentionally minimal — only html/body/font links.
// Each route group ((public) and (admin)) wires up its own real layout
// (with stylesheet, nav/sidebar, footer) so the admin and the public
// website can use completely different design systems.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
