import { Pool } from "pg";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BIZ_FILE = path.join(DATA_DIR, "hunter_businesses.json");
const LEADS_FILE = path.join(DATA_DIR, "hunter_leads.json");
const AUDITS_FILE = path.join(DATA_DIR, "hunter_website_audits.json");
const ANALYSES_FILE = path.join(DATA_DIR, "hunter_ai_analyses.json");
const ACTIVITIES_FILE = path.join(DATA_DIR, "hunter_lead_activities.json");
const JOBS_FILE = path.join(DATA_DIR, "hunter_search_jobs.json");
const SETTINGS_FILE = path.join(DATA_DIR, "hunter_settings.json");

// Connection Pool (only if DATABASE_URL is set)
let pool = null;
if (process.env.DATABASE_URL) {
  const connectionString = process.env.DATABASE_URL;
  const requireSSL = connectionString.includes("sslmode=require") || connectionString.includes("ssl=true");
  pool = new Pool({
    connectionString,
    ssl: requireSSL ? { rejectUnauthorized: false } : false
  });
}

function initLocalDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const files = [BIZ_FILE, LEADS_FILE, AUDITS_FILE, ANALYSES_FILE, ACTIVITIES_FILE, JOBS_FILE];
  for (const f of files) {
    if (!fs.existsSync(f)) {
      fs.writeFileSync(f, JSON.stringify([], null, 2), "utf-8");
    }
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      location: "Delhi NCR",
      daily_lead_target: 50,
      auto_daily_hunt: true,
      google_api_key: "",
      gemini_api_key: ""
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), "utf-8");
  }
}

let dbInitialized = false;
async function initPG() {
  if (dbInitialized || !pool) return;
  let client = null;
  try {
    client = await pool.connect();
    
    // Create hunter_businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_businesses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        place_id VARCHAR(255) UNIQUE NOT NULL,
        website VARCHAR(500),
        rating NUMERIC,
        user_ratings_total INTEGER,
        types TEXT[],
        formatted_address TEXT,
        phone_number VARCHAR(50),
        source_type VARCHAR(100),
        source_urls TEXT[],
        created_at VARCHAR(100) NOT NULL,
        last_seen_at VARCHAR(100) NOT NULL
      );
    `);
    
    // Add columns dynamically if not created earlier
    await client.query("ALTER TABLE hunter_businesses ADD COLUMN IF NOT EXISTS source_type VARCHAR(100);");
    await client.query("ALTER TABLE hunter_businesses ADD COLUMN IF NOT EXISTS source_urls TEXT[];");
    
    // Create hunter_leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_leads (
        id VARCHAR(50) PRIMARY KEY,
        business_id VARCHAR(50) REFERENCES hunter_businesses(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        priority VARCHAR(50) NOT NULL,
        opportunity VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        first_discovered_at VARCHAR(100) NOT NULL,
        last_seen_at VARCHAR(100) NOT NULL,
        last_analyzed_at VARCHAR(100) NOT NULL
      );
    `);
    
    // Create hunter_website_audits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_website_audits (
        id VARCHAR(50) PRIMARY KEY,
        business_id VARCHAR(50) REFERENCES hunter_businesses(id) ON DELETE CASCADE,
        website_url VARCHAR(500),
        is_https BOOLEAN,
        is_mobile_friendly BOOLEAN,
        page_title TEXT,
        meta_description TEXT,
        h1 TEXT,
        contact_info_found JSONB,
        cta_found BOOLEAN,
        performance_score INTEGER,
        ux_quality_score TEXT,
        raw_metrics JSONB,
        audited_at VARCHAR(100) NOT NULL
      );
    `);
    
    // Create hunter_ai_analyses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_ai_analyses (
        id VARCHAR(50) PRIMARY KEY,
        business_id VARCHAR(50) REFERENCES hunter_businesses(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        priority VARCHAR(50) NOT NULL,
        opportunity VARCHAR(50) NOT NULL,
        reason TEXT,
        pain_points TEXT[],
        recommended_service TEXT,
        sales_angle TEXT,
        personalized_pitch TEXT,
        analyzed_at VARCHAR(100) NOT NULL
      );
    `);
    
    // Add column if it was not created earlier
    await client.query("ALTER TABLE hunter_ai_analyses ADD COLUMN IF NOT EXISTS pain_points TEXT[];");
    
    // Create hunter_lead_activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_lead_activities (
        id VARCHAR(50) PRIMARY KEY,
        lead_id VARCHAR(50) REFERENCES hunter_leads(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        details TEXT,
        created_at VARCHAR(100) NOT NULL
      );
    `);
    
    // Create hunter_search_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_search_jobs (
        id VARCHAR(50) PRIMARY KEY,
        run_at VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        leads_found INTEGER NOT NULL,
        hot_leads INTEGER NOT NULL,
        categories_searched TEXT[],
        location VARCHAR(255) NOT NULL,
        log_output TEXT
      );
    `);
    
    // Create hunter_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hunter_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    
    dbInitialized = true;
  } catch (err) {
    console.error("Postgres init error for hunter:", err);
    throw err;
  } finally {
    if (client) client.release();
  }
}

