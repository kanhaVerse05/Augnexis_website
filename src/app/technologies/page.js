"use client";

import { useState } from "react";
import { Cpu, Layers, Terminal, Smartphone, Database, Infinity, Brain, ShoppingCart, LineChart, Palette } from "lucide-react";

export default function Technologies() {
  const [activeTab, setActiveTab] = useState("frontend");

  const categories = [
    { id: "frontend", label: "Frontend", icon: <Layers size={18} /> },
    { id: "backend", label: "Backend", icon: <Terminal size={18} /> },
    { id: "mobile", label: "Mobile", icon: <Smartphone size={18} /> },
    { id: "database", label: "Database", icon: <Database size={18} /> },
    { id: "devops", label: "DevOps & Cloud", icon: <Infinity size={18} /> },
    { id: "ai", label: "AI", icon: <Brain size={18} /> },
    { id: "cms", label: "CMS", icon: <ShoppingCart size={18} /> },
    { id: "marketing", label: "Digital Marketing", icon: <LineChart size={18} /> },
    { id: "design", label: "Design", icon: <Palette size={18} /> }
  ];

  const techStack = {
    frontend: [
      { name: "Next.js", desc: "Enterprise React framework with server-side rendering." },
      { name: "React.js", desc: "Declarative component-driven user interface library." },
      { name: "TypeScript", desc: "Static typing extension for scalable Javascript development." },
      { name: "Tailwind CSS", desc: "Utility-first CSS framework for clean, rapid responsive styling." },
      { name: "JavaScript", desc: "Modern ES6+ frontend scripting engine." },
      { name: "HTML5", desc: "Semantic structural markup standard for modern web pages." },
      { name: "CSS3", desc: "Advanced layouts, animations, and custom styling rules." }
    ],
    backend: [
      { name: "Node.js", desc: "Scalable asynchronous event-driven JavaScript server runtime." },
      { name: "Express.js", desc: "Minimalist web framework for building Node APIs." },
      { name: "PHP", desc: "Reliable, widely-supported server-side language for web scripts." },
      { name: "Django", desc: "High-level Python web framework encouraging clean design." },
      { name: "REST APIs", desc: "Standardized protocols for server-to-client communication." }
    ],
    mobile: [
      { name: "React Native", desc: "Cross-platform iOS and Android mobile app engineering." },
      { name: "Android", desc: "Native Google mobile environment development and release." },
      { name: "iOS", desc: "Native Apple Swift/Obj-C mobile environment development." }
    ],
    database: [
      { name: "PostgreSQL", desc: "Enterprise-grade relational database for structured datasets." },
      { name: "MySQL", desc: "High-efficiency, lightweight database for structured tables." }
    ],
    devops: [
      { name: "Docker", desc: "Container virtualization to ensure consistent environment runtimes." },
      { name: "Linux", desc: "Core server OS operating environment for secure hosting." },
      { name: "Git", desc: "Version control tool to track modifications and branches." },
      { name: "GitHub", desc: "Collaborative code repository hosting and CI/CD actions." },
      { name: "Nginx", desc: "High-performance web server, reverse proxy, and load balancer." },
      { name: "VPS Management", desc: "Configuring and maintaining private cloud virtual servers." },
      { name: "Cloudflare", desc: "CDN routing, DNS management, and DDoS security protection." }
    ],
    ai: [
      { name: "OpenAI API", desc: "Accessing GPT intelligence and semantic embedding engines." },
      { name: "AI Chatbots", desc: "Building automated conversational agents for user support." },
      { name: "AI Agents", desc: "Autonomous goal-driven systems executing complex workflows." },
      { name: "AI Automation", desc: "Integrating cognitive models to process unstructured data." },
      { name: "Workflow Automation", desc: "Hooking API events to streamline multi-step processes." }
    ],
    cms: [
      { name: "WordPress", desc: "Most popular customizable Content Management System." },
      { name: "WooCommerce", desc: "WordPress e-commerce engine for shopping portals." }
    ],
    marketing: [
      { name: "Google Ads", desc: "Paid search engine marketing campaign setup and management." },
      { name: "Meta Ads", desc: "Social media marketing on Facebook and Instagram platforms." },
      { name: "SEO", desc: "Organic search ranking optimization and keyword targeting." },
      { name: "Google Analytics 4", desc: "Measuring user engagement, conversions, and site events." },
      { name: "Google Tag Manager", desc: "Injecting conversion scripts without modifying page code." }
    ],
    design: [
      { name: "Figma", desc: "Industry-standard UI/UX vector design and prototyping." },
      { name: "Canva", desc: "Quick corporate visual asset and banner design." },
      { name: "Photoshop", desc: "Raster graphic editing and professional image composition." }
    ]
  };

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            <div>
              <span className="sub-title">OUR TOOLKIT</span>
              <h1 className="page-header-title" style={{ textAlign: 'left', margin: '0 0 1rem 0' }}>Technologies We Harness</h1>
              <p className="page-header-desc" style={{ textAlign: 'left', margin: '0' }}>
                We utilize robust programming languages, frameworks, and cloud infrastructure tools to assemble scalable, modern web assets.
              </p>
            </div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '220px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <img 
                src="https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80" 
                alt="Software Development Code" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tech Tabs Section */}
      <section className="section">
        <div className="container">
          <div className="tech-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`tech-tab-btn ${activeTab === cat.id ? "active" : ""}`}
                onClick={() => setActiveTab(cat.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {cat.icon} {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Grid Layout of Active Tech */}
          <div className="grid-3" style={{ transition: 'all 0.3s ease' }}>
            {techStack[activeTab].map((tech, index) => (
              <div key={index} className="tech-card">
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-blue-light)',
                  color: 'var(--color-blue-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Cpu size={24} />
                </div>
                <h3 className="tech-card-name">{tech.name}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Standards */}
      <section className="section section-bg-alt">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            <div>
              <span className="sub-title">ENGINEERING STANDARDS</span>
              <h2 className="section-title">Clean Code Philosophy</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                Our engineering team adheres to standardized development protocols to write performant, readable, and highly maintainable codebases.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ color: 'var(--color-blue-secondary)', fontWeight: 'bold', fontSize: '1.25rem' }}>01</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-blue-deep)', marginBottom: '0.25rem' }}>Modular Structure</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>We separate code logic into modular components for easier updates and debugging.</p>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ color: 'var(--color-blue-secondary)', fontWeight: 'bold', fontSize: '1.25rem' }}>02</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-blue-deep)', marginBottom: '0.25rem' }}>Strict Type Checks</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>TypeScript prevents mismatched syntax runtime bugs, ensuring stable execution.</p>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ color: 'var(--color-blue-secondary)', fontWeight: 'bold', fontSize: '1.25rem' }}>03</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-blue-deep)', marginBottom: '0.25rem' }}>Unit Test Coverage</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>Critical transaction flows go through automated tests before launch.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '480px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src="/developer-working.jpg" 
                alt="Augnexis Developer Coding" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
