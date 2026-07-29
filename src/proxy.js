import { NextResponse } from "next/server";

// List of malicious bot signatures, scraper engines, and command-line request tools to block
const BLOCKED_BOT_PATTERNS = [
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "rogerbot",
  "megaindex",
  "blexbot",
  "petalbot",
  "sogou",
  "dirb",
  "sqlmap",
  "nikto",
  "hydra",
  "nmap",
  "censys",
  "shodan",
  "webmeup",
  "screaming frog",
  "headlesschrome",
  "selenium",
  "playwright",
  "puppeteer",
  "scrapy",
  "beautifulsoup",
  "python-requests",
  "wget",
  "curl",
  "libwww",
  "httpclient",
  "go-http-client",
  "postmanruntime",
  "node-fetch",
  "axios",
  "got"
];

// List of allowed search engines, social crawlers, and reputable AI bots
const ALLOWED_CRAWLERS = [
  "googlebot",
  "bingbot",
  "applebot",
  "duckduckbot",
  "yandexbot",
  "facebot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "chatgpt",
  "gptbot",
  "claudebot",
  "anthropic-ai"
];

export function proxy(request) {
  const userAgent = request.headers.get("user-agent") || "";
  const lowercaseUA = userAgent.toLowerCase();

  // 1. Block empty or missing User-Agent headers (common in script bots / basic DDoS)
  if (!userAgent || userAgent.trim() === "") {
    return new NextResponse(
      JSON.stringify({ error: "Access Denied: Missing User-Agent header" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. If it is a known allowed search engine or AI bot, bypass the check immediately
  const isAllowedCrawler = ALLOWED_CRAWLERS.some(crawler => lowercaseUA.includes(crawler));
  if (isAllowedCrawler) {
    return NextResponse.next();
  }

  // 3. Block malicious scrapers and utility CLI request tools
  const isBlockedBot = BLOCKED_BOT_PATTERNS.some(bot => lowercaseUA.includes(bot));
  if (isBlockedBot) {
    return new NextResponse(
      JSON.stringify({ error: "Access Denied: Automated scraping or malicious traffic blocked" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. For standard user traffic (Chrome, Safari, Firefox, Edge, etc.), proceed normally
  return NextResponse.next();
}

// Apply middleware to all routes except static assets and uploaded directories
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded asset directories)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
