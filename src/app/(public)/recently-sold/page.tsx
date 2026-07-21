import Link from "next/link";
import { getProperties } from "@/lib/data";
import type { Metadata } from "next";
import type { Property } from "@/lib/types";

// Always pull fresh from Supabase so admin-added listings show up immediately.
// (Static cache from build time was excluding new rows even after revalidation.)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recently Sold — AJ Commercial Group",
  description:
    "A representative selection of multifamily transactions closed by AJ Commercial Group across Chicagoland and the broader Midwest.",
  alternates: { canonical: "/recently-sold" },
};

function normalizeImg(url?: string) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
}

// Pull a short city/neighborhood label off the property, with fallbacks.
function cityLabel(p: Property): string {
  if (p.city) return p.city;
  if (p.location) {
    // location strings look like "1100 S State St, Lockport, IL · 7-Unit Mixed-Use"
    const beforeDot = p.location.split("·")[0];
    const parts = beforeDot.split(",").map((s) => s.trim()).filter(Boolean);
    // Use the city slot (second-to-last) when there are 3 parts ("addr, city, state").
    if (parts.length >= 3) return parts[parts.length - 2];
    if (parts.length === 2) return parts[1];
    return parts[0] || p.name;
  }
  return p.name;
}

export default async function RecentlySoldPage() {
  const properties = await getProperties();
  const sold = properties
    .filter((p) => (p.status || "").toLowerCase() === "sold")
    // Sort by unit count descending — biggest deals first (Toledo 224 down to smallest).
    // Strip non-digits before parsing so values like "10-Unit" or "224" both work.
    .sort((a, b) => {
      const au = parseInt(String(a.units || "0").replace(/\D/g, ""), 10) || 0;
      const bu = parseInt(String(b.units || "0").replace(/\D/g, ""), 10) || 0;
      return bu - au;
    });

  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            Track Record <span>·</span> Recently Sold
          </div>
          <h1>
            Recently sold <em>properties.</em>
          </h1>
          <p>
            A representative selection of multifamily transactions closed by AJ Commercial Group across Chicagoland and
            the broader Midwest. Click any property to see the full story.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="wrap">
          <div className="city-grid">
            {sold.map((p) => {
              const img = normalizeImg(p.hero_image || p.images?.[0]);
              return (
                <Link key={p.slug} className="city-card" href={`/property/${p.slug}`}>
                  <div
                    className="city-img"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(15,26,46,0.05) 0%, rgba(15,26,46,0.40) 100%), url('${img}')`,
                    }}
                  ></div>
                  <div className="city-card-body">
                    <div className="city-name">{cityLabel(p)}</div>
                    <div className="city-units">{p.units ? `${p.units}-Unit` : p.type || "Multifamily"}</div>
                    <span className="btn btn-primary">View Listing →</span>
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
              <div className="eyebrow on-dark">Could Yours Be Next?</div>
              <h2>Curious what your building is worth?</h2>
              <p>
                Get a no-obligation valuation. We&apos;ll run real comps, current cap rates, and active buyer demand —
                and give you a number you can actually use to make a decision.
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
