/**
 * Google Places API (New) Service Client
 */

/**
 * Searches for businesses using Google Places API (New) Text Search.
 * Endpoint: https://places.googleapis.com/v1/places:searchText
 * @param {string} query - e.g., "Gyms in Delhi NCR"
 * @param {number} limit - maximum results
 * @param {string} apiKey - Google API Key
 * @returns {Promise<Array>} List of discovered businesses
 */
export async function searchPlaces(query, limit = 20, apiKey) {
  if (!apiKey) {
    throw new Error("Google API Key is not configured. Please add it in settings.");
  }

  const url = "https://places.googleapis.com/v1/places:searchText";
  
  // Strict, cost-controlled FieldMask requesting only basic discovery fields
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.userRatingCount,places.types"
  };

  const body = {
    textQuery: query,
    maxResultCount: Math.min(limit, 20) // Text Search (New) max limit per query is 20
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let errMsg = `Status ${response.status}`;
      try {
        const errJson = await response.json();
        errMsg = errJson.error?.message || errMsg;
      } catch (_) {
        const errText = await response.text();
        errMsg = errText || errMsg;
      }
      throw new Error(`Google Places Text Search API Error: ${errMsg}`);
    }

    const data = await response.json();
    
    if (!data.places || !Array.isArray(data.places)) {
      return [];
    }

    return data.places.map(p => ({
      placeId: p.id,
      name: p.displayName?.text || "Unknown Business",
      formattedAddress: p.formattedAddress || "",
      website: p.websiteUri || null,
      rating: p.rating ? parseFloat(p.rating) : null,
      userRatingsTotal: p.userRatingCount || 0,
      categories: p.types || []
    }));
  } catch (err) {
    console.error("Google Places Text Search API request failed:", err);
    throw err;
  }
}

/**
 * Retrieves details for a specific Place ID using Google Place Details (New).
 * Endpoint: https://places.googleapis.com/v1/places/{placeId}
 * @param {string} placeId - The unique Place ID
 * @param {string} apiKey - Google API Key
 * @returns {Promise<Object>} Additional business details (phone, opening hours)
 */
export async function getPlaceDetails(placeId, apiKey) {
  if (!apiKey) {
    throw new Error("Google API Key is not configured.");
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  // Specific FieldMask querying only the additional details we require (e.g. phone)
  const headers = {
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "id,nationalPhoneNumber,regularOpeningHours"
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      let errMsg = `Status ${response.status}`;
      try {
        const errJson = await response.json();
        errMsg = errJson.error?.message || errMsg;
      } catch (_) {
        const errText = await response.text();
        errMsg = errText || errMsg;
      }
      throw new Error(`Google Place Details API Error: ${errMsg}`);
    }

    const data = await response.json();
    
    return {
      phoneNumber: data.nationalPhoneNumber || "",
      openingHours: data.regularOpeningHours?.weekdayDescriptions || []
    };
  } catch (err) {
    console.error(`Google Place Details request failed for Place ID ${placeId}:`, err);
    // Return empty details on failure to let the pipeline proceed gracefully
    return {
      phoneNumber: "",
      openingHours: []
    };
  }
}