// JSON read/write helper utilities
function readJSON(file) {
  initLocalDB();
  try {
    const data = fs.readFileSync(file, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    return [];
  }
}

function writeJSON(file, data) {
  initLocalDB();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// SETTINGS API
export async function getSettings() {
  if (pool) {
    try {
      await initPG();
      const res = await pool.query("SELECT * FROM hunter_settings");
      const settings = {};
      res.rows.forEach(r => {
        let val = r.value;
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(val) && val !== "") val = Number(val);
        settings[r.key] = val;
      });
      return {
        location: settings.location || "Delhi NCR",
        daily_lead_target: settings.daily_lead_target !== undefined ? settings.daily_lead_target : 50,
        auto_daily_hunt: settings.auto_daily_hunt !== undefined ? settings.auto_daily_hunt : true,
        google_api_key: settings.google_api_key || "",
        gemini_api_key: settings.gemini_api_key || "",
      };
    } catch (e) {
      console.error("PG getSettings error, falling back:", e);
    }
  }
  
  initLocalDB();
  try {
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {
      location: "Delhi NCR",
      daily_lead_target: 50,
      auto_daily_hunt: true,
      google_api_key: "",
      gemini_api_key: ""
    };
  }
}

export async function saveSettings(settings) {
  if (pool) {
    try {
      await initPG();
      const keys = ["location", "daily_lead_target", "auto_daily_hunt", "google_api_key", "gemini_api_key"];
      for (const k of keys) {
        if (settings[k] !== undefined) {
          await pool.query(
            "INSERT INTO hunter_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
            [k, String(settings[k])]
          );
        }
      }
      return;
    } catch (e) {
      console.error("PG saveSettings error, falling back:", e);
    }
  }
  
  initLocalDB();
  const current = await getSettings();
  const updated = { ...current, ...settings };
  writeJSON(SETTINGS_FILE, updated);
}

// LEADS QUERY & MANAGEMENT
export async function getLeads() {
  if (pool) {
    try {
      await initPG();
      const query = `
        SELECT 
          l.id, l.score, l.priority, l.opportunity, l.status, 
          l.first_discovered_at, l.last_seen_at, l.last_analyzed_at,
          b.name as business_name, b.website, b.rating, b.user_ratings_total,
          b.types as categories, b.formatted_address, b.phone_number
        FROM hunter_leads l
        JOIN hunter_businesses b ON l.business_id = b.id
        ORDER BY l.score DESC
      `;
      const result = await pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        score: row.score,
        priority: row.priority,
        opportunity: row.opportunity,
        status: row.status,
        firstDiscoveredAt: row.first_discovered_at,
        lastSeenAt: row.last_seen_at,
        lastAnalyzedAt: row.last_analyzed_at,
        business: {
          name: row.business_name,
          website: row.website,
          rating: parseFloat(row.rating || 0),
          userRatingsTotal: row.user_ratings_total,
          categories: row.categories,
          formattedAddress: row.formatted_address,
          phoneNumber: row.phone_number
        }
      }));
    } catch (err) {
      console.error("PG getLeads failed. Falling back.", err);
    }
  }
  
  // JSON fallback query with joins
  const leads = readJSON(LEADS_FILE);
  const businesses = readJSON(BIZ_FILE);
  
  return leads.map(l => {
    const b = businesses.find(x => x.id === l.business_id) || {};
    return {
      id: l.id,
      score: l.score,
      priority: l.priority,
      opportunity: l.opportunity,
      status: l.status,
      firstDiscoveredAt: l.first_discovered_at,
      lastSeenAt: l.last_seen_at,
      lastAnalyzedAt: l.last_analyzed_at,
      business: {
        name: b.name || "Unknown",
        website: b.website || null,
        rating: b.rating || 0,
        userRatingsTotal: b.user_ratings_total || 0,
        categories: b.types || [],
        formattedAddress: b.formatted_address || "",
        phoneNumber: b.phone_number || ""
      }
    };
  }).sort((a, b) => b.score - a.score);
}

