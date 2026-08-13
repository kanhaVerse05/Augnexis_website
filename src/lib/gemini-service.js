/**
 * Gemini AI Analysis Service Client
 */

/**
 * Calculates a deterministic rule-based fallback score when Gemini is unavailable.
 * @param {Object} business - The business details
 * @param {Object} audit - The website audit results
 * @returns {Object} Fallback AI analysis response matching the schema
 */
export function calculateFallbackScore(business, audit) {
  let lead_score = 0;
  let website_opportunity = "LOW";
  let priority = "COLD";
  const pain_points = [];

  const isNoWebsite = audit.status === "NO_WEBSITE";
  const isPoorWebsite = audit.status === "POOR_WEBSITE";
  const isNeedsImprovement = audit.status === "NEEDS_IMPROVEMENT";

  if (isNoWebsite) {
    lead_score = 50;
    website_opportunity = "NO_WEBSITE";
    pain_points.push("No online website presence to represent business.");
    // Boost score if business has high reviews and rating but no website (massive opportunity)
    if (business.userRatingsTotal > 150 && business.rating >= 4.0) {
      lead_score += 40; // 90 (HOT)
    } else if (business.userRatingsTotal > 40 && business.rating >= 3.8) {
      lead_score += 30; // 80 (HOT)
    } else if (business.userRatingsTotal > 10) {
      lead_score += 20; // 70 (WARM)
    } else {
      lead_score += 10; // 60 (WARM)
    }
  } else if (isPoorWebsite) {
    lead_score = 40;
    website_opportunity = "REDESIGN";
    if (business.userRatingsTotal > 50) {
      lead_score += 25; // 65 (WARM)
    } else {
      lead_score += 15; // 55 (WARM)
    }
    
    // Add points/pain points for specific flag failures
    if (!audit.isMobileFriendly) {
      lead_score += 10;
      pain_points.push("Website is not optimized for mobile viewports.");
    }
    if (!audit.isHttps) {
      lead_score += 10;
      pain_points.push("Insecure connection (Missing HTTPS/SSL).");
    }
    if (audit.performanceScore < 50) {
      pain_points.push("Slow page load speed hindering user retention.");
    }
  } else if (isNeedsImprovement) {
    lead_score = 35;
    website_opportunity = "IMPROVEMENT";
    if (business.userRatingsTotal > 30) lead_score += 15;
    
    if (!audit.ctaFound) {
      lead_score += 10;
      pain_points.push("No clear call-to-action (CTA) button or booking path.");
    }
    if (!audit.isHttps) {
      lead_score += 10;
      pain_points.push("Insecure connection (Missing HTTPS/SSL).");
    }
  } else {
    // GOOD WEBSITE
    lead_score = 15;
    website_opportunity = "LOW";
    if (business.rating < 3.8 && business.userRatingsTotal > 10) {
      lead_score += 15; // 30 (COLD)
      pain_points.push("Poor local rating despite having a functional website.");
    }
  }

  lead_score = Math.min(Math.max(lead_score, 0), 100);

  if (lead_score >= 80) priority = "HOT";
  else if (lead_score >= 50) priority = "WARM";
  else priority = "COLD";

  const categories = business.categories ? business.categories.join(", ") : "Local Service";
  const name = business.name || "Business";
  const ratingText = business.rating ? `${business.rating}/5.0` : "unrated";
  const reviewsText = `${business.userRatingsTotal || 0} reviews`;

  let reason = "";
  let recommendedService = "";
  let salesAngle = "";
  let personalizedPitch = "";

  if (isNoWebsite) {
    reason = `The business is active as a ${categories} with a strong local rating (${ratingText}, ${reviewsText}) but does NOT have a website. This is a massive opportunity to build an online presence.`;
    recommendedService = "Custom Responsive Website Design";
    salesAngle = "Help the business expand beyond Google Places search and capture organic local search traffic.";
    personalizedPitch = `Hi ${name} Team,\n\nI was looking up top-rated ${categories} in your area and noticed your outstanding Google rating of ${ratingText} with ${reviewsText}. However, I couldn't find a website associated with your business.\n\nAt Augnexis Technologies, we build modern, fast, and SEO-optimized website portals specifically tailored for local service leaders. Having a website can help you build trust, display your past work, and accept bookings directly online.\n\nWould you be open to a quick 5-minute call this week to talk about how we can build a stunning site to convert more search traffic into paying customers?\n\nBest regards,\nAugnexis Technologies Team\nwww.augnexis.com`;
  } else {
    reason = `The website scored as ${audit.status} (${audit.uxQualityScore || "UX Issues"}). It has a performance score of ${audit.performanceScore}/100. Key items missing: ${!audit.isMobileFriendly ? "Mobile optimization" : ""}, ${!audit.isHttps ? "Secure connection (HTTPS)" : ""}, ${!audit.ctaFound ? "Call-to-Action button" : ""}.`;
    recommendedService = isPoorWebsite ? "Full Website Redesign & Modernization" : "Website SEO & Conversion Optimization";
    salesAngle = "Optimize page performance, fix responsiveness, and add high-converting WhatsApp links to capture mobile traffic.";
    personalizedPitch = `Hi ${name} Team,\n\nI came across your business online and was really impressed by your Google listing (${ratingText}, ${reviewsText}). I checked out your website but noticed a few technical issues that might be causing you to lose potential clients:\n\n` +
      `${!audit.isHttps ? "- Your site doesn't have an active SSL certificate (HTTPS), which marks it as 'Not Secure' to users.\n" : ""}` +
      `${!audit.isMobileFriendly ? "- The layout is not fully optimized for mobile devices, making it hard to navigate on phones.\n" : ""}` +
      `${audit.performanceScore < 60 ? "- The page load speed is quite slow, which often causes visitors to leave immediately.\n" : ""}` +
      `${!audit.ctaFound ? "- There's no clear 'WhatsApp Us' or 'Contact' button to capture immediate booking requests.\n" : ""}\n` +
      `At Augnexis Technologies, we specialize in redesigning slow or outdated sites into high-performing lead generation portals. We'd love to help you refresh your site to ensure you convert as many visitors as possible.\n\nAre you available for a brief call next Tuesday to explore some ideas?\n\nBest regards,\nAugnexis Technologies Team\nwww.augnexis.com`;
  }

  return {
    lead_score,
    priority,
    website_opportunity,
    reason,
    pain_points,
    recommended_service: recommendedService,
    sales_angle: salesAngle,
    personalized_pitch: personalizedPitch
  };
}

