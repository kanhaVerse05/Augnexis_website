import { getSettings, getJobs } from "./db-hunter.js";
import { runLeadHunt } from "./hunter-engine.js";

// Use globalThis to persist the scheduler state across Hot Module Reloads (HMR) in Next.js development mode
if (!globalThis.hunterSchedulerActive) {
  globalThis.hunterSchedulerActive = false;
}
if (!globalThis.hunterSchedulerInterval) {
  globalThis.hunterSchedulerInterval = null;
}

/**
 * Initializes the background scheduling check loop.
 * Safe to call multiple times; ignores requests if the scheduler is already running.
 */
export function initScheduler() {
  if (globalThis.hunterSchedulerActive) {
    return;
  }

  console.log("[Scheduler] Starting Lead Hunter background daemon...");
  globalThis.hunterSchedulerActive = true;

  // Run the check immediately on startup
  checkAndRunDailyHunt();

  // Run a check once every hour (3600000 ms)
  globalThis.hunterSchedulerInterval = setInterval(() => {
    checkAndRunDailyHunt();
  }, 1000 * 60 * 60);
}

/**
 * Evaluates settings and job logs to decide if a daily lead hunt should be executed.
 */
async function checkAndRunDailyHunt() {
  try {
    const settings = await getSettings();
    
    if (!settings.auto_daily_hunt) {
      console.log("[Scheduler] Auto Daily Hunt is OFF in settings. Skipping background run.");
      return;
    }

    if (!settings.gemini_api_key) {
      console.warn("[Scheduler] Gemini API Key is missing. Background run aborted.");
      return;
    }

    // Retrieve previous jobs list to verify timing
    const jobs = await getJobs();
    const completedJobs = jobs.filter(j => j.status === "COMPLETED");

    if (completedJobs.length > 0) {
      const lastRun = new Date(completedJobs[0].runAt).getTime();
      const now = Date.now();
      const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

      // Default: Run once every 24 hours
      if (hoursSinceLastRun < 24) {
        const hoursLeft = (24 - hoursSinceLastRun).toFixed(1);
        console.log(`[Scheduler] Daily hunt was completed recently. Next run in ${hoursLeft} hours.`);
        return;
      }
    }

    console.log("[Scheduler] No completed jobs in past 24h. Initializing background daily lead hunt...");
    
    // Execute asynchronously to avoid blocking
    runLeadHunt().then((job) => {
      console.log(`[Scheduler] Background daily lead hunt finished successfully. Found ${job.leadsFound} leads.`);
    }).catch((err) => {
      console.error("[Scheduler] Background daily lead hunt failed:", err);
    });

  } catch (err) {
    console.error("[Scheduler] Error checking daily hunt schedule:", err);
  }
}
