import { Pool } from "pg";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");

// Connection Pool (only if DATABASE_URL is set)
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
  });
}

// Ensure local directory and files exist (for JSON fallback)
function initLocalDB() {
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

// Initialize tables in PostgreSQL
let dbInitialized = false;
async function initPG() {
  if (dbInitialized || !pool) return;

  let client = null;
  try {
    client = await pool.connect();
    // Create leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // Create blogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        excerpt TEXT NOT NULL,
        image TEXT,
        gradient TEXT
      );
    `);

    // Seed default blogs if table is empty
    const checkBlogs = await client.query("SELECT COUNT(*) FROM blogs");
    if (parseInt(checkBlogs.rows[0].count) === 0) {
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

      for (const blog of defaultBlogs) {
        await client.query(
          "INSERT INTO blogs (id, title, category, date, author, read_time, excerpt, image, gradient) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [blog.id, blog.title, blog.category, blog.date, blog.author, blog.readTime, blog.excerpt, blog.image, blog.gradient]
        );
      }
    }
    dbInitialized = true;
  } catch (err) {
    console.error("Postgres init error:", err);
    throw err;
  } finally {
    if (client) client.release();
  }
}

// Local JSON Helpers
function readLeadsLocal() {
  initLocalDB();
  const data = fs.readFileSync(LEADS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

function writeLeadsLocal(leads) {
  initLocalDB();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

function readBlogsLocal() {
  initLocalDB();
  const data = fs.readFileSync(BLOGS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

function writeBlogsLocal(blogs) {
  initLocalDB();
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
}

// Exported Functions
export async function readLeads() {
  if (pool) {
    try {
      await initPG();
      const result = await pool.query("SELECT * FROM leads ORDER BY id DESC");
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        subject: row.subject,
        message: row.message,
        createdAt: row.created_at
      }));
    } catch (err) {
      console.error("Postgres readLeads failed. Falling back to local JSON.", err);
      return readLeadsLocal();
    }
  }
  return readLeadsLocal();
}

export async function writeLeads(leads) {
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      await client.query("BEGIN");
      await client.query("DELETE FROM leads");
      for (const lead of leads) {
        await client.query(
          "INSERT INTO leads (id, name, phone, email, subject, message, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [lead.id, lead.name, lead.phone, lead.email, lead.subject, lead.message, lead.createdAt]
        );
      }
      await client.query("COMMIT");
      return;
    } catch (err) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackErr) {
          console.error("Rollback failed:", rollbackErr);
        }
      }
      console.error("Postgres writeLeads failed. Falling back to local JSON.", err);
      writeLeadsLocal(leads);
    } finally {
      if (client) client.release();
    }
  } else {
    writeLeadsLocal(leads);
  }
}

export async function readBlogs() {
  if (pool) {
    try {
      await initPG();
      const result = await pool.query("SELECT * FROM blogs ORDER BY id DESC");
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        date: row.date,
        author: row.author,
        readTime: row.read_time,
        excerpt: row.excerpt,
        image: row.image,
        gradient: row.gradient
      }));
    } catch (err) {
      console.error("Postgres readBlogs failed. Falling back to local JSON.", err);
      return readBlogsLocal();
    }
  }
  return readBlogsLocal();
}

export async function writeBlogs(blogs) {
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      await client.query("BEGIN");
      await client.query("DELETE FROM blogs");
      for (const blog of blogs) {
        await client.query(
          "INSERT INTO blogs (id, title, category, date, author, read_time, excerpt, image, gradient) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [blog.id, blog.title, blog.category, blog.date, blog.author, blog.readTime, blog.excerpt, blog.image, blog.gradient]
        );
      }
      await client.query("COMMIT");
      return;
    } catch (err) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackErr) {
          console.error("Rollback failed:", rollbackErr);
        }
      }
      console.error("Postgres writeBlogs failed. Falling back to local JSON.", err);
      writeBlogsLocal(blogs);
    } finally {
      if (client) client.release();
    }
  } else {
    writeBlogsLocal(blogs);
  }
}
