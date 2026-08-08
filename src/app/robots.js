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
          "/api/upload",
          "/pay/verify",
          "/api/payment"
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
