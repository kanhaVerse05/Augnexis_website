"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Flame, 
  Globe, 
  Phone, 
  MapPin, 
  Star, 
  AlertTriangle,
  FileText,
  Mail,
  Copy,
  Check,
  Calendar,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Info,
  RefreshCw,
  X
} from "lucide-react";

export default function LeadDetailPage({ params: paramsPromise }) {
  // Unwrap Next.js 16 / React 19 params promise
  const params = use(paramsPromise);
  const leadId = params.id;

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

    fetchLeadDetails(token);
  }, [leadId]);

  const fetchLeadDetails = async (tokenOverride) => {
    setLoading(true);
    const token = tokenOverride || localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/hunter/leads?id=${leadId}`, {
        headers: { "Authorization": token }
      });
      if (res.ok) {
        const data = await res.json();
        setLead(data);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to load lead details.");
      }
    } catch (e) {
      setError("Network error loading details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/hunter/leads", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
          action: "update_status",
          id: leadId,
          status
        })
      });

      if (res.ok) {
        // Reload details to capture the new status and activity logging
        fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyPitch = () => {
    if (lead?.aiAnalysis?.personalizedPitch) {
      navigator.clipboard.writeText(lead.aiAnalysis.personalizedPitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="fade-in-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F7FAFD" }}>
        <RefreshCw className="w-10 h-10 animate-spin mb-4" style={{ color: "var(--color-blue-secondary)" }} />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading opportunity analysis...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="fade-in-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F7FAFD", padding: "2rem", textAlign: "center" }}>
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 style={{ fontSize: "1.5rem", color: "var(--color-blue-deep)", fontWeight: "700" }}>Analysis Unretrievable</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>{error || "This lead could not be found or has been deleted."}</p>
        <Link 
          href="/lead-hunter"
          className="btn btn-primary"
          style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { business, websiteAudit, aiAnalysis, activities } = lead;
  const score = lead.score || 0;
  const isHot = lead.priority === "HOT";
  const isWarm = lead.priority === "WARM";
  
  // Format badges
  const priorityBadgeClass = isHot
    ? "bg-red-100 text-red-700 border-red-200"
    : isWarm
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="fade-in-section" style={{ minHeight: "100vh", backgroundColor: "#F7FAFD", fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}>
      {/* Spacer to push content below header */}
      <div className="inner-header-spacer"></div>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
        
        {/* Navigation & Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", marginBottom: "2.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <Link 
              href="/lead-hunter" 
              className="btn btn-secondary" 
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <div>
              <span className="sub-title" style={{ display: "inline-block", margin: "0" }}>OPPORTUNITY ANALYSIS</span>
              <h1 style={{ fontSize: "2.25rem", color: "var(--color-blue-deep)", fontWeight: "800", marginTop: "0.25rem", letterSpacing: "-0.02em" }}>
                {business.name}
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {lead.status && (
              <span className={`badge ${
                lead.status === "NEW" ? "bg-slate-100 text-slate-600 border-slate-200" :
                lead.status === "CONTACTED" ? "bg-blue-100 text-blue-700 border-blue-200" :
                lead.status === "INTERESTED" ? "bg-green-100 text-green-700 border-green-200" :
                "bg-slate-100 text-slate-400 border-slate-200"
              }`} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", border: "1px solid" }}>
                STATUS: {lead.status}
              </span>
            )}
          </div>
        </div>

        {/* Details Grid (1/3 for business metrics, 2/3 for AI Analysis) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2rem" }}>
          
          {/* Left Column: Metrics & General Details (4 cols) */}
          <div style={{ gridColumn: "span 4 / span 4" }} className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Score Card */}
            <div className="glass-card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "1rem" }}>
                Opportunity Score
              </span>
              
              <div style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: `6px solid ${isHot ? "#fee2e2" : isWarm ? "#fef3c7" : "#e2e8f0"}`,
                marginBottom: "1.25rem"
              }}>
                <span style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  fontFamily: "monospace",
                  color: isHot ? "#ef4444" : isWarm ? "#d97706" : "var(--color-text-secondary)"
                }}>
                  {score}
                </span>
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <span className={`badge ${priorityBadgeClass}`} style={{ padding: "4px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "700", border: "1px solid" }}>
                  {isHot ? "🔥 HOT Opportunity" : isWarm ? "🟡 WARM Opportunity" : "⚪ COLD Opportunity"}
                </span>
              </div>
            </div>

            {/* Business Profile Details */}
            <div className="glass-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--color-blue-deep)", fontWeight: "700", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem", marginBottom: "1rem", margin: "0" }}>
                Business Profile
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Category</span>
                  <span style={{ fontWeight: "700", color: "var(--color-blue-deep)" }}>
                    {business.categories ? business.categories.join(", ") : "Local Service"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Google Rating</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-blue-deep)", fontWeight: "700" }}>
                      <Star size={14} fill="#eab308" stroke="#eab308" />
                      {business.rating || "N/A"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Reviews count</span>
                    <span style={{ fontWeight: "700", color: "var(--color-blue-deep)" }}>{business.userRatingsTotal || 0} reviews</span>
                  </div>
                </div>

                {business.phoneNumber && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Phone Number</span>
                    <a href={`tel:${business.phoneNumber}`} style={{ color: "var(--color-blue-secondary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={13} /> {business.phoneNumber}
                    </a>
                  </div>
                )}

                {business.formattedAddress && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Address</span>
                    <span style={{ color: "var(--color-text-secondary)", leadingHeight: "1.4", display: "flex", alignItems: "start", gap: "4px" }}>
                      <MapPin size={13} style={{ marginTop: "2px", color: "var(--color-text-muted)", flexShrink: 0 }} />
                      {business.formattedAddress}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Current Website</span>
                  {business.website ? (
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: "var(--color-blue-secondary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", wordBreak: "break-all" }}
                    >
                      <Globe size={13} style={{ flexShrink: 0 }} /> 
                      <span style={{ textDecoration: "underline" }}>{business.website}</span>
                      <ExternalLink size={11} style={{ flexShrink: 0 }} />
                    </a>
                  ) : (
                    <span style={{ color: "#ef4444", fontWeight: "600", fontStyle: "italic", display: "flex", alignItems: "center", gap: "4px" }}>
                      <X size={14} /> No Website Listed
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: AI details & Pitches (8 cols) */}
          <div style={{ gridColumn: "span 8 / span 8" }} className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* AI Decision Panel */}
            <div className="glass-card" style={{ padding: "2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Cpu size={18} style={{ color: "var(--color-blue-secondary)" }} />
                  <h4 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>AI Diagnostic Summary</h4>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span className="sub-title" style={{ fontSize: "10px", margin: "0" }}>Why this business was flagged</span>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.6", backgroundColor: "var(--color-bg-alt)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)", margin: "0" }}>
                    {aiAnalysis?.reason || "Factual evaluation details not logged."}
                  </p>
                </div>

                {aiAnalysis?.painPoints && aiAnalysis.painPoints.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="sub-title" style={{ fontSize: "10px", margin: "0" }}>AI-Identified Pain Points</span>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "0", padding: "0 0 0 1.25rem", fontSize: "0.85rem", color: "var(--color-text-secondary)", listStyleType: "disc" }}>
                      {aiAnalysis.painPoints.map((point, idx) => (
                        <li key={idx} style={{ lineHeight: "1.4" }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: "700", textTransform: "uppercase" }}>Recommended Service</span>
                    <span style={{ fontWeight: "700", color: "var(--color-blue-deep)", fontSize: "0.85rem" }}>
                      {aiAnalysis?.recommendedService || "Custom Website Build"}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: "700", textTransform: "uppercase" }}>Key Sales Angle</span>
                    <span style={{ fontWeight: "700", color: "var(--color-blue-secondary)", fontSize: "0.85rem" }}>
                      {aiAnalysis?.salesAngle || "Focus on digital customer bookings."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Audit Flags */}
            {websiteAudit && websiteAudit.websiteUrl && (
              <div className="glass-card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "0.95rem", color: "var(--color-blue-deep)", fontWeight: "700", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem", marginBottom: "1rem", margin: "0" }}>
                  Technical Audit Metrics
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                  {/* SSL check */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "1rem", backgroundColor: "var(--color-bg-alt)" }}>
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "700" }}>CONNECTION SECURITY</span>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-blue-deep)", marginTop: "2px" }}>
                        {websiteAudit.isHttps ? "Active SSL (HTTPS)" : "Insecure connection"}
                      </div>
                    </div>
                    {websiteAudit.isHttps ? (
                      <ShieldCheck size={18} style={{ color: "#22c55e" }} />
                    ) : (
                      <AlertTriangle size={18} style={{ color: "#ef4444" }} />
                    )}
                  </div>

                  {/* Responsive check */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "1rem", backgroundColor: "var(--color-bg-alt)" }}>
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "700" }}>MOBILE OPTIMIZATION</span>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-blue-deep)", marginTop: "2px" }}>
                        {websiteAudit.isMobileFriendly ? "Mobile Friendly" : "Desktop layout only"}
                      </div>
                    </div>
                    {websiteAudit.isMobileFriendly ? (
                      <Smartphone size={18} style={{ color: "#22c55e" }} />
                    ) : (
                      <AlertTriangle size={18} style={{ color: "#ef4444" }} />
                    )}
                  </div>

                  {/* Speed score check */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "1rem", backgroundColor: "var(--color-bg-alt)" }}>
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "700" }}>PAGE SPEED RATING</span>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-blue-deep)", marginTop: "2px" }}>
                        {websiteAudit.performanceScore}/100 score
                      </div>
                    </div>
                    <span className="badge" style={{
                      backgroundColor: websiteAudit.performanceScore >= 80 ? "#f0fdf4" : websiteAudit.performanceScore >= 50 ? "#fffbeb" : "#fef2f2",
                      color: websiteAudit.performanceScore >= 80 ? "#15803d" : websiteAudit.performanceScore >= 50 ? "#b45309" : "#b91c1c",
                      fontSize: "10px",
                      fontWeight: "700"
                    }}>
                      {websiteAudit.performanceScore >= 80 ? "Fast" : websiteAudit.performanceScore >= 50 ? "Moderate" : "Slow"}
                    </span>
                  </div>
                </div>

                {/* Captured Tag details */}
                <div style={{ padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "#ffffff" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
                      <strong style={{ color: "var(--color-blue-deep)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Page Title:</strong>
                      <span style={{ fontSize: "0.85rem" }}>{websiteAudit.pageTitle || <span style={{ color: "#ef4444", fontStyle: "italic" }}>None</span>}</span>
                    </div>
                    <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
                      <strong style={{ color: "var(--color-blue-deep)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Meta Description:</strong>
                      <span style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{websiteAudit.metaDescription || <span style={{ color: "#ef4444", fontStyle: "italic" }}>None</span>}</span>
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-blue-deep)", display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Captured Contact Information:</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                        {websiteAudit.contactInfoFound?.emails?.map((e, idx) => (
                          <span key={idx} style={{ backgroundColor: "var(--color-blue-light)", color: "var(--color-blue-primary)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", fontFamily: "monospace" }}>{e}</span>
                        ))}
                        {websiteAudit.contactInfoFound?.phones?.map((p, idx) => (
                          <span key={idx} style={{ backgroundColor: "var(--color-blue-light)", color: "var(--color-blue-primary)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", fontFamily: "monospace" }}>{p}</span>
                        ))}
                        {websiteAudit.contactInfoFound?.whatsapp && (
                          <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>WhatsApp Link</span>
                        )}
                        {!websiteAudit.contactInfoFound?.emails?.length && !websiteAudit.contactInfoFound?.phones?.length && !websiteAudit.contactInfoFound?.whatsapp && (
                          <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "0.8rem" }}>No contact handles or email address strings found.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI outreach Pitch */}
            <div className="glass-card" style={{ padding: "2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} style={{ color: "var(--color-blue-secondary)" }} />
                  <h4 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", fontWeight: "700", margin: "0" }}>AI outreach Pitch</h4>
                </div>
                
                <button
                  onClick={handleCopyPitch}
                  className="btn btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {copied ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Pitch
                    </>
                  )}
                </button>
              </div>

              {/* Pitch Email Body */}
              <div style={{
                backgroundColor: "var(--color-bg-alt)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "1.5rem",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                maxHeight: "350px",
                overflowY: "auto"
              }}>
                {aiAnalysis?.personalizedPitch || "AI pitch generation not configured."}
              </div>

              {/* Status Update Actions Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Update Pipeline Status
                </span>
                
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleUpdateStatus("CONTACTED")}
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("INTERESTED")}
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#15803d", borderColor: "#dcfce7", backgroundColor: "#f0fdf4" }}
                  >
                    Mark Interested
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("NOT_INTERESTED")}
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#b91c1c", borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
                  >
                    Not Interested
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline Interactions */}
            <div className="glass-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "0.95rem", color: "var(--color-blue-deep)", fontWeight: "700", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem", marginBottom: "1.5rem", margin: "0" }}>
                Interaction Timeline
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative", paddingLeft: "1.5rem" }}>
                {/* Timeline vertical bar */}
                <div style={{
                  position: "absolute",
                  left: "4px",
                  top: "4px",
                  bottom: "4px",
                  width: "2px",
                  backgroundColor: "var(--color-border)"
                }} />

                {activities?.map((act) => (
                  <div key={act.id} style={{ position: "relative", fontSize: "0.85rem" }}>
                    {/* Bullet marker */}
                    <div style={{
                      position: "absolute",
                      left: "-21px",
                      top: "4px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-blue-secondary)",
                      border: "2px solid #ffffff"
                    }} />
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ fontWeight: "600", color: "var(--color-blue-deep)" }}>{act.details}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Discovery entry */}
                <div style={{ position: "relative", fontSize: "0.85rem" }}>
                  <div style={{
                    position: "absolute",
                    left: "-21px",
                    top: "4px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-text-muted)",
                    border: "2px solid #ffffff"
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>Prospect first discovered by AI Lead Hunter</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                      {new Date(lead.firstDiscoveredAt || new Date()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
