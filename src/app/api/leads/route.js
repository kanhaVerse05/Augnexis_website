import { NextResponse } from "next/server";
import { readLeads, writeLeads } from "@/lib/db";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== "admin-secret-token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await readLeads();
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== "admin-secret-token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let leads = await readLeads();
    leads = leads.filter(l => l.id !== id);
    await writeLeads(leads);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
