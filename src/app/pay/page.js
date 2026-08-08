"use client";

import { useState } from "react";
import Script from "next/script";
import { ShieldCheck, CreditCard, Send, Loader2 } from "lucide-react";

export default function PayPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    purpose: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Create order on backend API
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      const { paymentSessionId, orderId, isMock, env } = data;

      // 2. Redirect to verification or open checkout modal
      if (isMock) {
        // Redirect directly to verify for mock sandbox test mode
        window.location.href = `/pay/verify?order_id=${orderId}`;
      } else {
        // Initialize Cashfree SDK and trigger checkout
        if (typeof window.Cashfree === "undefined") {
          throw new Error("Cashfree SDK not loaded. Please try again.");
        }

        const cashfree = window.Cashfree({ mode: env });
        
        const checkoutOptions = {
          paymentSessionId: paymentSessionId,
          returnUrl: `${window.location.origin}/pay/verify?order_id={order_id}`
        };

        cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            console.error("Cashfree checkout error:", result.error.message);
            setErrorMsg(result.error.message);
            setLoading(false);
          }
        });
      }
    } catch (err) {
      console.error("Payment flow error:", err);
      setErrorMsg(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />

      <div className="payment-page" style={{ padding: "120px 0 80px 0", background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)", minHeight: "100vh" }}>
        <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "rgba(0, 102, 254, 0.08)", color: "var(--color-blue-secondary)", marginBottom: "1rem" }}>
              <CreditCard size={28} />
            </div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--color-blue-primary)", letterSpacing: "-0.5px" }}>Secure Client Payment</h1>
            <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>Submit payment coordinates below to complete invoices or custom milestone fees.</p>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow-xl)" }}>
            
            {errorMsg && (
              <div style={{ padding: "1rem", backgroundColor: "#fff5f5", color: "#e53e3e", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", border: "1px solid #fed7d7", fontSize: "0.9rem", fontWeight: "500" }}>
                ✕ {errorMsg}
              </div>
            )}

            <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              <div className="form-group">
                <label className="form-label" htmlFor="name">Client Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="form-input"
                  placeholder="Enter full name or company name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-input"
                    placeholder="client@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
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

              <div className="form-group">
                <label className="form-label" htmlFor="purpose">Payment Purpose / Invoice #</label>
                <input
                  type="text"
                  name="purpose"
                  id="purpose"
                  className="form-input"
                  placeholder="e.g. Invoice #204 - E-commerce Mobile App Development"
                  value={form.purpose}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount (INR)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontWeight: "600" }}>₹</span>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="form-input"
                    style={{ paddingLeft: "30px" }}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", justifyContent: "center", padding: "14px 24px", marginTop: "1rem", display: "flex", gap: "8px", alignItems: "center" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Initiating Gateway...
                  </>
                ) : (
                  <>
                    Proceed to Secure Pay <Send size={16} />
                  </>
                )}
              </button>

            </form>

            {/* Security Trust badge */}
            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
              <ShieldCheck size={16} style={{ color: "#22c55e" }} /> Powered by Cashfree | 256-bit SSL Encrypted
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
