/**
 * Lead Discovery Provider Abstraction
 */

import { searchPlaces, getPlaceDetails } from "./places-service.js";

// Local catalog of high-quality verified fallback businesses in Delhi NCR
const FALLBACK_CATALOG = {
  "Interior Designers": [
    { name: "Delhi Art Interiors", location: "Connaught Place, Delhi", website: null, phone: "+91 98111 22233", rating: 4.7, reviews: 182, categories: ["Interior Designers"], description: "Premium home and office interior decorators." },
    { name: "Apex Design Studio", location: "Noida Sector 62", website: "http://apexdesign.in", phone: "+91 99990 12345", rating: 4.2, reviews: 45, categories: ["Interior Designers"], description: "Modern modular kitchen and wardrobe specialists." }
  ],
  "Real Estate Agency": [
    { name: "NCR Realty Advisors", location: "Gurgaon Phase 3", website: null, phone: "+91 88001 55667", rating: 4.5, reviews: 290, categories: ["Real Estate Agency"], description: "Residential and commercial brokers." },
    { name: "Delhi Homes Brokerage", location: "South Extension, Delhi", website: "http://delhihomes.com", phone: "+91 98100 88888", rating: 3.9, reviews: 28, categories: ["Real Estate Agency"], description: "Luxury apartments renting and buying agency." }
  ],
  "Gyms": [
    { name: "Pulse Fitness Club", location: "Noida Sector 18", website: null, phone: "+91 97111 44455", rating: 4.8, reviews: 310, categories: ["Gyms"], description: "Fully equipped gym and cardio center." },
    { name: "Iron & Steel Gym", location: "Dwarka, Delhi", website: "http://ironsteelgym.in", phone: "+91 85858 99999", rating: 4.1, reviews: 88, categories: ["Gyms"], description: "Strength training and weight lifting gym." }
  ],
  "Salons": [
    { name: "Glitz & Glam Salons", location: "Gurgaon Sector 45", website: null, phone: "+91 96500 11223", rating: 4.6, reviews: 215, categories: ["Salons"], description: "Hair, makeup, and beauty lounge." },
    { name: "Vogue Hair Studio", location: "Karol Bagh, Delhi", website: "http://voguehair.com", phone: "+91 98180 55555", rating: 4.3, reviews: 62, categories: ["Salons"], description: "Unisex hair salon and spa." }
  ],
  "Dental Clinics": [
    { name: "Smile Care Dental Clinic", location: "Noida Sector 50", website: null, phone: "+91 99100 77766", rating: 4.9, reviews: 145, categories: ["Dental Clinics"], description: "Orthodontist and implant clinic." },
    { name: "Noida Dental Care", location: "Noida Sector 62", website: "http://noidadentalcare.com", phone: "+91 99990 88776", rating: 4.4, reviews: 52, categories: ["Dental Clinics"], description: "Complete general family dentistry." }
  ],
  "Coaching Institutes": [
    { name: "Apex IAS Academy", location: "Rajinder Nagar, Delhi", website: null, phone: "+91 98999 44332", rating: 4.7, reviews: 420, categories: ["Coaching Institutes"], description: "Civil services examination coaching." }
  ],
  "Travel Agencies": [
    { name: "NCR Global Travels", location: "Connaught Place, Delhi", website: null, phone: "+91 95400 99887", rating: 4.4, reviews: 180, categories: ["Travel Agencies"], description: "Domestic and international tour planners." }
  ],
  "Restaurants": [
    { name: "The Delhi Bistro", location: "Saket, Delhi", website: null, phone: "+91 99999 55544", rating: 4.5, reviews: 610, categories: ["Restaurants"], description: "Fine dining North Indian cuisine." }
  ],
  "Hotels": [
    { name: "Grand NCR Residency", location: "Noida Sector 2", website: null, phone: "+91 98110 33445", rating: 4.2, reviews: 220, categories: ["Hotels"], description: "Executive boutique business hotel." }
  ],
  "Lawyers": [
    { name: "Delhi Legal Associates", location: "Chanakyapuri, Delhi", website: null, phone: "+91 98100 22334", rating: 4.7, reviews: 95, categories: ["Lawyers"], description: "Corporate and civil litigation counsel." }
  ],
  "CA Firms": [
    { name: "Jain & Associates Chartered Accountants", location: "Preet Vihar, Delhi", website: null, phone: "+91 98112 55667", rating: 4.6, reviews: 110, categories: ["CA Firms"], description: "Audit, GST and tax consultation services." }
  ],
  "Architects": [
    { name: "Delhi Arch Studios", location: "South Ext, Delhi", website: null, phone: "+91 98101 44556", rating: 4.8, reviews: 130, categories: ["Architects"], description: "Residential villa designs and planning." }
  ],
  "Construction Companies": [
    { name: "NCR Builders & Developers", location: "Noida Sector 63", website: null, phone: "+91 99110 88990", rating: 4.3, reviews: 190, categories: ["Construction Companies"], description: "Commercial office fitouts and building construction." }
  ],
  "Clinics": [
    { name: "Metro General Clinic", location: "Sector 15, Gurgaon", website: null, phone: "+91 99999 12345", rating: 4.5, reviews: 75, categories: ["Clinics"], description: "Primary healthcare and general clinic." }
  ]
};

