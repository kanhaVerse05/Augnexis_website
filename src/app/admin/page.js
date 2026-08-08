"use client";

import { useState, useEffect } from "react";
import { Lock, Mail, Phone, Clock, Trash2, PlusCircle, FileText, LayoutDashboard, LogOut, Calendar, User, ArrowRight, CreditCard, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState("leads");

  // Data states
  const [leads, setLeads] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Link generation states
  const [genForm, setGenForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    purpose: ""
  });
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // New blog form state
  const [newBlog, setNewBlog] = useState({
    title: "",
    category: "Web Development",
    author: "Akash Choudhary",
    excerpt: "",
    image: "",
    gradient: "linear-gradient(135deg, #0a192f 0%, #0052cc 100%)"
  });
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogSuccess, setBlogSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token === "admin-secret-token") {
      setIsLoggedIn(true);
      fetchLeads();
      fetchBlogs();
      fetchPayments();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        setIsLoggedIn(true);
        fetchLeads();
        fetchBlogs();
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Internal connection error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch("/api/leads", {
        headers: { "Authorization": "admin-secret-token" }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setBlogsLoading(true);
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setBlogsLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleGenerateLink = (e) => {
    e.preventDefault();
    if (!genForm.amount || !genForm.purpose) {
      alert("Amount and Purpose are required to generate a link.");
      return;
    }
    
    // Construct search parameters
    const params = new URLSearchParams();
    if (genForm.name) params.append("name", genForm.name);
    if (genForm.email) params.append("email", genForm.email);
    if (genForm.phone) params.append("phone", genForm.phone);
    params.append("amount", genForm.amount);
    params.append("purpose", genForm.purpose);

    const baseUrl = window.location.origin;
    const paymentUrl = `${baseUrl}/pay?${params.toString()}`;
    setGeneratedUrl(paymentUrl);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteLead = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": "admin-secret-token" }
      });
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete lead", err);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": "admin-secret-token" }
      });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete blog post", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Authorization": "admin-secret-token"
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewBlog({ ...newBlog, image: data.url });
        alert("Image uploaded successfully!");
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch (err) {
      alert("Error uploading image.");
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    setBlogSubmitting(true);
    setBlogSuccess(false);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "admin-secret-token"
        },
        body: JSON.stringify(newBlog)
      });
      if (res.ok) {
        setBlogSuccess(true);
        setNewBlog({
          title: "",
          category: "Web Development",
          author: "Akash Choudhary",
          excerpt: "",
          image: "",
          gradient: "linear-gradient(135deg, #0a192f 0%, #0052cc 100%)"
        });
        // Clear file input
        const fileInput = document.getElementById("image-file");
        if (fileInput) fileInput.value = "";
        fetchBlogs();
      } else {
        alert("Failed to submit new blog post.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setBlogSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fade-in-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F7FAFD", padding: "2rem" }}>
        <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--color-blue-light)",
              color: "var(--color-blue-secondary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-blue-deep)", fontWeight: "700" }}>Admin Access</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Enter administrator credentials to login.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="pass">Security Password</label>
              <input
                type="password"
                id="pass"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && <p style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: "500", margin: "0" }}>{loginError}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-section" style={{ minHeight: "100vh", backgroundColor: "#F7FAFD" }}>
      <div className="inner-header-spacer"></div>

      <div className="container" style={{ paddingBottom: "5rem" }}>
        {/* Admin Navigation Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "between", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem" }}>
          <div>
            <span className="sub-title" style={{ display: "inline-block" }}>CONSOLE CONTROL</span>
            <h1 style={{ fontSize: "2.25rem", color: "var(--color-blue-deep)", fontWeight: "800", marginTop: "0.25rem" }}>Augnexis Workspace</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Console Tab Links */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveSection("leads")}
            className={`tech-tab-btn ${activeSection === "leads" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <LayoutDashboard size={16} /> Client Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveSection("payments")}
            className={`tech-tab-btn ${activeSection === "payments" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <CreditCard size={16} /> Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveSection("write-blog")}
            className={`tech-tab-btn ${activeSection === "write-blog" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <PlusCircle size={16} /> Publish Blog
          </button>
          <button
            onClick={() => setActiveSection("manage-blogs")}
            className={`tech-tab-btn ${activeSection === "manage-blogs" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FileText size={16} /> Manage Blogs ({blogs.length})
          </button>
        </div>

        {/* Section: Leads */}
        {activeSection === "leads" && (
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-blue-deep)", marginBottom: "1.25rem", fontWeight: "700" }}>Recent Leads & Inquiries</h2>
            {leadsLoading ? (
              <p style={{ color: "var(--color-text-secondary)" }}>Loading leads...</p>
            ) : leads.length === 0 ? (
              <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--color-text-secondary)" }}>No client inquiries recorded yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {leads.map((lead) => (
                  <div key={lead.id} className="glass-card" style={{ padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "between", alignItems: "start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.25rem", color: "var(--color-blue-deep)", fontWeight: "700" }}>{lead.name}</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                          Subject: <strong style={{ color: "var(--color-blue-deep)" }}>{lead.subject}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        style={{
                          marginLeft: "auto",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.85rem",
                          fontWeight: "600"
                        }}
                      >
                        <Trash2 size={16} /> Delete Lead
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                      <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                        <Mail size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                        <strong>Email: </strong><a href={`mailto:${lead.email}`} style={{ color: "var(--color-blue-secondary)", wordBreak: "break-all" }}>{lead.email}</a>
                      </p>
                      <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                        <Phone size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                        <strong>Phone: </strong><a href={`tel:${lead.phone}`} style={{ color: "var(--color-blue-secondary)" }}>{lead.phone}</a>
                      </p>
                      <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                        <Clock size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                        <strong>Received: </strong>{lead.createdAt}
                      </p>
                    </div>

                    <div style={{ backgroundColor: "#F7FAFD", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                      <h4 style={{ fontSize: "0.85rem", color: "var(--color-blue-deep)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: "700" }}>
                        Project Description:
                      </h4>
                      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                        {lead.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Write Blog */}
        {activeSection === "write-blog" && (
          <div className="glass-card" style={{ padding: "3rem", maxWidth: "800px" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-blue-deep)", marginBottom: "1.5rem", fontWeight: "700" }}>Compose & Publish Blog Post</h2>
            
            {blogSuccess && (
              <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #10b981", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", color: "#065f46", fontSize: "0.9rem", fontWeight: "500" }}>
                ✓ Blog post has been published successfully and is live on the Blog page!
              </div>
            )}

            <form onSubmit={handleAddBlog} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Article Title</label>
                  <input
                    type="text"
                    id="title"
                    className="form-input"
                    placeholder="e.g. Next-Gen Web Optimization"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    className="form-input"
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                    required
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Mobile Applications">Mobile Applications</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="author">Author Name</label>
                  <select
                    id="author"
                    className="form-input"
                    value={newBlog.author}
                    onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                    required
                  >
                    <option value="Akash Choudhary">Akash Choudhary</option>
                    <option value="Abhimanyu Mishra">Abhimanyu Mishra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gradient">Card Header Color Theme</label>
                  <select
                    id="gradient"
                    className="form-input"
                    value={newBlog.gradient}
                    onChange={(e) => setNewBlog({ ...newBlog, gradient: e.target.value })}
                    required
                  >
                    <option value="linear-gradient(135deg, #0a192f 0%, #0052cc 100%)">Deep Navy Blue</option>
                    <option value="linear-gradient(135deg, #0052cc 0%, #00b4d8 100%)">Bright Cyan / Blue</option>
                    <option value="linear-gradient(135deg, #070f24 0%, #0066fe 100%)">Classic Royal Blue</option>
                    <option value="linear-gradient(135deg, #020617 0%, #3b82f6 100%)">Dark Slate & Sky</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="image-file">Upload Banner Image</label>
                  <input
                    type="file"
                    id="image-file"
                    className="form-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="image-url">Or Image URL</label>
                  <input
                    type="text"
                    id="image-url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={newBlog.image || ""}
                    onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                  />
                </div>
              </div>

              {newBlog.image && (
                <div style={{ marginTop: "-0.5rem", marginBottom: "0.5rem", borderRadius: "8px", overflow: "hidden", height: "150px", border: "1px solid var(--color-border)" }}>
                  <img src={newBlog.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="excerpt">Article Excerpt (Content Summary)</label>
                <textarea
                  id="excerpt"
                  className="form-input form-textarea"
                  style={{ minHeight: "150px" }}
                  placeholder="Summarize the core topics and learnings of this article..."
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" disabled={blogSubmitting} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                {blogSubmitting ? "Publishing..." : "Publish Article"} <PlusCircle size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Section: Manage Blogs */}
        {activeSection === "manage-blogs" && (
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-blue-deep)", marginBottom: "1.25rem", fontWeight: "700" }}>Manage Live Blog Articles</h2>
            {blogsLoading ? (
              <p style={{ color: "var(--color-text-secondary)" }}>Loading blogs...</p>
            ) : blogs.length === 0 ? (
              <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--color-text-secondary)" }}>No blog articles published yet.</p>
              </div>
            ) : (
              <div className="grid-2">
                {blogs.map((post) => (
                  <div key={post.id} className="blog-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {post.image ? (
                      <div style={{ height: "150px", position: "relative", overflow: "hidden" }}>
                        <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{
                          position: "absolute",
                          top: "1rem",
                          left: "1rem",
                          color: "var(--color-white)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          backgroundColor: "rgba(7, 15, 36, 0.65)",
                          padding: "0.4rem 1rem",
                          borderRadius: "var(--radius-full)",
                          backdropFilter: "blur(4px)"
                        }}>
                          {post.category}
                        </div>
                        <button
                          onClick={() => handleDeleteBlog(post.id)}
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            backgroundColor: "#ef4444",
                            border: "none",
                            color: "var(--color-white)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            padding: "0.4rem 1rem",
                            borderRadius: "4px"
                          }}
                        >
                          <Trash2 size={12} /> Delete Post
                        </button>
                      </div>
                    ) : (
                      <div className="blog-card-image-placeholder" style={{ background: post.gradient, display: "flex", justifyContent: "between", alignItems: "center", padding: "1.5rem 2rem" }}>
                        <div style={{
                          color: "var(--color-white)",
                          fontWeight: "700",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          backgroundColor: "rgba(7, 15, 36, 0.4)",
                          padding: "0.4rem 1rem",
                          borderRadius: "var(--radius-full)"
                        }}>
                          {post.category}
                        </div>
                        <button
                          onClick={() => handleDeleteBlog(post.id)}
                          style={{
                            marginLeft: "auto",
                            backgroundColor: "#ef4444",
                            border: "none",
                            color: "var(--color-white)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            padding: "0.4rem 1rem",
                            borderRadius: "4px"
                          }}
                        >
                          <Trash2 size={12} /> Delete Post
                        </button>
                      </div>
                    )}
                    <div className="blog-card-content" style={{ display: "flex", flexDirection: "column", flexGrow: "1" }}>
                      <div className="blog-card-meta">
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Calendar size={14} /> {post.date}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <User size={14} /> By {post.author}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={14} /> {post.readTime}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.25rem", margin: "0.75rem 0", color: "var(--color-blue-deep)" }}>{post.title}</h3>
                      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", lineHeight: "1.5", flexGrow: "1" }}>{post.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Payments */}
        {activeSection === "payments" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
            
            {/* Left Column: Generate Link & QR */}
            <div className="glass-card" style={{ padding: "2rem", border: "1px solid var(--color-border)", position: "sticky", top: "20px" }}>
              <h2 style={{ fontSize: "1.3rem", color: "var(--color-blue-deep)", fontWeight: "700", marginBottom: "0.25rem" }}>
                Generate Payment Link
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Create custom billing links with pre-filled amounts & invoices for clients.
              </p>

              <form onSubmit={handleGenerateLink} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Client Name (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={genForm.name}
                    onChange={(e) => setGenForm({ ...genForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Email (Optional)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="client@mail.com"
                      value={genForm.email}
                      onChange={(e) => setGenForm({ ...genForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9540252590"
                      value={genForm.phone}
                      onChange={(e) => setGenForm({ ...genForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Payment Purpose / Invoice *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Website Hosting Fee"
                    value={genForm.purpose}
                    onChange={(e) => setGenForm({ ...genForm, purpose: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Amount (INR) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    value={genForm.amount}
                    onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <CreditCard size={16} /> Generate Link & QR Code
                </button>
              </form>

              {/* Generated Section */}
              {generatedUrl && (
                <div style={{ marginTop: "2rem", borderTop: "1px dashed var(--color-border)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-blue-secondary)", textTransform: "uppercase" }}>Scan to Pay QR</span>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedUrl)}`}
                      alt="Payment QR Code"
                      style={{ border: "1px solid var(--color-border)", padding: "8px", borderRadius: "8px", backgroundColor: "#fff", width: "150px", height: "150px" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Copy Link</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        className="form-input"
                        value={generatedUrl}
                        readOnly
                        style={{ fontSize: "0.8rem", backgroundColor: "#f9fafb" }}
                      />
                      <button onClick={handleCopyLink} className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "0.8rem", flexShrink: 0 }}>
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <a
                    href={`https://api.whatsapp.com/send?${genForm.phone ? `phone=91${genForm.phone}&` : ""}text=${encodeURIComponent(
                      `Hello ${genForm.name || "Client"},\n\nPlease find your secure payment link for "${genForm.purpose}" of amount ₹${genForm.amount}:\n${generatedUrl}\n\nThank you,\nAugnexis Technologies`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ backgroundColor: "#25d366", borderColor: "#25d366", width: "100%", justifyContent: "center", display: "flex", gap: "8px", alignItems: "center", fontSize: "0.85rem" }}
                  >
                    Share on WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Transactions Log */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ fontSize: "1.3rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>Client Payments Log</h2>
                <button onClick={fetchPayments} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                  Refresh
                </button>
              </div>

              {paymentsLoading ? (
                <p style={{ color: "var(--color-text-secondary)" }}>Loading payments...</p>
              ) : payments.length === 0 ? (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                  <p style={{ color: "var(--color-text-secondary)" }}>No payment transactions recorded yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {payments.map((payment) => (
                    <div key={payment.id} className="glass-card" style={{ padding: "2rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                        <div>
                          <h3 style={{ fontSize: "1.25rem", color: "var(--color-blue-deep)", fontWeight: "700" }}>{payment.clientName}</h3>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                            Purpose: <strong style={{ color: "var(--color-blue-deep)" }}>{payment.purpose}</strong>
                          </p>
                        </div>
                        
                        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "end", gap: "0.25rem" }}>
                          <span style={{ 
                            fontSize: "1.25rem", 
                            fontWeight: "800", 
                            color: "var(--color-blue-secondary)" 
                          }}>
                            ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          
                          <span style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: 
                              payment.status === "SUCCESS" ? "rgba(34, 197, 94, 0.1)" :
                              payment.status === "PENDING" ? "rgba(234, 179, 8, 0.1)" :
                              "rgba(239, 68, 68, 0.1)",
                            color: 
                              payment.status === "SUCCESS" ? "#22c55e" :
                              payment.status === "PENDING" ? "#d97706" :
                              "#ef4444"
                          }}>
                            {payment.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", fontSize: "0.9rem", borderTop: "1px dashed var(--color-border)", paddingTop: "1rem" }}>
                        <div>
                          <h4 style={{ fontSize: "0.8rem", color: "var(--color-blue-deep)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: "700" }}>
                            Contact Details
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                              <Mail size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                              <strong>Email: </strong><a href={`mailto:${payment.email}`} style={{ color: "var(--color-blue-secondary)", wordBreak: "break-all" }}>{payment.email}</a>
                            </p>
                            <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                              <Phone size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                              <strong>Phone: </strong><a href={`tel:${payment.phone}`} style={{ color: "var(--color-blue-secondary)" }}>{payment.phone}</a>
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: "0.8rem", color: "var(--color-blue-deep)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: "700" }}>
                            Transaction Info
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <p style={{ color: "var(--color-text-secondary)", margin: "0" }}>
                              <strong>Order ID: </strong><span style={{ fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all" }}>{payment.id}</span>
                            </p>
                            <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                              <Clock size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                              <strong>Created: </strong>{payment.createdAt}
                            </p>
                            {payment.updatedAt && (
                              <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                                <ShieldCheck size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                                <strong>Settled: </strong>{payment.updatedAt}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
