import { NextResponse } from "next/server";
import { getSettings, saveSettings, getJobs, getCategoryStats } from "@/lib/db-hunter";
import { runLeadHunt } from "@/lib/hunter-engine";
import { initScheduler } from "@/lib/hunter-scheduler";
import { verifyAuth } from "@/lib/auth-helper";

// Self-boots background daemon on first request
initScheduler();

export async function GET(request) {
  try {
    const auth = await verifyAuth(request, "lead_hunter");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getSettings();
    const jobs = await getJobs();
    const categoryStats = await getCategoryStats();
    
    // Redact sensitive API keys before returning to UI
    const redactedSettings = {
      location: settings.location,
      daily_lead_target: settings.daily_lead_target,
      auto_daily_hunt: settings.auto_daily_hunt,
      google_api_key: settings.google_api_key ? "••••••••••••••••" : "",
      gemini_api_key: settings.gemini_api_key ? "••••••••••••••••" : ""
    };
    
    return NextResponse.json({
      schedulerActive: globalThis.hunterSchedulerActive || false,
      settings: redactedSettings,
      jobs,
      activeLogs: globalThis.activeJobLogs || [],
      categoryStats
    });
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
    const { action, settings } = body;
    
    if (action === "save_settings") {
      const existingSettings = await getSettings();
      const updatedSettings = { ...settings };
      
      // If client sent redacted placeholder, preserve the original keys
      if (updatedSettings.google_api_key === "••••••••••••••••") {
        updatedSettings.google_api_key = existingSettings.google_api_key;
      }
      if (updatedSettings.gemini_api_key === "••••••••••••••••") {
        updatedSettings.gemini_api_key = existingSettings.gemini_api_key;
      }
      
      await saveSettings(updatedSettings);
      
      // If auto daily hunt is toggled ON, make sure the scheduler checks status
      if (updatedSettings.auto_daily_hunt) {
        initScheduler();
      }
      
      return NextResponse.json({ success: true });
    }
    
    if (action === "trigger") {
      const jobs = await getJobs();
      const runningJob = jobs.find(j => j.status === "RUNNING");
      if (runningJob) {
        return NextResponse.json({ error: "A lead hunt is already in progress." }, { status: 400 });
      }
      
      // Reset the log buffer in memory for real-time scrolling
      globalThis.activeJobLogs = [`[${new Date().toLocaleTimeString()}] Triggered Lead Hunt manually.`];
      
      // Run the hunt in the background
      runLeadHunt({
        onLog: (msg) => {
          if (!globalThis.activeJobLogs) {
            globalThis.activeJobLogs = [];
          }
          globalThis.activeJobLogs.push(msg);
        }
      }).catch(err => {
        console.error("Background lead hunt execution error:", err);
        if (globalThis.activeJobLogs) {
          globalThis.activeJobLogs.push(`[${new Date().toLocaleTimeString()}] CRITICAL RUN ERROR: ${err.message}`);
        }
      });
      
      return NextResponse.json({ success: true, message: "Lead hunt started." });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