export async function getLeadDetail(leadId) {
  if (pool) {
    try {
      await initPG();
      const leadRes = await pool.query(`
        SELECT 
          l.id, l.score, l.priority, l.opportunity, l.status, 
          l.first_discovered_at, l.last_seen_at, l.last_analyzed_at, l.business_id,
          b.name as business_name, b.place_id, b.website, b.rating, b.user_ratings_total,
          b.types as categories, b.formatted_address, b.phone_number,
          b.source_type, b.source_urls
        FROM hunter_leads l
        JOIN hunter_businesses b ON l.business_id = b.id
        WHERE l.id = $1
      `, [leadId]);
      
      if (leadRes.rows.length === 0) return null;
      const row = leadRes.rows[0];
      
      const auditRes = await pool.query("SELECT * FROM hunter_website_audits WHERE business_id = $1", [row.business_id]);
      const analysisRes = await pool.query("SELECT * FROM hunter_ai_analyses WHERE business_id = $1", [row.business_id]);
      const activitiesRes = await pool.query("SELECT * FROM hunter_lead_activities WHERE lead_id = $1 ORDER BY created_at DESC", [leadId]);
      
      return {
        id: row.id,
        score: row.score,
        priority: row.priority,
        opportunity: row.opportunity,
        status: row.status,
        firstDiscoveredAt: row.first_discovered_at,
        lastSeenAt: row.last_seen_at,
        lastAnalyzedAt: row.last_analyzed_at,
        business: {
          id: row.business_id,
          name: row.business_name,
          placeId: row.place_id,
          website: row.website,
          rating: parseFloat(row.rating || 0),
          userRatingsTotal: row.user_ratings_total,
          categories: row.categories,
          formattedAddress: row.formatted_address,
          phoneNumber: row.phone_number,
          sourceType: row.source_type || "google_places",
          sourceUrls: row.source_urls || []
        },
        websiteAudit: auditRes.rows[0] ? {
          id: auditRes.rows[0].id,
          websiteUrl: auditRes.rows[0].website_url,
          isHttps: auditRes.rows[0].is_https,
          isMobileFriendly: auditRes.rows[0].is_mobile_friendly,
          pageTitle: auditRes.rows[0].page_title,
          metaDescription: auditRes.rows[0].meta_description,
          h1: auditRes.rows[0].h1,
          contactInfoFound: auditRes.rows[0].contact_info_found,
          ctaFound: auditRes.rows[0].cta_found,
          performanceScore: auditRes.rows[0].performance_score,
          uxQualityScore: auditRes.rows[0].ux_quality_score,
          rawMetrics: auditRes.rows[0].raw_metrics,
          auditedAt: auditRes.rows[0].audited_at
        } : null,
        aiAnalysis: analysisRes.rows[0] ? {
          id: analysisRes.rows[0].id,
          score: analysisRes.rows[0].score,
          priority: analysisRes.rows[0].priority,
          opportunity: analysisRes.rows[0].opportunity,
          reason: analysisRes.rows[0].reason,
          painPoints: analysisRes.rows[0].pain_points || [],
          recommendedService: analysisRes.rows[0].recommended_service,
          salesAngle: analysisRes.rows[0].sales_angle,
          personalizedPitch: analysisRes.rows[0].personalized_pitch,
          analyzedAt: analysisRes.rows[0].analyzed_at
        } : null,
        activities: activitiesRes.rows.map(a => ({
          id: a.id,
          activityType: a.activity_type,
          details: a.details,
          createdAt: a.created_at
        }))
      };
    } catch (err) {
      console.error("PG getLeadDetail failed:", err);
    }
  }
  
  // JSON Fallback
  const leads = readJSON(LEADS_FILE);
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;
  
  const businesses = readJSON(BIZ_FILE);
  const audits = readJSON(AUDITS_FILE);
  const analyses = readJSON(ANALYSES_FILE);
  const activities = readJSON(ACTIVITIES_FILE);
  
  const b = businesses.find(x => x.id === lead.business_id) || {};
  const audit = audits.find(x => x.business_id === lead.business_id) || null;
  const analysis = analyses.find(x => x.business_id === lead.business_id) || null;
  const leadActivities = activities.filter(x => x.lead_id === leadId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  
  return {
    id: lead.id,
    score: lead.score,
    priority: lead.priority,
    opportunity: lead.opportunity,
    status: lead.status,
    firstDiscoveredAt: lead.first_discovered_at,
    lastSeenAt: lead.last_seen_at,
    lastAnalyzedAt: lead.last_analyzed_at,
    business: {
      id: b.id,
      name: b.name || "Unknown",
      placeId: b.place_id,
      website: b.website || null,
      rating: b.rating || 0,
      userRatingsTotal: b.user_ratings_total || 0,
      categories: b.types || [],
      formattedAddress: b.formatted_address || "",
      phoneNumber: b.phone_number || "",
      sourceType: b.source_type || b.sourceType || "google_places",
      sourceUrls: b.source_urls || b.sourceUrls || []
    },
    websiteAudit: audit ? {
      id: audit.id,
      websiteUrl: audit.websiteUrl || audit.website_url,
      isHttps: audit.isHttps !== undefined ? audit.isHttps : audit.is_https,
      isMobileFriendly: audit.isMobileFriendly !== undefined ? audit.isMobileFriendly : audit.is_mobile_friendly,
      pageTitle: audit.pageTitle || audit.page_title,
      metaDescription: audit.metaDescription || audit.meta_description,
      h1: audit.h1,
      contactInfoFound: audit.contactInfoFound || audit.contact_info_found,
      ctaFound: audit.ctaFound !== undefined ? audit.ctaFound : audit.cta_found,
      performanceScore: audit.performanceScore !== undefined ? audit.performanceScore : audit.performance_score,
      uxQualityScore: audit.uxQualityScore || audit.ux_quality_score,
      rawMetrics: audit.rawMetrics || audit.raw_metrics,
      auditedAt: audit.auditedAt || audit.audited_at
    } : null,
    aiAnalysis: analysis ? {
      id: analysis.id,
      score: analysis.score,
      priority: analysis.priority,
      opportunity: analysis.opportunity,
      reason: analysis.reason,
      painPoints: analysis.painPoints || [],
      recommendedService: analysis.recommendedService || analysis.recommended_service,
      salesAngle: analysis.salesAngle || analysis.sales_angle,
      personalizedPitch: analysis.personalizedPitch || analysis.personalized_pitch,
      analyzedAt: analysis.analyzedAt || analysis.analyzed_at
    } : null,
    activities: leadActivities
  };
}

export async function updateLeadStatus(leadId, status) {
  const now = new Date().toISOString();
  const activityId = "act_" + Math.random().toString(36).substring(2, 11);
  
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      await client.query("BEGIN");
      
      await client.query("UPDATE hunter_leads SET status = $1 WHERE id = $2", [status, leadId]);
      await client.query(
        "INSERT INTO hunter_lead_activities (id, lead_id, activity_type, details, created_at) VALUES ($1, $2, $3, $4, $5)",
        [activityId, leadId, "STATUS_CHANGE", `Lead status marked as ${status.replace("_", " ")}`, now]
      );
      
      await client.query("COMMIT");
      return;
    } catch (err) {
      if (client) await client.query("ROLLBACK");
      console.error("PG updateLeadStatus failed:", err);
    } finally {
      if (client) client.release();
    }
  }
  
  // JSON Fallback
  const leads = readJSON(LEADS_FILE);
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    leads[index].status = status;
    writeJSON(LEADS_FILE, leads);
    
    const activities = readJSON(ACTIVITIES_FILE);
    activities.push({
      id: activityId,
      lead_id: leadId,
      activity_type: "STATUS_CHANGE",
      details: `Lead status marked as ${status.replace("_", " ")}`,
      created_at: now
    });
    writeJSON(ACTIVITIES_FILE, activities);
  }
}