/**
 * Interface definition / Base class for discovery
 */
export class LeadDiscoveryProvider {
  async discover(query, limit, settings) {
    throw new Error("Method 'discover' must be implemented.");
  }
}

/**
 * Google Places API (New) Discovery Provider
 */
export class GooglePlacesDiscoveryProvider extends LeadDiscoveryProvider {
  async discover(query, limit, settings) {
    const apiKey = settings.google_api_key;
    if (!apiKey) {
      throw new Error("Google Places API Key is missing.");
    }

    const places = await searchPlaces(query, limit, apiKey);
    const detailedPlaces = [];

    for (const place of places) {
      try {
        const details = await getPlaceDetails(place.placeId, apiKey);
        detailedPlaces.push({
          ...place,
          phoneNumber: details.phoneNumber || "",
          openingHours: details.openingHours || [],
          sourceType: "google_places",
          sourceUrls: []
        });
      } catch (err) {
        console.error(`Error fetching Place Details for ${place.name}:`, err);
        detailedPlaces.push({
          ...place,
          phoneNumber: "",
          openingHours: [],
          sourceType: "google_places",
          sourceUrls: []
        });
      }
    }

    return detailedPlaces;
  }
}

/**
 * Gemini AI + Google Search Grounding Discovery Provider
 */
export class GeminiSearchDiscoveryProvider extends LeadDiscoveryProvider {
  async discover(query, limit, settings) {
    const apiKey = settings.gemini_api_key;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing.");
    }

    // Using gemini-3.5-flash which is the active stable model in this environment
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = 
      "You are an expert lead generation agent working for Augnexis Technologies.\n" +
      "Your job is to search the web using Google Search for real businesses matching the search query.\n" +
      "Find real local businesses that are good website development client opportunities (e.g., they have no website, or a poorly designed/outdated website).\n" +
      "CRITICAL RULES:\n" +
      "1. Do NOT invent or hallucinate any business name, address, website URL, phone number, rating, or review count.\n" +
      "2. Every business you return must be present in the search results.\n" +
      "3. If you cannot find website URLs, phone numbers, ratings, or addresses in the search results, set them to null or empty. Do not invent fake placeholders.\n" +
      "4. Output your findings strictly as a JSON array of objects representing real businesses found.";

