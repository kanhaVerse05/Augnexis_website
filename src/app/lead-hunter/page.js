"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Flame, 
  Sparkles, 
  Play, 
  Settings, 
  Globe, 
  ChevronRight, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Database,
  ExternalLink,
  Search,
  TrendingUp,
  Terminal,
  Activity,
  Layers,
  HelpCircle,
  Star
} from "lucide-react";

export default function LeadHunterDashboard() {
  // Page states
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ hot: 0, warm: 0, cold: 0, analyzedToday: 0 });
  const [activeTab, setActiveTab] = useState("HOT"); // HOT | WARM | ALL
  const [categoryStats, setCategoryStats] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Hunt trigger & active logging states
  const [isHunting, setIsHunting] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const terminalEndRef = useRef(null);
  
  // Settings modal states
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    location: "Delhi NCR",
    daily_lead_target: 50,
    auto_daily_hunt: true,
    google_api_key: "",
    gemini_api_key: ""
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Missing API keys flag
  const [keysMissing, setKeysMissing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      window.location.href = "/admin";
      return;
    }

    const role = localStorage.getItem("admin_role") || "USER";
    const permissions = JSON.parse(localStorage.getItem("admin_permissions") || "[]");

    if (role !== "SUPER_ADMIN" && !permissions.includes("lead_hunter")) {
      alert("Access Denied: You do not have permission to access Lead Hunter.");
      window.location.href = "/admin";
      return;
    }

    setAuthorized(true);
    setIsSuperAdmin(role === "SUPER_ADMIN");
    
    fetchDashboardData(token);
    if (role === "SUPER_ADMIN") {
      fetchUsers(token);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    
    // Set up polling while lead hunt is running
    let interval;
    if (isHunting) {
      interval = setInterval(() => {
        pollJobStatus();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isHunting, authorized]);

  // Scroll logging terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logMessages, showTerminal]);

  const fetchUsers = async (token) => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "Authorization": token || localStorage.getItem("admin_token") }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Error fetching users list:", e);
    }
  };

  const handleAssignHunterLead = async (leadId, username) => {
    try {
      const res = await fetch("/api/hunter/leads", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "assign",
          id: leadId,
          assignedTo: username
        })
      });
      if (res.ok) {
        // Refresh local leads state
        setLeads(prev => prev.map(l => {
          if (l.id === leadId) {
            return { ...l, assignedTo: username };
          }
          return l;
        }));
      } else {
        const err = await res.json();
        alert(`Error assigning lead: ${err.error}`);
      }
    } catch (err) {
      alert("Failed to assign lead.");
    }
  };

  const fetchDashboardData = async (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem("admin_token");
    try {
      const leadsRes = await fetch("/api/hunter/leads", {
        headers: { "Authorization": token }
      });
      const hunterRes = await fetch("/api/hunter", {
        headers: { "Authorization": token }
      });
      
      if (leadsRes.ok && hunterRes.ok) {
        const leadData = await leadsRes.json();
        const hunterData = await hunterRes.json();
        
        setLeads(leadData);
        setCategoryStats(hunterData.categoryStats || []);
        setJobs(hunterData.jobs || []);
        
        // Calculate totals
        const hotCount = leadData.filter(l => l.priority === "HOT").length;
        const warmCount = leadData.filter(l => l.priority === "WARM").length;
        const coldCount = leadData.filter(l => l.priority === "COLD").length;
        
        // Count analyzed today (last_analyzed_at is today's date)
        const todayStr = new Date().toISOString().substring(0, 10);
        const todayAnalyzed = leadData.filter(l => {
          const lastAnalyzed = l.lastAnalyzedAt || l.firstDiscoveredAt;
          return lastAnalyzed && lastAnalyzed.startsWith(todayStr);
        }).length;
        
        setStats({
          hot: hotCount,
          warm: warmCount,
          cold: coldCount,
          analyzedToday: todayAnalyzed
        });

        // Configure settings form
        if (hunterData.settings) {
          setSettingsForm({
            location: hunterData.settings.location || "Delhi NCR",
            daily_lead_target: hunterData.settings.daily_lead_target || 50,
            auto_daily_hunt: hunterData.settings.auto_daily_hunt !== false,
            google_api_key: hunterData.settings.google_api_key || "",
            gemini_api_key: hunterData.settings.gemini_api_key || ""
          });

          // Check if key placeholders are empty (which means keys aren't set)
          if (!hunterData.settings.gemini_api_key) {
            setKeysMissing(true);
          } else {
            setKeysMissing(false);
          }
        }

        // Check if there is an active running job in list
        const runningJob = hunterData.jobs?.find(j => j.status === "RUNNING");
        if (runningJob) {
          setIsHunting(true);
          setShowTerminal(true);
          setLogMessages(hunterData.activeLogs || []);
        } else {
          setIsHunting(false);
          if (hunterData.activeLogs?.length > 0) {
            setLogMessages(hunterData.activeLogs);
          }
        }
      }
    } catch (err) {
      console.error("Error loading dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async () => {
    try {
      const res = await fetch("/api/hunter", {
        headers: { "Authorization": localStorage.getItem("admin_token") }
      });
      if (res.ok) {
        const data = await res.json();
        setLogMessages(data.activeLogs || []);
        setJobs(data.jobs || []);
        
        const runningJob = data.jobs?.find(j => j.status === "RUNNING");
        if (!runningJob) {
          setIsHunting(false);
          fetchDashboardData(); // Refresh list to pull new leads
        }
      }
    } catch (err) {
      console.error("Error polling lead hunt status:", err);
    }
  };

  const handleRunLeadHunt = async () => {
    if (keysMissing) {
      setShowSettings(true);
      return;
    }
    
    setIsHunting(true);
    setShowTerminal(true);
    setLogMessages(["[System] Initializing request..."]);
    
    try {
      const res = await fetch("/api/hunter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({ action: "trigger" })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to trigger run.");
      }
    } catch (err) {
      setLogMessages(prev => [...prev, `[Error] ${err.message}`]);
      setIsHunting(false);
    }
  };

  const handleToggleAutoHunt = async (checked) => {
    const updatedForm = { ...settingsForm, auto_daily_hunt: checked };
    setSettingsForm(updatedForm);
    
    try {
      await fetch("/api/hunter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "save_settings",
          settings: updatedForm
        })
      });
    } catch (err) {
      console.error("Failed to toggle automatic scheduling:", err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const res = await fetch("/api/hunter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "save_settings",
          settings: settingsForm
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setKeysMissing(!settingsForm.gemini_api_key);
        setTimeout(() => {
          setShowSettings(false);
          setSaveSuccess(false);
        }, 1500);
        fetchDashboardData();
      } else {
        const err = await res.json();
        setSaveError(err.error || "Failed to update configurations.");
      }
    } catch (err) {
      setSaveError("Connection failure while saving settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  // Filter leads by tab selection (HOT | WARM | ALL)
  const filteredLeads = leads.filter(l => {
    if (activeTab === "ALL") return true;
    return l.priority === activeTab;
  });

  return (
    <div className="fade-in-section" style={{ minHeight: "100vh", backgroundColor: "#F7FAFD", fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}>
      {/* Spacer to push content below header */}
      <div className="inner-header-spacer"></div>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
        
        {/* Page Header (Unified Design) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem" }}>
          <div>
            <span className="sub-title" style={{ display: "inline-block", margin: "0" }}>AUTOMATED OUTREACH</span>
            <h1 style={{ fontSize: "2.25rem", color: "var(--color-blue-deep)", fontWeight: "800", marginTop: "0.25rem", letterSpacing: "-0.02em" }}>
              AI Lead Hunter
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Automatically discover and qualify website-development opportunities.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* API Status Badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: keysMissing ? "#fffbeb" : "#f0fdf4",
              border: keysMissing ? "1px solid #fef3c7" : "1px solid #dcfce7",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: keysMissing ? "#b45309" : "#15803d"
            }}>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: keysMissing ? "#d97706" : "#22c55e",
                display: "inline-block"
              }} />
              {keysMissing ? "Configuration Required" : "API Ready"}
            </div>

            {isHunting ? (
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="btn btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw size={16} className="animate-spin" />
                {showTerminal ? "Hide Console" : "Show Console"}
              </button>
            ) : (
              <button
                onClick={handleRunLeadHunt}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Play size={14} fill="currentColor" />
                Run Lead Hunt
              </button>
            )}
          </div>
        </div>

        {/* Small configuration / status bar */}
        <div className="glass-card" style={{ padding: "1.25rem 2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            <div>
              <strong>Target Location:</strong> <span style={{ color: "var(--color-blue-deep)", fontWeight: "600" }}>{settingsForm.location}</span>
            </div>
            <div>
              <strong>Daily Target:</strong> <span style={{ color: "var(--color-blue-deep)", fontWeight: "600" }}>{settingsForm.daily_lead_target}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong>Automatic Daily Hunt:</strong> 
              <span className={`badge ${settingsForm.auto_daily_hunt ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`} style={{ 
                padding: "2px 8px", 
                borderRadius: "4px", 
                fontSize: "11px", 
                fontWeight: "700" 
              }}>
                {settingsForm.auto_daily_hunt ? "ON" : "OFF"}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* Live Terminal Log Box */}
        {showTerminal && (
          <div className="glass-card" style={{ padding: "0", marginBottom: "2rem", border: "1px solid #1e293b", overflow: "hidden", backgroundColor: "#0f172a" }}>
            <div style={{ backgroundColor: "#1e293b", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", itemsCenter: "center", gap: "6px" }}>
                <Terminal size={14} style={{ color: "#38bdf8" }} />
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace", fontWeight: "700" }}>LEAD HUNTER PIPELINE OUTPUT</span>
              </div>
              <button onClick={() => setShowTerminal(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: "1.25rem", height: "220px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.75rem", color: "#38bdf8", lineHeight: "1.6" }}>
              {logMessages.map((msg, index) => (
                <div key={index}>&gt; {msg}</div>
              ))}
              {isHunting && (
                <div style={{ color: "#94a3b8", fontStyle: "italic" }}>
                  &gt; Scraper is running, fetching data... <span className="animate-pulse">_</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        )}

        {/* STATISTICS SECTION */}
        <section className="stats-grid" style={{ marginBottom: "2.5rem" }}>
          {/* Card: Hot Leads */}
          <div className="glass-card" style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "140px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hot Leads</span>
              <div style={{ color: "#ef4444" }}><Flame size={20} fill="#ef4444" /></div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: "2.5rem", color: "var(--color-blue-deep)", margin: "0" }}>{loading ? "..." : stats.hot}</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "0" }}>High conversion opportunities</p>
            </div>
          </div>

          {/* Card: Warm Leads */}
          <div className="glass-card" style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "140px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Warm Leads</span>
              <div style={{ color: "#d97706" }}><Info size={20} /></div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: "2.5rem", color: "var(--color-blue-deep)", margin: "0" }}>{loading ? "..." : stats.warm}</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "0" }}>Potential opportunities</p>
            </div>
          </div>

          {/* Card: Other Leads */}
          <div className="glass-card" style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "140px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Other Leads</span>
              <div style={{ color: "var(--color-text-muted)" }}><Globe size={20} /></div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: "2.5rem", color: "var(--color-blue-deep)", margin: "0" }}>{loading ? "..." : stats.cold}</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "0" }}>Lower priority</p>
            </div>
          </div>

          {/* Card: Analyzed Today */}
          <div className="glass-card" style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "140px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-blue-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Analyzed Today</span>
              <div style={{ color: "var(--color-blue-secondary)" }}><Activity size={20} /></div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: "2.5rem", color: "var(--color-blue-deep)", margin: "0" }}>{loading ? "..." : stats.analyzedToday}</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", margin: "0" }}>Leads analyzed in last 24 hours</p>
            </div>
          </div>
        </section>

        {/* Main Grid: Leads table & Widgets */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2rem" }}>
          
          {/* Table Container (8 cols) */}
          <div style={{ gridColumn: "span 8 / span 8" }} className="col-span-12 lg:col-span-8">
            
            {/* Header controls for leads list */}
            <div className="glass-card" style={{ padding: "1.25rem 2rem", marginBottom: "1.5rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>Today's Leads</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0" }}>AI-ranked website development opportunities</p>
                </div>
                
                {/* Segments control */}
                <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "var(--color-bg-alt)", padding: "4px", borderRadius: "50px", border: "1px solid var(--color-border)" }}>
                  {[
                    { id: "HOT", label: "🔥 Hot" },
                    { id: "WARM", label: "🟡 Warm" },
                    { id: "ALL", label: "All" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="tech-tab-btn"
                      style={{
                        padding: "0.4rem 1.2rem",
                        fontSize: "0.75rem",
                        borderRadius: "50px",
                        backgroundColor: activeTab === tab.id ? "var(--color-blue-secondary)" : "transparent",
                        color: activeTab === tab.id ? "#ffffff" : "var(--color-text-secondary)",
                        border: "none",
                        boxShadow: activeTab === tab.id ? "var(--shadow-glow)" : "none",
                        cursor: "pointer"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leads Table Card */}
            <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 1rem auto", color: "var(--color-blue-secondary)" }} />
                  <p style={{ fontSize: "0.9rem" }}>Loading discovered leads...</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                /* EMPTY STATE */
                <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-blue-light)",
                    color: "var(--color-blue-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <Database size={28} />
                  </div>
                  <h4 style={{ fontSize: "1.2rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>No leads discovered yet</h4>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.5rem", maxWidth: "400px", marginInline: "auto", lineHeight: "1.5" }}>
                    Run your first Lead Hunt to automatically discover potential website-development clients around {settingsForm.location}.
                  </p>
                  <button
                    onClick={handleRunLeadHunt}
                    className="btn btn-primary"
                    style={{ marginTop: "1.5rem" }}
                  >
                    Run Lead Hunt
                  </button>
                </div>
              ) : (
                /* DATA TABLE */
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-alt)", color: "var(--color-text-muted)", fontWeight: "600" }}>
                        <th style={{ padding: "1rem 1.5rem" }}>Business</th>
                        <th style={{ padding: "1rem 1rem" }}>Category</th>
                        <th style={{ padding: "1rem 1rem" }}>Website</th>
                        <th style={{ padding: "1rem 1rem" }}>Opportunity</th>
                        <th style={{ padding: "1rem 1rem", textAlign: "center" }}>Score</th>
                        <th style={{ padding: "1rem 1rem", textAlign: "center" }}>Priority</th>
                        <th style={{ padding: "1rem 1rem" }}>Assigned To</th>
                        <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: "var(--color-text-secondary)" }}>
                      {filteredLeads.map((lead) => {
                        const priorityColor = lead.priority === "HOT"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : lead.priority === "WARM"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200";

                        const opportunityColor = lead.opportunity === "NO_WEBSITE"
                          ? "bg-purple-100 text-purple-700"
                          : lead.opportunity === "REDESIGN"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600";

                        return (
                          <tr key={lead.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background-color 0.15s" }} className="hover:bg-slate-50/50">
                            <td style={{ padding: "1rem 1.5rem" }}>
                               <span style={{ fontWeight: "700", color: "var(--color-blue-deep)" }}>{lead.business?.name}</span>
                            </td>
                            <td style={{ padding: "1rem 1rem" }}>
                              <span style={{ fontSize: "0.8rem" }}>{lead.business?.categories?.[0] || "Local Business"}</span>
                            </td>
                            <td style={{ padding: "1rem 1rem" }}>
                              {lead.business?.website ? (
                                <a 
                                  href={lead.business.website} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  style={{ color: "var(--color-blue-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                  <Globe size={13} /> <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: "600" }}>No Website</span>
                              )}
                            </td>
                            <td style={{ padding: "1rem 1rem" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                                <span className={`badge ${opportunityColor}`} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                                  {lead.opportunity === "NO_WEBSITE" && "No Website"}
                                  {lead.opportunity === "REDESIGN" && "Needs Redesign"}
                                  {lead.opportunity === "IMPROVEMENT" && "Needs Optimization"}
                                  {lead.opportunity === "LOW" && "Low Priority"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "1rem 1rem", textAlign: "center", fontWeight: "700", color: "var(--color-blue-deep)" }}>
                              {lead.score}
                            </td>
                            <td style={{ padding: "1rem 1rem", textAlign: "center" }}>
                              <span className={`badge ${priorityColor}`} style={{ padding: "4px 8px", borderRadius: "6px", fontWeight: "700", fontSize: "11px", border: "1px solid" }}>
                                {lead.priority}
                              </span>
                            </td>
                            <td style={{ padding: "1rem 1rem" }}>
                              {isSuperAdmin ? (
                                <select
                                  value={lead.assignedTo || ""}
                                  onChange={(e) => handleAssignHunterLead(lead.id, e.target.value)}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--color-border)",
                                    fontSize: "0.8rem",
                                    backgroundColor: "#fff"
                                  }}
                                >
                                  <option value="">Unassigned</option>
                                  {users.map(u => (
                                    <option key={u.id} value={u.username}>{u.username}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="badge bg-blue-100 text-blue-800" style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                                  {lead.assignedTo || "Unassigned"}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                              <Link
                                href={`/lead-hunter/leads/${lead.id}`}
                                className="btn btn-secondary"
                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                View <ChevronRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar widgets (4 cols) */}
          <div style={{ gridColumn: "span 4 / span 4" }} className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Widget: AI Discovery Engine */}
            <div className="glass-card" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>AI Discovery Engine</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#15803d", fontWeight: "700", backgroundColor: "#f0fdf4", border: "1px solid #dcfce7", padding: "2px 8px", borderRadius: "20px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e" }} /> Active
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                The Lead Hunter automatically rotates and weights search categories based on discovery metrics and high-scoring opportunities.
              </p>
              
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                <span className="sub-title" style={{ fontSize: "10px", marginBottom: "0.75rem", display: "block" }}>Top Priority Categories</span>
                {categoryStats.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: "0" }}>No stats compiled yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {categoryStats.slice(0, 4).map((stat, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--color-blue-deep)" }}>{stat.category}</span>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                          {stat.hotLeads} Hot / {stat.leadsFound} total
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center", fontSize: "0.85rem" }}
              >
                Manage Settings
              </button>
            </div>

            {/* Widget: Lead Hunt Activity */}
            <div className="glass-card" style={{ padding: "2rem" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--color-blue-deep)", fontWeight: "700", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1rem", margin: "0" }}>
                Lead Hunt Activity
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                {jobs.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: "0", py: "1rem" }}>No lead hunts have been run yet.</p>
                ) : (
                  jobs.slice(0, 5).map((job) => {
                    const date = new Date(job.runAt);
                    const formattedDate = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                    const formattedTime = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={job.id} style={{ display: "flex", alignItems: "start", gap: "10px", fontSize: "0.8rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                        <div style={{
                          backgroundColor: job.status === "COMPLETED" ? "#f0fdf4" : job.status === "RUNNING" ? "#eff6ff" : "#fef2f2",
                          color: job.status === "COMPLETED" ? "#16a34a" : job.status === "RUNNING" ? "#2563eb" : "#dc2626",
                          padding: "6px",
                          borderRadius: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "2px"
                        }}>
                          <Activity size={12} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ color: "var(--color-blue-deep)" }}>Delhi NCR Scan</strong>
                            <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{formattedDate}, {formattedTime}</span>
                          </div>
                          <p style={{ margin: "2px 0 0 0", color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
                            {job.status === "COMPLETED" 
                              ? `Discovered ${job.leadsFound} leads (${job.hotLeads} HOT)`
                              : job.status === "RUNNING"
                                ? "Scan running..."
                                : "Execution failed"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Configuration Settings Modal */}
      {showSettings && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          padding: "1rem"
        }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "480px", padding: "0", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-xl)" }}>
            
            {/* Modal Title */}
            <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-alt)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Settings size={18} style={{ color: "var(--color-blue-secondary)" }} />
                <h3 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>Lead Hunter Configuration</h3>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSettings} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {saveError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "0.8rem", padding: "0.75rem 1rem", borderRadius: "8px", fontWeight: "500" }}>
                  ⚠ {saveError}
                </div>
              )}

              {/* Discovery Engine Status Indicator */}
              <div style={{ backgroundColor: "var(--color-bg-alt)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                <strong style={{ color: "var(--color-blue-deep)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Discovery Engine Status</strong>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>AI Discovery (Google Search):</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700", color: settingsForm.gemini_api_key ? "#15803d" : "#b91c1c" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: settingsForm.gemini_api_key ? "#22c55e" : "#ef4444" }} />
                    {settingsForm.gemini_api_key ? "Gemini + Google Search" : "Not configured"}
                  </span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Google Places API:</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "700", color: settingsForm.google_api_key ? "#15803d" : "#64748b" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: settingsForm.google_api_key ? "#22c55e" : "#94a3b8" }} />
                    {settingsForm.google_api_key ? "Active" : "Not configured"}
                  </span>
                </div>
                
                {!settingsForm.google_api_key && (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", margin: "4px 0 0 0", fontStyle: "italic", lineHeight: "1.4" }}>
                    ℹ Google Places API will be available when configured. Currently running using Gemini Search Grounding.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">Target Location</label>
                <input 
                  type="text" 
                  id="location"
                  value={settingsForm.location}
                  onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                  placeholder="Delhi NCR" 
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="target">Daily Lead Target Limit</label>
                <input 
                  type="number" 
                  id="target"
                  value={settingsForm.daily_lead_target}
                  onChange={(e) => setSettingsForm({ ...settingsForm, daily_lead_target: parseInt(e.target.value) || 50 })}
                  min="5" 
                  max="200"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="placesKey">Google Places API Key</label>
                <input 
                  type="password" 
                  id="placesKey"
                  value={settingsForm.google_api_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, google_api_key: e.target.value })}
                  placeholder="••••••••••••••••" 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="geminiKey">Gemini AI API Key</label>
                <input 
                  type="password" 
                  id="geminiKey"
                  value={settingsForm.gemini_api_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gemini_api_key: e.target.value })}
                  placeholder="••••••••••••••••" 
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
                {saveSuccess ? (
                  <span style={{ fontSize: "0.85rem", color: "#166534", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", padding: "0.5rem 1.25rem", borderRadius: "8px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    ✓ Saved successfully!
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="btn btn-secondary"
                      style={{ padding: "0.6rem 1.25rem" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="btn btn-primary"
                      style={{ padding: "0.6rem 1.25rem", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {settingsSaving && <RefreshCw size={12} className="animate-spin" />}
                      Save Settings
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
