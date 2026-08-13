import { analyzeWebsite } from "./website-analyzer.js";
import { calculateFallbackScore } from "./gemini-service.js";
import { searchPlaces } from "./places-service.js";
import { getDiscoveryProvider } from "./discovery-provider.js";

async function runTests() {
  console.log("==============================================");
  console.log("RUNNING LEAD HUNTER INTEGRATION & UNIT TESTS");
  console.log("==============================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  };

  // Test 1: SSRF Protection (Blocked IPs)
  try {
    console.log("\nTesting SSRF Validation & Private IP Blockers...");
    
    const resLocalhost = await analyzeWebsite("http://localhost");
    assert(
      resLocalhost.status === "UNKNOWN" && resLocalhost.rawMetrics.error.includes("private or local IP ranges"),
      "Should block access to localhost"
    );

    const resLoopback = await analyzeWebsite("http://127.0.0.1");
    assert(
      resLoopback.status === "UNKNOWN" && resLoopback.rawMetrics.error.includes("private or local IP ranges"),
      "Should block access to loopback 127.0.0.1"
    );

    const resPrivateIP = await analyzeWebsite("http://10.254.0.1");
    assert(
      resPrivateIP.status === "UNKNOWN" && resPrivateIP.rawMetrics.error.includes("private or local IP ranges"),
      "Should block access to private range 10.x.x.x"
    );

    const resMulticast = await analyzeWebsite("http://224.0.0.1");
    assert(
      resMulticast.status === "UNKNOWN" && resMulticast.rawMetrics.error.includes("private or local IP ranges"),
      "Should block access to multicast IP ranges (224.x.x.x)"
    );

  } catch (err) {
    console.error("SSRF tests threw unexpected error:", err);
    failed++;
  }

  // Test 2: Fallback Scoring Engine Rules
  try {
    console.log("\nTesting Gemini Fallback Scoring Rules...");

    const mockBusiness = {
      name: "Super Fit Gym",
      categories: ["Gyms", "Health Club"],
      rating: 4.8,
      userRatingsTotal: 300,
      formattedAddress: "Connaught Place, New Delhi",
      website: null
    };

    const mockAuditNoWebsite = {
      status: "NO_WEBSITE",
      isHttps: false,
      isMobileFriendly: false,
      contactInfoFound: { emails: [], phones: [] },
      ctaFound: false,
      performanceScore: 0
    };

    const result = calculateFallbackScore(mockBusiness, mockAuditNoWebsite);
    
    assert(
      result.lead_score >= 80 && result.priority === "HOT",
      `Active high-rated business with no website should trigger HOT Priority. Score: ${result.lead_score}`
    );

    assert(
      result.website_opportunity === "NO_WEBSITE",
      "Opportunity should be classified as NO_WEBSITE"
    );

    assert(
      result.personalized_pitch.includes("Super Fit Gym") && result.personalized_pitch.includes("4.8"),
      "Pitch should dynamically integrate factual details about reviews and rating."
    );

    // Test WARM redesign fallback (reduce reviews count to keep score < 80)
    const mockBusinessWarm = {
      ...mockBusiness,
      userRatingsTotal: 30
    };

    const mockAuditPoorWebsite = {
      status: "POOR_WEBSITE",
      isHttps: false,
      isMobileFriendly: false,
      contactInfoFound: { emails: ["info@gym.com"], phones: ["999999999"] },
      ctaFound: false,
      performanceScore: 30
    };

    const redesignResult = calculateFallbackScore(mockBusinessWarm, mockAuditPoorWebsite);
    assert(
      redesignResult.lead_score >= 50 && redesignResult.lead_score < 80 && redesignResult.priority === "WARM",
      `Poor mobile website with ratings should trigger WARM. Score: ${redesignResult.lead_score}`
    );

    assert(
      redesignResult.website_opportunity === "REDESIGN",
      "Opportunity should be classified as REDESIGN"
    );

    // Verify pain points are populated
    assert(
      Array.isArray(redesignResult.pain_points) && redesignResult.pain_points.length > 0,
      "Should contain active pain points in the returned array."
    );

  } catch (err) {
    console.error("Scoring tests threw unexpected error:", err);
    failed++;
  }

  // Test 3: Places Client Checks
  try {
    console.log("\nTesting Places Client Input Guardrails...");
    
    let keyMissingError = false;
    try {
      await searchPlaces("Gyms in Delhi NCR", 5, "");
    } catch (err) {
      if (err.message.includes("Google API Key is not configured")) {
        keyMissingError = true;
      }
    }
    assert(keyMissingError, "Should throw descriptive error when Places API key is missing");

  } catch (err) {
    console.error("Places client tests threw unexpected error:", err);
    failed++;
  }

  // Test 4: Discovery Provider Abstraction Factory
  try {
    console.log("\nTesting Discovery Provider Factory...");
    
    const settingsNoPlaces = { gemini_api_key: "some_key", google_api_key: "" };
    const provider1 = getDiscoveryProvider(settingsNoPlaces);
    assert(
      provider1.constructor.name === "GeminiSearchDiscoveryProvider",
      "Should instantiate GeminiSearchDiscoveryProvider if Google Places key is missing"
    );

    const settingsWithPlaces = { gemini_api_key: "some_key", google_api_key: "places_key" };
    const provider2 = getDiscoveryProvider(settingsWithPlaces);
    assert(
      provider2.constructor.name === "GooglePlacesDiscoveryProvider",
      "Should instantiate GooglePlacesDiscoveryProvider if Google Places key is present"
    );

  } catch (err) {
    console.error("Provider factory tests threw unexpected error:", err);
    failed++;
  }

  console.log("\n==============================================");
  console.log(`TEST EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==============================================");
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
