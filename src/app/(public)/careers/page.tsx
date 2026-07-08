import SmartForm from "@/components/public/SmartForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers — AJ Commercial Group",
  description:
    "Join a multifamily brokerage team that thinks like owners and builds real careers — not just commissions.",
};

export default function CareersPage() {
  return (
    <>
      <section className="page-header with-skyline">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">
            About <span>·</span> Careers
          </div>
          <h1>
            Build a career that&apos;s <em>actually yours.</em>
          </h1>
          <p>
            We set bold goals, move quickly, and adapt strategically to shifts in the market. Every member of our team
            is empowered to think like an owner, push limits, and create long-term wealth — not just commissions.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="wrap">
          <div className="content-grid-2">
            <div className="content-block">
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>What We Look For</span>
              </div>
              <h2>Hungry. Coachable. Owner-minded.</h2>
              <p>
                We hire for character first and skills second. The brokerage business is competitive — but the people
                who win in it long-term are the ones who treat every conversation like the most important one
                they&apos;ll have that week.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Hungry.</strong> You don&apos;t need a script to make calls and you don&apos;t wait around for leads to land in your lap.
                  </span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Coachable.</strong> You can take direct feedback without taking it personally. You&apos;re here to get better.
                  </span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Owner-minded.</strong> You understand the asset because you think like the people who own it.
                  </span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>
                    <strong>Long-term.</strong> You&apos;re building a career — not just collecting commissions for the next 18 months.
                  </span>
                </li>
              </ul>
            </div>
            <div className="content-block">
              <div className="eyebrow-line">
                <span className="eyebrow" style={{ margin: 0 }}>What You Get</span>
              </div>
              <h2>An environment built to make you better.</h2>
              <ul className="feature-list">
                <li>
                  <span className="check">★</span>
                  <span>
                    <strong>Real mentorship.</strong> Direct access to Joey and Anthony — not a 12-step training program written by someone in another city.
                  </span>
                </li>
                <li>
                  <span className="check">★</span>
                  <span>
                    <strong>Off-market inventory.</strong> Active deals to work, not cold lists you have to dig through.
                  </span>
                </li>
                <li>
                  <span className="check">★</span>
                  <span>
                    <strong>Modern tools.</strong> CRM, marketing infrastructure, photography — the support to compete with the big firms.
                  </span>
                </li>
                <li>
                  <span className="check">★</span>
                  <span>
                    <strong>Owner equity.</strong> Top performers earn ownership stakes in the firm. We&apos;re building this together.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap">
          <SmartForm
            className="form-card wide"
            formType="careers"
            intro={
              <>
                <h2>Apply today</h2>
                <p className="form-lede">
                  Send us your info and a resume. If there&apos;s a fit, we&apos;ll set up a real conversation — not
                  just a screening call.
                </p>
              </>
            }
          >
            <div className="form-grid">
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" name="full_name" required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" name="phone" required />
              </div>
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" required />
              </div>
              <div>
                <label className="form-label">Resume</label>
                <input className="form-input" type="file" name="resume" />
              </div>
            </div>
            <div className="form-grid full">
              <div>
                <label className="form-label">Why AJ Commercial Group?</label>
                <textarea
                  className="form-textarea"
                  name="motivation"
                  placeholder="Tell us what brought you here and what you would want out of this."
                ></textarea>
              </div>
            </div>

            <label className="form-consent">
              <input type="checkbox" name="sms_consent" value="yes" />
              <span>
                I agree to receive SMS text messages from AJ Commercial Group Inc. at the number provided about my
                application. Consent is not a condition of employment. Msg &amp; data rates may apply. Msg frequency
                varies. Reply HELP for help, STOP to cancel. See our{" "}
                <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" className="btn btn-primary form-submit btn-arrow">
              Submit Application
            </button>
          </SmartForm>
        </div>
      </section>
    </>
  );
}
