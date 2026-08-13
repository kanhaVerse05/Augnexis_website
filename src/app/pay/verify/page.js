"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, Home } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState("loading"); // loading, success, failed, pending
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      setErrorMsg("Order ID is missing in redirection URL");
      return;
    }

    const verifyTransaction = async () => {
      try {
        const response = await fetch("/api/payment/verify-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        if (data.status === "SUCCESS") {
          setStatus("success");
        } else if (data.status === "FAILED") {
          setStatus("failed");
          setErrorMsg("The payment attempt failed or expired. Please try again.");
        } else {
          setStatus("pending");
        }

        setPaymentDetails(data);
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
        setErrorMsg(err.message || "Could not verify payment status");
      }
    };

    verifyTransaction();
  }, [orderId]);

  return (
    <div className="glass-card" style={{ padding: "3rem 2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.98)", boxShadow: "var(--shadow-xl)" }}>
      {status === "loading" && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Loader2 size={48} className="animate-spin" style={{ color: "var(--color-blue-secondary)" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)" }}>Verifying Payment Status</h2>
          <p style={{ color: "var(--color-text-muted)" }}>Please do not close this window or press back. We are fetching your transaction details from Razorpay...</p>
        </div>
      )}

      {status === "success" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#22c55e", marginBottom: "1.5rem" }}>
            <CheckCircle2 size={64} style={{ margin: "0 auto" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-blue-primary)", marginBottom: "0.5rem" }}>Payment Successful!</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Thank you for your business. Your payment has been processed successfully.</p>

          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", backgroundColor: "rgba(0, 102, 254, 0.02)", padding: "1.5rem", textAlign: "left", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Client Name:</strong> {paymentDetails?.clientName}</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Payment Purpose:</strong> {paymentDetails?.purpose}</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Amount Paid:</strong> ₹{paymentDetails?.amount?.toFixed(2)} INR</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Order ID:</strong> {paymentDetails?.orderId}</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Transaction ID:</strong> {paymentDetails?.transactionDetails?.referenceId}</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Payment Date:</strong> {paymentDetails?.transactionDetails?.txTime}</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/" className="btn btn-primary" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              Go to Home <Home size={16} />
            </Link>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ef4444", marginBottom: "1.5rem" }}>
            <XCircle size={64} style={{ margin: "0 auto" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-blue-primary)", marginBottom: "0.5rem" }}>Payment Failed</h2>
          <p style={{ color: "#ef4444", fontWeight: "500", marginBottom: "2rem" }}>{errorMsg}</p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/pay" className="btn btn-primary" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              Try Again <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#eab308", marginBottom: "1.5rem" }}>
            <AlertCircle size={64} style={{ margin: "0 auto" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-blue-primary)", marginBottom: "0.5rem" }}>Payment Processing</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Your transaction status is currently pending confirmation from your bank.</p>

          <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", backgroundColor: "rgba(234, 179, 8, 0.02)", padding: "1.5rem", textAlign: "left", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Client Name:</strong> {paymentDetails?.clientName}</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Purpose:</strong> {paymentDetails?.purpose}</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Amount:</strong> ₹{paymentDetails?.amount?.toFixed(2)} INR</p>
            <p style={{ margin: "0", color: "var(--color-text-main)", fontSize: "0.95rem" }}><strong>Order ID:</strong> {paymentDetails?.orderId}</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/" className="btn btn-primary" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              Back to Home <Home size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PayVerifyPage() {
  return (
    <div className="payment-page" style={{ padding: "120px 0 80px 0", background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        <Suspense fallback={
          <div className="glass-card" style={{ padding: "3rem 2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.98)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
            <Loader2 size={48} className="animate-spin" style={{ color: "var(--color-blue-secondary)" }} />
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--color-blue-primary)" }}>Loading Redirection Context</h2>
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
