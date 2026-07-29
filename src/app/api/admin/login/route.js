import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Static password validation (e.g. admin123)
    if (password === "admin123") {
      return NextResponse.json({ success: true, token: "admin-secret-token" });
    } else {
      return NextResponse.json({ error: "Invalid password credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
