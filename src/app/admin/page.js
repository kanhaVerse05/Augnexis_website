"use client";

import { useState, useEffect } from "react";
import { Lock, Mail, Phone, Clock, Trash2, PlusCircle, FileText, LayoutDashboard, LogOut, Calendar, User, ArrowRight, CreditCard, ShieldCheck, Users, Activity, Settings, UserPlus } from "lucide-react";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState("leads");

  // Multi-user details
  const [userRole, setUserRole] = useState("USER");
  const [userPermissions, setUserPermissions] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  
  // Admin user list (for SUPER_ADMIN management)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

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

  // User creation form states (for super admin)
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    password: "",
    role: "AGENT",
    permissions: ["leads", "lead_hunter"]
  });
  const [userSuccess, setUserSuccess] = useState(false);
  const [userError, setUserError] = useState("");

  // CRM Lead Management states
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [showAddLead, setShowAddLead] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [manualLeadForm, setManualLeadForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    subject: "Manual Lead Entry",
    message: "",
    source: "manual",
    status: "NEW",
    assignedTo: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsLoggedIn(true);
      const role = localStorage.getItem("admin_role") || "SUPER_ADMIN";
      const permissions = JSON.parse(
        localStorage.getItem("admin_permissions") || '["leads", "payments", "blogs", "lead_hunter", "users"]'
      );
      const user = localStorage.getItem("admin_username") || "admin";
      
      setUserRole(role);
      setUserPermissions(permissions);
      setCurrentUser(user);

      // Load sections based on permissions
      if (role === "SUPER_ADMIN" || permissions.includes("leads")) fetchLeads(token);
      if (role === "SUPER_ADMIN" || permissions.includes("blogs")) fetchBlogs();
      if (role === "SUPER_ADMIN" || permissions.includes("payments")) fetchPayments(token);
      if (role === "SUPER_ADMIN") {
        fetchUsers(token);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_role", data.user.role);
        localStorage.setItem("admin_username", data.user.username);
        localStorage.setItem("admin_permissions", JSON.stringify(data.user.permissions));
        
        setIsLoggedIn(true);
        setUserRole(data.user.role);
        setUserPermissions(data.user.permissions);
        setCurrentUser(data.user.username);

        // Fetch based on permissions
        if (data.user.role === "SUPER_ADMIN" || data.user.permissions.includes("leads")) fetchLeads(data.token);
        if (data.user.role === "SUPER_ADMIN" || data.user.permissions.includes("blogs")) fetchBlogs();
        if (data.user.role === "SUPER_ADMIN" || data.user.permissions.includes("payments")) fetchPayments(data.token);
        if (data.user.role === "SUPER_ADMIN") {
          fetchUsers(data.token);
        }
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Internal connection error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_permissions");
    setIsLoggedIn(false);
  };

  const fetchLeads = async (tokenOverride) => {
    setLeadsLoading(true);
    const token = tokenOverride || localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/leads", {
        headers: { "Authorization": token }
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

  const fetchPayments = async (tokenOverride) => {
    setPaymentsLoading(true);
    const token = tokenOverride || localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/payments", {
        headers: { "Authorization": token }
      });
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

  const fetchUsers = async (tokenOverride) => {
    setUsersLoading(true);
    const token = tokenOverride || localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": token }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users list", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess(false);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUserSuccess(true);
        setNewUserForm({
          username: "",
          password: "",
          role: "AGENT",
          permissions: ["leads", "lead_hunter"]
        });
        fetchUsers();
      } else {
        setUserError(data.error || "Failed to create user");
      }
    } catch (err) {
      setUserError("Connection error while creating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": localStorage.getItem("admin_token")
        }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(`Error deleting user: ${err.error}`);
      }
    } catch (err) {
      alert("Connection error while deleting user");
    }
  };

  const handleAssignLead = async (leadId, usernameVal) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "assign",
          id: leadId,
          assignedTo: usernameVal
        })
      });
      if (res.ok) {
        setLeads(prevLeads => prevLeads.map(l => {
          if (l.id === leadId) {
            return { ...l, assignedTo: usernameVal };
          }
          return l;
        }));
      } else {
        const err = await res.json();
        alert(`Error assigning lead: ${err.error}`);
      }
    } catch (err) {
      alert("Failed to assign lead");
    }
  };

  const handleManualLeadCreate = async (e) => {
    e.preventDefault();
    if (!manualLeadForm.name) return;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "create",
          lead: manualLeadForm
        })
      });
      const data = await res.json();
      if (res.ok && data.lead) {
        setLeads(prev => [data.lead, ...prev]);
        setShowAddLead(false);
        setManualLeadForm({
          name: "",
          companyName: "",
          phone: "",
          email: "",
          subject: "Manual Lead Entry",
          message: "",
          source: "manual",
          status: "NEW",
          assignedTo: ""
        });
        alert("Lead created successfully!");
      } else {
        alert(data.error || "Failed to create lead.");
      }
    } catch (err) {
      alert("Connection error while creating lead.");
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "update_status",
          id: leadId,
          status: newStatus
        })
      });
      if (res.ok) {
        setLeads(prevLeads => prevLeads.map(l => {
          if (l.id === leadId) {
            return { ...l, status: newStatus };
          }
          return l;
        }));
      } else {
        const err = await res.json();
        alert(`Error updating status: ${err.error}`);
      }
    } catch (err) {
      alert("Failed to update lead status");
    }
  };

  const handleBulkAssign = async () => {
    if (selectedLeadIds.length === 0 || !bulkAssignee) {
      alert("Please select leads and an assignee first.");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "bulk_assign",
          ids: selectedLeadIds,
          assignedTo: bulkAssignee
        })
      });
      if (res.ok) {
        setLeads(prevLeads => prevLeads.map(l => {
          if (selectedLeadIds.includes(l.id)) {
            return { ...l, assignedTo: bulkAssignee };
          }
          return l;
        }));
        setSelectedLeadIds([]);
        setBulkAssignee("");
        alert("Leads assigned successfully!");
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert("Connection error during assignment.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected leads?`)) return;

    let successCount = 0;
    for (const id of selectedLeadIds) {
      try {
        const res = await fetch(`/api/leads?id=${id}`, {
          method: "DELETE",
          headers: { "Authorization": localStorage.getItem("admin_token") }
        });
        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error("Error deleting lead in bulk:", id, err);
      }
    }

    setLeads(prev => prev.filter(l => !selectedLeadIds.includes(l.id)));
    setSelectedLeadIds([]);
    alert(`Successfully deleted ${successCount} leads.`);
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    setImportError("");
    setImportSuccess(false);

    if (!importText.trim()) return;

    // Parser supports comma, tab, or newline separated formats
    // Format: Name, Company, Email, Phone, Message
    const lines = importText.split("\n");
    let addedCount = 0;

    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length > 0 && parts[0]) {
        const payload = {
          name: parts[0],
          companyName: parts[1] || "",
          email: parts[2] || "",
          phone: parts[3] || "",
          message: parts[4] || "Imported from CSV list.",
          source: "manual",
          status: "NEW",
          assignedTo: ""
        };

        try {
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": localStorage.getItem("admin_token")
            },
            body: JSON.stringify({
              action: "create",
              lead: payload
            })
          });
          const data = await res.json();
          if (res.ok && data.lead) {
            setLeads(prev => [data.lead, ...prev]);
            addedCount++;
          }
        } catch (err) {
          console.error("Error importing row:", line, err);
        }
      }
    }

    if (addedCount > 0) {
      setImportSuccess(true);
      setImportText("");
      setTimeout(() => setShowBulkImport(false), 2000);
      alert(`Imported ${addedCount} leads successfully!`);
    } else {
      setImportError("No valid leads parsed. Format: Name, Company, Email, Phone, Notes");
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
        headers: { "Authorization": localStorage.getItem("admin_token") }
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
        headers: { "Authorization": localStorage.getItem("admin_token") }
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
          "Authorization": localStorage.getItem("admin_token")
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
          "Authorization": localStorage.getItem("admin_token")
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
              <label className="form-label" htmlFor="user">Username</label>
              <input
                type="text"
                id="user"
                placeholder="admin"
                className="form-input"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>
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
            <span className="sub-title" style={{ display: "inline-block" }}>CONSOLE CONTROL ({userRole === "SUPER_ADMIN" ? "SUPER ADMIN" : `USER: ${currentUser}`})</span>
            <h1 style={{ fontSize: "2.25rem", color: "var(--color-blue-deep)", fontWeight: "800", marginTop: "0.25rem" }}>Augnexis Workspace</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
        {/* Console Tab Links */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {(userRole === "SUPER_ADMIN" || userPermissions.includes("leads")) && (
            <button
              onClick={() => setActiveSection("leads")}
              className={`tech-tab-btn ${activeSection === "leads" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <LayoutDashboard size={16} /> Client Leads ({leads.length})
            </button>
          )}
          {(userRole === "SUPER_ADMIN" || userPermissions.includes("payments")) && (
            <button
              onClick={() => setActiveSection("payments")}
              className={`tech-tab-btn ${activeSection === "payments" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <CreditCard size={16} /> Payments ({payments.length})
            </button>
          )}
          {(userRole === "SUPER_ADMIN" || userPermissions.includes("blogs")) && (
            <>
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
            </>
          )}
          {(userRole === "SUPER_ADMIN" || userPermissions.includes("lead_hunter")) && (
            <a
              href="/lead-hunter"
              className="tech-tab-btn"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
            >
              <Activity size={16} /> AI Lead Hunter
            </a>
          )}
          {userRole === "SUPER_ADMIN" && (
            <button
              onClick={() => setActiveSection("users")}
              className={`tech-tab-btn ${activeSection === "users" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Users size={16} /> Manage Users ({users.length})
            </button>
          )}
        </div>

        {/* Section: Leads (Advanced CRM Lead Management) */}
        {activeSection === "leads" && (
          <div>
            {/* Page Title & Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontSize: "1.8rem", color: "var(--color-blue-deep)", fontWeight: "800", margin: "0" }}>Unified CRM Lead Manager</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: "0" }}>
                  Manage, assign, and qualify inquiries from Web forms, Meta Ads, Google Ads, and AI Lead Hunter.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setShowAddLead(!showAddLead);
                    setShowBulkImport(false);
                    setShowIntegrations(false);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem" }}
                >
                  <PlusCircle size={16} /> Add Lead Manually
                </button>
                <button
                  onClick={() => {
                    setShowBulkImport(!showBulkImport);
                    setShowAddLead(false);
                    setShowIntegrations(false);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem" }}
                >
                  <UserPlus size={16} /> Bulk Import
                </button>
                <button
                  onClick={() => {
                    setShowIntegrations(!showIntegrations);
                    setShowAddLead(false);
                    setShowBulkImport(false);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem" }}
                >
                  <Settings size={16} /> Webhook API
                </button>
              </div>
            </div>

            {/* Integrations Setup Guide Panel */}
            {showIntegrations && (
              <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem", borderLeft: "4px solid var(--color-blue-secondary)" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", fontWeight: "700", marginBottom: "0.75rem" }}>
                  Google & Meta Webhook Integrations
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: "1.5", marginBottom: "1.25rem" }}>
                  Connect your live Facebook/Instagram Lead Ads campaigns and Google Ads Lead Extensions to receive leads instantly on this dashboard.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                  <div style={{ backgroundColor: "#F7FAFD", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#e1306c", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                      Meta Webhook Endpoint
                    </span>
                    <code style={{ fontSize: "0.8rem", wordBreak: "break-all", display: "block", backgroundColor: "#fff", padding: "6px", borderRadius: "4px", border: "1px solid var(--color-border)" }}>
                      {window.location.origin}/api/leads/webhook/meta
                    </code>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "6px", marginBottom: "0" }}>
                      Verify Token: <strong style={{ color: "var(--color-blue-deep)" }}>augnexis_meta_token</strong>
                    </p>
                  </div>

                  <div style={{ backgroundColor: "#F7FAFD", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#4285f4", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                      Google Webhook Endpoint
                    </span>
                    <code style={{ fontSize: "0.8rem", wordBreak: "break-all", display: "block", backgroundColor: "#fff", padding: "6px", borderRadius: "4px", border: "1px solid var(--color-border)" }}>
                      {window.location.origin}/api/leads/webhook/google
                    </code>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "6px", marginBottom: "0" }}>
                      Supports standard Google Lead Form webhook payloads.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Lead Form */}
            {showAddLead && (
              <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--color-blue-deep)", fontWeight: "700", marginBottom: "1rem" }}>
                  Create New Client Lead
                </h3>
                <form onSubmit={handleManualLeadCreate} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualLeadForm.name}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualLeadForm.companyName}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, companyName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={manualLeadForm.phone}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={manualLeadForm.email}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Lead Source</label>
                    <select
                      className="form-input"
                      value={manualLeadForm.source}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, source: e.target.value })}
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="meta_ads">Meta Ads Campaign</option>
                      <option value="google_ads">Google Ads Campaign</option>
                      <option value="contact_form">Website Contact Form</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Status</label>
                    <select
                      className="form-input"
                      value={manualLeadForm.status}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, status: e.target.value })}
                    >
                      <option value="NEW">New Opportunity</option>
                      <option value="CONTACTED">Contacted / Pitch Sent</option>
                      <option value="INTERESTED">Interested / Call Booked</option>
                      <option value="NOT_INTERESTED">Not Interested</option>
                      <option value="CONVERTED">Converted Client</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Assign To Agent</label>
                    <select
                      className="form-input"
                      value={manualLeadForm.assignedTo}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, assignedTo: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.username}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 1 / -1" }}>
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Subject / Interest</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualLeadForm.subject}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 1 / -1" }}>
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Message / CRM Notes</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ height: "auto" }}
                      value={manualLeadForm.message}
                      onChange={(e) => setManualLeadForm({ ...manualLeadForm, message: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: "span 1 / -1", display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <button type="submit" className="btn btn-primary">Save Lead</button>
                    <button type="button" onClick={() => setShowAddLead(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Bulk Import leads block */}
            {showBulkImport && (
              <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--color-blue-deep)", fontWeight: "700", marginBottom: "0.5rem" }}>
                  Bulk Copy-Paste Importer
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                  Paste CSV lines. Format: **Name, Company, Email, Phone, Description** (One lead per line).
                </p>
                <form onSubmit={handleBulkImportSubmit}>
                  <textarea
                    className="form-input"
                    rows={4}
                    style={{ height: "auto", fontFamily: "monospace", fontSize: "0.8rem" }}
                    placeholder="Vijay Sharma, Sharma Steel Ltd, vijay@sharmasteel.com, +919999999999, Needs custom ERP dashboard"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <button type="submit" className="btn btn-primary">Start Importing</button>
                    <button type="button" onClick={() => setShowBulkImport(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Dashboard Filters & Bulk Operations bar */}
            <div className="glass-card" style={{ padding: "1.25rem 2rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                
                {/* Filters selection */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-muted)" }}>Source</span>
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
                    >
                      <option value="all">All Sources</option>
                      <option value="contact_form">Website Forms</option>
                      <option value="lead_hunter">AI Lead Hunter</option>
                      <option value="meta_ads">Meta Ads (FB/IG)</option>
                      <option value="google_ads">Google Ads</option>
                      <option value="manual">Manual Imports</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-muted)" }}>Status</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="NOT_INTERESTED">Not Interested</option>
                      <option value="CONVERTED">Converted</option>
                    </select>
                  </div>

                  {userRole === "SUPER_ADMIN" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-muted)" }}>Assignee</span>
                      <select
                        value={filterAssignee}
                        onChange={(e) => setFilterAssignee(e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
                      >
                        <option value="all">All Assignees</option>
                        <option value="unassigned">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.username}>{u.username}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Bulk operations select options */}
                {userRole === "SUPER_ADMIN" && selectedLeadIds.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#eff6ff", padding: "8px 16px", borderRadius: "8px", border: "1px dashed var(--color-blue-secondary)" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-blue-deep)" }}>
                      {selectedLeadIds.length} Selected
                    </span>
                    <select
                      value={bulkAssignee}
                      onChange={(e) => setBulkAssignee(e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", border: "1px solid var(--color-border)" }}
                    >
                      <option value="">Choose Agent...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.username}>{u.username}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleBulkAssign}
                      className="btn btn-primary"
                      style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                    >
                      Assign
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.8rem", color: "#ef4444", borderColor: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Leads Listing Grid */}
            {leadsLoading ? (
              <p style={{ color: "var(--color-text-secondary)" }}>Loading leads...</p>
            ) : leads.filter(l => {
              const matchSrc = filterSource === "all" || l.source === filterSource;
              const matchStat = filterStatus === "all" || l.status === filterStatus;
              let matchAss = true;
              if (filterAssignee === "unassigned") matchAss = !l.assignedTo;
              else if (filterAssignee !== "all") matchAss = l.assignedTo === filterAssignee;
              return matchSrc && matchStat && matchAss;
            }).length === 0 ? (
              <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--color-text-secondary)", margin: "0" }}>No leads match the active filters.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {leads
                  .filter(l => {
                    const matchSrc = filterSource === "all" || l.source === filterSource;
                    const matchStat = filterStatus === "all" || l.status === filterStatus;
                    let matchAss = true;
                    if (filterAssignee === "unassigned") matchAss = !l.assignedTo;
                    else if (filterAssignee !== "all") matchAss = l.assignedTo === filterAssignee;
                    return matchSrc && matchStat && matchAss;
                  })
                  .map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);

                    // Source styling badges
                    let sourceText = "Web Inquiry";
                    let sourceClass = "bg-blue-100 text-blue-700";
                    if (lead.source === "lead_hunter") {
                      sourceText = "AI Hunter";
                      sourceClass = "bg-purple-100 text-purple-700";
                    } else if (lead.source === "meta_ads") {
                      sourceText = "Meta Ads";
                      sourceClass = "bg-emerald-100 text-emerald-700";
                    } else if (lead.source === "google_ads") {
                      sourceText = "Google Ads";
                      sourceClass = "bg-amber-100 text-amber-700";
                    } else if (lead.source === "manual") {
                      sourceText = "Manual Entry";
                      sourceClass = "bg-slate-100 text-slate-700";
                    }

                    // Status classes
                    const statusClass = 
                      lead.status === "CONVERTED" ? "bg-green-100 text-green-700" :
                      lead.status === "INTERESTED" ? "bg-cyan-100 text-cyan-700" :
                      lead.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                      lead.status === "NOT_INTERESTED" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-700";

                    return (
                      <div key={lead.id} className="glass-card" style={{ padding: "2rem", border: isSelected ? "1px solid var(--color-blue-secondary)" : "1px solid var(--color-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                          
                          {/* Left: Checkbox & Name */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {userRole === "SUPER_ADMIN" && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeadIds([...selectedLeadIds, lead.id]);
                                  } else {
                                    setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                                  }
                                }}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                            )}
                            <div>
                              <h3 style={{ fontSize: "1.25rem", color: "var(--color-blue-deep)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                {lead.name}
                                {lead.companyName && <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: "400" }}>({lead.companyName})</span>}
                              </h3>
                              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                <span className={`badge ${sourceClass}`} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  {sourceText}
                                </span>
                                <span className={`badge ${statusClass}`} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                  {lead.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
                            {/* Status Change Dropdown */}
                            <select
                              value={lead.status || "NEW"}
                              onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.8rem",
                                backgroundColor: "#fff",
                                color: "var(--color-text-secondary)"
                              }}
                            >
                              <option value="NEW">New</option>
                              <option value="CONTACTED">Contacted</option>
                              <option value="INTERESTED">Interested</option>
                              <option value="NOT_INTERESTED">Not Interested</option>
                              <option value="CONVERTED">Converted</option>
                            </select>

                            {/* Delete single button */}
                            {userRole === "SUPER_ADMIN" && (
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                style={{
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
                                <Trash2 size={16} /> Delete
                              </button>
                            )}
                          </div>

                        </div>

                        {/* Middle info grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                          {lead.email && (
                            <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                              <Mail size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                              <strong>Email: </strong><a href={`mailto:${lead.email}`} style={{ color: "var(--color-blue-secondary)", wordBreak: "break-all" }}>{lead.email}</a>
                            </p>
                          )}
                          {lead.phone && (
                            <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                              <Phone size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                              <strong>Phone: </strong><a href={`tel:${lead.phone}`} style={{ color: "var(--color-blue-secondary)" }}>{lead.phone}</a>
                            </p>
                          )}
                          <p style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                            <Clock size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                            <strong>Date Received: </strong>{lead.createdAt}
                          </p>
                          <div style={{ color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", margin: "0" }}>
                            <User size={14} style={{ color: "var(--color-blue-secondary)", flexShrink: 0 }} />
                            <strong>Assigned To: </strong>
                            {userRole === "SUPER_ADMIN" ? (
                              <select
                                value={lead.assignedTo || ""}
                                onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--color-border)",
                                  fontSize: "0.8rem",
                                  backgroundColor: "#fff",
                                  color: "var(--color-text-secondary)",
                                  marginLeft: "4px"
                                }}
                              >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                  <option key={u.id} value={u.username}>{u.username}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="badge bg-blue-100 text-blue-800" style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", marginLeft: "4px" }}>
                                {lead.assignedTo || "Unassigned"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subject & message details */}
                        <div style={{ backgroundColor: "#F7FAFD", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "1rem" }}>
                          <h4 style={{ fontSize: "0.85rem", color: "var(--color-blue-deep)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: "700" }}>
                            Subject: {lead.subject}
                          </h4>
                          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", whiteSpace: "pre-line", margin: "0" }}>
                            {lead.message}
                          </p>
                        </div>

                        {/* Metadata / AI Insights section (For lead hunter or ad data) */}
                        {lead.metadata && (lead.metadata.placeId || lead.metadata.campaign) && (
                          <div style={{ backgroundColor: "#faf5ff", padding: "1rem", borderRadius: "8px", border: "1px solid #f3e8ff", fontSize: "0.85rem", color: "#581c87" }}>
                            <span style={{ fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem", display: "block", marginBottom: "0.5rem", color: "#6b21a8" }}>
                              ⚙ Extra Metadata & Ad Insights
                            </span>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                              {lead.metadata.website && (
                                <div>
                                  <strong>Website:</strong>{" "}
                                  <a href={lead.metadata.website} target="_blank" rel="noreferrer" style={{ color: "var(--color-blue-secondary)" }}>
                                    {lead.metadata.website}
                                  </a>
                                </div>
                              )}
                              {lead.metadata.rating !== undefined && (
                                <div><strong>Business Rating:</strong> ⭐ {lead.metadata.rating} / 5</div>
                              )}
                              {lead.metadata.score !== undefined && (
                                <div><strong>AI Match Score:</strong> {lead.metadata.score} / 100</div>
                              )}
                              {lead.metadata.campaign && (
                                <div><strong>Ad Campaign:</strong> {lead.metadata.campaign}</div>
                              )}
                              {lead.metadata.adId && (
                                <div><strong>Ad ID:</strong> {lead.metadata.adId}</div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
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

        {/* Section: Users (Super Admin Only) */}
        {activeSection === "users" && userRole === "SUPER_ADMIN" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
            
            {/* Left Column: Create User Form */}
            <div className="glass-card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", color: "var(--color-blue-deep)", fontWeight: "700", marginBottom: "0.25rem" }}>
                Create Team Account
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Add new team members/agents and customize their exact feature access.
              </p>

              {userSuccess && (
                <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #10b981", borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem", color: "#065f46", fontSize: "0.85rem", fontWeight: "500" }}>
                  ✓ User created successfully!
                </div>
              )}

              {userError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem", color: "#991b1b", fontSize: "0.85rem", fontWeight: "500" }}>
                  ✗ {userError}
                </div>
              )}

              <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. kahan_dev"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>Role *</label>
                  <select
                    className="form-input"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    required
                  >
                    <option value="AGENT">Agent / regular user</option>
                    <option value="SUPER_ADMIN">Super Admin (full control)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>Permissions Access Matrix</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { id: "leads", label: "Client Leads & Inquiries" },
                      { id: "payments", label: "Payments Tab & Billing Generator" },
                      { id: "blogs", label: "Blog Composing & Management" },
                      { id: "lead_hunter", label: "AI Lead Hunter Access" }
                    ].map(permission => {
                      const isChecked = newUserForm.permissions.includes(permission.id);
                      return (
                        <label key={permission.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let updatedPerms = [...newUserForm.permissions];
                              if (e.target.checked) {
                                updatedPerms.push(permission.id);
                              } else {
                                updatedPerms = updatedPerms.filter(p => p !== permission.id);
                              }
                              setNewUserForm({ ...newUserForm, permissions: updatedPerms });
                            }}
                            disabled={newUserForm.role === "SUPER_ADMIN"}
                          />
                          {permission.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", display: "flex", gap: "8px", alignItems: "center" }}>
                  <UserPlus size={16} /> Create User Account
                </button>
              </form>
            </div>

            {/* Right Column: Existing Users List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.3rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>Active Accounts</h2>
                <button onClick={() => fetchUsers()} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                  Refresh
                </button>
              </div>

              {usersLoading ? (
                <p style={{ color: "var(--color-text-secondary)" }}>Loading accounts...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {users.map((user) => (
                    <div key={user.id} className="glass-card" style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                        <div>
                          <h3 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", fontWeight: "700" }}>{user.username}</h3>
                          <span className={`badge ${user.role === "SUPER_ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase" }}>
                            {user.role}
                          </span>
                        </div>
                        {user.username !== "admin" && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                              fontSize: "0.8rem",
                              fontWeight: "600"
                            }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                        <p style={{ margin: "0 0 6px 0" }}><strong>Created:</strong> {user.createdAt}</p>
                        <p style={{ margin: "0" }}>
                          <strong>Permissions:</strong>{" "}
                          {user.role === "SUPER_ADMIN" ? (
                            <span style={{ fontStyle: "italic" }}>All Permissions (Inherited)</span>
                          ) : user.permissions.length === 0 ? (
                            <span style={{ color: "#ef4444" }}>None (Access Blocked)</span>
                          ) : (
                            user.permissions.map(p => {
                              if (p === "leads") return "leads";
                              if (p === "payments") return "payments";
                              if (p === "blogs") return "blogs";
                              if (p === "lead_hunter") return "lead_hunter";
                              return p;
                            }).join(", ")
                          )}
                        </p>
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
