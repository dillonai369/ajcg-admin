import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, getBrokers } from "@/lib/data";
import type { Metadata } from "next";
import { isPubliclyVisiblePost } from "@/lib/visibility";
import BlockRenderer from "@/components/public/BlockRenderer";

const BASE = "https://www.ajcommercialgroup.com";

function fmtDate(d?: string): string | null {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !isPubliclyVisiblePost(post)) {
    return { title: "Article — AJ Commercial Group", robots: { index: false, follow: false } };
  }
  return {
    title: post.meta_title || `${post.title} — AJ Commercial Group`,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

function normalizeImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
}

/**
 * Single blog post. For this initial migration we render the title, category,
 * hero image, and excerpt — full block rendering will arrive next session
 * when we wire the BlockEditor's output through to the public site.
 */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, brokers] = await Promise.all([getPost(slug), getBrokers()]);
  // 404 unpublished/scheduled posts — service-role reads bypass RLS.
  if (!post || !isPubliclyVisiblePost(post)) notFound();

  const hero = normalizeImg(post.hero_image);
  const authorName = post.author?.trim();
  const authorBroker = authorName
    ? brokers.find((b) => (b.name || "").toLowerCase() === authorName.toLowerCase())
    : undefined;
  const published = post.published_at || post.date;
  const publishedLabel = fmtDate(published);
  const hasBlocks = Array.isArray(post.blocks) && post.blocks.length > 0;

  // Article + Breadcrumb structured data (helps Google understand the post,
  // its author, and its place in the site — real rich-result types, unlike FAQ).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${BASE}/blog/${slug}#article`,
        headline: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        image: hero ? (hero.startsWith("http") ? hero : `${BASE}${hero}`) : undefined,
        datePublished: published || undefined,
        dateModified: published || undefined,
        author: authorName
          ? { "@type": "Person", name: authorName, url: authorBroker ? `${BASE}/broker/${authorBroker.slug}` : undefined }
          : { "@type": "Organization", name: "AJ Commercial Group" },
        publisher: { "@id": `${BASE}/#organization` },
        mainEntityOfPage: `${BASE}/blog/${slug}`,
        articleSection: post.category,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
          { "@type": "ListItem", position: 2, name: "Insights", item: `${BASE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${BASE}/blog/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            <Link href="/blog" style={{ color: "var(--gold)" }}>
              ‹ Back to Insights
            </Link>
            <span> · {post.category}</span>
          </div>
          <h1>{post.title}</h1>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          {(authorName || publishedLabel) && (
            <p style={{ marginTop: 14, fontSize: 14, opacity: 0.75 }}>
              {authorName ? (
                <>
                  By{" "}
                  {authorBroker ? (
                    <Link href={`/broker/${authorBroker.slug}`} style={{ color: "var(--gold)" }}>
                      {authorName}
                    </Link>
                  ) : (
                    <span>{authorName}</span>
                  )}
                </>
              ) : null}
              {authorName && publishedLabel ? " · " : null}
              {publishedLabel ? <span>Updated {publishedLabel}</span> : null}
            </p>
          )}
        </div>
      </section>

      {hero && (
        <section className="content-section">
          <div className="wrap">
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 7",
                backgroundImage: `url('${hero}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "var(--radius)",
              }}
            />
          </div>
        </section>
      )}

      <section className="content-section">
        <div className="wrap">
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {hasBlocks ? (
              <BlockRenderer blocks={post.blocks} />
            ) : post.excerpt ? (
              <p style={{ lineHeight: 1.75 }}>{post.excerpt}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">Want to Discuss?</div>
              <h2>Have a question about your specific situation?</h2>
              <p>
                Articles are great. Real conversations are better. Tell us what you&apos;re thinking — and we&apos;ll
                give you a candid take.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/contact" className="btn btn-primary btn-arrow" style={{ justifyContent: "center", padding: "18px 30px" }}>
                Contact Our Team
              </Link>
              <div>
                <div className="cta-phone-label">Or call directly</div>
                <a href="tel:6308957989" className="cta-phone">(630) 895-7989</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
