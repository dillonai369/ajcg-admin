import Link from "next/link";
import HasHeroFlag from "@/components/public/HasHeroFlag";
import HomeScripts from "@/components/public/HomeScripts";
import { getProperties, getPosts } from "@/lib/data";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Home — AJ Commercial Group",
  description:
    "Chicago multifamily real estate brokers specializing in apartment sales, 1031 exchanges, and investment property advisory across Cook, DuPage, and Will County. Talk to a real broker.",
};

/**
 * Homepage — pixel-port of /index.html.
 *
 * Dynamic sections that read from Supabase / JSON:
 *   • "Recently Sold" carousel — top 6 sold properties (preferring those flagged
 *     show_in_sold_carousel, else fall back to the most recent six).
 *   • "Insights" grid — latest 3 published posts (falls back to the three static
 *     index.html cards when no posts exist, so the section is never empty).
 *
 * Everything else (hero, stats, founders photos, services, why, culture, testimonials,
 * cta) is verbatim from index.html — the design must stay identical.
 */
export default async function HomePage() {
  const [properties, posts] = await Promise.all([getProperties(), getPosts()]);

  const sold = properties.filter((p) => (p.status || "").toLowerCase() === "sold");
  const carouselBase = sold.filter((p) => p.show_in_sold_carousel);
  const carousel = (carouselBase.length >= 6 ? carouselBase : sold).slice(0, 6);

  const publishedPosts = posts
    .filter((p) => (p.status || "").toLowerCase() === "published")
    .slice(0, 3);

  return (
    <>
      <HasHeroFlag />

      <section className="hero hero-clean">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/city/IMG_4595.JPG"
        >
          <source src="/assets/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-tint"></div>
        <div className="wrap hero-clean-inner">
          <h1>
            Maximum value for your multifamily property — <em>without the noise.</em>
          </h1>
          <p className="hero-sub">
            Trusted by owners. Backed by data. Specialized in multifamily across Chicago, the suburbs, and the broader
            Midwest.
          </p>
          <div className="hero-ctas">
            <Link href="/recently-sold" className="btn btn-outline btn-arrow">
              View Recently Sold
            </Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="wrap">
          <div className="stats-grid">
            <div>
              <div className="stat-num">
                $<span className="counter" data-target="156.2" data-decimals="1">0</span>
                <em>M+</em>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-label">In Transactions</div>
            </div>
            <div>
              <div className="stat-num">
                <span className="counter" data-target="1534">0</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-label">Units Sold</div>
            </div>
            <div>
              <div className="stat-num">
                <span className="counter" data-target="90">0</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-label">Closed Deals</div>
            </div>
            <div>
              <div className="stat-num">
                <span className="counter" data-target="4">0</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-label">Markets Served</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sold">
        <div className="wrap">
          <div className="sold-head">
            <div className="eyebrow-line center">
              <span className="eyebrow" style={{ margin: 0 }}>Track Record</span>
            </div>
            <h2>Recent transactions across the Midwest.</h2>
          </div>
          <div className="sold-grid">
            {carousel.map((p) => {
              const photo = p.hero_image || p.images?.[0] || "";
              const cityRaw = p.city || p.location || p.name || "";
              const cityShort = cityRaw.split(",")[0].split("·")[0].trim() || p.name;
              return (
                <Link
                  key={p.slug}
                  className="sold-card with-photo"
                  href={`/property/${p.slug}`}
                  style={{ ["--bg-photo" as never]: `url('${photo}')` }}
                >
                  <div className="sold-card-top">
                    <div className="sold-tag">{p.type || "Multifamily"}</div>
                    <div className="sold-status">Sold</div>
                  </div>
                  <div className="sold-card-body">
                    <div className="sold-units">{p.units ? `${p.units}-Unit` : "Multifamily"}</div>
                    <h3>{cityShort}</h3>
                    <div className="sold-meta">
                      Closed <span className="sold-meta-dot"></span> AJCG
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="sold-cta">
            <Link href="/recently-sold" className="btn btn-dark btn-arrow">
              View All Recent Sales
            </Link>
          </div>
        </div>
      </section>

      <section className="founders">
        <div className="wrap founders-grid">
          <div className="founders-text">
            <div className="eyebrow-line">
              <span className="eyebrow" style={{ margin: 0 }}>Meet The Founders</span>
            </div>
            <h2>Built by brokers who know the buildings — not just the spreadsheet.</h2>
            <p>
              Joey Batliner and Anthony Munoz founded AJ Commercial Group after meeting at one of Chicagoland&apos;s
              largest brokerages. They saw what owners were tired of: generic listings, boilerplate marketing, and
              brokers who treated multifamily like residential.
            </p>
            <p>
              So they built the firm they wished existed. Owner-first. Data-driven. Specialized in multifamily across
              the neighborhoods they actually live and work in. Every deal gets a real strategy — and personal
              attention from one of the partners.
            </p>
            <Link href="/our-team" className="btn-link">
              Meet the full team
            </Link>
          </div>
          <div className="founders-stack">
            <div
              className="founders-stack-photo tall"
              style={{ backgroundImage: "url('/assets/team/IMG_4605.jpg')", backgroundPosition: "center 35%" }}
            >
              <div className="founders-stack-tag">Joey &amp; Anthony · Chicago</div>
            </div>
            <div
              className="founders-stack-photo wide"
              style={{ backgroundImage: "url('/assets/team/IMG_4602.jpg')", backgroundPosition: "center 35%" }}
            >
              <div className="founders-stack-tag">Behind every deal</div>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="wrap">
          <div className="services-head">
            <div>
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>For Multifamily Owners</span>
              </div>
              <h2>What we do for sellers.</h2>
            </div>
            <p>
              We specialize in advising multifamily owners through every kind of disposition — quietly, strategically,
              and with maximum upside. Here&apos;s how we work.
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-num">01 / Off-Market Sales</div>
              <h3>Off-market sales.</h3>
              <p>
                Quietly connect with our network of vetted, qualified buyers — no public listing, no tenant disruption,
                no &quot;for sale&quot; signs. Often the cleanest path to a strong number.
              </p>
            </div>
            <div className="service-card">
              <div className="service-num">02 / Maximum Valuation</div>
              <h3>Real valuation, no guesswork.</h3>
              <p>
                A live comparative market analysis using current cap rates, recent comps, and active buyer demand — not
                a 30-second algorithm pulled from public data.
              </p>
            </div>
            <div className="service-card">
              <div className="service-num">03 / 1031 Exchange Strategy</div>
              <h3>1031 exchange strategy.</h3>
              <p>
                Preserve equity. Defer capital gains. We help you map the sequence — disposition, identification,
                replacement — before the clock starts running on day one.
              </p>
            </div>
            <div className="service-card">
              <div className="service-num">04 / Confidential Process</div>
              <h3>Confidential, every step.</h3>
              <p>
                Tenants don&apos;t know. Lenders don&apos;t know. Until you decide they should. Most of our deals close
                before they ever hit the open market.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <div className="eyebrow on-dark">Why AJ Commercial Group</div>
          <h2>Why owners choose AJ Commercial.</h2>
          <div className="why-grid">
            <div className="why-item">
              <h3>Local expertise.</h3>
              <p>We live and work in the markets we sell in. We know the block, the comps, and the buyers — because we&apos;re already there.</p>
            </div>
            <div className="why-item">
              <h3>Owner-first.</h3>
              <p>Every owner gets a dedicated broker from day one. Same point of contact, every step, every conversation — no hand-offs.</p>
            </div>
            <div className="why-item">
              <h3>Modern marketing.</h3>
              <p>Real photography. Targeted buyer lists. A process built for 2026 — not the old broker playbook from 2010.</p>
            </div>
            <div className="why-item">
              <h3>Trusted by owners.</h3>
              <p>We earn the next deal through the last one. Most of our business comes from repeat owners and referrals.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="insights">
        <div className="wrap">
          <div className="insights-head">
            <div>
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>Insights</span>
              </div>
              <h2>What multifamily owners are reading.</h2>
            </div>
            <Link href="/blog" className="btn-link">
              View all insights
            </Link>
          </div>
          <div className="blog-grid">
            {publishedPosts.length > 0 ? (
              publishedPosts.map((post, i) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-card" style={{ display: "block" }}>
                  <div
                    className={post.hero_image ? "blog-img" : `blog-img blog-img-${i + 1}`}
                    style={post.hero_image ? { backgroundImage: `url('${post.hero_image}')` } : undefined}
                  ></div>
                  <div className="blog-body">
                    <div className="blog-meta">{post.category}</div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <span className="blog-link">Read article</span>
                  </div>
                </Link>
              ))
            ) : (
              <>
                <article className="blog-card">
                  <div className="blog-img blog-img-1"></div>
                  <div className="blog-body">
                    <div className="blog-meta">Disposition Strategy</div>
                    <h3>Off-Market vs. On-Market: Which Strategy Delivers Higher Returns?</h3>
                    <p>In today&apos;s shifting multifamily landscape, many owners want to sell — but not go public. So is there really a difference between selling off-market vs on-market?</p>
                    <span className="blog-link">Read article</span>
                  </div>
                </article>
                <article className="blog-card">
                  <div className="blog-img blog-img-2"></div>
                  <div className="blog-body">
                    <div className="blog-meta">Market Watch</div>
                    <h3>What Falling Interest Rates Could Mean for Multifamily Owners.</h3>
                    <p>As conversations around potential rate cuts grow louder — what does a lower-rate environment really mean for owners thinking about selling now or holding through the cycle?</p>
                    <span className="blog-link">Read article</span>
                  </div>
                </article>
                <article className="blog-card">
                  <div className="blog-img blog-img-3"></div>
                  <div className="blog-body">
                    <div className="blog-meta">Tax Strategy</div>
                    <h3>Understanding 1031 Exchanges: Preserve Equity, Maximize Returns.</h3>
                    <p>For multifamily owners sitting on significant equity, a 1031 Exchange can be one of the most powerful tools to defer capital gains while continuing to build long-term wealth.</p>
                    <span className="blog-link">Read article</span>
                  </div>
                </article>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="culture">
        <div className="wrap">
          <div className="culture-head">
            <div className="eyebrow on-dark">Behind the Brand</div>
            <h2>A team that lives for this market.</h2>
            <p>We&apos;re not a remote brokerage clicking through deals from somewhere else. We work in Chicago, we close in Chicago, and we build relationships you can call about ten years from now.</p>
          </div>
          <div className="culture-grid">
            <div
              className="culture-grid-item tall"
              style={{ backgroundImage: "url('/assets/team/IMG_4604.jpg')", backgroundPosition: "center 30%" }}
            ></div>
            <div className="culture-grid-right">
              <div
                className="culture-grid-item"
                style={{ backgroundImage: "url('/assets/team/7616D97A-DE55-4DFC-BE98-E6C26467CAB2.PNG')", backgroundPosition: "center 35%" }}
              ></div>
              <div
                className="culture-grid-item"
                style={{ backgroundImage: "url('/assets/team/125ED794-C9F7-487A-927F-321E0CA06D9F.PNG')", backgroundPosition: "center 40%" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial">
        <div className="testimonial-inner">
          <div className="eyebrow">Owner Stories</div>
          <div className="testimonial-mark">&quot;</div>
          <div className="testimonial-slides">
            <div className="testimonial-slide is-active">
              <p className="testimonial-quote">
                Had a great experience working with AJ Commercial Group, specifically Anthony Munoz. Anthony was
                professional, responsive, and extremely knowledgeable. We successfully acquired and sold a property this
                year — his guidance, market insight, and attention to detail made both transactions smooth and
                efficient.
              </p>
              <div className="testimonial-attribution">
                <strong>Jose C.</strong> · Buyer / Seller
              </div>
            </div>
            <div className="testimonial-slide">
              <p className="testimonial-quote">
                Joey and the AJ Commercial team got us 8% over our expected number on a 12-unit deal. They didn&apos;t
                just list it — they ran a real strategic process. Owner-first the whole way through.
              </p>
              <div className="testimonial-attribution">
                <strong>Property Owner</strong> · 12-Unit Sale, Chicago
              </div>
            </div>
            <div className="testimonial-slide">
              <p className="testimonial-quote">
                Worked with Merry and the team on a multi-property disposition. Their knowledge of the Chicagoland
                multifamily market, response time, and follow-through were exactly what we needed. Will absolutely work
                with them again.
              </p>
              <div className="testimonial-attribution">
                <strong>Multifamily Investor</strong> · Repeat Client
              </div>
            </div>
            <div className="testimonial-slide">
              <p className="testimonial-quote">
                From valuation to close in under 90 days. AJ Commercial handled the entire transaction off-market with
                zero disruption to our tenants. Professional, transparent, and easy to work with.
              </p>
              <div className="testimonial-attribution">
                <strong>Apartment Owner</strong> · Off-Market Sale
              </div>
            </div>
          </div>
          <div className="testimonial-controls">
            <button className="testimonial-arrow prev" aria-label="Previous review">‹</button>
            <div className="testimonial-dots"></div>
            <button className="testimonial-arrow next" aria-label="Next review">›</button>
          </div>
        </div>
      </section>

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">Ready When You Are</div>
              <h2>Thinking about selling your multifamily property?</h2>
              <p>
                Get a no-obligation valuation in 48 hours. No tenants disturbed. No public listing. Just a real
                conversation about what your building is worth — and what the market will pay for it right now.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/selling" className="btn btn-primary btn-arrow" style={{ justifyContent: "center", padding: "18px 30px", fontSize: 15 }}>
                Get My Free Valuation
              </Link>
              <div>
                <div className="cta-phone-label">Or call directly</div>
                <a href="tel:6308957989" className="cta-phone">(630) 895-7989</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeScripts />
    </>
  );
}

