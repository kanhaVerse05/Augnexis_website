"use client";

import { useState, useEffect } from "react";
import { Lock, Mail, Phone, Clock, Trash2, PlusCircle, FileText, LayoutDashboard, LogOut, Calendar, User, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState("leads");

  // Data states
  const [leads, setLeads] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);

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

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        <Mail size={14} style={{ display: "inline", marginRight: "0.25rem", color: "var(--color-blue-secondary)" }} />
                        <strong>Email: </strong><a href={`mailto:${lead.email}`} style={{ color: "var(--color-blue-secondary)" }}>{lead.email}</a>
                      </p>
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        <Phone size={14} style={{ display: "inline", marginRight: "0.25rem", color: "var(--color-blue-secondary)" }} />
                        <strong>Phone: </strong><a href={`tel:${lead.phone}`} style={{ color: "var(--color-blue-secondary)" }}>{lead.phone}</a>
                      </p>
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        <Clock size={14} style={{ display: "inline", marginRight: "0.25rem", color: "var(--color-blue-secondary)" }} />
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
      </div>
    </div>
  );
}
