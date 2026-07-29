import { NextResponse } from "next/server";
import { readLeads, writeLeads } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !phone || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const leads = await readLeads();
    const newLead = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      subject,
      message,
      createdAt: new Date().toLocaleString()
    };

    leads.unshift(newLead);
    await writeLeads(leads);

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
