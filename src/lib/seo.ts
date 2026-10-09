import type { Metadata } from "next";

/**
 * Metadata for a static public page: title, description, canonical, and a
 * matching share card. Before this, only the root layout set Open Graph tags,
 * so every page link shared on LinkedIn or iMessage showed the homepage title
 * and the team photo regardless of which page it was.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = "/assets/og-image.jpg",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "AJ Commercial Group",
      locale: "en_US",
      title,
      description,
      url: path,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