export async function logActivity(leadId, type, details) {
  const now = new Date().toISOString();
  const activityId = "act_" + Math.random().toString(36).substring(2, 11);
  
  if (pool) {
    try {
      await initPG();
      await pool.query(
        "INSERT INTO hunter_lead_activities (id, lead_id, activity_type, details, created_at) VALUES ($1, $2, $3, $4, $5)",
        [activityId, leadId, type, details, now]
      );
      return;
    } catch (err) {
      console.error("PG logActivity failed:", err);
    }
  }
  
  const activities = readJSON(ACTIVITIES_FILE);
  activities.push({
    id: activityId,
    lead_id: leadId,
    activity_type: type,
    details: details,
    created_at: now
  });
  writeJSON(ACTIVITIES_FILE, activities);
}

// SAVE DISCOVERY PIPELINE RESULTS
export async function saveLeadHuntResults(job, discoveries) {
  const now = new Date().toISOString();
  
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      await client.query("BEGIN");
      
      // Save Job details
      await client.query(
        "INSERT INTO hunter_search_jobs (id, run_at, status, leads_found, hot_leads, categories_searched, location, log_output) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [job.id, job.runAt, job.status, job.leadsFound, job.hotLeads, job.categoriesSearched, job.location, job.logOutput]
      );
      
      for (const item of discoveries) {
        const { business, lead, websiteAudit, aiAnalysis } = item;
        
        // 1. Save or Update business
        await client.query(`
          INSERT INTO hunter_businesses (id, name, place_id, website, rating, user_ratings_total, types, formatted_address, phone_number, source_type, source_urls, created_at, last_seen_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (place_id) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            website = EXCLUDED.website,
            rating = EXCLUDED.rating,
            user_ratings_total = EXCLUDED.user_ratings_total,
            types = EXCLUDED.types,
            formatted_address = EXCLUDED.formatted_address,
            phone_number = EXCLUDED.phone_number,
            source_type = EXCLUDED.source_type,
            source_urls = EXCLUDED.source_urls,
            last_seen_at = EXCLUDED.last_seen_at
        `, [
          business.id, business.name, business.placeId, business.website,
          business.rating, business.userRatingsTotal, business.categories,
          business.formattedAddress, business.phoneNumber, business.sourceType || "google_places",
          business.sourceUrls || [], now, now
        ]);
        
        // Resolve business ID in case of update
        const bizRes = await client.query("SELECT id FROM hunter_businesses WHERE place_id = $1", [business.placeId]);
        const bizId = bizRes.rows[0].id;
        
        // 2. Save or Update lead
        await client.query(`
          INSERT INTO hunter_leads (id, business_id, score, priority, opportunity, status, first_discovered_at, last_seen_at, last_analyzed_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) 
          DO UPDATE SET 
            score = EXCLUDED.score,
            priority = EXCLUDED.priority,
            opportunity = EXCLUDED.opportunity,
            last_seen_at = EXCLUDED.last_seen_at,
            last_analyzed_at = EXCLUDED.last_analyzed_at
        `, [
          lead.id, bizId, lead.score, lead.priority, lead.opportunity, lead.status || "NEW", now, now, now
        ]);
        
        // 3. Save website audit if it exists
        if (websiteAudit) {
          await client.query(`
            INSERT INTO hunter_website_audits (id, business_id, website_url, is_https, is_mobile_friendly, page_title, meta_description, h1, contact_info_found, cta_found, performance_score, ux_quality_score, raw_metrics, audited_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) 
            DO UPDATE SET 
              website_url = EXCLUDED.website_url,
              is_https = EXCLUDED.is_https,
              is_mobile_friendly = EXCLUDED.is_mobile_friendly,
              page_title = EXCLUDED.page_title,
              meta_description = EXCLUDED.meta_description,
              h1 = EXCLUDED.h1,
              contact_info_found = EXCLUDED.contact_info_found,
              cta_found = EXCLUDED.cta_found,
              performance_score = EXCLUDED.performance_score,
              ux_quality_score = EXCLUDED.ux_quality_score,
              raw_metrics = EXCLUDED.raw_metrics,
              audited_at = EXCLUDED.audited_at
          `, [
            websiteAudit.id, bizId, websiteAudit.websiteUrl, websiteAudit.isHttps,
            websiteAudit.isMobileFriendly, websiteAudit.pageTitle, websiteAudit.metaDescription, websiteAudit.h1,
            JSON.stringify(websiteAudit.contactInfoFound), websiteAudit.ctaFound,
            websiteAudit.performanceScore, websiteAudit.uxQualityScore, JSON.stringify(websiteAudit.rawMetrics), now
          ]);
        }
        
        // 4. Save AI analysis if it exists
        if (aiAnalysis) {
          await client.query(`
            INSERT INTO hunter_ai_analyses (id, business_id, score, priority, opportunity, reason, pain_points, recommended_service, sales_angle, personalized_pitch, analyzed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) 
            DO UPDATE SET 
              score = EXCLUDED.score,
              priority = EXCLUDED.priority,
              opportunity = EXCLUDED.opportunity,
              reason = EXCLUDED.reason,
              pain_points = EXCLUDED.pain_points,
              recommended_service = EXCLUDED.recommended_service,
              sales_angle = EXCLUDED.sales_angle,
              personalized_pitch = EXCLUDED.personalized_pitch,
              analyzed_at = EXCLUDED.analyzed_at
          `, [
            aiAnalysis.id, bizId, aiAnalysis.score, aiAnalysis.priority, aiAnalysis.opportunity,
            aiAnalysis.reason, aiAnalysis.painPoints || [], aiAnalysis.recommendedService, aiAnalysis.salesAngle, aiAnalysis.personalizedPitch, now
          ]);
        }
      }
      
      await client.query("COMMIT");
      return;
    } catch (err) {
      if (client) await client.query("ROLLBACK");
      console.error("PG saveLeadHuntResults failed:", err);
    } finally {
      if (client) client.release();
    }
  }
  
  // JSON Fallback
  initLocalDB();
  const jobs = readJSON(JOBS_FILE);
  jobs.unshift(job);
  writeJSON(JOBS_FILE, jobs);
  
  const businesses = readJSON(BIZ_FILE);
  const leads = readJSON(LEADS_FILE);
  const audits = readJSON(AUDITS_FILE);
  const analyses = readJSON(ANALYSES_FILE);
  
  for (const item of discoveries) {
    const { business, lead, websiteAudit, aiAnalysis } = item;
    
    // Save/update business
    const bizIdx = businesses.findIndex(b => b.place_id === business.placeId);
    let bizId = business.id;
    if (bizIdx !== -1) {
      bizId = businesses[bizIdx].id;
      businesses[bizIdx] = {
        ...businesses[bizIdx],
        name: business.name,
        website: business.website,
        rating: business.rating,
        user_ratings_total: business.userRatingsTotal,
        types: business.categories,
        formatted_address: business.formattedAddress,
        phone_number: business.phoneNumber,
        last_seen_at: now
      };
    } else {
      businesses.push({
        id: business.id,
        name: business.name,
        place_id: business.placeId,
        website: business.website,
        rating: business.rating,
        user_ratings_total: business.userRatingsTotal,
        types: business.categories,
        formatted_address: business.formattedAddress,
        phone_number: business.phoneNumber,
        created_at: now,
        last_seen_at: now
      });
    }
    
    // Save/update lead
    const leadIdx = leads.findIndex(l => l.id === lead.id);
    if (leadIdx !== -1) {
      leads[leadIdx] = {
        ...leads[leadIdx],
        score: lead.score,
        priority: lead.priority,
        opportunity: lead.opportunity,
        last_seen_at: now,
        last_analyzed_at: now
      };
    } else {
      leads.push({
        id: lead.id,
        business_id: bizId,
        score: lead.score,
        priority: lead.priority,
        opportunity: lead.opportunity,
        status: lead.status || "NEW",
        first_discovered_at: now,
        last_seen_at: now,
        last_analyzed_at: now
      });
    }
    
    // Save/update audit
    if (websiteAudit) {
      const audIdx = audits.findIndex(a => a.id === websiteAudit.id);
      if (audIdx !== -1) {
        audits[audIdx] = { ...websiteAudit, business_id: bizId, audited_at: now };
      } else {
        audits.push({ ...websiteAudit, business_id: bizId, audited_at: now });
      }
    }
    
    // Save/update analysis
    if (aiAnalysis) {
      const anaIdx = analyses.findIndex(a => a.id === aiAnalysis.id);
      if (anaIdx !== -1) {
        analyses[anaIdx] = { ...aiAnalysis, business_id: bizId, analyzed_at: now };
      } else {
        analyses.push({ ...aiAnalysis, business_id: bizId, analyzed_at: now });
      }
    }
  }
  
  writeJSON(BIZ_FILE, businesses);
  writeJSON(LEADS_FILE, leads);
  writeJSON(AUDITS_FILE, audits);
  writeJSON(ANALYSES_FILE, analyses);
}

