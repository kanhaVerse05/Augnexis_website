export default function robots() {
  const baseUrl = "https://augnexis.tech";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/leads",
          "/api/admin",
          "/api/upload"
        ]
      },
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "PetalBot",
          "Baiduspider",
          "Sogou web spider",
          "censys",
          "shodan"
        ],
        disallow: "/"
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
