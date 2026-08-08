import { Award, Compass, Eye, ShieldCheck, Users, User } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Compass size={28} />,
      title: "Visionary Path",
      desc: "We look beyond immediate hurdles to formulate digital architectures that empower business growth over decades."
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Data Safety First",
      desc: "Security is built into our core framework logic, not added as an afterthought. We guard enterprise assets fiercely."
    },
    {
      icon: <Users size={28} />,
      title: "Collective Intelligence",
      desc: "By combining engineering specialists with client insights, we deliver digital solutions that fit perfect business criteria."
    },
    {
      icon: <Award size={28} />,
      title: "Engineering Excellence",
      desc: "We pride ourselves on writing clean, high-performance, and modular codebases that follow modern design paradigms."
    }
  ];

  const directors = [
    { 
      name: "Akash Choudhary", 
      role: "Founder & Director"
    },
    { 
      name: "Abhimanyu Mishra", 
      role: "Co-Founder & Director"
    }
  ];

  const team = [
    { 
      name: "Kahna", 
      role: "Full stack Developer",
      image: "/team-kahna.jpg"
    },
    { 
      name: "Shruti", 
      role: "Software Developer",
      image: "/team-shruti.jpg"
    },
    { 
      name: "Abhi", 
      role: "Operations Manager",
      image: "/team-abhi.jpg"
    }
  ];

  return (
    <div className="fade-in-section">
      <div className="inner-header-spacer"></div>
      
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="sub-title">WHO WE ARE</span>
          <h1 className="page-header-title">About Our Journey</h1>
          <p className="page-header-desc">
            We are a dedicated team of engineers, innovators, and problem solvers working to connect advanced computing systems with global companies.
          </p>
        </div>
      </div>

      {/* Story section */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="sub-title">OUR MISSION</span>
              <h2 className="section-title">Driving Growth Through Innovative Tech</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Augnexis Technologies was founded with a singular directive: to make enterprise systems more intelligent and connected. In an era of rapid technological shifts, we provide the engineering anchor that companies need.
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                We design next-generation APIs, serverless cloud solutions, and artificial intelligence wrappers that scale natively.
              </p>
              <div style={{ backgroundColor: 'var(--color-blue-light)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid var(--color-blue-secondary)' }}>
                <h4 style={{ color: 'var(--color-blue-deep)', marginBottom: '0.25rem', fontWeight: '700' }}>Our Vision:</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  To become the global blueprint for premium digital systems engineering, recognized for security, clean architecture, and product innovation.
                </p>
              </div>
            </div>
            
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '380px', border: '1px solid var(--color-border)' }}>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                alt="Augnexis Collaboration Workspace" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                <h3 style={{ color: 'var(--color-blue-deep)', marginBottom: '0.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={18} style={{ color: 'var(--color-blue-secondary)' }} /> Our Slogan
                </h3>
                <p style={{ color: 'var(--color-blue-primary)', fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>
                  "Connecting Intelligence. Delivering Innovation."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="section section-bg-alt">
        <div className="container">
          <div className="text-center">
            <span className="sub-title">GUIDING PILLARS</span>
            <h2 className="section-title">Our Corporate Values</h2>
            <p className="section-desc mx-auto">
              Our culture is governed by standard codes of conduct that define how we build solutions and collaborate with corporate partners.
            </p>
          </div>

          <div className="grid-2">
            {values.map((val, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', gap: '1.5rem', padding: '2rem' }}>
                <div className="card-icon-container" style={{ margin: '0', flexShrink: '0' }}>
                  {val.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-blue-deep)' }}>
                    {val.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership section */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="sub-title">LEADERSHIP TEAM</span>
            <h2 className="section-title">The Brains Behind Augnexis</h2>
            <p className="section-desc mx-auto">
              Meet our leadership team directing engineering and strategic pathways at Augnexis Technologies.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap", marginTop: "2rem", marginBottom: "4rem" }}>
            {directors.map((member, index) => (
              <div key={index} className="stat-card" style={{ 
                padding: '2.5rem 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                minWidth: '280px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-blue-light)',
                  color: 'var(--color-blue-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 4px 10px rgba(0, 102, 254, 0.05)'
                }}>
                  <User size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-blue-deep)', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {member.name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center', margin: '0' }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>

          {/* Execution Team */}
          <div className="text-center" style={{ marginTop: "2rem" }}>
            <span className="sub-title">EXECUTION TEAM</span>
            <h2 className="section-title" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Our Engineering & Operations</h2>
            <p className="section-desc mx-auto" style={{ fontSize: "0.95rem" }}>
              The core development and execution experts driving client success and building robust software daily.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginTop: "2rem" }}>
            {team.map((member, index) => (
              <div key={index} className="stat-card" style={{ 
                padding: '2.5rem 2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                minWidth: '260px',
                flex: '1 1 260px',
                maxWidth: '300px'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '3px solid var(--color-blue-secondary)',
                  boxShadow: '0 8px 20px rgba(0, 102, 254, 0.15)',
                  position: 'relative'
                }}>
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-blue-deep)', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {member.name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center', margin: '0' }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
