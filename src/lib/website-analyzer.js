import dns from "dns";
import { promisify } from "util";

const lookupPromise = promisify(dns.lookup);

/**
 * Checks if an IP address belongs to local or private subnetworks to prevent SSRF.
 * @param {string} ip
 * @returns {boolean} True if IP is private
 */
function isPrivateIP(ip) {
  // IPv4 subnetwork checks
  const ipv4Pattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipv4Pattern.test(ip)) {
    const parts = ip.split(".").map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8 (Broadcast/Local)
    if (parts[0] === 0) return true;
    // 224.0.0.0/4 and above (Multicast and Reserved/Experimental)
    if (parts[0] >= 224) return true;
    
    return false;
  }
  
  // IPv6 subnetwork checks
  const cleanIPv6 = ip.toLowerCase().trim();
  if (cleanIPv6 === "::1" || cleanIPv6 === "0:0:0:0:0:0:0:1") return true;
  // Link-local (fe80::/10)
  if (cleanIPv6.startsWith("fe80:")) return true;
  // Unique local (fc00::/7)
  if (cleanIPv6.startsWith("fc00:") || cleanIPv6.startsWith("fd")) return true;
  
  return false;
}

/**
 * Validates a URL and resolves its domain name to verify it is not inside private subnets.
 * @param {string} urlStr
 * @returns {Promise<{valid: boolean, error?: string, hostname?: string}>}
 */
async function validateUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTP and HTTPS protocols are supported" };
    }
    
    const hostname = parsed.hostname;
    // Resolve hostname to check IPs
    const addresses = await lookupPromise(hostname, { all: true });
    
    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        return { valid: false, error: `Access to private or local IP ranges is blocked: ${addr.address}` };
      }
    }
    
    return { valid: true, hostname };
  } catch (e) {
    return { valid: false, error: `Invalid URL or DNS resolution failed: ${e.message}` };
  }
}

/**
 * Performs a safe, lightweight audit on a business website.
 * @param {string} urlStr - The website URL to audit
 * @returns {Promise<Object>} Formatted website audit results
 */
