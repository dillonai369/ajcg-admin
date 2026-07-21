/**
 * schema.org structured data for the homepage.
 *
 * The old static site shipped a RealEstateAgent + WebSite JSON-LD graph, but it
 * was never ported when the site moved to Next.js — the app had zero structured
 * data. That matters for brand searches: without it Google has no machine-readable
 * statement of who the business is, where it's located, or which social/profile
 * accounts belong to it, which weakens the homepage as the canonical brand result
 * and makes sitelinks less likely.
 *
 * Deliberately NOT included: aggregateRating/review markup. Self-serving review
 * markup without real reviews rendered on the page violates Google's guidelines
 * and can trigger a manual action. The Google Business Profile already carries
 * the 5.0/40-review rating.
 */
export default function BusinessSchema() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": "https://www.ajcommercialgroup.com/#organization",
        name: "AJ Commercial Group",
        legalName: "AJ Commercial Group Inc.",
        url: "https://www.ajcommercialgroup.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.ajcommercialgroup.com/assets/logo/aj-logo-black.png",
        },
        image: "https://www.ajcommercialgroup.com/assets/og-image.jpg",
        description:
          "Chicagoland multifamily real estate brokerage specializing in apartment building sales, valuations, and 1031 exchanges across Chicago, the suburbs, and the Midwest.",
        telephone: "+1-630-895-7989",
        email: "contact@ajcommercialgroup.com",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "5133 Washington St #7",
          addressLocality: "Downers Grove",
          addressRegion: "IL",
          postalCode: "60515",
          addressCountry: "US",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "17:00",
          },
        ],
        areaServed: [
          { "@type": "City", name: "Chicago" },
          { "@type": "AdministrativeArea", name: "Cook County, Illinois" },
          { "@type": "AdministrativeArea", name: "DuPage County, Illinois" },
          { "@type": "AdministrativeArea", name: "Will County, Illinois" },
          { "@type": "State", name: "Illinois" },
        ],
        knowsAbout: [
          "Multifamily real estate brokerage",
          "Apartment building sales",
          "1031 exchanges",
          "Commercial property valuation",
        ],
        sameAs: [
          "https://www.linkedin.com/company/ajcommercialgroup/",
          "https://www.instagram.com/ajcommercialgroup",
          "https://www.youtube.com/@AJCommercialGroup-Multifamily",
          "https://www.facebook.com/share/1GLxqWh28C/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.ajcommercialgroup.com/#website",
        url: "https://www.ajcommercialgroup.com",
        name: "AJ Commercial Group",
        publisher: { "@id": "https://www.ajcommercialgroup.com/#organization" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
