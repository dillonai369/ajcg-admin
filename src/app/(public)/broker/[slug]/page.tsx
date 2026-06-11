import Link from "next/link";
import { notFound } from "next/navigation";
import { getBroker, getBrokers } from "@/lib/data";
import type { Metadata } from "next";

// Cached at the edge for 60s, then refreshed in the background. Admin saves
// call revalidatePath() so edits show up immediately, regardless of this window.
export const revalidate = 60;

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
 *  • "Recent transactions closed by X" — renders broker.track_record as city-cards.
 *  • Closing CTA.
 */
export default async function BrokerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const broker = await getBroker(slug);
  if (!broker) notFound();

  const heroPhoto = normalizeImg(broker.photo_url);
  const bioParagraphs = (broker.bio || "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const tel = telHref(broker.phone_raw || broker.phone);

  // Track-record entry slugs in the JSON are stored with the "property-" prefix
  // ("property-toledo-river-birch"). Our routes use just the slug part.
  const cleanPropertySlug = (s?: string) => (s || "").replace(/^property-/, "");

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

      {broker.track_record && broker.track_record.length > 0 && (
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
              {broker.track_record.map((tr, i) => {
                const img = normalizeImg(tr.image);
                const href = `/property/${cleanPropertySlug(tr.property_slug)}`;
                return (
                  <Link key={i} className="city-card" href={href}>
                    <div
                      className="city-img"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(15,26,46,0.05) 0%, rgba(15,26,46,0.40) 100%), url('${img}')`,
                      }}
                    ></div>
                    <div className="city-card-body">
                      <div className="city-name">{tr.name}</div>
                      <div className="city-units">{tr.subtitle}</div>
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
