import { Pool } from "pg";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Connection Pool (only if DATABASE_URL is set)
let pool = null;
if (process.env.DATABASE_URL) {
  const connectionString = process.env.DATABASE_URL;
  // Disable SSL by default unless explicitly requested via sslmode=require
  const requireSSL = connectionString.includes("sslmode=require") || connectionString.includes("ssl=true");
  pool = new Pool({
    connectionString,
    ssl: requireSSL ? { rejectUnauthorized: false } : false
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
  if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: "user_super_admin",
        username: "admin",
        password: "admin123",
        role: "SUPER_ADMIN",
        permissions: ["leads", "payments", "blogs", "lead_hunter", "users"],
        createdAt: new Date().toLocaleString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
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
        created_at VARCHAR(100) NOT NULL,
        assigned_to VARCHAR(100)
      );
    `);

    // Dynamically ensure assigned_to exists in leads
    await client.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100);");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        permissions TEXT[],
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // Ensure a default super admin user exists in DB
    const adminCheck = await client.query("SELECT COUNT(*) FROM users WHERE username = 'admin'");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      await client.query(
        "INSERT INTO users (id, username, password, role, permissions, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        ["user_super_admin", "admin", "admin123", "SUPER_ADMIN", ["leads", "payments", "blogs", "lead_hunter", "users"], new Date().toLocaleString()]
      );
    }

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

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        amount NUMERIC NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_session_id VARCHAR(255),
        created_at VARCHAR(100) NOT NULL,
        updated_at VARCHAR(100)
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
        createdAt: row.created_at,
        assignedTo: row.assigned_to || ""
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
          "INSERT INTO leads (id, name, phone, email, subject, message, created_at, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [lead.id, lead.name, lead.phone, lead.email, lead.subject, lead.message, lead.createdAt, lead.assignedTo || null]
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

// Local JSON Helpers for Payments
function readPaymentsLocal() {
  initLocalDB();
  const data = fs.readFileSync(PAYMENTS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

function writePaymentsLocal(payments) {
  initLocalDB();
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), "utf-8");
}

// Exported Functions for Payments
export async function readPayments() {
  if (pool) {
    try {
      await initPG();
      const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
      return result.rows.map(row => ({
        id: row.id,
        clientName: row.client_name,
        email: row.email,
        phone: row.phone,
        amount: parseFloat(row.amount),
        purpose: row.purpose,
        status: row.status,
        paymentSessionId: row.payment_session_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (err) {
      console.error("Postgres readPayments failed. Falling back to local JSON.", err);
      return readPaymentsLocal();
    }
  }
  return readPaymentsLocal();
}

export async function writePayments(payments) {
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      await client.query("BEGIN");
      await client.query("DELETE FROM payments");
      for (const payment of payments) {
        await client.query(
          "INSERT INTO payments (id, client_name, email, phone, amount, purpose, status, payment_session_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [
            payment.id,
            payment.clientName,
            payment.email,
            payment.phone,
            payment.amount,
            payment.purpose,
            payment.status,
            payment.paymentSessionId,
            payment.createdAt,
            payment.updatedAt
          ]
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
      console.error("Postgres writePayments failed. Falling back to local JSON.", err);
      writePaymentsLocal(payments);
    } finally {
      if (client) client.release();
    }
  } else {
    writePaymentsLocal(payments);
  }
}

export async function addPayment(payment) {
  const payments = await readPayments();
  payments.unshift(payment);
  await writePayments(payments);
}

export async function updatePaymentStatus(orderId, status) {
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      const updatedAt = new Date().toLocaleString();
      await client.query(
        "UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3",
        [status, updatedAt, orderId]
      );
      return;
    } catch (err) {
      console.error("Postgres updatePaymentStatus failed. Falling back to local JSON update.", err);
    } finally {
      if (client) client.release();
    }
  }

  // Fallback local update
  const payments = await readPaymentsLocal();
  const index = payments.findIndex(p => p.id === orderId);
  if (index !== -1) {
    payments[index].status = status;
    payments[index].updatedAt = new Date().toLocaleString();
    writePaymentsLocal(payments);
  }
}

// User Helpers (local + PG fallback)
function readUsersLocal() {
  initLocalDB();
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

function writeUsersLocal(users) {
  initLocalDB();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function readUsers() {
  if (pool) {
    try {
      await initPG();
      const res = await pool.query("SELECT * FROM users ORDER BY username ASC");
      return res.rows.map(row => ({
        id: row.id,
        username: row.username,
        password: row.password,
        role: row.role,
        permissions: row.permissions || [],
        createdAt: row.created_at
      }));
    } catch (err) {
      console.error("PG readUsers failed, using local JSON fallback:", err);
      return readUsersLocal();
    }
  }
  return readUsersLocal();
}

export async function writeUsers(users) {
  if (pool) {
    let client = null;
    try {
      await initPG();
      client = await pool.connect();
      await client.query("BEGIN");
      await client.query("DELETE FROM users");
      for (const user of users) {
        await client.query(
          "INSERT INTO users (id, username, password, role, permissions, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
          [user.id, user.username, user.password, user.role, user.permissions, user.createdAt]
        );
      }
      await client.query("COMMIT");
      return;
    } catch (err) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (e) {}
      }
      console.error("PG writeUsers failed, using local JSON fallback:", err);
      writeUsersLocal(users);
    } finally {
      if (client) client.release();
    }
  } else {
    writeUsersLocal(users);
  }
}

export async function createUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
}

export async function deleteUser(id) {
  let users = await readUsers();
  users = users.filter(u => u.id !== id);
  await writeUsers(users);
}

export async function assignLead(leadId, username) {
  if (pool) {
    try {
      await initPG();
      await pool.query("UPDATE leads SET assigned_to = $1 WHERE id = $2", [username, leadId]);
      return;
    } catch (err) {
      console.error("PG assignLead failed, using local JSON fallback:", err);
    }
  }
  
  const leads = await readLeads();
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    leads[index].assignedTo = username;
    await writeLeads(leads);
  }
}
