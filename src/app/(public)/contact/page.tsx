import SmartForm from "@/components/public/SmartForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — AJ Commercial Group",
  description:
    "Talk directly with a real broker on the AJ Commercial Group team. We respond within one business day — usually faster.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">Get In Touch</div>
          <h1>
            Let&apos;s talk about your <em>building.</em>
          </h1>
          <p>
            Selling, buying, exchanging, or just curious about a number — every conversation goes to a real broker on
            our team.
          </p>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap">
          <div
            className="contact-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, maxWidth: 1240, margin: "0 auto" }}
          >
            <SmartForm
              className="form-card"
              formType="contact"
              intro={
                <>
                  <h2>Send a message</h2>
                  <p className="form-lede">We&apos;ll respond within one business day — usually faster.</p>
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
              <div className="form-grid full">
                <div>
                  <label className="form-label">What is this about?</label>
                  <select className="form-select" name="inquiry_type">
                    <option>I&apos;m thinking about selling</option>
                    <option>I&apos;m looking to buy</option>
                    <option>I want to do a 1031 exchange</option>
                    <option>Career / Joining the team</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-grid full">
                <div>
                  <label className="form-label">Tell us a little more</label>
                  <textarea className="form-textarea" name="message"></textarea>
                </div>
              </div>

              <label className="form-consent">
                <input type="checkbox" name="sms_consent" value="yes" />
                <span>
                  I agree to receive SMS text messages from AJ Commercial Group Inc. at the number provided. Consent
                  is not a condition of any purchase. Msg &amp; data rates may apply. Msg frequency varies. Reply HELP
                  for help, STOP to cancel. See our{" "}
                  <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
                </span>
              </label>

              <button type="submit" className="btn btn-primary form-submit btn-arrow">
                Send Message
              </button>
            </SmartForm>

            <div>
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>Office</span>
              </div>
              <h2 style={{ fontSize: 32, marginBottom: 24 }}>
                <span className="num">5133</span> Washington St #7
                <br />
                <span style={{ color: "var(--brand-blue)" }}>Downers Grove, IL 60515</span>
              </h2>

              <div style={{ display: "grid", gap: 24, marginTop: 36 }}>
                <div>
                  <div className="form-label">Phone</div>
                  <a href="tel:6308957989" className="num" style={{ fontSize: 15, color: "var(--brand-blue)", fontWeight: 300, lineHeight: 1.85, letterSpacing: "0.01em" }}>
                    (630) 895-7989
                  </a>
                  <br />
                  <a href="tel:2244019152" className="num" style={{ fontSize: 15, color: "var(--brand-blue)", fontWeight: 300, lineHeight: 1.85, letterSpacing: "0.01em" }}>
                    (224) 401-9152
                  </a>
                </div>
                <div>
                  <div className="form-label">Email</div>
                  <a href="mailto:contact@ajcommercialgroup.com" style={{ fontSize: 17, color: "var(--navy)", fontWeight: 500 }}>
                    contact@ajcommercialgroup.com
                  </a>
                </div>
                <div>
                  <div className="form-label">Hours</div>
                  <div style={{ fontSize: 17, color: "var(--ink)", fontWeight: 500 }}>
                    Monday – Sunday
                    <br />
                    <span className="num">9:00</span> am – <span className="num">5:00</span> pm
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 50,
                  padding: 24,
                  background: "var(--paper)",
                  borderRadius: "var(--radius)",
                  borderLeft: "3px solid var(--brand-blue)",
                }}
              >
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--navy)", fontWeight: 500, lineHeight: 1.5 }}>
                  &quot;Every conversation goes to a real broker — same person, every step. That&apos;s how we earn the
                  next deal through the last one.&quot;
                </div>
                <div style={{ marginTop: 10, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>
                  — Joey &amp; Anthony, Partners
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