/**
 * Analyzes a business and website audit using Gemini AI.
 * @param {Object} business - The business details
 * @param {Object} audit - The website audit details
 * @param {string} apiKey - Gemini API Key
 * @returns {Promise<Object>} The AI evaluation structure
 */
export async function analyzeWithGemini(business, audit, apiKey) {
  if (!apiKey) {
    // Missing API Key -> use fallback immediately
    console.warn("Gemini API Key missing, using rule-based fallback scoring.");
    return calculateFallbackScore(business, audit);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  // Formulate detailed, factual context
  const context = {
    businessName: business.name,
    categoryTypes: business.categories,
    googleRating: business.rating,
    googleReviewCount: business.userRatingsTotal,
    formattedAddress: business.formattedAddress,
    phoneNumber: business.phoneNumber || "NONE",
    websiteUrl: business.website || "NONE",
    auditStatus: audit.status, // NO_WEBSITE | POOR_WEBSITE | NEEDS_IMPROVEMENT | GOOD_WEBSITE
    isHttps: audit.isHttps,
    isMobileFriendly: audit.isMobileFriendly,
    pageTitle: audit.pageTitle || "NONE",
    metaDescription: audit.metaDescription || "NONE",
    h1Header: audit.h1 || "NONE",
    contactInfoFound: audit.contactInfoFound || {},
    ctaFound: audit.ctaFound,
    performanceScore: audit.performanceScore,
    uxQualityScore: audit.uxQualityScore
  };

  const systemInstruction = 
    "You are a professional lead generation and website analysis AI assistant working for Augnexis Technologies, a premium website design and development agency. " +
    "Your objective is to evaluate if a local business needs a new website, a redesign, or optimization services. " +
    "You must analyze the provided business details and website audit results, and output a structured JSON analysis. " +
    "CRITICAL RULES:\n" +
    "1. Never invent or assume facts. Only use the data provided in the prompt.\n" +
    "2. If the business has NO website, the website_opportunity is usually NO_WEBSITE.\n" +
    "3. High rating + high review count + NO website = very hot opportunity (score 80-95).\n" +
    "4. Poor mobile optimization or missing HTTPS = strong redesign opportunity (score 65-85).\n" +
    "5. Do not give a high score to an inactive or poorly rated business with no reviews, even if it has no website.\n" +
    "6. Identify specific technical or content pain points based on the audit data. Do not make up non-existent errors.\n" +
    "7. Suggest a highly customized, natural, professional sales pitch. Keep the email concise and respectful.";

  const promptText = `Analyze this business and website audit:\n\n${JSON.stringify(context, null, 2)}\n\nFormat the response strictly as a JSON object using the requested schema.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          lead_score: {
            type: "INTEGER",
            description: "A score from 0 to 100 representing the website development sales opportunity. 80-100 is HOT, 50-79 is WARM, 0-49 is COLD."
          },
          priority: {
            type: "STRING",
            enum: ["HOT", "WARM", "COLD"],
            description: "HOT if score is 80+, WARM if 50-79, COLD if 0-49."
          },
          website_opportunity: {
            type: "STRING",
            enum: ["NO_WEBSITE", "REDESIGN", "IMPROVEMENT", "LOW"],
            description: "The primary project opportunity type."
          },
          reason: {
            type: "STRING",
            description: "A factual explanation of the score, referencing the rating, reviews, performance, HTTPS, or mobile friendliness. Do not invent details."
          },
          pain_points: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of specific technical problems or missing features discovered for the business (e.g. 'No SSL certificate', 'Not mobile friendly', 'No website link available')."
          },
          recommended_service: {
            type: "STRING",
            description: "The specific website service recommendation (e.g. 'Custom Website Development', 'Mobile Optimization Redesign', 'Secure SSL & Performance Tune-up')."
          },
          sales_angle: {
            type: "STRING",
            description: "The main benefit or selling point to focus on in the pitch (e.g., 'Capturing local mobile search traffic', 'Replacing non-secure warnings')."
          },
          personalized_pitch: {
            type: "STRING",
            description: "A professional, concise sales outreach pitch email to send to the owner. Refer to the business name, Google review count, and their specific website problems."
          }
        },
        required: ["lead_score", "priority", "website_opportunity", "reason", "pain_points", "recommended_service", "sales_angle", "personalized_pitch"]
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error Status: ${response.status}. Response: ${errText}`);
      throw new Error(`Gemini API Error: Status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error("Empty candidate response from Gemini");
    }

    // Parse the JSON string from Gemini
    const result = JSON.parse(candidateText.trim());
    return result;
  } catch (err) {
    console.error("Gemini analysis failed or returned malformed JSON. Using fallback scoring.", err);
    return calculateFallbackScore(business, audit);
  }
}
