import Link from "next/link";
import { HeartPulse, ShoppingBag, Truck, GraduationCap, Building, Plane, Check, ArrowRight } from "lucide-react";

export default function Solutions() {
  const industries = [
    {
      icon: <HeartPulse size={20} />,
      title: "Healthcare Systems",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
      points: [
        "HIPAA data encryption standard compliance",
        "Patient portal interface systems",
        "Medical record integration pipelines",
        "Telemedicine infrastructure"
      ],
      desc: "We engineer protected, zero-downtime databases that store EHR records, manage doctor-patient meetings, and automate clinic billing."
    },
    {
      icon: <ShoppingBag size={20} />,
      title: "Retail & E-commerce",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80",
      points: [
        "Global inventory synchronization",
        "Omnichannel cart APIs",
        "Personalized purchase algorithms",
        "Multi-vendor dashboard systems"
      ],
      desc: "We deploy enterprise commerce apps capable of resolving millions of inventory queries without lag, integrated with Stripe and PayPal."
    },
    {
      icon: <Truck size={20} />,
      title: "Logistics & Fleet",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
      points: [
        "Real-time GPS tracking endpoints",
        "Automated dispatch scripting",
        "Route minimization calculators",
        "Warehouse catalog integrations"
      ],
      desc: "Our systems coordinate fleets, optimize delivery schedules via AI algorithms, and provide tracking widgets for client portals."
    },
    {
      icon: <GraduationCap size={20} />,
      title: "EdTech & E-Learning",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80",
      points: [
        "Interactive virtual classrooms",
        "Student progress dashboard portals",
        "Automated quiz & grading systems",
        "Secure course subscription payments"
      ],
      desc: "We build customized Learning Management Systems (LMS) that enable educational institutions to host classes, track performance, and scale online operations."
    },
    {
      icon: <Building size={20} />,
      title: "Real Estate & PropTech",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
      points: [
        "Advanced map searching filters",
        "Secure buyer-seller chat engines",
        "3D property virtual tour APIs",
        "Automated lease document generation"
      ],
      desc: "We design robust real estate property search tools, CRM suites for brokers, and automated property management software."
    },
    {
      icon: <Plane size={20} />,
      title: "Travel & Hospitality",
      image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80",
      points: [
        "Multi-vendor booking engines",
        "Real-time flight price calendars",
        "Global travel API integrations",
        "Automatic travel itinerary creators"
      ],
      desc: "We develop reservation systems, travel agency management software, and custom route planning apps for global travelers."
    }
  ];

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="sub-title">VERTICAL ALIGNMENT</span>
          <h1 className="page-header-title">Enterprise Industry Solutions</h1>
          <p className="page-header-desc">
            We adapt our engineering skills to solve specific business models, security standards, and workflow structures across various sectors.
          </p>
        </div>
      </div>

      {/* Industry Showcase Grid */}
      <section className="section">
        <div className="container">
          <div className="grid-3">
            {industries.map((ind, index) => (
              <div key={index} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '180px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={ind.image} 
                    alt={ind.title} 
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
                      {ind.icon}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-blue-deep)' }}>
                      {ind.title}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {ind.desc}
                </p>
                <div style={{ marginTop: 'auto', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--color-blue-deep)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: '700' }}>
                    Included Architectures:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ind.points.map((pt, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <Check size={14} style={{ color: 'var(--color-blue-secondary)', flexShrink: '0' }} />
                        {pt}
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

      {/* Feature Section on Custom SaaS Integration */}
      <section className="section section-bg-alt">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="sub-title">SCALABLE DELIVERY</span>
              <h2 className="section-title">Bespoke SaaS Platforms</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Do not settle for generic off-the-shelf software tools that force your team into inefficient work loops. At Augnexis, we engineer custom SaaS dashboards that mirror your exact business hierarchies.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  <Check size={18} style={{ color: 'var(--color-blue-secondary)', marginTop: '0.15rem' }} />
                  <strong>Custom User Roles:</strong> Support complex billing, administrative, manager, and developer permissions.
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  <Check size={18} style={{ color: 'var(--color-blue-secondary)', marginTop: '0.15rem' }} />
                  <strong>Embedded Analytics:</strong> Beautiful SVG graphs summarizing weekly productivity, signups, or sales directly on user feeds.
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  <Check size={18} style={{ color: 'var(--color-blue-secondary)', marginTop: '0.15rem' }} />
                  <strong>Automatic Updates:</strong> Built-in server monitors and automated deployment scripts ensure your SaaS updates without downtime.
                </li>
              </ul>
              <Link href="/contact" className="btn btn-primary">
                Discuss Your SaaS Project <ArrowRight size={18} />
              </Link>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, var(--color-blue-deep) 0%, #07132a 100%)',
              padding: '3.5rem',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-white)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <h3 style={{ color: 'var(--color-white)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Integrated Cloud Core</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                All of our software structures are hooked to modern database APIs, offering zero latency sync capabilities.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ borderLeft: '3px solid var(--color-blue-secondary)', paddingLeft: '0.75rem' }}>
                  <h4 style={{ color: 'var(--color-white)', fontSize: '1.1rem' }}>99.99%</h4>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Guaranteed Uptime</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--color-blue-accent)', paddingLeft: '0.75rem' }}>
                  <h4 style={{ color: 'var(--color-white)', fontSize: '1.1rem' }}>&lt; 150ms</h4>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Average API Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
