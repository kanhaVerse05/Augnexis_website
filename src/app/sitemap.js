import { readBlogs } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://augnexis.tech";

  // Static routes configuration
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/solutions",
    "/technologies",
    "/blogs",
    "/contact",
    "/privacy-policy"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8
  }));

  // Dynamic service detail routes
  const serviceIds = ["ai", "software", "web", "mobile", "cloud", "marketing"];
  const serviceRoutes = serviceIds.map((id) => ({
    url: `${baseUrl}/services/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  // Dynamic blog routes from the database
  let blogRoutes = [];
  try {
    const blogs = await readBlogs();
    blogRoutes = blogs.map((post) => ({
      url: `${baseUrl}/blogs/${post.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    }));
  } catch (error) {
    console.error("Sitemap generator failed to load blogs from db:", error);
  }

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
