import Link from "next/link";
import { ArrowRight, Brain, Cloud, Shield, Cpu, Activity, Star, MessageSquare, Layers, Headphones, Rocket, Code2, ShieldCheck } from "lucide-react";

export default function Home() {
  const commitments = [
    {
      title: "Business-Focused Approach",
      desc: "We build solutions that solve real business problems and create measurable value.",
      icon: <Rocket size={28} />,
      color: "var(--color-blue-secondary)"
    },
    {
      title: "Modern Technology Stack",
      desc: "We use the latest tools and frameworks to build fast, secure and scalable products.",
      icon: <Code2 size={28} />,
      color: "var(--color-blue-accent)"
    },
    {
      title: "Quality & Security First",
      desc: "Clean code, best practices and strong security for long-term reliability.",
      icon: <ShieldCheck size={28} />,
      color: "var(--color-blue-secondary)"
    },
    {
      title: "Long-Term Partnership",
      desc: "From planning to post-launch, we stay with you for support and continuous improvement.",
      icon: <Headphones size={28} />,
      color: "var(--color-blue-accent)"
    }
  ];

  const highlights = [
    {
      image: "/service-ai.jpg",
      title: "AI Solutions",
      desc: "Use AI to automate repetitive tasks, improve customer support and make everyday work faster and more efficient."
    },
    {
      image: "/service-software.jpg",
      title: "Custom Software",
      desc: "We build software that fits the way your business works instead of forcing your business to fit the software."
    },
    {
      image: "/service-web.jpg",
      title: "Website Development",
      desc: "Fast, modern and SEO-friendly websites designed to create a strong first impression and generate more business online."
    },
    {
      image: "/service-mobile.jpg",
      title: "Mobile Apps",
      desc: "Android and iOS apps built for performance, usability and a smooth experience across every device."
    },
    {
      image: "/service-cloud.jpg",
      title: "Cloud Solutions",
      desc: "Secure cloud infrastructure that keeps your applications reliable, scalable and ready for future growth."
    },
    {
      image: "/service-marketing.jpg",
      title: "Digital Marketing",
      desc: "SEO, paid advertising and content strategies that help your business reach the right audience and grow consistently."
    }
  ];

  const techLogos = [
    { 
      name: "HTML5", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#E34F26" d="M1.5 0h21l-1.91 21.563L12 24l-8.59-2.437L1.5 0zm17.348 5.76H7.134l.192 2.16h11.23l-.382 4.303H7.518l.193 2.16h7.82l-.403 4.53-3.128.847-3.13-.847-.2-2.24H6.512l.39 4.38 5.098 1.413 5.097-1.413.684-7.683H9.428l-.193-2.16h8.868L18.848 5.76z"/></svg> 
    },
    { 
      name: "CSS3", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#1572B6" d="M1.5 0h21l-1.91 21.563L12 24l-8.59-2.437L1.5 0zm17.063 5.76H6.848l.192 2.16h11.23l-.382 4.303H7.232l.193 2.16h7.82l-.403 4.53-3.128.847-3.13-.847-.2-2.24H6.226l.39 4.38 5.098 1.413 5.097-1.413.684-7.683H9.142l-.193-2.16h8.868L18.563 5.76z"/></svg> 
    },
    { 
      name: "JavaScript", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" fill="#F7DF1E" rx="3"/><path d="M19.988 17.618c-.203-.365-.477-.674-.82-.924-.343-.25-.788-.375-1.332-.375-.573 0-1 .139-1.28.416-.28.277-.42.61-.42.997 0 .332.097.601.29.807.194.204.525.378.99.525l.925.32c1.01.341 1.748.747 2.212 1.218.463.471.695 1.109.695 1.912 0 .84-.295 1.522-.885 2.046-.59.523-1.428.785-2.51.785-1.042 0-1.868-.256-2.476-.767-.607-.511-.965-1.208-1.072-2.09h2.511c.064.453.25.932.56 1.218.31.287.765.43 1.356.43.49 0 .866-.11 1.134-.332.267-.221.401-.526.401-.914 0-.378-.119-.664-.358-.857-.24-.194-.7-.387-1.385-.58l-.925-.267c-1.015-.286-1.752-.683-2.211-1.19-.46-.507-.69-1.171-.69-1.993 0-.822.296-1.485.886-1.99.59-.505 1.384-.757 2.381-.757.962 0 1.722.235 2.28.705.558.47.887 1.096.988 1.878h-2.51zm-7.669 3.93v2.102c0 .545-.098.983-.295 1.314-.197.33-.509.584-.937.76a3.844 3.844 0 0 1-1.48.267c-.896 0-1.576-.233-2.04-.7s-.74-1.182-.828-2.148h2.463c.046.435.174.757.382.966.208.209.522.314.943.314.364 0 .647-.091.85-.272.203-.18.304-.476.304-.887V11.23h2.64v10.318z" fill="#000000"/></svg> 
    },
    { 
      name: "Next.js", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#000000" d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm5.13 17.525l-5.3-7.23v7.23H10.1V7.925h1.73l5.3 7.23v-7.23h1.73v9.6h-1.73z"/></svg> 
    },
    { 
      name: "React Native", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="#61DAFB" strokeWidth="2"><ellipse rx="11" ry="4.2" transform="translate(12,12)"/><ellipse rx="11" ry="4.2" transform="translate(12,12) rotate(60)"/><ellipse rx="11" ry="4.2" transform="translate(12,12) rotate(120)"/></g><circle cx="12" cy="12" r="2" fill="#61DAFB"/></svg> 
    },
    { 
      name: "Python", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#3776AB" d="M12.12 1.95c-3.13-.01-5.96.22-6.52.92a2.98 2.98 0 0 0-.58 1.83v2.3h4.63v.78H2.76c-.84 0-1.57.48-1.84 1.25-.46 1.3-.46 3.86 0 5.16.27.77 1 1.25 1.84 1.25h1.94v-2.61c0-1.71 1.39-3.1 3.1-3.1h4.63v-1.94c0-1.71-1.39-3.1-3.1-3.1h-1.16zm5.82 5.82a2.98 2.98 0 0 0-.58 1.83v2.3h4.63v.78h-6.89c-.84 0-1.57.48-1.84 1.25-.46 1.3-.46 3.86 0 5.16.27.77 1 1.25 1.84 1.25h1.94v-2.61c0-1.71 1.39-3.1 3.1-3.1h4.63v-1.94c0-1.71-1.39-3.1-3.1-3.1h-1.16zm-5.82-5.06a.78.78 0 1 1 0 1.56.78.78 0 0 1 0-1.56zm5.82 14.54a.78.78 0 1 1 0 1.56.78.78 0 0 1 0-1.56z"/></svg> 
    },
    { 
      name: "Node.js", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#339933" d="M12 1.6L2.9 6.8v10.4L12 22.4l9.1-5.2V6.8L12 1.6zm6.8 14.2l-6.8 3.9-6.8-3.9V7.9l6.8-3.9 6.8 3.9v7.9zM12 6.8l5.2 3v4.4L12 17.2l-5.2-3v-4.4L12 6.8z"/></svg> 
    },
    { 
      name: "PHP", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="12" rx="11" ry="6" fill="#777BB4"/><text x="12" y="15.5" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">php</text></svg> 
    },
    { 
      name: "Django", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" fill="#092E20" rx="3"/><text x="12" y="16.5" fontFamily="'Times New Roman', serif" fontSize="16" fontWeight="bold" fill="#ffffff" textAnchor="middle">d</text></svg> 
    },
    { 
      name: "SQL", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00758F" strokeWidth="2"><path d="M12 5c5.523 0 10-1.79 10-4S17.523 1 12 1 2 2.79 2 5s4.477 4 10 4zm0 6c5.523 0 10-1.79 10-4M2 11c0 2.21 4.477 4 10 4s10-1.79 10-4M2 17c0 2.21 4.477 4 10 4s10-1.79 10-4"/></svg> 
    },
    { 
      name: "PostgreSQL", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#336791" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/></svg> 
    },
    { 
      name: "MongoDB", 
      icon: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#47A248" d="M12 1.5C11.5 4 9 8.5 9 12c0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.5-2.5-8-3-10.5C18 3.5 12 1.5 12 1.5zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg> 
    }
  ];

  const testimonials = [
    {
      quote: "Augnexis built a fast, SEO-friendly website for Fitlean Fitness. Within weeks of launch, our site ranked on the first page of Google, bringing a massive influx of local members to our gym.",
      author: "Aman Rathore",
      role: "Founder, Fitlean Fitness",
      logo: "/client-fitlean.png"
    },
    {
      quote: "Augnexis completely transformed our online presence for godeliverygroup.com. From ranking us on Google's first page to managing our social media and lead generation pipelines, their tech and marketing strategies boosted our deliveries significantly.",
      author: "Rudraksh Gupta",
      role: "Manager, Kinetical Go delivery Pvt Ltd",
      logo: "/client-godelivery.png"
    },
    {
      quote: "The custom HRMS platform Hbspayroll.com built by Augnexis is outstanding. They delivered a unified ecosystem including a web dashboard, mobile apps, and dedicated Windows and Mac desktop software that simplified our payroll processing.",
      author: "Shilpa Bhardwaj",
      role: "Director, HBS Payroll",
      logo: "/client-hbspayroll.png"
    }
  ];

  return (
    <div className="fade-in-section">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: "680px" }}>
            <div className="hero-content">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                AI & Software Development Company
              </div>
              <h1 className="hero-title">
                Building the <span className="gradient-text">Future</span> of Business.
              </h1>
              <p className="hero-desc">
                We design, develop and deploy secure, scalable and high-performance digital solutions that empower businesses to innovate, automate operations and accelerate growth.
              </p>
              <div className="hero-actions">
                <Link href="/contact" className="btn btn-primary">
                  Explore Solutions <ArrowRight size={18} />
                </Link>
                <Link href="/about" className="btn btn-secondary">
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Ticker Section */}
      <div className="tech-ticker-container">
        <div className="tech-ticker-inner">
          <div className="tech-ticker-track">
            {[...techLogos, ...techLogos].map((tech, index) => (
              <div key={index} className="tech-ticker-item">
                <span className="tech-ticker-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                  {tech.icon}
                </span>
                <span className="tech-ticker-name">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <section className="section section-bg-alt">
        <div className="container">
          <div className="text-center">
            <span className="sub-title">OUR SERVICES</span>
            <h2 className="section-title">Our Expertise</h2>
            <p className="section-desc mx-auto">
              We help businesses build reliable digital products—from websites and mobile apps to custom software and AI solutions. Every project is designed to solve real business problems and support long-term growth.
            </p>
          </div>

          <div className="grid-3">
            {highlights.map((item, index) => (
              <div key={index} className="glass-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ position: "relative", width: "100%", height: "200px", overflow: "hidden" }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform var(--transition-normal)" }} 
                  />
                </div>
                <div style={{ padding: "2rem", display: "flex", flexDirection: "column", flexGrow: "1" }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-blue-deep)' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', flexGrow: "1", marginBottom: "1.5rem" }}>
                    {item.desc}
                  </p>
                  <Link href="/services" style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "0.5rem", 
                    color: "var(--color-blue-secondary)", 
                    fontWeight: "600", 
                    fontSize: "0.9rem",
                    transition: "color var(--transition-fast)" 
                  }} className="card-readmore-link">
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="section" style={{ 
        background: "linear-gradient(180deg, #030712 0%, #0a1424 50%, #030712 100%)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        padding: "6rem 0"
      }}>
        {/* Background Grid Mesh */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundImage: "radial-gradient(rgba(0, 102, 254, 0.15) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: "0.25",
          zIndex: "1"
        }}></div>

        {/* Arch Light Effect */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, var(--color-blue-secondary) 50%, transparent 100%)",
          boxShadow: "0 0 20px var(--color-blue-secondary)",
          zIndex: "2"
        }}></div>

        <div className="container" style={{ position: "relative", zIndex: "2" }}>
          <div className="text-center" style={{ marginBottom: "4rem" }}>
            <span className="sub-title" style={{ 
              display: "inline-block",
              color: "#00e5ff", 
              borderColor: "rgba(0, 229, 255, 0.3)",
              background: "rgba(0, 229, 255, 0.08)",
              textShadow: "0 0 10px rgba(0, 229, 255, 0.3)",
              padding: "0.4rem 1.25rem",
              borderRadius: "9999px",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              fontSize: "0.8rem",
              marginBottom: "1rem"
            }}>
              OUR COMMITMENT
            </span>
            <h2 className="section-title" style={{ fontSize: "2.75rem", fontWeight: "800", marginTop: "0.5rem", color: "#ffffff" }}>
              Why Businesses Choose <span style={{ 
                background: "linear-gradient(90deg, #00e5ff 0%, #61dafb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Augnexis</span>
            </h2>
            <p className="section-desc mx-auto" style={{ color: "#cbd5e1", maxWidth: "600px" }}>
              More than a service provider — we are your technology partner for building reliable, scalable and future-ready digital solutions.
            </p>
          </div>

          <div className="stats-grid">
            {commitments.map((item, index) => (
              <div 
                key={index} 
                className="commitment-card" 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  textAlign: "center", 
                  padding: "3rem 1.75rem", 
                  borderRadius: "16px",
                  background: "rgba(11, 20, 38, 0.45)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0, 102, 254, 0.15)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all var(--transition-normal)"
                }}
              >
                {/* 3D Glowing Icon Container */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "65px",
                  height: "65px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(0, 102, 254, 0.15) 0%, rgba(0, 229, 255, 0.05) 100%)",
                  border: "1px solid rgba(0, 102, 254, 0.3)",
                  color: "#61DAFB",
                  marginBottom: "1.75rem",
                  boxShadow: "0 0 20px rgba(0, 102, 254, 0.2)",
                  position: "relative"
                }}>
                  {item.icon}
                  {/* Bottom neon bar in icon */}
                  <div style={{
                    position: "absolute",
                    bottom: "-2px",
                    width: "40%",
                    height: "3px",
                    borderRadius: "10px",
                    backgroundColor: "#00e5ff",
                    boxShadow: "0 0 10px #00e5ff"
                  }}></div>
                </div>

                <h3 className="text-white" style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "700", 
                  marginBottom: "0.75rem",
                  fontFamily: "var(--font-display)"
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  color: "#94a3b8", 
                  fontSize: "0.9rem", 
                  lineHeight: "1.6",
                  margin: "0"
                }}>
                  {item.desc}
                </p>

                {/* Bottom Neon Accent Bar */}
                <div style={{
                  position: "absolute",
                  bottom: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "35px",
                  height: "3px",
                  borderRadius: "3px 3px 0 0",
                  background: "linear-gradient(90deg, #0066fe 0%, #00e5ff 100%)",
                  boxShadow: "0 -2px 10px rgba(0, 229, 255, 0.5)"
                }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Short About Us Section */}
      <section className="section section-bg-alt" style={{ backgroundColor: "#F7FAFD", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="about-short-grid">
            <div>
              <span className="sub-title" style={{ 
                display: "inline-block",
                color: "var(--color-blue-secondary)", 
                borderColor: "rgba(0, 102, 254, 0.2)",
                background: "rgba(0, 102, 254, 0.05)",
                padding: "0.4rem 1.25rem",
                borderRadius: "9999px",
                border: "1px solid rgba(0, 102, 254, 0.2)",
                fontSize: "0.8rem",
                marginBottom: "1.5rem"
              }}>
                ABOUT US
              </span>
              <h2 className="section-title" style={{ fontSize: "2.75rem", fontWeight: "800", color: "var(--color-blue-deep)", marginBottom: "1.5rem" }}>
                Driving Innovation, Delivering Excellence.
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", lineHeight: "1.7", marginBottom: "2rem" }}>
                We are a team of passionate developers, designers, and tech innovators dedicated to building high-performance digital solutions. Augnexis helps businesses transform ideas into powerful custom software, web applications, mobile apps, and AI-powered systems designed to scale and support long-term growth.
              </p>
              <Link href="/about" className="btn btn-primary">
                Learn More About Us <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
              <div style={{ padding: "2.25rem 2rem", backgroundColor: "var(--color-white)", borderRadius: "16px", border: "1px solid var(--color-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-blue-deep)", marginBottom: "0.75rem", fontWeight: "700" }}>Our Mission</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", margin: "0" }}>
                  To empower businesses with secure, scalable, and high-performance digital products that automate operations, optimize workflows, and accelerate business growth.
                </p>
              </div>
              <div style={{ padding: "2.25rem 2rem", backgroundColor: "var(--color-white)", borderRadius: "16px", border: "1px solid var(--color-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-blue-deep)", marginBottom: "0.75rem", fontWeight: "700" }}>Our Vision</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", margin: "0" }}>
                  To be the leading global technology partner driving digital transformation, setting new standards in software craftsmanship and AI integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Statement Section */}
      <section className="section text-center" style={{ 
        overflow: 'hidden', 
        background: "linear-gradient(180deg, #030712 0%, #0a1424 50%, #030712 100%)",
        color: "#ffffff"
      }}>
        <div className="container" style={{ position: 'relative', zIndex: '2' }}>
          <span className="sub-title" style={{ 
            display: "inline-block",
            color: "#00e5ff", 
            borderColor: "rgba(0, 229, 255, 0.3)",
            background: "rgba(0, 229, 255, 0.08)",
            textShadow: "0 0 10px rgba(0, 229, 255, 0.3)",
            padding: "0.4rem 1.25rem",
            borderRadius: "9999px",
            border: "1px solid rgba(0, 229, 255, 0.3)",
            fontSize: "0.8rem",
            marginBottom: "1.5rem"
          }}>
            READY TO START?
          </span>
          <h2 className="section-title" style={{ color: '#ffffff', fontSize: '3rem', maxWidth: '800px', margin: '0 auto 1.5rem', fontWeight: '800' }}>
            Your Next Digital Product Starts Here.
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
            From strategy and design to development and long-term support, we build reliable digital solutions tailored to your business goals.
          </p>
          <Link href="/contact" className="btn btn-white">
            Contact Us
          </Link>
        </div>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(0, 102, 254, 0.08) 0%, rgba(255,255,255,0) 60%)',
          zIndex: '1',
          pointerEvents: 'none'
        }}></div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="sub-title">TESTIMONIALS</span>
            <h2 className="section-title">Client Success Stories</h2>
            <p className="section-desc mx-auto">
              Read how companies have revolutionized their digital workflows with our custom software integration support.
            </p>
          </div>

          <div className="testimonials-slider">
            {testimonials.map((t, index) => (
              <div key={index} className="testimonial-card">
                <p className="testimonial-quote">
                  "{t.quote}"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", border: "1px solid var(--color-border)" }}>
                    <img 
                      src={t.logo} 
                      alt={t.author} 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                    />
                  </div>
                  <div className="author-info">
                    <h4>{t.author}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
