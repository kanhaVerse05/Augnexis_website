import { NextResponse } from "next/server";
import { readPayments, updatePaymentStatus } from "@/lib/db";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    const finalOrderId = razorpay_order_id || orderId;

    if (!finalOrderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Retrieve payment record from database
    const payments = await readPayments();
    const payment = payments.find((p) => p.id === finalOrderId);

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("Razorpay key secret is missing on the server.");
      return NextResponse.json({ error: "Razorpay secret is not configured" }, { status: 500 });
    }

    let finalStatus = "PENDING";
    let transactionDetails = {};

    // 1. If we have payment details from checkout response, verify the signature
    if (razorpay_payment_id && razorpay_signature) {
      const text = finalOrderId + "|" + razorpay_payment_id;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex");

      if (generatedSignature === razorpay_signature) {
        finalStatus = "SUCCESS";
        transactionDetails = {
          paymentGateway: "Razorpay",
          paymentMode: "Online",
          referenceId: razorpay_payment_id,
          txTime: new Date().toLocaleString()
        };
        await updatePaymentStatus(finalOrderId, "SUCCESS");
      } else {
        console.error("Razorpay Signature mismatch. Expected:", generatedSignature, "Got:", razorpay_signature);
        finalStatus = "FAILED";
        await updatePaymentStatus(finalOrderId, "FAILED");
        return NextResponse.json({ error: "Signature verification failed. Potential tampering." }, { status: 400 });
      }
    } else {
      // 2. Fallback check: If the signatures are not supplied, poll Razorpay API directly
      console.log(`Checking order status directly from Razorpay API for: ${finalOrderId}`);
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const response = await fetch(`https://api.razorpay.com/v1/orders/${finalOrderId}`, {
          headers: {
            "Authorization": `Basic ${auth}`
          }
        });
        
        if (response.ok) {
          const orderData = await response.json();
          if (orderData.status === "paid") {
            finalStatus = "SUCCESS";
            transactionDetails = {
              paymentGateway: "Razorpay",
              paymentMode: "Online",
              referenceId: orderData.id,
              txTime: new Date().toLocaleString()
            };
            await updatePaymentStatus(finalOrderId, "SUCCESS");
          } else if (orderData.status === "attempted") {
            finalStatus = "PENDING";
          } else {
            finalStatus = "FAILED";
            await updatePaymentStatus(finalOrderId, "FAILED");
          }
        } else {
          console.error("Razorpay order poll failed:", await response.text());
        }
      } catch (err) {
        console.error("Error executing fallback order poll on Razorpay:", err);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
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
