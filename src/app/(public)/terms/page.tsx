import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — AJ Commercial Group",
  description:
    "The terms and conditions governing your use of the AJ Commercial Group website and services.",
  alternates: { canonical: "https://www.ajcommercialgroup.com/terms" },
};

const UPDATED = "July 8, 2026";

export default function TermsPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap page-header-inner">
          <div className="breadcrumb">Legal</div>
          <h1>
            Terms of <em>Service</em>
          </h1>
          <p>Last updated: {UPDATED}</p>
        </div>
      </section>

      <section className="form-section">
        <div className="wrap legal-copy" style={{ maxWidth: 820, margin: "0 auto", lineHeight: 1.7 }}>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the website at
            ajcommercialgroup.com (the &ldquo;Site&rdquo;) operated by AJ Commercial Group Inc. (&ldquo;AJ Commercial
            Group,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By using the Site, you agree to
            these Terms. If you do not agree, please do not use the Site.
          </p>

          <h2>Use of the Site</h2>
          <p>
            You may use the Site for lawful purposes only. You agree not to use the Site to submit false or misleading
            information, to interfere with its operation or security, to attempt unauthorized access to any system, or
            to use automated means to collect information from the Site without our permission.
          </p>

          <h2>No Professional Advice</h2>
          <p>
            Content on the Site — including market commentary, property information, valuations, and blog posts — is
            provided for general informational purposes only and does not constitute legal, tax, accounting, financial,
            or investment advice. Property details and figures are believed to be accurate but are not guaranteed and
            are subject to change, errors, omissions, prior sale, or withdrawal without notice. You should independently
            verify any information and consult your own advisors before making decisions.
          </p>

          <h2>Brokerage Services</h2>
          <p>
            AJ Commercial Group Inc. is a licensed real estate brokerage in the State of Illinois. Nothing on the Site
            creates a brokerage, agency, or fiduciary relationship. Any such relationship is established only through a
            separate written agreement signed by AJ Commercial Group and the client.
          </p>

          <h2>Submissions</h2>
          <p>
            When you submit an inquiry or other information through the Site, you represent that the information is
            accurate and that you are authorized to provide it, including any phone number you enter for text messaging.
            Your submissions are handled in accordance with our{" "}
            <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            The Site and its content — including text, graphics, logos, photographs, and layout — are owned by or
            licensed to AJ Commercial Group and are protected by intellectual property laws. You may not reproduce,
            distribute, or create derivative works from the Site without our prior written permission.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites. We are not responsible for the content, policies, or
            practices of any third-party sites, and links do not imply our endorsement.
          </p>

          <h2>Disclaimers &amp; Limitation of Liability</h2>
          <p>
            The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
            express or implied. To the fullest extent permitted by law, AJ Commercial Group will not be liable for any
            indirect, incidental, consequential, or punitive damages arising from your use of the Site or reliance on
            its content.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Illinois, without regard to its conflict-of-laws rules.
            Any dispute arising under these Terms will be subject to the exclusive jurisdiction of the state and federal
            courts located in Illinois.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will revise the &ldquo;Last updated&rdquo; date
            above. Your continued use of the Site after changes are posted constitutes acceptance of the updated Terms.
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
