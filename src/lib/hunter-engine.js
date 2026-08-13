import { 
  getSettings, 
  saveLeadHuntResults, 
  getCategoryStats,
  getLeads
} from "./db-hunter.js";
import { getDiscoveryProvider } from "./discovery-provider.js";
import { analyzeWebsite } from "./website-analyzer.js";
import { analyzeWithGemini } from "./gemini-service.js";

// List of useful business categories for website client hunting
const CATEGORY_POOL = [
  "Interior Designers",
  "Real Estate Agency",
  "Gyms",
  "Salons",
  "Dental Clinics",
  "Coaching Institutes",
  "Travel Agencies",
  "Restaurants",
  "Hotels",
  "Lawyers",
  "CA Firms",
  "Architects",
  "Construction Companies",
  "Manufacturers",
  "Wedding Planners",
  "Clinics",
  "Local Service Businesses"
];

/**
 * Normalizes website domain to assist with deduplication
 * @param {string} urlStr 
 * @returns {string|null} Normalized domain
 */
function normalizeDomain(urlStr) {
  if (!urlStr) return null;
  try {
    let domain = urlStr.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//i, "");
    domain = domain.replace(/^www\./i, "");
    const slashIdx = domain.indexOf("/");
    if (slashIdx !== -1) {
      domain = domain.substring(0, slashIdx);
    }
    return domain || null;
  } catch (_) {
    return null;
  }
}

/**
 * Selects categories autonomously using weighted historical scores and discovery counts.
 * @param {number} count - Number of categories to select
 * @returns {Promise<Array<string>>} Selected categories
 */
