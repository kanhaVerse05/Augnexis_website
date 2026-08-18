import { NextResponse } from "next/server";
import { readPayments } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-helper";

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, "payments");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read payments list from the database
    const payments = await readPayments();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Failed to read payments list:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
