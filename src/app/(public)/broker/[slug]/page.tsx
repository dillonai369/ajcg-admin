import Link from "next/link";
import { notFound } from "next/navigation";
import { getBroker, getBrokers, getProperties } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const broker = await getBroker(slug);
  if (!broker) return { title: "Broker — AJ Commercial Group" };
  return {
    title: `${broker.name} — AJ Commercial Group`,
    description: broker.meta_description || broker.bio?.slice(0, 160) || `${broker.name} — ${broker.title}`,
    alternates: { canonical: `/broker/${slug}` },
  };
}

function normalizeImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
}

function telHref(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D+/g, "");
  return digits ? `tel:${digits}` : undefined;
}

/**
 * Single broker page. Port of any broker-*.html (template: broker-joey-batliner.html).
 *
 * Layout:
 *  • Dark broker-hero with photo + name + click-to-call/email block.
 *  • "About" bio (paragraph splits the broker.bio on blank lines).
 *  • "Recent transactions closed by X" — derived from every property whose
 *    broker_slugs array contains this broker. Single source of truth: assign
 *    a broker to a listing and that listing automatically appears here.
 *  • Closing CTA.
 */
export default async function BrokerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [broker, allProperties] = await Promise.all([getBroker(slug), getProperties()]);
  if (!broker) notFound();

  const heroPhoto = normalizeImg(broker.photo_url);
  const bioParagraphs = (broker.bio || "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const tel = telHref(broker.phone_raw || broker.phone);

  // Derive "Recent transactions" from every listing this broker is assigned to.
  // Sort by sale_date desc (most-recent deals first), then fall back to
  // name for stable ordering when dates are missing.
  const brokerProperties = allProperties
    .filter((p) => Array.isArray(p.broker_slugs) && p.broker_slugs.includes(broker.slug))
    .sort((a, b) => {
      const aDate = a.sale_date || "";
      const bDate = b.sale_date || "";
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return (a.name || "").localeCompare(b.name || "");
    });

  return (
    <>
      <section className="broker-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/our-team" style={{ color: "var(--gold)" }}>
              ‹ Back to Team
            </Link>
          </div>
          <div className="broker-hero-grid">
            <div className="broker-hero-photo">
              {heroPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroPhoto} alt={broker.name} />
              ) : null}
            </div>
            <div className="broker-hero-meta">
              <div className="eyebrow on-dark">{broker.title}</div>
              <h1>{broker.name}</h1>
              <div className="broker-contact-block">
                {tel && !broker.hide_phone ? (
                  <a href={tel} className="cta-phone">
                    {broker.phone}
                  </a>
                ) : null}
                {broker.email ? (
                  <a href={`mailto:${broker.email}`} className="broker-email-link">
                    {broker.email}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="wrap">
          <div className="broker-bio">
            <h2>About {broker.name.split(" ")[0]}</h2>
            {bioParagraphs.length > 0 ? (
              bioParagraphs.map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <p>Bio coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {brokerProperties.length > 0 && (
        <section className="content-section alt">
          <div className="wrap">
            <div className="creatives-head">
              <div className="eyebrow-line center">
                <span className="eyebrow" style={{ margin: 0 }}>Track Record</span>
              </div>
              <h2>Recent transactions closed by {broker.name.split(" ")[0]}</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, marginTop: 14 }}>
                A representative sample of multifamily deals {broker.name.split(" ")[0]} has been involved in — as
                listing broker or co-broker.
              </p>
            </div>
            <div className="city-grid" style={{ marginTop: 50 }}>
              {brokerProperties.map((p) => {
                const img = normalizeImg(p.hero_image || p.images?.[0]);
                const href = `/property/${p.slug}`;
                const subtitle =
                  p.location ||
                  [p.units ? `${p.units}-Unit` : null, p.type].filter(Boolean).join(" · ");
                return (
                  <Link key={p.slug} className="city-card" href={href}>
                    <div
                      className="city-img"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(15,26,46,0.05) 0%, rgba(15,26,46,0.40) 100%), url('${img}')`,
                      }}
                    ></div>
                    <div className="city-card-body">
                      <div className="city-name">{p.name}</div>
                      <div className="city-units">{subtitle}</div>
                      <span className="btn btn-primary">View Listing →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">Reach Out</div>
              <h2>Want to work with {broker.name.split(" ")[0]}?</h2>
              <p>
                Send a message or call directly. Every conversation goes to a real broker — no gatekeeping, no junior
                associates.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/contact" className="btn btn-primary btn-arrow" style={{ justifyContent: "center", padding: "18px 30px" }}>
                Contact {broker.name.split(" ")[0]}
              </Link>
              {tel && !broker.hide_phone ? (
                <div>
                  <div className="cta-phone-label">Or call directly</div>
                  <a href={tel} className="cta-phone">
                    {broker.phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
