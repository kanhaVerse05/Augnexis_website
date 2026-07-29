import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");

// Ensure data directory and files exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(BLOGS_FILE)) {
    const defaultBlogs = [
      {
        id: "1",
        title: "The Rise of Serverless Cloud Architectures",
        category: "Cloud Computing",
        date: "July 24, 2026",
        author: "Akash Choudhary",
        readTime: "6 Min Read",
        excerpt: "Explore how serverless systems lower running costs by executing code logic only when triggered, avoiding idle hosting charges.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        gradient: "linear-gradient(135deg, #0a192f 0%, #0052cc 100%)"
      },
      {
        id: "2",
        title: "Integrating Large Language Models Safely in SaaS",
        category: "Artificial Intelligence",
        date: "July 18, 2026",
        author: "Abhimanyu Mishra",
        readTime: "8 Min Read",
        excerpt: "Learn how to wrap LLM requests with strict system prompts and input sanitation logic to protect corporate databases from injections.",
        image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
        gradient: "linear-gradient(135deg, #0052cc 0%, #00b4d8 100%)"
      },
      {
        id: "3",
        title: "Designing Multi-Tenant API Gateways for Scale",
        category: "Backend Engineering",
        date: "July 12, 2026",
        author: "Akash Choudhary",
        readTime: "5 Min Read",
        excerpt: "A deep dive into rate limiting, request token auth, and load balancing configurations inside modern Node.js/Go API gateways.",
        image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80",
        gradient: "linear-gradient(135deg, #070f24 0%, #0066fe 100%)"
      }
    ];
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(defaultBlogs, null, 2), "utf-8");
  }
}

export function readLeads() {
  initDB();
  const data = fs.readFileSync(LEADS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

export function writeLeads(leads) {
  initDB();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

export function readBlogs() {
  initDB();
  const data = fs.readFileSync(BLOGS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

export function writeBlogs(blogs) {
  initDB();
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
}