async function selectCategoriesAutonomously(count = 2, logs = []) {
  try {
    const stats = await getCategoryStats();
    const statsMap = {};
    stats.forEach(s => {
      statsMap[s.category] = s;
    });

    logs.push("Autonomous Category Selection: Evaluating category scores...");
    
    // Map each category in the pool to a weight
    const weightedCategories = CATEGORY_POOL.map(category => {
      let weight = 1.0;
      const stat = statsMap[category];
      
      if (stat) {
        // Boost based on average lead score
        weight += (stat.averageScore / 100.0) * 2.0;
        // Boost based on proportion of HOT leads
        if (stat.leadsFound > 0) {
          weight += (stat.hotLeads / stat.leadsFound) * 3.0;
        }
      } else {
        // Exploration bonus for unexplored categories
        weight += 1.5;
      }
      
      return { category, weight };
    });

    // Simple weighted random selection without replacement
    const selected = [];
    const pool = [...weightedCategories];
    
    for (let i = 0; i < count && pool.length > 0; i++) {
      const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
      let rand = Math.random() * totalWeight;
      
      let selectedIdx = 0;
      for (let j = 0; j < pool.length; j++) {
        rand -= pool[j].weight;
        if (rand <= 0) {
          selectedIdx = j;
          break;
        }
      }
      
      selected.push(pool[selectedIdx].category);
      logs.push(`Selected category: "${pool[selectedIdx].category}" (Weight: ${pool[selectedIdx].weight.toFixed(2)})`);
      pool.splice(selectedIdx, 1);
    }

    return selected;
  } catch (err) {
    console.error("Failed to select categories autonomously, falling back to random:", err);
    logs.push("Autonomous selection failed. Falling back to random categories.");
    // Fallback: pick random categories
    const shuffled = [...CATEGORY_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

/**
 * Orchestrates a complete lead hunting run.
 * @param {Object} options 
 * @param {Function} options.onLog - Optional callback for live progress logging
 * @returns {Promise<Object>} Completed job details
 */
export async function runLeadHunt({ onLog = () => {} } = {}) {
  const job = {
    id: "job_" + Math.random().toString(36).substring(2, 11),
    runAt: new Date().toISOString(),
    status: "RUNNING",
    leadsFound: 0,
    hotLeads: 0,
    categoriesSearched: [],
    location: "Delhi NCR",
    logOutput: ""
  };

  const logs = [];
  const log = (msg) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logs.push(formatted);
    console.log(formatted);
    onLog(formatted);
  };

  log(`Starting Lead Hunt Job: ${job.id}`);

  try {
    // 1. Load settings & API keys
    const settings = await getSettings();
    const { location, daily_lead_target, google_api_key, gemini_api_key } = settings;
    job.location = location;

    log(`Configuration - Location: ${location}, Daily Target: ${daily_lead_target}`);

    if (!gemini_api_key) {
      throw new Error("Gemini AI API Key is missing. Lead Hunt aborted.");
    }

    // Resolve the active discovery provider based on configuration settings
    const provider = getDiscoveryProvider(settings);
    log(`Active Discovery Provider: ${provider.constructor.name}`);

    // 2. Select categories
    // Calculate how many categories to search (usually 2, up to 3)
    const categoryCount = daily_lead_target > 30 ? 3 : 2;
    const categories = await selectCategoriesAutonomously(categoryCount, logs);
    job.categoriesSearched = categories;
    log(`Categories to hunt: ${categories.join(", ")}`);

    // Load existing leads for deduplication
    const existingLeads = await getLeads();
    const existingPlaceIds = new Set(existingLeads.map(l => l.business?.placeId).filter(Boolean));
    const existingDomains = new Set(existingLeads.map(l => normalizeDomain(l.business?.website)).filter(Boolean));

    const limitPerCategory = Math.ceil(daily_lead_target / categories.length);
    const discoveredItems = [];

    // 3. Search and process each category
    for (const category of categories) {
      log(`Searching web for "${category} in ${location}" using ${provider.constructor.name}...`);
      let places = [];
      try {
        places = await provider.discover(`${category} in ${location}`, limitPerCategory, settings);
        log(`Found ${places.length} businesses in "${category}" category.`);
      } catch (err) {
        log(`Error searching for ${category}: ${err.message}`);
        continue;
      }

      for (const place of places) {
        // Generate a unique, deterministic Place ID for leads lacking a native Google Place ID (e.g. raw web search grounding)
        const cleanName = place.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanAddr = place.formattedAddress.toLowerCase().replace(/[^a-z0-9]/g, "");
        const finalPlaceId = place.placeId || `gemini_${cleanName}_${cleanAddr}`.substring(0, 250);
        place.placeId = finalPlaceId;

        // Deduplicate
        if (existingPlaceIds.has(place.placeId)) {
          log(`Skipping "${place.name}" - Place ID already processed.`);
          continue;
        }

        const normalizedDom = normalizeDomain(place.website);
        if (normalizedDom && existingDomains.has(normalizedDom)) {
          log(`Skipping "${place.name}" - Website domain (${normalizedDom}) already processed.`);
          continue;
        }

        log(`Processing: "${place.name}" (Rating: ${place.rating || "N/A"}, Reviews: ${place.userRatingsTotal || 0})`);

        // 4. Website Auditor - Check website status
        log(`Analyzing website URL: ${place.website || "NONE"}`);
        let audit = null;
        try {
          audit = await analyzeWebsite(place.website);
          log(`Website Audit Status: ${audit.status} (UX: ${audit.uxQualityScore})`);
        } catch (err) {
          log(`Error auditing website for ${place.name}: ${err.message}`);
          continue;
        }

        // 5. Gemini AI - Think, analyze, score, explain
        log(`Running Gemini AI evaluation for "${place.name}"...`);
        let aiResult = null;
        try {
          aiResult = await analyzeWithGemini(place, audit, gemini_api_key);
          const score = aiResult.lead_score !== undefined ? aiResult.lead_score : aiResult.score;
          const opp = aiResult.website_opportunity !== undefined ? aiResult.website_opportunity : aiResult.opportunity;
          log(`Evaluation Result: Score: ${score}/100, Priority: ${aiResult.priority}, Opportunity: ${opp}`);
        } catch (err) {
          log(`Error running Gemini AI for ${place.name}: ${err.message}`);
          continue;
        }

        // Generate IDs
        const businessId = "biz_" + Math.random().toString(36).substring(2, 11);
        const leadId = "lead_" + Math.random().toString(36).substring(2, 11);
        const auditId = "aud_" + Math.random().toString(36).substring(2, 11);
        const analysisId = "ana_" + Math.random().toString(36).substring(2, 11);

        // Prep models for db saving (Mapping API schema keys to database schema keys)
        const businessRecord = {
          id: businessId,
          name: place.name,
          placeId: place.placeId,
          website: place.website,
          rating: place.rating,
          userRatingsTotal: place.userRatingsTotal,
          categories: place.categories,
          formattedAddress: place.formattedAddress,
          phoneNumber: place.phoneNumber,
          sourceType: place.sourceType || "google_places",
          sourceUrls: place.sourceUrls || []
        };

        const leadRecord = {
          id: leadId,
          score: aiResult.lead_score !== undefined ? aiResult.lead_score : aiResult.score,
          priority: aiResult.priority,
          opportunity: aiResult.website_opportunity !== undefined ? aiResult.website_opportunity : aiResult.opportunity,
          status: "NEW"
        };

        const auditRecord = {
          id: auditId,
          websiteUrl: audit.websiteUrl || place.website,
          isHttps: audit.isHttps,
          isMobileFriendly: audit.isMobileFriendly,
          pageTitle: audit.pageTitle,
          metaDescription: audit.metaDescription,
          h1: audit.h1,
          contactInfoFound: audit.contactInfoFound,
          ctaFound: audit.ctaFound,
          performanceScore: audit.performanceScore,
          uxQualityScore: audit.uxQualityScore,
          rawMetrics: audit.rawMetrics
        };

        const aiRecord = {
          id: analysisId,
          score: aiResult.lead_score !== undefined ? aiResult.lead_score : aiResult.score,
          priority: aiResult.priority,
          opportunity: aiResult.website_opportunity !== undefined ? aiResult.website_opportunity : aiResult.opportunity,
          reason: aiResult.reason,
          painPoints: aiResult.pain_points || aiResult.painPoints || [],
          recommendedService: aiResult.recommended_service || aiResult.recommendedService,
          salesAngle: aiResult.sales_angle || aiResult.salesAngle,
          personalizedPitch: aiResult.personalized_pitch || aiResult.personalizedPitch
        };

        discoveredItems.push({
          business: businessRecord,
          lead: leadRecord,
          websiteAudit: auditRecord,
          aiAnalysis: aiRecord
        });

        job.leadsFound += 1;
        if (aiResult.priority === "HOT") {
          job.hotLeads += 1;
        }

        // Add to active set to avoid intra-run duplication
        existingPlaceIds.add(place.placeId);
        if (normalizedDom) {
          existingDomains.add(normalizedDom);
        }
      }
    }

    job.status = "COMPLETED";
    job.logOutput = logs.join("\n");
    
    // Save to Database
    log(`Saving ${discoveredItems.length} new leads to database...`);
    await saveLeadHuntResults(job, discoveredItems);
    log(`Lead hunt completed successfully! Found ${job.leadsFound} leads (${job.hotLeads} HOT).`);
    
    return job;
  } catch (err) {
    log(`CRITICAL ERROR DURING RUN: ${err.message}`);
    job.status = "FAILED";
    job.logOutput = logs.join("\n");
    
    // Save failed job status
    try {
      await saveLeadHuntResults(job, []);
    } catch (saveErr) {
      console.error("Failed to save error job status:", saveErr);
    }
    
    throw err;
  }
}
