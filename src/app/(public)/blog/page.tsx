import Link from "next/link";
import { getPosts } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights — AJ Commercial Group",
  description:
    "Strategic notes on disposition, lending, 1031 exchanges, market trends, and tax planning — written for multifamily owners.",
  alternates: { canonical: "/blog" },
};

function normalizeImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
}

export default async function BlogIndexPage() {
  const posts = await getPosts();
  const published = posts.filter((p) => (p.status || "").toLowerCase() === "published");

  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            Insights <span>·</span> Multifamily Owner Resources
          </div>
          <h1>
            What multifamily owners <em>are reading.</em>
          </h1>
          <p>
            Strategic notes on disposition, lending, 1031 exchanges, market trends, and tax planning — written for
            owners who actually want to understand the moves before making them.
          </p>
        </div>
      </section>

      <section className="blog-section">
        <div className="wrap">
          <div className="blog-grid">
            {published.map((p, i) => {
              const hero = normalizeImg(p.hero_image);
              // Fall back to the blog-img-N decorative backgrounds from styles.css
              // when a post has no hero image yet. Cycle 1..6.
              const fallbackClass = `blog-img-${(i % 6) + 1}`;
              return (
                <Link href={`/blog/${p.slug}`} key={p.slug} className="blog-card" style={{ display: "block" }}>
                  <div
                    className={hero ? "blog-img" : `blog-img ${fallbackClass}`}
                    style={hero ? { backgroundImage: `url('${hero}')` } : undefined}
                  ></div>
                  <div className="blog-body">
                    <div className="blog-meta">{p.category}</div>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <span className="blog-link">Read article</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">Don&apos;t Just Read About It</div>
              <h2>Have a question about your specific situation?</h2>
              <p>
                Articles are great. Real conversations are better. Tell us what you&apos;re thinking — selling,
                exchanging, repositioning — and we&apos;ll give you a candid take.
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
