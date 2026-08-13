"use client";

import { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CreditCard, Send, Loader2, Info } from "lucide-react";

function PayFormContent() {
  const searchParams = useSearchParams();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    purpose: ""
  });

  const [locks, setLocks] = useState({
    name: false,
    email: false,
    phone: false,
    amount: false,
    purpose: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill form from URL query parameters
  useEffect(() => {
    const nameParam = searchParams.get("name") || "";
    const emailParam = searchParams.get("email") || "";
    const phoneParam = searchParams.get("phone") || "";
    const amountParam = searchParams.get("amount") || "";
    const purposeParam = searchParams.get("purpose") || "";

    setForm({
      name: nameParam,
      email: emailParam,
      phone: phoneParam,
      amount: amountParam,
      purpose: purposeParam
    });

    setLocks({
      name: !!nameParam,
      email: !!emailParam,
      phone: !!phoneParam,
      amount: !!amountParam,
      purpose: !!purposeParam
    });
  }, [searchParams]);

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

      // 2. Initialize Razorpay SDK and trigger checkout
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded. Please try again.");
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TPH0ZUX3RK4QLa";

      const options = {
        key: keyId,
        amount: data.amount, // Already in paise from backend response
        currency: "INR",
        name: "Augnexis Technologies",
        description: form.purpose,
        order_id: data.orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/payment/verify-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              // Redirect to success page
              window.location.href = `/pay/verify?order_id=${data.orderId}`;
            } else {
              const verifyData = await verifyRes.json();
              throw new Error(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            setErrorMsg(err.message);
            setLoading(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        notes: {
          purpose: form.purpose
        },
        theme: {
          color: "#0066fe" // Slate blue matching the theme
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Razorpay payment checkout dismissed by client.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        console.error("Razorpay payment failure:", resp.error);
        setErrorMsg(`Payment Failed: ${resp.error.description}`);
        setLoading(false);
      });
      
      rzp.open();

    } catch (err) {
      console.error("Payment flow error:", err);
      setErrorMsg(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const hasFixedParams = locks.amount || locks.purpose;

  return (
    <div className="glass-card" style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow-xl)" }}>
      
      {hasFixedParams && (
        <div style={{ display: "flex", gap: "10px", padding: "1rem", backgroundColor: "rgba(0, 102, 254, 0.04)", border: "1px solid rgba(0, 102, 254, 0.15)", color: "var(--color-blue-primary)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.85rem", lineHeight: "1.5" }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Fixed Payment Link:</strong> Some fields are pre-configured by Augnexis Technologies and cannot be modified.
          </div>
        </div>
      )}

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
            readOnly={locks.name}
            style={locks.name ? { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" } : {}}
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
              readOnly={locks.email}
              style={locks.email ? { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" } : {}}
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
              readOnly={locks.phone}
              style={locks.phone ? { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" } : {}}
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
            readOnly={locks.purpose}
            style={locks.purpose ? { backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" } : {}}
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
              style={locks.amount ? { paddingLeft: "30px", backgroundColor: "#f3f4f6", cursor: "not-allowed", color: "#6b7280" } : { paddingLeft: "30px" }}
              placeholder="0.00"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              readOnly={locks.amount}
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
        <ShieldCheck size={16} style={{ color: "#22c55e" }} /> Powered by Razorpay | 256-bit SSL Encrypted
      </div>

    </div>
  );
}

export default function PayPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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

          <Suspense fallback={
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto", color: "var(--color-blue-secondary)" }} />
              <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>Loading payment config...</p>
            </div>
          }>
            <PayFormContent />
          </Suspense>

        </div>
      </div>
    </>
  );
}
