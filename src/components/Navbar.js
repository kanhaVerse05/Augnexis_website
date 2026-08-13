"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isHunterOrAdmin = pathname?.startsWith("/lead-hunter") || pathname?.startsWith("/admin");
  if (isHunterOrAdmin) return null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile nav on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Solutions", path: "/solutions" },
    { name: "Technologies", path: "/technologies" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
      <div className="container nav-container">
        <Link href="/" className="logo-link" style={{ display: "flex", alignItems: "center" }}>
          <img 
            src="/logo-transparent.png" 
            alt="Augnexis Technologies Logo" 
            style={{ height: "60px", width: "auto", display: "block" }} 
          />
        </Link>

        {/* Desktop Menu */}
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <ul className={`nav-menu ${isOpen ? "active" : ""}`}>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
            <li className="nav-btn">
              <Link href="/contact" className="btn btn-primary">
                Get Started
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
}
