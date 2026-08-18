import { NextResponse } from "next/server";
import { getLeads, getLeadDetail, updateLeadStatus, assignHunterLead } from "@/lib/db-hunter";
import { verifyAuth } from "@/lib/auth-helper";

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, "lead_hunter");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // 1. If an ID is provided, return full detail data for that specific lead
    if (id) {
      const detail = await getLeadDetail(id);
      if (!detail) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      return NextResponse.json(detail);
    }

    // 2. Otherwise return the filtered/sorted lists of all leads
    const priority = searchParams.get("priority"); // e.g. "HOT", "WARM", "COLD"
    let leads = await getLeads();

    if (auth.role !== "SUPER_ADMIN") {
      leads = leads.filter(l => l.assignedTo === auth.username);
    }

    if (priority) {
      leads = leads.filter(l => l.priority?.toUpperCase() === priority.toUpperCase());
    }

    return NextResponse.json(leads);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request, "lead_hunter");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, status, assignedTo } = body;

    if (action === "update_status") {
      if (!id || !status) {
        return NextResponse.json({ error: "Missing id or status parameters" }, { status: 400 });
      }

      // Allowed status list: NEW, CONTACTED, INTERESTED, NOT_INTERESTED
      const allowed = ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED"];
      if (!allowed.includes(status.toUpperCase())) {
        return NextResponse.json({ error: `Invalid status code: ${status}` }, { status: 400 });
      }

      await updateLeadStatus(id, status.toUpperCase());
      return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    }

    if (action === "assign") {
      if (!id || assignedTo === undefined) {
        return NextResponse.json({ error: "Missing id or assignedTo username" }, { status: 400 });
      }

      await assignHunterLead(id, assignedTo);
      return NextResponse.json({ success: true, message: `Lead assigned to ${assignedTo}` });
    }

    return NextResponse.json({ error: "Invalid post action code" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
