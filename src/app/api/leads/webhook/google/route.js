import { NextResponse } from "next/server";
import { createCrmLead } from "@/lib/db";

// POST webhook payload from Google Ads Lead Form Extension / Zapier
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Google Lead Webhook Payload Received:", JSON.stringify(body));

    // Google sends user_column_data or direct variables
    // Format sent by Google Lead Form Webhooks:
    // {
    //   "lead_id": "12345",
    //   "campaign_id": 98765,
    //   "user_column_data": [
    //     {"column_name": "Full Name", "string_value": "John Doe"},
    //     {"column_name": "User Phone", "string_value": "+16505550100"},
    //     {"column_name": "User Email", "string_value": "john@mail.com"}
    //   ]
    // }
    let name = body.name || body.full_name || "";
    let phone = body.phone || body.phone_number || "";
    let email = body.email || "";

    const userColumnData = body.user_column_data || [];
    userColumnData.forEach(item => {
      const field = item.column_name ? item.column_name.toLowerCase() : "";
      if (field.includes("name")) {
        name = item.string_value;
      } else if (field.includes("phone") || field.includes("number")) {
        phone = item.string_value;
      } else if (field.includes("email")) {
        email = item.string_value;
      }
    });

    // Fallback defaults
    if (!name) name = "Google Ads Lead User";
    
    const leadId = body.lead_id || `google_${Date.now()}`;
    const campaignId = body.campaign_id || "default_campaign";
    const campaignName = body.campaign_name || "Google Search Ads Campaign";

    const newLead = {
      id: leadId,
      name: name,
      phone: phone,
      email: email,
      subject: `Google Ads Lead Inquiry`,
      message: `Google campaign: ${campaignName}\nCampaign ID: ${campaignId}\nAd Group: ${body.adgroup_name || "N/A"}\nCreative ID: ${body.creative_id || "N/A"}`,
      createdAt: new Date().toLocaleString(),
      assignedTo: "",
      source: "google_ads",
      status: "NEW",
      companyName: body.company_name || "",
      metadata: {
        googleLeadId: leadId,
        campaignId,
        campaignName,
        adgroupName: body.adgroup_name || "",
        rawPayload: body
      }
    };

    await createCrmLead(newLead);

    return NextResponse.json({ success: true, lead: { id: newLead.id } });
  } catch (error) {
    console.error("Google Webhook Process Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
