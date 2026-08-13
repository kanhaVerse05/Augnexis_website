import { NextResponse } from "next/server";
import { addPayment } from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, amount, purpose } = body;

    // Validate request inputs
    if (!name || !email || !phone || !amount || !purpose) {
      return NextResponse.json(
        { error: "All fields (name, email, phone, amount, purpose) are required" },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a valid positive number" },
        { status: 400 }
      );
    }

    // Razorpay requires amount in paise (minimum 100 paise = 1 INR)
    const amountPaise = Math.round(numericAmount * 100);
    if (amountPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 1.00 INR (100 paise)" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay API keys are missing on the server.");
      return NextResponse.json(
        { error: "Razorpay API configuration is missing on the server." },
        { status: 500 }
      );
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    // Create Razorpay Order
    let orderId = "";
    try {
      const orderOptions = {
        amount: amountPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`
      };
      
      const order = await razorpay.orders.create(orderOptions);
      orderId = order.id;
    } catch (rzpError) {
      console.error("Razorpay order creation call failed:", rzpError);
      return NextResponse.json(
        { error: rzpError.message || "Failed to create order on payment gateway" },
        { status: 500 }
      );
    }

    // Save payment details to database
    const newPayment = {
      id: orderId,
      clientName: name,
      email,
      phone,
      amount: numericAmount,
      purpose,
      status: "PENDING",
      paymentSessionId: orderId, // Retain compatibility with existing DB columns
      createdAt: new Date().toLocaleString(),
      updatedAt: null
    };

    await addPayment(newPayment);

    return NextResponse.json({
      success: true,
      orderId,
      amount: amountPaise,
      currency: "INR"
    });
  } catch (error) {
    console.error("Payment order creation endpoint error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