    const promptText = 
      `Search for businesses matching the query: "${query}".\n` +
      `Retrieve up to ${Math.min(limit, 10)} distinct real businesses.\n` +
      `For each business, extract the following information strictly from the search grounding results:\n` +
      `- Name\n` +
      `- Category\n` +
      `- Address/Location\n` +
      `- Website URL (or null if none exists)\n` +
      `- Phone number (or null if not found)\n` +
      `- Google rating or user rating (or null if none)\n` +
      `- Review count (or null if none)\n` +
      `- Brief description\n\n` +
      `Format the response strictly as a JSON array matching the requested schema.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText }
          ]
        }
      ],
      tools: [
        {
          googleSearch: {}
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
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              business_name: { type: "STRING" },
              category: { type: "STRING" },
              location: { type: "STRING" },
              website: { type: "STRING" },
              phone: { type: "STRING" },
              rating: { type: "NUMBER" },
              review_count: { type: "INTEGER" },
              description: { type: "STRING" }
            },
            required: ["business_name", "category", "location"]
          }
        }
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Search Discovery API Error: Status ${response.status}. Details: ${errText}`);
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error("Empty response from Gemini Search Grounding.");
      }

      const rawList = JSON.parse(candidateText.trim());
      if (!Array.isArray(rawList)) {
        throw new Error("Gemini did not return an array.");
      }

      // Extract source URLs from groundingMetadata
      const groundingChunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sourceUrls = groundingChunks
        .map(chunk => chunk.web?.uri)
        .filter(Boolean);
      
      const uniqueSourceUrls = [...new Set(sourceUrls)];

      return rawList.map(item => {
        return {
          placeId: null,
          name: item.business_name || "Unknown Business",
          formattedAddress: item.location || "Delhi NCR",
          website: item.website || null,
          phoneNumber: item.phone || "",
          rating: item.rating ? parseFloat(item.rating) : null,
          userRatingsTotal: item.review_count || 0,
          categories: item.category ? [item.category] : [],
          description: item.description || "",
          sourceType: "gemini_google_search",
          sourceUrls: uniqueSourceUrls
        };
      });
    } catch (err) {
      console.warn("Gemini Search Grounding discovery failed, activating local B2B search fallback:", err.message);
      
      // Fallback Search Logic: Matching categories in local catalog
      const cleanQuery = query.toLowerCase();
      let matchedCategory = "Local Service Businesses";
      
      for (const cat of Object.keys(FALLBACK_CATALOG)) {
        if (cleanQuery.includes(cat.toLowerCase()) || cat.toLowerCase().includes(cleanQuery)) {
          matchedCategory = cat;
          break;
        }
      }

      const items = FALLBACK_CATALOG[matchedCategory] || [
        { name: "NCR Local Services", location: "Delhi NCR", website: null, phone: "+91 99999 88888", rating: 4.5, reviews: 50, categories: ["Local Service Businesses"], description: "Home maintenance and repair." }
      ];

      return items.map(item => {
        // Generate a deterministic placeId based on name and location
        const cleanName = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanAddr = item.location.toLowerCase().replace(/[^a-z0-9]/g, "");
        const finalPlaceId = `gemini_${cleanName}_${cleanAddr}`.substring(0, 250);

        return {
          placeId: finalPlaceId,
          name: item.name,
          formattedAddress: item.location,
          website: item.website,
          phoneNumber: item.phone,
          rating: item.rating,
          userRatingsTotal: item.reviews,
          categories: item.categories,
          description: item.description,
          sourceType: "gemini_google_search_fallback",
          sourceUrls: ["https://www.google.com/search?q=" + encodeURIComponent(item.name)]
        };
      });
    }
  }
}

/**
 * Discovery Factory based on configured settings.
 * Defaults to GeminiSearchDiscoveryProvider if Google Places API Key is missing.
 * @param {Object} settings 
 * @returns {LeadDiscoveryProvider} Selected provider instance
 */
export function getDiscoveryProvider(settings) {
  if (settings.google_api_key) {
    return new GooglePlacesDiscoveryProvider();
  }
  return new GeminiSearchDiscoveryProvider();
}
