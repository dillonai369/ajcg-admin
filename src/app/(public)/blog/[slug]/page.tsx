import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article — AJ Commercial Group" };
  return {
    title: post.meta_title || `${post.title} — AJ Commercial Group`,
    description: post.meta_description || post.excerpt,
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
  const post = await getPost(slug);
  if (!post) notFound();

  const hero = normalizeImg(post.hero_image);

  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            <Link href="/blog" style={{ color: "var(--gold)" }}>
              ‹ Back to Insights
            </Link>
            <span> · {post.category}</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
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
            {/* TODO(next session): render post.blocks through a BlockRenderer. */}
            <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
              Full article rendering coming soon — this post is being migrated from our previous CMS.
            </p>
            {post.excerpt ? <p style={{ marginTop: 24 }}>{post.excerpt}</p> : null}
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
