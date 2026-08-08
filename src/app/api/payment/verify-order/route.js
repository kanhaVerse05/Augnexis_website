import { NextResponse } from "next/server";
import { readPayments, updatePaymentStatus } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Get current payment record from the database
    const payments = await readPayments();
    const payment = payments.find((p) => p.id === orderId);

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Get credentials
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "sandbox";

    let finalStatus = "PENDING";
    let transactionDetails = {};

    // Check if running in mock mode
    const isMock = payment.paymentSessionId.startsWith("mock_session_") || !appId || !secretKey || secretKey.includes("PLACEHOLDER");

    if (isMock) {
      // Mock success for testing purposes
      finalStatus = "SUCCESS";
      transactionDetails = {
        paymentGateway: "Cashfree (Mock Sandbox)",
        paymentMode: "UPI (Mock)",
        referenceId: `ref_mock_${Date.now()}`,
        txTime: new Date().toLocaleString()
      };
      await updatePaymentStatus(orderId, "SUCCESS");
    } else {
      // Call Cashfree verification API
      const cashfreeUrl = env === "production"
        ? `https://api.cashfree.com/pg/orders/${orderId}`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

      const response = await fetch(cashfreeUrl, {
        method: "GET",
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        console.error("Cashfree order verification failed:", await response.text());
        return NextResponse.json({ error: "Verification failed on payment gateway" }, { status: 500 });
      }

      const orderData = await response.json();
      const gatewayStatus = orderData.order_status; // PAID, FAILED, ACTIVE, EXPIRED, etc.

      if (gatewayStatus === "PAID") {
        finalStatus = "SUCCESS";
      } else if (gatewayStatus === "FAILED" || gatewayStatus === "EXPIRED") {
        finalStatus = "FAILED";
      } else {
        finalStatus = "PENDING";
      }

      await updatePaymentStatus(orderId, finalStatus);
      transactionDetails = {
        paymentGateway: "Cashfree",
        paymentMode: orderData.payment_splits?.[0]?.payment_method || "Online",
        referenceId: orderData.cf_order_id || "",
        txTime: orderData.created_at || ""
      };
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: finalStatus,
      clientName: payment.clientName,
      amount: payment.amount,
      purpose: payment.purpose,
      transactionDetails
    });
  } catch (error) {
    console.error("Payment order verification endpoint error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
