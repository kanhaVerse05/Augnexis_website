import { NextResponse } from "next/server";
import { readPayments } from "@/lib/db";

export async function GET(request) {
  try {
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
