import Link from "next/link";
import { getBrokers } from "@/lib/data";
import type { Metadata } from "next";
import type { Broker } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Team — AJ Commercial Group",
  description:
    "Meet the brokers and transaction coordinators behind AJ Commercial Group — Chicago and Midwest multifamily specialists.",
  alternates: { canonical: "/our-team" },
};

function teamPhotoStyle(broker: Broker) {
  const url = broker.card_photo_url || broker.photo_url;
  if (!url) return undefined;
  // Internal asset paths from the JSON were stored as "assets/team/...". Prepend a slash.
  const normalized = url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
  return { backgroundImage: `url('${normalized}')` };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TeamCard({ broker, partner }: { broker: Broker; partner?: boolean }) {
  const photoStyle = teamPhotoStyle(broker);
  return (
    <Link
      href={`/broker/${broker.slug}`}
      className={`team-card${partner ? " partner" : ""} team-card-link`}
    >
      {photoStyle ? (
        <div className="team-photo real" style={photoStyle}></div>
      ) : (
        <div className="team-photo">
          <div className="initials">{initials(broker.name)}</div>
        </div>
      )}
      <div className="team-name">{broker.name}</div>
      <div className="team-role">{broker.title}</div>
      {broker.email || broker.phone ? (
        <div className="team-contact">
          {broker.phone && !broker.hide_phone ? (
            <>
              <span className="num">{broker.phone}</span>
              <br />
            </>
          ) : null}
          {broker.email ? <span>{broker.email}</span> : null}
        </div>
      ) : (
        <div className="team-contact" style={{ opacity: 0.6, fontStyle: "italic", fontSize: 12 }}>
          Contact info coming soon
        </div>
      )}
      <div className="team-cta">View profile →</div>
    </Link>
  );
}

export default async function OurTeamPage() {
  const brokers = await getBrokers();
  const visible = brokers.filter((b) => b.show_on_team_page !== false);
  const partners = visible.filter((b) => b.is_partner);
  const others = visible.filter((b) => !b.is_partner);

  return (
    <>
      <section className="page-header with-team-photo">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            About <span>·</span> Our Team
          </div>
          <h1>
            Meet the people <em>behind every deal.</em>
          </h1>
          <p>
            Two partners. A team of brokers and transaction coordinators. All multifamily-focused. All
            Midwest-rooted. All available for a real conversation about your building.
          </p>
        </div>
      </section>

      <section className="team-section">
        <div className="wrap">
          {partners.length > 0 && (
            <div className="team-row">
              <div className="team-row-label">Founders</div>
              <div className="team-grid partners">
                {partners.map((b) => (
                  <TeamCard key={b.slug} broker={b} partner />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="team-row">
              <div className="team-row-label">Brokers &amp; Operations</div>
              <div className="team-grid brokers">
                {others.map((b) => (
                  <TeamCard key={b.slug} broker={b} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="creatives-section">
        <div className="wrap">
          <div className="creatives-head">
            <div className="eyebrow-line center">
              <span className="eyebrow" style={{ margin: 0 }}>In the Field</span>
            </div>
            <h2>Real owners. Real outcomes.</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 16, marginTop: 14 }}>
              A look at the work, the wins, and the relationships behind the deals — straight from our team and our
              clients.
            </p>
          </div>
          <div className="creatives-grid">
            <div className="creative-card" style={{ backgroundImage: "url('/assets/creatives/IMG_4596.jpg')" }}></div>
            <div className="creative-card" style={{ backgroundImage: "url('/assets/creatives/IMG_4597.jpg')" }}></div>
            <div className="creative-card" style={{ backgroundImage: "url('/assets/creatives/IMG_4599.jpg')" }}></div>
            <div className="creative-card" style={{ backgroundImage: "url('/assets/creatives/IMG_4600.jpg')" }}></div>
            <div className="creative-card" style={{ backgroundImage: "url('/assets/creatives/IMG_4601.jpg')" }}></div>
            <div className="creative-card" style={{ backgroundImage: "url('/assets/creatives/IMG_4598.jpg')" }}></div>
          </div>
        </div>
      </section>

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">Ready to Talk?</div>
              <h2>Reach out to our team directly.</h2>
              <p>
                Every conversation goes to a real broker on our team. Tell us what you&apos;re thinking and we&apos;ll
                take it from there.
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
