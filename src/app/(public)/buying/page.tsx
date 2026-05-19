import SmartForm from "@/components/public/SmartForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buying Multifamily — AJ Commercial Group",
  description:
    "Get matched with off-market and pre-launch multifamily acquisitions across Chicagoland and the Midwest. Tell us what you're hunting for.",
};

export default function BuyingPage() {
  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            Services <span>·</span> Buying
          </div>
          <h1>
            Find your next <em>multifamily acquisition.</em>
          </h1>
          <p>
            Tell us what you&apos;re hunting for. We&apos;ll match you against active off-market inventory, pocket
            listings, and pre-launch deals from owners we already know.
          </p>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap">
          <SmartForm
            className="form-card wide"
            formType="buying"
            intro={
              <>
                <h2>Buyer inquiry</h2>
                <p className="form-lede">
                  Get matched with off-market and pre-launch multifamily opportunities across Chicagoland and the
                  Midwest. We&apos;ll send qualified deals as they come up — quietly, no spam.
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

            <div style={{ marginTop: 24 }}>
              <label className="form-label">Preferred Units</label>
              <div className="form-checks">
                <label className="form-check">
                  <input type="checkbox" name="preferred_units" value="2-4 Units" /> 2-4 Units
                </label>
                <label className="form-check">
                  <input type="checkbox" name="preferred_units" value="5-12 Units" /> 5-12 Units
                </label>
                <label className="form-check">
                  <input type="checkbox" name="preferred_units" value="12-48 Units" /> 12-48 Units
                </label>
                <label className="form-check">
                  <input type="checkbox" name="preferred_units" value="50+ Units" /> 50+ Units
                </label>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label className="form-label">Where I am looking to purchase</label>
              <div className="form-checks">
                <label className="form-check">
                  <input type="checkbox" name="purchase_areas" value="North Suburban Multifamily" /> North Suburban
                  Multifamily
                </label>
                <label className="form-check">
                  <input type="checkbox" name="purchase_areas" value="South Suburban Multifamily" /> South Suburban
                  Multifamily
                </label>
                <label className="form-check">
                  <input type="checkbox" name="purchase_areas" value="City - North Side Multifamily" /> City – North
                  Side Multifamily
                </label>
                <label className="form-check">
                  <input type="checkbox" name="purchase_areas" value="City - West Side Multifamily" /> City – West
                  Side Multifamily
                </label>
                <label className="form-check">
                  <input type="checkbox" name="purchase_areas" value="City - South Side Multifamily" /> City – South
                  Side Multifamily
                </label>
              </div>
            </div>

            <div className="form-grid full" style={{ marginTop: 22 }}>
              <div>
                <label className="form-label">Anything specific we should know?</label>
                <textarea
                  className="form-textarea"
                  name="notes"
                  placeholder="Asset class, target cap rate, 1031 timing, etc."
                ></textarea>
              </div>
            </div>

            <label className="form-consent">
              <input type="checkbox" name="sms_consent" value="yes" required />
              <span>
                I consent to receive SMS notifications, alerts and occasional marketing communication from AJ
                Commercial Group Inc. Message frequency may vary. Message and data rates may apply. Text HELP to +1
                630-895-7989 for assistance. You can reply STOP to unsubscribe at any time.
              </span>
            </label>

            <button type="submit" className="btn btn-primary form-submit btn-arrow">
              Submit Buyer Inquiry
            </button>
          </SmartForm>
        </div>
      </section>
    </>
  );
}
