import SmartForm from "@/components/public/SmartForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1031 Exchange — AJ Commercial Group",
  description:
    "Defer capital gains, preserve equity, and build wealth with a 1031 Exchange. We help map the sequence and connect you with off-market replacement properties.",
  alternates: { canonical: "/exchange-1031" },
};

export default function Exchange1031Page() {
  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            Services <span>·</span> 1031 Exchange
          </div>
          <h1>
            Defer capital gains. <em>Preserve equity. Build wealth.</em>
          </h1>
          <p>
            A 1031 Exchange is one of the most powerful tools available to multifamily owners. We help you map the
            sequence — and connect you with the off-market replacement properties that make it work.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="wrap">
          <div className="content-grid-2">
            <div className="content-block">
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>What Is a 1031 Exchange?</span>
              </div>
              <h2>A like-kind exchange that defers capital gains tax indefinitely.</h2>
              <p>
                Section 1031 of the IRS code allows you to sell an investment property and reinvest the proceeds into a
                &quot;like-kind&quot; replacement property — without paying capital gains tax at the time of sale. Done
                correctly, you defer 100% of your tax burden and continue compounding your equity.
              </p>
              <p>
                It&apos;s not just a tax move. It&apos;s a wealth-building strategy that lets you upgrade properties,
                change markets, or transition into higher-performing assets without losing 25–30% of your equity to the
                IRS along the way.
              </p>
            </div>
            <div className="content-block">
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>Common 1031 Goals</span>
              </div>
              <h2>Why owners exchange.</h2>
              <ul className="feature-list">
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Trade up.</strong> Move from a 12-unit to a 50-unit while deferring tax.
                  </span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Diversify markets.</strong> Sell a Chicago asset, buy in Indianapolis, Detroit, or Milwaukee.
                  </span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Reduce hands-on management.</strong> Trade an active value-add for a stabilized cash-flow asset.
                  </span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Transition into higher-performing markets.</strong> Move into asset classes with stronger fundamentals.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section alt">
        <div className="wrap">
          <div className="eyebrow-line center">
            <span className="eyebrow" style={{ margin: 0 }}>How It Works</span>
          </div>
          <h2 style={{ textAlign: "center", marginBottom: 50 }}>How does a 1031 Exchange work?</h2>
          <ul className="feature-list" style={{ maxWidth: 760, margin: "0 auto" }}>
            <li>
              <span className="check">1</span>
              <span>
                <strong>Sell your current property.</strong> Must be investment or business real estate. The clock starts the day the sale closes.
              </span>
            </li>
            <li>
              <span className="check">2</span>
              <span>
                <strong>Identify a replacement property.</strong> Within 45 days of closing on the original sale.
              </span>
            </li>
            <li>
              <span className="check">3</span>
              <span>
                <strong>Complete the exchange.</strong> The replacement purchase must close within 180 days of the original sale.
              </span>
            </li>
            <li>
              <span className="check">4</span>
              <span>
                <strong>Use a Qualified Intermediary.</strong> A QI holds the funds and ensures IRS compliance. We connect you with vetted QIs we&apos;ve worked with before.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="content-section">
        <div className="wrap">
          <div className="eyebrow-line center">
            <span className="eyebrow" style={{ margin: 0 }}>Why Work With Us</span>
          </div>
          <h2 style={{ textAlign: "center", marginBottom: 50 }}>Why work with AJ Commercial for your 1031 Exchange?</h2>
          <ul className="feature-list" style={{ maxWidth: 760, margin: "0 auto" }}>
            <li>
              <span className="check">★</span>
              <span>
                <strong>Exclusive access to off-market deals.</strong> We connect you with high-yield, off-market multifamily buildings across Chicago, IL, and the Midwest — properties you won&apos;t find on LoopNet or Crexi.
              </span>
            </li>
            <li>
              <span className="check">★</span>
              <span>
                <strong>Expert guidance.</strong> Our team understands 1031 exchange requirements and helps identify suitable replacement properties that meet your investment goals.
              </span>
            </li>
            <li>
              <span className="check">★</span>
              <span>
                <strong>Industry connections.</strong> We collaborate with qualified intermediaries, tax professionals, and attorneys to ensure a smooth and compliant transaction.
              </span>
            </li>
            <li>
              <span className="check">★</span>
              <span>
                <strong>Speed and efficiency.</strong> We help investors meet tight 45/180-day deadlines without penalties or rushed decisions you&apos;ll regret later.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="cta-block">
        <div className="wrap">
          <div className="cta-grid">
            <div>
              <div className="eyebrow on-dark">The Clock Doesn&apos;t Start Until You Decide</div>
              <h2>Talk to us first.</h2>
              <p>
                We&apos;ll walk through your situation, the 45/180-day clock, qualified intermediary selection, and
                what off-market replacement inventory we have right now.
              </p>
            </div>
            <div className="cta-actions">
              <a href="tel:6308957989" className="btn btn-primary btn-arrow" style={{ justifyContent: "center", padding: "18px 30px" }}>
                (630) 895-7989
              </a>
              <div>
                <div className="cta-phone-label">Or email</div>
                <a href="mailto:contact@ajcommercialgroup.com" className="cta-phone" style={{ fontSize: 18 }}>
                  contact@ajcommercialgroup.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap">
          <SmartForm
            className="form-card wide"
            formType="exchange_1031"
            intro={
              <>
                <div className="eyebrow-line">
                  <span className="eyebrow" style={{ margin: 0 }}>Or Start Online</span>
                </div>
                <h2>Tell us where you are in the process.</h2>
                <p className="form-lede">
                  The 45-day clock doesn&apos;t start until you list. The earlier we know what you&apos;re holding and
                  where you&apos;d like to land, the more replacement options we can line up.
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
                <label className="form-label">Property You are Selling (Address)</label>
                <input className="form-input" type="text" name="relinquished_property" />
              </div>
              <div>
                <label className="form-label">Approximate Sale Timeline</label>
                <select className="form-select" name="sale_timeline">
                  <option value="">Select…</option>
                  <option>Already listed / under contract</option>
                  <option>Within 30 days</option>
                  <option>Within 60–90 days</option>
                  <option>Within 6 months</option>
                  <option>Just exploring</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label className="form-label">What you are looking for in the replacement</label>
              <div className="form-checks">
                <label className="form-check">
                  <input type="checkbox" name="replacement_goals" value="Trade up to a larger property" /> Trade up to a larger property
                </label>
                <label className="form-check">
                  <input type="checkbox" name="replacement_goals" value="Stabilized cash flow" /> More stabilized cash flow / less hands-on
                </label>
                <label className="form-check">
                  <input type="checkbox" name="replacement_goals" value="Different market" /> Different market / geographic shift
                </label>
                <label className="form-check">
                  <input type="checkbox" name="replacement_goals" value="Off-market deal access" /> Off-market deal access
                </label>
              </div>
            </div>

            <div className="form-grid full" style={{ marginTop: 22 }}>
              <div>
                <label className="form-label">Tell us about your situation</label>
                <textarea
                  className="form-textarea"
                  name="situation_notes"
                  placeholder="Approximate sale price, equity tied up, target return, intermediary already chosen, etc."
                ></textarea>
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
              Start My 1031 Exchange
            </button>
          </SmartForm>
        </div>
      </section>
    </>
  );
}
