"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: About */}
          <div className="footer-info">
            <Link href="/" className="footer-logo" style={{ display: "inline-block", backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "8px", alignSelf: "flex-start" }}>
              <img 
                src="/logo-transparent.png" 
                alt="Augnexis Technologies Logo" 
                style={{ height: "40px", width: "auto", display: "block" }} 
              />
            </Link>
            <p className="footer-desc">
              Augnexis Technologies is a forward-thinking digital solution provider. We connect intelligence and deliver innovation across enterprise platforms.
            </p>
            <div className="footer-socials">
              <a href="https://www.facebook.com/augnexis/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://www.instagram.com/augnexis/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="footer-title">Navigation</h3>
            <ul className="footer-links">
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/about" className="footer-link">About Us</Link></li>
              <li><Link href="/services" className="footer-link">Services</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/solutions" className="footer-link">Solutions</Link></li>
              <li><Link href="/technologies" className="footer-link">Technologies</Link></li>
              <li><Link href="/blogs" className="footer-link">Insights & Blog</Link></li>
              <li><Link href="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-newsletter">
            <h3 className="footer-title">Stay Connected</h3>
            <p className="footer-newsletter-text">
              Subscribe to receive latest digital innovation insights and tech updates.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Augnexis Technologies. All rights reserved.
          </p>
          <div className="footer-policies">
            <a href="#" className="policy-link">Privacy Policy</a>
            <a href="#" className="policy-link">Terms of Service</a>
            <a href="#" className="policy-link">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
