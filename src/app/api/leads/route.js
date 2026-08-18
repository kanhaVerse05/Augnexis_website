import { NextResponse } from "next/server";
import { readLeads, writeLeads, assignLead } from "@/lib/db";
import { verifyAuth } from "@/lib/auth-helper";

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, "leads");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let leads = await readLeads();
    if (auth.role !== "SUPER_ADMIN") {
      leads = leads.filter(l => l.assignedTo === auth.username);
    }
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request, "leads");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, assignedTo } = body;

    if (action === "assign") {
      if (!id || assignedTo === undefined) {
        return NextResponse.json({ error: "Missing id or assignedTo username" }, { status: 400 });
      }

      await assignLead(id, assignedTo);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST Leads API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request, "leads");
    if (!auth) {
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
