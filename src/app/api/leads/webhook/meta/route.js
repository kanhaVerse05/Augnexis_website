import { NextResponse } from "next/server";
import { createCrmLead } from "@/lib/db";

// GET verification for Facebook/Meta Developer Console Webhook Setup
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Standard verify token
    const VERIFY_TOKEN = "augnexis_meta_token";

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Meta Webhook Verified Successfully!");
        return new Response(challenge, { status: 200 });
      }
      return NextResponse.json({ error: "Forbidden: Token mismatch" }, { status: 403 });
    }
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST webhook payload from Facebook/Meta Lead Ads
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Meta Lead Webhook Payload Received:", JSON.stringify(body));

    // Meta Webhook returns lead_id and form_id in the payload
    // Normally, a backend then queries Facebook Graph API to fetch lead details using lead_id.
    // For webhook ease, we'll support both the actual lead details (if sent programmatically by integration/middleware)
    // and standard Facebook structure, with dynamic fallback.
    const entry = body.entry?.[0] || {};
    const changes = entry.changes?.[0] || {};
    const val = changes.value || {};
    
    const leadId = val.leadgen_id || body.lead_id || `meta_${Date.now()}`;
    const formId = val.form_id || body.form_id || "default_form";

    // Extract details if passed directly (from tools like Zapier/Make which hit this webhook with pre-parsed details)
    const name = body.name || body.full_name || "Meta Lead Ads User";
    const phone = body.phone || body.phone_number || "";
    const email = body.email || "";
    const campaign = body.campaign_name || "Meta Marketing Campaign";
    const platform = body.platform || "instagram"; // instagram, facebook

    const newLead = {
      id: leadId,
      name: name,
      phone: phone,
      email: email,
      subject: `Meta Lead Ads Inquiry (${platform})`,
      message: `Lead gen ad campaign: ${campaign}\nForm ID: ${formId}\nAd ID: ${val.ad_id || "N/A"}\nPlatform Source: ${platform}`,
      createdAt: new Date().toLocaleString(),
      assignedTo: "",
      source: "meta_ads",
      status: "NEW",
      companyName: body.company_name || "",
      metadata: {
        metaLeadId: leadId,
        formId,
        campaign,
        adId: val.ad_id || "",
        adgroupId: val.adgroup_id || "",
        rawPayload: body
      }
    };

    await createCrmLead(newLead);

    return NextResponse.json({ success: true, lead: { id: newLead.id } });
  } catch (error) {
    console.error("Meta Webhook Process Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
