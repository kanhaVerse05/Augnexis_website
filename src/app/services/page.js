import Link from "next/link";
import { Brain, Code2, Globe, Smartphone, Cloud, LineChart, ChevronRight, ArrowRight } from "lucide-react";

export default function Services() {
  const serviceList = [
    {
      icon: <Brain size={20} />,
      title: "AI Solutions",
      image: "/service-ai.jpg",
      features: [
        "Workflow Automation Protocols",
        "Intelligent Support Agents",
        "Predictive Business Analytics",
        "Tailored Machine Learning Models"
      ],
      desc: "We design and deploy custom artificial intelligence systems to automate repetitive operations, optimize day-to-day workflows, and supercharge decision-making processes. From machine learning pipelines to intelligent support assistants, our AI integrations are built to make your business smarter and faster."
    },
    {
      icon: <Code2 size={20} />,
      title: "Custom Software",
      image: "/service-software.jpg",
      features: [
        "SaaS Platform Development",
        "Enterprise ERP/CRM Systems",
        "High-Throughput Secure APIs",
        "Legacy System Modernization"
      ],
      desc: "We build bespoke enterprise software tailored exactly to your unique organizational processes. Instead of forcing your business to adapt to rigid off-the-shelf software packages, we design and code customizable software platforms that mirror your actual workflow criteria and scale seamlessly."
    },
    {
      icon: <Globe size={20} />,
      title: "Website Development",
      image: "/service-web.jpg",
      features: [
        "Responsive UX/UI Designs",
        "Next.js & Vite frameworks",
        "Search Engine Optimization (SEO)",
        "Headless CMS Integrations"
      ],
      desc: "We design and develop fast, responsive, and SEO-friendly websites engineered to establish a strong brand identity and drive business growth. Our web products combine modern design aesthetics with clean engineering architectures to convert visitors into loyal clients."
    },
    {
      icon: <Smartphone size={20} />,
      title: "Mobile Apps",
      image: "/service-mobile.jpg",
      features: [
        "React Native Cross-Platform",
        "Native Android & iOS Engineering",
        "Secure Backend Integrations",
        "Offline Data Sync Support"
      ],
      desc: "We build high-performance mobile apps for iOS and Android platforms utilizing cross-platform and native coding technologies. Our mobile team prioritizes user interface ease-of-use, rapid rendering speeds, and smooth device feature integrations."
    },
    {
      icon: <Cloud size={20} />,
      title: "Cloud Solutions",
      image: "/service-cloud.jpg",
      features: [
        "Secure AWS/Azure Cloud Migration",
        "Docker & Kubernetes Setup",
        "Serverless Computing Architecture",
        "Automated CI/CD DevOps Pipelines"
      ],
      desc: "We build and manage highly secure, scalable, and resilient cloud architectures that safeguard your application databases. Our cloud setups are engineered to adjust automatically to traffic surges, ensuring zero server downtime during peak request hours."
    },
    {
      icon: <LineChart size={20} />,
      title: "Digital Marketing",
      image: "/service-marketing.jpg",
      features: [
        "Google & Social Media Ads",
        "Organic Traffic SEO Audits",
        "Conversion Optimization (CRO)",
        "Content Marketing Campaigns"
      ],
      desc: "We deploy growth-driven SEO, search engine advertising, and content strategies designed to place your business in front of the right audience. We target high-intent search traffic and optimize client conversion rates to deliver measurable ROI."
    }
  ];

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>
      
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="sub-title">OUR EXPERTISE</span>
          <h1 className="page-header-title">Professional Digital Solutions</h1>
          <p className="page-header-desc">
            We provide full-lifecycle software engineering, cloud architecture, and digital growth support designed to solve real business challenges.
          </p>
        </div>
      </div>

      {/* Services Grid Section */}
      <section className="section">
        <div className="container">
          <div className="grid-3">
            {serviceList.map((service, index) => (
              <div key={index} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ color: 'var(--color-blue-secondary)', display: 'flex', alignItems: 'center' }}>
                      {service.icon}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-blue-deep)' }}>
                      {service.title}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    {service.desc}
                  </p>
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-blue-deep)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                      Core Deliverables:
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {service.features.map((feature, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          <ChevronRight size={14} style={{ color: 'var(--color-blue-accent)' }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* Development Process */}
      <section className="section section-bg-alt">
        <div className="container">
          <div className="text-center">
            <span className="sub-title">METHODOLOGY</span>
            <h2 className="section-title">How We Build Systems</h2>
            <p className="section-desc mx-auto">
              Our engineering lifecycle follows four clean milestones to transform concepts into scalable platforms.
            </p>
          </div>
 
          <div className="grid-4">
            <div className="stat-card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-blue-light)' }}>01</div>
              <h3 style={{ color: 'var(--color-blue-deep)', marginBottom: '0.75rem', fontSize: '1.15rem' }}>Research & Plan</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                We analyze workflows, audit database capacities, and plan structural API pathways to prevent architectural blocks.
              </p>
            </div>
            
            <div className="stat-card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-blue-light)' }}>02</div>
              <h3 style={{ color: 'var(--color-blue-deep)', marginBottom: '0.75rem', fontSize: '1.15rem' }}>Design & Wireframe</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                We draw user interfaces, define data schema structures, and layout endpoint request logic diagrams.
              </p>
            </div>
 
            <div className="stat-card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-blue-light)' }}>03</div>
              <h3 style={{ color: 'var(--color-blue-deep)', marginBottom: '0.75rem', fontSize: '1.15rem' }}>Development & QA</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Our senior developers build modular components, configure CI/CD scripts, and conduct unit test suites.
              </p>
            </div>
 
            <div className="stat-card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-blue-light)' }}>04</div>
              <h3 style={{ color: 'var(--color-blue-deep)', marginBottom: '0.75rem', fontSize: '1.15rem' }}>Deploy & Monitor</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                We deploy instances to production, hook up system health triggers, and compile monthly usage reports.
              </p>
            </div>
          </div>
        </div>
      </section>
 
      {/* CTA section */}
      <section className="section text-center">
        <div className="container">
          <h2 className="section-title">Ready to Transform Your Digital Infrastructure?</h2>
          <p className="section-desc mx-auto" style={{ marginBottom: '2.5rem' }}>
            Book an engineering consultation call with our software architects to review your digital challenges and outline solutions.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Schedule Free Consultation <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
