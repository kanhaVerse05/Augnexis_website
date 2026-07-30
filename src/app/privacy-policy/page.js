import Link from "next/link";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Augnexis Technologies",
  description: "Read the privacy policy of Augnexis Technologies. Learn how we collect, protect, and handle your personal data and lead information in compliance with global standards.",
};

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page" style={{ padding: "120px 0 80px 0", background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)" }}>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Header Hero */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(0, 102, 254, 0.08)", color: "var(--color-blue-secondary)", marginBottom: "1rem" }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-blue-primary)", letterSpacing: "-0.5px" }}>Privacy Policy</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>Last Updated: July 30, 2026</p>
        </div>

        {/* Card Body */}
        <div className="glass-card" style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow-md)" }}>
          
          <p style={{ fontSize: "1.05rem", lineHeight: "1.7", color: "var(--color-text-main)", marginBottom: "2rem" }}>
            At <strong>Augnexis Technologies</strong>, accessible from <Link href="/" style={{ color: "var(--color-blue-secondary)", textDecoration: "none", fontWeight: "600" }}>https://augnexis.tech</Link>, one of our main priorities is the privacy of our visitors and clients. This Privacy Policy document contains types of information that is collected and recorded by Augnexis Technologies and how we use it, particularly concerning lead generation and consulting inquiry forms.
          </p>

          <hr style={{ border: "0", borderTop: "1px solid var(--color-border)", margin: "2rem 0" }} />

          {/* Section 1 */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Lock size={20} style={{ color: "var(--color-blue-secondary)" }} /> 1. Information We Collect
            </h2>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-main)", marginBottom: "1rem" }}>
              If you contact us directly or submit an inquiry through our Meta lead ads, website forms, or consultation inquiries, we may collect the following personal details:
            </p>
            <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.8", color: "var(--color-text-main)", marginBottom: "1rem" }}>
              <li><strong>Contact Information:</strong> Full Name, Email Address, and Phone Number.</li>
              <li><strong>Project Specifications:</strong> Subject of inquiry, company name, target industry, and project descriptions.</li>
              <li><strong>Technical Logs:</strong> IP address, browser type, and interaction metrics collected automatically via cookies.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={20} style={{ color: "var(--color-blue-secondary)" }} /> 2. How We Use Your Information
            </h2>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-main)", marginBottom: "1rem" }}>
              We use the collected information to deliver, optimize, and secure our consulting services. Specifically, we use your data to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.8", color: "var(--color-text-main)", marginBottom: "1rem" }}>
              <li>Process and follow up on business leads, inquiries, and consulting requests.</li>
              <li>Contact you via phone, WhatsApp, or email to schedule business discussions.</li>
              <li>Analyze user traffic patterns to improve our website layout and application usability.</li>
              <li>Prevent fraudulent submissions, spam requests, and protect against security breaches.</li>
            </ul>
            <p style={{ fontStyle: "italic", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
              Note: We do not sell, rent, share, or trade your personal information with third-party advertisers or brokers.
            </p>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={20} style={{ color: "var(--color-blue-secondary)" }} /> 3. Data Protection & Security
            </h2>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-main)" }}>
              We implement robust physical, logical, and electronic security measures to safeguard your personal data. All data transmissions are encrypted using standard SSL/TLS tunnels. Customer leads are stored securely on our database server, which is protected behind access-restricted firewalls.
            </p>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)", marginBottom: "1rem" }}>
              4. Cookies and Web Beacons
            </h2>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-main)" }}>
              Like any other website, Augnexis Technologies uses 'cookies' to store visitors' preferences and browser configuration to optimize their web experience. You can choose to disable cookies through your individual browser options.
            </p>
          </div>

          {/* Section 5 */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)", marginBottom: "1rem" }}>
              5. Your Privacy Rights
            </h2>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-main)", marginBottom: "1rem" }}>
              In accordance with data protection regulations, you hold the following rights:
            </p>
            <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.8", color: "var(--color-text-main)" }}>
              <li><strong>Access:</strong> The right to request copies of your personal data.</li>
              <li><strong>Correction:</strong> The right to request correction of any inaccurate information.</li>
              <li><strong>Erasure:</strong> The right to request that we delete your personal lead data from our records.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div style={{ marginBottom: "0" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)", marginBottom: "1rem" }}>
              6. Contact Information
            </h2>
            <p style={{ lineHeight: "1.6", color: "var(--color-text-main)", marginBottom: "1.5rem" }}>
              If you have any questions or require more information about our Privacy Policy, do not hesitate to contact us:
            </p>
            <div style={{ backgroundColor: "rgba(0, 102, 254, 0.04)", border: "1px solid rgba(0, 102, 254, 0.1)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-main)" }}><strong>Company Name:</strong> Augnexis Technologies</p>
              <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-main)" }}><strong>Official Email:</strong> <a href="mailto:info@augnexis.tech" style={{ color: "var(--color-blue-secondary)", textDecoration: "none" }}>info@augnexis.tech</a></p>
              <p style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-main)" }}><strong>Phone Number:</strong> +91 9540252590</p>
              <p style={{ margin: "0", color: "var(--color-text-main)" }}><strong>Office Address:</strong> B - 155, Sainik Nagar, Uttam Nagar West, New Delhi, 110059</p>
            </div>
          </div>

        </div>

        {/* Bottom Back Button */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/" style={{ color: "var(--color-blue-secondary)", textDecoration: "none", fontSize: "0.95rem", fontWeight: "600" }}>
            ← Back to Home Page
          </Link>
        </div>

      </div>
    </div>
  );
}
