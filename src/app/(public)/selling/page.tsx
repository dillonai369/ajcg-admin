import SmartForm from "@/components/public/SmartForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Valuation — AJ Commercial Group",
  description:
    "Get a no-obligation multifamily valuation in 48 hours using real comps, current cap rates, and active buyer demand.",
  alternates: { canonical: "/selling" },
};

export default function SellingPage() {
  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            Services <span>·</span> Selling · Free Valuation
          </div>
          <h1>
            What&apos;s your multifamily <em>actually worth?</em>
          </h1>
          <p>
            Real comps. Current cap rates. Active buyer demand. We&apos;ll give you a no-obligation valuation in 48
            hours — no public listing, no tenant disruption, no commitment.
          </p>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap">
          <SmartForm
            className="form-card"
            formType="quick_valuation"
            intro={
              <>
                <div className="eyebrow-line">
                  <span className="eyebrow" style={{ margin: 0 }}>Quick Valuation</span>
                </div>
                <h2>Quick and easy. Just for you.</h2>
                <p className="form-lede">
                  Get a free valuation showing what you can get for your property at this time. Just give us these
                  details — no call needed.
                </p>
              </>
            }
          >
            <div className="form-grid">
              <div>
                <label className="form-label">Name</label>
                <input className="form-input" type="text" name="full_name" required />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" required />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" name="phone" required />
              </div>
              <div>
                <label className="form-label">Property Address</label>
                <input className="form-input" type="text" name="property_address" placeholder="Street, City, State" required />
              </div>
            </div>
            <div className="form-grid full">
              <div>
                <label className="form-label">Unit Count</label>
                <input className="form-input" type="text" name="unit_count" placeholder="How many units?" />
              </div>
            </div>

            <label className="form-consent">
              <input type="checkbox" name="sms_consent" value="yes" />
              <span>
                I agree to receive SMS text messages (notifications, alerts, and occasional marketing) from AJ
                Commercial Group Inc. at the number provided. Consent is not a condition of any purchase. Msg &amp;
                data rates may apply. Msg frequency varies. Reply HELP for help, STOP to cancel. See our{" "}
                <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" className="btn btn-primary form-submit btn-arrow">
              Get My Quick Valuation
            </button>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                Want a deeper analysis with a real call walkthrough?{" "}
                <a href="#full-valuation" style={{ color: "var(--brand-blue)", fontWeight: 600 }}>
                  Use the full valuation form ↓
                </a>
              </p>
            </div>
          </SmartForm>
        </div>
      </section>

      <section className="form-section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SmartForm
            className="form-card wide"
            formType="selling"
            intro={
              <>
                <h2 id="full-valuation">Full property valuation request</h2>
                <p className="form-lede">
                  Want a deeper analysis with a real call walkthrough? Tell us about your property — we&apos;ll prepare
                  a comparative market analysis using current cap rates, recent comps, and active buyer demand, then
                  walk you through the number within 48 hours.
                </p>
              </>
            }
          >
            <div className="form-grid">
              <div>
                <label className="form-label">First Name</label>
                <input className="form-input" type="text" name="first_name" required />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input className="form-input" type="text" name="last_name" required />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" name="phone" required />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Property Address</label>
                <input className="form-input" type="text" name="property_address" placeholder="Street, City, State" required />
              </div>
              <div>
                <label className="form-label">Unit Count</label>
                <input className="form-input" type="text" name="unit_count" />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Unit Mix</label>
                <input className="form-input" type="text" name="unit_mix" placeholder="e.g., 4x 1BR / 2x 2BR" />
              </div>
              <div>
                <label className="form-label">Annual Expenses</label>
                <input className="form-input" type="text" name="annual_expenses" placeholder="$" />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Window Age</label>
                <input className="form-input" type="text" name="window_age" placeholder="Years / approx" />
              </div>
              <div>
                <label className="form-label">Roof Age</label>
                <input className="form-input" type="text" name="roof_age" placeholder="Years / approx" />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Mechanical Age</label>
                <input className="form-input" type="text" name="mechanical_age" placeholder="HVAC / boiler age" />
              </div>
              <div>
                <label className="form-label">Condition</label>
                <input className="form-input" type="text" name="condition" placeholder="Turnkey, mostly updated, value-add, etc." />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Gross Income (Annual)</label>
                <input className="form-input" type="text" name="gross_income" placeholder="$" />
              </div>
            </div>

            <div className="form-grid full" style={{ marginTop: 4 }}>
              <div>
                <label className="form-label">Write Here (Additional Information)</label>
                <textarea
                  className="form-textarea"
                  name="additional_info"
                  placeholder="Anything else we should know — ownership timeline, 1031 plans, recent capex, etc."
                ></textarea>
              </div>
            </div>

            <label className="form-consent">
              <input type="checkbox" name="sms_consent" value="yes" />
              <span>
                I agree to receive SMS text messages (notifications, alerts, and occasional marketing) from AJ
                Commercial Group Inc. at the number provided. Consent is not a condition of any purchase. Message
                frequency may vary. Message and data rates may apply. Reply HELP for help, STOP to cancel. See our{" "}
                <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" className="btn btn-primary form-submit btn-arrow">
              Submit Valuation Request
            </button>
          </SmartForm>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <div className="eyebrow on-dark">Why a Real Valuation Matters</div>
          <h2>An algorithm can&apos;t tell you what your building is worth.</h2>
          <div className="why-grid">
            <div className="why-item">
              <h3>Live cap rates.</h3>
              <p>We use the cap rates buyers are actually paying right now — not 12-month-old comps from a public database.</p>
            </div>
            <div className="why-item">
              <h3>Real buyer demand.</h3>
              <p>We talk to active multifamily buyers daily. We know who&apos;s writing checks at what number — and we factor that into your value.</p>
            </div>
            <div className="why-item">
              <h3>Confidentiality.</h3>
              <p>Tenants don&apos;t know. Lenders don&apos;t know. Until you decide they should. Most of our deals close before they ever hit the open market.</p>
            </div>
            <div className="why-item">
              <h3>No obligation.</h3>
              <p>You get a real number. You decide what to do with it. If it&apos;s not the right time to sell, that&apos;s fine — we&apos;ll be here when it is.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
