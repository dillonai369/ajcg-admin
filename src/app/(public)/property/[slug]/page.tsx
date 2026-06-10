import Link from "next/link";
import { notFound } from "next/navigation";
import { getProperty, getProperties, getBrokers } from "@/lib/data";
import type { Metadata } from "next";
import type { Broker } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Listing — AJ Commercial Group" };
  return {
    title: property.meta_title || `${property.name} — AJ Commercial Group`,
    description: property.meta_description || property.description || `${property.name} — ${property.units}-Unit ${property.type}`,
  };
}

function normalizeImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
}

function brokerCardPhoto(b: Broker) {
  return normalizeImg(b.card_photo_url || b.photo_url);
}

/**
 * Single property page. Port of any property-*.html (template:
 * property-1016-e-division-st-1025.html).
 *
 * Layout:
 *  • property-hero with linear gradient + cover image + address + units.
 *  • property-body grid: left content (description + highlights),
 *    right "Key Details" card built from optional fields.
 *  • Optional photo gallery (when images.length > 1).
 *  • Optional Listing Team strip if property.brokers contains broker slugs.
 *  • Closing CTA.
 */
export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const hero = normalizeImg(property.hero_image || property.images?.[0]);
  const galleryImages = (property.images || []).filter((url) => url && url !== property.hero_image);

  // Listing team — look up broker docs by slug.
  let team: Broker[] = [];
  if (property.brokers && property.brokers.length > 0) {
    const allBrokers = await getBrokers();
    team = property.brokers
      .map((slug) => allBrokers.find((b) => b.slug === slug))
      .filter((b): b is Broker => !!b);
  }

  // Build the "Key Details" rows from whichever optional fields exist.
  const facts: Array<{ label: string; value: string }> = [];
  if (property.address) facts.push({ label: "Address", value: property.address });
  else if (property.location) facts.push({ label: "Address", value: property.location });
  if (property.units) facts.push({ label: "Total Units", value: property.units });
  if (property.year_built) facts.push({ label: "Year Built", value: property.year_built });
  if (property.year_renovated) facts.push({ label: "Year Renovated", value: property.year_renovated });
  if (property.total_sqft) facts.push({ label: "Total SqFt", value: property.total_sqft });
  if (property.lot_size) facts.push({ label: "Lot Size", value: property.lot_size });
  if (property.cap_rate) facts.push({ label: "Cap Rate", value: property.cap_rate });
  if (property.noi) facts.push({ label: "NOI", value: property.noi });
  if (property.gross_income) facts.push({ label: "Gross Income", value: property.gross_income });
  if (property.sale_price && !property.hide_sale_price) facts.push({ label: "Sale Price", value: property.sale_price });
  if (property.sale_date) facts.push({ label: "Sale Date", value: property.sale_date });
  if (property.building_class) facts.push({ label: "Building Class", value: property.building_class });
  if (property.parking) facts.push({ label: "Parking", value: property.parking });
  if (property.heating) facts.push({ label: "Heating", value: property.heating });
  if (property.neighborhood) facts.push({ label: "Neighborhood", value: property.neighborhood });

  return (
    <>
      <section
        className="property-hero"
        style={{
          background: `linear-gradient(180deg, rgba(15,26,46,0.30) 0%, rgba(15,26,46,0.65) 100%), url('${hero}') center/cover, linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)`,
        }}
      >
        <div className="wrap" style={{ height: "100%", display: "flex", alignItems: "flex-end" }}>
          <div className="property-hero-meta" style={{ position: "static", paddingBottom: 30 }}>
            <div className="breadcrumb">
              <Link href="/recently-sold" style={{ color: "var(--gold)" }}>
                ‹ Back to Listings
              </Link>
            </div>
            <h1>{property.name}</h1>
            <div className="property-loc">{property.location || property.address}</div>
          </div>
        </div>
      </section>

      <section className="property-body">
        <div className="wrap">
          <div className="property-grid">
            <div className="property-content">
              <h2>Property Overview</h2>
              <p>{property.body || property.description}</p>

              {property.highlights && property.highlights.length > 0 && (
                <>
                  <h2 style={{ marginTop: 40 }}>Property Highlights</h2>
                  <ul className="feature-list">
                    {property.highlights.map((h, i) => (
                      <li key={i}>
                        <span className="check">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div>
              {facts.length > 0 && (
                <div className="property-facts">
                  <h2>Key Details</h2>
                  <ul>
                    {facts.map((f, i) => (
                      <li key={i}>
                        <span className="fact-label">{f.label}</span>
                        <span className="fact-value">{f.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ marginBottom: 20 }}>Photos</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {galleryImages.map((src, i) => {
                  const url = normalizeImg(src);
                  return (
                    <div
                      key={i}
                      style={{
                        aspectRatio: "4 / 3",
                        backgroundImage: `url('${url}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {team.length > 0 && (
            <div className="property-brokers-row">
              <div className="property-brokers-head">
                <h2>Listing Team</h2>
              </div>
              <div className="property-brokers-cards">
                {team.map((b, i) => {
                  const label = i === 0 ? "Listing Broker" : "Co-Broker";
                  const photo = brokerCardPhoto(b);
                  return (
                    <Link key={b.slug} href={`/broker/${b.slug}`} className="property-broker property-broker-link">
                      <div className="label">{label}</div>
                      <div className="photo">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={b.name} />
                        ) : null}
                      </div>
                      <div className="name">{b.name}</div>
                      <div className="role">{b.title}</div>
                      <div className="contact-line">
                        {b.phone && !b.hide_phone ? <>{b.phone} · </> : null}
                        {b.email}
                      </div>
                      <div className="broker-cta">View full profile →</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">Inspired By This Deal?</div>
              <h2>Could yours be the next one we close?</h2>
              <p>
                Whether you&apos;re thinking about selling, repositioning, or executing a 1031 exchange — start with a
                real conversation. We&apos;ll listen first and give you actual numbers, not just a pitch.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/selling" className="btn btn-primary btn-arrow" style={{ justifyContent: "center", padding: "18px 30px" }}>
                Get a Free Valuation
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
