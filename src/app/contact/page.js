"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setSubmitted(true);
        setForm({ name: "", phone: "", email: "", subject: "", message: "" });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        alert("Inquiry submission failed. Please check the fields and try again.");
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="sub-title">GET IN TOUCH</span>
          <h1 className="page-header-title">Connect With Our Team</h1>
          <p className="page-header-desc">
            Ready to build a premium web app or AI system? Let's discuss your project constraints and technical parameters.
          </p>
        </div>
      </div>

      {/* Contact Grid Section */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact details */}
            <div className="contact-info-list">
              <div>
                <span className="sub-title">COORDINATES</span>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--color-blue-deep)', marginBottom: '1.5rem' }}>Office Information</h2>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Mail size={22} />
                </div>
                <div className="contact-info-text">
                  <h3>Email Enquiries</h3>
                  <a href="mailto:info@augnexis.tech">info@augnexis.tech</a>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>We reply within 24 hours</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Phone size={22} />
                </div>
                <div className="contact-info-text">
                  <h3>Direct Calling</h3>
                  <a href="tel:+919540252590">+91 9540252590</a>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>Call or WhatsApp anytime</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MapPin size={22} />
                </div>
                <div className="contact-info-text">
                  <h3>Office Address</h3>
                  <p>B - 155, Sainik Nagar,<br />Uttam Nagar West, Delhi - 110059</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Clock size={22} />
                </div>
                <div className="contact-info-text">
                  <h3>Operating Hours</h3>
                  <p>Monday - Saturday: 10:00 AM - 7:00 PM<br />Sunday: Closed</p>
                </div>
              </div>

              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '240px', border: '1px solid var(--color-border)', marginTop: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" 
                  alt="Augnexis Technologies Office" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Interactive Form */}
            <div className="contact-form-container">
              {submitted ? (
                <div className="form-success-message">
                  <h3>✓ Thank you for reaching out!</h3>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                    Your consultation query has been logged. Our system architect will email or call you within 24 business hours to set up a meeting schedule.
                  </p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="form-input"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Contact Number</label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="form-input"
                        placeholder="9540252590"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="form-input"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        className="form-input"
                        placeholder="Project details, AI consulting, etc."
                        value={form.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Project Description</label>
                    <textarea
                      name="message"
                      id="message"
                      className="form-input form-textarea"
                      placeholder="Outline your project timeline, requirements, and constraints..."
                      value={form.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Submit Query <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