// JOBS HISTORY API
export async function getJobs() {
  if (pool) {
    try {
      await initPG();
      const res = await pool.query("SELECT * FROM hunter_search_jobs ORDER BY run_at DESC LIMIT 50");
      return res.rows.map(row => ({
        id: row.id,
        runAt: row.run_at,
        status: row.status,
        leadsFound: row.leads_found,
        hotLeads: row.hot_leads,
        categoriesSearched: row.categories_searched,
        location: row.location,
        logOutput: row.log_output
      }));
    } catch (e) {
      console.error("PG getJobs error, fallback:", e);
    }
  }
  return readJSON(JOBS_FILE).slice(0, 50);
}

// CATEGORY STATS
export async function getCategoryStats() {
  if (pool) {
    try {
      await initPG();
      const query = `
        SELECT 
          unnest(b.types) as category,
          count(l.id) as leads_found,
          count(CASE WHEN l.priority = 'HOT' THEN 1 END) as hot_leads,
          avg(l.score) as average_score
        FROM hunter_leads l
        JOIN hunter_businesses b ON l.business_id = b.id
        GROUP BY category
        ORDER BY hot_leads DESC, average_score DESC
      `;
      const res = await pool.query(query);
      return res.rows.map(r => ({
        category: r.category,
        leadsFound: parseInt(r.leads_found),
        hotLeads: parseInt(r.hot_leads),
        averageScore: parseFloat(r.average_score || 0)
      }));
    } catch (err) {
      console.error("PG getCategoryStats failed, fallback to JSON aggregate:", err);
    }
  }
  
  const leads = readJSON(LEADS_FILE);
  const businesses = readJSON(BIZ_FILE);
  const stats = {};
  
  leads.forEach(l => {
    const b = businesses.find(x => x.id === l.business_id);
    if (!b || !b.types) return;
    
    b.types.forEach(cat => {
      if (!stats[cat]) {
        stats[cat] = { category: cat, leadsFound: 0, hotLeads: 0, totalScore: 0 };
      }
      stats[cat].leadsFound += 1;
      if (l.priority === "HOT") {
        stats[cat].hotLeads += 1;
      }
      stats[cat].totalScore += l.score;
    });
  });
  
  return Object.values(stats).map(s => ({
    category: s.category,
    leadsFound: s.leadsFound,
    hotLeads: s.hotLeads,
    averageScore: s.leadsFound > 0 ? (s.totalScore / s.leadsFound) : 0
  })).sort((a, b) => b.hotLeads - a.hotLeads || b.averageScore - a.averageScore);
}

// CLEANING DATA (FOR TESTING / RESET)
export async function clearHunterDB() {
  if (pool) {
    try {
      await initPG();
      await pool.query("TRUNCATE TABLE hunter_lead_activities CASCADE");
      await pool.query("TRUNCATE TABLE hunter_ai_analyses CASCADE");
      await pool.query("TRUNCATE TABLE hunter_website_audits CASCADE");
      await pool.query("TRUNCATE TABLE hunter_leads CASCADE");
      await pool.query("TRUNCATE TABLE hunter_businesses CASCADE");
      await pool.query("TRUNCATE TABLE hunter_search_jobs CASCADE");
      return;
    } catch (err) {
      console.error("PG clearHunterDB error:", err);
    }
  }
  writeJSON(BIZ_FILE, []);
  writeJSON(LEADS_FILE, []);
  writeJSON(AUDITS_FILE, []);
  writeJSON(ANALYSES_FILE, []);
  writeJSON(ACTIVITIES_FILE, []);
  writeJSON(JOBS_FILE, []);
}
