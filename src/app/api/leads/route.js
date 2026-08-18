import { NextResponse } from "next/server";
import { readLeads, writeLeads, assignLead, updateLeadStatus, createCrmLead, bulkAssignLeads } from "@/lib/db";
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
    const { action, id, ids, assignedTo, status, lead } = body;

    if (action === "assign") {
      if (!id || assignedTo === undefined) {
        return NextResponse.json({ error: "Missing id or assignedTo username" }, { status: 400 });
      }
      await assignLead(id, assignedTo);
      return NextResponse.json({ success: true });
    }

    if (action === "bulk_assign") {
      if (!ids || !Array.isArray(ids) || assignedTo === undefined) {
        return NextResponse.json({ error: "Missing ids array or assignedTo username" }, { status: 400 });
      }
      await bulkAssignLeads(ids, assignedTo);
      return NextResponse.json({ success: true });
    }

    if (action === "update_status") {
      if (!id || !status) {
        return NextResponse.json({ error: "Missing id or status value" }, { status: 400 });
      }
      await updateLeadStatus(id, status.toUpperCase());
      return NextResponse.json({ success: true });
    }

    if (action === "create") {
      if (!lead || !lead.name) {
        return NextResponse.json({ error: "Missing lead payload or lead.name" }, { status: 400 });
      }
      
      const newLead = {
        id: `lead_manual_${Date.now()}`,
        name: lead.name,
        companyName: lead.companyName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        subject: lead.subject || "Manual Lead Entry",
        message: lead.message || "Manual lead profile created by admin.",
        createdAt: new Date().toLocaleString(),
        assignedTo: lead.assignedTo || "",
        source: lead.source || "manual",
        status: lead.status || "NEW",
        metadata: lead.metadata || {}
      };

      await createCrmLead(newLead);
      return NextResponse.json({ success: true, lead: newLead });
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
