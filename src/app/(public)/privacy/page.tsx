import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — AJ Commercial Group",
  description:
    "How AJ Commercial Group collects, uses, and protects your information, including our SMS/text messaging and mobile opt-in policy.",
  alternates: { canonical: "https://www.ajcommercialgroup.com/privacy" },
};

const UPDATED = "July 8, 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">Legal</div>
          <h1>
            Privacy <em>Policy</em>
          </h1>
          <p>Last updated: {UPDATED}</p>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap legal-copy" style={{ maxWidth: 820, margin: "0 auto", lineHeight: 1.7 }}>
          <p>
            AJ Commercial Group Inc. (&ldquo;AJ Commercial Group,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) respects your privacy. This Privacy Policy explains what information we collect through
            our website at ajcommercialgroup.com (the &ldquo;Site&rdquo;), how we use it, and the choices you have. By
            using the Site or submitting a form, you agree to this Policy.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect the information you voluntarily provide when you fill out a form on our Site — such as a contact,
            valuation, buyer, 1031 exchange, or careers inquiry. This may include your name, email address, phone
            number, property details, and any message you send us. When you submit a form, we also automatically record
            technical information such as your IP address, browser type (user agent), the page you submitted from, and
            referral/UTM parameters, which help us route and understand inquiries.
          </p>
          <p>
            We use a privacy-friendly, cookieless analytics service to measure aggregate Site traffic. It does not
            identify individual visitors.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information you provide to respond to your inquiry, provide the brokerage and advisory services
            you requested, follow up about properties or opportunities, and improve our services. We may contact you by
            phone, email, or text message using the contact details you provide.
          </p>

          <h2>SMS / Text Messaging &amp; Mobile Opt-In</h2>
          <p>
            When you check the SMS consent box on one of our forms and provide your mobile number, you agree to receive
            text messages from AJ Commercial Group Inc. These may include follow-ups about your inquiry, appointment and
            listing notifications, alerts, and occasional marketing messages. Message frequency varies. Message and data
            rates may apply.
          </p>
          <p>
            Consent to receive text messages is <strong>not a condition of purchasing any property, product, or
            service</strong>. You can opt out at any time by replying <strong>STOP</strong> to any message, and you can
            reply <strong>HELP</strong> for assistance. For help you may also contact us at (630) 895-7989 or
            contact@ajcommercialgroup.com.
          </p>
          <p>
            <strong>
              No mobile information (including phone numbers collected for SMS) will be shared with or sold to third
              parties or affiliates for their own marketing or promotional purposes. Mobile opt-in and consent are never
              shared with any third party for marketing.
            </strong>{" "}
            Text messaging originator opt-in data is not shared with any third parties except subprocessors acting on
            our behalf to help deliver the messaging service (for example, our messaging platform provider), and only as
            necessary to send the messages you asked to receive.
          </p>

          <h2>How We Share Information</h2>
          <p>
            We do not sell your personal information. We may share information with service providers who help us operate
            our business and the Site — such as our customer relationship management (CRM) and messaging platform, our
            website hosting and analytics providers, and our email provider — under agreements that limit their use of
            the information to providing services to us. We may also disclose information if required by law or to
            protect our rights, safety, or property.
          </p>

          <h2>Data Retention &amp; Security</h2>
          <p>
            We retain inquiry information for as long as needed to provide our services and for legitimate business or
            legal purposes. We use reasonable administrative and technical safeguards to protect the information we
            collect. No method of transmission or storage is completely secure, however, and we cannot guarantee
            absolute security.
          </p>

          <h2>Your Choices</h2>
          <p>
            You may opt out of text messages by replying STOP, and you may unsubscribe from marketing emails using the
            link in any email. To request access to, correction of, or deletion of the personal information you have
            submitted, contact us using the details below and we will respond consistent with applicable law.
          </p>

          <h2>Children&rsquo;s Privacy</h2>
          <p>
            The Site is intended for a business and adult audience and is not directed to children under 13. We do not
            knowingly collect personal information from children.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last
            updated&rdquo; date above. Your continued use of the Site after changes are posted constitutes acceptance of
            the updated Policy.
          </p>

          <h2>Contact Us</h2>
          <p>
            AJ Commercial Group Inc.
            <br />
            5133 Washington St #7, Downers Grove, IL 60515
            <br />
            Phone: (630) 895-7989
            <br />
            Email: contact@ajcommercialgroup.com
          </p>
        </div>
      </section>
    </>
  );
}
