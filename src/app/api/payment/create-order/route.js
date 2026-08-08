import { NextResponse } from "next/server";
import { addPayment } from "@/lib/db";

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

    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const customerId = `cust_${Date.now()}`;

    // Get Cashfree credentials from environment variables
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "sandbox";

    const cashfreeUrl = env === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // Host domain determination for return URL
    const host = request.headers.get("host") || "augnexis.tech";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    let paymentSessionId = "";
    
    // Call Cashfree API if keys are provided
    if (appId && secretKey && !secretKey.includes("PLACEHOLDER")) {
      const response = await fetch(cashfreeUrl, {
        method: "POST",
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_amount: numericAmount,
          order_currency: "INR",
          order_id: orderId,
          customer_details: {
            customer_id: customerId,
            customer_name: name,
            customer_email: email,
            customer_phone: phone
          },
          order_meta: {
            return_url: `${baseUrl}/pay/verify?order_id={order_id}`
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cashfree Order creation failed:", errorData);
        return NextResponse.json(
          { error: errorData.message || "Failed to create order on Cashfree" },
          { status: 500 }
        );
      }

      const orderData = await response.json();
      paymentSessionId = orderData.payment_session_id;
    } else {
      // Mock paymentSessionId for local testing if credentials are not configured yet
      console.warn("Cashfree keys are not configured or contain placeholders. Running in local mock mode.");
      paymentSessionId = `mock_session_${Date.now()}`;
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
      paymentSessionId,
      createdAt: new Date().toLocaleString(),
      updatedAt: null
    };

    await addPayment(newPayment);

    return NextResponse.json({
      success: true,
      orderId,
      paymentSessionId,
      env: env === "production" ? "production" : "sandbox",
      isMock: !appId || !secretKey || secretKey.includes("PLACEHOLDER")
    });
  } catch (error) {
    console.error("Payment order creation endpoint error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