export async function analyzeWebsite(urlStr) {
  if (!urlStr) {
    return {
      status: "NO_WEBSITE",
      isHttps: false,
      isMobileFriendly: false,
      pageTitle: null,
      metaDescription: null,
      h1: null,
      contactInfoFound: { emails: [], phones: [], whatsapp: false },
      ctaFound: false,
      performanceScore: 0,
      uxQualityScore: "No website",
      rawMetrics: { error: "Business does not have a website URL listed." },
      auditedAt: new Date().toISOString()
    };
  }

  let normalizedUrl = urlStr.trim();
  // Ensure the protocol is present
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // SSRF Protection
  const validation = await validateUrl(normalizedUrl);
  if (!validation.valid) {
    return {
      status: "UNKNOWN",
      websiteUrl: normalizedUrl,
      isHttps: normalizedUrl.startsWith("https:"),
      isMobileFriendly: false,
      pageTitle: null,
      metaDescription: null,
      h1: null,
      contactInfoFound: { emails: [], phones: [], whatsapp: false },
      ctaFound: false,
      performanceScore: 0,
      uxQualityScore: "URL Blocked",
      rawMetrics: { error: validation.error },
      auditedAt: new Date().toISOString()
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        // Set standard web browser agent to avoid bot-blocking shields
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });

    clearTimeout(timeoutId);
    const loadTimeMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: "POOR_WEBSITE",
        websiteUrl: normalizedUrl,
        isHttps: normalizedUrl.startsWith("https:"),
        isMobileFriendly: false,
        pageTitle: null,
        metaDescription: null,
        h1: null,
        contactInfoFound: { emails: [], phones: [], whatsapp: false },
        ctaFound: false,
        performanceScore: Math.max(10, Math.round(100 - (loadTimeMs / 100))),
        uxQualityScore: `Server error (${response.status})`,
        rawMetrics: { error: `Server returned response status ${response.status}`, loadTimeMs },
        auditedAt: new Date().toISOString()
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return {
        status: "UNKNOWN",
        websiteUrl: response.url,
        isHttps: response.url.startsWith("https:"),
        isMobileFriendly: false,
        pageTitle: null,
        metaDescription: null,
        h1: null,
        contactInfoFound: { emails: [], phones: [], whatsapp: false },
        ctaFound: false,
        performanceScore: 50,
        uxQualityScore: "Non-HTML resource",
        rawMetrics: { error: `Unsupported content-type: ${contentType}`, loadTimeMs },
        auditedAt: new Date().toISOString()
      };
    }

    const html = await response.text();
    const isHttps = response.url.startsWith("https:");

    // 1. Mobile viewport check
    const hasViewport = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
    const isMobileFriendly = hasViewport;

    // 2. Extract SEO fields via Regex
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : null;

    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) ||
                      html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i) ||
                      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : null;

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, "").trim() : null;

    // 3. Find contact details and CTAs
    const contactInfoFound = {
      emails: [],
      phones: [],
      whatsapp: false
    };

    // Grab email links (mailto)
    const mailtoRegex = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    let match;
    while ((match = mailtoRegex.exec(html)) !== null) {
      if (!contactInfoFound.emails.includes(match[1].toLowerCase())) {
        contactInfoFound.emails.push(match[1].toLowerCase());
      }
    }

    // Secondary plain email match in text
    const textEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const textEmails = html.match(textEmailRegex) || [];
    textEmails.forEach(e => {
      const lower = e.toLowerCase();
      // Filter out files that look like emails inside scripts
      if (!lower.endsWith(".png") && !lower.endsWith(".jpg") && !lower.endsWith(".js") && !lower.endsWith(".css") && !lower.endsWith(".webp") && !lower.endsWith(".gif")) {
        if (!contactInfoFound.emails.includes(lower) && contactInfoFound.emails.length < 5) {
          contactInfoFound.emails.push(lower);
        }
      }
    });

    // Grab phone links (tel)
    const telRegex = /tel:([+0-9\s-]{5,18})/gi;
    while ((match = telRegex.exec(html)) !== null) {
      const cleanPhone = match[1].replace(/\s+/g, "");
      if (!contactInfoFound.phones.includes(cleanPhone)) {
        contactInfoFound.phones.push(cleanPhone);
      }
    }

    // Grab WhatsApp presence
    const hasWhatsApp = /wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp\.com\/send/i.test(html);
    contactInfoFound.whatsapp = hasWhatsApp;

    // Check for CTA (Call To Action buttons/text)
    const textWithoutScripts = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
    const ctaKeywords = /contact|call us|book|get a quote|quote|schedule|inquiry|inquire|whatsapp|message/i;
    const hasContactCTA = hasWhatsApp || ctaKeywords.test(textWithoutScripts);

    // 4. Score performance based on response time
    let performanceScore = 100;
    if (loadTimeMs > 4000) performanceScore = 20;
    else if (loadTimeMs > 2500) performanceScore = 45;
    else if (loadTimeMs > 1500) performanceScore = 70;
    else if (loadTimeMs > 800) performanceScore = 85;

    // 5. Categorize UX quality and overall website status
    const missingElements = [];
    if (!isHttps) missingElements.push("No HTTPS");
    if (!isMobileFriendly) missingElements.push("No viewport meta (not mobile responsive)");
    if (!pageTitle) missingElements.push("Missing title tag");
    if (!metaDescription) missingElements.push("Missing description tag");
    if (!hasContactCTA) missingElements.push("No contact CTA buttons found");
    if (performanceScore < 60) missingElements.push("Slow page load speed");

    let uxQualityScore = "GOOD";
    let status = "GOOD_WEBSITE";

    if (missingElements.length >= 4 || !isMobileFriendly) {
      status = "POOR_WEBSITE";
      uxQualityScore = "POOR: " + missingElements.join("; ");
    } else if (missingElements.length > 0) {
      status = "NEEDS_IMPROVEMENT";
      uxQualityScore = "NEEDS IMPROVEMENT: " + missingElements.join("; ");
    }

    return {
      status,
      websiteUrl: response.url,
      isHttps,
      isMobileFriendly,
      pageTitle: pageTitle ? pageTitle.substring(0, 200) : null,
      metaDescription: metaDescription ? metaDescription.substring(0, 300) : null,
      h1: h1 ? h1.substring(0, 200) : null,
      contactInfoFound,
      ctaFound: hasContactCTA,
      performanceScore,
      uxQualityScore,
      rawMetrics: {
        loadTimeMs,
        missingCount: missingElements.length,
        hasViewport
      },
      auditedAt: new Date().toISOString()
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const loadTimeMs = Date.now() - startTime;
    return {
      status: "POOR_WEBSITE",
      websiteUrl: normalizedUrl,
      isHttps: normalizedUrl.startsWith("https:"),
      isMobileFriendly: false,
      pageTitle: null,
      metaDescription: null,
      h1: null,
      contactInfoFound: { emails: [], phones: [], whatsapp: false },
      ctaFound: false,
      performanceScore: 5,
      uxQualityScore: `Scrape error (${err.name === "AbortError" ? "Timeout" : err.message})`,
      rawMetrics: { error: err.message, loadTimeMs },
      auditedAt: new Date().toISOString()
    };
  }
}
