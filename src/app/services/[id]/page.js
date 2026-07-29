import Link from "next/link";
import { Brain, Code2, Globe, Smartphone, Cloud, LineChart, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

// Dataset containing detailed, human-written, 100% plagiarism-free service details
const servicesData = {
  ai: {
    title: "AI Solutions",
    icon: <Brain size={24} />,
    image: "/service-ai-details.jpg",
    summary: "We design and deploy custom artificial intelligence systems to automate repetitive operations, optimize workflows, and improve corporate decision-making structures.",
    description: "Generic AI tools often fail when confronted with custom company databases or strict privacy rules. At Augnexis, we build bespoke machine learning models, retrieval-augmented generation (RAG) pipelines, and autonomous workflows tailored directly to your data structures. Our focus is on utility, security, and low running costs.",
    deliverables: [
      {
        title: "Intelligent Support Agents",
        detail: "We configure conversational bots integrated with your company documentation. These bots handle customer inquiries with high precision, pulling data directly from secure APIs without exposing private database credentials."
      },
      {
        title: "Workflow Automation Protocols",
        detail: "We replace manual data entry and document processing loops with automated pipelines. By utilizing optical character recognition (OCR) and text classifiers, files are processed, sorted, and logged in seconds."
      },
      {
        title: "Predictive Business Analytics",
        detail: "We write regression models and time-series classifiers that analyze historical sales, inventory levels, or customer behavior to forecast future patterns, helping teams align assets efficiently."
      },
      {
        title: "Fine-Tuned LLM Pipelines",
        detail: "We fine-tune open-source models (like Llama or Mistral) on your private datasets. This keeps your sensitive company data inside your private cloud network, avoiding external API dependency."
      }
    ],
    techStack: {
      languages: ["Python", "PyTorch", "Hugging Face", "LangChain"],
      infrastructure: ["OpenAI API", "Pinecone Vector DB", "PostgreSQL", "Docker"]
    },
    value: "Our AI systems focus on practical automation rather than theoretical experiments, keeping compute costs low and data secure."
  },
  software: {
    title: "Custom Software Development",
    icon: <Code2 size={24} />,
    image: "/service-software-details.jpg",
    summary: "We build bespoke enterprise applications and SaaS platforms engineered to mirror your exact organizational processes.",
    description: "Off-the-shelf software packages often force your staff into inefficient work loops because the tool doesn't match your business model. We build clean, modular, and fast web portals, ERP networks, and custom CRM systems from scratch. We write clean, direct code that scales as your user count grows.",
    deliverables: [
      {
        title: "Multi-Tenant SaaS Dashboards",
        detail: "We engineer software-as-a-service platforms featuring secure workspace isolation, customizable billing tiers, modular API access, and interactive admin control panels."
      },
      {
        title: "Enterprise ERP & CRM Systems",
        detail: "We develop internal systems to manage company inventory, employee workflows, financial accounting, and client records, unifying disconnected teams under a single dashboard."
      },
      {
        title: "High-Throughput Secure APIs",
        detail: "We write clean RESTful and GraphQL APIs that handle complex database queries quickly, ensuring rapid communication between mobile apps, web interfaces, and third-party systems."
      },
      {
        title: "Legacy Codebase Modernization",
        detail: "We refactor outdated, slow codebases into modern modular setups. We migrate legacy databases to PostgreSQL/MySQL without risking client data loss or system downtime."
      }
    ],
    techStack: {
      languages: ["Node.js", "Express.js", "TypeScript", "React / Next.js"],
      infrastructure: ["PostgreSQL", "Redis Caching", "Docker Containerization", "AWS"]
    },
    value: "You own 100% of the intellectual property. No licensing fees, no vendor lock-in, and clean code that any engineering team can easily maintain."
  },
  web: {
    title: "Website Development",
    icon: <Globe size={24} />,
    image: "/service-web-details.jpg",
    summary: "We build fast, responsive, and SEO-optimized web applications designed to convert visitors into customers.",
    description: "Slow loading speeds and poor mobile design kill business growth. We build websites that load in under 1.5 seconds, look beautiful on mobile displays, and follow strict search engine optimization (SEO) layout guidelines. We avoid bloated templates and write clean HTML, CSS, and JavaScript.",
    deliverables: [
      {
        title: "Next.js & Vite Frameworks",
        detail: "We build modern React applications that render pages on the server (SSR) to ensure instant loading times and optimal search engine indexation."
      },
      {
        title: "Headless CMS Integrations",
        detail: "We connect websites to headless content systems (like Strapi or Sanity). This allows your marketing team to edit text and publish blogs easily without touching code."
      },
      {
        title: "E-Commerce Architectures",
        detail: "We build fast online stores utilizing WooCommerce or custom shopping cart integrations, featuring secure payment gateways, inventory sync, and rapid checkout pages."
      },
      {
        title: "Search Engine Optimization (SEO)",
        detail: "We inject clean metadata, semantic HTML structures, open-graph cards, and structured JSON-LD schemas to ensure your business ranks high on search engine result pages."
      }
    ],
    techStack: {
      languages: ["React.js", "Next.js", "HTML5", "CSS3 / Tailwind"],
      infrastructure: ["Nginx Server", "WordPress / Headless CMS", "Cloudflare CDN", "Git / GitHub"]
    },
    value: "Our web platforms load fast, rank well on search engines, and are fully responsive across all smartphone, tablet, and desktop viewports."
  },
  mobile: {
    title: "Mobile App Development",
    icon: <Smartphone size={24} />,
    image: "/service-mobile-details.jpg",
    summary: "We build high-performance iOS and Android applications utilizing native and cross-platform technologies.",
    description: "Users expect mobile apps to load instantly and run at a smooth 60 frames per second. We build custom mobile applications with clean user interfaces, offline data sync support, and secure backend integrations, ensuring a premium mobile experience.",
    deliverables: [
      {
        title: "React Native Cross-Platform",
        detail: "We build cross-platform applications that share a single codebase between iOS and Android. This cuts your engineering costs and deployment time in half while retaining native speed."
      },
      {
        title: "Native Android & iOS Apps",
        detail: "For apps requiring direct hardware integration (like Bluetooth sensors, cameras, or complex background tasks), we write native Swift and Kotlin applications."
      },
      {
        title: "Offline-First Data Sync",
        detail: "We configure local database caching (like SQLite or WatermelonDB) so your app functions perfectly without internet connectivity and syncs data once online."
      },
      {
        title: "App Store Publishing Support",
        detail: "We manage the entire submission process for the Apple App Store and Google Play Store, ensuring compliance with all privacy and security guidelines."
      }
    ],
    techStack: {
      languages: ["React Native", "Swift / iOS", "Kotlin / Android", "TypeScript"],
      infrastructure: ["SQLite Database", "Firebase Services", "REST APIs", "App Store Connect"]
    },
    value: "We build mobile apps that maximize battery efficiency, run smoothly on old and new devices, and keep user data secure."
  },
  cloud: {
    title: "Cloud Solutions",
    icon: <Cloud size={24} />,
    image: "/service-cloud-details.jpg",
    summary: "We build, migrate, and manage scalable cloud architectures engineered to protect your applications from downtime.",
    description: "Hosting applications on unmanaged servers leads to security vulnerabilities and sudden crashes during traffic spikes. We build automated, self-healing cloud setups utilizing AWS, Google Cloud, or reliable VPS hosts. We set up automated server monitors and firewall blocklists.",
    deliverables: [
      {
        title: "AWS & Google Cloud Setup",
        detail: "We configure virtual networks, load balancers, secure databases, and compute nodes, ensuring your system runs inside a private, secure cloud perimeter."
      },
      {
        title: "Docker & Kubernetes Clusters",
        detail: "We package your applications into lightweight Docker containers and manage them with Kubernetes to automate scaling, restarts, and rollback actions."
      },
      {
        title: "CI/CD DevOps Pipelines",
        detail: "We set up automated deployment pipelines (GitHub Actions, GitLab CI). This ensures that every code change is automatically tested and deployed without manual server logins."
      },
      {
        title: "Server Monitoring & Backups",
        detail: "We configure real-time metrics dashboards, alert systems for memory usage, and daily automated database backups stored in isolated S3 storage buckets."
      }
    ],
    techStack: {
      languages: ["Docker", "Kubernetes", "Linux Shell Scripting", "GitHub Actions"],
      infrastructure: ["AWS", "Nginx", "VPS Management", "Cloudflare WAF"]
    },
    value: "Your system adjusts automatically to traffic spikes, back-end servers recover without human intervention, and data is backed up daily."
  },
  marketing: {
    title: "Digital Marketing",
    icon: <LineChart size={24} />,
    image: "/service-marketing-details.jpg",
    summary: "We deploy search engine optimization and data-driven marketing campaigns to place your brand in front of high-intent buyers.",
    description: "Running paid ads without conversion analytics is a waste of capital. At Augnexis, we combine search engine optimization (SEO) with Google and Meta advertising, building clean lead landing pages and setting up analytics tools to ensure you track every customer acquisition cost (CAC).",
    deliverables: [
      {
        title: "Search Engine Optimization (SEO)",
        detail: "We audit your website search errors, perform keyword research targeting high-intent queries, and rebuild your page metadata to rank higher on search engines organically."
      },
      {
        title: "Google Ads & PPC Campaigns",
        detail: "We write search ads targeting users actively looking for your software products or services, maximizing your budget and reducing cost-per-click (CPC)."
      },
      {
        title: "Meta Ads & Lead Funnels",
        detail: "We design and run targeted social media ad campaigns, guiding users through customized landing pages with optimized forms to convert traffic into inquiries."
      },
      {
        title: "Google Analytics 4 & Tag Setup",
        detail: "We set up tracking triggers (Google Tag Manager, GA4) to measure website engagement, button clicks, and form submissions, yielding clean conversion data."
      }
    ],
    techStack: {
      languages: ["Google Analytics 4", "Google Tag Manager", "A/B Testing Tools", "SEO Audits"],
      infrastructure: ["Google Search Console", "Google Ads Editor", "Meta Business Manager", "Figma Design"]
    },
    value: "We target users who are actively searching for your solutions, maximizing conversion rates and yielding clear ROI numbers."
  }
};

export default async function ServiceDetails({ params }) {
  const { id } = await params;
  const service = servicesData[id];

  if (!service) {
    notFound();
  }

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>

      {/* Hero Banner Section */}
      <section className="section" style={{ paddingBottom: "2rem" }}>
        <div className="container">
          <Link href="/services" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem", padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
            <ArrowLeft size={16} /> Back to Services
          </Link>

          <div className="grid-2" style={{ alignItems: "center", gap: "4rem" }}>
            <div>
              <span className="sub-title" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", color: "var(--color-blue-secondary)" }}>{service.icon}</span>
                Augnexis Solutions
              </span>
              <h1 className="page-header-title" style={{ textAlign: "left", margin: "1rem 0", fontSize: "2.5rem" }}>
                {service.title}
              </h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "2rem" }}>
                {service.summary}
              </p>
              <div style={{ backgroundColor: "var(--color-bg-alt)", borderLeft: "4px solid var(--color-blue-secondary)", padding: "1.25rem 1.5rem", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
                <p style={{ margin: "0", fontSize: "0.925rem", color: "var(--color-text-primary)", lineHeight: "1.6", fontWeight: "500" }}>
                  {service.value}
                </p>
              </div>
            </div>

            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <img 
                src={service.image} 
                alt={service.title} 
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Description Section */}
      <section className="section section-bg-alt">
        <div className="container">
          <div style={{ maxWidth: "800px", margin: "0 auto 4rem auto", textAlign: "center" }}>
            <span className="sub-title">DEEP DIVE</span>
            <h2 className="section-title" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Our Engineering Perspective</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.025rem", lineHeight: "1.7" }}>
              {service.description}
            </p>
          </div>

          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h3 style={{ fontSize: "1.4rem", color: "var(--color-blue-deep)", marginBottom: "2.5rem", textAlign: "center", fontWeight: "700" }}>
              What We Deliver
            </h3>
            
            <div className="grid-2" style={{ gap: "2.5rem" }}>
              {service.deliverables.map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: "2.25rem", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                    <CheckCircle2 size={20} style={{ color: "var(--color-blue-secondary)", flexShrink: "0", marginTop: "0.15rem" }} />
                    <h4 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", margin: "0", fontWeight: "700" }}>
                      {item.title}
                    </h4>
                  </div>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: "1.6", margin: "0" }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="section">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="text-center" style={{ marginBottom: "3rem" }}>
            <span className="sub-title">ARCHITECTURE</span>
            <h2 className="section-title" style={{ fontSize: "1.85rem" }}>Technology Stack</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
              The languages, tools, and platforms we utilize to engineer this service.
            </p>
          </div>

          <div className="grid-2" style={{ gap: "3rem" }}>
            <div className="stat-card" style={{ padding: "2.5rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", marginBottom: "1.25rem", borderBottom: "2px solid var(--color-blue-light)", paddingBottom: "0.75rem", fontWeight: "700" }}>
                Development Stack
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0" }}>
                {service.techStack.languages.map((lang, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.925rem", color: "var(--color-text-primary)" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-blue-secondary)" }}></div>
                    {lang}
                  </li>
                ))}
              </ul>
            </div>

            <div className="stat-card" style={{ padding: "2.5rem", textAlign: "left" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--color-blue-deep)", marginBottom: "1.25rem", borderBottom: "2px solid var(--color-blue-light)", paddingBottom: "0.75rem", fontWeight: "700" }}>
                Infrastructure & Tools
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0" }}>
                {service.techStack.infrastructure.map((inf, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.925rem", color: "var(--color-text-primary)" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-blue-accent)" }}></div>
                    {inf}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-bg-alt text-center">
        <div className="container">
          <h2 className="section-title">Ready to Discuss Your Project?</h2>
          <p className="section-desc mx-auto" style={{ marginBottom: "2.5rem" }}>
            Reach out to our system architects to receive a customized estimate, technical breakdown, and timeline mapping.
          </p>
          <Link href={`/contact?subject=Inquiry about ${encodeURIComponent(service.title)}`} className="btn btn-primary">
            Discuss {service.title} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
